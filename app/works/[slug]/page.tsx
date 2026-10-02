import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { publishedWorks, getWork } from "@/data/works";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { CtaSection } from "@/components/sections/CtaSection";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) return {};
  return buildMetadata({
    title: `${w.title}｜施工事例`,
    description: `${w.area}・${w.housingType}の施工事例。${[w.solarKw ? `太陽光${w.solarKw}kW` : "", w.batteryKwh ? `蓄電池${w.batteryKwh}kWh` : "", w.v2h ? "V2H" : ""].filter(Boolean).join("・")}。導入理由・施工前後の状況・活用した補助金を紹介。`,
    path: `/works/${w.slug}`,
    type: "article",
    modifiedTime: w.updatedAt,
  });
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();
  const path = `/works/${w.slug}`;
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "施工事例", href: "/works" },
    { name: w.title, href: path },
  ];
  const rows = [
    { term: "地域", description: w.area },
    { term: "住宅タイプ", description: w.housingType },
    ...(w.buildingAge ? [{ term: "築年数", description: w.buildingAge }] : []),
    { term: "屋根形状", description: w.roofShape },
    { term: "太陽光容量", description: w.solarKw !== null ? `${w.solarKw}kW` : "—" },
    { term: "蓄電池容量", description: w.batteryKwh !== null ? `${w.batteryKwh}kWh` : "—" },
    { term: "V2H / HEMS", description: `${w.v2h ? "V2Hあり" : "V2Hなし"}／${w.hems ? "HEMSあり" : "HEMSなし"}` },
    { term: "メーカー", description: w.manufacturer.join("、") || "—" },
    { term: "活用した補助金", description: w.subsidies.length ? w.subsidies.join("、") : "—" },
    { term: "施工日", description: w.installedAt },
    ...(w.constructionPeriod ? [{ term: "工事期間", description: w.constructionPeriod }] : []),
  ];

  return (
    <>
      <Container className="pt-2 sm:pt-3">
        <Breadcrumb crumbs={crumbs} />
      </Container>
      <Container size="prose" className="py-8 sm:py-12">
        <p className="text-[13px] font-bold text-accent-text">{w.area}／{w.housingType}</p>
        <h1 className="mt-2 text-[28px] leading-[1.35] font-bold text-navy-900 sm:text-[34px]">{w.title}</h1>
        <LastUpdated updatedAt={w.updatedAt} className="mt-4" />
        <div className="mt-8">
          <ImagePlaceholder src={w.images[0]?.src} alt={w.images[0]?.alt ?? `${w.area}の施工事例`} ratio="3/2" label="施工写真準備中" priority />
          {w.images[0]?.caption && <p className="mt-2 text-[12px] text-ink-3">{w.images[0].caption}</p>}
        </div>
        <DefinitionList rows={rows} className="mt-10" />
        <section className="prose-ss mt-10">
          <h2>施工前の状況</h2>
          <p>{w.before}</p>
          <h2>施工後の状況</h2>
          <p>{w.after}</p>
          <h2>導入理由</h2>
          <p>{w.reason}</p>
          {w.voice && (
            <>
              <h2>お客様の声</h2>
              <blockquote>{w.voice}</blockquote>
            </>
          )}
        </section>
        {w.images.length > 1 && (
          <section className="mt-10" aria-label="施工写真">
            <h2 className="text-[20px] leading-[1.45] font-black text-navy-900">施工写真</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {w.images.slice(1).map((img) => (
                <figure key={img.src}>
                  <ImagePlaceholder src={img.src} alt={img.alt} ratio="4/3" />
                  {img.caption && <figcaption className="mt-1 text-[12px] text-ink-3">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}
        <p className="mt-10 text-[13px] text-ink-3">施工日：{w.installedAt}／掲載日：{formatDateJa(w.updatedAt)}。お客様の掲載許可を得て掲載しています。</p>
        <p className="mt-6">
          <Link href="/works" className="text-[14px] font-bold text-navy-600 underline underline-offset-4">施工事例一覧へ戻る</Link>
        </p>
      </Container>
      <CtaSection title="似た条件の住まいなら、同じように計画できます。" body="屋根条件・設備構成・補助金の整理まで、現地調査のうえでご提案します。相談・見積もりは無料です。" />
      <JsonLd data={graph(articleSchema({ path, title: w.title, description: `${w.area}・${w.housingType}の施工事例`, datePublished: w.updatedAt, dateModified: w.updatedAt, image: w.images[0]?.src }))} />
    </>
  );
}
