#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜公開済みのブログ記事を、自動生成記事と同じ品質ゲートにかける（API は呼ばない）。
 *
 *   npm run blog:audit              … 全記事を点検し、問題を一覧にする（問題があれば終了コード 1）
 *   npm run blog:audit -- <slug>    … 1記事だけ詳しく見る
 *   npm run blog:audit -- --claims  … 記事ごとの「主張と出典」の件数も出す
 *   npm run blog:audit -- --prune   … 記事の手入れの判定（KEEP／UPDATE／MERGE）も出す。記事は消さない・止めない（判定を出すだけ）
 *   npm run blog:audit -- --prune --out docs/blog-pruning.md … 判定を Markdown にも書き出す
 *
 * 点検すること（lib/blog-generator/validate.ts と同じ）
 *   - 数値が事実シート（docs/VERIFIED_FACTS.md）の「出典つきの節」に書かれているか
 *   - その出典が、記事の sources に入っているか
 *   - 固定ページとカニバリしていないか（lib/seo-map.ts）
 *   - 既存記事どうしで、タイトル・検索意図・本文・見出しの構成が重なっていないか
 *   - 薄い記事・禁止表現・根拠のない一般論・架空の経験／事例／費用
 *
 * 事実シートや SEO マップを直したら、これを回して既存記事に影響が無いかを確かめる。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { validate, countChars, type ExistingPost, type GeneratedArticle } from "../lib/blog-generator/validate";
import { buildFactIndex } from "../lib/blog-generator/claims";
import { loadFacts, allowedSourceUrls } from "../lib/blog-generator/facts";
import { allowedInternalPaths } from "../lib/blog-generator/generate";
import { guides } from "../data/guides";
import { blogCategories } from "../data/blog-categories";
import { formatQuality, qualityErrors } from "../lib/blog-generator/score";
import { similarity, shingleOverlap } from "../lib/blog-generator/validate";
import { todayJst } from "../lib/freshness";
import { readSearchConsoleDir } from "./seo-opportunities";
import { subsidyPrograms } from "../data/subsidies";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const args = process.argv.slice(2);
const showClaims = args.includes("--claims");
const prune = args.includes("--prune");
const outIndex = args.indexOf("--out");
const OUT = outIndex >= 0 ? args[outIndex + 1] : undefined;
const only = args.find((a, i) => !a.startsWith("--") && i !== outIndex + 1);

interface Loaded extends ExistingPost {
  file: string;
  category: string;
  draft: boolean;
  article: GeneratedArticle;
  /** 内容を直した日（無ければ公開日） */
  updatedAt: string;
}

function load(): Loaded[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      const slug = String(data.slug ?? file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""));
      const article: GeneratedArticle = {
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        faq: Array.isArray(data.faq) ? data.faq.map((f: { q: string; a: string }) => ({ q: String(f.q), a: String(f.a) })) : [],
        sources: Array.isArray(data.sources) ? data.sources.map((s: { name: string; url: string }) => ({ name: String(s.name), url: String(s.url) })) : [],
        body: content.trim(),
      };
      return { file, slug, title: article.title, intent: String(data.intent ?? ""), body: article.body, category: String(data.category ?? ""), draft: Boolean(data.draft), article, updatedAt: String(data.updatedAt ?? data.publishedAt ?? "") };
    });
}

const posts = load();
const facts = loadFacts();
const factIndex = buildFactIndex(facts);
const sourceUrls = allowedSourceUrls(facts);
const reservedIntents = guides.map((g) => g.intent);

let failed = 0;
let totalClaims = 0;
const gateMiss = new Set<string>();
for (const p of posts) {
  if (only && p.slug !== only) continue;
  const others = posts.filter((x) => x.slug !== p.slug);
  // 情報の上乗せは、この記事より先に公開した記事と比べる（ファイル名の日付順）
  const earlier = posts.filter((x) => x.file < p.file);
  const pillars = blogCategories.find((c) => c.slug === p.category)?.pillarLinks ?? [];
  const { errors, claims, scores } = validate(p.article, {
    intent: p.intent,
    existing: others,
    reservedIntents,
    allowedPaths: allowedInternalPaths(posts),
    allowedSourceUrls: sourceUrls,
    factIndex,
    // 記事は、そのカテゴリの親ページ（固定ページ）のどれかへリンクしていること（生成時の検査と同じ規則）
    pillarLinks: pillars,
    audit: true,
    earlier,
  });
  totalClaims += claims.length;
  const mark = errors.length === 0 ? "OK " : "NG ";
  console.log(`${mark} ${p.slug}${p.draft ? "（下書き）" : ""}  ${countChars(p.body)}字${showClaims ? `  主張 ${claims.length} 件` : ""}  ｜ ${formatQuality(scores)}${qualityErrors(scores).length > 0 ? "（いまの公開基準には届かない）" : ""}`);
  for (const e of errors) console.log(`      - ${e}`);
  if (only && showClaims) for (const c of claims) console.log(`      * [${c.sourceType}] ${c.claim.slice(0, 70)} ← ${c.source}`);
  if (errors.length > 0) failed += 1;
  if (errors.length > 0 || qualityErrors(scores).length > 0) gateMiss.add(p.slug);
}

