import { WorksCard } from "@/components/works/WorksCard";
import { worksInCity, publishedWorks, WORK_BILL_NOTE } from "@/data/works";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig, addressWithPostal } from "@/lib/site";
import { getSubsidy, katsushikaProgram } from "@/data/subsidies";
import { primaryAreas, secondaryAreas } from "@/data/areas";
import { faqsByIds } from "@/data/faq";
import { MakerShowcase } from "@/components/product/MakerShowcase";
import { images } from "@/data/images";
import { getLatestPosts } from "@/lib/blog";
import { headline } from "@/lib/subsidy-headline";
import { reveal } from "@/lib/reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { HomeHero } from "@/components/sections/HomeHero";
import { SubsidyBanner } from "@/components/sections/SubsidyBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

/**
 * TOP ページ。役割は「概要を伝えて、詳しいページへ送る」こと。
 *
 * - 狙う検索語は「葛飾区 太陽光／太陽光発電／蓄電池」。補助金の詳しい話は /subsidy/katsushika、
 *   業者・施工の話は /area/katsushika に任せる（同じ説明を TOP で繰り返さない）。lib/seo-map.ts を参照。
 * - 補助金額は data/subsidies から出す（ここに数字を書かない）。容量別の金額例や区と都の比較は載せない
 *   （/subsidy と /simulation にある）。
 * - ヒーローには CTA を置かない。最初の導線は、ヒーロー直下の「まず補助金だけ確認したい方へ」。
 * - 1つのセクションの中で、写真・人物イラスト・アイコンを混ぜない。
 */
export const metadata: Metadata = buildMetadata({
  title: "葛飾区の太陽光発電・蓄電池なら SOLAR SHIFT｜補助金の整理から導入後まで",
  description:
    "葛飾区の太陽光発電・蓄電池の導入をサポートするSOLAR SHIFT（株式会社サイプレス運営）。葛飾区・東京都の補助金を一次情報で確認し、住まいに合う設備と申請の順番を整理します。現地調査・お見積もりは無料。",
  path: "/",
  keywords: ["葛飾区 太陽光", "葛飾区 太陽光発電", "葛飾区 蓄電池"],
  rawTitle: true,
});

/* ───────── サービスのアイコン（線画・同じ太さでそろえる） */
function ServiceIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="h-11 w-11 text-navy-900" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const SERVICES: { href: string; title: string; body: string; icon: ReactNode }[] = [
  {
    href: "/solar",
    title: "太陽光発電",
    body: "屋根で発電した電気を自宅で使い、余った分を売電します。屋根の向き・面積・影の影響を現地で確認します。",
    icon: (
      <>
        <path d="M9 30 14 14h20l5 16z" />
        <path d="M11.5 22h25M21 14l-2 16M27 14l2 16" />
        <path d="M24 30v6M17 38h14" />
        <path className="text-orange-500" stroke="currentColor" d="M24 4v4M13.5 7.5l2 2.5M34.5 7.5l-2 2.5" />
      </>
    ),
  },
  {
    href: "/battery",
    title: "家庭用蓄電池",
    body: "昼の電気をためて夜に使い、停電時の備えにもなります。容量と設置場所を、住まいに合わせて検討します。",
    icon: (
      <>
        <rect x="13" y="10" width="22" height="30" rx="2" />
        <path d="M20 10V6h8v4" />
        <path className="text-orange-500" stroke="currentColor" d="m25 17-5 8h8l-5 8" />
      </>
    ),
  },
  {
    href: "/solar-battery",
    title: "太陽光＋蓄電池",
    body: "つくった電気をためて使います。工事と申請を1回にまとめられ、葛飾区では併設加算の対象です。",
    icon: (
      <>
        <path d="M6 24 20 12l14 12" />
        <path d="M10 22v16h20V22" />
        <path d="M13 19.5 20 13.5l7 6" strokeWidth="1.5" />
        <rect x="34" y="24" width="8" height="14" rx="1.5" />
        <path className="text-orange-500" stroke="currentColor" d="M38 27v8M30 31h4" />
      </>
    ),
  },
  {
    href: "/v2h",
    title: "V2H",
    body: "電気自動車の電気を家で使えるようにする設備です。葛飾区の助成の対象設備に含まれます。",
    icon: (
      <>
        <path d="M6 30v-6l4-8h16l4 8v6z" />
        <path d="M6 30h24M11 34a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM25 34a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <rect x="36" y="14" width="7" height="20" rx="1.5" />
        <path className="text-orange-500" stroke="currentColor" d="M30 24h6" />
      </>
    ),
  },
];

