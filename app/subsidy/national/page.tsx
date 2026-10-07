import { getPostsForPillar } from "@/lib/blog";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { nationalPrograms, getSubsidy, statusLabel } from "@/data/subsidies";
import { TOKYO_DR_ADDON } from "@/data/subsidies/tokyo";
import { reveal } from "@/lib/reveal";
import { faqsByIds } from "@/data/faq";
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
import { AuthorBox } from "@/components/blog/AuthorBox";
import { images } from "@/data/images";
import { StaffTip } from "@/components/ui/StaffTip";
import { routeUpdatedAt } from "@/lib/routes";

const PATH = "/subsidy/national";

export const metadata: Metadata = buildMetadata({
  title: "国の太陽光・蓄電池補助金2026｜DR補助金・CEV補助金の現状",
  description:
    "国の家庭用蓄電池補助金（DR家庭用蓄電池事業）は2026年5月29日に、V2HのCEV補助金は8月27日に受付終了。みらいエコ住宅2026は蓄電池96,000円/戸で太陽光は対象外。2026年10月1日時点の公募状況と次回の見通しを整理。",
  path: PATH,
  keywords: ["太陽光 補助金 国 2026", "蓄電池 補助金 国", "DR補助金 2026", "CEV補助金 V2H", "みらいエコ住宅2026 蓄電池"],
  type: "article",
  modifiedTime: routeUpdatedAt(PATH),
});

