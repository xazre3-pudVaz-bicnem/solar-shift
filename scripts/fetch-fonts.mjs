/**
 * 見出し用フォントを自前でホストする。
 *   node scripts/fetch-fonts.mjs
 * next/font/google に日本語フォントを渡すと unicode-range 分割の @font-face が
 * ページCSSに全部入りになりレンダリングをブロックするため、woff2 と CSS を public/fonts に落とし、
 * layout.tsx から media="print" → onload で非同期に読み込む。
 * 本文は端末標準のゴシックのまま（速度優先）。
 *
 * 欧文・数字用の Montserrat はここでは取得しない。Google Fonts の latin（可変 700〜800）を
 * 基本ラテン文字だけにサブセットした public/fonts/montserrat-latin.woff2 を同梱している
 * （subset-font で U+0020-007E と数値用の記号だけを残したもの）。@font-face は app/globals.css。
 */
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "fonts");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const FAMILIES = [
  {
    dir: "zen-kaku-gothic-new",
    css: "zen-kaku-gothic-new.css",
    url: "https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@700;900&display=swap",
  },
];

for (const family of FAMILIES) {
  const dir = path.join(OUT_DIR, family.dir);
  fs.mkdirSync(dir, { recursive: true });
  const res = await fetch(family.url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`CSSの取得に失敗: ${res.status} ${family.url}`);
  let css = await res.text();
  const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((m) => m[1]))];
  console.log(`${family.dir}: ${urls.length} files`);
  for (const url of urls) {
    const name = path.basename(new URL(url).pathname);
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error(`フォントの取得に失敗: ${r.status} ${url}`);
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    }
    css = css.split(url).join(`/fonts/${family.dir}/${name}`);
  }
  fs.writeFileSync(path.join(OUT_DIR, family.css), css, "utf8");
  const total = fs.readdirSync(dir).reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0);
  console.log(`✓ public/fonts/${family.css} (${(fs.statSync(path.join(OUT_DIR, family.css)).size / 1024).toFixed(0)}KB) / woff2 ${(total / 1024 / 1024).toFixed(1)}MB`);
}
