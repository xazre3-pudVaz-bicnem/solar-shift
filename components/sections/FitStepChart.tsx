import { fit, fitYearlyPrices } from "@/data/fit";
import { formatDateJa } from "@/lib/seo";
import { reveal, growDelay } from "@/lib/reveal";

/**
 * FIT（売電価格）の階段図。数値は data/fit.ts から。
 * 最初の4年が高く、5年目から下がることを棒の高さで見せる。
 */
/** 棒の最大の高さ（%）。残りは棒の上に数字を載せる余白 */
const BAR_MAX = 74;

export function FitStepChart({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const years = fitYearlyPrices();
  const [hi, lo] = fit.residential.steps;
  const max = Math.max(...years.map((y) => y.yenPerKwh));
  return (
    <figure className={`rounded-lg bg-white p-5 sm:p-8 border border-line ${className}`} {...reveal()}>
      <div className={`grid items-end gap-6 ${compact ? "" : "lg:grid-cols-[1fr_15rem]"}`}>
        <div>
          <p className="font-heading text-base font-bold text-navy-900 sm:text-[17px]">
            {fit.fiscalYear}の売電価格（住宅用10kW未満・{fit.residential.termYears}年間）
          </p>
          <div className="relative mt-5 flex h-52 items-end gap-1.5 sm:h-60 sm:gap-2.5">
            {years.map((y, i) => {
              const high = y.stepIndex === 0;
              return (
                <div key={y.year} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className={`grow-y w-full rounded-t-lg ${high ? "bg-orange-500" : "bg-navy-300"}`}
                    style={{ height: `${(y.yenPerKwh / max) * BAR_MAX}%`, ...growDelay(150 + i * 70) }}
                  />
                </div>
              );
            })}
            {/* 棒の上のラベル */}
            <p className="absolute left-0 w-[40%] text-center font-heading font-black text-navy-900" style={{ bottom: `calc(${BAR_MAX}% + 4px)` }}>
              <span className="num-xl text-[34px] text-orange-600 sm:text-[44px]">{hi.yenPerKwh}</span>
              <span className="text-[13px] sm:text-base">円/kWh</span>
            </p>
            <p className="absolute left-[40%] w-[60%] text-center font-heading font-black text-navy-900" style={{ bottom: `calc(${(lo.yenPerKwh / max) * BAR_MAX}% + 4px)` }}>
              <span className="num-xl text-[28px] text-navy-700 sm:text-[36px]">{lo.yenPerKwh}</span>
              <span className="text-[13px] sm:text-base">円/kWh</span>
            </p>
          </div>
          <div className="border-t-[3px] border-navy-900" />
          <ol className="mt-1.5 flex gap-1.5 text-center font-en text-[11px] font-bold text-ink-3 sm:gap-2.5 sm:text-[12px]" aria-hidden="true">
            {years.map((y) => (
              <li key={y.year} className="flex-1">
                {y.year}
              </li>
            ))}
          </ol>
          <p className="mt-1 text-center text-[12px] text-ink-3">年目</p>
        </div>

        <ul className="space-y-3 text-[14px] leading-[1.7]">
          <li className="rounded-lg bg-orange-50 px-4 py-3">
            <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-orange-500" aria-hidden="true" />
            <strong className="text-navy-900">{hi.label}</strong>
            <span className="block text-ink-2">
              {hi.yenPerKwh}円/kWh。導入初期に回収を前倒しできる期間。
            </span>
          </li>
          <li className="rounded-lg bg-paper-2 px-4 py-3">
            <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-navy-300" aria-hidden="true" />
            <strong className="text-navy-900">{lo.label}</strong>
            <span className="block text-ink-2">
              {lo.yenPerKwh}円/kWh。売るより自宅で使うほうが有利になりやすい期間。
            </span>
          </li>
        </ul>
      </div>
      <figcaption className="mt-5 border-t border-line pt-3 text-[12px] leading-[1.8] text-ink-3">
        出典：
        <a href={fit.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-2">
          {fit.sourceName}
        </a>
        （{formatDateJa(fit.lastVerified)} 確認）。実際の売電収入は発電量・自家消費量により異なります。
      </figcaption>
    </figure>
  );
}
