import fs from "node:fs";
import path from "node:path";

/**
 * 検証済み事実シート（docs/VERIFIED_FACTS.md）をプロンプトに埋め込む。
 * 事実の正本はこのMarkdownだけ。制度更新時は data/subsidies と一緒に更新する。
 */
export function loadFacts(): string {
  const file = path.join(process.cwd(), "docs", "VERIFIED_FACTS.md");
  return fs.readFileSync(file, "utf8");
}

/** 事実シートで許可されている出典URL */
export function allowedSourceUrls(facts: string): Set<string> {
  const urls = new Set<string>();
  for (const m of facts.matchAll(/https?:\/\/[^\s)）」」]+/g)) urls.add(m[0]);
  return urls;
}

/**
 * 記事内に書いてよい金額（円）のホワイトリスト。
 * 事実シートの数値と、制度のルールから機械的に導ける計算例（容量×単価、上限）だけを許可する。
 */
export function allowedYenAmounts(): Set<number> {
  const set = new Set<number>();
  const add = (n: number) => set.add(Math.round(n));

  // 事実シートに出てくる固定額
  [60000, 300000, 200000, 50000, 10000, 20000, 150000, 450000, 120000, 360000, 100000, 1200000, 72000, 600000, 96000, 7000].forEach(add);
  // FIT の買取単価を「24円」「19円」と、/kWh を付けずに書く場合（8.3円は小数なので金額としては拾われない）
  [24, 19].forEach(add);
  // 端数処理の単位（助成金額の1,000円未満は切り捨て）
  add(1000);
  // 国 DR 家庭用蓄電池事業の目標価格（12.5万円/kWh）
  add(125000);
  // 葛飾区 太陽光 6万円/kW（上限30万）
  for (let kw = 0.5; kw <= 20; kw += 0.5) add(Math.min(60000 * kw, 300000));
  // 東京都 既存 15万/12万、新築 12万/10万
  for (let kw = 0.5; kw <= 50; kw += 0.5) {
    add(kw <= 3.75 ? Math.min(150000 * kw, 450000) : 120000 * kw);
    add(kw <= 3.6 ? Math.min(120000 * kw, 360000) : 100000 * kw);
  }
  // 東京都 蓄電池 10万/kWh（上限120万）、増設 6万/kWh（上限72万）
  for (let kwh = 0.5; kwh <= 30; kwh += 0.5) {
    add(Math.min(100000 * kwh, 1200000));
    add(Math.min(60000 * kwh, 720000));
  }
  // 葛飾区 蓄電池 1/4（上限20万）：上限に達する経費 80万円／V2H 1/3（上限15万）：45万円
  [800000, 450000].forEach(add);
  // 国 DR 上限60万、3/10 で上限に達する 200万
  add(2000000);
  return set;
}
