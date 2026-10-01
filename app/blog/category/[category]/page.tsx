import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getPostsByCategory, categoriesWithPosts } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return categoriesWithPosts().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return {};
  return buildMetadata({
    title: `${c.name}の記事一覧｜ブログ`,
    description: `${c.description} SOLAR SHIFT（株式会社サイプレス）のブログ「${c.name}」カテゴリの記事一覧。`,
    path: `/blog/category/${c.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const posts = getPostsByCategory(c.slug);
  if (posts.length === 0) notFound();
  const path = `/blog/category/${c.slug}`;
  const others = categoriesWithPosts().filter((x) => x.slug !== c.slug);

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "ブログ", href: "/blog" },
          { name: c.name, href: path },
        ]}
        eyebrow="カテゴリ"
        title={c.name}
        lead={c.description}
      >
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          <span className="text-ink-3">基本ページ：</span>
          {c.pillarLinks.map((href) => (
            <Link key={href} href={href} className="font-bold text-navy-600 underline underline-offset-4">{href}</Link>
          ))}
        </p>
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <ArticleCard key={p.slug} post={p} headingLevel="h2" />
          ))}
        </div>
        {others.length > 0 && (
          <nav className="mt-14 border-t border-line pt-6" aria-label="他のカテゴリ">
            <p className="text-[13px] font-bold text-ink-3">他のカテゴリ</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/blog/category/${o.slug}`} className="border border-line bg-white px-3 py-1.5 text-[13px] font-bold text-navy-900 hover:border-navy-900">
                    {o.name}（{o.count}）
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>
      <CtaSection title="記事で分からないことは、住まいの条件で答えます。" body="制度や設備の一般論は記事に、ご自宅での具体的な答えは現地調査で。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path, name: `${c.name}の記事一覧`, description: c.description }))} />
    </>
  );
}
