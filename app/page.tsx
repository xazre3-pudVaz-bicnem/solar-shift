import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig, addressWithPostal } from "@/lib/site";
import { getSubsidy, katsushikaProgram } from "@/data/subsidies";
import { primaryAreas, secondaryAreas, areasWithPage, areaPageLabel } from "@/data/areas";
import { AreaMapFigure } from "@/components/area/AreaMapFigure";
import { faqsByIds } from "@/data/faq";
import { worksInCity, publishedWorks, WORK_BILL_NOTE } from "@/data/works";
import { images } from "@/data/images";
import { getLatestPosts } from "@/lib/blog";
import { headline } from "@/lib/subsidy-headline";
import { reveal, growDelay } from "@/lib/reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { STEP_ICONS, type StepIcon } from "@/components/ui/Steps";
import { HomeHero } from "@/components/sections/HomeHero";
import { SubsidyBanner } from "@/components/sections/SubsidyBanner";
import { EnergyFlowFigure } from "@/components/sections/EnergyFlowFigure";
import { WorrySection } from "@/components/sections/WorrySection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { BigNumbers } from "@/components/subsidy/BigNumbers";
import { SubsidyMatrix } from "@/components/subsidy/SubsidyMatrix";
import { WorksCard } from "@/components/works/WorksCard";
import { MakerShowcase } from "@/components/product/MakerShowcase";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

/**
 * TOP ページ。役割は「概要を伝えて、詳しいページへ送る」こと。
 *
 * - 狙う検索語は「葛飾区 太陽光／太陽光発電／蓄電池」。補助金の詳しい話は /subsidy/katsushika、
 *   業者・施工の話は /area/katsushika に任せる（同じ説明を TOP で繰り返さない）。lib/seo-map.ts を参照。
 * - 補助金額は data/subsidies から出す（ここに数字を書かない）。区と都の金額は別々に示し、合算しない。
 * - ヒーローには CTA を置かない。最初の導線は、ヒーロー直下の「まず補助金だけ確認したい方へ」。
 * - 見た目は、クリーム地・白い角丸カード・オレンジの数字・緑の補助色。人物イラストとアイコンを各区画に添える。
 * - 運営者について書くのは、確認できていることだけ（運営会社・拠点・対応エリア・相談と現地調査が無料であること）。
 */
export const metadata: Metadata = buildMetadata({
  title: "葛飾区の太陽光発電・蓄電池なら SOLAR SHIFT｜補助金の整理から導入後まで",
  description:
    "葛飾区の太陽光発電・蓄電池の導入をサポートするSOLAR SHIFT（株式会社サイプレス運営）。葛飾区・東京都の補助金を一次情報で確認し、住まいに合う設備と申請の順番を整理します。現地調査・お見積もりは無料。",
  path: "/",
  keywords: ["葛飾区 太陽光", "葛飾区 太陽光発電", "葛飾区 蓄電池"],
  rawTitle: true,
});

const SERVICES = [
  {
    href: "/solar",
    title: "太陽光発電",
    tag: "つくる",
    body: "屋根で発電した電気を自宅で使い、余った分を売電します。屋根の向き・面積・影の影響を現地で確認します。",
    image: images.houseRoofPanelsSky,
    icon: images.iconSunPanel,
  },
  {
    href: "/battery",
    title: "家庭用蓄電池",
    tag: "ためる",
    body: "昼の電気をためて夜に使い、停電時の備えにもなります。容量と設置場所を、住まいに合わせて検討します。",
    image: images.batteryOutdoorWall,
    icon: images.iconGHouseBattery,
  },
  {
    href: "/solar-battery",
    title: "太陽光＋蓄電池",
    tag: "つくって、ためる",
    body: "つくった電気をためて使います。工事と申請を1回にまとめられ、葛飾区では併設加算の対象です。",
    image: images.houseBatteryOutdoor,
    icon: images.iconHouseBattery,
  },
] as const;

