import type { ReactNode } from "react";
import Link from "next/link";
import type { GuideEntry } from "@/data/guides";
import { guides } from "@/data/guides";
import { images, type SiteImage } from "@/data/images";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { StaffTip } from "@/components/ui/StaffTip";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList, type SourceItem } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, graph } from "@/lib/schema";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { reveal } from "@/lib/reveal";

export interface GuideSection {
  id: string;
  heading: string;
  body: ReactNode;
  /** 本文の下に置く図解（任意） */
  figure?: ReactNode;
}

/**
 * ガイド（検索意図別の固定ページ）の共通レイアウト。
 * 構成：見出し（イラストつき）→ 結論 → スタッフの一言 → 目次 → 本文 → FAQ → 出典 → 関連 → CTA
 * 本文は各ページが JSX で持つ（テンプレートで文章を使い回さない）。
 */
export function GuideArticle({
  entry,
  conclusion,
  points,
  tip,
  sections,
  faq,
  sources,
  relatedCategories,
  withSubsidyDisclaimer = false,
  cta,
}: {
  entry: GuideEntry;
  conclusion: ReactNode;
  points: ReactNode[];
  /** 結論の下に出すスタッフの一言（任意） */
  tip?: { title?: string; body: ReactNode; image?: SiteImage };
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  sources: SourceItem[];
  /** 関連ブログ記事を出すカテゴリ */
  relatedCategories: string[];
  withSubsidyDisclaimer?: boolean;
  cta: { title: string; body: string };
}) {
  const related = guides.filter((g) => entry.related.includes(g.path) || (g.slug !== entry.slug && g.related.includes(entry.path))).slice(0, 4);
  const posts = getPostsForPillar(relatedCategories, 3);
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "導入ガイド", href: "/guide" },
    { name: entry.title, href: entry.path },
  ];

  return (
    <>
      <PageHeader crumbs={crumbs} eyebrow="導入ガイド" title={entry.title} lead={entry.description} image={images[entry.image]}>
        <LastUpdated updatedAt={entry.updatedAt} className="mt-5" />
      </PageHeader>

      <Container size="prose" className="py-10 sm:py-14">
        <KeyPoints conclusion={conclusion} points={points} />

        {tip && (
          <StaffTip className="mt-8" title={tip.title} image={tip.image ?? images.poseIdea} tone="orange">
            {tip.body}
          </StaffTip>
        )}

        <nav aria-label="目次" className="mt-8 rounded-3xl border-2 border-dashed border-orange-200 bg-white px-5 py-5">
          <p className="flex items-center gap-2 font-heading text-[15px] font-black text-navy-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-navy-900">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 4h10M3 8h10M3 12h6" />
              </svg>
            </span>
            目次
          </p>
          <ol className="mt-3 space-y-1.5 text-[14px]">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex gap-2 text-navy-700 hover:text-accent-text">
                  <span className="font-en font-bold text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                  <span className="underline decoration-line-2 underline-offset-4">{s.heading}</span>
                </a>
              </li>
            ))}
            {faq.length > 0 && (
              <li>
                <a href="#faq" className="flex gap-2 text-navy-700 hover:text-accent-text">
                  <span className="font-en font-bold text-accent-text">{String(sections.length + 1).padStart(2, "0")}</span>
                  <span className="underline decoration-line-2 underline-offset-4">よくある質問</span>
                </a>
              </li>
            )}
          </ol>
        </nav>

        {/* 図解は .prose-ss の外に置く（中に入れると ul や table に本文用のスタイルが当たる） */}
        <div className="mt-6">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="cv-block scroll-mt-24">
              <div className="prose-ss">
                <h2>{s.heading}</h2>
                {s.body}
              </div>
              {s.figure && <div className="mt-6">{s.figure}</div>}
            </section>
          ))}
        </div>

        {faq.length > 0 && (
          <section id="faq" className="cv-block mt-14 scroll-mt-24">
            <h2 className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">よくある質問</h2>
            <FaqSection items={faq} withSchema className="mt-5" />
          </section>
        )}

        {withSubsidyDisclaimer && <SubsidyDisclaimer className="mt-10" />}

        <SourceList sources={sources} className="mt-10" />

        <div className="mt-10">
          <AuthorBox />
        </div>

        {related.length > 0 && (
          <section className="cv-block mt-12" aria-label="関連ガイド">
            <h2 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">関連ガイド</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((g, i) => (
                <li key={g.slug} {...reveal((i % 2) * 80)}>
                  <Link href={g.path} className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-card hover:border-orange-400">
                    <span className="flex-1">
                      <span className="block text-[14px] font-bold text-navy-900">{g.title}</span>
                      <span className="mt-1 block text-[12px] leading-[1.6] text-ink-3">{g.description}</span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-navy-900">
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="このテーマの最新記事" />
        </Container>
      )}

      <CtaSection title={cta.title} body={cta.body} />

      <JsonLd
        data={graph(
          articleSchema({
            path: entry.path,
            title: entry.title,
            description: entry.description,
            datePublished: entry.updatedAt,
            dateModified: entry.updatedAt,
            type: "Article",
            section: "導入ガイド",
            sources: sources.map((x) => ({ name: x.name, url: x.url })),
          }),
        )}
      />
    </>
  );
}
