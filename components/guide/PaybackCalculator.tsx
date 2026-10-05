"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calcPayback } from "@/lib/payback";
import { images } from "@/data/images";

/**
 * 太陽光発電の回収年数の試算（client）。
 * 計算は lib/payback.ts（純関数）に委ね、ここでは入力と表示だけを扱う。
 *
 * - 初めから入っている数値は、出どころのあるものだけ（props で受け取る。ここに数字を書かない）。
 *   設置費用・補助金・容量は、見積書の数字を自分で入れてもらう（相場を初期値にしない）。
 * - 結果は「入力した条件での単純な計算」。保証するものではないことを、結果のそばに必ず出す。
 */
export interface PaybackDefaults {
  /** 1kWあたりの年間発電量（kWh） */
  yearlyKwhPerKw: number;
  /** 自宅で使う割合（％） */
  selfUsePercent: number;
  /** 買っている電気の単価（円/kWh） */
  retailYenPerKwh: number;
  /** 11年目以降の売電単価（円/kWh） */
  postFitYenPerKwh: number;
  /** FIT の単価 */
  fitSteps: readonly { fromYear: number; toYear: number; yenPerKwh: number; label: string }[];
  /** 計算する年数 */
  maxYears: number;
  /** 再エネ賦課金の単価（説明に出すだけ。data/surcharge.ts の値をページ側から渡す） */
  surcharge: { fiscalYear: string; yenPerKwh: string };
}

const num = (s: string): number => {
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const man = (yen: number): string => (yen / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 });

function Field({ label, hint, unit, value, onChange, placeholder, step }: { label: string; hint?: React.ReactNode; unit: string; value: string; onChange: (v: string) => void; placeholder?: string; step?: number }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-[15px] font-bold text-navy-900">
        {step && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 font-en text-[12px] font-extrabold text-navy-900">{step}</span>}
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full min-w-0 rounded-xl border-2 border-line-2 bg-white px-3 text-right font-en text-[18px] font-extrabold text-navy-900 placeholder:text-[14px] placeholder:font-normal placeholder:text-ink-3 focus:border-orange-500 focus:outline-none"
        />
        <span className="w-16 shrink-0 text-[14px] font-bold text-ink-2">{unit}</span>
      </div>
      {hint && <p className="mt-1 text-[12px] leading-[1.7] text-ink-2">{hint}</p>}
    </div>
  );
}

