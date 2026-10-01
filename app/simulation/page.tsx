import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubsidyCalculator } from "@/components/subsidy/SubsidyCalculator";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/simulation";

export const metadata: Metadata = buildMetadata({
  title: "太陽光・蓄電池 補助金シミュレーター｜葛飾区・東京都の想定助成額を試算",
  description:
    "住宅区分・太陽光の容量・蓄電池の容量・V2H・HEMSの有無を選ぶと、葛飾区（かつしかエコ助成金）と東京都（クール・ネット東京）それぞれの制度名・計算式・想定額・上限・注意点を表示。確認できていない併用は合算しません。",
  path: PATH,
  keywords: ["太陽光 補助金 シミュレーション", "蓄電池 補助金 計算", "葛飾区 太陽光 補助金 いくら", "東京都 太陽光 補助金 計算"],
});

export default function SimulationPage() {
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "補助金シミュレーター", href: PATH },
  ];
  const faqItems = faqsByIds(["subsidy-combination", "subsidy-pre-consultation", "subsidy-tokyo-battery-sii", "subsidy-guarantee"]);

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow="いくら補助される？"
        title="太陽光・蓄電池 補助金シミュレーター"
        lead="条件を選ぶと、葛飾区と東京都それぞれの制度について「制度名・計算式・想定額・上限・注意事項」を分けて表示します。国の制度は受付状況とともに参考表示します。"
        image={images.peopleWomanThink}
      >
        <LastUpdated updatedAt={siteConfig.subsidyInfoDate} verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <SubsidyCalculator infoDate={siteConfig.subsidyInfoDate} />

        <div className="mt-12 border border-line bg-paper-2 p-6 text-[14px] leading-[1.9] text-ink-2">
          <p className="text-[15px] font-bold text-navy-900">この試算の前提</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>金額は {formatDateJa(siteConfig.subsidyInfoDate)} 時点の公式情報（下記出典）をもとに、制度のルールをそのまま計算した概算です。</li>
            <li>葛飾区の蓄電池（対象経費の1/4）とV2H（本体価格の1/3）は、経費を入力しない場合は上限額で表示します。</li>
            <li>東京都の助成は助成対象経費（税抜）が上限です。DR実証参加による加算、機能性PV認定の上乗せ、陸屋根の架台・防水工事の追加助成は含んでいません。</li>
            <li>葛飾区と東京都の併用可否、併用時の上限の扱いは公式情報で明記が確認できていないため、合算していません。</li>
            <li>
              <strong>実際の対象可否・助成額は、住宅条件、機器、申請時期等で異なります。</strong>交付を保証するものではありません。
            </li>
          </ul>
          <p className="mt-3">
            制度の詳細は<Link href="/subsidy/katsushika" className="mx-1 text-navy-600 underline underline-offset-4">葛飾区の補助金</Link>・<Link href="/subsidy/tokyo" className="mx-1 text-navy-600 underline underline-offset-4">東京都の補助金</Link>のページをご覧ください。
          </p>
        </div>

        <section className="mt-14" aria-labelledby="faq">
          <h2 id="faq" className="text-[22px] font-bold text-navy-900">シミュレーターについてよくある質問</h2>
          <FaqSection items={faqItems} withSchema className="mt-5" />
        </section>

        <SubsidyDisclaimer className="mt-10" />
        <SourceList
          sources={[
            { name: katsushikaProgram.sourceName, url: katsushikaProgram.sourceUrl, verifiedAt: katsushikaProgram.lastVerified },
            { name: tokyoSolarProgram.sourceName, url: tokyoSolarProgram.sourceUrl, verifiedAt: tokyoSolarProgram.lastVerified },
            { name: tokyoBatteryProgram.sourceName, url: tokyoBatteryProgram.sourceUrl, verifiedAt: tokyoBatteryProgram.lastVerified },
          ]}
          className="mt-10"
        />
      </Container>

      <CtaSection
        title="試算結果をもとに、わが家の条件で確かめませんか。"
        body="屋根に載る容量、必要な蓄電池の容量、SII登録機器かどうか。現地調査のうえで、制度ごとの想定助成額を整理した見積もりをお出しします。相談は無料です。"
        secondary={{ href: "/subsidy/katsushika", label: "葛飾区の補助金を詳しく見る" }}
      />

      <JsonLd data={graph(webPageSchema({ path: PATH, name: "太陽光・蓄電池 補助金シミュレーター", description: metadata.description as string, dateModified: siteConfig.subsidyInfoDate }))} />
    </>
  );
}
