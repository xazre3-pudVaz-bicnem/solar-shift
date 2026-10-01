import Link from "next/link";
import { getAllPosts, categoriesWithPosts, pageCount, pageSlice } from "@/lib/blog";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, blogSchema, itemListSchema, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

export const BLOG_PATH = "/blog";
export const BLOG_TITLE = "葛飾区の太陽光・蓄電池・補助金の最新情報";
export const BLOG_DESCRIPTION =
  "葛飾区の太陽光・蓄電池・補助金に関するブログ。かつしかエコ助成金、東京都の助成、太陽光発電・蓄電池・V2Hの選び方、停電・防災、FIT・売電を、一次情報を確認して解説します。";

export function blogPagePath(page: number): string {
  return page === 1 ? BLOG_PATH : `${BLOG_PATH}/page/${page}`;
}

/**
 * ブログ一覧（/blog と /blog/page/[page] が共有）。
 * 記事は毎日増えるので、1ページ12件でページを分ける。
 */
export function BlogIndex({ page }: { page: number }) {
  const all = getAllPosts();
  const total = pageCount(all.length);
  const posts = pageSlice(all, page);
  const categories = categoriesWithPosts();
  const path = blogPagePath(page);
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "ブログ", href: BLOG_PATH },
    ...(page > 1 ? [{ name: `${page}ページ目`, href: path }] : []),
  ];

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow="ブログ"
        title={page > 1 ? `${BLOG_TITLE}（${page}ページ目）` : BLOG_TITLE}
        lead="補助金の制度、太陽光・蓄電池の選び方、電気代や停電への備えについて、一次情報を確認したうえで解説しています。各記事に参考資料と最終更新日を明記しています。"
        image={images.poseLaptop}
      />
      <Container className="py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            {posts.length === 0 ? (
              <p className="text-[15px] text-ink-2">記事は準備中です。</p>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2">
                {posts.map((p) => (
                  <ArticleCard key={p.slug} post={p} headingLevel="h2" />
                ))}
              </div>
            )}
            <Pagination basePath={BLOG_PATH} current={page} total={total} className="mt-12" />
          </div>
          <aside className="min-w-0 space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-cream p-5">
              <h2 className="font-heading text-[15px] font-black text-navy-900">カテゴリ</h2>
              <ul className="mt-3 divide-y divide-orange-200/70">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/blog/category/${c.slug}`} className="flex min-h-11 items-center justify-between gap-2 text-[14px] font-bold text-navy-900 hover:text-accent-text">
                      {c.name}
                      <span className="rounded-full bg-white px-2 py-[1px] font-en text-[12px] text-ink-2">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-green-200 bg-white p-5">
              <h2 className="font-heading text-[15px] font-black text-navy-900">まず読むページ</h2>
              <ul className="mt-3 space-y-1 text-[14px]">
                <li><Link href="/subsidy/katsushika" className="inline-block py-1 font-bold text-navy-600 underline underline-offset-4">葛飾区の補助金</Link></li>
                <li><Link href="/subsidy/tokyo" className="inline-block py-1 font-bold text-navy-600 underline underline-offset-4">東京都の補助金</Link></li>
                <li><Link href="/simulation" className="inline-block py-1 font-bold text-navy-600 underline underline-offset-4">補助金シミュレーター</Link></li>
                <li><Link href="/guide" className="inline-block py-1 font-bold text-navy-600 underline underline-offset-4">導入ガイド一覧</Link></li>
                <li><Link href="/editorial-policy" className="inline-block py-1 font-bold text-navy-600 underline underline-offset-4">記事の編集方針</Link></li>
              </ul>
            </div>
            <p className="text-[12px] text-ink-3">
              <a href="/feed.xml" className="inline-block py-1 underline underline-offset-4">RSSフィード</a>
            </p>
          </aside>
        </div>
      </Container>
      <CtaSection title="記事で分からないことは、住まいの条件で答えます。" body="制度や設備の一般論は記事に、ご自宅での具体的な答えは現地調査で。相談・見積もりは無料です。" />
      <JsonLd
        data={graph(
          webPageSchema({ path, name: page > 1 ? `ブログ（${page}ページ目）` : "ブログ", description: BLOG_DESCRIPTION, type: "CollectionPage" }),
          ...(page === 1
            ? [
                blogSchema({
                  path: BLOG_PATH,
                  name: `SOLAR SHIFT ブログ｜${BLOG_TITLE}`,
                  description: BLOG_DESCRIPTION,
                  posts: posts.map((p) => ({ title: p.title, path: `/blog/${p.slug}`, datePublished: p.publishedAt, dateModified: p.updatedAt })),
                }),
              ]
            : []),
          itemListSchema({ name: page > 1 ? `ブログ記事一覧（${page}ページ目）` : "ブログ記事一覧", items: posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })) }),
        )}
      />
    </>
  );
}