const VALUES = [
  {
    title: "補助金は、一次情報で確認します",
    body: "区・都・国の公式情報を確認し、確認した日付を明記してお伝えします。併用するときの上限や申請の順番も、公式資料で確認してお伝えします。",
  },
  {
    title: "住宅ごとに、必要な設備を検討します",
    body: "屋根の形、電気の使い方、停電時にどこまで備えたいか。先に設備を決めず、住まいの条件から考えます。",
  },
  {
    title: "葛飾区を中心に対応します",
    body: `拠点は${siteConfig.company.address.city}${siteConfig.company.address.town}です。区内の住宅地の条件と水害リスクを踏まえて、機器の設置場所まで検討します。`,
  },
  {
    title: "導入前から導入後まで、相談できます",
    body: "最初のご相談から、現地調査、お見積もり、補助金の申請、工事、運転開始後のご相談まで、お受けします。",
  },
];

const FLOW = [
  { title: "ご相談・ヒアリング", meta: "フォーム・お電話で" },
  { title: "現地調査", meta: "無料" },
  { title: "ご提案・お見積もり", meta: "内訳を分けて提示" },
  { title: "補助金の事前手続き", meta: "着工4週間前までに事前協議" },
  { title: "設置工事", meta: "区の回答書の到着後に着工" },
  { title: "完了報告・導入後の相談", meta: "交付申請〜運転開始後" },
];

