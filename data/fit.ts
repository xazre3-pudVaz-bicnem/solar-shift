/**
 * FIT（固定価格買取制度）の買取価格。図解・本文はここを参照する。
 * 年度が変わったら経済産業省の公表資料を確認して更新する（docs/VERIFIED_FACTS.md も合わせる）。
 */
export const fit = {
  fiscalYear: "2026年度",
  /** 住宅用（10kW未満）。初期投資支援スキーム */
  residential: {
    termYears: 10,
    steps: [
      { fromYear: 1, toYear: 4, yenPerKwh: 24, label: "1〜4年目" },
      { fromYear: 5, toYear: 10, yenPerKwh: 8.3, label: "5〜10年目" },
    ],
  },
  sourceName: "経済産業省「再生可能エネルギーのFIT制度・FIP制度における2026年度以降の買取価格等と2026年度の賦課金単価を設定します」",
  sourceUrl: "https://www.meti.go.jp/press/2025/03/20260319004/20260319004.html",
  lastVerified: "2026-10-01",
} as const;

/** 年ごとの単価（1年目〜termYears年目） */
export function fitYearlyPrices(): { year: number; yenPerKwh: number; stepIndex: number }[] {
  const out: { year: number; yenPerKwh: number; stepIndex: number }[] = [];
  fit.residential.steps.forEach((s, stepIndex) => {
    for (let y = s.fromYear; y <= s.toYear; y += 1) out.push({ year: y, yenPerKwh: s.yenPerKwh, stepIndex });
  });
  return out;
}
