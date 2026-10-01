import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { tokyoSolarProgram, tokyoBatteryProgram, getSubsidy } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { simulate } from "@/lib/subsidy-calc";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { SubsidyProgramSection } from "@/components/subsidy/SubsidyProgramSection";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { Callout } from "@/components/ui/Callout";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { images } from "@/data/images";

const PATH = "/subsidy/tokyo";
const S = tokyoSolarProgram;
const B = tokyoBatteryProgram;

export const metadata: Metadata = buildMetadata({
  title: "東京都の太陽光・蓄電池補助金2026｜既存15万円/kW・蓄電池10万円/kWhの条件",
  description:
    "東京都（クール・ネット東京）の令和8年度 家庭向け太陽光・蓄電池助成を解説。既存住宅3.75kW以下15万円/kW上限45万円、新築3.6kW以下12万円/kW、蓄電池10万円/kWh原則上限120万円、2026年10月以降のSII登録要件。2026年10月1日時点。",
  path: PATH,
  keywords: ["東京都 太陽光 補助金", "東京 太陽光 補助金", "東京都 蓄電池 補助金", "クール・ネット東京 太陽光", "東京都 太陽光 助成 2026"],
  type: "article",
  modifiedTime: S.lastVerified,
});

export default function TokyoSubsidyPage() {
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "補助金", href: "/subsidy" },
    { name: "東京都の太陽光・蓄電池補助金", href: PATH },
  ];
  const ex = getSubsidy("tokyo-solar-existing")!;
  const nw = getSubsidy("tokyo-solar-new")!;
  const bt = getSubsidy("tokyo-battery")!;
  const solarExamples = [3, 3.75, 4, 5, 7].map((kw) => ({
    kw,
    existing: simulate({ area: "katsushika", housing: "existing", solarKw: kw, batteryKwh: 0, v2h: false, hems: false }).areas.find((a) => a.area === "tokyo")!.lines[0],
    newBuild: simulate({ area: "katsushika", housing: "new", solarKw: kw, batteryKwh: 0, v2h: false, hems: false }).areas.find((a) => a.area === "tokyo")!.lines[0],
  }));
  const batteryExamples = [5, 7, 10, 12, 15].map((kwh) => ({
    kwh,
    line: simulate({ area: "katsushika", housing: "existing", solarKw: 0, batteryKwh: kwh, v2h: false, hems: false }).areas.find((a) => a.area === "tokyo")!.lines[0],
  }));
  const faqItems = faqsByIds(["subsidy-tokyo-overview", "subsidy-tokyo-battery-sii", "subsidy-combination", "subsidy-guarantee"]);
  const posts = getPostsForPillar(["tokyo-subsidy"], 3);

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow={`東京都｜${S.fiscalYear}`}
        title={<>東京都の太陽光・蓄電池補助金<span className="block text-[0.7em] text-ink-2">クール・ネット東京の家庭向け助成（太陽光・蓄電池）</span></>}
        lead="東京都は、都内の住宅に太陽光発電や蓄電池を設置する費用の一部を助成しています。既存住宅と新築住宅で太陽光の単価が異なり、蓄電池は容量あたりの助成です。2026年10月1日以降の蓄電池の事前申込は、SII登録機器に限られます。"
        image={images.peopleStaffPoint2}
      >
        <LastUpdated updatedAt={S.lastVerified} verifiedAt={S.lastVerified} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <KeyPoints
          conclusion={`東京都の家庭向け助成は、${formatDateJa(S.lastVerified)}時点の公式情報で、太陽光が既存住宅${ex.amount}（${ex.maxAmount}）、新築住宅${nw.amount}（${nw.maxAmount}）、蓄電池が${bt.amount}（${bt.maxAmount}）です。いずれも事前申込が必要で、助成対象経費（税抜）が上限になります。`}
          points={[
            `対象者：都内の住宅に新規設置する個人等（蓄電池は機器の所有者）`,
            `太陽光：既存住宅は3.75kWを境に15万円/kW→12万円/kW、新築住宅は3.6kWを境に12万円/kW→10万円/kW（区分は容量全体に適用）`,
            `蓄電池：10万円/kWh。DR実証に参加しない場合は原則上限120万円/戸。DR参加で加算や上限の扱いが変わる`,
            `申請時期：事前申込2026年5月29日開始、交付申請兼実績報告2026年6月30日〜（太陽光は2029年3月30日まで）`,
            `注意点：2026年10月1日以降に事前申込する蓄電池はSII登録機器に限定。都・公社の同種助成との重複受給は不可`,
          ]}
        />

        <section className="mt-14" aria-labelledby="solar-ex">
          <h2 id="solar-ex" className="text-[24px] font-bold text-navy-900">太陽光：容量別の想定助成額（既存・新築）</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-[1.9] text-ink-2">
            容量区分の単価は容量全体に適用されます。たとえば既存住宅の4kWは「4kW × 12万円」で、3.75kWまでを15万円で計算するわけではありません。この表は制度のルールをそのまま計算した概算です。
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-[14px]">
              <thead>
                <tr className="bg-navy-900 text-left text-white">
                  <th className="border border-navy-800 px-3 py-2.5">容量</th>
                  <th className="border border-navy-800 px-3 py-2.5">既存住宅の想定額</th>
                  <th className="border border-navy-800 px-3 py-2.5">新築住宅の想定額</th>
                </tr>
              </thead>
              <tbody>
                {solarExamples.map((e, i) => (
                  <tr key={e.kw} className={i % 2 ? "bg-paper-2" : "bg-white"}>
                    <th scope="row" className="border border-line px-3 py-2.5 text-left font-bold text-navy-900">{e.kw}kW</th>
                    <td className="border border-line px-3 py-2.5">
                      <span className="font-bold text-navy-900">{e.existing.amount?.toLocaleString("ja-JP")}円</span>
                      <span className="ml-2 block text-[12px] text-ink-3 sm:inline">{e.existing.formula}</span>
                    </td>
                    <td className="border border-line px-3 py-2.5">
                      <span className="font-bold text-navy-900">{e.newBuild.amount?.toLocaleString("ja-JP")}円</span>
                      <span className="ml-2 block text-[12px] text-ink-3 sm:inline">{e.newBuild.formula}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-ink-3">助成対象経費（税抜）が上限になります。機能性PV認定による上乗せ、リフォーム瑕疵保険加入時の加算、陸屋根の架台・防水工事への追加助成は含んでいません。</p>
        </section>

        <section className="mt-16" aria-labelledby="battery-ex">
          <h2 id="battery-ex" className="text-[24px] font-bold text-navy-900">蓄電池：容量別の想定助成額</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-[1.9] text-ink-2">
            蓄電容量 × 10万円で計算します。DR実証に参加しない場合は原則上限120万円/戸で、助成対象経費（税抜）が上限です。実際の費用がこれを下回る場合は費用が上限になります。
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-[14px]">
              <thead>
                <tr className="bg-navy-900 text-left text-white">
                  <th className="border border-navy-800 px-3 py-2.5">蓄電容量</th>
                  <th className="border border-navy-800 px-3 py-2.5">計算式</th>
                  <th className="border border-navy-800 px-3 py-2.5">想定額（DR不参加）</th>
                </tr>
              </thead>
              <tbody>
                {batteryExamples.map((e, i) => (
                  <tr key={e.kwh} className={i % 2 ? "bg-paper-2" : "bg-white"}>
                    <th scope="row" className="border border-line px-3 py-2.5 text-left font-bold text-navy-900">{e.kwh}kWh</th>
                    <td className="border border-line px-3 py-2.5 text-[13px] text-ink-2">{e.line.formula}</td>
                    <td className="border border-line px-3 py-2.5 font-bold text-navy-900">
                      {e.line.amount?.toLocaleString("ja-JP")}円{e.line.capped && <span className="ml-1 text-[11px] font-normal text-ink-3">（上限適用）</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn" title="2026年10月1日以降の事前申込は、SII登録機器に限定" className="mt-6">
            東京都の公式案内には「令和8年10月1日以降に事前申込をする場合においては、補助対象機器としてSIIが登録している機器に限る」と記載されています。検討中の蓄電池が登録済みかどうか、型番でメーカー・施工店に確認し、SIIの登録一覧でも確かめてから事前申込を行ってください。
          </Callout>
        </section>

        <section className="mt-16" aria-labelledby="solar-detail">
          <h2 id="solar-detail" className="text-[24px] font-bold text-navy-900">太陽光：制度の詳細</h2>
          <div className="mt-6">
            <SubsidyProgramSection program={S} headingLevel="h3" />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="battery-detail">
          <h2 id="battery-detail" className="text-[24px] font-bold text-navy-900">蓄電池：制度の詳細</h2>
          <div className="mt-6">
            <SubsidyProgramSection program={B} headingLevel="h3" />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="with-katsushika">
          <h2 id="with-katsushika" className="text-[24px] font-bold text-navy-900">葛飾区の助成との関係</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-[1.9] text-ink-2">
            東京都の案内は「都および公社の他の同種の助成金との重複受給は不可」としており、区市町村の制度との併用可否には触れていません。葛飾区の公式案内にも他制度との併用に関する明記はありません。両方を検討する場合は、申請前に区の窓口とクール・ネット東京にご自宅の条件で確認してください。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <LinkButton href="/subsidy/katsushika" variant="secondary">葛飾区の補助金を見る <ArrowIcon /></LinkButton>
            <LinkButton href="/simulation" variant="ghost">区と都を分けて試算する <ArrowIcon /></LinkButton>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="faq">
          <h2 id="faq" className="text-[24px] font-bold text-navy-900">東京都の補助金についてよくある質問</h2>
          <FaqSection items={faqItems} withSchema className="mt-6" />
        </section>

        <SubsidyDisclaimer className="mt-12" dateOverride={S.lastVerified} />
        <SourceList
          sources={[
            { name: S.sourceName, url: S.sourceUrl, verifiedAt: S.lastVerified },
            { name: B.sourceName, url: B.sourceUrl, verifiedAt: B.lastVerified },
            { name: "クール・ネット東京 補助金・助成金一覧", url: "https://www.tokyo-co2down.jp/subsidy/", verifiedAt: S.lastVerified },
          ]}
          className="mt-10"
        />
        <div className="mt-10">
          <AuthorBox />
        </div>
        <nav className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="関連ページ">
          {[
            { href: "/battery", label: "家庭用蓄電池について" },
            { href: "/guide/battery-cost", label: "蓄電池の費用の考え方" },
            { href: "/subsidy/national", label: "国の補助制度" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="border border-line bg-white px-4 py-3 text-[14px] font-bold text-navy-900 hover:border-navy-900">
              {l.label} →
            </Link>
          ))}
        </nav>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="東京都の補助金に関する記事" />
        </Container>
      )}

      <CtaSection
        title="SII登録機器の確認から事前申込まで、順番を整理します。"
        body="東京都の助成は機器の登録要件と事前申込のタイミングが重要です。葛飾区の制度とあわせて、申請スケジュールを組み立てます。相談・見積もりは無料です。"
      />

      <JsonLd data={graph(articleSchema({ path: PATH, title: "東京都の太陽光・蓄電池補助金（令和8年度）", description: metadata.description as string, datePublished: "2026-10-01", dateModified: S.lastVerified }))} />
    </>
  );
}
