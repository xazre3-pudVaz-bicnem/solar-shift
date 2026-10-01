import type { MetadataRoute } from "next";
import { SITE_URL, IS_PUBLIC } from "@/lib/seo";

/**
 * NEXT_PUBLIC_SITE_URL が未設定なら全ページ Disallow（プレビューの誤インデックス防止）。
 *
 * AI 検索（ChatGPT・Claude・Perplexity・Gemini など）のクローラーも、通常の検索エンジンと同じ範囲で許可する。
 * 一次情報と確認日を明記したページを引用してもらうことが狙い（AIO）。要約版は /llms.txt に置いている。
 */
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  if (!IS_PUBLIC) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const disallow = ["/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: "/", disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
