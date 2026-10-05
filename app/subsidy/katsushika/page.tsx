import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, getSubsidy } from "@/data/subsidies";
import { combination } from "@/data/subsidies/combination";
import {
  katsushikaEligibility,
  katsushikaDocuments,
  katsushikaPreConstructionChecks,
  katsushikaOfficialQa,
  katsushikaNoticeEstimate,
  KATSUSHIKA_REPORT_DEADLINE,
  KATSUSHIKA_REPORT_WITHIN_MONTHS,
  KATSUSHIKA_PAYMENT_WEEKS,
  KATSUSHIKA_PRE_CONSULTATION_WEEKS,
} from "@/data/subsidies/katsushika-details";
import { sources as verified } from "@/data/sources";
import { faqsByIds } from "@/data/faq";
import { simulate } from "@/lib/subsidy-calc";
import { headline } from "@/lib/subsidy-headline";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { Toc } from "@/components/ui/Toc";
import { Checklist } from "@/components/ui/Checklist";
import { TableScroll } from "@/components/ui/TableScroll";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyCard } from "@/components/subsidy/SubsidyCard";
import { SubsidyMatrix } from "@/components/subsidy/SubsidyMatrix";
import { ApplicationTimeline } from "@/components/subsidy/ApplicationTimeline";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { Steps } from "@/components/ui/Steps";
import { Callout } from "@/components/ui/Callout";
import { StaffTip } from "@/components/ui/StaffTip";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema, financialIncentiveSchema } from "@/lib/schema";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { images } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * 葛飾区の補助金ページ（このサイトでいちばん大事なページ）。
 * 検索意図：「葛飾区 太陽光 補助金」「葛飾区 蓄電池 補助金」「かつしかエコ助成金」
 *
 * 構成：結論（100〜180字）→ 5つの要点 → 目次 → 詳細
 * 金額は data/subsidies、要件・必要書類・着工前の確認事項は data/subsidies/katsushika-details.ts から出す。
 * このページに金額や条件を直接書かない（年度が変わったらデータだけを更新する）。
 */
const PATH = "/subsidy/katsushika";
const P = katsushikaProgram;
/** このページの本文を最後に書き直した日 */
const UPDATED = "2026-10-02";

const solar = getSubsidy("katsushika-solar")!;
const battery = getSubsidy("katsushika-battery")!;
const addon = getSubsidy("katsushika-solar-battery-addon")!;

const DESCRIPTION = `葛飾区の太陽光・蓄電池補助金（${P.fiscalYear.split("（")[0]}かつしかエコ助成金）を公式資料で確認して解説。太陽光${solar.amount}・${solar.maxAmount}、蓄電池${battery.amount.replace("助成対象経費の", "対象経費の")}・${battery.maxAmount}、併設加算${addon.amount.replace("一律", "")}。申請の流れ、必要書類、着工前のチェックまで。`;

export const metadata: Metadata = buildMetadata({
  title: "葛飾区の太陽光・蓄電池補助金2026｜かつしかエコ助成金の金額・条件・申請",
  description: DESCRIPTION,
  path: PATH,
  keywords: ["葛飾区 太陽光 補助金", "葛飾区 太陽光発電 補助金", "葛飾区 蓄電池 補助金", "かつしかエコ助成金"],
  type: "article",
  modifiedTime: UPDATED,
});

const H2 = "border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900 sm:text-[28px]";
const LEAD = "mt-4 max-w-3xl text-base leading-[1.9] text-ink-2";
const TEXT_LINK = "font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text";

