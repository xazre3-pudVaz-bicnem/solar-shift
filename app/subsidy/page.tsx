import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, nationalPrograms, allSubsidies } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { Steps } from "@/components/ui/Steps";
import { Callout } from "@/components/ui/Callout";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { images } from "@/data/images";

const PATH = "/subsidy";
const TITLE = "太陽光・蓄電池の補助金 2026年度｜葛飾区・東京都・国の制度まとめ";

export const metadata: Metadata = buildMetadata({
  title: "太陽光・蓄電池の補助金2026｜葛飾区・東京都・国の制度まとめ",
  description:
    "2026年度（令和8年度）の太陽光発電・蓄電池・V2H・HEMSの補助金を、葛飾区・東京都・国の3層で整理。金額・上限・申請時期・事前手続き・注意点を一次情報で確認して掲載。2026年10月1日時点。",
  path: PATH,
  keywords: ["太陽光 補助金 2026", "太陽光 蓄電池 補助金", "葛飾区 太陽光 補助金", "東京都 太陽光 補助金", "東京都 蓄電池 補助金"],
  type: "article",
  modifiedTime: siteConfig.subsidyInfoDate,
});

export default function SubsidyIndexPage() {
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "補助金", href: PATH },
  ];
  const faqItems = faqsByIds(["subsidy-combination", "subsidy-pre-consultation", "subsidy-national", "subsidy-guarantee"]);
  const sources = Array.from(new Map(allSubsidies.map((s) => [s.sourceUrl, { name: s.sourceName, url: s.sourceUrl, verifiedAt: s.lastVerified }])).values());
  const posts = getPostsForPillar(["katsushika-subsidy", "tokyo-subsidy"], 3);

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow="補助金総合ページ"
        title={<>太陽光・蓄電池の補助金<span className="block text-[0.7em] text-ink-2">2026年度（令和8年度）葛飾区・東京都・国</span></>}
        lead="太陽光発電や蓄電池の補助金は「区・都・国」の3層に分かれ、金額・条件・申請の順番がそれぞれ違います。このページでは3層の全体像を整理し、各制度の詳細ページへご案内します。"
        image={images.peopleStaffOk}
      >
        <LastUpdated updatedAt={siteConfig.subsidyInfoDate} verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <KeyPoints
          conclusion={`葛飾区の住宅で太陽光・蓄電池を導入する場合、検討対象になるのは「葛飾区のかつしかエコ助成金」と「東京都（クール・ネット東京）の家庭向け助成」の2つが中心です。国の家庭用蓄電池向け補助金（DR補助金）とV2H向けのCEV補助金は、${formatDateJa(siteConfig.subsidyInfoDate)}時点で受付終了しています。区の助成は工事着工4週間前までの事前協議が原則必要です。`}
          points={[
            "葛飾区：太陽光6万円/kW（上限30万円）、蓄電池は対象経費の1/4（上限20万円）、併設加算5万円、HEMS2万円、V2H本体価格の1/3（上限15万円）",
            "東京都：太陽光は既存住宅3.75kW以下15万円/kW（上限45万円）・超12万円/kW、新築3.6kW以下12万円/kW（上限36万円）・超10万円/kW。蓄電池10万円/kWh（DR不参加は原則上限120万円/戸）",
            "国：DR家庭用蓄電池事業は2026年5月29日に、CEV補助金（V2H）は2026年8月27日に受付終了。次回公募は未定",
            "区と都の併用可否は公式情報で明記が確認できていないため、申請前に各窓口へ確認する",
          ]}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { href: "/subsidy/katsushika", label: "葛飾区", title: katsushikaProgram.programName, body: "太陽光・蓄電池・HEMS・V2Hと併設加算。工事着工4週間前までの事前協議が原則。", tone: "navy" },
            { href: "/subsidy/tokyo", label: "東京都", title: "クール・ネット東京の家庭向け助成", body: "太陽光（既存・新築で単価が違う）と蓄電池（10万円/kWh）。2026年10月以降の蓄電池はSII登録機器に限定。", tone: "navy" },
            { href: "/subsidy/national", label: "国", title: "DR補助金・CEV補助金・みらいエコ住宅", body: "家庭用蓄電池とV2Hの国の補助金は受付終了中。次回公募と住宅省エネ事業の扱いを整理。", tone: "muted" },
          ].map((c) => (
            <Link key={c.href} href={c.href} className={`block border p-6 ${c.tone === "navy" ? "border-navy-900 bg-white hover:bg-navy-50" : "border-line bg-paper-2 hover:border-navy-900"}`}>
              <p className="text-[12px] font-bold tracking-wide text-accent-text">{c.label}</p>
              <h2 className="mt-2 text-[18px] leading-[1.5] font-bold text-navy-900">{c.title}</h2>
              <p className="mt-2 text-[14px] leading-[1.8] text-ink-2">{c.body}</p>
              <p className="mt-4 text-[13px] font-bold text-navy-600">詳しく見る →</p>
            </Link>
          ))}
        </div>

        <section className="mt-16" aria-labelledby="all-table">
          <h2 id="all-table" className="text-[24px] font-bold text-navy-900">2026年度の制度一覧（区・都・国）</h2>
          <p className="mt-2 text-[14px] text-ink-2">各メニューの助成額・上限・事前手続き・受付状況を1つの表にまとめました。詳細条件は各制度ページをご覧ください。</p>
          <div className="mt-6">
            <SubsidyTable menus={[...katsushikaProgram.menus, ...tokyoSolarProgram.menus, ...tokyoBatteryProgram.menus, ...nationalPrograms.flatMap((p) => p.menus)]} showArea />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="order">
          <h2 id="order" className="text-[24px] font-bold text-navy-900">申請の順番：契約日ではなく「着工日」から逆算する</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-[1.9] text-ink-2">
            補助金で最も多い失敗は「工事を始めてから申請しようとした」ケースです。葛飾区の助成は着工4週間前までの事前協議が原則で、区の回答書が届く前に着工すると対象外になります。東京都の助成も事前申込が必要です。
          </p>
          <div className="mt-8">
            <Steps
              steps={[
                { title: "使える制度を整理する", meta: "相談時", body: "住宅区分（既存・新築）、導入する設備、容量の候補から、対象になり得る制度を区・都・国の順に洗い出します。" },
                { title: "機器を決める", meta: "見積もり時", body: "東京都の蓄電池助成は2026年10月1日以降の事前申込からSII登録機器に限られます。型番の登録状況を確認してから機器を確定します。" },
                { title: "区の事前協議・都の事前申込", meta: "着工の4週間前まで", body: "葛飾区へ事前協議を申し込み、東京都（クール・ネット東京）の事前申込も行います。区の審査には数週間かかります。" },
                { title: "回答書の到着後に着工", meta: "回答書を受け取ってから", body: "区から事前協議回答書が届いてから設置工事に入ります。工事完了後、完了報告と交付申請を行います。" },
              ]}
            />
          </div>
          <Callout tone="warn" title="併用について" className="mt-8">
            区の公式案内には他制度との併用に関する明記がなく、東京都の案内は「都および公社の他の同種の助成金との重複受給は不可」としています。区と都、国との併用可否は、ご自宅の条件で各窓口に確認してください。当サイトでは確認できていない併用を前提にした合計額は出していません。
          </Callout>
        </section>

        <section className="mt-16" aria-labelledby="sim">
          <div className="border border-navy-900 bg-navy-900 p-8 text-white sm:p-10">
            <p className="text-[13px] font-bold tracking-wide text-orange-400">いくら補助される？</p>
            <h2 id="sim" className="mt-2 text-[24px] font-bold text-white">わが家の想定助成額を、制度ごとに試算する</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.9] text-navy-100/85">住宅区分・太陽光の容量・蓄電池の容量・V2H・HEMSの有無を選ぶと、葛飾区と東京都それぞれの計算式・想定額・上限・注意点を表示します。</p>
            <div className="mt-6">
              <LinkButton href="/simulation" variant="accent" size="lg">補助金シミュレーターを使う <ArrowIcon /></LinkButton>
            </div>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="faq">
          <h2 id="faq" className="text-[24px] font-bold text-navy-900">補助金についてよくある質問</h2>
          <FaqSection items={faqItems} withSchema className="mt-6" />
        </section>

        <SubsidyDisclaimer className="mt-12" />
        <SourceList sources={sources} className="mt-10" />
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="補助金に関する最新記事" />
        </Container>
      )}

      <CtaSection
        title="制度の整理から申請スケジュールまで、一緒に組み立てます。"
        body="どの制度が対象になり得るか、いつまでに何をするか。現地調査・お見積もりとあわせて、申請の順番を整理してお伝えします。相談は無料です。"
        secondary={{ href: "/subsidy/katsushika", label: "葛飾区の補助金を詳しく見る" }}
      />

      <JsonLd data={graph(articleSchema({ path: PATH, title: TITLE, description: "葛飾区・東京都・国の太陽光・蓄電池補助金の全体像", datePublished: "2026-10-01", dateModified: siteConfig.subsidyInfoDate }))} />
    </>
  );
}
