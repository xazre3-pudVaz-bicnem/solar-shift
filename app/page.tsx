import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, getSubsidy } from "@/data/subsidies";
import { areas } from "@/data/areas";
import { faqsByIds } from "@/data/faq";
import { publishedWorks } from "@/data/works";
import { recommendedProducts } from "@/data/products";
import { manufacturers } from "@/data/manufacturers";
import { fit } from "@/data/fit";
import { images } from "@/data/images";
import { getLatestPosts } from "@/lib/blog";
import { simulate } from "@/lib/subsidy-calc";
import { headline } from "@/lib/subsidy-headline";
import { reveal } from "@/lib/reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StaffTip } from "@/components/ui/StaffTip";
import { Steps } from "@/components/ui/Steps";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { BigNumbers } from "@/components/subsidy/BigNumbers";
import { SubsidyBars } from "@/components/subsidy/SubsidyBars";
import { SubsidyMatrix } from "@/components/subsidy/SubsidyMatrix";
import { SubsidyBanner } from "@/components/sections/SubsidyBanner";
import { EnergyFlowFigure } from "@/components/sections/EnergyFlowFigure";
import { FitStepChart } from "@/components/sections/FitStepChart";
import { WorrySection } from "@/components/sections/WorrySection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { AreaCard } from "@/components/area/AreaCard";
import { WorksCard } from "@/components/works/WorksCard";
import { ProductCard } from "@/components/product/ProductCard";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "葛飾区の太陽光発電・蓄電池・補助金サポート｜SOLAR SHIFT（株式会社サイプレス）",
  description:
    "葛飾区の太陽光発電・蓄電池ならSOLAR SHIFT。かつしかエコ助成金・東京都の補助金の最新情報、補助金シミュレーター、太陽光＋蓄電池・V2H・HEMSの導入サポート。株式会社サイプレス運営。",
  path: "/",
  keywords: ["葛飾区 太陽光", "葛飾区 太陽光発電", "葛飾区 蓄電池", "葛飾区 太陽光 補助金", "葛飾区 蓄電池 補助金", "東京都 太陽光 補助金"],
  rawTitle: true,
});

const SERVICES = [
  {
    href: "/solar",
    title: "太陽光発電",
    tag: "つくる",
    body: "屋根で発電した電気を自宅で使い、余った分を売電する。電気を「買う」割合を減らす最初の一歩です。屋根の向き・面積・影の影響を現地で確認し、載せられる容量と期待できる効果を整理します。",
    points: ["屋根条件の現地確認", "容量の候補を複数提案", "葛飾区・東京都の助成を整理"],
    image: images.houseRoofPanelsSky,
    icon: images.iconSunPanel,
  },
  {
    href: "/battery",
    title: "家庭用蓄電池",
    tag: "ためる",
    body: "昼に発電した電気を夜に使い、停電時には備えになる。容量（kWh）、全負荷か特定負荷か、設置場所で選び方が変わります。東京都の助成は10万円/kWhのため、容量と費用のバランスが大切です。",
    points: ["夜間使用量から容量を検討", "停電時の優先回路を設計", "SII登録機器の確認"],
    image: images.batteryOutdoorWall,
    icon: images.iconGHouseBattery,
  },
  {
    href: "/solar-battery",
    title: "太陽光＋蓄電池",
    tag: "つくって、ためる",
    body: "つくった電気をためて使う。工事を1回にまとめ、ハイブリッド型パワーコンディショナで機器を集約できます。葛飾区では太陽光と蓄電池の併設加算（一律5万円）の対象です。",
    points: ["ハイブリッド型で機器を集約", "併設加算の対象", "工事・申請を1回で"],
    image: images.houseBatteryOutdoor,
    icon: images.iconHouseBattery,
  },
] as const;

const MERITS = [
  {
    icon: images.iconHouseYen,
    title: "区の助成と都の助成、両方が検討対象",
    body: "葛飾区の「かつしかエコ助成金」は太陽光6万円/kW（上限30万円）、蓄電池は対象経費の1/4（上限20万円）。東京都は既存住宅で3.75kW超が12万円/kW、蓄電池は10万円/kWhです。併用可否は各窓口で確認が必要ですが、どちらも葛飾区の住宅が対象になり得ます。",
  },
  {
    icon: images.iconHandPanel,
    title: "2026年度のFITは最初の4年間が24円/kWh",
    body: "住宅用（10kW未満）の売電価格は、2026年度は最初の4年間が24円/kWh、5〜10年目が8.3円/kWhです。導入初期に回収を前倒しする仕組みで、補助金と合わせると初期負担の軽減につながります。",
  },
  {
    icon: images.iconHouseShield,
    title: "ゼロメートル地帯だから、停電への備えに",
    body: "葛飾区は荒川・中川・江戸川に囲まれ、区の半分近くが海抜ゼロメートル地帯です。太陽光と蓄電池があれば、停電時にも最低限の電力を自宅で確保でき、在宅避難の備えになります。設置場所は浸水想定を踏まえて検討します。",
  },
  {
    icon: images.iconHouseSolar,
    title: "戸建の多い住宅地で、屋根を活かせる",
    body: "葛飾区は約26万世帯が暮らす住宅都市で、戸建住宅が多い地域です。隣家との距離が近い敷地も多いため、影の影響を現地で確認し、屋根の形に合わせた配置を設計することで、無理のない容量を載せられます。",
  },
] as const;

