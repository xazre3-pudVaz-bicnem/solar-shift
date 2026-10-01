import type { ReactNode } from "react";
import Link from "next/link";
import type { Subsidy } from "@/data/subsidies";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList, type SourceItem } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";
import type { Crumb } from "@/lib/schema";

export interface ServiceSection {
  id: string;
  heading: string;
  body: ReactNode;
  /** 写真を差し替える位置（任意）。fit="contain" はアイコン・イラスト向け */
  image?: { alt: string; label?: string; src?: string | null; fit?: "cover" | "contain" };
}

/**
 * サービスページ共通レイアウト（太陽光／蓄電池／太陽光＋蓄電池／V2H／HEMS）。
 * 構成：見出し → 結論 → 本文セクション（写真差し替え枠つき） → 補助金 → FAQ → 関連ページ → CTA
 */
export function ServiceLayout({
  path,
  crumbs,
  eyebrow,
  title,
  lead,
  conclusion,
  points,
  sections,
  subsidies,
  subsidyNote,
  faq,
  sources = [],
  related,
  relatedCategories,
  cta,
  updatedAt = siteConfig.subsidyInfoDate,
  pageName,
  description,
}: {
  path: string;
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  lead: string;
  conclusion: ReactNode;
  points: ReactNode[];
  sections: ServiceSection[];
  subsidies: Subsidy[];
  subsidyNote?: ReactNode;
  faq: { q: string; a: string; link?: { href: string; label: string } }[];
  sources?: SourceItem[];
  related: { href: string; label: string; description: string }[];
  relatedCategories: string[];
  cta: { title: string; body: string };
  updatedAt?: string;
  pageName: string;
  description: string;
}) {
  const posts = getPostsForPillar(relatedCategories, 3);
  return (
    <>
      <PageHeader crumbs={crumbs} eyebrow={eyebrow} title={title} lead={lead}>
        <LastUpdated updatedAt={updatedAt} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="max-w-4xl">
          <KeyPoints conclusion={conclusion} points={points} />
        </div>

        <div className="mt-14 space-y-16">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
              {s.image ? (
                <div className={`grid items-start gap-8 lg:grid-cols-2 lg:gap-14 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <ImagePlaceholder src={s.image.src} alt={s.image.alt} label={s.image.label ?? "写真（差し替え）"} ratio="4/3" fit={s.image.fit ?? "cover"} className="lg:sticky lg:top-24" />
                  <div>
                    <h2 id={`${s.id}-h`} className="text-[24px] leading-[1.4] font-bold text-navy-900 sm:text-[28px]">{s.heading}</h2>
                    <div className="prose-ss mt-5">{s.body}</div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl">
                  <h2 id={`${s.id}-h`} className="text-[24px] leading-[1.4] font-bold text-navy-900 sm:text-[28px]">{s.heading}</h2>
                  <div className="prose-ss mt-5">{s.body}</div>
                </div>
              )}
            </section>
          ))}
        </div>

        {subsidies.length > 0 && (
          <section className="mt-16" aria-labelledby="subsidy-h">
            <h2 id="subsidy-h" className="text-[24px] font-bold text-navy-900 sm:text-[28px]">関連する補助金（{siteConfig.subsidyInfoDate.replace(/-/g, "/")} 時点）</h2>
            {subsidyNote && <div className="mt-3 max-w-3xl text-[15px] leading-[1.9] text-ink-2">{subsidyNote}</div>}
            <div className="mt-6">
              <SubsidyTable menus={subsidies} showArea />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <LinkButton href="/simulation" variant="primary">わが家の想定助成額を試算する <ArrowIcon /></LinkButton>
              <LinkButton href="/subsidy" variant="ghost">補助金の総合ページ <ArrowIcon /></LinkButton>
            </div>
            <SubsidyDisclaimer className="mt-6" />
          </section>
        )}

        {faq.length > 0 && (
          <section className="mt-16" aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-[24px] font-bold text-navy-900 sm:text-[28px]">よくある質問</h2>
            <FaqSection items={faq} withSchema className="mt-6" />
          </section>
        )}

        {sources.length > 0 && <SourceList sources={sources} className="mt-12" />}

        <section className="mt-14" aria-label="関連ページ">
          <h2 className="text-[18px] font-bold text-navy-900">あわせて読みたい</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="block h-full border border-line bg-white px-4 py-3 hover:border-navy-900">
                  <span className="block text-[14px] font-bold text-navy-900">{r.label}</span>
                  <span className="mt-1 block text-[12px] text-ink-3">{r.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="このテーマの最新記事" />
        </Container>
      )}

      <CtaSection title={cta.title} body={cta.body} />
      <JsonLd data={graph(webPageSchema({ path, name: pageName, description, dateModified: updatedAt }))} />
    </>
  );
}
