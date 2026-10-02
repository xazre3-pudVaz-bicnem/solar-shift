import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { publishedWorks, getWork, workArea, WORK_BILL_NOTE, type Work } from "@/data/works";
import { areasWithPage } from "@/data/areas";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { Callout } from "@/components/ui/Callout";
import { CtaSection } from "@/components/sections/CtaSection";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { WorksCard, workIcon } from "@/components/works/WorksCard";
import { ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";

/**
 * 施工事例の詳細。
 * 見出し・本文・電気代・設備は、data/works.ts にある表記をそのまま出す（ここで数値を足したり、差額を計算したりしない）。
 * 受け取っていない項目（築年数・屋根形状・メーカー・施工日・工事期間・写真）は出さない。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedWorks.map((w) => ({ slug: w.slug }));
}

function descriptionOf(w: Work): string {
  return `${workArea(w)}・${w.customer}の施工事例。導入した設備は${w.equipment}。ご相談の内容、ご提案した構成、導入前後の電気代を紹介します。`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) return {};
  return buildMetadata({
    title: `${w.label}の施工事例`,
    description: descriptionOf(w),
    path: `/works/${w.slug}`,
    type: "article",
    publishedTime: w.publishedAt,
    modifiedTime: w.updatedAt,
  });
}

/** その事例に関係する固定ページ（設備の種類と地域から決める） */
function relatedLinks(w: Work): { href: string; label: string; description: string }[] {
  const links: { href: string; label: string; description: string }[] = [];
  if (w.hasBattery) links.push({ href: "/solar-battery", label: "太陽光＋蓄電池", description: "同時に導入するときの考え方" });
  else links.push({ href: "/solar", label: "住宅用太陽光発電", description: "仕組みと、容量の決め方" });
  if (w.hasBattery) links.push({ href: "/battery", label: "家庭用蓄電池の選び方", description: "容量と、停電時に使える範囲" });
  if (w.evCharger || w.v2h) links.push({ href: "/v2h", label: "V2H", description: "電気自動車の電気を家で使う仕組み" });
  if (w.housingType?.includes("オール電化")) links.push({ href: "/guide/all-electric", label: "オール電化と太陽光・蓄電池", description: "電気を多く使う家での組み合わせ" });
  if (w.city === "葛飾区") links.push({ href: "/subsidy/katsushika", label: "葛飾区の補助金", description: "かつしかエコ助成金の金額と申請の流れ" });
  links.push({ href: "/simulation", label: "補助金シミュレーター", description: "ご自宅の条件で想定助成額を試算" });
  return links.slice(0, 4);
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();
  const path = `/works/${w.slug}`;
  const area = workArea(w);
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "施工事例", href: "/works" },
    { name: w.label, href: path },
  ];
  const areaPage = w.areaSlug ? areasWithPage.find((a) => a.slug === w.areaSlug) : undefined;
  const rows = [
    { term: "地域", description: areaPage ? <Link href={`/area/${areaPage.slug}`} className="inline-flex min-h-11 items-center font-bold text-navy-700 underline underline-offset-4">{area}</Link> : area },
    { term: "お客様", description: w.customer },
    ...(w.housingType ? [{ term: "住宅", description: w.housingType }] : []),
    ...(w.buildingAge ? [{ term: "築年数", description: w.buildingAge }] : []),
    ...(w.roofShape ? [{ term: "屋根形状", description: w.roofShape }] : []),
    { term: "導入した設備", description: w.equipment },
    ...(w.manufacturer.length > 0 ? [{ term: "メーカー", description: w.manufacturer.join("、") }] : []),
    ...w.extras.map((e) => ({ term: e.label, description: e.value })),
    ...(w.installedAt ? [{ term: "施工した年月", description: w.installedAt.replace("-", "年") + "月" }] : []),
    ...(w.constructionPeriod ? [{ term: "工事期間", description: w.constructionPeriod }] : []),
  ];
  const others = publishedWorks.filter((x) => x.slug !== w.slug).slice(0, 3);
  const icon = workIcon(w);
  const cover = w.images[0];

  return (
    <>
      <Container className="pt-2 sm:pt-3">
        <Breadcrumb crumbs={crumbs} />
      </Container>
      <Container size="prose" className="py-8 sm:py-12">
        <header className="border-b border-line pb-7">
          <p className="flex items-center gap-3 font-heading text-[13px] leading-[1.6] font-bold tracking-[0.06em] text-accent-text">
            <span className="h-px w-8 shrink-0 bg-current" aria-hidden="true" />
            施工事例｜{w.label}
          </p>
          <h1 className="mt-3 text-[26px] leading-[1.5] font-black text-navy-900 sm:text-[34px]">{w.title}</h1>
          <p className="mt-3 text-base leading-[1.8] text-ink-2">
            {area}・{w.customer}
          </p>
          <LastUpdated updatedAt={w.updatedAt} publishedAt={w.publishedAt} className="mt-4" />
        </header>

        {cover && (
          <figure className="mt-8">
            <Image src={cover.src} alt={cover.alt} width={1200} height={800} sizes="(max-width: 767px) 100vw, 720px" className="aspect-[3/2] w-full rounded-lg object-cover" preload />
            {cover.caption && <figcaption className="mt-2 text-[13px] text-ink-3">{cover.caption}</figcaption>}
          </figure>
        )}

        {/* 要点：設備と、導入前後の電気代 */}
        <section className="mt-8" aria-labelledby="summary-h">
          <h2 id="summary-h" className="sr-only">
            この事例の要点
          </h2>
          <div className="overflow-hidden rounded-lg border border-line">
            <div className="flex items-center gap-4 bg-paper-2 px-5 py-4">
              {!cover && <Image src={icon.src} alt="" width={icon.width} height={icon.height} sizes="64px" className="h-16 w-16 shrink-0 object-contain" />}
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-ink-2">導入した設備</p>
                <p className="mt-0.5 text-[19px] leading-[1.5] font-black text-navy-900">{w.equipment}</p>
              </div>
            </div>
            {w.billBefore && w.billAfter && (
              <dl className="grid grid-cols-2 gap-px border-t border-line bg-line text-center">
                <div className="bg-white px-3 py-4">
                  <dt className="text-[13px] font-bold text-ink-2">導入前の電気代</dt>
                  <dd className="mt-1 text-[20px] leading-[1.4] font-bold text-ink sm:text-[22px]">{w.billBefore}</dd>
                </div>
                <div className="bg-white px-3 py-4">
                  <dt className="text-[13px] font-bold text-ink-2">導入後の電気代</dt>
                  <dd className="mt-1 text-[20px] leading-[1.4] font-black text-accent-text sm:text-[22px]">{w.billAfter}</dd>
                </div>
              </dl>
            )}
          </div>
          {w.billBefore && w.billAfter && <p className="mt-3 text-[13px] leading-[1.8] text-ink-2">※ {WORK_BILL_NOTE}</p>}
        </section>

        <section className="prose-ss mt-10" aria-labelledby="story-h">
          <h2 id="story-h">ご相談の内容と、ご提案した構成</h2>
          <p>{w.story}</p>
          {w.voice && (
            <>
              <h2>お客様の声</h2>
              <blockquote>{w.voice}</blockquote>
            </>
          )}
        </section>

        <section className="mt-10" aria-labelledby="spec-h">
          <h2 id="spec-h" className="border-l-[5px] border-orange-500 pl-3 text-[22px] leading-[1.45] font-black text-navy-900">
            事例の概要
          </h2>
          <DefinitionList rows={rows} className="mt-5" />
        </section>

        {w.images.length > 1 && (
          <section className="mt-10" aria-labelledby="photos-h">
            <h2 id="photos-h" className="border-l-[5px] border-orange-500 pl-3 text-[22px] leading-[1.45] font-black text-navy-900">
              施工写真
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {w.images.slice(1).map((img) => (
                <figure key={img.src}>
                  <Image src={img.src} alt={img.alt} width={800} height={600} sizes="(max-width: 639px) 100vw, 360px" className="aspect-[4/3] w-full rounded-lg object-cover" />
                  {img.caption && <figcaption className="mt-1 text-[13px] text-ink-3">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        <Callout tone="note" title="この事例について" className="mt-10">
          <ul className="list-disc space-y-1 pl-5">
            <li>お客様から掲載の許可をいただいた範囲で紹介しています。お名前はイニシャル、地域は市区までの掲載です（掲載日：{formatDateJa(w.publishedAt)}）。</li>
            <li>設備の容量・機種は、屋根の形、電気の使い方、ご予算によって変わります。同じ構成が、すべての住まいに合うわけではありません。</li>
            <li>補助金の対象になるかどうかと金額は、住宅の条件、機器、申請の時期によって決まります。</li>
          </ul>
        </Callout>

        <nav className="mt-10" aria-labelledby="related-h">
          <h2 id="related-h" className="text-[18px] leading-[1.5] font-black text-navy-900">
            この事例に関係するページ
          </h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
            {relatedLinks(w).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex min-h-14 items-center gap-3 px-4 py-2.5 hover:bg-paper-2">
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-navy-900">{l.label}</span>
                    <span className="block text-[14px] leading-[1.6] text-ink-2">{l.description}</span>
                  </span>
                  <ArrowIcon className="h-4 w-4 shrink-0 text-accent-text" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      {others.length > 0 && (
        <section className="cv-auto border-t border-line bg-paper-2 py-12 sm:py-16" aria-labelledby="others-h">
          <Container>
            <h2 id="others-h" className="text-[22px] leading-[1.45] font-black text-navy-900">
              ほかの施工事例
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((x) => (
                <li key={x.slug}>
                  <WorksCard work={x} />
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <Link href="/works" className="inline-flex min-h-11 items-center font-bold text-navy-700 underline underline-offset-4 hover:text-accent-text">
                施工事例の一覧へ
              </Link>
            </p>
          </Container>
        </section>
      )}

      <CtaSection title="ご自宅の条件で、設備と補助金を整理します。" body="屋根の形と電気の使い方を伺い、容量の候補と、制度ごとの想定助成額を整理してお伝えします。現地調査・お見積もりは無料です。" />
      <JsonLd data={graph(articleSchema({ path, title: `${w.label}：${w.title}`, description: descriptionOf(w), datePublished: w.publishedAt, dateModified: w.updatedAt, image: cover?.src, section: "施工事例" }))} />
    </>
  );
}
