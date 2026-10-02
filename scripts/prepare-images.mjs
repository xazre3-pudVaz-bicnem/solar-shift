/**
 * 施主から受け取った画像（_photo-sources/ 内の元画像）を WebP に最適化して public/images/<用途>/ に出力する。
 * 出力名に「フォルダ/名前」を書く（hero / solar / battery / scene / icons / illustrations）。
 *   node scripts/prepare-images.mjs
 * 元ファイルは Git 管理外の _photo-sources/ に置く（public/ に置くと全部配信されてしまう）。
 * data/images.ts のキーとファイル名を揃えること。
 * アイコン（icon-*）と人物イラスト（people-*）は白〜クリーム色の背景を透過にする。
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "_photo-sources");
const OUT = path.join(process.cwd(), "public", "images");
fs.mkdirSync(OUT, { recursive: true });

// 元ファイル名 → 出力名・最大幅
const MAP = [
  // 写真
  ["ChatGPT 画像 2026年10月1日 14_08_37-1.png", "solar/house-sunset-town", 1672],
  ["ChatGPT 画像 2026年10月1日 14_08_39-2.png", "solar/roof-panels-sunset", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_41-3.png", "battery/battery-indoor", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_43-4.png", "battery/house-battery-sunset", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_45-5.png", "battery/house-ev-v2h", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_46-6.png", "scene/consultation-desk", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_48-7.png", "battery/panel-battery-products", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_50-8.png", "scene/residential-street-sunset", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_52-9.png", "solar/installation-roof-work", 1600],
  ["ChatGPT 画像 2026年10月1日 14_08_54-10.png", "solar/house-dusk-lights", 1600],
  ["ChatGPT 画像 2026年10月1日 14_12_49-1.png", "solar/roof-panels-sky-1", 1600],
  ["ChatGPT 画像 2026年10月1日 14_12_51-2.png", "solar/house-roof-panels-sky", 1600],
  ["ChatGPT 画像 2026年10月1日 14_12_53-3.png", "solar/panels-closeup-sky", 1600],
  ["ChatGPT 画像 2026年10月1日 14_12_55-4.png", "battery/battery-outdoor-wall", 1600],
  ["ChatGPT 画像 2026年10月1日 14_12_56-5.png", "battery/house-battery-outdoor", 1600],
  ["ChatGPT 画像 2026年10月1日 14_12_58-6.png", "solar/roof-panels-tree-1", 1600],
  ["ChatGPT 画像 2026年10月1日 14_12_59-7.png", "solar/roof-panels-front", 1600],
  ["ChatGPT 画像 2026年10月1日 14_13_02-8.png", "battery/battery-powercon-outdoor", 1600],
  ["ChatGPT 画像 2026年10月1日 14_13_03-9.png", "solar/roof-panels-sky-2", 1600],
  ["ChatGPT 画像 2026年10月1日 14_13_05-10.png", "solar/roof-panels-tree-2", 1600],
  ["太陽光パネルのある現代住宅-2.png", "solar/house-roof-sky-wide", 1536],
  ["青空と太陽光パネルの家-1.png", "solar/roof-panels-tree-3", 1536],
  // アイコン（オレンジ系・ブランドに合わせて使用）
  ["ChatGPT 画像 2026年10月1日 14_49_13-1.png", "icons/icon-sun-panel", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_15-2.png", "icons/icon-house-solar", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_16-3.png", "icons/icon-house-battery", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_18-4.png", "icons/icon-panel-leaf", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_20-5.png", "icons/icon-house-yen", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_22-6.png", "icons/icon-house-shield", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_24-7.png", "icons/icon-panel-wrench", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_26-8.png", "icons/icon-house-ev", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_29-9.png", "icons/icon-clipboard-house", 800],
  ["ChatGPT 画像 2026年10月1日 14_49_31-10.png", "icons/icon-hand-panel", 800],
  // アイコン（緑系・予備）
  ["ChatGPT 画像 2026年10月1日 14_45_48-1.png", "icons/icon-g-house-yen-leaf", 800],
  ["ChatGPT 画像 2026年10月1日 14_45_50-2.png", "icons/icon-g-hand-house-yen", 800],
  ["ChatGPT 画像 2026年10月1日 14_45_52-3.png", "icons/icon-g-sun-panel-leaf", 800],
  ["ChatGPT 画像 2026年10月1日 14_45_53-4.png", "icons/icon-g-house-battery", 800],
  ["ChatGPT 画像 2026年10月1日 14_45_56-5.png", "icons/icon-g-bill-down", 800],
  ["ChatGPT 画像 2026年10月1日 14_45_57-6.png", "icons/icon-g-house-wrench", 800],
  ["ChatGPT 画像 2026年10月1日 14_45_59-7.png", "icons/icon-g-clipboard-house", 800],
  ["ChatGPT 画像 2026年10月1日 14_46_01-8.png", "icons/icon-g-house-shield", 800],
  ["ChatGPT 画像 2026年10月1日 14_46_03-9.png", "icons/icon-g-house-ev", 800],
  ["ChatGPT 画像 2026年10月1日 14_46_04-10.png", "icons/icon-g-house-battery-2", 800],
  // 人物イラスト
  ["ChatGPT 画像 2026年10月1日 15_16_08-1.png", "illustrations/people-couple-talk", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_10-2.png", "illustrations/people-couple-think", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_13-3.png", "illustrations/people-family", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_16-4.png", "illustrations/people-staff-point", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_18-5.png", "illustrations/people-staff-woman", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_20-6.png", "illustrations/people-couple-clipboard", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_22-7.png", "illustrations/people-staff-ok", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_24-8.png", "illustrations/people-woman-think", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_27-9.png", "illustrations/people-couple-happy", 1200],
  ["ChatGPT 画像 2026年10月1日 15_16_29-10.png", "illustrations/people-family-2", 1200],
  ["スーツ姿の男性による説明ポーズ-4.png", "illustrations/people-staff-point-2", 1200],
  ["指を立てて説明する笑顔のビジネスマン-2.png", "illustrations/people-staff-point-3", 1200],
  // 2026-10-02 追加：ヒーロー背景（横長）
  ["青空に映える太陽光住宅と街並み.png", "hero/solar-home-blue-sky", 1672],
  ["太陽光発電のある現代住宅と街並み.png", "hero/solar-home-riverside", 1672],
  // hero/solar-home-blue-sky-portrait（584×941）は、上の「青空に映える…」の x=736 から幅 584 を切り出したもの（スマホのヒーロー用）
  // 2026-10-02 追加：小さな写真（326×462。端の白い線を 2px 落として取り込んだ。scratch の移行スクリプトで変換済み）
  //   solar-home-roof.jpg → solar/solar-home-roof-portrait ／ solar-panel-closeup.jpg → solar/solar-panel-closeup-portrait
  //   solar-installation-technician.jpg → solar/solar-installation-technician ／ home-battery.jpg → battery/home-battery-portrait
  //   ev-charging.jpg → battery/ev-charging-portrait ／ energy-efficient-home.jpg → scene/bright-living-room
  //   family-solar-living.jpg → scene/family-at-home ／ katsushika-riverside-area.jpg → scene/riverside-town
  //   solar-savings-consultation.jpg → scene/savings-consultation-tablet
];

/**
 * 白〜クリーム色の背景を透過にする（アイコン・人物イラスト用）。
 * min(r,g,b) が 236 以上の画素はなだらかに alpha を落とす（236→不透明、255→完全透過）。
 * 線画の縁（暗い画素）はそのまま残る。
 */
