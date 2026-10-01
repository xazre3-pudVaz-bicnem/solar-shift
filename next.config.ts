import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
        // Vercel のプレビュー URL（*.vercel.app）は環境変数の設定に関係なく常に noindex。
        // 本番ドメインにはこのヘッダーは付かない。
        source: "/:path*",
        has: [{ type: "host", value: "(?<sub>.*)\.vercel\.app" }],
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
