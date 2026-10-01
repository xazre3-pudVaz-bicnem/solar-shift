import { getAllPosts } from "@/lib/blog";
import { SITE_URL, IS_PUBLIC } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** RSS 2.0。本番URLが未設定のときは空のチャンネルを返す（相対URLのフィードを配らない）。 */
export function GET() {
  const base = IS_PUBLIC && SITE_URL ? SITE_URL : "";
  const posts = base ? getAllPosts().slice(0, 30) : [];
  const items = posts
    .map(
      (p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${base}/blog/${p.slug}</link>
      <guid isPermaLink="true">${base}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${esc(p.categoryName)}</category>
      <description>${esc(p.description)}</description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteConfig.name)} ブログ｜葛飾区の太陽光発電・蓄電池・補助金</title>
    <link>${base}/blog</link>
    <description>${esc(siteConfig.description)}</description>
    <language>ja</language>
    ${base ? `<atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />` : ""}
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
