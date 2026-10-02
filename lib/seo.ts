import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

/**
 * 本番 URL は NEXT_PUBLIC_SITE_URL（または SITE_URL）だけから決める。
 * この値は next.config.ts がビルド時に決めて埋め込む：環境変数があればそれを、無ければ Vercel の
 * 本番デプロイのときだけ lib/site.ts の productionUrl（本番ドメイン）を使う。
 * 空なら canonical / OG URL / sitemap を一切出さず、robots は noindex にする（プレビュー・手元のビルド）。
 * NODE_ENV は見ない（Vercel のプレビューも production ビルドのため）。
 *
 * このファイルはクライアントコンポーネントからも読み込まれる（formatDateJa）。
 * fs などサーバー専用のモジュールを import しないこと。
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
export const SITE_URL: string | undefined = RAW_SITE_URL ? RAW_SITE_URL.replace(/\/+$/, "") : undefined;
export const IS_PUBLIC = Boolean(SITE_URL);

if (!IS_PUBLIC && process.env.NODE_ENV === "production" && typeof window === "undefined") {
  console.warn(
    "[SOLAR SHIFT] 本番 URL が決まっていないビルドです（Vercel の本番デプロイではなく、NEXT_PUBLIC_SITE_URL も未設定）。canonical/OG/sitemap は出力されず、全ページ noindex になります。",
  );
}

export function absoluteUrl(path = "/"): string | undefined {
  if (!SITE_URL) return undefined;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * タイトルの末尾。検索結果で表示されるのは全角30字前後なので、サフィックスは短くする
 * （地域名はページ側のタイトルに入れる。サフィックスに長い説明を付けると本題が切れる）。
 */
export const SITE_TITLE_SUFFIX = `｜${siteConfig.name}`;

/** 文字の幅（半角を1、全角を2と数える） */
export function textWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += /[\u0020-\u007e\uff61-\uff9f]/.test(ch) ? 1 : 2;
  return w;
}

/**
 * 本体がこの幅を超えるタイトルには、末尾の「｜SOLAR SHIFT」を付けない。
 * 検索結果のタイトルは全角30字前後で切れる。サイト名は検索結果に別枠で出るので、長いタイトルでは本題を優先する。
 */
export const TITLE_SUFFIX_MAX_WIDTH = 50;

export function fullTitle(title: string): string {
  return textWidth(title) > TITLE_SUFFIX_MAX_WIDTH ? title : `${title}${SITE_TITLE_SUFFIX}`;
}

/** SNS 共有用の画像（app/og/[[...path]]/route.tsx がビルド時に生成する）。ページのパスと 1 対 1 */
export function ogImagePath(path: string): string {
  return path === "/" ? "/og" : `/og${path}`;
}

type BuildMetadataInput = {
  /** 「｜SOLAR SHIFT」を付ける前のタイトル（長いときは付かない。fullTitle を参照） */
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
  /** 記事のカテゴリ名（og:article:section） */
  section?: string;
  /** 記事のタグ（og:article:tag） */
  tags?: string[];
  /**
   * OG 画像を別ページのものにしたいとき、そのページのパスを渡す
   * （一覧の2ページ目以降は、1ページ目と同じ画像を使う）。
   */
  ogFrom?: string;
};

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const title = input.rawTitle ? input.title : fullTitle(input.title);
  const url = absoluteUrl(input.path);
  const ogImage = absoluteUrl(ogImagePath(input.ogFrom ?? input.path));
  const noindex = input.noindex || !IS_PUBLIC;
  const feed = absoluteUrl("/feed.xml");

  return {
    title,
    description: input.description,
    keywords: input.keywords,
    alternates: url
      ? {
          canonical: url,
          ...(feed ? { types: { "application/rss+xml": [{ url: feed, title: `${siteConfig.name} ブログ` }] } } : {}),
        }
      : undefined,
    // 本番URL未設定（プレビュー）は noindex,nofollow。準備中ページは noindex,follow（リンクはたどらせる）
    robots: noindex
      ? { index: false, follow: IS_PUBLIC }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      title,
      description: input.description,
      siteName: siteConfig.name,
      locale: "ja_JP",
      type: input.type ?? "website",
      url,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }] } : {}),
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime, authors: [siteConfig.editorial.supervisor], section: input.section, tags: input.tags }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/** YYYY-MM-DD → 2026年10月1日 */
export function formatDateJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${y}年${m}月${d}日`;
}
