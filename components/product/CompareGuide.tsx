import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";

/**
 * 商品を比べるときに見る項目の一覧（項目名 → 何を表すか → 何を確かめるか）。
 * 数値の目安は書かない（仕様は製品によって異なるため。メーカーの資料で確かめてもらう）。
 * 見た目は、番号の丸がついた白い角丸カードを縦に並べる。
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
    <ol className={`space-y-3 ${className}`}>
      {items.map((it, i) => (
        <li key={it.term} className="grid gap-x-8 gap-y-3 rounded-3xl bg-white px-5 py-5 shadow-card sm:px-7 lg:grid-cols-[15rem_1fr]" {...reveal(Math.min(i, 4) * 60)}>
          <h3 className="flex items-start gap-3 text-[18px] leading-[1.5] font-black text-navy-900">
            <span className="mt-[1px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 font-en text-[14px] font-extrabold text-navy-900" aria-hidden="true">
              {i + 1}
            </span>
            {it.term}
          </h3>
          <div>
            <p className="text-base leading-[1.85] text-ink">{it.what}</p>
            <p className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-base leading-[1.85] text-ink">
              <span className="mr-2 inline-block rounded-full bg-green-600 px-3 py-[1px] text-[12px] font-bold text-white">確かめること</span>
              {it.check}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
