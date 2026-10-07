import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { glossary, glossaryByGroup, glossaryGroupLabel, type GlossaryGroup } from "@/data/glossary";
import { images } from "@/data/images";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { StaffTip } from "@/components/ui/StaffTip";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { CtaSection } from "@/components/sections/CtaSection";
import { GlossaryList } from "@/components/glossary/GlossaryList";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema, definedTermSetSchema } from "@/lib/schema";
import { routeUpdatedAt } from "@/lib/routes";

/**
 * 用語集。
 * 検索意図：見積書・区の案内・申請書類に出てくる言葉の意味を、短く確かめたい
 * （「事前協議 とは」「併設加算 とは」「卒FIT とは」「自立運転 とは」など）。
 *
 * - 説明は data/glossary.ts にある（事実シートで確かめられる内容だけ）。ここには文章を書かない。
 * - くわしい説明は、各用語のリンク先のページが受ける。用語集は、意味を短く伝えて、そこへ送る。
 */
const PATH = "/glossary";
const TITLE = "太陽光・蓄電池・補助金の用語集｜見積書と区の案内に出てくることば";
const DESC = `かつしかエコ助成金の事前協議・併設加算、FIT・卒FIT、パワーコンディショナ、自立運転など、太陽光発電と蓄電池の見積書・申請書類に出てくる言葉${glossary.length}語を、公式資料をもとにやさしく解説します。`;
const ORDER: GlossaryGroup[] = ["subsidy", "selling", "equipment", "contract"];
const ICONS: Record<GlossaryGroup, (typeof images)[keyof typeof images]> = {
  subsidy: images.iconGHandHouseYen,
  selling: images.iconGBillDown,
  equipment: images.iconGHouseBattery,
  contract: images.iconGClipboardHouse,
};

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESC,
  path: PATH,
  keywords: ["太陽光 用語集", "蓄電池 用語", "事前協議 とは", "併設加算 とは", "卒FIT とは"],
  modifiedTime: routeUpdatedAt(PATH),
});

export default function GlossaryPage() {
  const groups = ORDER.map((key) => ({
    key,
    label: glossaryGroupLabel[key],
    icon: { src: ICONS[key].src, width: ICONS[key].width, height: ICONS[key].height },
    terms: glossaryByGroup(key).map((t) => ({
      id: t.id,
      term: t.term,
      reading: t.reading,
      definition: t.definition,
      link: t.link,
      source: t.source ? { name: t.source.name, url: t.source.url } : undefined,
    })),
  }));

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "導入ガイド", href: "/guide" },
          { name: "用語集", href: PATH },
        ]}
        eyebrow="用語集"
        title={
          <>
            太陽光・蓄電池・補助金の用語集
            <span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">見積書と、区の案内に出てくることば</span>
          </>
        }
        lead={`見積書や、区の申請書類には、聞きなれない言葉が並びます。よく出てくる${glossary.length}語を、公式資料をもとに、短く言い換えました。くわしい説明は、各ページへつないでいます。`}
        image={images.poseLaptop}
      >
        <LastUpdated updatedAt={routeUpdatedAt(PATH)} verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="用語の種類" className="flex flex-wrap gap-2">
            {ORDER.map((key) => (
              <a key={key} href={`#${key}`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 py-1.5 text-[14px] font-bold text-navy-900 hover:border-orange-400 hover:bg-cream">
                {glossaryGroupLabel[key]}
                <span className="ml-1.5 font-en text-[12px] text-accent-text">{glossaryByGroup(key).length}</span>
              </a>
            ))}
          </nav>

          <StaffTip className="mt-8 max-w-3xl" title="分からない言葉は、そのままにしない" image={images.poseIdea}>
            見積書や契約書に分からない言葉があったら、<strong className="marker">契約の前</strong>に、業者に説明してもらいましょう。説明を、書面でもらっておくと安心です。
          </StaffTip>

          <div className="mt-10">
            <GlossaryList groups={groups} />
          </div>

          <SubsidyDisclaimer className="mt-14" />

          <p className="mt-8 text-[14px] leading-[1.9] text-ink-2">
            制度の全体像は
            <Link href="/subsidy" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
              補助金の総合ページ
            </Link>
            、導入前に知っておきたいことは
            <Link href="/guide" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
              導入ガイド
            </Link>
            、個別の疑問は
            <Link href="/faq" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
              よくある質問
            </Link>
            にまとめています。
          </p>
        </div>
      </Container>

      <CtaSection title="見積書の言葉が分からないときも、ご相談ください。" body="分からない言葉があれば、ご相談のときにお尋ねください。補助金のことだけのご相談もお受けしています。相談は無料です。" />

      <JsonLd
        data={graph(
          webPageSchema({ path: PATH, name: TITLE, description: DESC, type: "CollectionPage", dateModified: routeUpdatedAt(PATH) }),
          definedTermSetSchema({
            path: PATH,
            name: "太陽光・蓄電池・補助金の用語集",
            description: DESC,
            terms: glossary.map((t) => ({ id: t.id, name: t.term, description: t.definition })),
          }),
        )}
      />
    </>
  );
}
