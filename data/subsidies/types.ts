/**
 * 補助金データの型定義。
 * 金額は各ページにベタ書きせず、必ず data/subsidies/*.ts から参照する。
 */

export type SubsidyArea = "katsushika" | "tokyo" | "national";

export type SubsidyStatus =
  /** 受付中 */
  | "open"
  /** 受付終了（予算到達・期限到来） */
  | "closed"
  /** 公募前・次回未定 */
  | "upcoming"
  /** 公式情報で確認できていない */
  | "unknown";

export type Equipment =
  | "solar"
  | "battery"
  | "v2h"
  | "hems"
  | "solar-battery-addon"
  | "solar-hems-addon"
  | "other";

export type HousingType = "existing" | "new";

/**
 * 計算ルール。シミュレーターはこのルールだけを使って「想定額」を出す。
 * 公式情報で機械的に計算できないもの（DR加算など）は rule を持たせず notes で説明する。
 */
export type AmountRule =
  | { kind: "perKw"; unit: number; max?: number }
  | { kind: "perKwh"; unit: number; max?: number }
  /** 対象経費 × 率（経費が未入力なら上限額のみ提示） */
  | { kind: "rate"; rate: number; rateLabel: string; max?: number }
  | { kind: "fixed"; amount: number }
  /** 容量の区分で単価が変わる（区分は容量全体に適用） */
  | {
      kind: "tieredPerKw";
      housing: HousingType;
      tiers: { maxKw: number | null; unit: number; max?: number }[];
    };

export interface Subsidy {
  id: string;
  /** 制度全体の名称（例：かつしかエコ助成金） */
  programName: string;
  /** メニュー名（例：太陽光発電システム） */
  name: string;
  area: SubsidyArea;
  areaLabel: string;
  /** 管轄・実施主体 */
  issuer: string;
  fiscalYear: string;
  equipment: Equipment;
  /** 対象者・対象住宅 */
  target: string;
  /** 助成額の表示用文字列 */
  amount: string;
  /** 上限の表示用文字列 */
  maxAmount: string;
  /** 機械計算用ルール（任意） */
  rule?: AmountRule;
  applicationPeriod: string;
  deadline: string;
  preApplicationRequired: boolean;
  /** 事前手続きの説明（着工4週間前までの事前協議 など） */
  preApplicationNote?: string;
  status: SubsidyStatus;
  /** 主な要件 */
  conditions: string[];
  /** 注意事項 */
  notes: string[];
  sourceName: string;
  sourceUrl: string;
  /** 一次情報を最後に確認した日（YYYY-MM-DD） */
  lastVerified: string;
  /** 問い合わせ窓口（公式に掲載されているもののみ） */
  contact?: { name: string; tel?: string; hours?: string };
}

export interface SubsidyProgram {
  id: string;
  area: SubsidyArea;
  programName: string;
  issuer: string;
  fiscalYear: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
  /** 制度横断の注意点 */
  notes: string[];
  menus: Subsidy[];
}
