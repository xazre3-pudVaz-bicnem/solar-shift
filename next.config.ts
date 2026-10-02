import type { NextConfig } from "next";
import { siteConfig } from "./lib/site";

/**
 * 本番 URL の決め方（canonical・OG・sitemap・robots・RSS・構造化データの基準）。
 *   1. 環境変数 NEXT_PUBLIC_SITE_URL（または SITE_URL）があれば、それを使う
 *   2. 無ければ、Vercel の本番デプロイ（VERCEL_ENV=production）のときだけ、lib/site.ts の productionUrl を使う
 *   3. それ以外（プレビューのデプロイ・手元のビルド）は空のまま
 *      → 全ページ noindex、canonical・sitemap は出さない（プレビューが検索結果に出るのを防ぐ）
 * NODE_ENV は見ない（プレビューも production ビルドのため、本番かどうかの判定には使えない）。
 * ここで決めた値を NEXT_PUBLIC_SITE_URL としてビルドに埋め込むので、サーバー側もブラウザ側も同じ値を見る。
 */
const resolvedSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || (process.env.VERCEL_ENV === "production" ? siteConfig.productionUrl : "")).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_SITE_URL: resolvedSiteUrl },
  poweredByHeader: false,
  // 親ディレクトリに別の lockfile があるため、ワークスペースのルートを明示する
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
    // 写真は 60（見た目の差はほぼ無く、転送量が 3〜4 割減る）。イラスト・アイコンは既定の 75
    qualities: [60, 75],
  },
  // Vercel のサーバーレス関数に、記事生成が読む事実シートと既存記事を同梱する
  outputFileTracingIncludes: {
    "/api/cron/generate-post": ["./docs/VERIFIED_FACTS.md", "./content/blog/**/*"],
    // チャット（自動応答）も同じ事実シートを読む
    "/api/chat": ["./docs/VERIFIED_FACTS.md"],
  },
  async headers() {
    return [
      {
        // Vercel の URL（*.vercel.app）は、環境変数の設定に関係なく常に noindex。
        // 本番デプロイにも *.vercel.app の別名が付くが、検索結果に出すのは本番ドメインだけにする。
        // 本番ドメイン（lib/site.ts の productionUrl）には、このヘッダーは付かない。
        source: "/:path*",
        has: [{ type: "host", value: "(?<sub>.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
