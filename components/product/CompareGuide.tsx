import type { ReactNode } from "react";

/**
 * 商品を比べるときに見る項目の一覧（項目名 → 何を表すか → 何を確かめるか）。
 * 数値の目安は書かない（仕様は製品によって異なるため。メーカーの資料で確かめてもらう）。
 */
export interface CompareItem {
  term: string;
  /** その項目が何を表すか */
  what: ReactNode;
  /** 見積もり・カタログで確かめること */
  check: ReactNode;
}

export function CompareGuide({ items, className = "" }: { items: CompareItem[]; className?: string }) {
  return (
    <ol className={`divide-y divide-line overflow-hidden rounded-lg border border-line bg-white ${className}`}>
      {items.map((it, i) => (
        <li key={it.term} className="grid gap-x-8 gap-y-2 px-4 py-5 sm:px-6 lg:grid-cols-[15rem_1fr]">
          <h3 className="flex gap-3 text-[18px] leading-[1.5] font-black text-navy-900">
            <span className="mt-[3px] font-en text-[14px] font-extrabold text-accent-text" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            {it.term}
          </h3>
          <div>
            <p className="text-base leading-[1.85] text-ink">{it.what}</p>
            <p className="mt-2 text-base leading-[1.85] text-ink-2">
              <span className="mr-2 font-bold text-navy-900">確かめること</span>
              {it.check}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
