/**
 * 1枚にまとめられたイラスト集（ポーズ集・蓄電池アイコン集）を個別のイラストに切り出す。
 *   node scripts/prepare-illustrations.mjs
 *
 * - ポーズ集は背景が透過のPNG。隣のポーズがはみ出すため、切り出し範囲の左右の端に触れている
 *   「本体以外の連結成分」を消してから保存する。
 * - 蓄電池アイコン集は白背景（蓄電池本体が白いので透過にはしない）。切り出して余白をトリムする。
 * 座標は 1400px 幅のプレビューで測った値（SCALE で元画像の座標に直す）。
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "_photo-sources");
const OUT = path.join(process.cwd(), "public", "images", "illustrations");
fs.mkdirSync(OUT, { recursive: true });
const SCALE = 1536 / 1400;

const POSES = {
  file: "ビジネスマンのポーズ集インフォグラフィック.png",
  // 5番目以降の要素は「消す多角形」（隣のポーズと重なって描かれている部分）。
  // pose-explain は既存の people-staff-point-2 と同じポーズのため切り出さない。
  items: [
    ["pose-idea", 285, 80, 572, 452, [[285, 255], [299, 255], [309, 283], [301, 299], [291, 321], [285, 326]]],
    ["pose-think", 572, 100, 822, 452],
    [
      "pose-laptop", 822, 105, 1140, 452,
      [[1116, 250], [1145, 250], [1145, 306.5], [1116, 306.5]],
      [[1141.5, 320], [1128.8, 364], [1115.5, 410], [1115.5, 455], [1145, 455], [1145, 312], [1141.5, 314]],
    ],
    ["pose-fist", 1118, 100, 1400, 452, [[1117, 304], [1144, 304], [1144, 317], [1142.5, 321], [1130, 364], [1117, 409]]],
    ["pose-phone", 5, 485, 285, 842],
    ["pose-calc", 280, 490, 552, 842],
    ["pose-chart", 550, 490, 848, 842],
    ["pose-trust", 848, 485, 1105, 842],
    ["pose-ok", 1112, 490, 1400, 842],
  ],
};

const BATTERY_SHEETS = [
  {
    file: "家庭用蓄電池アイコンコレクション-5.png",
    items: [
      ["bat-unit", 0, 95, 285, 440],
      ["bat-house-flow", 285, 80, 572, 440],
      ["bat-day-night", 585, 95, 832, 440],
      ["bat-home-appliances", 830, 140, 1152, 440],
      ["bat-shield", 1150, 100, 1400, 440],
      ["bat-storm", 0, 480, 266, 850],
      ["bat-stack", 280, 510, 556, 850],
      ["bat-eco", 560, 490, 858, 850],
      ["bat-inside", 866, 520, 1126, 850],
      ["bat-temperature", 1140, 495, 1400, 850],
    ],
  },
  {
    file: "家庭用蓄電池エネルギーアイコン集-2.png",
    items: [
      ["bat-outdoor", 0, 120, 292, 452],
      ["bat-solar-to-home", 292, 100, 586, 452],
      ["bat-night", 588, 110, 888, 452],
      ["bat-charge", 892, 110, 1072, 462],
      ["bat-storm-2", 1076, 80, 1400, 462],
      ["bat-yen-down", 10, 500, 268, 862, [[257, 690], [270, 690], [270, 870], [257, 870]]],
      ["bat-solar-house", 262, 520, 596, 862, [[583.5, 655], [600, 655], [600, 870], [583.5, 870]], [[568, 806], [600, 806], [600, 870], [568, 870]]],
      ["bat-ev", 572, 530, 888, 862, [[570, 515], [597, 515], [597, 653], [570, 653]]],
      ["bat-cabinet", 886, 510, 1102, 862],
      ["bat-app", 1118, 520, 1400, 862],
    ],
  },
];

const box = (x0, y0, x1, y1, W, H) => {
  const left = Math.max(0, Math.round(x0 * SCALE));
  const top = Math.max(0, Math.round(y0 * SCALE));
  const width = Math.min(W - left, Math.round((x1 - x0) * SCALE));
  const height = Math.min(H - top, Math.round((y1 - y0) * SCALE));
  return { left, top, width, height };
};

/** 消す多角形（プレビュー座標）を、切り出し範囲ローカルの SVG にする */
function polygonSvg(polys, region, fill) {
  const pts = (poly) => poly.map(([x, y]) => `${(x * SCALE - region.left).toFixed(1)},${(y * SCALE - region.top).toFixed(1)}`).join(" ");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${region.width}" height="${region.height}">${polys.map((p) => `<polygon points="${pts(p)}" fill="${fill}"/>`).join("")}</svg>`,
  );
}

