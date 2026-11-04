/**
 * 情報の鮮度の点検。一次情報（補助金・FIT・再エネ賦課金・出典の資料）を最後に確かめた日から、目安の日数を過ぎていないかを見る。
 *
 * - 目安の日数は FRESHNESS_DAYS で変えられる（決まりではなく、見直しの合図）
 * - 補助金は、validUntil（年度の終わり・申込の最終期限）を過ぎたら、新しい年度の情報を確かめる合図を出す
 * - 使う場所：npm run seo:audit（CI でも動く）と、npm run dev を始めるとき（scripts/freshness.ts）
 *
 * 「確かめた日」と「内容を直した日」は別もの。確かめただけなら、ページの更新日（lib/routes.ts の updatedAt）は進めない。
 * Node のスクリプト（tsx）からも読むので、"@/…" の別名や fs は使わない。
 */
import { allSubsidies } from "../data/subsidies";
import { fit } from "../data/fit";
import { surcharge } from "../data/surcharge";
import { wardPrograms } from "../data/ward-programs";
import { sources } from "../data/sources";

/** 確かめてから、見直しの合図を出すまでの日数（目安） */
export const FRESHNESS_DAYS = {
  /** 区・都・国の補助金（受付状況や予算が変わりやすい） */
  subsidy: 30,
  /** 周辺の区の補助金 */
  ward: 30,
  /** FIT の買取価格（年度ごとに決まる） */
  fit: 90,
  /** 再エネ賦課金（年度ごとに決まる） */
  surcharge: 90,
  /** そのほかの出典（業界団体・メーカー・国の解説など） */
  source: 180,
} as const;

export type FreshnessKind = keyof typeof FRESHNESS_DAYS | "validUntil";

export interface FreshnessIssue {
  kind: FreshnessKind;
  /** 何の情報か（例：葛飾区「かつしかエコ助成金」） */
  label: string;
  /** 確かめた日、または有効期限（YYYY-MM-DD） */
  date: string;
  /** 経過した日数（validUntil のときは、期限を過ぎた日数） */
  days: number;
  /** 目安の日数（validUntil のときは 0） */
  limit: number;
}

/** 日本時間の今日（YYYY-MM-DD） */
export function todayJst(now = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export function freshnessIssues(today = todayJst()): FreshnessIssue[] {
  const out: FreshnessIssue[] = [];
  const check = (kind: keyof typeof FRESHNESS_DAYS, label: string, date: string) => {
    const days = daysBetween(date, today);
    if (days > FRESHNESS_DAYS[kind]) out.push({ kind, label, date, days, limit: FRESHNESS_DAYS[kind] });
  };

  // 補助金（同じ公式ページを見ているメニューは1回だけ）
  const seen = new Set<string>();
  for (const s of allSubsidies) {
    if (!seen.has(s.sourceUrl)) {
      seen.add(s.sourceUrl);
      check("subsidy", `${s.areaLabel}「${s.programName}」`, s.lastVerified);
    }
    if (today > s.validUntil) {
      out.push({ kind: "validUntil", label: `${s.areaLabel}「${s.programName}」${s.name}`, date: s.validUntil, days: daysBetween(s.validUntil, today), limit: 0 });
    }
  }
  for (const w of wardPrograms) check("ward", `${w.programName}（${w.slug}）`, w.sources[0].verifiedAt);
  check("fit", `FIT（${fit.fiscalYear}）`, fit.lastVerified);
  check("surcharge", `再エネ賦課金（${surcharge.fiscalYear}）`, surcharge.source.verifiedAt);
  for (const s of Object.values(sources)) check("source", s.name, s.verifiedAt);
  return out;
}

/** 1行の説明（「確認から45日（目安30日）」など） */
export function describeFreshness(i: FreshnessIssue): string {
  if (i.kind === "validUntil") return `${i.label}：有効期限 ${i.date} を ${i.days} 日過ぎています。新しい年度の情報を確かめてください`;
  return `${i.label}：最後に確かめたのは ${i.date}（${i.days} 日前。目安 ${i.limit} 日）。公式ページで確かめ直してください`;
}
