"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";

/**
 * かつしかエコ助成金：着工の予定日から、申請の期限を逆算する道具（client）。
 *
 * - 日付の計算に使うのは、区の案内にある決まりだけ（props で受け取る。ここに数字を書かない）。
 *     事前協議は、原則として工事着工の◯週間前まで（機器付きの建売住宅は、建物の引渡しの◯週間前まで）
 *     申込期間（必着）／申込受付から回答書の到着までの目安／完了報告の期限
 * - 土日・祝日や、区の処理の混み具合は計算に入れない（区の案内に無い条件を、こちらで足さない）。
 * - 「対象です」とは言わない。入力の範囲で分かるのは「対象になる可能性」までで、決めるのは区。
 */
export interface DeadlineRules {
  /** 例：令和8年度 */
  fiscalYear: string;
  /** 事前協議は、着工（建売は引渡し）の何週間前までか */
  preConsultationWeeks: number;
  /** 申込期間（YYYY-MM-DD） */
  applyStart: string;
  applyEnd: string;
  /** 申込受付から回答書の到着までの目安（週） */
  replyWeeks: [number, number];
  /** 完了報告は、工事完了から何か月以内か */
  reportWithinMonths: number;
  /** 完了報告の最終提出期限（YYYY-MM-DD・必着） */
  reportDeadline: string;
  /** 太陽光と蓄電池の併設加算（例：一律5万円） */
  addonAmount: string;
  /** 区の案内を確かめた日（表示用。例：2026年10月2日） */
  verifiedAt: string;
}

type Housing = "existing" | "readyBuilt";
type Method = "buy" | "lease";
type Past = "no" | "yes" | "unknown";
type Residence = "own" | "rent" | "notLive";