async function knockoutWhite(pipeline) {
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // 背景の微細なノイズが半透明の斑になると WebP が肥大化するため、
  // 242 以上は完全透過、230〜242 だけ短い勾配にする。
  for (let i = 0; i < data.length; i += 4) {
    const m = Math.min(data[i], data[i + 1], data[i + 2]);
    if (m >= 242) data[i + 3] = 0;
    else if (m >= 230) data[i + 3] = Math.min(data[i + 3], Math.round(((242 - m) / 12) * 255));
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

const only = process.argv[2]; // 例: node scripts/prepare-images.mjs icons/  → 前方一致で絞り込み

for (const [src, name, maxW] of MAP) {
  if (only && !name.startsWith(only)) continue;
  const file = path.join(SRC, src);
  if (!fs.existsSync(file)) {
    console.warn(`見つかりません: ${src}`);
    continue;
  }
  const out = path.join(OUT, `${name}.webp`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const base = path.basename(name);
  const transparent = base.startsWith("icon-") || base.startsWith("people-");
  let pipeline = sharp(file).resize({ width: maxW, withoutEnlargement: true });
  if (transparent) pipeline = await knockoutWhite(pipeline);
  const info = await pipeline.webp({ quality: transparent ? 82 : 80, alphaQuality: transparent ? 50 : 100, effort: 5 }).toFile(out);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`);
}
