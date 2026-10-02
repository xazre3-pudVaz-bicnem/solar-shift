import { sources } from "./sources";

/**
 * 国の委員会が、住宅用太陽光発電（10kW未満）の買取価格を決めるときに置いている想定値など。
 * 2026-10-02 に、調達価格等算定委員会「令和8年度以降の調達価格等に関する意見」（2026年2月5日）を開いて転記した。
 *
 * - 個々の住宅の実績や、SOLAR SHIFT の見積もりを示すものではない。
 *   ページに出すときは「国の委員会の想定値（またはヒアリングの結果）」であることを必ず添える。
 * - 年度が変わったら、新しい年度の「意見」を読み直して、事実シートと一緒に直す。
 */
export const solarAssumptions = {
  source: sources.metiProcurementOpinion,
  /** 余剰売電比率の想定値（％）。発電した電気のうち、売る割合 */
  surplusSellPercent: 70,
  /** 自宅で使う割合（％）。100 から余剰売電比率を引いたもの */
  selfUsePercent: 30,
  /** 集めた案件の、余剰売電比率の実績 */
  surplusSellActual: { period: "2025年1月〜8月", averagePercent: 64.8, medianPercent: 60.7 },
  /** 設備利用率の想定値（％） */
  capacityFactorPercent: 13.7,
  /** 大手電力の直近10年間の家庭用電気料金単価の平均に、消費税率10％を加味した値（円/kWh） */
  retailYenPerKwh: 27.86,
  retailPeriod: "2015〜2024年度",
  /** 調達期間が終わったあと（11年目以降）の売電価格の想定値（円/kWh） */
  postFitYenPerKwh: 10,
  /** 買取メニューの実績（2025年12月時点） */
  postFitActual: { asOf: "2025年12月", averageYen: 10, medianYen: 9.5 },
  /** 運転年数の想定（年） */
  operatingYears: 20,
  /** 運転維持費の想定値（円/kW/年） */
  maintenanceYenPerKwYear: 3000,
  /** 委員会が太陽光発電協会に行ったヒアリングの結果（5kWの設備を想定した場合） */
  hearing: {
    capacityKw: 5,
    inspectionEvery: "3〜5年ごとに1回程度",
    inspectionCostManYen: 3.8,
    powerConditionerCostManYen: 38.4,
    powerConditionerWithinYears: 20,
  },
  /** 新築に設置する場合のシステム費用（2025年設置の平均）の内訳 */
  costBreakdown: { panelPercent: 47, constructionPercent: 29 },
} as const;

/** JPEA の計算例：設置容量1kWあたりの年間発電量（kWh）。水平に対して30度傾け、真南に向けた場合 */
export const JPEA_YEARLY_KWH_PER_KW = 1000;
