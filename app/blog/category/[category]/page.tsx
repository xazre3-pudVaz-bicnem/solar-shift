import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getPostsByCategory, categoriesWithPosts, isCategoryIndexable } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
import { CategoryIndex, categoryPath } from "@/components/blog/CategoryIndex";

export const dynamicParams = false;

export function generateStaticParams() {
  return categoriesWithPosts().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return {};
  return buildMetadata({
    title: `${c.name}の記事一覧｜葛飾区の太陽光・蓄電池ブログ`,
    description: `${c.description}SOLAR SHIFT（株式会社サイプレス）のブログ「${c.name}」の記事一覧。一次情報を確認し、確認日と出典を明記しています。`,
    path: categoryPath(c.slug),
    // 記事が少ないうちは一覧として薄いので、検索結果には出さない（リンクはたどらせる）
    noindex: !isCategoryIndexable(c.slug),
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c || getPostsByCategory(c.slug).length === 0) notFound();
  return <CategoryIndex category={c} page={1} />;
}
