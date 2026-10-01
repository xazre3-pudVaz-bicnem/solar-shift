import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { katsushikaProgram } from "@/data/subsidies";
import { reveal } from "@/lib/reveal";

/**
 * 朱色の補助金バナー（受付中の告知＋2つのCTA）。
 * 「先着順」「必ずもらえる」は書かない。葛飾区の公式注記にある
 * 「予算の状況により早期終了の可能性」だけを根拠にする。
 */
function Chevron() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SubsidyBanner({ className = "" }: { className?: string }) {
  const period = katsushikaProgram.menus[0].applicationPeriod;
  return (
    <section className={`cv-auto py-10 sm:py-14 ${className}`} aria-labelledby="subsidy-banner-h">
      <Container>
        <div className="relative rounded-[2rem] bg-cta px-5 pt-8 pb-12 text-center text-white shadow-pop sm:px-10 sm:pt-10 sm:pb-14" {...reveal(0, "zoom")}>
          <span className="absolute top-5 left-6 h-3 w-3 animate-twinkle rounded-full bg-cream" aria-hidden="true" />
          <span className="absolute top-12 right-10 h-2 w-2 animate-twinkle rounded-full bg-cream [animation-delay:1.2s]" aria-hidden="true" />
          <span className="absolute bottom-16 left-12 hidden h-2 w-2 animate-twinkle rounded-full bg-cream [animation-delay:0.6s] sm:block" aria-hidden="true" />
          <p>
            <span className="inline-block rounded-full bg-cream px-5 py-1 font-heading text-[14px] font-bold text-navy-900 sm:text-[15px]">
              令和8年度　葛飾区・東京都の補助金 受付中
            </span>
          </p>
          <h2 id="subsidy-banner-h" className="mt-4 text-[25px] leading-[1.4] font-black text-white sm:text-[34px]">
            補助金は<span className="text-marker">予算に達すると</span>受付終了です
          </h2>
          <p className="mt-2 font-heading text-[19px] font-black text-white sm:text-[22px]">あなたの家は、いくら補助される？</p>
        </div>

        {/* バナーの下端に重ねる2つのボタン */}
        <div className="relative z-10 -mt-8 flex flex-col items-stretch justify-center gap-3 px-3 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/contact"
            className="shine group relative inline-flex h-[4.25rem] items-center justify-center gap-2 rounded-full border-[3px] border-white bg-navy-900 pr-7 pl-[4.75rem] font-heading text-[20px] font-black text-white shadow-pop transition-transform duration-200 hover:-translate-y-1 sm:min-w-[19rem]"
          >
            <span className="absolute top-1/2 left-2 z-[2] flex h-[3.25rem] w-[3.25rem] -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-[11px] leading-[1.15] font-bold text-cta">
              <span>現地調査</span>
              <span className="text-[13px]">無料！</span>
            </span>
            <span className="relative z-[2]">
              まずは<span className="text-marker">無料相談</span>
            </span>
            <span className="relative z-[2] transition-transform duration-200 group-hover:translate-x-1">
              <Chevron />
            </span>
          </Link>
          <Link
            href="/simulation"
            className="group relative inline-flex h-[4.25rem] items-center justify-center gap-2 rounded-full border-[3px] border-white bg-green-600 pr-7 pl-[4.75rem] font-heading text-[20px] font-black text-white shadow-pop transition-transform duration-200 hover:-translate-y-1 sm:min-w-[19rem]"
          >
            <span className="absolute top-1/2 left-2 flex h-[3.25rem] w-[3.25rem] -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-[11px] leading-[1.15] font-bold text-green-700">
              <span>入力は</span>
              <span className="text-[13px]">かんたん</span>
            </span>
            <span>
              補助金を<span className="text-marker">試算</span>する
            </span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              <Chevron />
            </span>
          </Link>
        </div>

        <p className="mt-5 text-center text-[12px] leading-[1.8] text-ink-3">葛飾区の申込期間：{period}。予算の状況により早期終了の可能性があります（葛飾区公式案内）。</p>
        <p className="mt-3 text-center">
          <Link href="/flow" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-2 bg-white px-6 text-[14px] font-bold text-navy-900 shadow-sm hover:border-navy-900">
            申請から設置までの流れについて
            <svg className="h-3 w-3 text-green-600" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M5 3l6 5-6 5z" />
            </svg>
          </Link>
        </p>
      </Container>
    </section>
  );
}
