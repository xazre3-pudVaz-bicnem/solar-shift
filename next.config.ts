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
    // 最適化した画像を配信側で持つ期間（31日）。画像を差し替えるときは、ファイル名を変える
    minimumCacheTTL: 2678400,
  },
  // Vercel のサーバーレス関数に、記事生成が読む事実シートと既存記事を同梱する
  outputFileTracingIncludes: {
    "/api/cron/generate-post": ["./docs/VERIFIED_FACTS.md", "./content/blog/**/*"],
    // チャット（自動応答）も同じ事実シートを読む
    "/api/chat": ["./docs/VERIFIED_FACTS.md"],
  },
  async redirects() {
    return [
      // 旧 URL（Vercel の本番の別名）は、同じパスのまま本番ドメインへ転送する。
      // noindex のヘッダーだけでは、検索エンジンに「もう1つのサイト」として見え続けるため
      ...siteConfig.legacyHosts.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `${siteConfig.productionUrl}/:path*`,
        permanent: true,
      })),
      // 柱のページの要約になっていた記事は、柱のページへ統合した（2026-10-07）
      { source: "/blog/katsushika-eco-subsidy-solar-procedure-2026", destination: "/subsidy/katsushika", permanent: true },
      { source: "/blog/tokyo-solar-merit-2026", destination: "/subsidy/tokyo", permanent: true },
      // 「おすすめ商品」のページは廃止（個別の商品を載せない方針）。比べ方のページへ転送する
      { source: "/recommend/solar", destination: "/products/solar", permanent: true },
      { source: "/recommend/battery", destination: "/products/battery", permanent: true },
      { source: "/recommend", destination: "/products", permanent: true },
      // ブログ一覧の1ページ目は /blog（/blog/page/1 という URL は作らない）
      { source: "/blog/page/1", destination: "/blog", permanent: true },
      { source: "/blog/category/:slug/page/1", destination: "/blog/category/:slug", permanent: true },
    ];
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
      // 自前で置いている書体。ファイル名を変えずに中身を差し替えることはないので、長く持たせる
      { source: "/fonts/:file(.*\\.woff2)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/fonts/:file(.*\\.css)", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
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
