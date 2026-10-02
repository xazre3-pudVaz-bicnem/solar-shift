import type { Subsidy } from "@/data/subsidies";
import type { SiteImage } from "@/data/images";
import { headline } from "@/lib/subsidy-headline";
import { reveal } from "@/lib/reveal";

/**
 * 補助金額を「大きな数字」で見せる一覧。罫線で区切った1つの枠の中に並べる（カードを散らさない）。
 * 数字は data/subsidies の計算ルールから作る（lib/subsidy-headline.ts）。ページに金額を直書きしない。
 * スマホでも2列で並べる（1列だとページが長くなりすぎる）。
 * icon と tone は以前の見た目の名残で、使っていない（呼び出し側を変えずに済むよう残している）。
 */
export interface BigNumberItem {
  subsidy: Subsidy;
  /** タイルの見出し（省略時はメニュー名） */
  label?: string;
  icon?: SiteImage;
}

export function BigNumbers({
  items,
  columns = 3,
  className = "",
}: {
  items: BigNumberItem[];
  tone?: "orange" | "green";
  columns?: 2 | 3;
  className?: string;
}) {
  const grid = columns === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2";
  return (
    <ul className={`grid gap-px overflow-hidden rounded-xl border border-line bg-line ${grid} ${className}`} {...reveal()}>
      {items.map(({ subsidy: s, label }, i) => {
        const h = headline(s);
        // 奇数個のとき、スマホの2列で最後の1枚が半端にならないよう横いっぱいにする
        const lastOdd = items.length % 2 === 1 && i === items.length - 1;
        return (
          <li key={s.id} className={`bg-white px-4 py-5 sm:px-6 sm:py-6 ${lastOdd ? "col-span-2 lg:col-span-1" : ""}`}>
            <p className="font-heading text-[14px] leading-[1.45] font-bold text-ink-2 sm:text-[15px]">{label ?? s.name}</p>
            <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1 text-navy-900">
              {h ? (
                <>
                  {h.prefix && <span className="text-[13px] font-bold sm:text-[15px]">{h.prefix}</span>}
                  <span className="num-xl text-[36px] text-orange-600 sm:text-[48px]">{h.value.toLocaleString("ja-JP", { minimumFractionDigits: h.decimals, maximumFractionDigits: h.decimals })}</span>
                  <span className="font-heading text-[14px] font-black sm:text-[17px]">{h.unit}</span>
                </>
              ) : (
                <span className="font-heading text-[16px] font-black sm:text-[18px]">{s.amount}</span>
              )}
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-ink-2">{h ? h.note : s.maxAmount}</p>
          </li>
        );
      })}
    </ul>
  );
}
