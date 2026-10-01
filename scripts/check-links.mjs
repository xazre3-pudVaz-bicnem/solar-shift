#!/usr/bin/env node
/**
 * 内部リンクの存在チェック。
 *   node scripts/check-links.mjs
 *
 * app/ components/ data/ lib/ content/ の中の href="/..." と ](/...) を集め、
 * 実在する route（lib/routes.ts の固定ページ・ガイド・エリア・ブログ記事・カテゴリ・商品・事例）と突き合わせる。
 * ビルド後に .next を見るのではなくソースを見るので、CI でも速く回せる。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(p, exts, out);
    } else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

/** TS ファイルから配列の path/slug を雑に拾う（ビルドせずに済ませるため） */
function extract(re, text) {
  return [...text.matchAll(re)].map((m) => m[1]);
}

const routes = new Set();
// 固定ページ
for (const p of extract(/path:\s*"(\/[^"]*)"/g, read(path.join(ROOT, "lib", "routes.ts")))) routes.add(p);
// ガイド
for (const p of extract(/path:\s*"(\/guide\/[^"]*)"/g, read(path.join(ROOT, "data", "guides.ts")))) routes.add(p);
// エリア（page を持つもの）
{
  const src = read(path.join(ROOT, "data", "areas.ts"));
  for (const block of src.split(/\n\s*\{\s*\n\s*slug:/).slice(1)) {
    const slug = /^\s*"([^"]+)"/.exec(block)?.[1];
    if (slug && /page:\s*\{/.test(block)) routes.add(`/area/${slug}`);
  }
}
// ブログ記事・カテゴリ
const categories = new Set();
for (const f of walk(path.join(ROOT, "content", "blog"), [".md"])) {
  const raw = read(f);
  const slug = /^slug:\s*"?([^"\n]+)"?/m.exec(raw)?.[1]?.trim();
  const cat = /^category:\s*"?([^"\n]+)"?/m.exec(raw)?.[1]?.trim();
  if (slug) routes.add(`/blog/${slug}`);
  if (cat) categories.add(cat);
}
for (const c of categories) routes.add(`/blog/category/${c}`);
// 商品・事例（published のみ）
{
  const src = read(path.join(ROOT, "data", "products.ts"));
  for (const m of src.matchAll(/slug:\s*"([^"]+)",\s*\n\s*status:\s*"published"/g)) routes.add(`/products/${m[1]}`);
}
{
  const src = read(path.join(ROOT, "data", "works.ts"));
  for (const m of src.matchAll(/slug:\s*"([^"]+)",\s*\n\s*published:\s*true/g)) routes.add(`/works/${m[1]}`);
}
routes.add("/feed.xml");
routes.add("/sitemap.xml");
routes.add("/robots.txt");

// リンク収集
const files = [
  ...walk(path.join(ROOT, "app"), [".tsx", ".ts"]),
  ...walk(path.join(ROOT, "components"), [".tsx", ".ts"]),
  ...walk(path.join(ROOT, "data"), [".ts"]),
  ...walk(path.join(ROOT, "lib"), [".ts"]),
  ...walk(path.join(ROOT, "content"), [".md"]),
];

const problems = [];
let total = 0;
for (const f of files) {
  const text = read(f);
  const found = new Set();
  for (const m of text.matchAll(/href=\{?"(\/[^"#?]*)/g)) found.add(m[1]);
  for (const m of text.matchAll(/href:\s*"(\/[^"#?]*)"/g)) found.add(m[1]);
  for (const m of text.matchAll(/\]\((\/[^)\s#?]*)/g)) found.add(m[1]);
  for (const m of text.matchAll(/pillarLinks:\s*\[([^\]]*)\]/g)) for (const x of m[1].matchAll(/"(\/[^"]*)"/g)) found.add(x[1]);
  for (const m of text.matchAll(/links:\s*\[([^\]]*)\]/g)) for (const x of m[1].matchAll(/"(\/[^"]*)"/g)) found.add(x[1]);
  for (const m of text.matchAll(/related:\s*\[([^\]]*)\]/g)) for (const x of m[1].matchAll(/"(\/[^"]*)"/g)) found.add(x[1]);
  for (let href of found) {
    if (href.length > 1) href = href.replace(/\/$/, "");
    // 動的に組み立てるもの（テンプレート文字列）や、プロンプト内の説明用パス（/パス など非ASCII）は対象外
    if (href.includes("${") || /[^\x20-\x7e]/.test(href)) continue;
    total += 1;
    if (!routes.has(href)) problems.push(`${path.relative(ROOT, f)}: ${href}`);
  }
}

console.log(`routes: ${routes.size} / links checked: ${total}`);
if (problems.length) {
  console.log("\n存在しないリンク:");
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("内部リンクに問題はありません。");