/** 冒頭の「5つの要点」の1マス */
function SummaryCell({ label, prefix, value, unit, note, wide = false }: { label: string; prefix?: string; value: string; unit: string; note: string; wide?: boolean }) {
  return (
    <li className={`flex flex-col items-center rounded-3xl border-2 border-orange-200 bg-white px-3 py-4 text-center shadow-card sm:px-4 ${wide ? "col-span-2 lg:col-span-1" : ""}`} {...reveal(0, "zoom")}>
      <p className="font-heading text-[14px] leading-[1.45] font-bold text-navy-900">{label}</p>
      <p className="mt-1.5 flex flex-wrap items-baseline justify-center gap-x-1 text-navy-900">
        {prefix && <span className="self-center rounded-md bg-navy-900 px-1.5 py-[1px] text-[12px] font-bold text-white">{prefix}</span>}
        <span className="num-xl text-[34px] text-orange-600 sm:text-[40px]">{value}</span>
        <span className="font-heading text-[14px] font-black sm:text-[15px]">{unit}</span>
      </p>
      <p className="mt-1.5 text-[13px] leading-[1.6] text-ink-2">{note}</p>
    </li>
  );
}

/** 必要書類の折りたたみ（1つ目だけ開いておく） */
function DocGroup({ title, name, items, extra, open = false }: { title: string; name: string; items: string[]; extra?: string; open?: boolean }) {
  return (
    <details className="group border-t border-line first:border-t-0" open={open}>
      <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center gap-3 bg-cream px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex-1 text-base leading-[1.5] font-bold text-navy-900">{title}</span>
        <span className="shrink-0 rounded-full bg-orange-500 px-2.5 py-[1px] text-[12px] font-bold text-navy-900">{items.length}点</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-navy-900 transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
            <path d="m3.5 6 4.5 4.5L12.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <Checklist name={name} numbered items={items.map((t) => ({ title: <span className="font-medium">{t}</span> }))} className="border-t border-line" />
      {extra && <p className="border-t border-line px-4 py-3 text-base leading-[1.8] text-ink-2 sm:px-5">{extra}</p>}
    </details>
  );
}

