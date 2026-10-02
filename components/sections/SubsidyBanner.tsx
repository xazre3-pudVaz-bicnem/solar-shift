import { Container } from "@/components/ui/Container";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { katsushikaProgram } from "@/data/subsidies";
import { reveal } from "@/lib/reveal";

/**
 * 補助金の受付状況と、試算への導線。ネイビーの帯に文章と、操作を2つまで置く。
 * 「先着順」「必ずもらえる」「予算がなくなり次第終了」は書かない（区の案内に、そう書かれていないため）。
 * 区の案内で確認できる「申込期間（必着）」と「着工4週間前までの事前協議」だけを書く。
 */
export function SubsidyBanner({ className = "" }: { className?: string }) {
  const period = katsushikaProgram.menus[0].applicationPeriod;
  return (
    <section className={`cv-auto bg-navy-900 py-12 text-white sm:py-16 ${className}`} aria-labelledby="subsidy-banner-h">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-14" {...reveal()}>
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-3 font-heading text-[13px] font-bold tracking-[0.14em] text-orange-300">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              令和8年度　葛飾区・東京都の補助金
            </p>
            <h2 id="subsidy-banner-h" className="text-[24px] leading-[1.5] font-black text-white sm:text-[30px]">
              わが家の条件だと、いくら対象になる？
            </h2>
            <p className="mt-3 text-base leading-[1.9] text-navy-100">
              住宅区分と容量を選ぶと、葛飾区と東京都それぞれの想定助成額を別々に試算できます。葛飾区の申込期間は{period}で、工事着工の4週間前までに事前協議が必要です（葛飾区公式案内）。
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <LinkButton href="/simulation" variant="accent" size="lg" className="w-full sm:w-auto lg:w-72">
              補助金を試算する
              <ArrowIcon />
            </LinkButton>
            <LinkButton href="/flow" variant="white" size="lg" className="w-full sm:w-auto lg:w-72">
              申請から設置までの流れ
              <ArrowIcon />
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