const parse = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmt = (d: Date): string => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${"日月火水木金土"[d.getDay()]}）`;
const fmtShort = (d: Date): string => `${d.getMonth() + 1}月${d.getDate()}日`;

function Choice<T extends string>({ name, value, current, onChange, children }: { name: string; value: T; current: T; onChange: (v: T) => void; children: React.ReactNode }) {
  const on = value === current;
  return (
    <label
      className={`relative flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 px-2 py-2 text-center font-heading text-[13px] leading-[1.4] font-bold transition-colors focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-navy-600 sm:px-3 sm:text-[14px] ${
        on ? "border-green-600 bg-green-600 text-white" : "border-line-2 bg-white text-navy-900 hover:border-green-400"
      }`}
    >
      <input type="radio" name={name} value={value} checked={on} onChange={() => onChange(value)} className="sr-only" />
      {children}
    </label>
  );
}

function Group({ step, legend, children }: { step: number; legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex items-center gap-2 text-[15px] font-bold text-navy-900">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 font-en text-[12px] font-extrabold text-navy-900">{step}</span>
        {legend}
      </legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}

export function DeadlineChecker({ rules, className = "" }: { rules: DeadlineRules; className?: string }) {
  const uid = useId();
  const [housing, setHousing] = useState<Housing>("existing");
  const [date, setDate] = useState("");
  const [solar, setSolar] = useState(true);
  const [battery, setBattery] = useState(false);
  const [method, setMethod] = useState<Method>("buy");
  const [past, setPast] = useState<Past>("no");
  const [residence, setResidence] = useState<Residence>("own");

  const days = rules.preConsultationWeeks * 7;
  const startLabel = housing === "readyBuilt" ? "建物の引渡しの予定日" : "工事を始める予定日（着工日）";
  const startWord = housing === "readyBuilt" ? "引渡し" : "着工";

  const result = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const start = parse(date);
    if (Number.isNaN(start.getTime())) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const consult = addDays(start, -days);
    const applyEnd = parse(rules.applyEnd);
    const applyStart = parse(rules.applyStart);
    const status: "past" | "over" | "late" | "ok" = start < today ? "past" : consult > applyEnd ? "over" : consult < today ? "late" : "ok";
    return {
      start,
      consult,
      status,
      // 今日申し込んだ場合に、決まりのうえで着工できる最も早い日
      earliestStart: addDays(today, days),
      // 申込期間が始まる前の日付になるとき（前年度の制度の時期）
      beforePeriod: consult < applyStart,
      replyFrom: addDays(consult, rules.replyWeeks[0] * 7),
      replyTo: addDays(consult, rules.replyWeeks[1] * 7),
    };
  }, [date, days, rules.applyEnd, rules.applyStart, rules.replyWeeks]);

  // 入力から分かる「対象になるかどうか」の手がかり（決めるのは区）
  const blockers: string[] = [];
  const cautions: string[] = [];
  if (method === "lease") blockers.push("リース・レンタルでの導入は、かつしかエコ助成金の対象外です。");
  if (residence === "notLive") blockers.push("自分が住む（住む予定の）住宅であることが要件です。住宅の販売・譲渡を目的とする場合は対象外です。");
  if (past === "yes") blockers.push("申請の時点から過去10年間に、同じ建物・同じ種類の機器で、かつしかエコ助成金を受けている場合は対象外です。");
  if (past === "unknown") cautions.push("過去10年間に、同じ建物・同じ種類の機器で助成を受けていないかを、区の窓口で確かめてください。");
  if (residence === "rent") cautions.push("賃貸住宅・使用貸借住宅の場合は、住宅の所有者の同意書が必要です。");
  if (!solar && !battery) cautions.push("導入する機器を選んでください。");

  const applyEndDate = parse(rules.applyEnd);
  const reportDeadlineDate = parse(rules.reportDeadline);

  return (
    <div className={`grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start ${className}`}>
      <form className="relative min-w-0 rounded-3xl border-[3px] border-orange-300 bg-white p-5 pt-8 shadow-card sm:p-6 sm:pt-9" onSubmit={(e) => e.preventDefault()} aria-label="申請期限チェッカーの条件">
        <p className="absolute inset-x-0 -top-[1.15rem] flex justify-center">
          <span className="rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[15px] font-bold text-navy-900 shadow-sm">予定を入れる</span>
        </p>
        <div className="space-y-5">
          <Group step={1} legend="どの住宅に導入しますか">
            <div className="grid grid-cols-2 gap-2">
              <Choice name={`${uid}-housing`} value="existing" current={housing} onChange={setHousing}>
                いまの住まい・これから建てる家
              </Choice>
              <Choice name={`${uid}-housing`} value="readyBuilt" current={housing} onChange={setHousing}>
                機器付きの建売住宅を買う
              </Choice>
            </div>
          </Group>

          <div>
            <label htmlFor={`${uid}-date`} className="flex items-center gap-2 text-[15px] font-bold text-navy-900">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 font-en text-[12px] font-extrabold text-navy-900">2</span>
              {startLabel}
            </label>
            <input
              id={`${uid}-date`}
              type="date"
              value={date}
              min={rules.applyStart}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 h-12 w-full min-w-0 rounded-xl border-2 border-line-2 bg-white px-3 font-en text-[17px] font-bold text-navy-900 focus:border-orange-500 focus:outline-none"
            />
            <p className="mt-1 text-[12px] leading-[1.7] text-ink-2">まだ決まっていなければ、希望の日を入れてください。あとで変えられます。</p>
          </div>

          <Group step={3} legend="導入する機器">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["太陽光発電", solar, setSolar],
                  ["蓄電池", battery, setBattery],
                ] as const
              ).map(([label, on, set]) => (
                <label
                  key={label}
                  className={`relative flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 px-3 py-2 font-heading text-[14px] font-bold transition-colors focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-navy-600 ${
                    on ? "border-green-600 bg-green-600 text-white" : "border-line-2 bg-white text-navy-900 hover:border-green-400"
                  }`}
                >
                  <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
          </Group>

          <Group step={4} legend="導入の方法">
            <div className="grid grid-cols-2 gap-2">
              <Choice name={`${uid}-method`} value="buy" current={method} onChange={setMethod}>
                購入する
              </Choice>
              <Choice name={`${uid}-method`} value="lease" current={method} onChange={setMethod}>
                リース・レンタル
              </Choice>
            </div>
          </Group>

          <Group step={5} legend="その住宅には、だれが住みますか">
            <div className="grid grid-cols-3 gap-2">
              <Choice name={`${uid}-residence`} value="own" current={residence} onChange={setResidence}>
                自分の家に住む
              </Choice>
              <Choice name={`${uid}-residence`} value="rent" current={residence} onChange={setResidence}>
                借りて住む
              </Choice>
              <Choice name={`${uid}-residence`} value="notLive" current={residence} onChange={setResidence}>
                自分は住まない
              </Choice>
            </div>
          </Group>

          <Group step={6} legend="過去10年間に、同じ建物・同じ種類の機器で区の助成を受けましたか">
            <div className="grid grid-cols-3 gap-2">
              <Choice name={`${uid}-past`} value="no" current={past} onChange={setPast}>
                受けていない
              </Choice>
              <Choice name={`${uid}-past`} value="yes" current={past} onChange={setPast}>
                受けた
              </Choice>
              <Choice name={`${uid}-past`} value="unknown" current={past} onChange={setPast}>
                わからない
              </Choice>
            </div>
          </Group>
        </div>
      </form>

      <div className="min-w-0 rounded-3xl bg-cream p-5 sm:p-6" aria-live="polite">
        <p className="font-heading text-[17px] font-black text-navy-900">申請の期限の目安</p>

        {!result && <p className="mt-3 text-[15px] leading-[1.8] text-ink-2">{startLabel}を入れると、事前協議書を申し込む期限の目安が出ます。</p>}

        {result && result.status === "past" && <p className="mt-3 rounded-2xl bg-white p-4 text-[15px] leading-[1.8] text-ink shadow-card">今日より前の日付です。これからの{startWord}の予定日を入れてください。回答書が届く前に着工した工事は、助成の対象外です。</p>}

        {result && result.status !== "past" && (
          <ol className="mt-4 space-y-3">
            <li className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-[13px] font-bold text-ink-2">1. 事前協議書を、区に申し込む</p>
              {result.status === "ok" && (
                <>
                  <p className="mt-1 font-heading text-[20px] leading-[1.4] font-black text-navy-900">
                    {fmt(result.consult)}
                    <span className="ml-1 text-[14px]">まで</span>
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.75] text-ink-2">
                    {startWord}の{rules.preConsultationWeeks}週間前までに申し込む決まりです。郵送の場合は、区に届いた日が受付日になります。
                    {result.beforePeriod && `この日付は、${rules.fiscalYear}の申込期間が始まる前です。`}
                  </p>
                </>
              )}
              {result.status === "late" && (
                <>
                  <p className="mt-1 font-heading text-[17px] leading-[1.5] font-black text-accent-text">
                    {startWord}の{rules.preConsultationWeeks}週間前（{fmtShort(result.consult)}）を、すでに過ぎています
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.75] text-ink-2">
                    今日申し込んだ場合、決まりのうえで{startWord}できるのは {fmt(result.earliestStart)} 以降です。回答書が届くまでは着工できないため、{startWord}の日を見直せるか、施工業者と区に確認してください。
                  </p>
                </>
              )}
              {result.status === "over" && (
                <>
                  <p className="mt-1 font-heading text-[17px] leading-[1.5] font-black text-accent-text">
                    {rules.fiscalYear}の申込期間（{fmtShort(applyEndDate)}必着）を過ぎます
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.75] text-ink-2">
                    事前協議の目安日（{fmt(result.consult)}）が、{rules.fiscalYear}の申込期間のあとになります。次の年度の制度は、区の発表を確認してください。
                  </p>
                </>
              )}
            </li>

            {result.status === "ok" && (
              <li className="rounded-2xl bg-white p-4 shadow-card">
                <p className="text-[13px] font-bold text-ink-2">2. 区の「事前協議回答書」が届くのを待つ</p>
                <p className="mt-1 text-[15px] leading-[1.75] font-bold text-navy-900">
                  {fmtShort(result.consult)}に区が受け付けた場合の目安：{fmtShort(result.replyFrom)}〜{fmtShort(result.replyTo)}ごろ
                </p>
                <p className="mt-1 text-[13px] leading-[1.75] text-ink-2">
                  区の案内では、申込受付から回答書の到着まで{rules.replyWeeks[0]}〜{rules.replyWeeks[1]}週間程度です。回答書が届く前に着工すると、助成の対象外になります。期限ぎりぎりではなく、早めに申し込むと{startWord}の日に余裕ができます。
                </p>
              </li>
            )}

            {result.status !== "over" && (
              <li className="rounded-2xl bg-white p-4 shadow-card">
                <p className="text-[13px] font-bold text-ink-2">{result.status === "ok" ? "3" : "2"}. 工事が終わったら、完了報告を出す</p>
                <p className="mt-1 text-[15px] leading-[1.75] font-bold text-navy-900">
                  工事の完了から{rules.reportWithinMonths}か月以内。最終の期限は {fmt(reportDeadlineDate)} 必着
                </p>
              </li>
            )}
          </ol>
        )}

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card">
          <p className="text-[13px] font-bold text-ink-2">対象になるかどうかの手がかり</p>
          {blockers.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {blockers.map((b) => (
                <li key={b} className="flex gap-2 text-[14px] leading-[1.75] font-bold text-accent-text">
                  <span className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] leading-[1.75] font-bold text-navy-900">入力の範囲では、対象になる可能性があります。最終的な判断は、区が行います。</p>
          )}
          {cautions.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {cautions.map((c) => (
                <li key={c} className="flex gap-2 text-[13px] leading-[1.75] text-ink">
                  <span className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          )}
          {solar && battery && blockers.length === 0 && <p className="mt-2 text-[13px] leading-[1.75] text-ink-2">太陽光発電と蓄電池を併設する場合は、{rules.addonAmount}の加算があります。</p>}
        </div>

        <p className="mt-4 text-[13px] leading-[1.8] text-ink-2">
          次にすること：
          <Link href="#documents" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
            必要書類をそろえる
          </Link>
          ／
          <Link href="/simulation" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
            助成額を試算する
          </Link>
          ／
          <Link href="/contact" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
            申請の段取りを相談する
          </Link>
        </p>
        <p className="mt-3 text-[12px] leading-[1.8] text-ink-2">
          区の案内（{rules.verifiedAt}確認）にある決まりから、日付を計算しています。土日・祝日や、区の処理の混み具合は入れていません。申し込みの前に、区の最新の案内を確認してください。
        </p>
      </div>
    </div>
  );
}
