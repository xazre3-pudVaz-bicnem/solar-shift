import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getAllPosts, getPost, getRelatedPosts, getAdjacentPosts } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
import { findPageLabel } from "@/lib/page-labels";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ArticleBody, articleHeadings } from "@/components/blog/ArticleBody";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { SourceList } from "@/components/ui/SourceList";
import { Toc } from "@/components/ui/Toc";
import { FaqSection } from "@/components/sections/FaqSection";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { CtaSection } from "@/components/sections/CtaSection";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";

/**
 * ブログ記事。
 * 記事の役割は「固定ページでは扱いきれない細かい疑問（ロングテール）に答える」こと。
 * 制度の全体は固定ページが正本なので、記事の末尾から、そのテーマの固定ページへ必ず案内する。
 *
 * 見出しのまわりに出すのは「最終更新日」「編集・運営」、記事の末尾に「参考資料」。
 * 下書きの作り方（AI を使うこと・公開前の確認の手順）は、記事ごとには表示せず、編集方針のページで説明している。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    section: post.categoryName,
    tags: post.tags,
  });
}

const SUBSIDY_CATEGORIES = new Set(["katsushika-subsidy", "tokyo-subsidy", "v2h", "fit"]);

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  const category = getCategory(post.category);
  const related = getRelatedPosts(post, 3);
  const { newer, older } = getAdjacentPosts(post.slug);
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "ブログ", href: "/blog" },
    { name: post.categoryName, href: `/blog/category/${post.category}` },
    { name: post.title, href: path },
  ];
  const mentionsSubsidy = SUBSIDY_CATEGORIES.has(post.category) || /補助金|助成/.test(post.body);
  const headings = articleHeadings(post.body);
  // そのテーマの固定ページ（表示名が登録されているものだけ）
  const pillars = (category?.pillarLinks ?? []).map((href) => ({ href, label: findPageLabel(href) })).filter((p): p is { href: string; label: string } => Boolean(p.label));

  return (
    <>
      <Container size="prose" className="pt-2 pb-8 sm:pt-3 sm:pb-12">
        <Breadcrumb crumbs={crumbs} />
        <header className="mt-3 border-b border-line pb-7 sm:mt-5">
          <p>
            <Link href={`/blog/category/${post.category}`} className="inline-flex min-h-11 items-center gap-3 font-heading text-[13px] font-bold tracking-[0.12em] text-accent-text hover:underline">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              {post.categoryName}
            </Link>
          </p>
          <h1 className="mt-1 text-[26px] leading-[1.5] font-black text-navy-900 sm:text-[34px]">{post.title}</h1>
          <p className="mt-4 text-base leading-[1.9] text-ink-2">{post.description}</p>
          <LastUpdated updatedAt={post.updatedAt} publishedAt={post.publishedAt} className="mt-5" />
        </header>

        <Toc items={headings} title="この記事の内容" className="mt-8" />

        <div className="mt-10">
          <ArticleBody markdown={post.body} />
        </div>

        {post.faq.length > 0 && (
          <section className="cv-block mt-12" aria-labelledby="faq-h">
            <h2 id="faq-h" className="border-l-[5px] border-orange-500 pl-3 text-[22px] leading-[1.45] font-black text-navy-900">
              この記事に関するよくある質問
            </h2>
            <FaqSection items={post.faq} withSchema className="mt-5" />
          </section>
        )}

        {pillars.length > 0 && (
          <nav className="mt-12" aria-labelledby="pillar-h">
            <h2 id="pillar-h" className="text-[18px] leading-[1.5] font-black text-navy-900">
              制度の全体や基本は、こちらのページで
            </h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
              {pillars.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="flex min-h-12 items-center gap-3 px-4 py-2.5 text-base font-bold text-navy-900 hover:bg-paper-2">
                    <span className="flex-1">{p.label}</span>
                    <ArrowIcon className="h-4 w-4 text-accent-text" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {mentionsSubsidy && <SubsidyDisclaimer className="mt-10" />}

        <SourceList sources={post.sources} title="参考資料" className="mt-10" />

        <div className="mt-8">
          <AuthorBox />
        </div>

        <p className="mt-6 text-[13px] leading-[1.8] text-ink-3">
          制度・金額に関する記述は、参考資料に示した一次情報で確認したものです。記事の作り方と、公開前の確認の手順は
          <Link href={siteConfig.editorial.policyPath} className="mx-1 inline-block py-1 font-bold text-navy-700 underline underline-offset-4">
            編集方針
          </Link>
          にまとめています。
        </p>
      </Container>

      {(newer || older) && (
        <Container size="prose" className="pb-10">
          <nav aria-label="前後の記事" className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {older ? (
              <Link href={`/blog/${older.slug}`} rel="prev" className="group bg-white px-4 py-3 hover:bg-paper-2">
                <span className="block text-[13px] font-bold text-ink-2">← 前の記事</span>
                <span className="mt-1 block text-[15px] leading-[1.6] font-bold text-navy-900 group-hover:text-accent-text">{older.title}</span>
              </Link>
            ) : (
              <span className="hidden bg-white sm:block" />
            )}
            {newer ? (
              <Link href={`/blog/${newer.slug}`} rel="next" className="group bg-white px-4 py-3 hover:bg-paper-2 sm:text-right">
                <span className="block text-[13px] font-bold text-ink-2">次の記事 →</span>
                <span className="mt-1 block text-[15px] leading-[1.6] font-bold text-navy-900 group-hover:text-accent-text">{newer.title}</span>
              </Link>
            ) : (
              <span className="hidden bg-white sm:block" />
            )}
          </nav>
        </Container>
      )}

      {related.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={related} />
        </Container>
      )}

      <CtaSection title="記事の内容を、わが家の条件で確かめる。" body="制度の説明は記事で、ご自宅での具体的な答えは現地調査で。葛飾区・東京都の想定助成額を、制度ごとに整理してお伝えします。" />

      <JsonLd
        data={graph(
          articleSchema({
            path,
            title: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            type: "BlogPosting",
            keywords: post.tags,
            section: post.categoryName,
            wordCount: post.length,
            sources: post.sources,
          }),
        )}
      />
    </>
  );
}
