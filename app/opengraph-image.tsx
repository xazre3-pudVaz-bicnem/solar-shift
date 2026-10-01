import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "SOLAR SHIFT - Solar & Battery, Katsushika Tokyo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG画像（ビルド時に静的生成）。
 * 日本語フォントを同梱していないため、文字はロゴ画像＋英字のみで構成する。
 * 日本語入りのOG画像にしたい場合は public/og-image.png を用意し、lib/seo.ts の ogImage を差し替える。
 */
export default async function OgImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: "#0b1f3a", display: "flex" }} />
        <div style={{ position: "absolute", left: 18, top: 0, bottom: 0, width: 8, background: "#f28c1c", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 96px 0 120px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={240} height={240} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: 6, color: "#0b1f3a", lineHeight: 1 }}>
                SOLAR <span style={{ color: "#f28c1c", marginLeft: 22 }}>SHIFT</span>
              </div>
              <div style={{ display: "flex", marginTop: 26, fontSize: 30, fontWeight: 600, color: "#334155", letterSpacing: 2 }}>
                Residential Solar & Battery
              </div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 30, fontWeight: 600, color: "#334155", letterSpacing: 2 }}>
                Katsushika, Tokyo
              </div>
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 56, fontSize: 24, color: "#64748b", letterSpacing: 1 }}>
            Operated by Cypress Inc.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
