#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜公開済みのブログ記事を、自動生成記事と同じ品質ゲートにかける（API は呼ばない）。
 *
 *   npm run blog:audit              … 全記事を点検し、問題を一覧にする（問題があれば終了コード 1）
 *   npm run blog:audit -- <slug>    … 1記事だけ詳しく見る
 *   npm run blog:audit -- --claims  … 記事ごとの「主張と出典」の件数も出す
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

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const args = process.argv.slice(2);
const showClaims = args.includes("--claims");
const only = args.find((a) => !a.startsWith("--"));

interface Loaded extends ExistingPost {
  file: string;
  category: string;
  draft: boolean;
  article: GeneratedArticle;
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
      return { file, slug, title: article.title, intent: String(data.intent ?? ""), body: article.body, category: String(data.category ?? ""), draft: Boolean(data.draft), article };
    });
}

const posts = load();
const facts = loadFacts();
const factIndex = buildFactIndex(facts);
const sourceUrls = allowedSourceUrls(facts);
const reservedIntents = guides.map((g) => g.intent);

let failed = 0;
let totalClaims = 0;
for (const p of posts) {
  if (only && p.slug !== only) continue;
  const others = posts.filter((x) => x.slug !== p.slug);
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
  });
  totalClaims += claims.length;
  const mark = errors.length === 0 ? "OK " : "NG ";
  console.log(`${mark} ${p.slug}${p.draft ? "（下書き）" : ""}  ${countChars(p.body)}字${showClaims ? `  主張 ${claims.length} 件` : ""}  ｜ ${formatQuality(scores)}${qualityErrors(scores).length > 0 ? "（いまの公開基準には届かない）" : ""}`);
  for (const e of errors) console.log(`      - ${e}`);
  if (only && showClaims) for (const c of claims) console.log(`      * [${c.sourceType}] ${c.claim.slice(0, 70)} ← ${c.source}`);
  if (errors.length > 0) failed += 1;
}

console.log(`\n記事 ${only ? 1 : posts.length} 本 ／ 問題あり ${failed} 本 ／ 確認できた主張 ${totalClaims} 件`);
console.log(`事実シート: 出典 ${factIndex.sources.size} 件・確認済みの数値 ${factIndex.tokens.size} 種類`);
process.exit(failed > 0 ? 1 : 0);
