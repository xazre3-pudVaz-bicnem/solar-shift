import type { ReactNode } from "react";
import { Toc } from "@/components/ui/Toc";
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
import { findPageLabel } from "@/lib/page-labels";
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
  // ページ側が名指しした順（entry.related）を先に、そのあとに、こちらを名指ししているガイドを並べる
  const named = entry.related.map((p) => guides.find((g) => g.path === p && g.slug !== entry.slug)).filter((g): g is GuideEntry => Boolean(g));
  const backlinks = guides.filter((g) => g.slug !== entry.slug && g.related.includes(entry.path) && !named.includes(g));
  const related = [...named, ...backlinks].slice(0, 4);
  // ガイド以外の関連ページ（サービス・補助金・エリアのページ）。表示名は、メニューの登録から取る
  const relatedPages = entry.related
    .filter((p) => !guides.some((g) => g.path === p))
    .map((href) => ({ href, label: findPageLabel(href) }))
    .filter((p): p is { href: string; label: string } => Boolean(p.label));
  const posts = getPostsForPillar(relatedCategories, 3, { path: entry.path });
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "導入ガイド", href: "/guide" },
    { name: entry.title, href: entry.path },
  ];

  return (
    <>
      {/* 見出しから本文・出典・関連ガイドまでが、この記事の内容 */}
      <article>
      <PageHeader crumbs={crumbs} eyebrow="導入ガイド" title={entry.title} lead={entry.description} image={images[entry.image]}>
        <LastUpdated updatedAt={entry.updatedAt} publishedAt={entry.publishedAt} showPublished className="mt-5" />
      </PageHeader>

      <Container size="prose" className="py-10 sm:py-14">
        <KeyPoints conclusion={conclusion} points={points} />

        {tip && (
          <StaffTip className="mt-8" title={tip.title} image={tip.image ?? images.poseIdea} tone="orange">
            {tip.body}
          </StaffTip>
        )}

        <Toc className="mt-8" title="目次" items={[...sections.map((x) => ({ id: x.id, label: x.heading })), ...(faq.length > 0 ? [{ id: "faq", label: "よくある質問" }] : [])]} />

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

        <nav className="mt-8" aria-label="関連するページ">
          {relatedPages.length > 0 && (
            <p className="text-[14px] leading-[1.9] text-ink-2">
              あわせて見るページ：
              {relatedPages.map((p, i) => (
                <span key={p.href}>
                  {i > 0 && "／"}
                  <Link href={p.href} className="mx-1 inline-block py-2 font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                    {p.label}
                  </Link>
                </span>
              ))}
            </p>
          )}
          <p className="text-[14px] leading-[1.9] text-ink-2">
            ほかのテーマは
            <Link href="/guide" className="mx-1 inline-block py-2 font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
              太陽光・蓄電池の導入ガイドの一覧
            </Link>
            から、見積書や区の案内に出てくることばは
            <Link href="/glossary" className="mx-1 inline-block py-2 font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
              用語集
            </Link>
            で確かめられます。
          </p>
        </nav>
      </Container>
      </article>

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
            datePublished: entry.publishedAt,
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
