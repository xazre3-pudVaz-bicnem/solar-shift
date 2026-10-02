import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { blogCategories, getCategory } from "@/data/blog-categories";

/**
 * ブログ記事は content/blog/*.md。frontmatter の形式は scripts/generate-blog-post.ts と共通。
 *
 * ---
 * title: 記事タイトル
 * slug: url-slug
 * description: 120文字程度
 * category: katsushika-subsidy   # data/blog-categories.ts の slug
 * tags: [葛飾区, 補助金]
 * intent: 葛飾区 太陽光 補助金 いくら   # 狙う検索意図（重複防止の基準）
 * publishedAt: 2026-10-01
 * updatedAt: 2026-10-01
 * sources:
 *   - name: 出典名
 *     url: https://...
 * faq:
 *   - q: 質問
 *     a: 回答
 * draft: false
 * generated: false   # 自動生成記事なら true
 * ---
 */

export interface BlogSource {
  name: string;
  url: string;
}

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  tags: string[];
  intent: string;
  publishedAt: string;
  updatedAt: string;
  sources: BlogSource[];
  faq: BlogFaq[];
  draft: boolean;
  generated: boolean;
  body: string;
  /** 本文の文字数（空白除く） */
  length: number;
  readingMinutes: number;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function toStr(v: unknown, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function toStrArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : [];
}

function parsePost(file: string): BlogPost | null {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = toStr(data.slug) || file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const category = toStr(data.category);
  const cat = getCategory(category);
  if (!slug || !data.title || !cat) return null;

  const body = content.trim();
  const length = body.replace(/\s/g, "").length;
  const sources = Array.isArray(data.sources)
    ? data.sources
        .filter((s: unknown) => s && typeof s === "object" && "name" in s && "url" in s)
        .map((s: { name: string; url: string }) => ({ name: String(s.name), url: String(s.url) }))
    : [];
  const faq = Array.isArray(data.faq)
    ? data.faq
        .filter((f: unknown) => f && typeof f === "object" && "q" in f && "a" in f)
        .map((f: { q: string; a: string }) => ({ q: String(f.q), a: String(f.a) }))
    : [];

  const publishedAt = toStr(data.publishedAt);
  return {
    slug,
    title: toStr(data.title),
    description: toStr(data.description),
    category,
    categoryName: cat.name,
    tags: toStrArray(data.tags),
    intent: toStr(data.intent),
    publishedAt,
    updatedAt: toStr(data.updatedAt, publishedAt),
    sources,
    faq,
    draft: Boolean(data.draft),
    generated: Boolean(data.generated),
    body,
    length,
    readingMinutes: Math.max(1, Math.round(length / 500)),
  };
}

let cache: BlogPost[] | null = null;

/** 公開記事を新しい順で返す（draft は除外） */
export function getAllPosts(): BlogPost[] {
  if (cache) return cache;
  if (!fs.existsSync(BLOG_DIR)) return (cache = []);
  const posts = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parsePost)
    .filter((p): p is BlogPost => Boolean(p) && !p!.draft)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : a.slug.localeCompare(b.slug)));
  // slug の重複は先勝ち
  const seen = new Set<string>();
  cache = posts.filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)));
  return cache;
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getLatestPosts(n = 3): BlogPost[] {
  return getAllPosts().slice(0, n);
}

/** 記事が1本以上あるカテゴリだけ */
export function categoriesWithPosts() {
  const posts = getAllPosts();
  return blogCategories
    .map((c) => ({ ...c, count: posts.filter((p) => p.category === c.slug).length }))
    .filter((c) => c.count > 0);
}

/**
 * 関連記事の自動抽出。
 * 同カテゴリ +3、タグ一致 +2/個、タイトルのバイグラム類似 +（0〜3）で採点し上位を返す。
 */
export function getRelatedPosts(post: BlogPost, n = 3): BlogPost[] {
  const grams = (s: string) => {
    const t = s.replace(/[\s　「」『』（）()・、。！？!?｜|]/g, "");
    const out = new Set<string>();
    for (let i = 0; i < t.length - 1; i += 1) out.add(t.slice(i, i + 2));
    return out;
  };
  const base = grams(post.title);
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 3;
      score += p.tags.filter((t) => post.tags.includes(t)).length * 2;
      const g = grams(p.title);
      let hit = 0;
      for (const x of g) if (base.has(x)) hit += 1;
      score += (hit / Math.max(1, Math.min(g.size, base.size))) * 3;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.p);
}

/**
 * 固定ページから「このテーマの記事」を出すとき用。
 *
 * 以前は、指定したカテゴリを混ぜて新しい順に n 本取っていた。そのため、記事の多いカテゴリ（葛飾区の補助金）で
 * 枠が埋まり、/v2h に V2H の記事が出ない、/guide/blackout に水害の記事が出ない、ということが起きていた。
 * どの固定ページからもリンクされない記事ができ、検索エンジンにも読者にも見つけにくくなる。
 *
 * 選ぶ順番
 *   1. prefer … ページ側が名指しした記事（slug）
 *   2. そのページを「親」にしているカテゴリ（data/blog-categories.ts の pillarLinks に path がある）
 *   3. 指定したカテゴリ（書いた順）
 * 2 と 3 は、カテゴリごとに新しい順で1本ずつ回して取る（1つのカテゴリで枠を埋めない）。
 */
export function getPostsForPillar(categories: string[], n = 3, opts: { path?: string; prefer?: string[] } = {}): BlogPost[] {
  const all = getAllPosts();
  const out: BlogPost[] = [];
  const push = (p?: BlogPost) => {
    if (p && out.length < n && !out.some((x) => x.slug === p.slug)) out.push(p);
  };
  for (const slug of opts.prefer ?? []) push(all.find((p) => p.slug === slug));
  const own = opts.path ? blogCategories.filter((c) => c.pillarLinks.includes(opts.path as string)).map((c) => c.slug) : [];
  const order = [...new Set([...own, ...categories])];
  const buckets = order.map((c) => all.filter((p) => p.category === c));
  for (let round = 0; out.length < n && buckets.some((b) => b.length > round); round += 1) {
    for (const b of buckets) push(b[round]);
  }
  return out;
}

/** 一覧1ページあたりの記事数（毎日1本増えるので、一覧は必ずページを分ける） */
export const POSTS_PER_PAGE = 12;

/**
 * カテゴリページを検索結果に出す最小の記事数。
 * 記事が1〜2本しかないカテゴリページは内容が薄いので、3本たまるまで noindex・sitemap 対象外にする。
 */
export const MIN_POSTS_TO_INDEX_CATEGORY = 3;

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
}

/** page は 1 始まり */
export function pageSlice<T>(items: T[], page: number): T[] {
  return items.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
}

export function isCategoryIndexable(slug: string): boolean {
  return getPostsByCategory(slug).length >= MIN_POSTS_TO_INDEX_CATEGORY;
}

/** 一覧での前後の記事（newer = 1つ新しい記事、older = 1つ古い記事） */
export function getAdjacentPosts(slug: string): { newer?: BlogPost; older?: BlogPost } {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { newer: posts[i - 1], older: posts[i + 1] };
}

/** その一覧でいちばん新しい更新日（sitemap の lastModified 用） */
export function latestUpdate(posts: BlogPost[]): string | undefined {
  return posts.reduce<string | undefined>((max, p) => (!max || p.updatedAt > max ? p.updatedAt : max), undefined);
}
