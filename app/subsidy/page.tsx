import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, nationalPrograms, allSubsidies, getSubsidy, statusLabel } from "@/data/subsidies";
import { combination } from "@/data/subsidies/combination";
import { KATSUSHIKA_PRE_CONSULTATION_WEEKS } from "@/data/subsidies/katsushika-details";
import { faqsByIds } from "@/data/faq";
import { images } from "@/data/images";
import { reveal } from "@/lib/reveal";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { Toc } from "@/components/ui/Toc";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyMatrix } from "@/components/subsidy/SubsidyMatrix";
import { ApplicationTimeline } from "@/components/subsidy/ApplicationTimeline";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { Steps } from "@/components/ui/Steps";
import { Callout } from "@/components/ui/Callout";
import { ArrowIcon } from "@/components/ui/Button";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { SubsidyBanner } from "@/components/sections/SubsidyBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { ApplyOrderFigure } from "@/components/area/ApplyOrderFigure";
import { WardCompareTable } from "@/components/area/NeighborAreaPage";
import { routeUpdatedAt } from "@/lib/routes";

/**
 * 補助金の総合ページ。役割は「区・都・国の3つの制度の全体像と、申請の順番」。
 * 各制度の金額・条件の詳細は、それぞれのページが正本（ここには書き写さない）。
 *   葛飾区 … /subsidy/katsushika（「葛飾区 太陽光 補助金」はそちらで受ける）
 *   東京都 … /subsidy/tokyo
 *   国     … /subsidy/national
 */
const PATH = "/subsidy";
const TITLE = "太陽光・蓄電池の補助金2026｜区・都・国の3つの制度と申請の順番";
const UPDATED = routeUpdatedAt(PATH);

const s = (id: string) => getSubsidy(id)!;
const ks = s("katsushika-solar");
const kb = s("katsushika-battery");
const ka = s("katsushika-solar-battery-addon");
const tse = s("tokyo-solar-existing");
const tsn = s("tokyo-solar-new");
const tb = s("tokyo-battery");

const DESCRIPTION = `2026年度（令和8年度）の太陽光発電・蓄電池の補助金を、葛飾区・東京都・国の3つに分けて整理。それぞれの金額の決まり方、受付状況、併用の考え方、申請の順番を、公式資料で確認してまとめました。${formatDateJa(siteConfig.subsidyInfoDate)}時点。`;

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["太陽光 補助金 2026", "太陽光 蓄電池 補助金", "太陽光 蓄電池 補助金 併用"],
  type: "article",
  modifiedTime: UPDATED,
});

const H2 = "border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900 sm:text-[28px]";
const LEAD = "mt-4 max-w-3xl text-base leading-[1.9] text-ink-2";

