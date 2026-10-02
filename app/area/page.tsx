import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { areas, areasWithPage, areaPageLabel, primaryAreas, secondaryAreas, plannedAreas } from "@/data/areas";
import { wardPrograms } from "@/data/ward-programs";
import { faqsByIds } from "@/data/faq";
import { images } from "@/data/images";
import { reveal } from "@/lib/reveal";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { StaffTip } from "@/components/ui/StaffTip";
import { AreaCard } from "@/components/area/AreaCard";
import { AreaMapFigure } from "@/components/area/AreaMapFigure";
import { ApplyOrderFigure } from "@/components/area/ApplyOrderFigure";
import { WardCompareTable } from "@/components/area/NeighborAreaPage";
import { Callout } from "@/components/ui/Callout";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

/**
 * 対応エリアの一覧。
 * 検索意図：自分の住所が対応エリアかを知りたい（lib/seo-map.ts）。
 *
 * - 区ごとの補助金の詳細は、各区のページへ送る。ここには「申請の順番」と早見表だけを置く。
 * - 松戸市は対応を検討中。対応エリアとは書かない。
 */
const PATH = "/area";
const WARD_VERIFIED = wardPrograms.reduce<string>((max, w) => (w.sources[0].verifiedAt > max ? w.sources[0].verifiedAt : max), "");
const SECONDARY = secondaryAreas.map((a) => a.name).join("・");
const PLANNED = plannedAreas.map((a) => a.name).join("・");
const DESC = `SOLAR SHIFT の対応エリアは、東京都葛飾区と、周辺の${SECONDARY}です。区ごとに違う太陽光・蓄電池の補助金と申請の時期を、早見表で比べられます。${PLANNED}は対応を検討中です。`;

export const metadata: Metadata = buildMetadata({
  title: "対応エリア｜葛飾区を中心に足立区・江戸川区・墨田区",
  description: DESC,
  path: PATH,
  keywords: ["SOLAR SHIFT 対応エリア", "葛飾区 周辺 太陽光 対応エリア"],
  modifiedTime: WARD_VERIFIED,
});

const H2 = "border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900 sm:text-[28px]";

