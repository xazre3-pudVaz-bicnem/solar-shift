import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getSubsidy } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { Steps } from "@/components/ui/Steps";
import { Callout } from "@/components/ui/Callout";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, howToSchema, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";
import { ApplicationTimeline } from "@/components/subsidy/ApplicationTimeline";
import { StaffTip } from "@/components/ui/StaffTip";
import { reveal } from "@/lib/reveal";

const PATH = "/flow";
const DESC =
  "太陽光発電・蓄電池の導入・施工の流れ。お問い合わせ→現地調査（無料）→見積もり→葛飾区の事前協議（着工4週間前まで）・東京都の事前申込→設置工事→完了報告・交付申請→導入後サポート。申請と工事の順番を間違えないためのスケジュールの考え方。";

export const metadata: Metadata = buildMetadata({
  title: "導入・施工の流れ｜相談から申請・工事・運転開始まで",
  description: DESC,
  path: PATH,
  keywords: ["太陽光 施工 流れ", "太陽光 導入 流れ", "葛飾区 太陽光 施工", "太陽光 補助金 申請 流れ"],
});

export default function FlowPage() {
  const k = getSubsidy("katsushika-solar")!;
  const t = getSubsidy("tokyo-solar-existing")!;
  const steps = [
    {
      icon: "mail" as const,
      title: "お問い合わせ・ヒアリング",
      meta: "フォームからご連絡ください",
      body: (
        <>
          <p>屋根の形状・築年数、現在の電気代、気になっている設備（太陽光・蓄電池・V2H・HEMS）、ご希望の時期を伺います。この段階で、住宅区分（既存・新築）と導入する設備から、対象になり得る補助金を区・都・国の順に整理します。</p>
          <p className="mt-2 text-[13px] text-ink-3">訪問販売・電話営業はしていません。お問い合わせをいただいた方にだけご連絡します。</p>
        </>
      ),
    },
    {
      icon: "search" as const,
      title: "現地調査（無料）",
      meta: "屋根・分電盤・設置場所を確認",
      body: (
        <>
          <p>屋根の向き・勾配・面積・材質・下地の状態、周囲の建物や樹木による影、分電盤の状況、蓄電池・V2H機器の設置スペースと搬入経路を確認します。</p>
          <p>葛飾区のように水害リスクのある地域では、ハザードマップの浸水想定と照らし合わせて機器の設置高さも検討します。</p>
        </>
      ),
    },
    {
      icon: "calc" as const,
      title: "ご提案・お見積もり",
      meta: "内訳を分けた見積もりと、制度ごとの想定助成額",
      body: (
        <>
          <p>容量の候補を複数お出しし、パネル・パワーコンディショナ・架台・工事費・足場・申請手続きの内訳を分けた見積もりをお渡しします。葛飾区・東京都それぞれの想定助成額は別紙で整理し、合算はしません。</p>
          <p>東京都の蓄電池助成を使う場合は、この段階で機種がSII登録機器かどうかを確認します（2026年10月1日以降の事前申込はSII登録機器に限定）。</p>
        </>
      ),
    },
    {
      icon: "handshake" as const,
      title: "ご契約",
      meta: "内容と日程を確認してから",
      body: <p>見積もり内容・保証・工事日程・補助金の申請スケジュールを確認のうえ、ご契約いただきます。契約を急かすことはありません。補助金の交付は工事完了後の実績報告を経て行われるため、支払いの流れも事前に説明します。</p>,
    },
    {
      icon: "stamp" as const,
      title: "補助金の事前手続き",
      meta: `葛飾区：工事着工の4週間前までに事前協議／東京都：事前申込`,
      body: (
        <>
          <p>葛飾区の「かつしかエコ助成金」は、<strong>原則として工事着工の4週間前までに事前協議</strong>が必要です。区の審査後に郵送される事前協議回答書が届いてから工事に入ります。東京都（クール・ネット東京）の助成も事前申込が必要です。</p>
          <p>必要書類（見積書・機器の仕様書など）の準備をサポートします。年度末は申請が集中しやすいため、余裕を持ったスケジュールを組みます。</p>
        </>
      ),
    },
    {
      icon: "tools" as const,
      title: "設置工事",
      meta: "区の回答書が届いてから着工",
      body: (
        <>
          <p>足場の設置、パネル・架台の取り付け、パワーコンディショナ・蓄電池・分電盤の電気工事、電力会社との系統連系を行います。工事期間は屋根条件と設備構成によって変わります。</p>
          <p>工事中の疑問はその場でお答えします。近隣への配慮（足場・搬入・騒音）も事前にご説明します。</p>
        </>
      ),
    },
    {
      icon: "doc" as const,
      title: "完了報告・交付申請",
      meta: "工事完了後",
      body: <p>区・都それぞれの完了報告と交付申請の書類を準備します。審査後、交付額確定の通知があり、助成金が交付されます。申請の集中時期は通知までに時間がかかる場合があります。</p>,
    },
    {
      icon: "support" as const,
      title: "運転開始・導入後サポート",
      meta: "同じ窓口で、ずっと",
      body: <p>発電状況の見方、売電の手続き、モニターの使い方をご説明します。運転開始後の発電量の異常や機器の不具合、保証の使い方についても、同じ窓口でご相談いただけます。パワーコンディショナの交換時期（一般に10〜15年程度）など、長期のメンテナンスの目安もお伝えします。</p>,
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "導入・施工の流れ", href: PATH },
        ]}
        eyebrow="導入・施工の流れ"
        title="相談から運転開始まで。申請の順番を間違えない進め方。"
        lead="太陽光・蓄電池の導入で最も多い失敗は「工事を始めてから補助金を申請しようとした」ケースです。葛飾区の助成は着工4週間前までの事前協議が原則。契約日ではなく着工日から逆算して、申請と工事を組み立てます。"
        image={images.peopleCoupleClipboard}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          conclusion="導入の流れは「お問い合わせ → 現地調査（無料）→ 見積もり → 契約 → 補助金の事前手続き → 工事 → 完了報告・交付申請 → 導入後サポート」の8段階です。葛飾区の助成は工事着工4週間前までの事前協議、東京都の助成は事前申込が必要で、どちらも区の回答・申込の前に着工すると対象外になります。相談から設置完了まで、数か月を見込んでください。"
          points={[
            "現地調査・見積もりは無料。見積もりは内訳を分け、区と都の想定助成額は別紙で整理",
            `葛飾区：着工4週間前までに事前協議 → 回答書の到着後に着工（${formatDateJa(k.lastVerified)}時点の公式情報）`,
            `東京都：事前申込が必要。2026年10月1日以降の蓄電池はSII登録機器に限定（${formatDateJa(t.lastVerified)}時点）`,
            "年度末は申請が集中するため、早めの相談が安全",
          ]}
        />

        <h2 className="mt-14 text-center font-heading text-[26px] leading-[1.3] font-black text-navy-900 sm:text-[36px]" {...reveal()}>
          設置までの
          <span className="num-xl mx-2 text-[60px] text-orange-600 sm:text-[80px]">{steps.length}</span>
          <span className="font-en font-extrabold text-orange-600">STEP</span>
        </h2>
        <div className="cv-block cv-tall mx-auto mt-10 max-w-3xl">
          <Steps steps={steps} />
        </div>

        <section className="mt-16 rounded-[2rem] bg-cream p-5 sm:p-8" aria-labelledby="timeline-h">
          <h2 id="timeline-h" className="text-center text-[22px] font-black text-navy-900 sm:text-[26px]">
            葛飾区の助成を使うときの<span className="marker">申請の時系列</span>
          </h2>
          <p className="mt-2 text-center text-[13px] text-ink-2">朱色のところが、順番を間違えやすいポイントです。</p>
          <div className="mt-6">
            <ApplicationTimeline />
          </div>
        </section>
        <StaffTip className="mx-auto mt-8 max-w-3xl" title="覚えておくこと" image={images.poseIdea} tone="orange">
          基準は契約日ではなく<strong className="marker">着工日</strong>です。工事を希望する日から逆算して、事前協議の申し込み日を決めます。
        </StaffTip>

        <Callout tone="warn" title="スケジュールの考え方" className="mt-12">
          <ul className="list-disc space-y-1 pl-5">
            <li>区の事前協議には審査期間がかかり、回答書が届くまで着工できません。工事希望日から逆算して、少なくとも4週間＋審査期間の余裕を見ます。</li>
            <li>機器の納期、足場の手配、電力会社の系統連系の手続きにも時間がかかります。</li>
            <li>葛飾区の申込期間は{k.applicationPeriod}ですが、予算の状況により早期終了の可能性があります。</li>
          </ul>
        </Callout>

        <section className="cv-block mt-16" aria-labelledby="faq-h">
          <h2 id="faq-h" className="border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900">流れについてよくある質問</h2>
          <FaqSection items={faqsByIds(["install-period", "install-survey", "subsidy-pre-consultation", "subsidy-combination"])} withSchema className="mt-6" />
        </section>

        <SubsidyDisclaimer className="mt-12" />

        <nav className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="関連ページ">
          {[
            { href: "/subsidy/katsushika", label: "葛飾区の補助金" },
            { href: "/subsidy/tokyo", label: "東京都の補助金" },
            { href: "/guide/solar-cost", label: "太陽光発電の費用" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="rounded-2xl border border-line bg-white px-4 py-3 text-[14px] font-bold text-navy-900 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-orange-400">
              {l.label} →
            </Link>
          ))}
        </nav>
      </Container>
      <CtaSection
        title="いつまでに何をすればいいか。最初の相談で整理します。"
        body={`ご希望の時期から逆算して、申請と工事のスケジュールを組み立てます。現地調査・お見積もりは無料です。${siteConfig.primaryArea.name}を中心に周辺エリアにも対応しています。`}
      />
      <JsonLd
        data={graph(
          webPageSchema({ path: PATH, name: "導入・施工の流れ", description: DESC, dateModified: siteConfig.subsidyInfoDate }),
          howToSchema({
            path: PATH,
            name: "太陽光発電・蓄電池を導入する流れ（相談から運転開始まで）",
            description: DESC,
            steps: steps.map((s) => ({ name: s.title, text: s.meta })),
          }),
        )}
      />
    </>
  );
}
