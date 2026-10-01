import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { areasWithPage, getArea } from "@/data/areas";
import { getProgram } from "@/data/subsidies";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { images } from "@/data/images";

export const dynamicParams = false;

export function generateStaticParams() {
  return areasWithPage.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area?.page) return {};
  return buildMetadata({
    title: `${area.name}の太陽光発電・蓄電池｜補助金・住宅事情・水害リスクと備え`,
    description: `${area.name}で太陽光発電・蓄電池を導入する方へ。${area.name}の補助金制度（かつしかエコ助成金・東京都の助成）、戸建の多い住宅事情と屋根条件、水害リスクを踏まえた機器の設置、地域特化FAQ。${siteConfig.company.name}運営のSOLAR SHIFT。`,
    path: `/area/${area.slug}`,
    keywords: [`${area.name} 太陽光`, `${area.name} 太陽光発電`, `${area.name} 蓄電池`, `${area.name} 太陽光 業者`, `${area.name} 太陽光 おすすめ`, `${area.name} ソーラーパネル`],
    type: "article",
    modifiedTime: siteConfig.subsidyInfoDate,
  });
}

export default async function AreaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area?.page) notFound();
  const page = area.page;
  const path = `/area/${area.slug}`;
  const programs = page.subsidyProgramIds.map((id) => getProgram(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const posts = getPostsForPillar(["katsushika-subsidy", "blackout"], 3);
  const sources = [
    ...page.officialLinks.map((l) => ({ name: l.name, url: l.url, verifiedAt: siteConfig.subsidyInfoDate })),
    ...page.disaster.filter((d) => d.sourceUrl).map((d) => ({ name: d.sourceName!, url: d.sourceUrl!, verifiedAt: siteConfig.subsidyInfoDate })),
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "対応エリア", href: "/area" },
          { name: `${area.name}の太陽光発電`, href: path },
        ]}
        eyebrow={`${area.prefecture}${area.name}｜主要対応エリア`}
        title={<>{area.name}の太陽光発電・蓄電池<span className="block text-[0.7em] text-ink-2">補助金・住宅事情・水害リスクと備え</span></>}
        lead={page.lead}
      >
        <LastUpdated updatedAt={siteConfig.subsidyInfoDate} verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <KeyPoints
          conclusion={`${area.name}で太陽光発電・蓄電池を導入する場合、区の「かつしかエコ助成金」と東京都の助成の両方が検討対象です（${formatDateJa(siteConfig.subsidyInfoDate)}時点）。区の助成は工事着工4週間前までの事前協議が原則必要です。${area.name}は戸建の多い住宅都市で、隣家との距離が近い敷地では影の確認が重要です。また区の半分近くが海抜ゼロメートル地帯のため、蓄電池やパワーコンディショナの設置場所は浸水想定を踏まえて検討します。`}
          points={[
            "補助金：区（太陽光6万円/kW 上限30万円、蓄電池1/4 上限20万円、併設加算5万円、HEMS、V2H）＋都（太陽光・蓄電池）。併用可否は各窓口で確認",
            "住宅事情：戸建が多く、隣家との距離が近い。屋根の形・影の影響を現地で確認",
            "災害リスク：海抜ゼロメートル地帯。機器の設置高さと在宅避難の備えを検討",
            `SOLAR SHIFT の拠点は${area.name}白鳥。区内全域が主要対応エリア`,
          ]}
        />

        <section className="mt-14" aria-labelledby="subsidy-h">
          <h2 id="subsidy-h" className="text-[24px] font-bold text-navy-900 sm:text-[28px]">{area.name}で使える補助金（{formatDateJa(siteConfig.subsidyInfoDate)}時点）</h2>
          <div className="mt-6 space-y-10">
            {programs.map((p) => (
              <div key={p.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[18px] font-bold text-navy-900">{p.area === "katsushika" ? "葛飾区" : "東京都"}｜{p.programName}</h3>
                  <Link href={p.area === "katsushika" ? "/subsidy/katsushika" : "/subsidy/tokyo"} className="text-[13px] font-bold text-navy-600 underline underline-offset-4">詳しく見る</Link>
                </div>
                <p className="mt-2 text-[14px] leading-[1.8] text-ink-2">{p.summary}</p>
                <div className="mt-4">
                  <SubsidyTable menus={p.menus} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/simulation" variant="primary">わが家の想定助成額を試算する <ArrowIcon /></LinkButton>
          </div>
          <SubsidyDisclaimer className="mt-6" />
        </section>

        <section className="mt-16" aria-labelledby="housing-h">
          <h2 id="housing-h" className="text-[24px] font-bold text-navy-900 sm:text-[28px]">{area.name}の住宅事情と屋根条件</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
            <ImagePlaceholder src={images.katsushikaStreetSunset.src} alt={images.katsushikaStreetSunset.alt} ratio="4/3" label={`${area.name}の街並み写真（差し替え）`} className="lg:sticky lg:top-24" />
            <div className="space-y-6">
              {page.housing.map((h) => (
                <div key={h.title}>
                  <h3 className="text-[18px] font-bold text-navy-900">{h.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.9] text-ink">{h.body}</p>
                </div>
              ))}
              <p className="text-[14px] text-ink-2">
                屋根条件の見方は<Link href="/guide/roof-conditions" className="mx-1 text-navy-600 underline underline-offset-4">太陽光に向く屋根の条件</Link>をご覧ください。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="disaster-h">
          <h2 id="disaster-h" className="text-[24px] font-bold text-navy-900 sm:text-[28px]">{area.name}の災害リスクと停電への備え</h2>
          <div className="mt-6 space-y-6">
            {page.disaster.map((d) => (
              <div key={d.title} className="border-l-4 border-navy-900 pl-5">
                <h3 className="text-[18px] font-bold text-navy-900">{d.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.9] text-ink">{d.body}</p>
                {d.sourceUrl && (
                  <p className="mt-2 text-[13px] text-ink-3">
                    出典：<a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4">{d.sourceName}</a>
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-5 text-[14px] text-ink-2">
            停電時に太陽光・蓄電池で何ができるかは<Link href="/guide/blackout" className="mx-1 text-navy-600 underline underline-offset-4">停電時の太陽光・蓄電池</Link>で解説しています。
          </p>
        </section>

        {page.towns && page.towns.length > 0 && (
          <section className="mt-16" aria-labelledby="towns-h">
            <h2 id="towns-h" className="text-[20px] font-bold text-navy-900">{area.name}内の対応地域（代表例）</h2>
            <p className="mt-2 text-[14px] text-ink-2">{area.name}内は全域が主要対応エリアです。以下は代表的な地域名で、網羅ではありません。</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {page.towns.map((t) => (
                <li key={t} className="border border-line bg-paper-2 px-3 py-1 text-[13px] text-ink-2">{t}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-16" aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-[24px] font-bold text-navy-900 sm:text-[28px]">{area.name}の太陽光・蓄電池についてよくある質問</h2>
          <FaqSection items={page.faq} withSchema className="mt-6" />
        </section>

        <section className="mt-16" aria-labelledby="links-h">
          <h2 id="links-h" className="text-[20px] font-bold text-navy-900">{area.name}の公式情報</h2>
          <ul className="mt-4 space-y-2 text-[14px]">
            {page.officialLinks.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">{l.name}</a>
              </li>
            ))}
          </ul>
        </section>

        <SourceList sources={sources} className="mt-12" />
        <div className="mt-10">
          <AuthorBox />
        </div>

        <nav className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="関連ページ">
          {[
            { href: "/subsidy/katsushika", label: `${area.name}の補助金を詳しく` },
            { href: "/solar", label: "太陽光発電について" },
            { href: "/battery", label: "家庭用蓄電池について" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="border border-line bg-white px-4 py-3 text-[14px] font-bold text-navy-900 hover:border-navy-900">
              {l.label} →
            </Link>
          ))}
        </nav>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title={`${area.name}に関する記事`} />
        </Container>
      )}

      <CtaSection
        title={`${area.name}の住まいに合わせた、太陽光・蓄電池の計画を。`}
        body={`拠点は${area.name}白鳥。区内の住宅事情と水害リスクを踏まえ、区と都の補助金を整理した提案を行います。現地調査・お見積もりは無料です。`}
      />
      <JsonLd data={graph(articleSchema({ path, title: `${area.name}の太陽光発電・蓄電池｜補助金・住宅事情・水害リスクと備え`, description: page.lead, datePublished: "2026-10-01", dateModified: siteConfig.subsidyInfoDate, keywords: [`${area.name} 太陽光`, `${area.name} 蓄電池`] }))} />
    </>
  );
}