/** 左右の端に触れている「最大でない連結成分」を透明にする（隣のポーズのはみ出しを消す） */
function dropEdgeComponents(data, w, h) {
  const label = new Int32Array(w * h).fill(0);
  const comps = [];
  const stack = [];
  let n = 0;
  for (let i = 0; i < w * h; i += 1) {
    if (label[i] !== 0 || data[i * 4 + 3] <= 24) continue;
    n += 1;
    let size = 0;
    let touch = false;
    stack.push(i);
    label[i] = n;
    while (stack.length) {
      const p = stack.pop();
      size += 1;
      const x = p % w;
      const y = (p - x) / w;
      if (x === 0 || x === w - 1) touch = true;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (label[q] === 0 && data[q * 4 + 3] > 24) {
            label[q] = n;
            stack.push(q);
          }
        }
      }
    }
    comps.push({ id: n, size, touch });
  }
  const largest = comps.reduce((a, b) => (b.size > a.size ? b : a), comps[0]);
  const drop = new Set(comps.filter((c) => c.touch && c.id !== largest.id).map((c) => c.id));
  for (let i = 0; i < w * h; i += 1) if (drop.has(label[i])) data[i * 4 + 3] = 0;
  return comps.length - drop.size;
}

{
  const file = path.join(SRC, POSES.file);
  const meta = await sharp(file).metadata();
  for (const [name, x0, y0, x1, y1, ...polys] of POSES.items) {
    const region = box(x0, y0, x1, y1, meta.width, meta.height);
    let img = sharp(file).extract(region).ensureAlpha();
    if (polys.length) {
      // extract と composite を同じパイプラインに載せると順序が保証されないため、一度バッファに落とす
      const cut = await img.png().toBuffer();
      img = sharp(cut).composite([{ input: polygonSvg(polys, region, "#000"), blend: "dest-out" }]);
    }
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const kept = dropEdgeComponents(data, info.width, info.height);
    const out = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .trim({ threshold: 1 })
      .webp({ quality: 84, alphaQuality: 60, effort: 5 })
      .toFile(path.join(OUT, `${name}.webp`));
    console.log(`${name}.webp ${out.width}x${out.height} ${(out.size / 1024).toFixed(0)}KB (parts: ${kept})`);
  }
}

for (const sheet of BATTERY_SHEETS) {
  const file = path.join(SRC, sheet.file);
  const meta = await sharp(file).metadata();
  for (const [name, x0, y0, x1, y1, ...polys] of sheet.items) {
    const region = box(x0, y0, x1, y1, meta.width, meta.height);
    let cropped = await sharp(file).extract(region).flatten({ background: "#ffffff" }).png().toBuffer();
    if (polys.length) cropped = await sharp(cropped).composite([{ input: polygonSvg(polys, region, "#ffffff") }]).png().toBuffer();
    const trimmed = await sharp(cropped).trim({ background: "#ffffff", threshold: 12 }).toBuffer();
    // 余白を少し足して正方形に近いキャンバスへ（白背景）
    const m = await sharp(trimmed).metadata();
    const side = Math.max(m.width, m.height) + 32;
    const out = await sharp(trimmed)
      .extend({
        top: Math.floor((side - m.height) / 2),
        bottom: Math.ceil((side - m.height) / 2),
        left: Math.floor((side - m.width) / 2),
        right: Math.ceil((side - m.width) / 2),
        background: "#ffffff",
      })
      .resize({ width: 560, withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toFile(path.join(OUT, `${name}.webp`));
    console.log(`${name}.webp ${out.width}x${out.height} ${(out.size / 1024).toFixed(0)}KB`);
  }
}
