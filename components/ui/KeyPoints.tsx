import type { ReactNode } from "react";

/**
 * AI検索・読者向けの「結論／要点」ボックス。
 * ページ冒頭に置き、100〜200文字の結論と、要点の箇条書きを構造化して出す。
 */
export function KeyPoints({
  title = "このページの結論",
  conclusion,
  points,
  className = "",
}: {
  title?: string;
  conclusion: ReactNode;
  points?: ReactNode[];
  className?: string;
}) {
  return (
    <section aria-label={title} className={`overflow-hidden rounded-2xl border border-green-100 bg-white shadow-card ${className}`}>
      <div className="flex items-center gap-2 bg-green-600 px-5 py-2.5">
        <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="m6.5 10 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-[13px] font-bold tracking-wide text-white">{title}</p>
      </div>
      <div className="px-5 py-5">
        <p className="text-base leading-[1.9] font-medium text-navy-900 sm:text-base">{conclusion}</p>
        {points && points.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3 text-base leading-[1.8] text-ink">
                <span className="mt-[6px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white" aria-hidden="true">
                  <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
                    <path d="m3 6 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
