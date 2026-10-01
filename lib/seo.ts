import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

/**
 * 本番 URL は NEXT_PUBLIC_SITE_URL（または SITE_URL）だけから決める。
 * 未設定なら canonical / OG URL / sitemap を一切出さず、robots は noindex にする。
 * NODE_ENV は見ない（Vercel のプレビューも production ビルドのため）。
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
export const SITE_URL: string | undefined = RAW_SITE_URL ? RAW_SITE_URL.replace(/\/+$/, "") : undefined;
export const IS_PUBLIC = Boolean(SITE_URL);

if (!IS_PUBLIC && process.env.NODE_ENV === "production" && typeof window === "undefined") {
  console.warn(
    "[SOLAR SHIFT] NEXT_PUBLIC_SITE_URL が未設定です。canonical/OG/sitemap は出力されず、全ページ noindex になります。",
  );
}

export function absoluteUrl(path = "/"): string | undefined {
  if (!SITE_URL) return undefined;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_TITLE_SUFFIX = `| ${siteConfig.name} 葛飾区の太陽光発電・蓄電池`;

type BuildMetadataInput = {
  /** 「｜SOLAR SHIFT」を付ける前のタイトル */
  title: string;
  description: string;
  /** 先頭スラッシュから始まるパス */
  path: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** 検索結果に出したくないページ（施工事例準備中など） */
  noindex?: boolean;
  /** タイトルを末尾サフィックスなしでそのまま使う */
  rawTitle?: boolean;
};

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const title = input.rawTitle ? input.title : `${input.title} ${SITE_TITLE_SUFFIX}`;
  const url = absoluteUrl(input.path);
  const ogImage = absoluteUrl("/opengraph-image");
  const noindex = input.noindex || !IS_PUBLIC;

  return {
    title,
    description: input.description,
    keywords: input.keywords,
    alternates: url ? { canonical: url } : undefined,
    robots: noindex
      ? { index: false, follow: !input.noindex }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      title,
      description: input.description,
      siteName: siteConfig.name,
      locale: "ja_JP",
      type: input.type ?? "website",
      url,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }] } : {}),
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
    },
  };
}

/** YYYY-MM-DD → 2026年10月1日 */
export function formatDateJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${y}年${m}月${d}日`;
}
