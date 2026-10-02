import type { ReactNode } from "react";

/**
 * AI検索・読者向けの「結論／要点」ボックス。
 * ページ冒頭に置き、100〜200文字の結論と、要点の箇条書きを構造化して出す。
 * 見た目は白地にオレンジの左罫（色面や丸いカードにしない）。
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
    <section aria-label={title} className={`border border-l-[5px] border-line border-l-orange-500 bg-white px-5 py-5 sm:px-7 sm:py-6 ${className}`}>
      <p className="font-heading text-[13px] font-bold tracking-[0.12em] text-accent-text">{title}</p>
      <p className="mt-2 text-base leading-[1.9] font-medium text-navy-900 sm:text-[17px]">{conclusion}</p>
      {points && points.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-line pt-4">
          {points.map((p, i) => (
            <li key={i} className="flex gap-3 text-base leading-[1.8] text-ink">
              <svg className="mt-[7px] h-4 w-4 shrink-0 text-orange-600" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="m3 8.5 3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
