import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
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
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/blog/category/${post.category}`}><Badge tone="accent">{post.categoryName}</Badge></Link>
            {post.generated && <Badge tone="neutral">自動生成・編集方針に基づき検証済み</Badge>}
          </div>
          <h1 className="mt-4 text-[26px] leading-[1.4] font-bold text-navy-900 sm:text-[34px]">{post.title}</h1>
          <p className="mt-4 text-[15px] leading-[1.9] text-ink-2">{post.description}</p>
          <LastUpdated publishedAt={post.publishedAt} updatedAt={post.updatedAt} className="mt-5" />
          {post.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="タグ">
              {post.tags.map((t) => (
                <li key={t} className="border border-line bg-paper-2 px-2 py-[2px] text-[12px] text-ink-2">{t}</li>
              ))}
            </ul>
          )}
        </header>

        <div className="mt-10">
          <ArticleBody markdown={post.body} />
        </div>

        {post.faq.length > 0 && (
          <section className="mt-12" aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-[22px] font-bold text-navy-900">この記事に関するよくある質問</h2>
            <FaqSection items={post.faq} withSchema className="mt-5" />
          </section>
        )}

        {mentionsSubsidy && <SubsidyDisclaimer className="mt-10" />}

        <SourceList sources={post.sources} title="参考資料" className="mt-10" />

        <div className="mt-10">
          <AuthorBox />
        </div>

        {category && (
          <nav className="mt-10 border border-line bg-paper-2 p-5" aria-label="関連する固定ページ">
            <p className="text-[13px] font-bold text-ink-3">このテーマの基本ページ</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
              {category.pillarLinks.map((href) => (
                <li key={href}>
                  <Link href={href} className="font-bold text-navy-600 underline underline-offset-4">{href === "/simulation" ? "補助金シミュレーター" : href === "/subsidy/katsushika" ? "葛飾区の補助金" : href === "/subsidy/tokyo" ? "東京都の補助金" : href}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <p className="mt-8 text-[12px] text-ink-3">
          公開日 {formatDateJa(post.publishedAt)}／最終更新日 {formatDateJa(post.updatedAt)}。本記事の制度・金額に関する記述は、参考資料に示した一次情報を確認日時点で確認したものです。
        </p>
      </Container>

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
          }),
        )}
      />
    </>
  );
}
