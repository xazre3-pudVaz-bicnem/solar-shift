import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getAllPosts, pageCount } from "@/lib/blog";
import { BlogIndex, BLOG_PATH, BLOG_TITLE, blogPagePath } from "@/components/blog/BlogIndex";

/**
 * ブログ一覧の2ページ目以降（1ページ目は /blog）。
 * 記事が12本以下の間はページが無いので、存在しないページ番号は 404 にする。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  const total = pageCount(getAllPosts().length);
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ page: String(i + 2) }));
}

function parsePage(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 2 && n <= pageCount(getAllPosts().length) ? n : null;
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const n = parsePage(page);
  if (!n) return {};
  return buildMetadata({
    title: `ブログ（${n}ページ目）｜${BLOG_TITLE}`,
    description: `SOLAR SHIFT のブログ記事一覧（${n}ページ目）。葛飾区・東京都の補助金、太陽光発電・蓄電池・V2Hの選び方、停電・防災、FIT・売電の記事を新しい順に掲載しています。`,
    path: blogPagePath(n),
    ogFrom: BLOG_PATH,
  });
}

export default async function BlogIndexPagedPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const n = parsePage(page);
  if (!n) notFound();
  return <BlogIndex page={n} />;
}
