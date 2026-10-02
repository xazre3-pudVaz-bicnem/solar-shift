/**
 * 太陽光発電の回収年数の、単純な計算（純関数）。
 *
 *   実質の負担額 ＝ 設置費用 − 補助金
 *   1年の効果額 ＝ 自宅で使った分 × 買う電気の単価 ＋ 売った分 × 売電単価
 *   回収の目安   ＝ 効果額の累計が、実質の負担額を上回る年
 *
 * 売電単価は年によって変わる（FIT の前半・後半、買取期間が終わったあと）ので、1年ずつ足していく。
 * 発電量の低下、電気料金の変動、点検や機器の交換の費用は入れていない（入力した条件での単純な試算）。
 * このファイルは数値の決まりを持たない。単価などは、すべて呼び出し側から渡す。
 */
export interface PaybackInput {
  /** 設置費用（円） */
  cost: number;
  /** 補助金の見込み額（円） */
  subsidy: number;
  /** 太陽光の容量（kW） */
  capacityKw: number;
  /** 1kWあたりの年間発電量（kWh） */
  yearlyKwhPerKw: number;
  /** 自宅で使う割合（0〜100） */
  selfUsePercent: number;
  /** 買っている電気の単価（円/kWh） */
  retailYenPerKwh: number;
  /** FIT の単価（年の範囲つき） */
  fitSteps: readonly { fromYear: number; toYear: number; yenPerKwh: number }[];
  /** 買取期間が終わったあとの売電単価（円/kWh） */
  postFitYenPerKwh: number;
  /** 何年目まで計算するか */
  maxYears: number;
}

export interface PaybackYear {
  year: number;
  sellYenPerKwh: number;
  /** その年の効果額（円） */
  benefit: number;
  /** 効果額の累計（円） */
  cumulative: number;
}

export interface PaybackResult {
  /** 実質の負担額（円） */
  netCost: number;
  /** 年間の発電量（kWh） */
  yearlyKwh: number;
  selfUseKwh: number;
  sellKwh: number;
  years: PaybackYear[];
  /** 効果額の累計が実質の負担額を上回る年（計算の範囲で届かなければ null） */
  paybackYear: number | null;
}

export function sellPriceOf(year: number, input: Pick<PaybackInput, "fitSteps" | "postFitYenPerKwh">): number {
  const step = input.fitSteps.find((s) => year >= s.fromYear && year <= s.toYear);
  return step ? step.yenPerKwh : input.postFitYenPerKwh;
}

export function calcPayback(input: PaybackInput): PaybackResult {
  const netCost = Math.max(0, input.cost - input.subsidy);
  const yearlyKwh = input.capacityKw * input.yearlyKwhPerKw;
  const selfRate = Math.min(100, Math.max(0, input.selfUsePercent)) / 100;
  const selfUseKwh = yearlyKwh * selfRate;
  const sellKwh = yearlyKwh - selfUseKwh;
  const years: PaybackYear[] = [];
  let cumulative = 0;
  let paybackYear: number | null = null;
  for (let year = 1; year <= input.maxYears; year += 1) {
    const sellYenPerKwh = sellPriceOf(year, input);
    const benefit = Math.round(selfUseKwh * input.retailYenPerKwh + sellKwh * sellYenPerKwh);
    cumulative += benefit;
    years.push({ year, sellYenPerKwh, benefit, cumulative });
    if (paybackYear === null && netCost > 0 && cumulative >= netCost) paybackYear = year;
  }
  return { netCost, yearlyKwh, selfUseKwh, sellKwh, years, paybackYear };
}
