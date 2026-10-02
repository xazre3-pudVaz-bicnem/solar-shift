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
import { extractYenAmounts } from "../lib/blog-generator/validate";

const APP = path.join(process.cwd(), ".next", "server", "app");
const only = process.argv.slice(2).find((a) => a.startsWith("/"));
if (!fs.existsSync(APP)) {
  console.error("ビルド結果がありません。先に npm run build を実行してください。");
  process.exit(1);
}

const index = buildFactIndex(loadFacts());
const yenOk = allowedYenAmounts();
const GENERALIZATION = /一般的(に|です|な|で)|一般に|多くの(場合|機種|製品|家庭|住宅|方|業者|ケース)|ほとんどの|大半の|通常は|平均(的|して|で)|標準的(に|な)|ことが多(く|い)|がち(です|に|な|で)|傾向(が|に)あ/;
const HEARSAY = /と(言|い)われています|と(言|い)われる|といわれ|とされています|だそうです|らしいです/;
const NAMED_SOURCE = /葛飾区|区の|区は|区が|東京都|都の|都は|クール・ネット東京|国の|国は|経済産業省|資源エネルギー庁|環境省|国土交通省|SII|環境共創イニシアチブ|太陽光発電協会|JPEA|公式|手引き|案内|要綱|取扱説明書/;

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
  for (const line of blocks(fs.readFileSync(file, "utf8"))) {
    const issues: string[] = [];
    for (const t of extractNumTokens(line)) {
      if ((t.kind === "quantity" || t.kind === "range") && isNeutralQuantity(t.key, true)) continue;
      if (index.operator.has(t.key)) continue;
      if (t.kind === "date" && index.neutral.has(t.key)) continue;
      if (!index.tokens.has(t.key)) issues.push(`数値「${t.raw.trim()}」`);
    }
    for (const y of extractYenAmounts(line)) if (!yenOk.has(y.value)) issues.push(`金額「${y.raw}」`);
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
