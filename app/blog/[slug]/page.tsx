import { images } from "@/data/images";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getAllPosts, getPost, getRelatedPosts, getAdjacentPosts, isCategoryIndexable } from "@/lib/blog";
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
    // 記事がまだ少なく noindex のカテゴリは、パンくず（BreadcrumbList）に入れない
    ...(isCategoryIndexable(post.category) ? [{ name: post.categoryName, href: `/blog/category/${post.category}` }] : []),
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
        <header className="relative mt-7 rounded-[2rem] bg-cream px-5 py-6 sm:mt-9 sm:px-8 sm:py-8">
          {category && <Image src={images[category.icon].src} alt="" width={120} height={120} className="absolute -top-6 right-4 h-20 w-20 animate-float-slow sm:h-24 sm:w-24" />}
          <p className="pr-20 sm:pr-28">
            <Link href={`/blog/category/${post.category}`} className="inline-flex min-h-11 items-center">
              <span className="rounded-full bg-green-600 px-4 py-1 font-heading text-[13px] font-bold text-white">{post.categoryName}</span>
            </Link>
          </p>
          <h1 className="mt-1 text-[25px] leading-[1.5] font-black text-navy-900 sm:text-[34px]">{post.title}</h1>
          <p className="mt-4 text-base leading-[1.9] text-ink-2">{post.description}</p>
          <LastUpdated updatedAt={post.updatedAt} publishedAt={post.publishedAt} className="mt-5" />
        </header>

        <Toc items={headings} title="この記事の内容" className="mt-8" />

        <div className="mt-10">
          <ArticleBody markdown={post.body} />
        </div>

        {post.faq.length > 0 && (
          <section className="cv-block mt-12" aria-labelledby="faq-h">
            <h2 id="faq-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">この記事に関するよくある質問</h2>
            <FaqSection items={post.faq} withSchema className="mt-5" />
          </section>
        )}

        {pillars.length > 0 && (
          <nav className="mt-12" aria-labelledby="pillar-h">
            <h2 id="pillar-h" className="border-l-[6px] border-green-500 pl-3 text-[18px] leading-[1.4] font-black text-navy-900">
              制度の全体や基本は、こちらのページで
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {pillars.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="group flex h-full min-h-12 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-base font-bold text-navy-900 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-orange-400">
                    <span className="flex-1">{p.label}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-navy-900">
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {mentionsSubsidy && <SubsidyDisclaimer className="mt-10" />}

        <SourceList sources={post.sources} title="参考資料" className="mt-10" />

        <div className="mt-10">
          <AuthorBox />
        </div>

        <p className="mt-6 text-[13px] leading-[1.8] text-ink-3">
          制度・金額に関する記述は、参考資料に示した一次情報で確認したものです。記事の作り方と、公開前の確認の手順は
          <Link href={siteConfig.editorial.policyPath} className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
            編集方針
          </Link>
          にまとめています。
        </p>
      </Container>

      {(newer || older) && (
        <Container size="prose" className="pb-10">
          <nav aria-label="前後の記事" className="grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link href={`/blog/${older.slug}`} rel="prev" className="group rounded-2xl border border-line bg-white px-4 py-3 shadow-card hover:border-orange-400">
                <span className="block text-[13px] font-bold text-ink-2">← 前の記事</span>
                <span className="mt-1 block text-[15px] leading-[1.6] font-bold text-navy-900 group-hover:text-accent-text">{older.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {newer ? (
              <Link href={`/blog/${newer.slug}`} rel="next" className="group rounded-2xl border border-line bg-white px-4 py-3 shadow-card hover:border-orange-400 sm:text-right">
                <span className="block text-[13px] font-bold text-ink-2">次の記事 →</span>
                <span className="mt-1 block text-[15px] leading-[1.6] font-bold text-navy-900 group-hover:text-accent-text">{newer.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
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
