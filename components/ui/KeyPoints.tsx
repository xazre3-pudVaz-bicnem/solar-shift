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
    <section aria-label={title} className={`border border-navy-900 bg-white ${className}`}>
      <div className="border-b border-navy-900 bg-navy-900 px-5 py-2.5">
        <p className="text-[13px] font-bold tracking-wide text-white">{title}</p>
      </div>
      <div className="px-5 py-5">
        <p className="text-[15px] leading-[1.9] font-medium text-navy-900 sm:text-base">{conclusion}</p>
        {points && points.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-[1.8] text-ink">
                <span className="mt-[11px] h-[6px] w-[6px] shrink-0 bg-orange-500" aria-hidden="true" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