export default function SubsidyIndexPage() {
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "補助金", href: PATH },
  ];
  const nationalMenus = nationalPrograms.flatMap((p) => p.menus);
  const nationalOpen = nationalMenus.filter((m) => m.status === "open").length;

  const layers = [
    {
      href: "/subsidy/katsushika",
      label: "葛飾区",
      title: katsushikaProgram.programName,
      body: `太陽光は${ks.amount}（${ks.maxAmount}）、蓄電池は${kb.amount}（${kb.maxAmount}）。着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに事前協議が必要です。`,
      status: statusLabel[ks.status],
      open: ks.status === "open",
    },
    {
      href: "/subsidy/tokyo",
      label: "東京都",
      title: "クール・ネット東京の家庭向け助成",
      body: `太陽光は既存住宅と新築住宅で単価が違い、蓄電池は${tb.amount.split("（")[0]}。事前申込が必要です。`,
      status: statusLabel[tse.status],
      open: tse.status === "open",
    },
    {
      href: "/subsidy/national",
      label: "国",
      title: "DR補助金・CEV補助金・みらいエコ住宅",
      body: "家庭用蓄電池とV2Hの補助金は、受付を終了しています。次回の公募と、住宅省エネ事業の扱いを整理しました。",
      status: nationalOpen > 0 ? "一部受付中" : "受付終了・要確認",
      open: false,
    },
  ];

  const faqItems = faqsByIds(["subsidy-combination", "subsidy-pre-consultation", "subsidy-national", "subsidy-guarantee"]);
  const sources = Array.from(new Map(allSubsidies.map((x) => [x.sourceUrl, { name: x.sourceName, url: x.sourceUrl, verifiedAt: x.lastVerified }])).values());
  const allSources = [...sources, ...combination.sources.map((c) => ({ name: c.name, url: c.url, verifiedAt: combination.verifiedAt }))];
  const posts = getPostsForPillar(["katsushika-subsidy", "tokyo-subsidy"], 3);

  const toc = [
    { id: "layers", label: "3つの制度（区・都・国）" },
    { id: "capacity", label: "容量別の助成額の早見表" },
    { id: "order", label: "申請の順番" },
    { id: "combination", label: "区と都の併用" },
    { id: "all", label: "制度の一覧表" },
    { id: "wards", label: "周辺の区の補助金" },
    { id: "faq", label: "よくある質問" },
  ];

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow="補助金の全体像"
        title={
          <>
            太陽光・蓄電池の補助金
            <span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">2026年度（令和8年度）区・都・国の3つの制度と申請の順番</span>
          </>
        }
        lead="太陽光発電や蓄電池の補助金は、区・都・国の3つに分かれています。金額の決まり方も、申し込む時期も、それぞれ違います。このページで全体像をつかみ、詳しい条件は各制度のページでご確認ください。"
        image={images.peopleStaffOk}
      >
        <LastUpdated updatedAt={UPDATED} publishedAt={siteConfig.publishedAt} showPublished verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints
            conclusion={`葛飾区の住宅で検討の中心になるのは、葛飾区の「${katsushikaProgram.programName.replace("（個人住宅用）", "")}」と、東京都（クール・ネット東京）の家庭向け助成の2つです。国の家庭用蓄電池とV2Hの補助金は、${formatDateJa(siteConfig.subsidyInfoDate)}時点で受付を終了しています。区と都は併用できますが、合計は助成対象経費が上限です。`}
            points={[
              `葛飾区：太陽光${ks.amount}（${ks.maxAmount}）、蓄電池${kb.amount}（${kb.maxAmount}）、併設加算${ka.amount}`,
              `東京都：太陽光は既存住宅が${tse.amount}、新築住宅が${tsn.amount}。蓄電池は${tb.amount.split("（")[0]}`,
              `申請の順番：区は着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに事前協議。都も事前申込が必要`,
            ]}
          />
          <Toc items={toc} className="mt-8" />
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-16 sm:mt-16 sm:space-y-20">
          {/* ───────── 3つの制度 */}
          <section id="layers" aria-labelledby="layers-h" className="scroll-mt-24">
            <h2 id="layers-h" className={H2}>
              補助金は、3つの制度に分かれています
            </h2>
            <p className={LEAD}>窓口も手続きも別々です。まずは、ご自宅で使える可能性がある制度を確かめます。</p>
            <ul className="mt-8 grid gap-4 lg:grid-cols-3">
              {layers.map((c, i) => {
                const tone = ["border-orange-300", "border-green-300", "border-navy-100"][i] ?? "border-line";
                const badge = ["bg-orange-500 text-navy-900", "bg-green-600 text-white", "bg-navy-900 text-white"][i] ?? "bg-navy-900 text-white";
                return (
                  <li key={c.href} {...reveal(i * 90)}>
                    <Link href={c.href} className={`group flex h-full flex-col rounded-3xl border-2 bg-white p-5 shadow-card transition-transform duration-200 hover:-translate-y-1 sm:p-6 ${tone}`}>
                      <span className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 font-heading text-[18px] leading-none font-black ${badge}`}>{c.label}</span>
                        <span className={`rounded-full px-3 py-[2px] text-[12px] font-bold ${c.open ? "bg-green-600 text-white" : "border border-line-2 bg-paper-3 text-ink-2"}`}>{c.status}</span>
                      </span>
                      <span className="mt-4 block text-[18px] leading-[1.5] font-black text-navy-900">{c.title}</span>
                      <span className="mt-2 block flex-1 text-base leading-[1.8] text-ink-2">{c.body}</span>
                      <span className="mt-4 flex items-center justify-end gap-2 text-[14px] font-bold text-navy-900">
                        詳しく見る
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-navy-900">
                          <ArrowIcon />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ───────── 容量別 */}
          <section id="capacity" aria-labelledby="capacity-h" className="cv-block scroll-mt-24">
            <h2 id="capacity-h" className={H2} {...reveal()}>
              容量別の助成額の早見表
            </h2>
            <p className={LEAD}>既存住宅に設置する場合の、容量ごとの計算です。葛飾区と東京都は別の制度なので、列を分けています。</p>
            <SubsidyMatrix className="mt-6" />
            <SubsidyDisclaimer className="mt-6" />
          </section>
        </div>
      </Container>

      <SubsidyBanner />

      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl space-y-16 sm:space-y-20">
          {/* ───────── 申請の順番 */}
          <section id="order" aria-labelledby="order-h" className="cv-block cv-tall scroll-mt-24">
            <h2 id="order-h" className={H2} {...reveal()}>
              申請は、契約日ではなく「着工日」から逆算する
            </h2>
            <p className={LEAD}>
              葛飾区の助成は、着工の{KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに事前協議を申し込み、区の回答書が届いてから工事を始めることが条件です。回答書が届く前に着工すると、対象外になります。東京都の助成も、事前申込が必要です。
            </p>
            <p className="mt-8 font-heading text-base font-bold text-navy-900">葛飾区「かつしかエコ助成金」の時系列</p>
            <ApplicationTimeline className="mt-3" />
            <div className="mt-12 max-w-3xl">
              <Steps
                steps={[
                  { icon: "search", title: "使える制度を整理する", meta: "相談のとき", body: "住宅の区分（既存・新築）、導入する設備、容量の候補から、対象になり得る制度を区・都・国の順に確かめます。" },
                  { icon: "check", title: "機器を決める", meta: "見積もりのとき", body: "区の蓄電池の助成も、東京都の蓄電池の助成（2026年10月1日以降の事前申込）も、SIIに登録されている機器が対象です。型番の登録状況を確かめてから、機器を決めます。" },
                  { icon: "stamp", title: "区の事前協議・都の事前申込", meta: `着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前まで`, body: "葛飾区へ事前協議を申し込み、東京都（クール・ネット東京）の事前申込も行います。区の回答書が届くまでは、申込受付から3〜4週間程度とされています。" },
                  { icon: "tools", title: "回答書が届いてから着工する", meta: "回答書の到着後", body: "区から事前協議回答書が届いてから、設置工事に入ります。工事のあとに、完了報告と交付申請を行います。" },
                ]}
              />
            </div>
            <p className="mt-8">
              <Link href="/subsidy/katsushika#flow" className="inline-flex min-h-11 items-center font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                葛飾区の申請の時系列・必要書類を詳しく見る →
              </Link>
            </p>
          </section>

          {/* ───────── 併用 */}
          <section id="combination" aria-labelledby="combination-h" className="cv-block scroll-mt-24">
            <h2 id="combination-h" className={H2} {...reveal()}>
              区と都は併用できます（合計は助成対象経費まで）
            </h2>
            <div className="prose-ss mt-4 max-w-3xl">
              <p>{combination.short}</p>
              <p>{combination.tokyo}</p>
              <p>{combination.order}</p>
              <p>{combination.noSum}</p>
            </div>
            <Callout tone="note" title="根拠にした公式資料" className="mt-6 max-w-3xl">
              <ul className="list-disc space-y-1 pl-5 marker:text-orange-600">
                {combination.sources.map((src) => (
                  <li key={src.id}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
                      {src.name}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[13px] text-ink-2">{formatDateJa(combination.verifiedAt)} 確認</p>
            </Callout>
          </section>

          {/* ───────── 一覧表 */}
          <section id="all" aria-labelledby="all-h" className="cv-block scroll-mt-24">
            <h2 id="all-h" className={H2} {...reveal()}>
              2026年度の制度の一覧表（区・都・国）
            </h2>
            <p className={LEAD}>各メニューの助成額・上限・事前手続き・受付状況を、1つの表にまとめました。条件の詳細は、各制度のページをご覧ください。</p>
            <div className="mt-6">
              <SubsidyTable menus={[...katsushikaProgram.menus, ...tokyoSolarProgram.menus, ...tokyoBatteryProgram.menus, ...nationalMenus]} showArea />
            </div>
          </section>

          {/* ───────── 周辺の区（区ごとに制度が違う） */}
          <section id="wards" aria-labelledby="wards-h" className="cv-block scroll-mt-24">
            <h2 id="wards-h" className={H2} {...reveal()}>
              足立区・墨田区・江戸川区の補助金
            </h2>
            <p className={LEAD}>
              区の補助金は、区ごとに金額も申請の時期も違います。葛飾区は工事の前に事前協議をしますが、足立区は設置したあとに申請します。SOLAR SHIFT が対応している区を並べました。
            </p>
            <ApplyOrderFigure className="mt-6" />
            <WardCompareTable className="mt-6" />
            <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">※ 各区の公式ページで確かめた内容です。確認した日付と条件は、区ごとのページに記載しています。金額は区ごとに見てください（合算はしていません）。</p>
          </section>

          {/* ───────── FAQ */}
          <section id="faq" aria-labelledby="faq-h" className="cv-block scroll-mt-24">
            <h2 id="faq-h" className={H2} {...reveal()}>
              補助金のよくある質問
            </h2>
            <FaqSection items={faqItems} withSchema className="mt-6" />
          </section>

          <SourceList sources={allSources} />
        </div>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="補助金に関する最新記事" />
        </Container>
      )}

      <CtaSection
        title="どの制度が使えるか、いつまでに何をするか。"
        body="住宅の条件と導入する設備から、対象になり得る制度と申請の順番を整理してお伝えします。まずは補助金のことだけ、というご相談もお受けしています。"
      />

      <JsonLd
        data={graph(
          articleSchema({
            path: PATH,
            title: TITLE,
            description: DESCRIPTION,
            datePublished: "2026-10-01",
            dateModified: UPDATED,
            section: "補助金",
            sources: allSources.map((x) => ({ name: x.name, url: x.url })),
          }),
        )}
      />
    </>
  );
}
