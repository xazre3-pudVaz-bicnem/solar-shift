#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜固定ページの文章を、検証済み事実シートと突き合わせる点検（API は呼ばない）。
 *
 *   npm run build && npm run facts:audit            … 全ページ
 *   npm run facts:audit -- /guide/blackout          … 1ページだけ
 *
 * ビルド後の HTML から本文を取り出し、次のものを一覧にする。
 *   - 事実シート（docs/VERIFIED_FACTS.md）の「出典つきの節」に無い数値・日付
 *   - 検証済み一覧に無い金額
 *   - 出典元を示さない一般化（「一般的に」「多くの場合」）・伝聞（「〜と言われています」）
 *
 * ブログ記事は npm run blog:audit が同じ基準で点検するので、ここでは見ない。
 * これは「落とす」検査ではなく、人が見直すための一覧（終了コードは常に 0）。
 * 載っているものが、すべて誤りというわけではない（例：会社の設立日、手順の数え上げ、様式番号）。
 * 数値を足したときに、根拠を事実シートへ書き忘れていないかを確かめるために使う。
 */
import fs from "node:fs";
import path from "node:path";
import { buildFactIndex, extractNumTokens, isNeutralQuantity } from "../lib/blog-generator/claims";
import { loadFacts, allowedYenAmounts } from "../lib/blog-generator/facts";
import { extractYenAmounts, GENERALIZATION as GENERALIZATION_RE, HEARSAY as HEARSAY_RE, ATTRIBUTION } from "../lib/blog-generator/validate";

const APP = path.join(process.cwd(), ".next", "server", "app");
const only = process.argv.slice(2).find((a) => a.startsWith("/"));
if (!fs.existsSync(APP)) {
  console.error("ビルド結果がありません。先に npm run build を実行してください。");
  process.exit(1);
}

const index = buildFactIndex(loadFacts());
const yenOk = allowedYenAmounts();
// 運営者から受け取った内容（出典 URL の無い節）にある金額。施工事例の電気代など。固定ページでは既知として扱う
// （記事の根拠には使えない。記事の検査は lib/blog-generator/validate.ts の金額ゲートが別に行う）
const operatorYen = new Set<number>();
for (const s of index.sections) {
  if (s.sources.length > 0) continue;
  for (const b of s.bullets) for (const y of extractYenAmounts(b.text)) operatorYen.add(y.value);
}
// ブログ記事の公開日・更新日（固定ページの「関連記事」のカードに出る）。事実の主張ではないので見ない
const blogDates = new Set<string>();
const BLOG_DIR = path.join(process.cwd(), "content", "blog");
for (const f of fs.existsSync(BLOG_DIR) ? fs.readdirSync(BLOG_DIR) : []) {
  if (!f.endsWith(".md")) continue;
  const head = fs.readFileSync(path.join(BLOG_DIR, f), "utf8").split(/^---\s*$/m)[1] ?? "";
  for (const m of head.matchAll(/^(?:publishedAt|updatedAt):\s*["']?(\d{4})-(\d{2})-(\d{2})/gm)) blogDates.add(`D:${m[1]}-${m[2]}-${m[3]}`);
}
// 一般化・伝聞の言い回しと、「出どころを同じ文で示しているか」の判定は、記事の検査と同じものを使う（規則を1か所に置く）
const GENERALIZATION = new RegExp(GENERALIZATION_RE.source);
const HEARSAY = new RegExp(`${HEARSAY_RE.source}|といわれ`);
const NAMED_SOURCE = ATTRIBUTION;

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function blocks(html: string): string[] {
  const start = html.search(/<main[\s>]/);
  const end = html.lastIndexOf("</main>");
  let s = start !== -1 && end !== -1 ? html.slice(start, end) : html;
  s = s
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<(p|li|td|th|h[1-6]|dt|dd|summary|caption|div|section|br|label|option)[^>]*>/g, "\n")
    // 隣り合う要素の文字がつながらないよう、タグは空白に置き換える（「05」「10年後」→「0510年」になるのを防ぐ）
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return [...new Set(s.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 1))];
}

let total = 0;
for (const file of walk(APP).sort()) {
  let route = "/" + path.relative(APP, file).replace(/\\/g, "/").replace(/\.html$/, "");
  if (route === "/index") route = "/";
  if (route.startsWith("/_") || route.startsWith("/blog/") || /\/(og|api)\//.test(route) || route === "/sitemap" || route === "/privacy") continue;
  if (only && route !== only) continue;
  const findings: string[] = [];
  for (const raw of blocks(fs.readFileSync(file, "utf8"))) {
    // 行頭の「01」「02」…は目次や手順の番号（「02 台風」が「2台」と読まれるのを防ぐ）
    const line = raw.replace(/^0\d\s+/, "");
    const issues: string[] = [];
    for (const t of extractNumTokens(line)) {
      if ((t.kind === "quantity" || t.kind === "range") && isNeutralQuantity(t.key, true)) continue;
      if (index.operator.has(t.key)) continue;
      if (t.kind === "date" && index.neutral.has(t.key)) continue;
      if (t.kind === "date" && blogDates.has(t.key)) continue;
      if (!index.tokens.has(t.key)) issues.push(`数値「${t.raw.trim()}」`);
    }
    // 「0円」は「初期費用0円のサービス（0円ソーラー）」の呼び名として使う。金額の主張ではない
    for (const y of extractYenAmounts(line)) if (y.value !== 0 && !yenOk.has(y.value) && !operatorYen.has(y.value)) issues.push(`金額「${y.raw}」`);
    // 「」の中（言葉そのものを引用しているところ）は見ない
    const plain = line.replace(/「[^」]*」/g, "「」");
    if (GENERALIZATION.test(plain) && !NAMED_SOURCE.test(line)) issues.push("一般化");
    if (HEARSAY.test(plain) && !NAMED_SOURCE.test(line)) issues.push("伝聞");
    if (issues.length > 0) findings.push(`  [${[...new Set(issues)].join("・")}] ${line.slice(0, 110)}`);
  }
  if (findings.length > 0) {
    console.log(`\n${route}（${findings.length}）`);
    for (const f of findings) console.log(f);
    total += findings.length;
  }
}
console.log(`\n見直す候補: ${total} 件（事実シート：出典 ${index.sources.size} 件・確認済みの数値 ${index.tokens.size} 種類）`);
