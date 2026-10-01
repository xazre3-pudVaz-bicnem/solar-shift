import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";
import { SITE_URL, IS_PUBLIC } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: `${siteConfig.name}｜葛飾区の太陽光発電・蓄電池・補助金サポート`,
    template: `%s`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: IS_PUBLIC ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { siteName: siteConfig.name, locale: "ja_JP", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
        >
          本文へ移動
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd data={graph(organizationSchema(), localBusinessSchema(), websiteSchema())} />
      </body>
    </html>
  );
}
