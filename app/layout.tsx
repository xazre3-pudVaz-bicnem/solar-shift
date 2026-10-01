import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingDock } from "@/components/layout/FloatingDock";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";
import { SITE_URL, IS_PUBLIC, formatDateJa } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: `${siteConfig.name}｜葛飾区の太陽光発電・蓄電池・補助金サポート`,
    template: `%s`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.company.name, url: siteConfig.company.corporateUrl }],
  creator: siteConfig.company.name,
  publisher: siteConfig.company.name,
  category: "住宅用太陽光発電・蓄電池",
  robots: IS_PUBLIC ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { siteName: siteConfig.name, locale: "ja_JP", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  // ブログの RSS（各ページの buildMetadata でも同じものを出している）
  alternates: SITE_URL ? { types: { "application/rss+xml": [{ url: `${SITE_URL}/feed.xml`, title: `${siteConfig.name} ブログ` }] } } : undefined,
  // Search Console / Bing Webmaster Tools の所有権確認（環境変数に値があるときだけ出力する）
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1f3a",
};

/**
 * フォントの読み込み方針（スマホの表示速度を最優先）
 *
 * - 欧文・数字（Montserrat）… 基本ラテン文字だけの1ファイル（約24KB）を全画面幅で使う。
 *   @font-face は globals.css、ここでは preload だけ行う。
 * - 見出し用の日本語フォント（Zen Kaku Gothic New）… 画面幅 1024px 以上のときだけ読み込む。
 *   日本語フォントは unicode-range で分割されていて、1ページで 40〜50 ファイル（約 450KB）を取りに行く。
 *   スマホでこれを読むと Lighthouse の FCP が 0.9 秒 → 5.3 秒に悪化したため、スマホは端末標準の太字ゴシックにする。
 *   PC でも、読み込みは最初の描画が終わってからにする。具体的には load イベントのあと、
 *   最大の要素の描画（LCP）の記録が 0.35 秒止まったら読み込む（遅くとも load の 4 秒後）。
 *   描画の前に取りに行くと、数十個のフォントファイルが最初の描画と帯域を取り合う。
 *   条件つきで後から足すため、<link> ではなく inline script で生成している。
 */
const FONT_LOADER = `(function(){if(!window.matchMedia||!matchMedia("(min-width:1024px)").matches)return;var done=false,t;function add(){if(done)return;done=true;var l=document.createElement("link");l.rel="stylesheet";l.href="/fonts/zen-kaku-gothic-new.css";document.head.appendChild(l)}function arm(){clearTimeout(t);t=setTimeout(add,350)}function start(){try{new PerformanceObserver(arm).observe({type:"largest-contentful-paint",buffered:true})}catch(e){}arm();setTimeout(add,4000)}if(document.readyState==="complete")start();else addEventListener("load",start,{once:true})})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 欧文フォントは最初の描画に使うので先読みする（ロゴの「SOLAR SHIFT」と大きな数字）
  preload("/fonts/montserrat-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body className="min-h-dvh">
        <script dangerouslySetInnerHTML={{ __html: FONT_LOADER }} />
        <noscript>
          {/* JSが無効な環境向けのフォールバック。通常は上のスクリプトが非同期で読み込む */}
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href="/fonts/zen-kaku-gothic-new.css" media="(min-width: 1024px)" />
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
        >
          本文へ移動
        </a>
        <Header />
        {/*
          注意：ここで {children} を <Suspense> で囲まないこと。
          囲むとハイドレーションは小分けになるが、静的生成した HTML で本文が <main> の外
          （<div hidden id="S:0">）に回され、インラインスクリプトで差し込む形になる。
          JS を実行しないクローラーや JS 無効の環境で本文が空になるため、採用しない（実測して確認済み）。
        */}
        <main id="main">{children}</main>
        <Footer />
        <FloatingDock infoDate={formatDateJa(siteConfig.subsidyInfoDate)} />
        <RevealObserver />
        <JsonLd data={graph(organizationSchema(), localBusinessSchema(), websiteSchema())} />
      </body>
    </html>
  );
}