const ABOUT_POINTS = [
  { icon: images.iconGHandHouseYen, title: "補助金を整理", body: "区・都・国の制度を一次情報で確認" },
  { icon: images.iconGClipboardHouse, title: "現地調査・見積もり", body: "無料。内訳を分けてご提示" },
  { icon: images.iconGHouseWrench, title: "申請〜設置〜導入後", body: "同じ窓口でずっと相談できる" },
] as const;

const WORRIES = [
  { pre: "本当に", em: "補助金は出るの？" },
  { em: "申請の手続き", post: "がむずかしそう…" },
  { em: "押し売り", post: "されたりしない？" },
  { pre: "結局", em: "高かったり", post: "しないかな…" },
  { em: "うちに必要な設備", post: "が分からない" },
];

const VALUES = [
  {
    title: "補助金を、分かりやすく。",
    tag: "一次情報で確認・確認日を明記",
    body: "かつしかエコ助成金、東京都の助成、国の制度。金額・条件・申請時期を一次情報で確認し、確認日を明記してお伝えします。確認できていない併用を前提にした「お得な合計額」は出しません。",
    image: images.consultationDesk,
    href: "/subsidy",
    label: "補助金の総合ページ",
  },
  {
    title: "住宅ごとに、必要な設備を。",
    tag: "強引な提案はしません",
    body: "屋根の形、家族の電気の使い方、停電時にどこまで備えたいか。それによって太陽光だけで十分な家もあれば、蓄電池やV2Hまで検討したほうがよい家もあります。先に設備を決めず、住まいから考えます。",
    image: images.roofPanelsFront,
    href: "/reason",
    label: "SOLAR SHIFT が選ばれる理由",
  },
  {
    title: "太陽光だけで終わらせない。",
    tag: "蓄電池・V2H・HEMSまで総合的に",
    body: "太陽光・蓄電池・V2H・HEMS・関連する省エネ設備まで、ひとつの計画として検討します。後から追加するより、はじめに全体像を描いたほうが、工事も申請も無駄がありません。",
    image: images.houseEvV2h,
    href: "/solar-battery",
    label: "太陽光＋蓄電池について",
  },
  {
    title: "葛飾区を中心に、地域密着で。",
    tag: "拠点は葛飾区白鳥",
    body: "区内の住宅事情や水害リスクを踏まえた提案を行い、足立区・江戸川区・墨田区など周辺にも対応します。導入前の相談から導入後の不具合まで、同じ窓口で相談できます。",
    image: images.katsushikaStreetSunset,
    href: "/area/katsushika",
    label: "葛飾区の太陽光発電",
  },
];

const FLOW = [
  { icon: "mail", title: "ご相談・ヒアリング", meta: "まずはフォームから", body: "屋根の形状、築年数、現在の電気代、気になっている設備を伺います。この段階で使える可能性のある補助金を整理します。" },
  { icon: "search", title: "現地調査（無料）", meta: "屋根・分電盤・設置スペースを確認", body: "屋根の状態、周囲の建物による影、蓄電池の設置場所、分電盤の状況を確認します。水害リスクのある地域では設置高さも検討します。" },
  { icon: "calc", title: "ご提案・お見積もり", meta: "内訳を分けた見積もり", body: "容量の候補を複数お出しし、葛飾区・東京都それぞれの想定助成額を別紙で整理します。ご納得いただけない場合は、その場で断っていただいて構いません。" },
  { icon: "stamp", title: "補助金の事前手続き", meta: "着工4週間前までに事前協議", body: "葛飾区の助成は工事着工の4週間前までに事前協議が必要です。区の回答書が届くまで工事には入りません。東京都の事前申込も並行して進めます。" },
  { icon: "tools", title: "設置工事", meta: "回答書の到着後に着工", body: "足場の設置からパネル・機器の取り付け、電気工事、系統連系まで。工事中の疑問はその場でお答えします。" },
  { icon: "support", title: "完了報告・導入後サポート", meta: "交付申請から運転開始後まで", body: "完了報告と交付申請の書類を準備し、運転開始後の発電状況や機器の不具合についても、同じ窓口でご相談いただけます。" },
] as const;

function SunRays({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="44" fill="currentColor" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="95" y="4" width="10" height="34" rx="5" fill="currentColor" transform={`rotate(${i * 30} 100 100)`} />
      ))}
    </svg>
  );
}

