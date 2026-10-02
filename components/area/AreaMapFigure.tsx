import Link from "next/link";
import { reveal } from "@/lib/reveal";
import { siteConfig } from "@/lib/site";

/**
 * 対応エリアの位置関係の図（正確な地図ではなく、となり合う向きだけを示す模式図）。
 * 葛飾区を中心に、西に足立区、南西に墨田区、南に江戸川区、東に松戸市。
 *
 * - 区の丸はそれぞれのページへのリンク。松戸市は対応を検討中なので、点線の丸でリンクにしない。
 * - 動きは、順番に現れる・拠点の印がゆっくり上下する、の2つだけ（回数は決まっていて、画面内でだけ動く）。
 */
const WARD =
  "absolute flex flex-col items-center justify-center rounded-full border-[3px] border-white bg-green-100 text-center text-navy-900 shadow-card transition-transform duration-200 hover:-translate-y-1 hover:bg-green-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

export function AreaMapFigure({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      <div className="relative mx-auto aspect-[10/9] w-full max-w-[30rem]">
        {/* 川を思わせる流れ（飾り） */}
        <svg className="absolute inset-0 h-full w-full text-[#bfe3ef]" viewBox="0 0 400 360" fill="none" aria-hidden="true">
          <path d="M118 8c10 60-4 104 22 150s20 96 6 190" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray="2 18" />
          <path d="M300 4c-14 52 12 96 4 150s14 120 40 196" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray="2 18" />
        </svg>

        <Link href="/area/adachi" className={`${WARD} top-[6%] left-0 h-[32%] w-[29%]`} {...reveal(140, "pop")}>
          <span className="text-[15px] leading-[1.3] font-black sm:text-[17px]">足立区</span>
          <span className="mt-0.5 text-[11px] leading-[1.35] font-bold text-green-800 sm:text-[12px]">
            設置後に
            <br />
            申請
          </span>
        </Link>

        <Link href="/area/sumida" className={`${WARD} top-[54%] left-[3%] h-[29%] w-[26%]`} {...reveal(260, "pop")}>
          <span className="text-[15px] leading-[1.3] font-black sm:text-[17px]">墨田区</span>
          <span className="mt-0.5 text-[11px] leading-[1.35] font-bold text-green-800 sm:text-[12px]">
            着工前に
            <br />
            申請
          </span>
        </Link>

        <Link href="/area/edogawa" className={`${WARD} top-[66%] left-[40%] h-[32%] w-[29%]`} {...reveal(380, "pop")}>
          <span className="text-[15px] leading-[1.3] font-black sm:text-[17px]">江戸川区</span>
          <span className="mt-0.5 text-[11px] leading-[1.35] font-bold text-green-800 sm:text-[12px]">
            単独の補助は
            <br />
            終了
          </span>
        </Link>

        <div
          className="absolute top-[12%] right-0 flex h-[27%] w-[24%] flex-col items-center justify-center rounded-full border-[3px] border-dashed border-[#cfc4ae] bg-white/80 text-center"
          {...reveal(500, "pop")}
        >
          <span className="text-[14px] leading-[1.3] font-black text-ink-2 sm:text-[16px]">松戸市</span>
          <span className="mt-0.5 text-[11px] leading-[1.35] font-bold text-ink-2 sm:text-[12px]">対応を検討中</span>
        </div>

        <Link
          href="/area/katsushika"
          className="absolute top-[20%] left-[30%] flex h-[46%] w-[41%] flex-col items-center justify-center rounded-full border-4 border-white bg-orange-500 text-center text-navy-900 shadow-pop transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
          {...reveal(0, "pop")}
        >
          <span className="animate-bob-y" aria-hidden="true">
            <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12zm0-9.3a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z" />
            </svg>
          </span>
          <span className="text-[21px] leading-[1.25] font-black sm:text-[25px]">葛飾区</span>
          <span className="mt-0.5 text-[12px] leading-[1.4] font-bold sm:text-[13px]">
            拠点：{siteConfig.company.address.town}
            <br />
            区内は全域に対応
          </span>
        </Link>
      </div>
      <figcaption className="mt-3 text-center text-[12px] leading-[1.7] text-ink-2">となり合う向きを示した図です（正確な地図ではありません）。丸を押すと、区ごとのページへ移ります。</figcaption>
    </figure>
  );
}
