import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getPostsByCategory, categoriesWithPosts, pageCount } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
import { CategoryIndex, categoryPath } from "@/components/blog/CategoryIndex";

/**
 * カテゴリ一覧の2ページ目以降。記事が12本を超えたカテゴリにだけページができる。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return categoriesWithPosts().flatMap((c) => Array.from({ length: Math.max(0, pageCount(c.count) - 1) }, (_, i) => ({ category: c.slug, page: String(i + 2) })));
}

function resolve(category: string, page: string) {
  const c = getCategory(category);
  if (!c) return null;
  const n = Number(page);
  const total = pageCount(getPostsByCategory(c.slug).length);
  if (!Number.isInteger(n) || n < 2 || n > total) return null;
  return { c, n };
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; page: string }> }): Promise<Metadata> {
  const { category, page } = await params;
  const r = resolve(category, page);
  if (!r) return {};
  return buildMetadata({
    title: `${r.c.name}の記事一覧（${r.n}ページ目）｜葛飾区の太陽光・蓄電池ブログ`,
    description: `SOLAR SHIFT のブログ「${r.c.name}」の記事一覧（${r.n}ページ目）。${r.c.description}`,
    path: categoryPath(r.c.slug, r.n),
    ogFrom: categoryPath(r.c.slug),
  });
}

export default async function CategoryPagedPage({ params }: { params: Promise<{ category: string; page: string }> }) {
  const { category, page } = await params;
  const r = resolve(category, page);
  if (!r) notFound();
  return <CategoryIndex category={r.c} page={r.n} />;
}