export default function KatsushikaSubsidyPage() {
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "補助金", href: "/subsidy" },
    { name: "葛飾区の太陽光・蓄電池補助金", href: PATH },
  ];
  const hs = headline(solar)!;
  const hb = headline(battery)!;
  const ha = headline(addon)!;
  const deadline = solar.deadline.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);

  // 太陽光：何kWで上限に届くか（上限 ÷ 単価）
  const solarCapKw = solar.rule?.kind === "perKw" && solar.rule.max ? solar.rule.max / solar.rule.unit : null;
  // 蓄電池：対象経費がいくらで上限に届くか（上限 ÷ 率）
  const batteryCapCost = battery.rule?.kind === "rate" && battery.rule.max ? Math.round(battery.rule.max / battery.rule.rate) : null;
  // 蓄電池：対象経費ごとの計算例（価格の目安ではなく、計算の仕組みを示すためのもの）
  const batteryByCost = [400000, 600000, 800000, 1000000].map((cost) => {
    const line = simulate({ area: "katsushika", housing: "existing", solarKw: 0, batteryKwh: 1, batteryCost: cost, v2h: false, hems: false })
      .areas.find((a) => a.area === "katsushika")!
      .lines.find((l) => l.subsidy.id === battery.id)!;
    return { cost, line };
  });

  const faqItems = faqsByIds([
    "subsidy-katsushika-overview",
    "subsidy-pre-consultation",
    "subsidy-combination",
    "subsidy-katsushika-addon-existing",
    "subsidy-katsushika-change",
    "subsidy-katsushika-rental",
    "subsidy-katsushika-payment",
    "subsidy-guarantee",
  ]);
  const posts = getPostsForPillar(["katsushika-subsidy"], 3, { path: PATH });

  const toc = [
    { id: "amounts", label: "助成額の一覧" },
    { id: "capacity", label: "容量別の助成額（3〜6kW・5〜10kWh）" },
    { id: "flow", label: "申請の時系列" },
    { id: "before-construction", label: "着工前のチェック" },
    { id: "documents", label: "必要書類のチェックリスト" },
    { id: "eligibility", label: "対象になる方の要件" },
    { id: "combination", label: "国・東京都の補助金との併用" },
    { id: "detail", label: "メニュー別の詳細" },
    { id: "official-qa", label: "事前協議書の書き方・提出のQ&A" },
    { id: "faq", label: "よくある質問" },
  ];

  const pageSources = [
    { name: P.sourceName, url: P.sourceUrl, verifiedAt: P.lastVerified },
    verified.katsushikaGuide,
    verified.katsushikaSolarHandbook,
    verified.katsushikaBatteryHandbook,
    verified.katsushikaQa,
    verified.katsushikaNoticePeriod,
    verified.tokyoSolarHandbook,
    verified.tokyoBatteryOutline,
    { name: tokyoSolarProgram.sourceName, url: tokyoSolarProgram.sourceUrl, verifiedAt: tokyoSolarProgram.lastVerified },
    { name: tokyoBatteryProgram.sourceName, url: tokyoBatteryProgram.sourceUrl, verifiedAt: tokyoBatteryProgram.lastVerified },
  ];

  const sourceLink = (s: { name: string; url: string }, label?: ReactNode) => (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
      {label ?? s.name}
    </a>
  );

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow={`葛飾区｜${P.fiscalYear}`}
        title={
          <>
            葛飾区の太陽光・蓄電池補助金
            <span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">かつしかエコ助成金（個人住宅用）の金額・条件・申請の流れ</span>
          </>
        }
        lead="葛飾区にお住まいの方が、太陽光発電・蓄電池・V2H・HEMSを導入するときに使える区の助成制度です。区の案内と機器別の手引きを読み、金額・申請の順番・必要書類を1ページにまとめました。"
        image={images.peopleStaffPoint}
      >
        <LastUpdated updatedAt={UPDATED} verifiedAt={P.lastVerified} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints
            conclusion={`葛飾区の「かつしかエコ助成金」は、太陽光発電が${solar.amount}（${solar.maxAmount}）、蓄電池が${battery.amount}（${battery.maxAmount}）、併設すると${addon.amount}の加算です。申込みは${solar.deadline}まで。着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに事前協議を申し込み、区の回答書が届いてから工事を始めることが条件です。`}
          />

          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5" aria-label={`かつしかエコ助成金の要点（${formatDateJa(P.lastVerified)}時点）`}>
            <SummaryCell label="太陽光発電" prefix={hs.prefix} value={String(hs.value)} unit={hs.unit} note={hs.note} />
            <SummaryCell label="蓄電池" prefix={hb.prefix} value={String(hb.value)} unit={hb.unit} note={hb.note} />
            <SummaryCell label="太陽光＋蓄電池の併設" prefix={ha.prefix} value={String(ha.value)} unit={ha.unit} note="既設の機器への併設も対象" />
            <SummaryCell label="申込期限" prefix={deadline ? `${deadline[1]}年` : undefined} value={deadline ? `${deadline[2]}/${deadline[3]}` : solar.deadline} unit="必着" note="郵送は、区に届いた日が受付日" />
            <SummaryCell label="事前協議" prefix="着工の" value={String(KATSUSHIKA_PRE_CONSULTATION_WEEKS)} unit="週間前まで" note="回答書が届いてから着工" wide />
          </ul>
          <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">
            {formatDateJa(P.lastVerified)}時点の公式情報（出典：{sourceLink(verified.katsushikaGuide, "葛飾区「かつしかエコ助成金のご案内」")}）。{combination.note}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/simulation" variant="accent" size="lg">
              わが家の条件で試算する <ArrowIcon />
            </LinkButton>
            <LinkButton href="#flow" variant="secondary" size="lg">
              申請の時系列を見る
            </LinkButton>
          </div>

          <Toc items={toc} className="mt-10" />
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-16 sm:mt-16 sm:space-y-20">
          {/* ───────── 助成額の一覧 */}
          <section id="amounts" aria-labelledby="amounts-h" className="scroll-mt-24">
            <h2 id="amounts-h" className={H2}>
              助成額の一覧（{P.fiscalYear}）
            </h2>
            <p className={LEAD}>
              個人住宅用のうち、太陽光発電・蓄電池・V2H・HEMSに関するメニューです。助成金額の1,000円未満の端数は切り捨てになります。
            </p>
            <div className="mt-6">
              <SubsidyTable menus={P.menus} />
            </div>
            <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">
              出典：{sourceLink({ name: P.sourceName, url: P.sourceUrl })}（{formatDateJa(P.lastVerified)} 確認）
            </p>
            <Callout tone="important" title="申込期間と事前協議" className="mt-6">
              <p>
                申込期間は<strong>{solar.applicationPeriod}</strong>。郵送の場合は、区に届いた日が受付日になります。
              </p>
              <p className="mt-1">
                <strong>工事着工の{KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに、事前協議の申し込みが必要</strong>です。機器付きの建売住宅を購入する場合は、建物の引渡しの{KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までです。
              </p>
            </Callout>
          </section>

          {/* ───────── 容量別 */}
          <section id="capacity" aria-labelledby="capacity-h" className="cv-block scroll-mt-24">
            <h2 id="capacity-h" className={H2} {...reveal()}>
              容量別の助成額：太陽光3〜6kW、蓄電池5〜10kWh
            </h2>
            <p className={LEAD}>
              太陽光は容量（kW）で、蓄電池は費用（助成対象経費）で金額が決まります。既存住宅の場合の早見表です。東京都の助成は別の制度なので、列を分けています。
            </p>
            <SubsidyMatrix className="mt-6" />

            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
              <div>
                <h3 id="solar" className="scroll-mt-24 text-[19px] leading-[1.5] font-black text-navy-900 sm:text-[21px]">
                  葛飾区の太陽光発電の補助金：{solar.amount}・{solar.maxAmount}
                  <span className="mt-1 block text-[15px] font-bold text-accent-text">{solarCapKw ? `${solarCapKw}kWで上限に届く` : "容量に比例"}</span>
                </h3>
                <div className="prose-ss mt-3">
                  <p>
                    葛飾区の太陽光は<strong>{solar.amount}</strong>です。{solarCapKw && (
                      <>
                        {solarCapKw}kWで{solar.maxAmount.replace("上限", "上限の")}に届くため、{solarCapKw + 1}kWを載せても区の助成額は変わりません。
                      </>
                    )}
                  </p>
                  <p>
                    対象になるのは、太陽電池の公称最大出力の合計が1kW以上のシステムです。出力は、合計を出す段階で小数点以下第3位を四捨五入します。
                  </p>
                </div>
              </div>
              <div>
                <h3 id="battery" className="scroll-mt-24 text-[19px] leading-[1.5] font-black text-navy-900 sm:text-[21px]">
                  葛飾区の蓄電池の補助金：{battery.amount}・{battery.maxAmount}
                  <span className="mt-1 block text-[15px] font-bold text-accent-text">容量ではなく、費用で決まる</span>
                </h3>
                <div className="prose-ss mt-3">
                  <p>
                    葛飾区の蓄電池は<strong>{battery.amount}</strong>（{battery.maxAmount}）です。助成対象経費は、機器の本体価格と工事代の合計です。5kWhでも10kWhでも、計算のもとになるのは容量ではなく費用です。
                  </p>
                  {batteryCapCost && (
                    <p>
                      助成対象経費が{(batteryCapCost / 10000).toLocaleString("ja-JP")}万円以上なら、{battery.maxAmount.replace("上限", "上限の")}になります。
                    </p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="mt-10 text-[19px] leading-[1.5] font-black text-navy-900 sm:text-[21px]">蓄電池：助成対象経費ごとの計算</h3>
            <TableScroll className="mt-4" label="蓄電池の助成対象経費ごとの計算（葛飾区）" hintBelow="sm">
              <table className="w-full min-w-[21rem] border-collapse bg-white text-base">
                <caption className="sr-only">蓄電池の助成対象経費ごとの、葛飾区の助成額の計算</caption>
                <thead>
                  <tr>
                    <th scope="col" className="bg-green-600 px-3 py-3 text-left text-[14px] font-bold text-white sm:px-5">助成対象経費</th>
                    <th scope="col" className="border-l border-green-700 bg-green-600 px-3 py-3 text-left text-[14px] font-bold text-white sm:px-5">計算</th>
                    <th scope="col" className="border-l border-green-700 bg-green-600 px-3 py-3 text-right text-[14px] font-bold text-white sm:px-5">葛飾区の助成額</th>
                  </tr>
                </thead>
                <tbody>
                  {batteryByCost.map(({ cost, line }) => (
                    <tr key={cost} className="odd:bg-white even:bg-green-50/60">
                      <th scope="row" className="border-t border-line px-3 py-3 text-left font-bold whitespace-nowrap text-navy-900 sm:px-5">{cost / 10000}万円のとき</th>
                      <td className="border-t border-l border-line px-3 py-3 text-[14px] text-ink-2 sm:px-5">
                        {cost / 10000}万円 × {battery.rule?.kind === "rate" ? battery.rule.rateLabel : ""}
                      </td>
                      <td className="border-t border-l border-line px-3 py-3 text-right whitespace-nowrap sm:px-5">
                        <span className="num-xl text-[18px] text-navy-900 sm:text-[21px]">{line.amount === null ? "—" : (line.amount / 10000).toLocaleString("ja-JP")}</span>
                        <span className="ml-0.5 text-[13px] font-bold text-ink-2">万円</span>
                        {line.capped && <span className="ml-1 text-[12px] font-bold text-accent-text">上限</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">
              ※ 計算の仕組みを示すための例です。蓄電池の価格の目安ではありません。実際の助成対象経費は、見積書の内訳（機器本体・工事費）で決まります。
            </p>
            <p className="mt-6">
              <Link href="/simulation" className={`inline-flex min-h-11 items-center ${TEXT_LINK}`}>
                容量や費用を入れて、わが家の条件で試算する →
              </Link>
            </p>
          </section>

          {/* ───────── 申請の時系列 */}
          <section id="flow" aria-labelledby="flow-h" className="cv-block scroll-mt-24">
            <h2 id="flow-h" className={H2} {...reveal()}>
              申請の時系列：事前協議から交付まで
            </h2>
            <p className={LEAD}>
              順番を間違えると対象外になる制度です。契約日ではなく、着工日から逆算して予定を組みます。
            </p>
            <ApplicationTimeline className="mt-8" />
            <div className="mt-12 max-w-3xl">
              <Steps
                steps={[
                  {
                    icon: "calc",
                    title: "見積もりを取り、機種と容量を決める",
                    meta: "事前協議の前",
                    body: "事前協議には、見積書の写し、パネルの割付図（蓄電池は設置予定場所の平面図）、型番の分かるカタログの写しなどが必要です。提出後の変更は原則として認められないため、機種と容量を決めてから申し込みます。",
                  },
                  {
                    icon: "mail",
                    title: "事前協議を申し込む",
                    meta: `着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前まで`,
                    body: `${solar.contact?.name ?? "区の窓口"}へ、郵送または窓口で申し込みます。区は、混雑を避けるために郵送での申請を勧めています。郵送の場合は、区に届いた日が受付日です。`,
                  },
                  {
                    icon: "doc",
                    title: "事前協議回答書が届く",
                    meta: "申込から3〜4週間程度",
                    body: "書類の審査のあと、区から回答書が郵送されます。申請の内容や添付書類によっては、目安より時間がかかることがあります。",
                  },
                  {
                    icon: "tools",
                    title: "設置工事を行う",
                    meta: "回答書の到着後",
                    body: "回答書が届いてから工事を始めます。届く前に着工すると、助成の対象外になります。",
                  },
                  {
                    icon: "stamp",
                    title: "完了報告・交付申請を提出する",
                    meta: `工事の完了から${KATSUSHIKA_REPORT_WITHIN_MONTHS}か月以内`,
                    body: `完了報告書兼助成金交付申請書と交付請求書に、領収書の写し・施工後の写真・居住確認書類などを添えて提出します。工事が完了してから${KATSUSHIKA_REPORT_WITHIN_MONTHS}か月以内に出すことが前提で、年度の最終期限は${KATSUSHIKA_REPORT_DEADLINE}（必着）です。期限を過ぎると、助成金は交付されません。`,
                  },
                  {
                    icon: "check",
                    title: "交付額確定通知書が届き、助成金が振り込まれる",
                    meta: `通知書の発送後、${KATSUSHIKA_PAYMENT_WEEKS}週間程度で支払い`,
                    body: (
                      <>
                        区は、通常3〜4週間程度で処理していると案内しています。申請が集中した場合は長くなり、令和7年度は最大で6か月程度かかったとされています。{formatDateJa(katsushikaNoticeEstimate.asOf)}時点の区の案内では、完了報告書を受け付けてから交付額確定通知書の発送まで、{katsushikaNoticeEstimate.period}です（区が随時更新。出典：
                        {sourceLink(katsushikaNoticeEstimate.source)}）。支払いは、通知書の発送後、{KATSUSHIKA_PAYMENT_WEEKS}週間程度です。
                      </>
                    ),
                  },
                ]}
              />
            </div>
            <Callout tone="warn" title="よくある落とし穴" className="mt-10 max-w-3xl">
              <ul className="list-disc space-y-1 pl-5 marker:text-orange-600">
                <li>契約を急いで、回答書が届く前に着工してしまう</li>
                <li>過去10年以内に、同じ建物・同じ種類の機器で区の助成を受けていた</li>
                <li>「納税証明書」ではなく「課税証明書」を用意してしまう</li>
                <li>申請者と、領収書・振込口座・電力会社との契約の名義が違う</li>
                <li>
                  「葛飾区から委託を受けている」と名乗る訪問販売（区は、特定の業者への営業・販売の委託も、業者の紹介もしていません。区は、複数の業者から見積もりを取ることを勧めています）
                </li>
              </ul>
            </Callout>
          </section>

          {/* ───────── 着工前のチェック */}
          <section id="before-construction" aria-labelledby="before-h" className="cv-block scroll-mt-24">
            <h2 id="before-h" className={H2} {...reveal()}>
              着工前のチェック（{katsushikaPreConstructionChecks.length}項目）
            </h2>
            <p className={LEAD}>
              工事を始める前に、次の{katsushikaPreConstructionChecks.length}つを確かめてください。1つでも外れると、助成を受けられないことがあります。
            </p>
            <Checklist
              name="before"
              className="mt-6 max-w-3xl overflow-hidden rounded-3xl bg-white shadow-card"
              items={katsushikaPreConstructionChecks.map((c) => ({ title: c.title, body: c.body }))}
            />
            <p className="mt-3 max-w-3xl text-[13px] leading-[1.8] text-ink-3">
              出典：{sourceLink(verified.katsushikaGuide)}（{formatDateJa(verified.katsushikaGuide.verifiedAt)} 確認）。チェックの状態は保存されません。
            </p>
          </section>

          {/* ───────── 必要書類 */}
          <section id="documents" aria-labelledby="documents-h" className="cv-block scroll-mt-24">
            <h2 id="documents-h" className={H2} {...reveal()}>
              必要書類のチェックリスト
            </h2>
            <p className={LEAD}>
              書類は「申し込むとき」と「工事が終わったあと」の2回に分けて出します。機器ごとに違うので、区の手引きに沿って並べました。様式は区の公式サイトから入手できます。
            </p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
              {katsushikaDocuments.map((d, di) => (
                <div key={d.equipment}>
                  <h3 className="text-[19px] leading-[1.5] font-black text-navy-900 sm:text-[21px]">{d.equipment}</h3>
                  <div className="mt-3 overflow-hidden rounded-3xl bg-white shadow-card">
                    <DocGroup title="申し込むとき（事前協議）" name={`doc-${di}-apply`} items={d.apply} extra={d.applyExtra} open={di === 0} />
                    <DocGroup title="工事が終わったあと（完了報告）" name={`doc-${di}-report`} items={d.report} />
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.8] text-ink-3">
                    出典：{sourceLink(d.source)}（{formatDateJa(d.source.verifiedAt)} 確認）
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-base leading-[1.8] text-ink-2">
              同時に2項目以上を申し込む場合、事前協議書や納税証明書などは1部で足ります。提出した書類は返却されません。V2H・HEMSの必要書類は、区の機器別の手引きをご確認ください。
            </p>
          </section>

          {/* ───────── 対象者の要件 */}
          <section id="eligibility" aria-labelledby="eligibility-h" className="cv-block scroll-mt-24">
            <h2 id="eligibility-h" className={H2} {...reveal()}>
              対象になる方の要件（{katsushikaEligibility.length}項目すべて）
            </h2>
            <p className={LEAD}>区の案内にある、助成対象者の要件です。すべてを満たす必要があります。</p>
            <ol className="mt-6 max-w-3xl divide-y divide-dashed divide-line overflow-hidden rounded-3xl bg-white shadow-card">
              {katsushikaEligibility.map((e, i) => (
                <li key={e} className="flex gap-3 px-4 py-3 text-base leading-[1.8] text-ink sm:px-5">
                  <span className="mt-[3px] w-6 shrink-0 font-en text-[14px] font-bold text-accent-text" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 max-w-3xl text-[13px] leading-[1.8] text-ink-3">
              出典：{sourceLink(verified.katsushikaGuide)}（{formatDateJa(verified.katsushikaGuide.verifiedAt)} 確認）
            </p>
          </section>

          {/* ───────── 併用 */}
          <section id="combination" aria-labelledby="combination-h" className="cv-block scroll-mt-24">
            <h2 id="combination-h" className={H2} {...reveal()}>
              国・東京都の補助金との併用
            </h2>
            <div className="prose-ss mt-4 max-w-3xl">
              <p>{combination.short}</p>
              <p>{combination.tokyo}</p>
              <p>{combination.order}</p>
              <p>{combination.noSum}</p>
            </div>
            <h3 className="mt-8 text-[19px] leading-[1.5] font-black text-navy-900 sm:text-[21px]">東京都の助成額（参考）</h3>
            <div className="mt-4">
              <SubsidyTable menus={[...tokyoSolarProgram.menus, ...tokyoBatteryProgram.menus]} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <LinkButton href="/subsidy/tokyo" variant="secondary">
                東京都の補助金を詳しく見る <ArrowIcon />
              </LinkButton>
              <LinkButton href="/subsidy/national" variant="ghost">
                国の制度の状況
              </LinkButton>
            </div>
          </section>

          {/* ───────── メニュー別の詳細 */}
          <section id="detail" aria-labelledby="detail-h" className="cv-block scroll-mt-24">
            <h2 id="detail-h" className={H2} {...reveal()}>
              メニュー別の詳細
            </h2>
            <p className={LEAD}>対象者・条件・注意点・窓口を、メニューごとにまとめています。メニュー名を押すと開きます。</p>
            <div className="mt-6 space-y-3">
              {P.menus.map((m) => (
                <SubsidyCard key={m.id} subsidy={m} id={m.id} collapsible />
              ))}
            </div>
          </section>

          {/* ───────── 区の公式 Q&A（このページにしか無い質問。構造化データにも出す） */}
          <section id="official-qa" aria-labelledby="official-qa-h" className="cv-block scroll-mt-24">
            <h2 id="official-qa-h" className={H2} {...reveal()}>
              事前協議書の書き方・提出のQ&A（葛飾区の公式資料より）
            </h2>
            <p className={LEAD}>
              葛飾区が公表している「よくあるご質問」から、個人住宅の太陽光発電・蓄電池に関係するものを抜き出しました。書類を書く前に、目を通しておくと安心です。
            </p>
            <StaffTip className="mt-6 max-w-3xl" title="日付は書かずに出す" image={images.poseIdea} tone="orange">
              事前協議書の日付は<strong className="marker">未記入のまま</strong>提出します。書き間違えたときは、二重線を引いて横に書き直します。印鑑は使いません。
            </StaffTip>
            <FaqSection items={katsushikaOfficialQa} withSchema moreLink={false} className="mt-6" />
            <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">
              出典：{sourceLink(verified.katsushikaQa)}（{formatDateJa(verified.katsushikaQa.verifiedAt)} 確認）。集合住宅・事業所についての質問は、区の資料をご覧ください。
            </p>
          </section>

          {/* ───────── FAQ */}
          <section id="faq" aria-labelledby="faq-h" className="cv-block scroll-mt-24">
            <h2 id="faq-h" className={H2} {...reveal()}>
              葛飾区の補助金についてよくある質問
            </h2>
            <FaqSection items={faqItems} withSchema className="mt-6" />
          </section>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <SubsidyDisclaimer dateOverride={P.lastVerified} />
          <SourceList sources={pageSources} className="mt-8" />
          <div className="mt-8">
            <AuthorBox />
          </div>
          <nav className="mt-10" aria-label="関連ページ">
            <h2 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">あわせて読みたい</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/simulation", label: "補助金シミュレーター", description: "容量と費用を入れて試算する" },
                { href: "/area/katsushika", label: "葛飾区の太陽光・蓄電池の相談先", description: "対応エリアと、業者選びの確認点" },
                { href: "/solar-battery", label: "太陽光＋蓄電池", description: "同時に導入するときの考え方" },
                { href: "/flow", label: "導入までの流れ", description: "相談から設置後まで" },
                { href: "/subsidy/tokyo", label: "東京都の補助金", description: "区と併用できる都の助成の金額と条件" },
                { href: "/guide/solar-payback", label: "何年で元が取れるか", description: "補助金を引いた実質の負担で試算" },
                { href: "/guide/zero-yen-solar", label: "0円ソーラーと区の助成", description: "リース・レンタルは区の助成の対象外" },
                { href: "/guide/solar-tax", label: "補助金・売電収入と税金", description: "補助金を受けた年の申告の考え方" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group flex h-full min-h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-orange-400">
                    <span className="flex-1">
                      <span className="block text-base font-bold text-navy-900">{l.label}</span>
                      <span className="mt-0.5 block text-[13px] leading-[1.6] text-ink-2">{l.description}</span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-navy-900">
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="葛飾区の補助金に関する記事" />
        </Container>
      )}

      <CtaSection
        title="葛飾区の助成は、着工4週間前の事前協議から。"
        body="見積もりの段階で、区と都の制度を整理し、事前協議の提出時期と工事の日程を一緒に組み立てます。まずは補助金のことだけ、というご相談もお受けしています。"
      />

      <JsonLd
        data={graph(
          articleSchema({
            path: PATH,
            title: "葛飾区の太陽光・蓄電池補助金（かつしかエコ助成金）2026年度の金額・条件・申請の流れ",
            description: DESCRIPTION,
            section: "補助金",
            sources: pageSources.map((s) => ({ name: s.name, url: s.url })),
            datePublished: "2026-10-01",
            dateModified: UPDATED,
            keywords: ["葛飾区 太陽光 補助金", "葛飾区 蓄電池 補助金", "かつしかエコ助成金"],
          }),
          ...P.menus.map((m) => financialIncentiveSchema(m, PATH)),
        )}
      />
    </>
  );
}
