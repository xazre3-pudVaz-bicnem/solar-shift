import type { AmountRule, HousingType, Subsidy, SubsidyArea } from "@/data/subsidies";
import { allSubsidies } from "@/data/subsidies";

/**
 * 補助金シミュレーターの計算ロジック（純関数・UIに依存しない）。
 *
 * 方針
 * - data/subsidies の rule だけを使って計算する。rule のない制度は「参考」として扱い金額を出さない。
 * - 自治体をまたいだ合算はしない。併用可否は公式情報で確認できていないため、
 *   自治体ごとの小計のみを返す。
 * - 率ベース（対象経費×1/4 など）は経費が未入力なら「上限額（最大）」として提示し、
 *   isCapOnly=true を付けて UI 側で注記する。
 */

export interface SimulationInput {
  area: "katsushika";
  housing: HousingType;
  solarKw: number;
  batteryKwh: number;
  /** 任意：蓄電池の助成対象経費（税抜・円） */
  batteryCost?: number;
  v2h: boolean;
  /** 任意：V2H本体価格（円） */
  v2hCost?: number;
  hems: boolean;
}

export interface LineResult {
  subsidy: Subsidy;
  /** 想定助成額（円）。計算できない場合は null */
  amount: number | null;
  /** 計算式の説明（表示用） */
  formula: string;
  /** 上限で頭打ちになったか */
  capped: boolean;
  /** 経費未入力のため上限額を表示しているか */
  isCapOnly: boolean;
  /** 適用されなかった理由（ある場合） */
  skippedReason?: string;
}

export interface AreaResult {
  area: SubsidyArea;
  label: string;
  lines: LineResult[];
  /** 計算できた行の合計（同一自治体内の小計） */
  subtotal: number;
  /** 上限のみ表示の行が含まれるか */
  hasCapOnly: boolean;
  notes: string[];
}

export interface SimulationResult {
  input: SimulationInput;
  areas: AreaResult[];
  /** 金額計算の対象外として参考表示する制度（国など） */
  reference: Subsidy[];
}

function fmtYen(n: number): string {
  return `${n.toLocaleString("ja-JP")}円`;
}

function applyRule(rule: AmountRule, input: SimulationInput, s: Subsidy): LineResult {
  const base = { subsidy: s, capped: false, isCapOnly: false };

  switch (rule.kind) {
    case "perKw": {
      const raw = Math.floor(input.solarKw * rule.unit);
      const amount = rule.max !== undefined ? Math.min(raw, rule.max) : raw;
      return {
        ...base,
        amount,
        capped: rule.max !== undefined && raw > rule.max,
        formula: `${input.solarKw}kW × ${fmtYen(rule.unit)}${rule.max !== undefined ? `（上限${fmtYen(rule.max)}）` : ""}`,
      };
    }
    case "perKwh": {
      const raw = Math.floor(input.batteryKwh * rule.unit);
      let amount = rule.max !== undefined ? Math.min(raw, rule.max) : raw;
      let capped = rule.max !== undefined && raw > rule.max;
      // 助成対象経費（税抜）が上限になる制度：経費が入力されていれば経費も上限として扱う
      if (input.batteryCost && input.batteryCost > 0 && amount > input.batteryCost) {
        amount = input.batteryCost;
        capped = true;
      }
      return {
        ...base,
        amount,
        capped,
        formula: `${input.batteryKwh}kWh × ${fmtYen(rule.unit)}${rule.max !== undefined ? `（上限${fmtYen(rule.max)}）` : ""}`,
      };
    }
    case "rate": {
      const cost = s.equipment === "v2h" ? input.v2hCost : input.batteryCost;
      if (!cost || cost <= 0) {
        return {
          ...base,
          amount: rule.max ?? null,
          isCapOnly: rule.max !== undefined,
          formula: `対象経費 × ${rule.rateLabel}${rule.max !== undefined ? `（上限${fmtYen(rule.max)}）` : ""}`,
        };
      }
      const raw = Math.floor(cost * rule.rate);
      const amount = rule.max !== undefined ? Math.min(raw, rule.max) : raw;
      return {
        ...base,
        amount,
        capped: rule.max !== undefined && raw > rule.max,
        formula: `${fmtYen(cost)} × ${rule.rateLabel}${rule.max !== undefined ? `（上限${fmtYen(rule.max)}）` : ""}`,
      };
    }
    case "fixed":
      return { ...base, amount: rule.amount, formula: `一律 ${fmtYen(rule.amount)}` };
    case "tieredPerKw": {
      const tier = rule.tiers.find((t) => t.maxKw === null || input.solarKw <= t.maxKw) ?? rule.tiers[rule.tiers.length - 1];
      const raw = Math.floor(input.solarKw * tier.unit);
      const amount = tier.max !== undefined ? Math.min(raw, tier.max) : raw;
      const tierLabel =
        tier.maxKw === null
          ? `${rule.tiers.filter((t) => t.maxKw !== null).map((t) => t.maxKw).pop()}kW超の区分`
          : `${tier.maxKw}kW以下の区分`;
      return {
        ...base,
        amount,
        capped: tier.max !== undefined && raw > tier.max,
        formula: `${tierLabel}：${input.solarKw}kW × ${fmtYen(tier.unit)}${tier.max !== undefined ? `（上限${fmtYen(tier.max)}）` : ""}`,
      };
    }
  }
}

