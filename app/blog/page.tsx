import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { BlogIndex, BLOG_DESCRIPTION, BLOG_PATH, BLOG_TITLE } from "@/components/blog/BlogIndex";

export const metadata: Metadata = buildMetadata({
  title: `ブログ｜${BLOG_TITLE}`,
  description: BLOG_DESCRIPTION,
  path: BLOG_PATH,
  keywords: ["葛飾区 太陽光 ブログ", "太陽光 補助金 最新", "蓄電池 補助金 情報"],
});

export default function BlogIndexPage() {
  return <BlogIndex page={1} />;
}
