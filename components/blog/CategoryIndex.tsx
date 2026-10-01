import Link from "next/link";
import { getPostsByCategory, categoriesWithPosts, pageCount, pageSlice } from "@/lib/blog";
import type { BlogCategory } from "@/data/blog-categories";
import { pageLabel } from "@/lib/page-labels";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, itemListSchema, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

export function categoryPath(slug: string, page = 1): string {
  return page === 1 ? `/blog/category/${slug}` : `/blog/category/${slug}/page/${page}`;
}

/**
 * ブログのカテゴリ一覧（/blog/category/[category] と、その2ページ目以降が共有）。
 * 記事の一覧だけにせず、カテゴリ固有の紹介文と、テーマの基本ページへの導線を置く。
 */
export function CategoryIndex({ category: c, page }: { category: BlogCategory; page: number }) {
  const all = getPostsByCategory(c.slug);
  const total = pageCount(all.length);
  const posts = pageSlice(all, page);
  const base = categoryPath(c.slug);
  const path = categoryPath(c.slug, page);
  const others = categoriesWithPosts().filter((x) => x.slug !== c.slug);
  const icon = images[c.icon];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "ブログ", href: "/blog" },
          { name: c.name, href: base },
          ...(page > 1 ? [{ name: `${page}ページ目`, href: path }] : []),
        ]}
        eyebrow="ブログのカテゴリ"
        title={page > 1 ? `${c.name}の記事（${page}ページ目）` : `${c.name}の記事`}
        lead={c.lead}
        image={icon}
      >
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold text-ink-2">このテーマの基本ページ</span>
          {c.pillarLinks.map((href) => (
            <Link key={href} href={href} className="inline-flex min-h-9 items-center rounded-full bg-green-600 px-4 py-1 text-[13px] font-bold text-white hover:bg-green-700">
              {pageLabel(href)}
            </Link>
          ))}
        </div>
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <h2 className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">
          「{c.name}」の記事 <span className="ml-1 font-en text-[15px] text-ink-2">{all.length}本</span>
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <ArticleCard key={p.slug} post={p} headingLevel="h3" />
          ))}
        </div>
        <Pagination basePath={base} current={page} total={total} className="mt-12" />
        {others.length > 0 && (
          <nav className="mt-14 rounded-3xl bg-beige p-5 sm:p-6" aria-label="他のカテゴリ">
            <h2 className="font-heading text-[16px] font-black text-navy-900">ほかのカテゴリ</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/blog/category/${o.slug}`} className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-4 py-1 text-[13px] font-bold text-navy-900 hover:border-orange-400 hover:bg-cream">
                    {o.name}（{o.count}）
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="inline-flex min-h-9 items-center rounded-full border border-navy-900 bg-white px-4 py-1 text-[13px] font-bold text-navy-900 hover:bg-cream">
                  すべての記事
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </Container>
      <CtaSection title="記事で分からないことは、住まいの条件で答えます。" body="制度や設備の一般論は記事に、ご自宅での具体的な答えは現地調査で。相談・見積もりは無料です。" />
      <JsonLd
        data={graph(
          webPageSchema({ path, name: `${c.name}の記事一覧`, description: c.lead, type: "CollectionPage" }),
          itemListSchema({ name: `${c.name}の記事`, items: posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })) }),
        )}
      />
    </>
  );
}