/** この入力でそのメニューが対象になり得るか */
function isApplicable(s: Subsidy, input: SimulationInput): { ok: boolean; reason?: string } {
  if (s.status !== "open") return { ok: false, reason: "現在受付中ではありません" };
  switch (s.equipment) {
    case "solar":
      if (input.solarKw <= 0) return { ok: false, reason: "太陽光発電の容量が未入力です" };
      if (s.rule?.kind === "tieredPerKw" && s.rule.housing !== input.housing)
        return { ok: false, reason: "住宅区分が異なります" };
      return { ok: true };
    case "battery":
      return input.batteryKwh > 0 ? { ok: true } : { ok: false, reason: "蓄電池の容量が未入力です" };
    case "v2h":
      return input.v2h ? { ok: true } : { ok: false, reason: "V2Hを選択していません" };
    case "hems":
      return input.hems ? { ok: true } : { ok: false, reason: "HEMSを選択していません" };
    case "solar-battery-addon":
      return input.solarKw > 0 && input.batteryKwh > 0
        ? { ok: true }
        : { ok: false, reason: "太陽光発電と蓄電池の両方を導入する場合に加算" };
    case "solar-hems-addon":
      return input.solarKw > 0 && input.hems
        ? { ok: true }
        : { ok: false, reason: "太陽光発電とHEMSの両方を導入する場合に加算" };
    default:
      return { ok: false, reason: "自動計算の対象外" };
  }
}

export function simulate(input: SimulationInput): SimulationResult {
  const areasOrder: { area: SubsidyArea; label: string }[] = [
    { area: "katsushika", label: "葛飾区" },
    { area: "tokyo", label: "東京都" },
  ];

  const areas: AreaResult[] = areasOrder.map(({ area, label }) => {
    const subs = allSubsidies.filter((s) => s.area === area && s.rule);
    const lines: LineResult[] = [];
    for (const s of subs) {
      const app = isApplicable(s, input);
      if (!app.ok) {
        // 住宅区分違いなど、表示する意味がないものは出さない
        const hide =
          app.reason === "住宅区分が異なります" ||
          (s.equipment === "solar" && input.solarKw <= 0) ||
          (s.equipment === "battery" && input.batteryKwh <= 0) ||
          (s.equipment === "v2h" && !input.v2h) ||
          (s.equipment === "hems" && !input.hems) ||
          s.equipment === "solar-battery-addon" ||
          s.equipment === "solar-hems-addon";
        if (!hide) lines.push({ subsidy: s, amount: null, formula: "", capped: false, isCapOnly: false, skippedReason: app.reason });
        continue;
      }
      lines.push(applyRule(s.rule as AmountRule, input, s));
    }
    const subtotal = lines.reduce((acc, l) => acc + (l.amount ?? 0), 0);
    const notes: string[] = [];
    if (area === "katsushika") {
      notes.push("原則、工事着工4週間前までの事前協議が必要です。事前協議回答書が届く前に着工すると対象外になります。");
    }
    if (area === "tokyo") {
      notes.push("助成対象経費（税抜）が上限になります。2026年10月1日以降に事前申込する蓄電池はSII登録機器に限られます。");
    }
    return { area, label, lines, subtotal, hasCapOnly: lines.some((l) => l.isCapOnly), notes };
  });

  const reference = allSubsidies.filter((s) => s.area === "national");

  return { input, areas, reference };
}
