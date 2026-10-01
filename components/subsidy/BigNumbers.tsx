import Image from "next/image";
import type { Subsidy } from "@/data/subsidies";
import type { SiteImage } from "@/data/images";
import { headline } from "@/lib/subsidy-headline";
import { CountUp } from "@/components/ui/CountUp";
import { reveal } from "@/lib/reveal";

/**
 * 補助金額を「大きな数字」で見せるタイル。
 * 数字は data/subsidies の計算ルールから作る（lib/subsidy-headline.ts）。ページに金額を直書きしない。
 * スマホでも2列で並べる（1列だとページが長くなりすぎる）。
 */
export interface BigNumberItem {
  subsidy: Subsidy;
  /** タイルの見出し（省略時はメニュー名） */
  label?: string;
  icon?: SiteImage;
}

export function BigNumbers({
  items,
  tone = "orange",
  columns = 3,
  className = "",
}: {
  items: BigNumberItem[];
  tone?: "orange" | "green";
  columns?: 2 | 3;
  className?: string;
}) {
  const color = tone === "orange" ? "text-orange-600" : "text-green-600";
  const ring = tone === "orange" ? "border-orange-200" : "border-green-200";
  const grid = columns === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2";
  return (
    <ul className={`grid gap-2.5 sm:gap-4 ${grid} ${className}`}>
      {items.map(({ subsidy: s, label, icon }, i) => {
        const h = headline(s);
        // 奇数個のとき、スマホの2列で最後の1枚が半端にならないよう横いっぱいにする
        const lastOdd = items.length % 2 === 1 && i === items.length - 1;
        return (
          <li
            key={s.id}
            className={`flex flex-col items-center rounded-3xl border-2 bg-white px-2.5 pt-3.5 pb-3 text-center shadow-card sm:px-5 sm:pt-5 sm:pb-4 ${ring} ${lastOdd ? "col-span-2 lg:col-span-1" : ""}`}
            {...reveal((i % 3) * 70, "zoom")}
          >
            <p className="flex min-h-[2.6rem] items-center justify-center gap-1.5 font-heading text-[13px] leading-[1.35] font-bold text-navy-900 sm:min-h-0 sm:gap-2 sm:text-[16px]">
              {icon && <Image src={icon.src} alt="" width={64} height={64} className="h-8 w-8 shrink-0 sm:h-11 sm:w-11" />}
              <span>{label ?? s.name}</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-baseline justify-center gap-x-1 text-navy-900 sm:mt-2">
              {h ? (
                <>
                  {h.prefix && <span className="self-center rounded-md bg-navy-900 px-1.5 py-[1px] text-[11px] font-bold text-white sm:text-[12px]">{h.prefix}</span>}
                  <CountUp value={h.value} decimals={h.decimals} className={`num-xl text-[38px] sm:text-[56px] ${color}`} />
                  <span className="font-heading text-[13px] font-black sm:text-[18px]">{h.unit}</span>
                </>
              ) : (
                <span className="font-heading text-[16px] font-black sm:text-[18px]">{s.amount}</span>
              )}
            </p>
            <p className="mt-1.5 text-[11px] leading-[1.5] text-ink-3 sm:mt-2 sm:text-[12px]">{h ? h.note : s.maxAmount}</p>
          </li>
        );
      })}
    </ul>
  );
}