console.log(`\n記事 ${only ? 1 : posts.length} 本 ／ 問題あり ${failed} 本 ／ 確認できた主張 ${totalClaims} 件`);

// ─────────────────────────────────────────────────────────────── 記事の手入れ（--prune）
// 機械が出すのは KEEP（そのまま）・UPDATE（直す）・MERGE（ほかの記事と統合を検討）だけ。
// REDIRECT（統合したあとで古いほうを 301）と NOINDEX は、人が中身を読んでから決める。自動で消す・止めることはしない
if (prune && !only) {
  const today = todayJst();
  const fy = Number(today.slice(5, 7)) >= 4 ? Number(today.slice(0, 4)) : Number(today.slice(0, 4)) - 1;
  const days = (from: string) => (from ? Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) : 0);
  // Search Console のページごとの表示回数（CSV があるときだけ。data/seo/search-console/README.md）
  const { rows } = readSearchConsoleDir();
  const pageImpressions = new Map<string, number>();
  for (const r of rows) if (r.page && (!r.query || !rows.some((x) => x.page && !x.query))) pageImpressions.set(r.page, (pageImpressions.get(r.page) ?? 0) + r.impressions);
  const hasGsc = pageImpressions.size > 0;
  const lines: string[] = [];
  const counts = { KEEP: 0, UPDATE: 0, MERGE: 0 };
  for (const p of posts) {
    if (p.draft) continue;
    const reasons: string[] = [];
    let label: keyof typeof counts = "KEEP";
    const twin = posts.find(
      (x) => x.slug !== p.slug && !x.draft && (similarity(p.title, x.title) > 0.55 || (p.intent && x.intent && similarity(p.intent, x.intent) > 0.7) || shingleOverlap(p.body, x.body) >= 0.2),
    );
    if (twin) {
      label = "MERGE";
      reasons.push(`「${twin.title}」と題名・検索意図・本文が近い`);
    }
    if (gateMiss.has(p.slug)) reasons.push("いまの公開基準（品質ゲート）に届かない");
    for (const m of p.title.matchAll(/令和\s*(\d+)\s*年度|(20\d\d)\s*年度/g)) {
      const y = m[1] ? 2018 + Number(m[1]) : Number(m[2]);
      if (y < fy) reasons.push(`題名の年度（${m[0]}）が今の年度より前`);
    }
    // 記事が触れている制度の掲載期限（data/subsidies の validUntil）が過ぎていたら、制度の今を確かめて直す
    for (const prog of subsidyPrograms) {
      const alias = prog.programName.split("（")[0];
      const until = prog.menus.map((m) => m.validUntil).sort().at(-1) ?? "";
      if (until && today > until && p.body.includes(alias)) reasons.push(`「${alias}」の掲載期限（${until}）を過ぎた。制度の今を確かめて直す`);
    }
    const age = days(p.updatedAt);
    if (age >= 180) reasons.push(`内容を直してから ${age} 日（事実を確かめ直す）`);
    const imp = pageImpressions.get(`/blog/${p.slug}`) ?? 0;
    if (hasGsc && age >= 90 && imp === 0) reasons.push("公開から90日以上たっても、Search Console の表示が無い（題名・検索意図を見直す）");
    if (label === "KEEP" && reasons.length > 0) label = "UPDATE";
    counts[label] += 1;
    const todo = label === "MERGE" ? `中身を読み比べ、残すほうへ統合する（統合したら、消すほうを残すほうへ 301＝REDIRECT）` : label === "UPDATE" ? "同じ URL のまま直す。内容を変えたら updatedAt を進める" : "そのまま";
    lines.push(`| ${p.slug} | ${label} | ${reasons.join("／") || "-"} | ${hasGsc ? imp : "-"} | ${todo} |`);
  }
  const md = [
    `判定日 ${today}。記事 ${counts.KEEP + counts.UPDATE + counts.MERGE} 本：KEEP ${counts.KEEP}・UPDATE ${counts.UPDATE}・MERGE ${counts.MERGE}。${hasGsc ? "" : "Search Console の CSV が無いため、表示回数は見ていない。"}`,
    "REDIRECT（統合したあとで、消すほうを 301）と NOINDEX は、人が中身を読んでから決める。自動で消す・止めることはしない。",
    "",
    "| 記事 | 判定 | 理由 | 表示回数 | すること |",
    "|---|---|---|---:|---|",
    ...lines,
  ].join("\n");
  console.log(`\n## 記事の手入れ\n\n${md}`);
  if (OUT) {
    fs.writeFileSync(path.join(process.cwd(), OUT), `# ブログ記事の手入れ（npm run blog:audit -- --prune）\n\n${md}\n`);
    console.log(`\n書き出し: ${OUT}`);
  }
}
console.log(`事実シート: 出典 ${factIndex.sources.size} 件・確認済みの数値 ${factIndex.tokens.size} 種類`);
process.exit(failed > 0 ? 1 : 0);
