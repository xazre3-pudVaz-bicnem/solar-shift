import type { ReactNode } from "react";
import Link from "next/link";
import type { GuideEntry } from "@/data/guides";
import { guides } from "@/data/guides";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList, type SourceItem } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, graph } from "@/lib/schema";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";

export interface GuideSection {
  id: string;
  heading: string;
  body: ReactNode;
}

/**
 * ガイド（検索意図別の固定ページ）の共通レイアウト。
 * 構成：見出し → 結論ボックス → 目次 → 本文セクション → FAQ → 出典 → 関連ページ → CTA
 * 本文は各ページが JSX で持つ（テンプレートで文章を使い回さない）。
 */
export function GuideArticle({
  entry,
  conclusion,
  points,
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
    { name: "導入ガイド", href: "/guide/solar-cost" },
    { name: entry.title, href: entry.path },
  ];

  return (
    <>
      <PageHeader crumbs={crumbs} eyebrow="導入ガイド" title={entry.title} lead={entry.description}>
        <LastUpdated updatedAt={entry.updatedAt} className="mt-5" />
      </PageHeader>

      <Container size="prose" className="py-10 sm:py-14">
        <KeyPoints conclusion={conclusion} points={points} />

        <nav aria-label="目次" className="mt-8 border border-line bg-paper-2 px-5 py-4">
          <p className="text-[13px] font-bold text-ink-3">目次</p>
          <ol className="mt-2 space-y-1 text-[14px]">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-navy-700 hover:text-accent-text">
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
            {faq.length > 0 && (
              <li>
                <a href="#faq" className="text-navy-700 hover:text-accent-text">
                  {sections.length + 1}. よくある質問
                </a>
              </li>
            )}
          </ol>
        </nav>

        <div className="prose-ss mt-6">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2>{s.heading}</h2>
              {s.body}
            </section>
          ))}
        </div>

        {faq.length > 0 && (
          <section id="faq" className="mt-14 scroll-mt-24">
            <h2 className="text-[22px] font-bold text-navy-900">よくある質問</h2>
            <FaqSection items={faq} withSchema className="mt-5" />
          </section>
        )}

        {withSubsidyDisclaimer && <SubsidyDisclaimer className="mt-10" />}

        <SourceList sources={sources} className="mt-10" />

        <div className="mt-10">
          <AuthorBox />
        </div>

        {related.length > 0 && (
          <section className="mt-12" aria-label="関連ガイド">
            <h2 className="text-[18px] font-bold text-navy-900">関連ガイド</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link href={g.path} className="block border border-line bg-white px-4 py-3 hover:border-navy-900">
                    <span className="block text-[14px] font-bold text-navy-900">{g.title}</span>
                    <span className="mt-1 block text-[12px] text-ink-3">{g.description}</span>
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
          }),
        )}
      />
    </>
  );
}
