import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { katsushikaProgram } from "@/data/subsidies";
import { reveal } from "@/lib/reveal";

/**
 * 朱色の補助金バナー（試算への導線＋相談への導線）。
 * 「先着順」「必ずもらえる」「予算がなくなり次第終了」は書かない（区の案内に、そう書かれていないため）。
 * 区の案内で確認できる「申込期間（必着）」と「着工4週間前までの事前協議」だけを書く。
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
            <span className="inline-block rounded-full bg-cream px-5 py-1 font-heading text-[14px] font-bold text-navy-900 sm:text-[15px]">令和8年度　葛飾区・東京都の補助金</span>
          </p>
          <h2 id="subsidy-banner-h" className="mt-4 text-[25px] leading-[1.4] font-black text-white sm:text-[34px]">
            わが家の条件だと、<span className="text-marker">いくら対象</span>になる？
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-[1.8] font-bold text-white sm:text-[17px]">住宅区分と容量を選ぶと、葛飾区と東京都それぞれの想定助成額を別々に試算できます。</p>
        </div>

        {/* バナーの下端に重ねる2つのボタン */}
        <div className="relative z-10 -mt-8 flex flex-col items-stretch justify-center gap-3 px-3 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/simulation"
            className="shine group relative inline-flex h-[4.25rem] items-center justify-center gap-2 rounded-full border-[3px] border-white bg-green-600 pr-7 pl-[4.75rem] font-heading text-[20px] font-black text-white shadow-pop transition-transform duration-200 hover:-translate-y-1 sm:min-w-[19rem]"
          >
            <span className="absolute top-1/2 left-2 z-[2] flex h-[3.25rem] w-[3.25rem] -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-[11px] leading-[1.15] font-bold text-green-700">
              <span>入力は</span>
              <span className="text-[13px]">かんたん</span>
            </span>
            <span className="relative z-[2]">
              補助金を<span className="text-marker">試算</span>する
            </span>
            <span className="relative z-[2] transition-transform duration-200 group-hover:translate-x-1">
              <Chevron />
            </span>
          </Link>
          <Link
            href="/flow"
            className="group relative inline-flex h-[4.25rem] items-center justify-center gap-2 rounded-full border-[3px] border-white bg-navy-900 px-8 font-heading text-[18px] font-black text-white shadow-pop transition-transform duration-200 hover:-translate-y-1 sm:min-w-[19rem]"
          >
            <span>申請から設置までの流れ</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              <Chevron />
            </span>
          </Link>
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-[13px] leading-[1.8] text-ink-2">
          葛飾区の申込期間は{period}で、工事着工の4週間前までに事前協議が必要です（葛飾区公式案内）。
        </p>
      </Container>
    </section>
  );
}
