import type { SimulationResult } from "@/lib/subsidy-calc";
import { reveal, growDelay } from "@/lib/reveal";

/**
 * 想定助成額を自治体ごとの積み上げ棒グラフで示す（CSSのみ・下から伸びるアニメーション）。
 * 区と都は並べて表示するだけで合算しない。
 */
const ORANGE = ["bg-orange-600", "bg-orange-400", "bg-orange-300", "bg-orange-200"];
const NAVY = ["bg-navy-900", "bg-navy-500", "bg-navy-300", "bg-navy-100"];

export function SubsidyBars({ result, caption, className = "" }: { result: SimulationResult; caption?: string; className?: string }) {
  const max = Math.max(...result.areas.map((a) => a.subtotal), 1);
  return (
    <figure className={`rounded-lg bg-white p-5 sm:p-8 border border-line ${className}`} {...reveal()}>
      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        {result.areas.map((a, ai) => {
          const palette = ai === 0 ? ORANGE : NAVY;
          const lines = a.lines.filter((l) => l.amount !== null && l.amount > 0);
          const numColor = ai === 0 ? "text-orange-600" : "text-navy-700";
          return (
            <div key={a.area} className="flex flex-col">
              <p className="text-center font-heading text-[13px] font-bold text-navy-900 sm:text-base">
                {a.label}
                <span className="block text-[11px] font-normal text-ink-3 sm:text-[12px]">想定助成額（小計）</span>
              </p>
              <p className="mt-1 flex items-baseline justify-center gap-0.5 text-navy-900">
                <span className={`num-xl text-[30px] sm:text-[46px] ${numColor}`}>{(a.subtotal / 10000).toLocaleString("ja-JP")}</span>
                <span className="font-heading text-[14px] font-black sm:text-[18px]">万円</span>
              </p>
              <div className="mt-3 flex h-44 items-end justify-center sm:h-56">
                <div
                  className="grow-y flex w-20 flex-col-reverse overflow-hidden rounded-t-2xl sm:w-28"
                  style={{ height: `${Math.max(6, (a.subtotal / max) * 100)}%`, ...growDelay(200 + ai * 180) }}
                >
                  {lines.map((l, i) => (
                    <div key={l.subsidy.id} className={palette[i % palette.length]} style={{ flexGrow: l.amount ?? 0, flexBasis: 0, minHeight: 10 }} />
                  ))}
                </div>
              </div>
              <div className="border-t-[3px] border-navy-900" />
              <ul className="mt-3 space-y-1.5 text-[11px] leading-[1.5] text-ink-2 sm:text-[13px]">
                {lines.map((l, i) => (
                  <li key={l.subsidy.id} className="flex items-start gap-2">
                    <span className={`mt-[3px] h-3 w-3 shrink-0 rounded-sm ${palette[i % palette.length]}`} aria-hidden="true" />
                    <span className="flex-1">
                      {l.subsidy.name}
                      <span className="block font-bold text-navy-900">
                        {l.amount?.toLocaleString("ja-JP")}円{l.isCapOnly ? "（上限額）" : ""}
                      </span>
                    </span>
                  </li>
                ))}
                {lines.length === 0 && <li className="text-center text-ink-3">対象の制度なし</li>}
              </ul>
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="mt-5 border-t border-line pt-3 text-[12px] leading-[1.8] text-ink-3">{caption}</figcaption>}
    </figure>
  );
}