export function PaybackCalculator({ defaults }: { defaults: PaybackDefaults }) {
  const [cost, setCost] = useState("");
  const [subsidy, setSubsidy] = useState("");
  const [kw, setKw] = useState("");
  const [yearly, setYearly] = useState(String(defaults.yearlyKwhPerKw));
  const [selfUse, setSelfUse] = useState(String(defaults.selfUsePercent));
  const [retail, setRetail] = useState(String(defaults.retailYenPerKwh));
  const [postFit, setPostFit] = useState(String(defaults.postFitYenPerKwh));

  const ready = num(cost) > 0 && num(kw) > 0 && num(yearly) > 0 && num(retail) > 0;
  const result = useMemo(
    () =>
      calcPayback({
        cost: num(cost) * 10000,
        subsidy: num(subsidy) * 10000,
        capacityKw: num(kw),
        yearlyKwhPerKw: num(yearly),
        selfUsePercent: num(selfUse),
        retailYenPerKwh: num(retail),
        fitSteps: defaults.fitSteps,
        postFitYenPerKwh: num(postFit),
        maxYears: defaults.maxYears,
      }),
    [cost, subsidy, kw, yearly, selfUse, retail, postFit, defaults],
  );
  const top = Math.max(result.netCost, result.years[result.years.length - 1]?.cumulative ?? 0, 1);
  const costLine = (result.netCost / top) * 100;
  const phases = [
    ...defaults.fitSteps.map((s) => ({ label: s.label, year: s.fromYear })),
    { label: `${defaults.fitSteps[defaults.fitSteps.length - 1].toYear + 1}年目以降`, year: defaults.fitSteps[defaults.fitSteps.length - 1].toYear + 1 },
  ];

  return (
    <div className="grid gap-8">
      <form className="relative min-w-0 rounded-3xl border-[3px] border-orange-300 bg-white p-5 pt-8 shadow-card sm:p-6 sm:pt-9" onSubmit={(e) => e.preventDefault()} aria-label="回収年数の試算の条件">
        <p className="absolute inset-x-0 -top-[1.15rem] flex justify-center">
          <span className="rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[15px] font-bold text-navy-900 shadow-sm">見積書の数字を入れる</span>
        </p>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3 sm:gap-4">
          <Field step={1} label="設置費用" unit="万円" value={cost} onChange={setCost} placeholder="見積書の総額" />
          <Field
            step={2}
            label="補助金の見込み額"
            unit="万円"
            value={subsidy}
            onChange={setSubsidy}
            placeholder="無ければ空欄"
          />
          <Field step={3} label="太陽光の容量" unit="kW" value={kw} onChange={setKw} placeholder="見積書の容量" />
          </div>
          <p className="text-[13px] leading-[1.7] text-ink-2">
            葛飾区と東京都の補助金の想定額は
            <Link href="/simulation" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
              補助金シミュレーション
            </Link>
            で確かめられます。
          </p>
          <details className="group rounded-2xl bg-cream px-4 py-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-[14px] font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
              計算の前提を変える
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <div className="mt-3 grid gap-4 pb-2 sm:grid-cols-2">
              <Field label="1kWあたりの年間発電量" unit="kWh" value={yearly} onChange={setYearly} hint="初めの値は、太陽光発電協会の計算例です。屋根の向きや影で変わります。" />
              <Field label="自宅で使う割合" unit="％" value={selfUse} onChange={setSelfUse} hint="初めの値は、国の委員会の想定です。昼に家で電気を使うほど、高くなります。" />
              <Field label="買っている電気の単価" unit="円/kWh" value={retail} onChange={setRetail} hint={`初めの値は、国の委員会の資料にある値です（大手電力の、直近10年間の単価をもとにした値）。検針票で直すときは、電力量料金の単価に、燃料費調整額の単価を足し引きし、再エネ賦課金（${defaults.surcharge.fiscalYear}は${defaults.surcharge.yenPerKwh}円/kWh）を足します。`} />
              <Field label="買取期間が終わったあとの売電単価" unit="円/kWh" value={postFit} onChange={setPostFit} hint="初めの値は、国の委員会の想定です。実際の単価は、電力会社によって違います。" />
            </div>
          </details>
          <button
            type="button"
            onClick={() => {
              setCost("");
              setSubsidy("");
              setKw("");
              setYearly(String(defaults.yearlyKwhPerKw));
              setSelfUse(String(defaults.selfUsePercent));
              setRetail(String(defaults.retailYenPerKwh));
              setPostFit(String(defaults.postFitYenPerKwh));
            }}
            className="min-h-11 px-1 text-[14px] text-ink-2 underline underline-offset-4"
          >
            入力をリセット
          </button>
        </div>
      </form>

      <div className="min-w-0" aria-live="polite">
        <div className="flex items-end gap-3">
          <Image src={images.poseCalc.src} alt="" width={images.poseCalc.width} height={images.poseCalc.height} sizes="96px" className="h-auto w-20 shrink-0 sm:w-24" />
          <p className="relative mb-3 flex-1 rounded-2xl border-2 border-green-500 bg-white px-4 py-3 font-heading text-[15px] leading-[1.6] font-bold text-navy-900 shadow-card sm:text-[17px]">
            <span className="absolute bottom-5 -left-[9px] h-4 w-4 rotate-45 border-2 border-t-0 border-r-0 border-green-500 bg-white" aria-hidden="true" />
            {ready ? (
              result.paybackYear ? (
                <>
                  この条件では、<span className="marker">{result.paybackYear}年目</span>に回収できる計算です
                </>
              ) : (
                <>この条件では、{defaults.maxYears}年目までに回収できない計算です</>
              )
            ) : (
              <>設置費用と容量を入れると、ここに結果が出ます</>
            )}
          </p>
        </div>

        {ready && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-cream px-4 py-3">
                <p className="text-[12px] font-bold text-ink-2">実質の負担額</p>
                <p className="mt-0.5">
                  <span className="font-en text-[24px] font-extrabold text-navy-900">{man(result.netCost)}</span>
                  <span className="ml-0.5 text-[13px] font-bold text-ink-2">万円</span>
                </p>
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3">
                <p className="text-[12px] font-bold text-ink-2">年間の発電量</p>
                <p className="mt-0.5">
                  <span className="font-en text-[24px] font-extrabold text-navy-900">{Math.round(result.yearlyKwh).toLocaleString("ja-JP")}</span>
                  <span className="ml-0.5 text-[13px] font-bold text-ink-2">kWh</span>
                </p>
              </div>
              <div className="rounded-2xl bg-orange-500 px-4 py-3 text-navy-900">
                <p className="text-[12px] font-bold">回収の目安</p>
                <p className="mt-0.5">
                  <span className="font-en text-[24px] font-extrabold">{result.paybackYear ?? "—"}</span>
                  <span className="ml-0.5 text-[13px] font-bold">{result.paybackYear ? "年目" : `${defaults.maxYears}年では届かず`}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-white p-4 shadow-card sm:p-5">
              <p className="text-[14px] font-bold text-navy-900">効果額の累計と、実質の負担額</p>
              <div
                className="relative mt-4 flex h-44 items-end gap-[3px] border-b-2 border-line-2 sm:gap-1.5"
                role="img"
                aria-label={
                  result.paybackYear
                    ? `効果額の累計は、${result.paybackYear}年目に実質の負担額 ${man(result.netCost)}万円を上回ります。`
                    : `効果額の累計は、${defaults.maxYears}年目で ${man(result.years[result.years.length - 1].cumulative)}万円です。実質の負担額 ${man(result.netCost)}万円には届きません。`
                }
              >
                <span className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-navy-900/60" style={{ bottom: `${costLine}%` }} aria-hidden="true">
                  <span className="absolute -top-6 left-0 rounded-full bg-navy-900 px-2 py-[1px] text-[11px] font-bold text-white">実質の負担額</span>
                </span>
                {result.years.map((y) => (
                  <span
                    key={y.year}
                    className={`flex-1 rounded-t-[3px] transition-[height] duration-500 ease-out ${result.paybackYear && y.year >= result.paybackYear ? "bg-green-500" : "bg-orange-400"}`}
                    style={{ height: `${Math.max(2, (y.cumulative / top) * 100)}%` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between font-en text-[11px] font-bold text-ink-2" aria-hidden="true">
                <span>1年目</span>
                <span>{Math.round(defaults.maxYears / 2)}年目</span>
                <span>{defaults.maxYears}年目</span>
              </div>
              <ul className="mt-4 grid gap-2 text-[14px] leading-[1.7] text-ink sm:grid-cols-3">
                {phases.map((p) => {
                  const y = result.years.find((v) => v.year === p.year);
                  if (!y) return null;
                  return (
                    <li key={p.label} className="rounded-xl bg-beige px-3 py-2">
                      <span className="block text-[12px] font-bold text-ink-2">
                        {p.label}（売電 {y.sellYenPerKwh}円/kWh）
                      </span>
                      <span className="font-en text-[18px] font-extrabold text-navy-900">{man(y.benefit)}</span>
                      <span className="ml-0.5 text-[12px] font-bold text-ink-2">万円/年</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        <p className="mt-5 rounded-2xl border-l-8 border-orange-500 bg-orange-50 px-4 py-3 text-[14px] leading-[1.8] text-ink">
          入力した数字をもとにした、<strong>単純な計算</strong>です。発電量の低下、電気料金の変動、点検や機器の交換の費用は入っていません。結果を保証するものではありません。
        </p>
      </div>
    </div>
  );
}