const VALUES = [
  {
    title: "補助金は、一次情報で確認します",
    body: "区・都・国の公式情報を確認し、確認した日付を明記してお伝えします。併用するときの上限や申請の順番も、公式資料で確認してお伝えします。",
    image: images.consultationDesk,
    badge: images.iconGHandHouseYen,
  },
  {
    title: "住宅ごとに、必要な設備を検討します",
    body: "屋根の形、電気の使い方、停電時にどこまで備えたいか。先に設備を決めず、住まいの条件から考えます。",
    image: images.roofPanelsFront,
    badge: images.iconGClipboardHouse,
  },
  {
    title: "葛飾区を中心に対応します",
    body: `拠点は${siteConfig.company.address.city}${siteConfig.company.address.town}です。区内の住宅地の条件と水害リスクを踏まえて、機器の設置場所まで検討します。`,
    image: images.katsushikaStreetSunset,
    badge: images.iconGHouseShield,
  },
  {
    title: "導入前から導入後まで、相談できます",
    body: "最初のご相談から、現地調査、お見積もり、補助金の申請、工事、運転開始後のご相談まで、お受けします。",
    image: images.houseDuskLights,
    badge: images.iconGHouseWrench,
  },
];

/** 導入を考えはじめたときに浮かぶ疑問（お客様の発言として書かない。答えは下の POINT にある） */
const WORRIES = [
  { em: "補助金", post: "、うちは対象になるの？" },
  { em: "申請の順番", post: "がむずかしそう…" },
  { em: "うちに必要な設備", post: "が分からない" },
  { pre: "川に近い地域だけど、", em: "設置場所", post: "は大丈夫？" },
  { pre: "導入した", em: "あとも相談", post: "できる？" },
];

const FLOW: { title: string; meta: string; icon: StepIcon }[] = [
  { title: "ご相談・ヒアリング", meta: "フォーム・お電話で", icon: "mail" },
  { title: "現地調査", meta: "無料", icon: "search" },
  { title: "ご提案・お見積もり", meta: "内訳を分けて提示", icon: "calc" },
  { title: "補助金の事前手続き", meta: "着工4週間前までに事前協議", icon: "stamp" },
  { title: "設置工事", meta: "区の回答書の到着後に着工", icon: "tools" },
  { title: "完了報告・導入後の相談", meta: "交付申請〜運転開始後", icon: "support" },
];

/** 区画の隅に置く飾りの丸。スクロールに合わせて少しずれる（対応ブラウザだけ） */
function Blob({ className }: { className: string }) {
  return <span className={`parallax-soft pointer-events-none absolute rounded-full ${className}`} aria-hidden="true" />;
}

/** 小さな線画のアイコン（「SOLAR SHIFT とは」の4項目用） */
function FactIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-navy-900 sm:h-14 sm:w-14">
      <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}

