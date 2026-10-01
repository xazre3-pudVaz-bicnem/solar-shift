import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { OgPage } from "@/lib/og-pages";

/**
 * SNS 共有用の画像（1200×630）を描く。ビルド時に静的生成される（app/og/[[...path]]/route.tsx）。
 *
 * - フォントは assets/fonts の Zen Kaku Gothic New Black（SIL OFL。ライセンス文は同じフォルダの OFL.txt）。
 *   next/og は woff2 を読めないので、サイト表示用の public/fonts とは別に TTF を同梱している。
 * - 日本語は文節の途中で折り返すと読みにくいので、Intl.Segmenter で区切ってから行に詰める。
 */

export const OG_SIZE = { width: 1200, height: 630 };

const COLORS = {
  cream: "#fdf6d6",
  navy: "#0b1f3a",
  orange: "#f28c1c",
  orangeText: "#bd570b",
  green: "#14855d",
  ink2: "#334155",
  ink3: "#5b6779",
  marker: "#ffe27a",
};

let fontCache: Promise<Buffer> | null = null;
let logoCache: Promise<string> | null = null;

function loadFont(): Promise<Buffer> {
  fontCache ??= readFile(path.join(process.cwd(), "assets", "fonts", "ZenKakuGothicNew-Black.ttf"));
  return fontCache;
}

function loadLogo(): Promise<string> {
  logoCache ??= readFile(path.join(process.cwd(), "public", "logo.png")).then((b) => `data:image/png;base64,${b.toString("base64")}`);
  return logoCache;
}

/** 全角を 1、半角英数を約 0.58 として数えた幅 */
function widthOf(text: string): number {
  let w = 0;
  for (const ch of text) w += /[ -~]/.test(ch) ? 0.58 : 1;
  return w;
}

const SUFFIX_CHARS = new Set(["区", "都", "市", "県", "町", "年", "月", "日", "前", "後", "時", "版", "用", "型", "分", "等", "中", "別", "円", "件", "台", "戸"]);

/** 折り返してよい単位（文節に近いまとまり）に分ける */
export function phraseUnits(text: string): string[] {
  const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
  const units: string[] = [];
  let attachNext = false;
  for (const { segment } of segmenter.segment(text)) {
    const prev = units[units.length - 1];
    const hiraganaOnly = /^[ぁ-ゟ]+$/.test(segment);
    const closing = /^[・、。！？!?）」』】〜\-/／:：%％]+$/.test(segment);
    const opening = /^[（「『【]+$/.test(segment);
    const numeric = /^[0-9０-９.,]+$/.test(segment);
    const suffix = segment.length === 1 && SUFFIX_CHARS.has(segment);
    if (prev !== undefined && (attachNext || hiraganaOnly || closing || suffix || (numeric && /[゠-ヿ一-鿿]$/.test(prev)) || /[0-9０-９]$/.test(prev) || /^\s+$/.test(segment))) {
      units[units.length - 1] = prev + segment;
    } else {
      units.push(segment);
    }
    attachNext = opening;
  }
  return units.map((u) => u.trim()).filter(Boolean);
}

function packLines(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const unit of phraseUnits(text)) {
    if (current && widthOf(current + unit) > maxWidth) {
      lines.push(current);
      current = unit;
    } else {
      current += unit;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface TitleLayout {
  fontSize: number;
  lines: string[];
  /** 描画したときの高さ（px） */
  height: number;
}

/**
 * 行数と高さが収まる範囲で、できるだけ大きい文字サイズを選ぶ。
 * 最後の行が短い切れ端（いちばん長い行の 35% 未満）になる組み方は避け、1段小さいサイズを試す。
 */
export function layoutTitle(text: string, innerWidth: number, maxLines: number, maxHeight: number, sizes: number[], lineHeight: number): TitleLayout {
  let fallback: TitleLayout | null = null;
  for (const fontSize of sizes) {
    const lines = packLines(text, innerWidth / fontSize);
    const widths = lines.map(widthOf);
    const fits = widths.every((w) => w <= innerWidth / fontSize + 0.01);
    const height = lines.length * fontSize * lineHeight;
    if (!fits || lines.length > maxLines || height > maxHeight) continue;
    const layout = { fontSize, lines, height };
    fallback ??= layout;
    const orphan = lines.length > 1 && widths[widths.length - 1] < Math.max(...widths) * 0.35;
    if (!orphan) return layout;
  }
  if (fallback) return fallback;
  const fontSize = sizes[sizes.length - 1];
  const lines = packLines(text, innerWidth / fontSize).slice(0, maxLines);
  return { fontSize, lines, height: lines.length * fontSize * lineHeight };
}

export async function renderOgImage(page: OgPage): Promise<ImageResponse> {
  const [font, logo] = await Promise.all([loadFont(), loadLogo()]);
  const [mainRaw, ...rest] = page.title.split("｜");
  const sub = rest.join("｜");
  const inner = 1200 - 44 * 2 - 60 * 2;
  // 見出し＋副題に使える高さ（ラベルとフッターを除いた残り）
  const budget = 262;
  const subLayout = sub ? layoutTitle(sub, inner, 2, 110, [38, 34, 30, 26], 1.4) : null;
  const main = layoutTitle(mainRaw, inner, sub ? 2 : 3, budget - (subLayout ? subLayout.height + 20 : 0), [78, 70, 64, 58, 52, 46, 40], 1.32);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: COLORS.cream, padding: 44, fontFamily: "Zen" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative",
            background: "#ffffff",
            borderRadius: 44,
            padding: "50px 60px 44px",
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(11,31,58,0.16)",
          }}
        >
          <div style={{ position: "absolute", right: -70, top: -70, width: 250, height: 250, borderRadius: 250, background: "#ffdca3", display: "flex" }} />
          <div style={{ position: "absolute", right: 150, top: 46, width: 30, height: 30, borderRadius: 30, background: "#46bf96", display: "flex" }} />
          <div style={{ position: "absolute", right: -40, bottom: -90, width: 220, height: 220, borderRadius: 220, background: "#d7f3e7", display: "flex" }} />

          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", background: COLORS.orange, color: COLORS.navy, fontSize: 28, padding: "8px 30px 10px", borderRadius: 999 }}>{page.eyebrow}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
            {main.lines.map((line) => (
              <div key={line} style={{ display: "flex", fontSize: main.fontSize, lineHeight: 1.32, color: COLORS.navy, letterSpacing: 1 }}>
                {line}
              </div>
            ))}
          </div>

          {subLayout && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
              {subLayout.lines.map((line) => (
                <div key={line} style={{ display: "flex", fontSize: subLayout.fontSize, lineHeight: 1.4, color: COLORS.green }}>
                  {line}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", borderTop: "4px solid #f4efe6", paddingTop: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={70} height={70} alt="" />
            <div style={{ display: "flex", marginLeft: 18, fontSize: 40, letterSpacing: 3, color: COLORS.navy }}>
              SOLAR<span style={{ color: COLORS.orangeText, marginLeft: 14 }}>SHIFT</span>
            </div>
            <div style={{ display: "flex", flex: 1 }} />
            <div style={{ display: "flex", fontSize: 24, color: COLORS.ink3 }}>葛飾区の太陽光発電・蓄電池｜株式会社サイプレス</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Zen", data: font, weight: 900, style: "normal" }],
    },
  );
}
