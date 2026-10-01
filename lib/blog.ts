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

/** 固定ページから「このテーマの記事」を出すとき用：カテゴリ指定で最新 n 本 */
export function getPostsForPillar(categories: string[], n = 3): BlogPost[] {
  return getAllPosts()
    .filter((p) => categories.includes(p.category))
    .slice(0, n);
}
