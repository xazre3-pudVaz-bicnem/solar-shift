import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** Web アプリマニフェスト（ホーム画面に追加したときの名前・色・アイコン）。アイコンは app/icon.svg から作った PNG。 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name}｜${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "browser",
    lang: "ja",
    background_color: "#fdf6d6",
    theme_color: "#0b1f3a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