function Wave({ className = "text-white" }: { className?: string }) {
  return (
    <svg className={`block h-8 w-full sm:h-14 ${className}`} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 42c200 34 440 34 720 8s520-30 720 2v28H0z" />
    </svg>
  );
}

export default function HomePage() {
  const example = simulate({ area: "katsushika", housing: "existing", solarKw: 5, batteryKwh: 7, v2h: false, hems: false });
  const infoDate = formatDateJa(siteConfig.subsidyInfoDate);
  const s = (id: string) => getSubsidy(id)!;

  const medals = [
    { area: "葛飾区", label: "太陽光発電", h: headline(s("katsushika-solar"))! },
    { area: "葛飾区", label: "蓄電池", h: headline(s("katsushika-battery"))! },
    { area: "東京都", label: "蓄電池", h: headline(s("tokyo-battery"))! },
  ];

  const faqItems = faqsByIds(["subsidy-katsushika-overview", "subsidy-pre-consultation", "subsidy-combination", "cost-solar", "battery-set", "service-area"]);
  const posts = getLatestPosts(3);
  const recommended = [...recommendedProducts("solar").slice(0, 2), ...recommendedProducts("battery").slice(0, 2)];
  const works = publishedWorks.slice(0, 3);
  const [fitHigh, fitLow] = fit.residential.steps;

  return (
    <>
      {/* ───────── 1. ヒーロー（CTAは置かない・ブランド訴求のみ） */}
      <section className="relative overflow-hidden bg-cream">
        <SunRays className="absolute -top-20 -left-20 h-64 w-64 animate-spin-slow text-orange-200 sm:h-80 sm:w-80" />
        <span className="absolute top-[18%] right-[46%] hidden h-3 w-3 animate-twinkle rounded-full bg-green-400 lg:block" aria-hidden="true" />
        <span className="absolute right-[4%] bottom-[22%] hidden h-4 w-4 animate-twinkle rounded-full bg-orange-400 [animation-delay:1.3s] lg:block" aria-hidden="true" />

        <Container size="wide" className="relative grid items-center gap-12 pt-10 pb-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-12">
          <div>
            {/*
              h1 は「検索語のラベル」＋「ブランドの一言」。
              ラベルを h1 の外に出すと、ページの主見出しに地域名もサービス名も入らなくなる。
            */}
            <h1 className="text-navy-900">
              <span className="flex">
                <span className="relative inline-block rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[14px] leading-[1.9] font-bold tracking-normal text-navy-900 shadow-sm after:absolute after:top-full after:left-7 after:border-x-[7px] after:border-t-[8px] after:border-x-transparent after:border-t-orange-500 after:content-[''] sm:text-[15px]">
                  葛飾区の太陽光発電・蓄電池・補助金サポート
                </span>
              </span>
              <span className="mt-6 block text-[6.6vw] leading-[1.4] font-black tracking-[0.01em] sm:text-[42px] lg:text-[34px] xl:text-[44px]">
                電気を買う暮らしから、
                <br />
                <span className="marker">つくって、ためる</span>暮らしへ。
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-[2] text-ink-2 sm:text-[17px]">
              {siteConfig.primaryArea.name}の太陽光発電・蓄電池なら <strong className="font-en font-extrabold tracking-wide text-navy-900">SOLAR SHIFT</strong>。
              補助金の整理から現地調査、設置、導入後の相談まで、住まいに合わせてひとつずつ。
            </p>

            <ul className="mt-7 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
              {medals.map((m) => (
                <li key={`${m.area}-${m.label}`} className="rounded-2xl border-2 border-orange-200 bg-white px-1 py-3 text-center shadow-card">
                  <span className="block text-[11px] leading-[1.4] font-bold text-ink-2 sm:text-[12px]">
                    {m.area}の助成
                    <span className="block font-heading text-[13px] text-navy-900 sm:text-[15px]">{m.label}</span>
                  </span>
                  <span className="mt-1 flex items-baseline justify-center gap-0.5 text-navy-900">
                    {m.h.prefix && <span className="text-[10px] font-bold sm:text-[12px]">{m.h.prefix}</span>}
                    <span className="num-xl text-[30px] text-orange-600 sm:text-[44px]">{m.h.value}</span>
                    <span className="font-heading text-[11px] font-black sm:text-[14px]">{m.h.unit}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] leading-[1.7] text-ink-3">※ {infoDate}時点の葛飾区・東京都の公式情報。対象可否・助成額は住宅条件・機器・申請時期で異なります。</p>

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
              <span className="rounded-full bg-navy-900 px-3 py-1 font-bold text-white">{siteConfig.company.name} 運営</span>
              <span>
                主要対応エリア：{siteConfig.primaryArea.prefecture}
                {siteConfig.primaryArea.name}
              </span>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl pb-10 lg:max-w-none">
            <span className="absolute -top-3 -right-3 h-[calc(100%-2.5rem)] w-full rounded-[2.5rem] bg-orange-200" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-white shadow-pop">
              <Image
                src={images.heroHouseSunset.src}
                alt={images.heroHouseSunset.alt}
                width={images.heroHouseSunset.width}
                height={images.heroHouseSunset.height}
                sizes="(max-width: 1023px) 100vw, 46vw"
                preload
                quality={60}
                className="aspect-[16/10] h-auto w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 -left-1 w-36 animate-float-slow rounded-3xl bg-white p-2 shadow-pop sm:w-48">
              <Image src={images.peopleFamily.src} alt="" width={images.peopleFamily.width} height={images.peopleFamily.height} sizes="192px" className="h-auto w-full" />
            </div>
            <p className="absolute bottom-[4.5rem] left-36 rounded-2xl bg-white px-3 py-2 font-heading text-[12px] leading-[1.5] font-bold text-navy-900 shadow-card sm:bottom-24 sm:left-52 sm:text-[14px]">
              うちの屋根でも、
              <br />
              補助金つかえる？
              <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 bg-white" aria-hidden="true" />
            </p>
            <Image src={images.iconSunPanel.src} alt="" width={96} height={96} className="absolute -top-6 -left-4 h-16 w-16 animate-float sm:h-24 sm:w-24" />
          </div>
        </Container>
        <Wave />
      </section>

      {/* ───────── 2. SOLAR SHIFT について */}
      <section className="pt-10 pb-16 sm:pt-14 sm:pb-24" aria-labelledby="about">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="SOLAR SHIFT について"
                title={
                  <span id="about">
                    葛飾区の太陽光・蓄電池・補助金のことなら、<span className="marker">ひとつの窓口</span>で。
                  </span>
                }
              />
              <div className="mt-6 space-y-4 text-[15px] leading-[2] text-ink sm:text-base" {...reveal(100)}>
                <p>SOLAR SHIFT（ソーラーシフト）は、東京都葛飾区に本社を置く株式会社サイプレスが運営する、住宅用太陽光発電・家庭用蓄電池の導入サポートサービスです。</p>
                <p>
                  太陽光発電を検討すると、最初にぶつかるのが「補助金はいくら出るのか」「自分の家は対象なのか」「申請はいつまでに何をすればいいのか」という疑問です。葛飾区の助成、東京都の助成、国の制度は、それぞれ金額も条件も申請の順番も違います。
                </p>
                <p>SOLAR SHIFT は、こうした制度の情報を一次情報で確認して整理し、住まいごとに必要な設備を一緒に検討します。</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <LinkButton href="/reason" variant="secondary">
                  SOLAR SHIFT が選ばれる理由 <ArrowIcon />
                </LinkButton>
                <LinkButton href="/company" variant="ghost">
                  運営会社について
                </LinkButton>
              </div>
            </div>
            <ul className="grid gap-3">
              {ABOUT_POINTS.map((p, i) => (
                <li key={p.title} className="flex items-center gap-4 rounded-3xl border-2 border-green-200 bg-white p-4 shadow-card sm:p-5" {...reveal(i * 110, "right")}>
                  <Image src={p.icon.src} alt="" width={96} height={96} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
                  <div>
                    <p className="font-en text-[12px] font-bold tracking-[0.14em] text-green-700">POINT {String(i + 1).padStart(2, "0")}</p>
                    <h3 className="text-[18px] font-black text-navy-900 sm:text-[20px]">{p.title}</h3>
                    <p className="text-[14px] leading-[1.7] text-ink-2">{p.body}</p>
                  </div>
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

      {/* ───────── 3. 葛飾区で太陽光を導入するメリット */}
      <section className="cv-auto bg-green-50 py-16 sm:py-24" aria-labelledby="merit">
        <Container>
          <SectionHeading
            align="center"
            color="green"
            eyebrow="知っていましたか？"
            title={
              <span id="merit">
                葛飾区は、太陽光・蓄電池を
                <br className="hidden sm:block" />「<span className="marker">補助金を使って</span>」入れやすい地域です
              </span>
            }
            lead="区と都の両方に家庭向けの助成制度があり、2026年度のFIT制度は導入初期に手厚い設定です。水害リスクのある地域だからこそ、停電への備えとしての価値もあります。"
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {MERITS.map((m, i) => (
              <li key={m.title} className="relative rounded-3xl bg-white p-6 shadow-card sm:p-8" {...reveal((i % 2) * 110)}>
                <span className="absolute -top-3 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-en text-[15px] font-extrabold text-navy-900 shadow-sm">{i + 1}</span>
                <div className="flex items-start gap-4">
                  <Image src={m.icon.src} alt="" width={96} height={96} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
                  <div>
                    <h3 className="text-[18px] leading-[1.5] font-black text-navy-900 sm:text-[20px]">{m.title}</h3>
                    <p className="mt-2 text-[14px] leading-[1.9] text-ink-2">{m.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid items-center gap-6 lg:grid-cols-[1fr_1.5fr] lg:gap-10">
            <div {...reveal(0, "left")}>
              <p className="font-heading text-[22px] leading-[1.5] font-black text-navy-900 sm:text-[28px]">
                売電価格は、最初の{fitHigh.toYear}年間が
                <span className="num-xl mx-1 text-[44px] text-orange-700 sm:text-[60px]">{fitHigh.yenPerKwh}</span>
                円/kWh
              </p>
              <p className="mt-3 text-[15px] leading-[1.9] text-ink-2">
                {fitLow.fromYear}年目からは{fitLow.yenPerKwh}円/kWhに下がります。だから長い目で見ると、売るよりも<strong className="marker text-navy-900">自宅で使い切る設計</strong>が大切です。蓄電池はそのための設備です。
              </p>
              <p className="mt-4">
                <Link href="/guide/selling-electricity" className="font-heading text-[15px] font-bold text-navy-600 underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text">
                  売電とFIT価格のしくみ →
                </Link>
              </p>
            </div>
            <FitStepChart compact />
          </div>
          <p className="mt-6 text-center text-[12px] text-ink-3">
            助成額・FIT価格は{infoDate}時点の公式情報です。詳しくは
            <Link href="/area/katsushika" className="mx-1 text-navy-600 underline underline-offset-4">
              葛飾区の太陽光発電ページ
            </Link>
            をご覧ください。
          </p>
        </Container>
      </section>

      {/* ───────── 4. 2026年度 葛飾区・東京都の補助金 */}
      <section className="cv-auto bg-cream py-16 sm:py-24" aria-labelledby="subsidy">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="2026年度（令和8年度）の補助金"
            title={
              <span id="subsidy">
                葛飾区・東京都の<span className="marker">太陽光・蓄電池補助金</span>
              </span>
            }
            lead={`${infoDate}時点で公式情報を確認した内容です。葛飾区の助成は工事着工4週間前までの事前協議が原則必要です。制度は変更される場合があるため、最新情報は各公式サイトをご確認ください。`}
          />

          <div className="mt-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-3 text-[20px] font-black text-navy-900 sm:text-[24px]">
                <span className="shrink-0 rounded-full bg-orange-500 px-4 py-1 text-[15px] whitespace-nowrap text-navy-900">葛飾区</span>
                {katsushikaProgram.programName}
              </h3>
              <Link href="/subsidy/katsushika" className="font-heading text-[15px] font-bold text-navy-600 underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text">
                葛飾区の補助金を詳しく見る →
              </Link>
            </div>
            <BigNumbers
              items={[
                { subsidy: s("katsushika-solar"), label: "太陽光発電", icon: images.iconSunPanel },
                { subsidy: s("katsushika-battery"), label: "蓄電池", icon: images.iconHouseBattery },
                { subsidy: s("katsushika-solar-battery-addon"), label: "太陽光＋蓄電池の併設加算", icon: images.iconHouseYen },
                { subsidy: s("katsushika-v2h"), label: "V2H", icon: images.iconHouseEv },
                { subsidy: s("katsushika-hems"), label: "HEMS", icon: images.iconClipboardHouse },
                { subsidy: s("katsushika-solar-hems-addon"), label: "太陽光＋HEMSの併設加算", icon: images.iconPanelLeaf },
              ]}
            />
          </div>

          <div className="mt-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-3 text-[20px] font-black text-navy-900 sm:text-[24px]">
                <span className="shrink-0 rounded-full bg-green-600 px-4 py-1 text-[15px] whitespace-nowrap text-white">東京都</span>
                クール・ネット東京の家庭向け助成
              </h3>
              <Link href="/subsidy/tokyo" className="font-heading text-[15px] font-bold text-navy-600 underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text">
                東京都の補助金を詳しく見る →
              </Link>
            </div>
            <BigNumbers
              tone="green"
              items={[
                { subsidy: s("tokyo-solar-existing"), label: "太陽光（既存住宅）", icon: images.iconGSunPanelLeaf },
                { subsidy: s("tokyo-solar-new"), label: "太陽光（新築住宅）", icon: images.iconGHouseYenLeaf },
                { subsidy: s("tokyo-battery"), label: "蓄電池", icon: images.iconGHouseBattery2 },
              ]}
            />
          </div>

          <StaffTip className="mx-auto mt-10 max-w-3xl" title="いちばん大事なこと" image={images.poseIdea} tone="orange">
            葛飾区の助成は<strong className="marker">工事着工の4週間前までに事前協議</strong>が必要です。区の回答書が届く前に工事を始めると対象外になります。契約日ではなく「着工日」から逆算しましょう。
          </StaffTip>

          <details className="group mt-10 rounded-3xl bg-white shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-heading text-[16px] font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
              表で詳しく見る（事前手続き・受付状況・出典）
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <div className="space-y-8 px-3 pb-5 sm:px-5">
              <SubsidyTable menus={katsushikaProgram.menus} caption={`葛飾区｜申込期間：${katsushikaProgram.menus[0].applicationPeriod}／出典：${katsushikaProgram.sourceName}`} />
              <SubsidyTable menus={[...tokyoSolarProgram.menus, ...tokyoBatteryProgram.menus]} caption={`東京都｜出典：${tokyoSolarProgram.sourceName}／${tokyoBatteryProgram.sourceName}`} />
            </div>
          </details>

          <SubsidyDisclaimer className="mt-8" />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/subsidy" variant="secondary">
              補助金の総合ページへ <ArrowIcon />
            </LinkButton>
            <LinkButton href="/subsidy/national" variant="ghost">
              国の補助制度の現状
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* ───────── 5. 「いくら補助される？」シミュレーションへの導線 */}
      <div className="cv-auto bg-white">
        <SubsidyBanner />
        <section className="pt-4 pb-16 sm:pb-24" aria-label="容量別の想定助成額">
          <Container>
            <SubsidyMatrix />
            <p className="mt-10 text-center">
              <LinkButton href="/simulation" variant="green" size="lg">
                わが家の条件で試算する <ArrowIcon />
              </LinkButton>
            </p>
          </Container>
        </section>
      </div>

      {/* ───────── 6〜8. 太陽光／蓄電池／太陽光＋蓄電池 */}
      <section className="cv-auto bg-paper-2 py-16 sm:py-24" aria-labelledby="services">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="サービス"
            title={
              <span id="services">
                太陽光発電、蓄電池、そして<span className="marker">その組み合わせ</span>
              </span>
            }
            lead="住まいによって、最適な組み合わせは違います。それぞれの役割と、選ぶときに見るべきポイントを整理しました。"
          />
          <div className="mt-14 space-y-14 sm:space-y-20">
            {SERVICES.map((sv, i) => (
              <article key={sv.href} className={`grid items-center gap-7 lg:grid-cols-2 lg:gap-14 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative" {...reveal(0, i % 2 === 1 ? "right" : "left")}>
                  <span className={`absolute -bottom-3 h-full w-full rounded-[2rem] ${i % 2 === 1 ? "-right-3 bg-green-200" : "-left-3 bg-orange-200"}`} aria-hidden="true" />
                  <ImagePlaceholder src={sv.image.src} alt={sv.image.alt} ratio="3/2" className="relative" />
                  <Image src={sv.icon.src} alt="" width={112} height={112} className={`absolute -top-7 h-20 w-20 animate-float rounded-full bg-white p-1.5 shadow-card sm:h-24 sm:w-24 ${i % 2 === 1 ? "-left-3" : "-right-3"}`} />
                </div>
                <div {...reveal(120)}>
                  <p>
                    <span className="inline-block rounded-full bg-green-600 px-4 py-1 font-heading text-[13px] font-bold text-white">{sv.tag}</span>
                  </p>
                  <h3 className="mt-3 text-[26px] font-black text-navy-900 sm:text-[32px]">{sv.title}</h3>
                  <p className="mt-4 text-[15px] leading-[1.95] text-ink">{sv.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {sv.points.map((p) => (
                      <li key={p} className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[13px] font-bold text-navy-900">
                        <svg className="h-3.5 w-3.5 text-orange-600" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="m3 8.5 3.2 3.2L13 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
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
              { href: "/v2h", icon: images.iconHouseEv, title: "V2H", sub: "電気自動車の電気を家で使う", note: `葛飾区の助成：${s("katsushika-v2h").amount}（${s("katsushika-v2h").maxAmount}）` },
              { href: "/hems", icon: images.iconClipboardHouse, title: "HEMS", sub: "エネルギーの見える化・制御", note: `葛飾区の助成：${s("katsushika-hems").amount}／太陽光との併設加算 ${s("katsushika-solar-hems-addon").amount}` },
            ].map((x, i) => (
              <li key={x.href} {...reveal(i * 100)}>
                <Link href={x.href} className="group flex h-full items-center gap-4 rounded-3xl bg-white p-5 shadow-card transition-transform duration-200 hover:-translate-y-1">
                  <Image src={x.icon.src} alt="" width={96} height={96} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
                  <span className="flex-1">
                    <span className="block font-heading text-[20px] font-black text-navy-900">
                      {x.title}
                      <span className="ml-2 text-[13px] font-bold text-ink-2">{x.sub}</span>
                    </span>
                    <span className="mt-1 block text-[13px] leading-[1.6] text-ink-2">{x.note}</span>
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

      {/* ───────── 9. おすすめ商品 */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="products">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="取扱商品"
            title={
              <span id="products">
                おすすめの<span className="marker">太陽光パネル・蓄電池</span>
              </span>
            }
            lead="メーカー公式情報で仕様を確認した商品だけを掲載します。価格が未確定の商品は「お問い合わせください」と表示し、架空の価格は出しません。"
          />
          {recommended.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid items-center gap-6 rounded-[2rem] bg-beige p-6 sm:p-8 lg:grid-cols-[1fr_1.3fr]" {...reveal()}>
              <ImagePlaceholder src={images.panelBatteryProducts.src} alt={images.panelBatteryProducts.alt} ratio="3/2" />
              <div>
                <p className="font-heading text-[20px] font-black text-navy-900">商品ページは順次掲載予定です</p>
                <p className="mt-2 text-[14px] leading-[1.9] text-ink-2">
                  現在、取扱メーカー・商品の情報を整理しています。候補として検討しているメーカーは以下のとおりです（取扱契約の有無を確認中のため、「正規取扱店」などの表記は行っていません）。
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {manufacturers.map((m) => (
                    <li key={m.id} className="rounded-full bg-white px-3 py-1 text-[13px] font-bold text-navy-900 shadow-sm">
                      {m.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/recommend/solar" variant="secondary">
              おすすめ太陽光パネル <ArrowIcon />
            </LinkButton>
            <LinkButton href="/recommend/battery" variant="secondary">
              おすすめ蓄電池 <ArrowIcon />
            </LinkButton>
            <LinkButton href="/products" variant="ghost">
              取扱商品一覧
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* ───────── 10. 補助金を活用した導入イメージ */}
      <section className="cv-auto bg-cream py-16 sm:py-24" aria-labelledby="example">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="補助金を活用した導入イメージ"
            title={
              <span id="example">
                たとえば、既存住宅で
                <br />
                <span className="marker">太陽光5kW＋蓄電池7kWh</span>なら
              </span>
            }
            lead="制度ごとに想定額を分けて示します。金額は概算で、実際の対象可否・助成額は住宅条件・機器・申請時期で異なります。"
          />
          <div className="mx-auto mt-10 max-w-4xl">
            <SubsidyBars
              result={example}
              caption={`${infoDate}時点の公式情報による概算。葛飾区の蓄電池は対象経費の1/4（上限20万円）のため上限額で表示。区と都は合算していません。併用の可否と併用時の扱いは公式情報で明記が確認できていないため、申請前に各窓口への確認が必要です。`}
            />
          </div>
          <StaffTip className="mx-auto mt-8 max-w-3xl" title="ご自宅の条件で確かめるには" image={images.poseLaptop} side="right">
            住宅区分・太陽光の容量・蓄電池の容量・V2H・HEMSを選ぶだけで、区と都それぞれの想定額が出ます。
            <Link href="/simulation" className="ml-1 font-bold text-navy-600 underline decoration-orange-400 decoration-2 underline-offset-4">
              補助金シミュレーターを使う →
            </Link>
          </StaffTip>
        </Container>
      </section>

      {/* ───────── 11. SOLAR SHIFT が大切にすること */}
      <WorrySection worries={WORRIES} points={VALUES} id="values" />

      {/* ───────── 12. 導入までの流れ */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="flow">
        <Container>
          <h2 id="flow" className="text-center font-heading text-[28px] leading-[1.3] font-black text-navy-900 sm:text-[38px]" {...reveal()}>
            設置までの
            <span className="num-xl mx-2 text-[64px] text-orange-600 sm:text-[84px]">{FLOW.length}</span>
            <span className="font-en font-extrabold text-orange-600">STEP</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-[1.9] text-ink-2" {...reveal(80)}>
            葛飾区の助成は「着工の4週間前までの事前協議」が原則です。契約日ではなく着工日から逆算して、申請と工事を組み立てます。
          </p>
          <div className="mx-auto mt-12 max-w-3xl">
            <Steps steps={FLOW.map((f) => ({ title: f.title, meta: f.meta, body: f.body, icon: f.icon }))} />
          </div>
          <p className="mt-10 text-center">
            <LinkButton href="/flow" variant="secondary">
              流れを詳しく見る <ArrowIcon />
            </LinkButton>
          </p>
        </Container>
      </section>

      {/* ───────── 13. 対応エリア */}
      <section className="cv-auto bg-green-50 py-16 sm:py-24" aria-labelledby="area">
        <Container>
          <SectionHeading
            align="center"
            color="green"
            eyebrow="対応エリア"
            title={
              <span id="area">
                <span className="marker">葛飾区</span>を中心に、周辺エリアへ
              </span>
            }
            lead="主要対応エリアは東京都葛飾区です。足立区・江戸川区・墨田区など葛飾区周辺にも対応しています。その他の地域は個別にご相談ください。"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a, i) => (
              <div key={a.slug} {...reveal((i % 3) * 90)}>
                <AreaCard area={a} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 14. 施工事例 */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="works">
        <Container>
          <SectionHeading align="center" eyebrow="施工事例" title={<span id="works">施工事例</span>} lead="実際に施工し、お客様の掲載許可をいただいた事例のみを掲載します。" />
          {works.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {works.map((w) => (
                <WorksCard key={w.slug} work={w} />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 grid max-w-3xl items-center gap-5 rounded-[2rem] border-[3px] border-dashed border-orange-200 bg-white p-6 sm:grid-cols-[11rem_1fr] sm:p-8" {...reveal()}>
              <Image src={images.peopleFamily2.src} alt="" width={images.peopleFamily2.width} height={images.peopleFamily2.height} sizes="176px" className="mx-auto h-auto w-40" />
              <div>
                <p className="font-heading text-[20px] font-black text-navy-900">施工事例は順次掲載予定です</p>
                <p className="mt-2 text-[14px] leading-[1.9] text-ink-2">掲載できる事例ができ次第、地域・住宅タイプ・設備構成・活用した補助金とともにご紹介します。架空の事例は掲載しません。</p>
              </div>
            </div>
          )}
          <p className="mt-8 text-center">
            <LinkButton href="/works" variant="ghost">
              施工事例一覧
            </LinkButton>
          </p>
        </Container>
      </section>

      {/* ───────── 15. よくある質問 */}
      <section className="cv-auto bg-cream py-16 sm:py-24" aria-labelledby="faq">
        <Container>
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
              <Image src={images.peopleWomanThink.src} alt="" width={images.peopleWomanThink.width} height={images.peopleWomanThink.height} sizes="220px" className="mx-auto mt-6 hidden h-auto w-52 lg:block" />
              <div className="mt-6">
                <LinkButton href="/faq" variant="secondary">
                  質問をすべて見る <ArrowIcon />
                </LinkButton>
              </div>
            </div>
            <FaqSection items={faqItems} withSchema moreLink={false} />
          </div>
        </Container>
      </section>

      {/* ───────── 16. 最新ブログ */}
      {posts.length > 0 && (
        <section className="cv-auto py-16 sm:py-24" aria-labelledby="blog">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="ブログ"
              title={
                <span id="blog">
                  葛飾区の補助金・太陽光・蓄電池の<span className="marker">最新情報</span>
                </span>
              }
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <div key={p.slug} {...reveal(i * 100)}>
                  <ArticleCard post={p} />
                </div>
              ))}
            </div>
            <p className="mt-8 text-center">
              <LinkButton href="/blog" variant="secondary">
                記事一覧を見る <ArrowIcon />
              </LinkButton>
            </p>
          </Container>
        </section>
      )}

      {/* ───────── 17. 運営会社 */}
      <section className="cv-auto bg-paper-2 py-16 sm:py-24" aria-labelledby="company">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="運営会社" title={<span id="company">株式会社サイプレスが運営しています</span>} lead="SOLAR SHIFT は、東京都葛飾区白鳥に本社を置く株式会社サイプレスの太陽光発電・蓄電池事業です。" />
              <div className="mt-6 flex items-center gap-4" {...reveal(100)}>
                <Image src="/logo.png" alt="" width={96} height={96} className="h-20 w-20 rounded-2xl bg-white object-contain p-1 shadow-card" />
                <LinkButton href="/company" variant="secondary">
                  会社情報を見る <ArrowIcon />
                </LinkButton>
              </div>
            </div>
            <div className="rounded-3xl bg-white px-5 py-2 shadow-card sm:px-8" {...reveal(120)}>
              <DefinitionList
                className="border-y-0"
                rows={[
                  { term: "サービス名", description: `${siteConfig.name}（${siteConfig.nameJa}）` },
                  { term: "運営会社", description: siteConfig.company.name },
                  { term: "代表者", description: `${siteConfig.company.representativeTitle} ${siteConfig.company.representative}` },
                  { term: "所在地", description: siteConfig.company.address.full },
                  { term: "設立", description: siteConfig.company.founded },
                  { term: "事業内容", description: siteConfig.company.businessDescription },
                ]}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── 18. お問い合わせCTA */}
      <CtaSection
        title="わが家で使える補助金と、必要な設備。まず整理するところから。"
        body="現地調査・お見積もりは無料です。葛飾区・東京都の制度を踏まえ、申請の順番とスケジュールまで一緒に組み立てます。訪問販売や電話営業はしていません。"
      />

      <JsonLd
        data={graph(
          webPageSchema({
            path: "/",
            name: `${siteConfig.name}｜葛飾区の太陽光発電・蓄電池・補助金サポート`,
            description: siteConfig.description,
            dateModified: siteConfig.subsidyInfoDate,
          }),
        )}
      />
    </>
  );
}
