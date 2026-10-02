import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { areas, primaryAreas, secondaryAreas, plannedAreas } from "@/data/areas";
import { faqsByIds } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { AreaCard } from "@/components/area/AreaCard";
import { Callout } from "@/components/ui/Callout";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

const PATH = "/area";
const DESC = `SOLAR SHIFTの対応エリア。主要対応エリアは東京都葛飾区。周辺対応エリアは${secondaryAreas.map((a) => a.name).join("・")}。${plannedAreas.map((a) => a.name).join("・")}は対応検討中。各エリアの補助金・住宅事情・災害リスクを踏まえた提案を行います。`;

export const metadata: Metadata = buildMetadata({
  title: "対応エリア｜葛飾区を中心に足立区・江戸川区・墨田区",
  description: DESC,
  path: PATH,
  keywords: ["SOLAR SHIFT 対応エリア", "足立区 太陽光", "江戸川区 太陽光", "墨田区 太陽光"],
});

export default function AreaIndexPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "対応エリア", href: PATH },
        ]}
        eyebrow="対応エリア"
        title={<>対応エリア<span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">葛飾区を中心に、周辺エリアへ。</span></>}
        lead={`SOLAR SHIFT の拠点は${siteConfig.company.address.city}${siteConfig.company.address.town}です。主要対応エリアは葛飾区、周辺対応エリアは足立区・江戸川区・墨田区です。地域ごとの補助金・住宅事情・災害リスクを踏まえてご提案します。`}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          conclusion={`主要対応エリアは${siteConfig.primaryArea.prefecture}${siteConfig.primaryArea.name}です。${secondaryAreas.map((a) => a.name).join("・")}など葛飾区周辺にも対応しています。${plannedAreas.map((a) => `${a.prefecture}${a.name}`).join("・")}などは対応可能かどうかを個別に確認していますので、お問い合わせください。`}
          points={[
            "エリアページは、その地域の補助金・住宅事情・自治体の公式情報・災害リスク・地域FAQを揃えたものだけを公開します",
            "地域名だけを置き換えたページは作りません",
            "周辺エリアの個別ページは、独自の情報が揃い次第公開します",
          ]}
        />

        <section className="cv-block mt-12" aria-labelledby="primary-h">
          <h2 id="primary-h" className="border-l-[5px] border-orange-500 pl-3 text-[22px] leading-[1.45] font-black text-navy-900">主要対応エリア</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {primaryAreas.map((a) => <AreaCard key={a.slug} area={a} />)}
          </div>
        </section>

        <section className="cv-block mt-12" aria-labelledby="secondary-h">
          <h2 id="secondary-h" className="border-l-[5px] border-orange-500 pl-3 text-[22px] leading-[1.45] font-black text-navy-900">周辺対応エリア</h2>
          <p className="mt-2 text-[15px] text-ink-2">葛飾区に隣接する地域です。各区の助成制度の確認を含めてご相談いただけます。</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryAreas.map((a) => <AreaCard key={a.slug} area={a} />)}
          </div>
        </section>

        {plannedAreas.length > 0 && (
          <section className="cv-block mt-12" aria-labelledby="planned-h">
            <h2 id="planned-h" className="border-l-[5px] border-orange-500 pl-3 text-[22px] leading-[1.45] font-black text-navy-900">対応を検討中のエリア</h2>
            <p className="mt-2 text-[15px] text-ink-2">対応可能かどうかを個別に確認しています。お問い合わせの際にご住所のエリアをお知らせください。</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plannedAreas.map((a) => <AreaCard key={a.slug} area={a} />)}
            </div>
          </section>
        )}

        <Callout tone="info" title="エリアページの公開方針" className="mt-12">
          検索対策のために地域名だけを置き換えたページを量産することはしません。各エリアのページには、その自治体の補助金制度、住宅事情、公式情報へのリンク、災害リスク、地域特化のFAQを揃え、独自の価値があるものだけを公開します。
        </Callout>

        <section className="cv-block mt-14" aria-labelledby="faq-h">
          <h2 id="faq-h" className="border-l-[5px] border-orange-500 pl-3 text-[22px] leading-[1.45] font-black text-navy-900">対応エリアについてよくある質問</h2>
          <FaqSection items={faqsByIds(["service-area", "install-survey", "service-sales"])} withSchema className="mt-5" />
        </section>

        <p className="mt-10 text-[15px] text-ink-2">
          対応エリア全体の補助金の考え方は<Link href="/subsidy" className="mx-1 text-navy-600 underline underline-offset-4">補助金の総合ページ</Link>をご覧ください。
        </p>
      </Container>
      <CtaSection title="エリア外でも、まずはご相談ください。" body="対応可能かどうかは、ご住所と住宅の条件を伺ってから判断します。対応できない場合も、その旨を率直にお伝えします。相談は無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "対応エリア", description: DESC }), {
        "@type": "ItemList",
        name: "SOLAR SHIFT 対応エリア",
        itemListElement: areas.filter((a) => a.status !== "planned").map((a, i) => ({ "@type": "ListItem", position: i + 1, name: `${a.prefecture}${a.name}` })),
      })} />
    </>
  );
}