export default function HomePage() {
  const infoDate = formatDateJa(siteConfig.subsidyInfoDate);
  const s = (id: string) => getSubsidy(id)!;
  const solar = s("katsushika-solar");
  const battery = s("katsushika-battery");
  const addon = s("katsushika-solar-battery-addon");
  const hSolar = headline(solar)!;
  const hBattery = headline(battery)!;

  const reasons = [
    {
      image: images.savingsConsultationTablet,
      title: "区の助成と、都の助成がある",
      body: `葛飾区の「かつしかエコ助成金」と、東京都の家庭向けの助成があります。別々の制度のため金額は合算せず、それぞれの条件と申請の順番を確認します。`,
      href: "/subsidy/katsushika",
      label: "葛飾区の補助金",
    },
    {
      image: images.solarHomeRoofPortrait,
      title: "約26万世帯が暮らす住宅地",
      body: "屋根の向きや面積、周囲の建物の影は、一軒ごとに違います。現地で確認して、屋根に合う配置と容量を検討します。",
      href: "/area/katsushika",
      label: "葛飾区での業者選びと対応エリア",
    },
    {
      image: images.riversideTown,
      title: "川に囲まれた地域だから、備えとして",
      body: "葛飾区は荒川・中川・江戸川・新中川に囲まれ、区の半分近くが海抜ゼロメートル地帯です。機器の設置高さと、停電時の使い方まで考えます。",
      href: "/guide/blackout",
      label: "停電時の備え",
    },
  ];

  const faqItems = faqsByIds(["subsidy-katsushika-overview", "subsidy-pre-consultation", "subsidy-combination", "battery-set", "service-area"]);
  const posts = getLatestPosts(3);
  // TOP に出す施工事例：葛飾区の事例を先に。無ければ、掲載している事例から3件まで
  const katsushikaWorks = worksInCity(siteConfig.primaryArea.name);
  const homeWorks = (katsushikaWorks.length > 0 ? katsushikaWorks : publishedWorks).slice(0, 3);
  const areaText = `${primaryAreas.map((a) => a.name).join("・")}${secondaryAreas.length > 0 ? `（周辺：${secondaryAreas.map((a) => a.name).join("・")}）` : ""}`;

  const aboutFacts: { term: string; description: string; icon: ReactNode }[] = [
    { term: "運営", description: siteConfig.company.name, icon: <path d="M4 20V6l8-3 8 3v14M4 20h16M9 9h1.5M13.5 9H15M9 13h1.5M13.5 13H15M10.5 20v-3.5h3V20" /> },
    { term: "拠点", description: siteConfig.company.address.locality, icon: <path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21zM12 12.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z" /> },
    { term: "対応エリア", description: areaText, icon: <path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2zM9 5v12M15 7v12" /> },
    { term: "ご相談・現地調査", description: "無料（お見積もりも無料です）", icon: <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.5-4.5M8 10.5l1.8 1.8L13 9" /> },
  ];

  return (
    <>
      {/* ───────── 1. ヒーロー（CTA は置かない） */}
      <HomeHero
        infoDate={infoDate}
        facts={[
          { label: "太陽光発電", prefix: hSolar.prefix, value: hSolar.value, unit: hSolar.unit },
          { label: "蓄電池", prefix: hBattery.prefix, value: hBattery.value, unit: hBattery.unit },
        ]}
      />

      {/* ───────── ヒーロー直下：いちばん敷居の低い導線（文字リンクにして、強いボタンはこの後の 4 に任せる） */}
      <section aria-label="補助金の確認" className="bg-white">
        <Container className="pt-2 pb-2 sm:pt-4">
          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-3xl border-2 border-dashed border-orange-200 bg-white px-4 py-3 sm:gap-5 sm:px-6" {...reveal()}>
            <Image src={images.poseCalc.src} alt="" width={images.poseCalc.width} height={images.poseCalc.height} sizes="72px" className="hidden h-auto w-14 shrink-0 self-end sm:block" />
            <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-base leading-[1.7] text-ink-2">
                <strong className="font-heading font-black text-navy-900">まず補助金だけ確認したい方へ。</strong>
                <span className="sm:ml-1">条件を選ぶと、葛飾区と東京都の想定額を別々に試算できます。</span>
              </p>
              <Link href="/simulation" className="group inline-flex min-h-11 shrink-0 items-center gap-2 font-heading text-base font-bold text-navy-900 underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text">
                補助金シミュレーターを使う
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── 2. SOLAR SHIFT とは */}
      <section className="pt-12 pb-16 sm:pt-16 sm:pb-24" aria-labelledby="about">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="SOLAR SHIFT とは"
                title={
                  <span id="about">
                    葛飾区の太陽光発電・蓄電池を、
                    <br className="hidden sm:block" />
                    <span className="marker">補助金の整理から導入後まで</span>。
                  </span>
                }
              />
              <p className="mt-6 text-base leading-[2] text-ink" {...reveal(100)}>
                {siteConfig.name}（{siteConfig.nameJa}）は、{siteConfig.company.address.locality}の{siteConfig.company.name}
                が運営する、住宅用太陽光発電・家庭用蓄電池の導入サポートサービスです。葛飾区と東京都の補助金を一次情報で確認し、住まいの条件に合う設備と、申請の順番を一緒に整理します。
              </p>
              <div className="mt-7 flex flex-wrap gap-3" {...reveal(140)}>
                <LinkButton href="/reason" variant="secondary">
                  SOLAR SHIFT の考え方 <ArrowIcon />
                </LinkButton>
                <LinkButton href="/company" variant="ghost">
                  運営会社
                </LinkButton>
              </div>
            </div>
            <ul className="grid gap-3">
              {aboutFacts.map((f, i) => (
                <li key={f.term} className="flex items-center gap-4 rounded-3xl border-2 border-green-200 bg-white p-4 shadow-card sm:p-5" {...reveal(i * 90, "right")}>
                  <FactIcon>{f.icon}</FactIcon>
                  <p className="min-w-0">
                    <span className="block font-heading text-[13px] font-bold text-green-700">{f.term}</span>
                    <span className="mt-0.5 block text-[16px] leading-[1.6] font-bold text-navy-900 sm:text-[17px]">{f.description}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 sm:mt-20">
            <SectionHeading
              align="center"
              color="green"
              eyebrow="電気の使い方が変わります"
              title={
                <>
                  「買うだけ」から「<span className="marker">つくって、ためる</span>」へ
                </>
              }
              as="h3"
            />
            <div className="mt-10">
              <EnergyFlowFigure />
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── 3. 葛飾区の2026年度補助金（いちばん大事な数字だけ） */}
      <section className="cv-auto relative overflow-hidden bg-cream py-16 sm:py-24" aria-labelledby="subsidy">
        <Blob className="-top-20 -right-16 h-64 w-64 bg-orange-200/50" />
        <Blob className="-bottom-24 -left-20 h-72 w-72 bg-white/70" />
        <Container className="relative">
          <SectionHeading
            align="center"
            eyebrow="2026年度（令和8年度）"
            title={
              <span id="subsidy">
                葛飾区の<span className="marker">太陽光・蓄電池の補助金</span>
              </span>
            }
            lead={`葛飾区の「${katsushikaProgram.programName}」の、いちばん大事なところだけをまとめました。条件・必要書類・申請の流れは、補助金のページで説明しています。`}
          />
          <BigNumbers
            className="mt-10"
            items={[
              { subsidy: solar, label: "太陽光発電", icon: images.iconSunPanel },
              { subsidy: battery, label: "蓄電池", icon: images.iconHouseBattery },
              { subsidy: addon, label: "太陽光＋蓄電池の併設加算", icon: images.iconHouseYen },
            ]}
          />

          <div className="mx-auto mt-8 grid max-w-4xl items-end gap-3 sm:grid-cols-[6.5rem_1fr] sm:gap-5" {...reveal(0, "left")}>
            <Image src={images.poseIdea.src} alt="" width={images.poseIdea.width} height={images.poseIdea.height} sizes="112px" className="mx-auto hidden h-auto w-24 sm:block" />
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-orange-500 bg-white px-5 py-4 shadow-card">
                <dt>
                  <span className="inline-block rounded-full bg-orange-500 px-3 py-[2px] text-[12px] font-bold text-navy-900">事前の手続き</span>
                </dt>
                <dd className="mt-2 font-heading text-[17px] leading-[1.6] font-black text-navy-900">原則、工事着工の4週間前までに事前協議</dd>
              </div>
              <div className="rounded-2xl border-2 border-green-500 bg-white px-5 py-4 shadow-card">
                <dt>
                  <span className="inline-block rounded-full bg-green-600 px-3 py-[2px] text-[12px] font-bold text-white">申込期間</span>
                </dt>
                <dd className="mt-2 font-heading text-[17px] leading-[1.6] font-black text-navy-900">{solar.applicationPeriod}</dd>
              </div>
            </dl>
          </div>

          <p className="mx-auto mt-5 max-w-4xl text-[13px] leading-[1.8] text-ink-3">
            ※ {infoDate}時点の葛飾区公式情報。対象可否・助成額は住宅条件・機器・申請時期で異なります。東京都の助成は別の制度です。併用できますが、補助金の合計は助成対象経費が上限です。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <LinkButton href="/subsidy/katsushika" variant="primary">
              葛飾区の補助金を詳しく見る
              <ArrowIcon />
            </LinkButton>
            <LinkButton href="/subsidy/tokyo" variant="ghost">
              東京都の補助金
            </LinkButton>
            <LinkButton href="/subsidy" variant="ghost">
              区・都・国の制度の整理
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* ───────── 4. 補助金シミュレーターへの導線（ここがいちばん強い CTA）＋ 容量別の早見表 */}
      <div className="cv-auto bg-white">
        <SubsidyBanner />
        <section className="pt-4 pb-16 sm:pb-24" aria-label="容量別の想定助成額">
          <Container>
            <SubsidyMatrix withExample />
          </Container>
        </section>
      </div>

      {/* ───────── 施工事例（掲載の許可をいただいた事例。葛飾区のものを先に出す） */}
      {homeWorks.length > 0 && (
        <section className="cv-auto relative overflow-hidden bg-green-50 py-16 sm:py-24" aria-labelledby="works">
          <Blob className="-top-16 -left-16 h-56 w-56 bg-green-200/50" />
          <Blob className="-right-20 -bottom-24 h-72 w-72 bg-white/70" />
          <Container className="relative">
            <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
              <SectionHeading
                color="green"
                eyebrow="施工事例"
                title={
                  <span id="works">
                    葛飾区で導入された<span className="marker">お客様の事例</span>
                  </span>
                }
                lead="掲載の許可をいただいた事例を紹介します。ご家族の構成、導入した設備、導入前後の電気代をまとめています。"
              />
              <div className="mx-auto hidden w-40 lg:block" {...reveal(120, "pop")}>
                <Image src={images.peopleCoupleHappy.src} alt="" width={images.peopleCoupleHappy.width} height={images.peopleCoupleHappy.height} sizes="176px" className="h-auto w-full" />
              </div>
            </div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {homeWorks.map((w, i) => (
                <li key={w.slug} {...reveal(i * 90)}>
                  <WorksCard work={w} />
                </li>
              ))}
            </ul>
            <p className="mt-5 max-w-3xl text-[13px] leading-[1.8] text-ink-2">※ {WORK_BILL_NOTE}</p>
            <p className="mt-6">
              <LinkButton href="/works" variant="secondary">
                施工事例をすべて見る
                <ArrowIcon />
              </LinkButton>
            </p>
          </Container>
        </section>
      )}

      {/* ───────── 5. サービス（写真とアイコン） */}
      <section className="cv-auto bg-paper-2 py-16 sm:py-24" aria-labelledby="services">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="サービス"
            title={
              <span id="services">
                太陽光発電・蓄電池・V2H の<span className="marker">導入をサポート</span>します
              </span>
            }
          />
          <div className="mt-14 space-y-14 sm:space-y-20">
            {SERVICES.map((sv, i) => (
              <article key={sv.href} className={`grid items-center gap-7 lg:grid-cols-2 lg:gap-14 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative" {...reveal(0, i % 2 === 1 ? "right" : "left")}>
                  <span className={`parallax-soft absolute -bottom-3 h-full w-full rounded-[2rem] ${i % 2 === 1 ? "-right-3 bg-green-200" : "-left-3 bg-orange-200"}`} aria-hidden="true" />
                  <div className="relative overflow-hidden rounded-[2rem] shadow-card">
                    <Image src={sv.image.src} alt={sv.image.alt} width={sv.image.width} height={sv.image.height} sizes="(max-width: 1023px) 100vw, 50vw" quality={60} className="aspect-[3/2] h-auto w-full object-cover" />
                  </div>
                  <Image
                    src={sv.icon.src}
                    alt=""
                    width={112}
                    height={112}
                    className={`absolute -top-7 h-20 w-20 animate-float rounded-full bg-white p-1.5 shadow-card sm:h-24 sm:w-24 ${i % 2 === 1 ? "-left-3 sm:-left-6" : "-right-3 sm:-right-6"}`}
                  />
                </div>
                <div {...reveal(120)}>
                  <p>
                    <span className="inline-block rounded-full bg-green-600 px-4 py-1 font-heading text-[13px] font-bold text-white">{sv.tag}</span>
                  </p>
                  <h3 className="mt-3 text-[26px] font-black text-navy-900 sm:text-[32px]">{sv.title}</h3>
                  <p className="mt-4 text-base leading-[1.95] text-ink">{sv.body}</p>
                  <div className="mt-6">
                    <LinkButton href={sv.href} variant="primary">
                      {sv.title}について詳しく <ArrowIcon />
                    </LinkButton>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2">
            {[
              { href: "/v2h", icon: images.iconHouseEv, title: "V2H", body: "電気自動車の電気を家で使えるようにする設備です。葛飾区の助成の対象設備に含まれます。" },
              { href: "/hems", icon: images.iconClipboardHouse, title: "HEMS", body: "エネルギーの見える化と制御は、HEMS のページで説明しています。" },
            ].map((x, i) => (
              <li key={x.href} {...reveal(i * 100)}>
                <Link href={x.href} className="group flex h-full items-center gap-4 rounded-3xl bg-white p-5 shadow-card transition-transform duration-200 hover:-translate-y-1">
                  <Image src={x.icon.src} alt="" width={96} height={96} className="h-16 w-16 shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20" />
                  <span className="flex-1">
                    <span className="block font-heading text-[20px] font-black text-navy-900">{x.title}</span>
                    <span className="mt-1 block text-[14px] leading-[1.7] text-ink-2">{x.body}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-navy-900">
                    <ArrowIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────── 6. SOLAR SHIFT の考え方（お悩み → 4つの POINT） */}
      <WorrySection
        id="values"
        worries={WORRIES}
        heading={
          <>
            設備を売る前に、
            <br className="sm:hidden" />
            <span className="text-marker">条件を整理</span>します
          </>
        }
        note="ご相談・現地調査・お見積もりは無料です"
        points={VALUES}
        action={
          <LinkButton href="/reason" variant="secondary">
            考え方を詳しく見る
            <ArrowIcon />
          </LinkButton>
        }
      />

      {/* ───────── 7. 葛飾区で太陽光を考える理由 */}
      <section className="cv-auto relative overflow-hidden bg-green-50 py-16 sm:py-24" aria-labelledby="katsushika">
        <Blob className="-top-20 -right-16 h-64 w-64 bg-white/70" />
        <Container className="relative">
          <SectionHeading
            align="center"
            color="green"
            eyebrow="葛飾区の住まいと太陽光"
            title={
              <span id="katsushika">
                葛飾区で太陽光発電・蓄電池を考える、<span className="marker">3つの理由</span>
              </span>
            }
          />
          <ul className="mt-12 grid gap-5 lg:grid-cols-3">
            {reasons.map((r, i) => (
              <li key={r.title} className="relative flex flex-col rounded-3xl bg-white p-5 shadow-card sm:p-6" {...reveal(i * 110)}>
                <span className="absolute -top-3 left-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-en text-[15px] font-extrabold text-navy-900 shadow-sm">{i + 1}</span>
                <div className="overflow-hidden rounded-2xl">
                  <Image src={r.image.src} alt="" width={r.image.width} height={r.image.height} sizes="(max-width: 1023px) 100vw, 33vw" className="aspect-[16/9] h-auto w-full object-cover" />
                </div>
                <h3 className="mt-4 text-[19px] leading-[1.5] font-black text-navy-900">{r.title}</h3>
                <p className="mt-2 flex-1 text-base leading-[1.85] text-ink-2">{r.body}</p>
                <p className="mt-2">
                  <LinkButton href={r.href} variant="ghost">
                    {r.label}
                  </LinkButton>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-[13px] leading-[1.8] text-ink-3">※ 世帯数（2026年4月1日時点）と地形の情報は、葛飾区公式サイトによります。写真はイメージです。</p>
        </Container>
      </section>

      {/* ───────── 8. 導入までの流れ */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="flow">
        <Container>
          <div className="text-center" {...reveal()}>
            <p className="mb-5 flex justify-center">
              <span className="relative inline-block rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[14px] font-bold tracking-wide text-navy-900 shadow-sm after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-[7px] after:border-t-[8px] after:border-x-transparent after:border-t-orange-500 after:content-['']">
                導入までの流れ
              </span>
            </p>
            <h2 id="flow" className="font-heading text-[26px] leading-[1.4] font-black text-navy-900 sm:text-[34px]">
              ご相談から運転開始まで、
              <span className="num-xl mx-1.5 align-[-0.06em] text-[58px] text-orange-600 sm:text-[76px]">{FLOW.length}</span>
              つのステップ
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-[1.9] text-ink-2">
              葛飾区の助成は、原則として着工の4週間前までの事前協議が必要です。契約日ではなく着工日から逆算して、申請と工事の順番を組み立てます。
            </p>
          </div>

          <div className="relative mt-12" {...reveal(60, "fade")}>
            {/* PC：丸の中心を通る線が、左から伸びる */}
            <span className="grow-x absolute top-9 right-[8.33%] left-[8.33%] hidden h-1 rounded-full bg-orange-200 lg:block" style={growDelay(300)} aria-hidden="true" />
            <ol className="relative grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {FLOW.map((f, i) => (
                <li key={f.title} className="flex flex-col items-center text-center" {...reveal(200 + i * 130, "pop")}>
                  <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-white bg-orange-600 text-white shadow-[0_8px_18px_-8px_rgba(219,117,18,0.8)]">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {STEP_ICONS[f.icon]}
                    </svg>
                  </span>
                  <p className="mt-3 font-en text-[12px] font-bold tracking-wide text-accent-text">STEP.{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 text-[16px] leading-[1.45] font-black text-navy-900">{f.title}</h3>
                  <p className="mt-2">
                    <span className="inline-block rounded-xl bg-green-600 px-2.5 py-[3px] text-[12px] leading-[1.5] font-bold text-white">{f.meta}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="w-20" {...reveal(0, "pop")}>
              <Image src={images.poseOk.src} alt="" width={images.poseOk.width} height={images.poseOk.height} sizes="96px" className="h-auto w-full" />
            </div>
            <LinkButton href="/flow" variant="secondary">
              導入・施工の流れを詳しく見る
              <ArrowIcon />
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* ───────── 9. 商品・メーカー */}
      <div className="cv-auto relative overflow-hidden bg-cream py-16 sm:py-24">
        <Blob className="-top-16 -left-20 h-64 w-64 bg-orange-200/40" />
        <Blob className="-right-16 -bottom-20 h-56 w-56 bg-white/70" />
        <Container className="relative">
          <div className="mx-auto max-w-4xl">
            <MakerShowcase headingId="products" />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <LinkButton href="/products/solar" variant="secondary">
              太陽光パネルの比べ方
              <ArrowIcon />
            </LinkButton>
            <LinkButton href="/products/battery" variant="secondary">
              蓄電池の比べ方
              <ArrowIcon />
            </LinkButton>
            <LinkButton href="/products" variant="ghost">
              商品の選び方
            </LinkButton>
          </div>
        </Container>
      </div>

      {/* ───────── 10. 最新記事 */}
      {posts.length > 0 && (
        <section className="cv-auto py-16 sm:py-24" aria-labelledby="blog">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="ブログ"
              title={
                <span id="blog">
                  補助金・太陽光・蓄電池の<span className="marker">新しい記事</span>
                </span>
              }
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <div key={p.slug} {...reveal(i * 90)}>
                  <ArticleCard post={p} />
                </div>
              ))}
            </div>
            <p className="mt-8 text-center">
              <LinkButton href="/blog" variant="secondary">
                記事一覧を見る
                <ArrowIcon />
              </LinkButton>
            </p>
          </Container>
        </section>
      )}

      {/* ───────── 11. よくある質問 */}
      <section className="cv-auto relative overflow-hidden bg-cream py-16 sm:py-24" aria-labelledby="faq">
        <Blob className="-right-20 -bottom-24 h-72 w-72 bg-orange-200/40" />
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeading
                eyebrow="よくある質問"
                title={
                  <span id="faq">
                    補助金・費用・工事の<span className="marker">よくある質問</span>
                  </span>
                }
              />
              <Image src={images.peopleWomanThink.src} alt="" width={images.peopleWomanThink.width} height={images.peopleWomanThink.height} sizes="220px" className="mx-auto mt-6 hidden h-auto w-44 animate-float-slow lg:block" />
              <div className="mt-6">
                <LinkButton href="/faq" variant="secondary">
                  質問をすべて見る
                  <ArrowIcon />
                </LinkButton>
              </div>
            </div>
            <FaqSection items={faqItems} withSchema moreLink={false} />
          </div>
        </Container>
      </section>

      {/* ───────── 対応エリア（位置関係の図と、区ごとのページへの入口） */}
      <section className="cv-auto relative overflow-hidden bg-white py-16 sm:py-24" aria-labelledby="area">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
            <AreaMapFigure />
            <div>
              <SectionHeading
                eyebrow="対応エリア"
                title={
                  <span id="area">
                    葛飾区を中心に、<span className="marker">周辺の区</span>へ
                  </span>
                }
                lead={`主要対応エリアは${primaryAreas.map((a) => a.name).join("・")}、周辺対応エリアは${secondaryAreas.map((a) => a.name).join("・")}です。区の補助金は、区ごとに金額も申請の時期も違います。`}
              />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {areasWithPage.map((a, i) => (
                  <li key={a.slug} {...reveal(i * 70)}>
                    <Link
                      href={`/area/${a.slug}`}
                      className="group flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-orange-400"
                    >
                      <span className={`h-3 w-3 shrink-0 rounded-full ${a.status === "primary" ? "bg-orange-500" : "bg-green-500"}`} aria-hidden="true" />
                      <span className="flex-1 text-[15px] leading-[1.5] font-bold text-navy-900">{areaPageLabel(a)}</span>
                      <span className="text-navy-900 transition-transform duration-200 group-hover:translate-x-1">
                        <ArrowIcon />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <LinkButton href="/area" variant="secondary">
                  対応エリアと、区ごとの違いを見る
                  <ArrowIcon />
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── 12. 会社・運営情報 */}
      <section className="cv-auto bg-paper-2 py-16 sm:py-24" aria-labelledby="company">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="運営会社"
                title={<span id="company">{siteConfig.company.name}が運営しています</span>}
                lead="運営会社・所在地・代表者・連絡先を明記し、記事と補助金情報の編集方針も公開しています。"
              />
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2" {...reveal(80)}>
                <Image src="/logo.png" alt="" width={72} height={72} className="h-[4.5rem] w-[4.5rem] rounded-2xl bg-white object-contain p-2 shadow-card" />
                <LinkButton href="/company" variant="secondary">
                  会社情報
                  <ArrowIcon />
                </LinkButton>
                <LinkButton href="/editorial-policy" variant="ghost">
                  記事・補助金情報の編集方針
                </LinkButton>
              </div>
            </div>
            <div className="rounded-3xl bg-white px-5 shadow-card sm:px-7" {...reveal(100)}>
              <DefinitionList
                className="border-y-0"
                rows={[
                  { term: "サービス名", description: `${siteConfig.name}（${siteConfig.nameJa}）` },
                  { term: "運営会社", description: siteConfig.company.name },
                  { term: "代表者", description: `${siteConfig.company.representativeTitle} ${siteConfig.company.representative}` },
                  { term: "所在地", description: addressWithPostal() },
                  ...(siteConfig.contact.telDisplay
                    ? [
                        {
                          term: "電話番号",
                          description: (
                            <a href={`tel:${siteConfig.contact.tel}`} className="inline-flex min-h-11 items-center font-en text-[17px] font-extrabold tracking-[0.02em] text-navy-900 underline decoration-orange-400 decoration-2 underline-offset-4">
                              {siteConfig.contact.telDisplay}
                            </a>
                          ),
                        },
                      ]
                    : []),
                  { term: "設立", description: siteConfig.company.founded },
                ]}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── 13. 最終 CTA */}
      <CtaSection
        title="わが家で使える補助金と、必要な設備。まず整理するところから。"
        body="現地調査・お見積もりは無料です。葛飾区・東京都の制度を踏まえ、申請の順番とスケジュールまで一緒に組み立てます。"
      />

      <JsonLd
        data={graph(
          webPageSchema({
            path: "/",
            name: `${siteConfig.name}｜葛飾区の太陽光発電・蓄電池`,
            description: siteConfig.description,
            dateModified: siteConfig.contentUpdatedAt,
          }),
        )}
      />
    </>
  );
}
