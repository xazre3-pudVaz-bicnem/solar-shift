import { BigNumbers } from "@/components/subsidy/BigNumbers";
import { WorksCard } from "@/components/works/WorksCard";
import { worksInCity, WORK_BILL_NOTE } from "@/data/works";
import { TrustFacts } from "@/components/ui/TrustFacts";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig, addressWithPostal, companyMapUrl, companyMapEmbedUrl } from "@/lib/site";
import { areasWithPage, areaPageTitle, getArea, secondaryAreas } from "@/data/areas";
import { getWardProgram } from "@/data/ward-programs";
import { NeighborAreaPage } from "@/components/area/NeighborAreaPage";
import { PublicSolarFigure } from "@/components/area/PublicSolarFigure";
import { getSubsidy } from "@/data/subsidies";
import { KATSUSHIKA_PRE_CONSULTATION_WEEKS } from "@/data/subsidies/katsushika-details";
import { sources as verified } from "@/data/sources";
import { headline } from "@/lib/subsidy-headline";
import { images } from "@/data/images";
import { reveal } from "@/lib/reveal";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { Toc } from "@/components/ui/Toc";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Steps } from "@/components/ui/Steps";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema, serviceSchema } from "@/lib/schema";

/**
 * エリアページ。
 *   - 葛飾区 … 業者としての案内（このファイルの本体）
 *   - 足立区・墨田区・江戸川区 … 区の補助金の要点（components/area/NeighborAreaPage.tsx。内容は data/ward-programs.ts）
 *
 * 葛飾区の検索意図：「葛飾区 太陽光 業者」「葛飾区 太陽光 施工」「葛飾区 太陽光 会社」「葛飾区 蓄電池 業者」
 * ＝ 葛飾区で頼める業者（会社）と、対応している地域・進め方を知りたい。
 *
 * ほかのページとの役割分担（lib/seo-map.ts）
 *   - 補助金の金額・書類・時系列の詳細 … /subsidy/katsushika（ここには要点だけ）
 *   - 太陽光・蓄電池そのものの解説     … /solar /battery
 *   - サービス全体の入口               … /
 *
 * 施工体制・保証・資格・実績など、確認できていないことは書かない（会社情報は lib/site.ts にあるものだけ）。
 * 地名は「区内の対応エリア」としてこのページの中でだけ挙げる（地名ごとのページは作らない）。
 */
export const dynamicParams = false;

const UPDATED = "2026-10-02";

export function generateStaticParams() {
  return areasWithPage.map((a) => ({ slug: a.slug }));
}

function descriptionOf(name: string) {
  return `${name}で太陽光発電・蓄電池の業者をお探しの方へ。SOLAR SHIFT は${siteConfig.company.address.city}${siteConfig.company.address.town}の${siteConfig.company.name}が運営し、区内全域に対応しています。対応地域、相談から施工までの進め方、業者を選ぶときに確かめたい点をまとめました。`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  const ward = getWardProgram(slug);
  if (area && ward) {
    return buildMetadata({
      title: ward.title,
      description: ward.description,
      path: `/area/${area.slug}`,
      keywords: [`${area.name} 太陽光 補助金`, `${area.name} 蓄電池 補助金`, `${area.name} 太陽光発電 補助金`, `${area.name} 太陽光 業者`],
      modifiedTime: ward.sources[0].verifiedAt,
    });
  }
  if (!area?.page) return {};
  return buildMetadata({
    title: areaPageTitle(area),
    description: descriptionOf(area.name),
    path: `/area/${area.slug}`,
    keywords: [`${area.name} 太陽光 業者`, `${area.name} 太陽光 施工`, `${area.name} 太陽光 会社`, `${area.name} 蓄電池 業者`],
    modifiedTime: UPDATED,
  });
}

const H2 = "border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900 sm:text-[28px]";
const LEAD = "mt-4 max-w-3xl text-base leading-[1.9] text-ink-2";
const TEXT_LINK = "font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text";

