import { sources } from "./sources";

/**
 * 再エネ賦課金（再生可能エネルギー発電促進賦課金）。ガイド・用語集・試算の説明は、ここを参照する。
 * 毎年3月ごろに、経済産業省が翌年度の単価を公表する。年度が変わったら、公表資料を開いて確かめてから直す
 * （docs/VERIFIED_FACTS.md の「再エネ賦課金」の節も合わせる）。
 */
export const surcharge = {
  fiscalYear: "2026年度",
  /** 1kWhあたりの単価（円） */
  yenPerKwh: 4.18,
  /** 適用される検針月 */
  appliesFrom: "2026年5月検針分",
  appliesTo: "2027年4月検針分",
  /** 経済産業省が示した目安（1か月の電力使用量が400kWhの需要家モデル。総務省家計調査に基づく一般的な世帯の使用量） */
  model: { kwhPerMonth: 400, monthlyYen: 1672, yearlyYen: 20064 },
  /** 単価の算定根拠（2026年度における想定） */
  basis: { purchaseCost: "4兆8,507億円", avoidedCost: "1兆6,495億円", salesKwh: "7,665億kWh" },
  /**
   * これまでの単価（円/kWh）。東京都のQ&A（Q29）の「再エネ賦課金の推移」（東京電力のホームページをもとに作成）による。
   * 2023年度だけ大きく下がっているのは、Q&Aのグラフのとおり（理由は、ここでは書かない）
   */
  history: [
    { year: 2012, yenPerKwh: 0.22 },
    { year: 2013, yenPerKwh: 0.35 },
    { year: 2014, yenPerKwh: 0.75 },
    { year: 2015, yenPerKwh: 1.58 },
    { year: 2016, yenPerKwh: 2.25 },
    { year: 2017, yenPerKwh: 2.64 },
    { year: 2018, yenPerKwh: 2.9 },
    { year: 2019, yenPerKwh: 2.95 },
    { year: 2020, yenPerKwh: 2.98 },
    { year: 2021, yenPerKwh: 3.36 },
    { year: 2022, yenPerKwh: 3.45 },
    { year: 2023, yenPerKwh: 1.4 },
    { year: 2024, yenPerKwh: 3.49 },
    { year: 2025, yenPerKwh: 3.98 },
    { year: 2026, yenPerKwh: 4.18 },
  ],
  source: sources.metiSurcharge2026,
  historySource: sources.tokyoSolarQa,
} as const;

/** 「4.18円/kWh」のような表記（小数第2位まで。2.90 のような末尾の0も残す） */
export function surchargeYen(v: number): string {
  return v.toFixed(2);
}