export default function HomePage() {
  const infoDate = formatDateJa(siteConfig.subsidyInfoDate);
  const s = (id: string) => getSubsidy(id)!;
  const solar = s("katsushika-solar");
  const battery = s("katsushika-battery");
  const addon = s("katsushika-solar-battery-addon");
  const hSolar = headline(solar)!;
  const hBattery = headline(battery)!;
  const hAddon = headline(addon)!;

  const subsidyCards = [
    { label: "太陽光発電", h: hSolar, note: solar.amount },
    { label: "蓄電池", h: hBattery, note: battery.amount },
    { label: "太陽光＋蓄電池の併設加算", h: hAddon, note: "既設の機器への併設も対象" },
  ];

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

  return (
    <>
      {/* ───────── 1. ヒーロー（写真を全面背景に。CTA は置かない） */}
      <HomeHero
        infoDate={infoDate}
        facts={[
          { label: "太陽光発電", prefix: hSolar.prefix, value: hSolar.value, unit: hSolar.unit },
          { label: "蓄電池", prefix: hBattery.prefix, value: hBattery.value, unit: hBattery.unit },
        ]}
      />

      {/* ───────── ヒーロー直下：いちばん敷居の低い導線（文字リンクにして、強いボタンはこの後の 4 に任せる） */}
      <section aria-label="補助金の確認" className="border-b border-line bg-white">
        <Container className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="text-base leading-[1.7] text-ink-2">
            <strong className="font-heading font-black text-navy-900">まず補助金だけ確認したい方へ。</strong>
            <span className="sm:ml-1">条件を選ぶと、葛飾区と東京都の想定額を別々に試算できます。</span>
          </p>
          <Link href="/simulation" className="group inline-flex min-h-11 shrink-0 items-center gap-2 font-heading text-base font-bold text-navy-900 underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text">
            補助金シミュレーターを使う
            <ArrowIcon />
          </Link>
        </Container>
      </section>

      {/* ───────── 2. SOLAR SHIFT とは */}
      <section className="py-16 sm:py-24" aria-labelledby="about">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="SOLAR SHIFT とは"
                title={
                  <span id="about">
                    葛飾区の太陽光発電・蓄電池を、
                    <br className="hidden sm:block" />
                    補助金の整理から導入後まで。
                  </span>
                }
              />
              <p className="mt-5 text-base leading-[2] text-ink-2" {...reveal(60)}>
                {siteConfig.name}（{siteConfig.nameJa}）は、{siteConfig.company.address.locality}の{siteConfig.company.name}
                が運営する、住宅用太陽光発電・家庭用蓄電池の導入サポートサービスです。葛飾区と東京都の補助金を一次情報で確認し、住まいの条件に合う設備と、申請の順番を一緒に整理します。
              </p>
              <p className="mt-4 flex flex-wrap gap-x-7 gap-y-1" {...reveal(100)}>
                <LinkButton href="/reason" variant="ghost">
                  SOLAR SHIFT の考え方
                </LinkButton>
                <LinkButton href="/company" variant="ghost">
                  運営会社
                </LinkButton>
              </p>
            </div>
            <div className="self-start" {...reveal(120)}>
              <DefinitionList
                rows={[
                  { term: "運営", description: siteConfig.company.name },
                  { term: "拠点", description: siteConfig.company.address.locality },
                  { term: "対応エリア", description: areaText },
                  { term: "ご相談・現地調査", description: "無料（お見積もりも無料です）" },
                ]}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── 3. 葛飾区の2026年度補助金（いちばん大事な数字だけ） */}
      <section className="border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="subsidy">
        <Container>
          <SectionHeading
            eyebrow="2026年度（令和8年度）"
            title={<span id="subsidy">葛飾区の太陽光・蓄電池の補助金</span>}
            lead={`葛飾区の「${katsushikaProgram.programName}」の、いちばん大事なところだけをまとめました。条件・必要書類・申請の流れは、補助金のページで説明しています。`}
          />
          <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3" {...reveal(60)}>
            {subsidyCards.map((c) => (
              <li key={c.label} className="bg-white px-6 py-7">
                <p className="text-[14px] font-bold text-ink-2">{c.label}</p>
                <p className="mt-2 flex items-baseline gap-1.5 text-navy-900">
                  {c.h.prefix && <span className="text-base font-bold">{c.h.prefix}</span>}
                  <span className="num-xl text-[52px] text-orange-600">{c.h.value}</span>
                  <span className="font-heading text-[18px] font-black">{c.h.unit}</span>
                </p>
                <p className="mt-2 text-[14px] leading-[1.7] text-ink-2">{c.note}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2" {...reveal(100)}>
            <div className="border-l-4 border-navy-900 bg-white px-5 py-4">
              <dt className="text-[13px] font-bold text-ink-2">事前の手続き</dt>
              <dd className="mt-1 font-heading text-[17px] leading-[1.6] font-black text-navy-900">原則、工事着工の4週間前までに事前協議</dd>
            </div>
            <div className="border-l-4 border-navy-900 bg-white px-5 py-4">
              <dt className="text-[13px] font-bold text-ink-2">申込期間</dt>
              <dd className="mt-1 font-heading text-[17px] leading-[1.6] font-black text-navy-900">{solar.applicationPeriod}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[13px] leading-[1.8] text-ink-3">
            ※ {infoDate}時点の葛飾区公式情報。対象可否・助成額は住宅条件・機器・申請時期で異なります。東京都の助成は別の制度です。併用できますが、補助金の合計は助成対象経費が上限です。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2">
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

      {/* ───────── 4. 補助金シミュレーターへの導線（ここがいちばん強い CTA） */}
      <SubsidyBanner />

      {/* ───────── 施工事例（掲載の許可をいただいた事例。葛飾区のものを先に出す） */}
      {homeWorks.length > 0 && (
        <section className="cv-auto border-b border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="works">
          <Container>
            <SectionHeading
              eyebrow="施工事例"
              title={<span id="works">葛飾区で導入されたお客様の事例</span>}
              lead="掲載の許可をいただいた事例を紹介します。ご家族の構成、導入した設備、導入前後の電気代をまとめています。"
            />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {homeWorks.map((w, i) => (
                <li key={w.slug} {...reveal(i * 60)}>
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

      {/* ───────── 5. サービス（アイコンだけでそろえる） */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="services">
        <Container>
          <SectionHeading eyebrow="サービス" title={<span id="services">太陽光発電・蓄電池・V2H の導入をサポートします</span>} />
          <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4" {...reveal(60)}>
            {SERVICES.map((sv) => (
              <li key={sv.href} className="relative flex flex-col bg-white px-6 py-7 transition-colors duration-200 hover:bg-paper-2">
                <ServiceIcon>{sv.icon}</ServiceIcon>
                <h3 className="mt-4 text-[19px] font-black text-navy-900">
                  <Link href={sv.href} className="after:absolute after:inset-0 after:content-['']">
                    {sv.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-base leading-[1.85] text-ink-2">{sv.body}</p>
                <p className="mt-4 flex items-center gap-1.5 text-[14px] font-bold text-accent-text" aria-hidden="true">
                  詳しく見る
                  <ArrowIcon className="h-3.5 w-3.5" />
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] text-ink-2">
            エネルギーの見える化と制御は
            <Link href="/hems" className="mx-1 inline-flex min-h-11 items-center font-bold text-navy-700 underline underline-offset-4 hover:text-accent-text">
              HEMS
            </Link>
            のページで説明しています。
          </p>
        </Container>
      </section>

      {/* ───────── 6. SOLAR SHIFT の考え方（写真1枚＋4つの約束） */}
      <section className="cv-auto border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="values">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="overflow-hidden rounded-xl" {...reveal()}>
              <Image
                src={images.heroSolarHomeRiverside.src}
                alt={images.heroSolarHomeRiverside.alt}
                width={images.heroSolarHomeRiverside.width}
                height={images.heroSolarHomeRiverside.height}
                sizes="(max-width: 1023px) 100vw, 46vw"
                quality={60}
                className="aspect-[4/3] h-auto w-full object-cover object-[68%_50%] lg:aspect-[5/4]"
              />
            </div>
            <div>
              <SectionHeading eyebrow="SOLAR SHIFT の考え方" title={<span id="values">設備を売る前に、条件を整理します</span>} />
              <ol className="mt-8 space-y-6">
                {VALUES.map((v, i) => (
                  <li key={v.title} className="grid grid-cols-[2.75rem_1fr] gap-4" {...reveal(60 + i * 50)}>
                    <span className="font-en text-[26px] leading-none font-extrabold text-orange-700" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-[18px] leading-[1.5] font-black text-navy-900">{v.title}</h3>
                      <p className="mt-1.5 text-base leading-[1.85] text-ink-2">{v.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-7">
                <LinkButton href="/reason" variant="secondary">
                  考え方を詳しく見る
                  <ArrowIcon />
                </LinkButton>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── 7. 葛飾区で太陽光を考える理由（小さな写真でそろえる） */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="katsushika">
        <Container>
          <SectionHeading eyebrow="葛飾区の住まいと太陽光" title={<span id="katsushika">葛飾区で太陽光発電・蓄電池を考える、3つの理由</span>} />
          <ul className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
            {reasons.map((r, i) => (
              <li key={r.title} className="grid grid-cols-[6rem_1fr] gap-4 sm:grid-cols-[7rem_1fr] lg:grid-cols-1" {...reveal(i * 60)}>
                <Image
                  src={r.image.src}
                  alt=""
                  width={r.image.width}
                  height={r.image.height}
                  sizes="(max-width: 1023px) 112px, 160px"
                  className="aspect-square h-auto w-full rounded-lg object-cover lg:w-40"
                />
                <div>
                  <h3 className="text-[18px] leading-[1.5] font-black text-navy-900">{r.title}</h3>
                  <p className="mt-2 text-base leading-[1.85] text-ink-2">{r.body}</p>
                  <p className="mt-1">
                    <LinkButton href={r.href} variant="ghost">
                      {r.label}
                    </LinkButton>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] leading-[1.8] text-ink-3">※ 世帯数（2026年4月1日時点）と地形の情報は、葛飾区公式サイトによります。写真はイメージです。</p>
        </Container>
      </section>

      {/* ───────── 8. 導入までの流れ */}
      <section className="cv-auto border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="flow">
        <Container>
          <SectionHeading
            eyebrow="導入までの流れ"
            title={<span id="flow">ご相談から運転開始まで、6つのステップ</span>}
            lead="葛飾区の助成は、原則として着工の4週間前までの事前協議が必要です。契約日ではなく着工日から逆算して、申請と工事の順番を組み立てます。"
          />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-6" {...reveal(60)}>
            {FLOW.map((f, i) => (
              <li key={f.title} className="bg-white px-5 py-5">
                <p className="font-en text-[12px] font-bold tracking-[0.12em] text-accent-text">STEP {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1.5 text-[16px] leading-[1.5] font-black text-navy-900">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-[1.7] text-ink-2">{f.meta}</p>
              </li>
            ))}
          </ol>
          <p className="mt-7">
            <LinkButton href="/flow" variant="secondary">
              導入・施工の流れを詳しく見る
              <ArrowIcon />
            </LinkButton>
          </p>
        </Container>
      </section>

      {/* ───────── 9. 商品・メーカー */}
      <div className="cv-auto py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <MakerShowcase headingId="products" />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
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
        <section className="cv-auto border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="blog">
          <Container>
            <SectionHeading eyebrow="ブログ" title={<span id="blog">補助金・太陽光・蓄電池の新しい記事</span>} />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <div key={p.slug} {...reveal(i * 60)}>
                  <ArticleCard post={p} />
                </div>
              ))}
            </div>
            <p className="mt-8">
              <LinkButton href="/blog" variant="secondary">
                記事一覧を見る
                <ArrowIcon />
              </LinkButton>
            </p>
          </Container>
        </section>
      )}

      {/* ───────── 11. よくある質問（人物イラストはここで使う） */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="faq">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeading eyebrow="よくある質問" title={<span id="faq">補助金・費用・工事のよくある質問</span>} />
              <Image src={images.peopleWomanThink.src} alt="" width={images.peopleWomanThink.width} height={images.peopleWomanThink.height} sizes="200px" className="mx-auto mt-6 hidden h-auto w-44 lg:block" />
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

      {/* ───────── 12. 会社・運営情報 */}
      <section className="cv-auto border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="company">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="運営会社"
                title={<span id="company">{siteConfig.company.name}が運営しています</span>}
                lead="運営会社・所在地・代表者・連絡先を明記し、記事と補助金情報の編集方針も公開しています。"
              />
              <p className="mt-6 flex flex-wrap gap-x-7 gap-y-1" {...reveal(80)}>
                <LinkButton href="/company" variant="ghost">
                  会社情報
                </LinkButton>
                <LinkButton href="/editorial-policy" variant="ghost">
                  記事・補助金情報の編集方針
                </LinkButton>
              </p>
            </div>
            <div className="bg-white px-5 sm:px-7" {...reveal(100)}>
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
            dateModified: siteConfig.subsidyInfoDate,
          }),
        )}
      />
    </>
  );
}
