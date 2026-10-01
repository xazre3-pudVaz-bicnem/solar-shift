import type { MetadataRoute } from "next";
import { SITE_URL, IS_PUBLIC } from "@/lib/seo";

/**
 * NEXT_PUBLIC_SITE_URL が未設定なら全ページ Disallow（プレビューの誤インデックス防止）。
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PUBLIC) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