export default async function AreaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getArea(slug);
  const ward = getWardProgram(slug);
  if (area && ward) return <NeighborAreaPage area={area} program={ward} />;
  if (!area?.page) notFound();
  const page = area.page;
  const path = `/area/${area.slug}`;
  const c = siteConfig.company;
  const posts = getPostsForPillar(["install-maintenance", "katsushika-subsidy"], 3, { path: `/area/${area.slug}` });

  const solar = getSubsidy("katsushika-solar")!;
  const battery = getSubsidy("katsushika-battery")!;
  const addon = getSubsidy("katsushika-solar-battery-addon")!;
  const numbers = [
    { label: "太陽光発電", s: solar },
    { label: "蓄電池", s: battery },
    { label: "太陽光＋蓄電池の併設", s: addon },
  ].map((x) => ({ ...x, h: headline(x.s)! }));

  const mainTowns = page.mainTowns ?? [];
  const pageSources = [
    ...page.officialLinks.map((l) => ({ name: l.name, url: l.url, verifiedAt: siteConfig.subsidyInfoDate })),
    verified.katsushikaGuide,
    verified.katsushikaEcoIndex,
    verified.katsushikaPublicSolar,
  ];
  const embedUrl = companyMapEmbedUrl();

  /** 業者を選ぶときに確かめること。1〜3 と 5・6 は葛飾区の案内・手引きにある内容 */
  const checkpoints: { title: string; body: string }[] = [
    {
      title: "「区の委託」「区の紹介」を名乗っていないか",
      body: `${area.name}は、特定の業者に営業・販売を委託することも、業者を紹介することもないと案内しています。そう名乗る業者とは、その場で契約しないでください。`,
    },
    {
      title: "複数の業者から見積もりを取る",
      body: "区は、高額な契約を避けるために、複数の業者から見積もりを取ることを勧めています。契約を急がせる業者にも注意を呼びかけています。",
    },
    {
      title: "見積書の内訳が分かれているか",
      body: "区の助成の申し込みには、機器本体・工事費・調整額がそれぞれ分かる見積書が必要です。「一式」とだけ書かれた見積書には、内訳書を付けてもらいます。",
    },
    {
      title: "申請の順番を説明できるか",
      body: `区の助成は、着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに事前協議を申し込み、回答書が届いてから工事を始めます。この順番と日程を、契約の前に説明してもらいます。区は、事前協議書を出す前に設備を導入するなど、要件に反した手続代行者・施工業者を、助成の対象外にする措置をとり、公式サイトで公表しています。`,
    },
    {
      title: "機器が助成の要件を満たしているか",
      body: "太陽光はJETなどの認証を受けたモジュール、蓄電池はSIIに登録された機器が対象です。型番で確かめられます。",
    },
    {
      title: "契約と申請の名義がそろっているか",
      body: "区の助成では、申請者・住んでいる方・領収書の名義・振込口座の名義が同じである必要があります。契約の名義を、先に確かめておきます。",
    },
    {
      title: "保証と施工の体制を、書面で確かめる",
      body: "機器の保証、工事の保証、だれが施工するかは、会社や製品によって違います。口頭ではなく、書面で確かめてください。SOLAR SHIFT の内容も、お見積もりの際に遠慮なくご確認ください。",
    },
  ];

  // この地域で導入されたお客様の事例（掲載の許可をいただいたものだけ）
  const cityWorks = worksInCity(area.name);

  const toc = [
    { id: "about", label: "SOLAR SHIFT について" },
    { id: "towns", label: `${area.name}内の対応エリア` },
    ...(cityWorks.length > 0 ? [{ id: "works", label: `${area.name}の施工事例` }] : []),
    { id: "checkpoints", label: "業者を選ぶときに確かめること" },
    { id: "flow", label: "ご相談から設置まで" },
    { id: "subsidy", label: `${area.name}で使える補助金（要点）` },
    { id: "housing", label: `${area.name}の住まいで気をつけること` },
    { id: "faq", label: "よくある質問" },
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "対応エリア", href: "/area" },
          { name: `${area.name}の太陽光・蓄電池業者`, href: path },
        ]}
        eyebrow={`${area.prefecture}${area.name}｜主要対応エリア`}
        title={
          <>
            {area.name}の太陽光発電・蓄電池業者をお探しの方へ
            <span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">
              {c.address.town}の会社が、ご相談から施工・導入後まで対応します
            </span>
          </>
        }
        lead={page.lead}
        image={images.heroSolarHomeRiverside}
      >
        <LastUpdated updatedAt={UPDATED} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints
            conclusion={`SOLAR SHIFT は、${c.address.locality}の${c.name}が運営する太陽光発電・蓄電池の事業です。${area.name}内は全域に対応し、現地調査とお見積もりは無料です。区の「かつしかエコ助成金」と東京都の助成を整理し、申請の順番から逆算して計画を立てます。`}
            points={[
              `対応エリア：${mainTowns.slice(0, 5).join("・")}など、${area.name}内の全域`,
              "対応内容：住宅用太陽光発電・家庭用蓄電池・V2H・HEMSの導入と、補助金のご相談",
              "業者選び：区は、複数の業者から見積もりを取ることを勧めています",
            ]}
          />
          <Toc items={toc} className="mt-8" />
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-16 sm:mt-16 sm:space-y-20">
          {/* ───────── 会社・事業の情報 */}
          <section id="about" aria-labelledby="about-h" className="scroll-mt-24">
            <h2 id="about-h" className={H2}>
              {area.name}の業者として、SOLAR SHIFT について
            </h2>
            <p className={LEAD}>どこの会社が、どこまで対応するのか。はじめにお伝えします。</p>
            <DefinitionList
              className="mt-6"
              rows={[
                { term: "サービス名", description: `${siteConfig.name}（${siteConfig.nameJa}）` },
                { term: "運営会社", description: `${c.name}（${c.representativeTitle} ${c.representative}）` },
                { term: "所在地", description: addressWithPostal() },
                {
                  term: "対応エリア",
                  description: `${area.prefecture}${area.name}（全域）。周辺の${secondaryAreas.map((a) => a.name).join("・")}にも対応しています。`,
                },
                { term: "対応内容", description: "住宅用太陽光発電、家庭用蓄電池、太陽光＋蓄電池、V2H、HEMS、補助金の活用のご相談、現地調査、お見積もり、導入後のご相談" },
                { term: "現地調査・お見積もり", description: "無料" },
                ...(siteConfig.contact.telDisplay
                  ? [
                      {
                        term: "電話",
                        description: (
                          <a href={`tel:${siteConfig.contact.tel}`} className={`inline-flex min-h-11 items-center font-en text-[18px] ${TEXT_LINK}`}>
                            {siteConfig.contact.telDisplay}
                          </a>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
            <p className="mt-4 text-base leading-[1.8] text-ink-2">
              会社の詳しい情報は
              <Link href="/company" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                運営会社
              </Link>
              、考え方は
              <Link href="/reason" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                大切にしていること
              </Link>
              をご覧ください。{cityWorks.length > 0 ? `${area.name}で導入されたお客様の事例は、このページの「施工事例」にまとめています。` : "施工事例は、施工が完了し、掲載の許可をいただいたものから公開します。"}
            </p>
            <TrustFacts className="mt-6" />
            {embedUrl && <MapEmbed src={embedUrl} address={addressWithPostal()} title={`${c.name}の所在地`} mapUrl={companyMapUrl()} className="mt-8" />}
          </section>

          {/* ───────── 区内の対応エリア */}
          {page.towns && page.towns.length > 0 && (
            <section id="towns" aria-labelledby="towns-h" className="cv-block scroll-mt-24">
              <h2 id="towns-h" className={H2} {...reveal()}>
                {area.name}内の対応エリア
              </h2>
              <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
                <div>
                  <p className="text-base leading-[1.9] text-ink">
                    拠点のある{mainTowns[0]}をはじめ、{mainTowns.slice(1).join("・")}など、{area.name}内は全域に伺います。現地調査の日程は、お住まいの地域とご都合に合わせてご相談ください。
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-5 text-base text-navy-900">
                    {page.towns.map((t) => (
                      <li key={t} className="font-medium">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">代表的な町名です。ここに無い町も、{area.name}内であれば対応しています。</p>
                </div>
                <div className="overflow-hidden rounded-xl">
                  <Image
                    src={images.katsushikaStreetSunset.src}
                    alt={images.katsushikaStreetSunset.alt}
                    width={images.katsushikaStreetSunset.width}
                    height={images.katsushikaStreetSunset.height}
                    sizes="(max-width: 1023px) 100vw, 352px"
                    quality={60}
                    className="aspect-[16/10] h-auto w-full object-cover lg:aspect-[4/3]"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ───────── この地域の施工事例 */}
          {cityWorks.length > 0 && (
            <section id="works" aria-labelledby="works-h" className="cv-block scroll-mt-24">
              <h2 id="works-h" className={H2} {...reveal()}>
                {area.name}の施工事例
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-[1.9] text-ink">
                {area.name}で太陽光発電・蓄電池を導入されたお客様の事例です。掲載の許可をいただいた範囲で、ご家族の構成、導入した設備、導入前後の電気代を紹介しています。
              </p>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cityWorks.map((w) => (
                  <li key={w.slug}>
                    <WorksCard work={w} />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] leading-[1.8] text-ink-2">※ {WORK_BILL_NOTE}</p>
              <p className="mt-2">
                <Link href="/works" className={`inline-flex min-h-11 items-center ${TEXT_LINK}`}>
                  すべての施工事例を見る
                </Link>
              </p>
            </section>
          )}

          {/* ───────── 業者選び */}
          <section id="checkpoints" aria-labelledby="checkpoints-h" className="cv-block scroll-mt-24">
            <h2 id="checkpoints-h" className={H2} {...reveal()}>
              業者を選ぶときに、確かめてほしい{checkpoints.length}つのこと
            </h2>
            <p className={LEAD}>
              SOLAR SHIFT に限らず、どの業者に頼むときにも役に立つ確認点です。{area.name}の案内と手引きにある内容をもとにしています。
            </p>
            <ol className="mt-6 max-w-3xl divide-y divide-dashed divide-line overflow-hidden rounded-3xl bg-white shadow-card">
              {checkpoints.map((cp, i) => (
                <li key={cp.title} className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                  <span className="mt-[3px] w-7 shrink-0 font-en text-[15px] font-extrabold text-accent-text" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[17px] leading-[1.6] font-bold text-navy-900">{cp.title}</span>
                    <span className="mt-1 block text-base leading-[1.85] text-ink-2">{cp.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-3xl text-base leading-[1.8] text-ink-2">
              見積書の読み方は
              <Link href="/blog/solar-quote-how-to-read" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                太陽光の見積書の見方
              </Link>
              、確認点の詳しい説明は
              <Link href="/blog/katsushika-solar-contractor-checkpoints" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                太陽光業者を選ぶときの確認ポイント
              </Link>
              にまとめています。
            </p>
          </section>

          {/* ───────── 進め方 */}
          <section id="flow" aria-labelledby="flow-h" className="cv-block scroll-mt-24">
            <h2 id="flow-h" className={H2} {...reveal()}>
              ご相談から設置までの進め方
            </h2>
            <p className={LEAD}>区の助成を使う場合は、着工日から逆算して進めます。</p>
            <div className="mt-8 max-w-3xl">
              <Steps
                steps={[
                  { icon: "mail", title: "ご相談", meta: "無料", body: "フォーム・メール・お電話で、ご希望と住まいの状況を伺います。補助金のことだけのご相談もお受けしています。" },
                  { icon: "search", title: "現地調査", meta: "無料", body: "屋根の形・向き・影、分電盤、機器を置く場所を確認します。" },
                  { icon: "calc", title: "お見積もりと、補助金の整理", meta: "契約の前", body: "機器本体と工事費を分けた見積もりと、区・都それぞれの想定助成額をお伝えします。" },
                  { icon: "stamp", title: "事前協議のあとに、工事", meta: `着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに申し込み`, body: "区の事前協議回答書が届いてから、工事を始めます。工事のあとに、完了報告と交付申請を行います。" },
                ]}
              />
            </div>
            <p className="mt-8">
              <Link href="/flow" className={`inline-flex min-h-11 items-center ${TEXT_LINK}`}>
                導入までの流れを詳しく見る →
              </Link>
            </p>
          </section>

          {/* ───────── 補助金（要点だけ。詳細は /subsidy/katsushika） */}
          <section id="subsidy" aria-labelledby="subsidy-h" className="cv-block scroll-mt-24">
            <h2 id="subsidy-h" className={H2} {...reveal()}>
              {area.name}で使える補助金（要点）
            </h2>
            <p className={LEAD}>
              {area.name}の「かつしかエコ助成金」の、主な金額です（{formatDateJa(solar.lastVerified)}時点）。東京都の助成と併用できますが、合計は助成対象経費が上限です。
            </p>
            <BigNumbers className="mt-6" items={numbers.map(({ label, s }) => ({ subsidy: s, label }))} />
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/subsidy/katsushika" variant="primary" size="lg">
                金額・条件・必要書類を詳しく見る <ArrowIcon />
              </LinkButton>
              <LinkButton href="/simulation" variant="secondary" size="lg">
                補助金を試算する
              </LinkButton>
            </div>
          </section>

          {/* ───────── 住まいと災害 */}
          <section id="housing" aria-labelledby="housing-h" className="cv-block scroll-mt-24">
            <h2 id="housing-h" className={H2} {...reveal()}>
              {area.name}の住まいで、設置のときに気をつけること
            </h2>
            <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-2">
              {[...page.housing.map((x) => ({ ...x, sourceName: undefined as string | undefined, sourceUrl: undefined as string | undefined })), ...page.disaster].map((h) => (
                <div key={h.title}>
                  <h3 className="text-[19px] leading-[1.5] font-black text-navy-900">{h.title}</h3>
                  <p className="mt-2 text-base leading-[1.9] text-ink">{h.body}</p>
                  {h.sourceUrl && (
                    <p className="mt-2 text-[13px] leading-[1.7] text-ink-3">
                      出典：
                      <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
                        {h.sourceName}
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
            <h3 className="mt-12 text-[19px] leading-[1.5] font-black text-navy-900" {...reveal()}>
              {area.name}では、どのくらい発電する？ 区の公共施設の例
            </h3>
            <p className="mt-2 max-w-3xl text-base leading-[1.9] text-ink">
              {area.name}は、太陽光発電システムを設置した区の公共施設について、出力と年間の想定発電量を公表しています。住宅に近い規模の施設もあります。屋根の向きや影によって変わるため、わが家の発電量は、現地調査のうえで見積もります。
            </p>
            <PublicSolarFigure className="mt-6" />
            <p className="mt-8 text-base leading-[1.8] text-ink-2">
              屋根の条件は
              <Link href="/guide/roof-conditions" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                太陽光に向く屋根の条件
              </Link>
              、停電への備えは
              <Link href="/guide/blackout" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                停電時の太陽光・蓄電池
              </Link>
              で解説しています。
            </p>
          </section>

          {/* ───────── FAQ */}
          <section id="faq" aria-labelledby="faq-h" className="cv-block scroll-mt-24">
            <h2 id="faq-h" className={H2} {...reveal()}>
              {area.name}でのご相談について、よくある質問
            </h2>
            <FaqSection items={page.faq} withSchema className="mt-6" />
          </section>

          <SourceList sources={pageSources} />
        </div>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="業者選び・補助金に関する記事" />
        </Container>
      )}

      <CtaSection
        title={`${area.name}の住まいのこと、まずはお聞かせください。`}
        body={`拠点は${c.address.city}${c.address.town}です。屋根と電気の使い方を伺い、区と都の補助金を整理したうえでご提案します。現地調査・お見積もりは無料です。`}
      />
      <JsonLd
        data={graph(
          webPageSchema({ path, mainEntity: "service", name: areaPageTitle(area), description: descriptionOf(area.name), dateModified: UPDATED, sources: pageSources.map((s) => ({ name: s.name, url: s.url })) }),
          serviceSchema({ path, areaNames: [area.name], name: `${area.name}の太陽光発電・蓄電池の導入`, description: descriptionOf(area.name), serviceType: "住宅用太陽光発電・家庭用蓄電池の導入" }),
        )}
      />
    </>
  );
}