export default function NationalSubsidyPage() {
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "補助金", href: "/subsidy" },
    { name: "国の太陽光・蓄電池関連補助制度", href: PATH },
  ];
  const faqItems = faqsByIds(["subsidy-national", "subsidy-combination", "subsidy-guarantee"]);
  const date = formatDateJa(siteConfig.subsidyInfoDate);
  const posts = getPostsForPillar(["v2h", "battery"], 3, { path: PATH, prefer: ["v2h-subsidy-katsushika-2026"] });
  const dr = getSubsidy("national-dr-battery")!;
  const tokyoBattery = getSubsidy("tokyo-battery")!;

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow="国の補助制度"
        title={<>国の太陽光・蓄電池関連補助制度<span className="block text-[0.7em] text-ink-2">DR補助金（DR家庭用蓄電池事業）・CEV補助金（V2H）・みらいエコ住宅2026</span></>}
        lead="国の補助金は、年度の途中で受付が終わることがあります。2026年度は、家庭用蓄電池向けの「DR補助金」（正式な名前は、DR家庭用蓄電池事業）が、5月29日に予算に達して公募を終了しました。このページでは、家庭の太陽光・蓄電池・V2Hに関係する国の制度の「今の状況」を整理します。"
        image={images.peopleStaffWoman}
      >
        <LastUpdated updatedAt={routeUpdatedAt(PATH)} publishedAt={siteConfig.publishedAt} showPublished verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <KeyPoints
          conclusion={`${date}時点で、家庭用蓄電池向けの国の補助金「DR家庭用蓄電池事業（令和7年度補正）」は2026年5月29日に予算到達で公募終了、V2H向けの「CEV補助金」は2026年8月27日に受付終了しています。住宅省エネ事業「みらいエコ住宅2026」はリフォームで蓄電池96,000円/戸が対象ですが、太陽光発電設備の設置は対象外です。次回公募は未確定です。`}
          points={[
            "DR家庭用蓄電池事業：設備費＋工事費の3/10以内、上限60万円。2026年5月29日に受付終了",
            "CEV補助金（V2H充放電設備）：2026年8月27日に受付終了。次回の公募時期・内容は未確定",
            "みらいエコ住宅2026：リフォームで蓄電池96,000円/戸。太陽光は対象外。登録事業者経由、必須工事との組み合わせ条件あり",
            "国の制度が使えない期間でも、葛飾区・東京都の助成は申請できる（受付状況は各公式サイトで要確認）",
          ]}
        />

        <StaffTip className="mx-auto mt-8 max-w-3xl" title="考え方のコツ" image={images.poseThink} tone="orange">
          国の補助金は<strong className="marker">「申請できれば上乗せ」</strong>と考え、いま受付中の区・都の制度を軸に計画するのがおすすめです。
        </StaffTip>

        <Callout tone="info" title="国の補助金は「今、申請できるか」で考える" className="mt-10">
          国の制度は、公募期間の途中で受付が終わることがあります。DR家庭用蓄電池事業は、交付申請額の合計が予算に達したため、当初の予定より早く公募を終了しました。国の制度を前提に資金計画を組むのではなく、「申請できれば上乗せ」と位置づけ、区・都の制度を軸に考えることをおすすめします。
        </Callout>

        <div className="mt-14 space-y-16">
          {nationalPrograms.map((p) => (
            <SubsidyProgramSection key={p.id} program={p} className="cv-block cv-tall" />
          ))}
        </div>

        {/* ───────── 名前の似た2つの制度 */}
        <section className="cv-block mt-16" aria-labelledby="dr-diff">
          <h2 id="dr-diff" className="border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900" {...reveal()}>
            国の「DR補助金」と、東京都の「DR実証の加算」は別の制度
          </h2>
          <p className="mt-2 max-w-3xl text-base leading-[1.9] text-ink-2">
            どちらにも「DR（デマンドレスポンス）」という言葉が付きますが、実施しているところも、金額の決まり方も違います。国のDR補助金の公募が終わっていても、東京都の蓄電池の助成は、別の制度として検討できます。
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-[#e9dfcd] bg-white p-5 shadow-card sm:p-6" {...reveal(0, "left")}>
              <p className="flex">
                <span className="rounded-full bg-navy-900 px-3 py-[2px] text-[12px] font-bold text-white">国</span>
              </p>
              <h3 className="mt-2 text-[19px] leading-[1.45] font-black text-navy-900">DR補助金（{dr.programName}）</h3>
              <dl className="mt-3 space-y-2 text-base leading-[1.8] text-ink">
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 font-bold text-ink-2">実施</dt>
                  <dd>経済産業省（執行はSII）</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 font-bold text-ink-2">金額</dt>
                  <dd>
                    {dr.amount}（{dr.maxAmount}）
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 font-bold text-ink-2">状況</dt>
                  <dd className="font-bold text-accent-text">2026年5月29日に公募終了</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-3xl border-2 border-green-200 bg-white p-5 shadow-card sm:p-6" {...reveal(120, "right")}>
              <p className="flex">
                <span className="rounded-full bg-green-600 px-3 py-[2px] text-[12px] font-bold text-white">東京都</span>
              </p>
              <h3 className="mt-2 text-[19px] leading-[1.45] font-black text-navy-900">DR実証に参加したときの加算</h3>
              <dl className="mt-3 space-y-2 text-base leading-[1.8] text-ink">
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 font-bold text-ink-2">実施</dt>
                  <dd>{tokyoBattery.issuer}。蓄電池の助成の中にある加算です</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 font-bold text-ink-2">金額</dt>
                  <dd>
                    エネルギーマネジメント機器を設置する場合は{TOKYO_DR_ADDON.withEms}、設置しない場合は{TOKYO_DR_ADDON.withoutEms}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 font-bold text-ink-2">状況</dt>
                  <dd className="font-bold text-green-700">東京都の蓄電池の助成は{statusLabel[tokyoBattery.status]}</dd>
                </div>
              </dl>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-[14px] leading-[1.9] text-ink-2">
            加算の条件と、上限の扱いは、東京都の公式案内でご確認ください。東京都の助成の金額と条件は
            <Link href="/subsidy/tokyo" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
              東京都の補助金のページ
            </Link>
            にまとめています。
          </p>
        </section>

        <section className="cv-block mt-16" aria-labelledby="local">
          <h2 id="local" className="border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900">今申請できる制度：葛飾区・東京都</h2>
          <p className="mt-2 max-w-3xl text-base leading-[1.9] text-ink-2">
            国の制度が受付終了中でも、葛飾区の「かつしかエコ助成金」と東京都（クール・ネット東京）の家庭向け助成は{date}時点で受付中です。葛飾区の制度は工事着工4週間前までの事前協議が原則必要です。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <LinkButton href="/subsidy/katsushika" variant="primary">葛飾区の補助金を見る <ArrowIcon /></LinkButton>
            <LinkButton href="/subsidy/tokyo" variant="secondary">東京都の補助金を見る <ArrowIcon /></LinkButton>
          </div>
        </section>

        <section className="cv-block mt-16" aria-labelledby="faq">
          <h2 id="faq" className="border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900">国の補助金についてよくある質問</h2>
          <FaqSection items={faqItems} withSchema className="mt-6" />
        </section>

        <SubsidyDisclaimer className="mt-12" />
        <SourceList sources={nationalPrograms.map((p) => ({ name: p.sourceName, url: p.sourceUrl, verifiedAt: p.lastVerified }))} className="mt-10" />
        <div className="mt-10">
          <AuthorBox />
        </div>
        <nav className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="関連ページ">
          {[
            { href: "/subsidy", label: "補助金の総合ページ" },
            { href: "/v2h", label: "V2Hについて" },
            { href: "/simulation", label: "補助金シミュレーター" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="rounded-2xl border border-line bg-white px-4 py-3 text-[14px] font-bold text-navy-900 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-orange-400">
              {l.label} →
            </Link>
          ))}
        </nav>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="蓄電池・V2H の補助金に関する記事" />
        </Container>
      )}

      <CtaSection
        title="国の公募が再開したときにすぐ動けるよう、先に区・都の計画を。"
        body="国の制度は公募状況が変わります。区と都の制度で計画を組み、国の公募が始まったら上乗せを検討する進め方をご提案します。相談・見積もりは無料です。"
      />

      <JsonLd data={graph(articleSchema({ path: PATH, title: "国の太陽光・蓄電池関連補助制度の現状（2026年度）", description: metadata.description as string, datePublished: "2026-10-01", dateModified: siteConfig.subsidyInfoDate, section: "補助金", sources: nationalPrograms.map((p) => ({ name: p.sourceName, url: p.sourceUrl })) }))} />
    </>
  );
}