export default function AreaIndexPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "対応エリア", href: PATH },
        ]}
        eyebrow="対応エリア"
        title={
          <>
            対応エリア
            <span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">葛飾区を中心に、周辺の区へ。</span>
          </>
        }
        lead={`SOLAR SHIFT の拠点は${siteConfig.company.address.city}${siteConfig.company.address.town}です。主要対応エリアは葛飾区、周辺対応エリアは${SECONDARY}です。区の補助金は、区ごとに金額も申請の時期も違います。`}
        image={images.peopleStaffPoint}
      />
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints
            conclusion={`主要対応エリアは${siteConfig.primaryArea.prefecture}${siteConfig.primaryArea.name}、周辺対応エリアは${SECONDARY}です。区の補助金は、区ごとに金額も申請の時期も違います。${plannedAreas.map((a) => `${a.prefecture}${a.name}`).join("・")}などは、対応できるかどうかを個別に確認していますので、お問い合わせください。`}
            points={[
              "葛飾区：拠点のある主要対応エリア。区内は全域に対応",
              `${SECONDARY}：区の公式ページで確かめた補助金の要点を、区ごとのページにまとめています`,
              "区ごとのページは、その区の制度を公式ページで確かめたものだけを公開します",
            ]}
          />
        </div>

        {/* ───────── 位置関係の図と、エリアのカード */}
        <section className="mx-auto mt-14 max-w-5xl" aria-labelledby="areas-h">
          <h2 id="areas-h" className={H2}>
            対応しているエリア
          </h2>
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-12">
            <AreaMapFigure className="lg:sticky lg:top-28" />
            <div className="space-y-8">
              <div>
                <h3 className="border-l-[6px] border-green-500 pl-3 text-[19px] leading-[1.35] font-black text-navy-900">主要対応エリア</h3>
                <ul className="mt-4 grid gap-4">
                  {primaryAreas.map((a) => (
                    <li key={a.slug} {...reveal()}>
                      <AreaCard area={a} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="border-l-[6px] border-green-500 pl-3 text-[19px] leading-[1.35] font-black text-navy-900">周辺対応エリア</h3>
                <ul className="mt-4 grid gap-4">
                  {secondaryAreas.map((a, i) => (
                    <li key={a.slug} {...reveal(i * 80)}>
                      <AreaCard area={a} />
                    </li>
                  ))}
                </ul>
              </div>
              {plannedAreas.length > 0 && (
                <div>
                  <h3 className="border-l-[6px] border-green-500 pl-3 text-[19px] leading-[1.35] font-black text-navy-900">対応を検討中のエリア</h3>
                  <p className="mt-2 text-[14px] leading-[1.8] text-ink-2">対応できるかどうかを、個別に確認しています。お問い合わせのときに、ご住所の地域をお知らせください。</p>
                  <ul className="mt-4 grid gap-4">
                    {plannedAreas.map((a) => (
                      <li key={a.slug} {...reveal()}>
                        <AreaCard area={a} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ───────── 区ごとの補助金の違い */}
        <section className="cv-block mx-auto mt-16 max-w-5xl sm:mt-20" aria-labelledby="compare-h">
          <h2 id="compare-h" className={H2} {...reveal()}>
            区ごとに違う、補助金の金額と申請の時期
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-[1.9] text-ink-2">
            同じ東京都内でも、区の補助金は区ごとにまったく違います。工事の前に申請する区もあれば、工事のあとに申請する区もあります。{formatDateJa(WARD_VERIFIED)}に、各区の公式ページで確かめた内容です。
          </p>
          <ApplyOrderFigure className="mt-8" />
          <WardCompareTable className="mt-6" />
          <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">
            ※ 金額は区ごとに見てください（合算はしていません）。条件の詳細と最新の受付状況は、各区の公式ページでご確認ください。東京都の助成は
            <Link href="/subsidy/tokyo" className="mx-1 inline-block py-1 text-navy-600 underline underline-offset-4">
              東京都の補助金のページ
            </Link>
            にまとめています。
          </p>
          <StaffTip className="mt-8 max-w-3xl" title="契約の前に、順番を確かめる" image={images.poseChart}>
            申請の時期を間違えると、補助金の対象から外れることがあります。お住まいの区の順番を、契約の前に確かめてください。SOLAR SHIFT でも、ご相談のときに区ごとの順番を整理してお伝えします。
          </StaffTip>
        </section>

        <div className="mx-auto mt-14 max-w-5xl">
          <Callout tone="info" title="区ごとのページの公開方針">
            区ごとのページには、その区の公式ページで確かめた制度の内容だけを載せています。地域名だけを置き換えたページは作りません。公式ページを確かめた日付は、各ページに記載しています。
          </Callout>
        </div>

        <section className="cv-block mx-auto mt-14 max-w-5xl" aria-labelledby="faq-h">
          <h2 id="faq-h" className={H2} {...reveal()}>
            対応エリアについてよくある質問
          </h2>
          <FaqSection items={faqsByIds(["service-area", "install-survey", "service-sales"])} withSchema className="mt-6" />
        </section>

        <p className="mx-auto mt-10 max-w-5xl text-[14px] leading-[1.9] text-ink-2">
          区・都・国の補助金の全体像は
          <Link href="/subsidy" className="mx-1 inline-block py-1 text-navy-600 underline underline-offset-4">
            補助金の総合ページ
          </Link>
          をご覧ください。
        </p>
      </Container>
      <CtaSection title="エリア外でも、まずはご相談ください。" body="対応可能かどうかは、ご住所と住宅の条件を伺ってから判断します。対応できない場合も、その旨を率直にお伝えします。相談は無料です。" />
      <JsonLd
        data={graph(webPageSchema({ path: PATH, name: "対応エリア", description: DESC, dateModified: WARD_VERIFIED }), {
          "@type": "ItemList",
          name: "SOLAR SHIFT 対応エリア",
          itemListElement: areas
            .filter((a) => a.status !== "planned")
            .map((a, i) => {
              const hasPage = areasWithPage.some((x) => x.slug === a.slug);
              const url = hasPage ? absoluteUrl(`/area/${a.slug}`) : undefined;
              return { "@type": "ListItem", position: i + 1, name: hasPage ? areaPageLabel(a) : `${a.prefecture}${a.name}`, ...(url ? { url } : {}) };
            }),
        })}
      />
    </>
  );
}
