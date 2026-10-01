import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { getAllPosts, getPost, getRelatedPosts, getAdjacentPosts } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
import { pageLabel } from "@/lib/page-labels";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { SourceList } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { CtaSection } from "@/components/sections/CtaSection";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { images } from "@/data/images";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";

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

  return (
    <>
      <Container className="pt-5 sm:pt-6">
        <Breadcrumb crumbs={crumbs} />
      </Container>
      <Container size="prose" className="py-8 sm:py-12">
        <header className="relative rounded-[2rem] bg-cream px-5 py-7 sm:px-8 sm:py-9">
          {category && (
            <Image src={images[category.icon].src} alt="" width={120} height={120} className="absolute -top-6 right-4 h-20 w-20 animate-float-slow sm:h-24 sm:w-24" />
          )}
          <div className="flex flex-wrap items-center gap-2 pr-20 sm:pr-28">
            <Link href={`/blog/category/${post.category}`}><Badge tone="open">{post.categoryName}</Badge></Link>
            {post.generated && <Badge tone="neutral">自動生成・編集方針に基づき検証済み</Badge>}
          </div>
          <h1 className="mt-4 text-[25px] leading-[1.45] font-black text-navy-900 sm:text-[34px]">{post.title}</h1>
          <p className="mt-4 text-[15px] leading-[1.9] text-ink-2">{post.description}</p>
          <LastUpdated publishedAt={post.publishedAt} updatedAt={post.updatedAt} className="mt-5" />
          {post.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="タグ">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full bg-beige px-3 py-[2px] text-[12px] text-ink-2">{t}</li>
              ))}
            </ul>
          )}
        </header>

        <div className="mt-10">
          <ArticleBody markdown={post.body} />
        </div>

        {post.faq.length > 0 && (
          <section className="cv-block mt-12" aria-labelledby="faq-h">
            <h2 id="faq-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">この記事に関するよくある質問</h2>
            <FaqSection items={post.faq} withSchema className="mt-5" />
          </section>
        )}

        {mentionsSubsidy && <SubsidyDisclaimer className="mt-10" />}

        <SourceList sources={post.sources} title="参考資料" className="mt-10" />

        <div className="mt-10">
          <AuthorBox />
        </div>

        {category && (
          <nav className="mt-10 rounded-2xl bg-beige p-5" aria-label="関連する固定ページ">
            <p className="text-[13px] font-bold text-ink-3">このテーマの基本ページ</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
              {category.pillarLinks.map((href) => (
                <li key={href}>
                  <Link href={href} className="inline-block py-0.5 font-bold text-navy-600 underline underline-offset-4">{pageLabel(href)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <p className="mt-8 text-[12px] text-ink-3">
          公開日 {formatDateJa(post.publishedAt)}／最終更新日 {formatDateJa(post.updatedAt)}。本記事の制度・金額に関する記述は、参考資料に示した一次情報を確認日時点で確認したものです。
        </p>
      </Container>

      {(newer || older) && (
        <Container size="prose" className="pb-10">
          <nav aria-label="前後の記事" className="grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link href={`/blog/${older.slug}`} rel="prev" className="group rounded-2xl border border-line bg-white px-4 py-3 shadow-card hover:border-orange-400">
                <span className="block text-[12px] font-bold text-ink-3">← 前の記事</span>
                <span className="mt-1 block text-[14px] leading-[1.6] font-bold text-navy-900 group-hover:text-accent-text">{older.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {newer && (
              <Link href={`/blog/${newer.slug}`} rel="next" className="group rounded-2xl border border-line bg-white px-4 py-3 text-right shadow-card hover:border-orange-400">
                <span className="block text-[12px] font-bold text-ink-3">次の記事 →</span>
                <span className="mt-1 block text-[14px] leading-[1.6] font-bold text-navy-900 group-hover:text-accent-text">{newer.title}</span>
              </Link>
            )}
          </nav>
        </Container>
      )}

      {related.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={related} />
        </Container>
      )}

      <CtaSection title="記事の内容を、わが家の条件で確かめる。" body="制度の一般論は記事で、ご自宅での具体的な答えは現地調査で。葛飾区・東京都の想定助成額を制度ごとに整理してお伝えします。相談・見積もりは無料です。" />

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
