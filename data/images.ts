/**
 * サイトで使う画像の登録簿。public/images/*.webp（scripts/prepare-images.cjs で生成）。
 * - alt は「イメージ」であることが分かる書き方にし、実在の場所・人物・施工実績を断定しない。
 * - decorative: true のものは装飾扱い（alt を空にして読み上げ対象から外す）。
 * - 差し替えるときは public/images に同名で上書きするか、ここの src を変える。
 */

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  decorative?: boolean;
}

const photo = (name: string, alt: string, width = 1600, height = 900): SiteImage => ({ src: `/images/${name}.webp`, alt, width, height });
const icon = (name: string, alt: string): SiteImage => ({ src: `/images/${name}.webp`, alt, width: 800, height: 800, decorative: true });
const people = (name: string, alt: string, width = 1200, height = 900): SiteImage => ({ src: `/images/${name}.webp`, alt, width, height, decorative: true });

export const images = {
  // ───────── 写真（イメージ）
  heroHouseSunset: photo("hero-house-sunset", "太陽光パネルを載せた住宅と夕暮れの街並みのイメージ", 1672, 941),
  roofPanelsSunset: photo("roof-panels-sunset", "夕日を受ける屋根の太陽光パネルのイメージ"),
  batteryIndoor: photo("battery-indoor", "屋内に設置された家庭用蓄電池のイメージ"),
  houseBatterySunset: photo("house-battery-sunset", "太陽光パネルと屋外蓄電池を備えた住宅の夕景イメージ"),
  houseEvV2h: photo("house-ev-v2h", "太陽光パネル・蓄電池・電気自動車を備えた住宅のイメージ"),
  consultationDesk: photo("consultation-desk", "タブレットと資料で太陽光発電の計画を確認する打ち合わせのイメージ"),
  panelBatteryProducts: photo("panel-battery-products", "太陽光パネルと家庭用蓄電池・パワーコンディショナのイメージ"),
  katsushikaStreetSunset: photo("katsushika-street-sunset", "戸建住宅が並ぶ住宅街と夕暮れの街並みのイメージ"),
  installationRoofWork: photo("installation-roof-work", "屋根で太陽光パネルを設置する作業のイメージ"),
  houseDuskLights: photo("house-dusk-lights", "夕暮れに明かりの灯る太陽光パネル付き住宅のイメージ"),
  roofPanelsSky1: photo("roof-panels-sky-1", "青空の下の屋根に設置された太陽光パネルのイメージ"),
  houseRoofPanelsSky: photo("house-roof-panels-sky", "屋根に太陽光パネルを載せた住宅と青空のイメージ"),
  panelsCloseupSky: photo("panels-closeup-sky", "太陽光パネルの表面と青空のクローズアップイメージ"),
  batteryOutdoorWall: photo("battery-outdoor-wall", "住宅の外壁沿いに設置された屋外用蓄電池のイメージ"),
  houseBatteryOutdoor: photo("house-battery-outdoor", "太陽光パネルと屋外蓄電池を備えた住宅の昼のイメージ"),
  roofPanelsTree1: photo("roof-panels-tree-1", "樹木越しに見る屋根の太陽光パネルのイメージ"),
  roofPanelsFront: photo("roof-panels-front", "正面から見た屋根の太陽光パネルの配置イメージ"),
  batteryPowerconOutdoor: photo("battery-powercon-outdoor", "外壁に設置されたパワーコンディショナと屋外蓄電池のイメージ"),
  roofPanelsSky2: photo("roof-panels-sky-2", "屋根の太陽光パネルと青空のイメージ"),
  roofPanelsTree2: photo("roof-panels-tree-2", "緑と青空の中の屋根の太陽光パネルのイメージ"),
  houseRoofSkyWide: photo("house-roof-sky-wide", "太陽光パネルを載せた屋根と太陽のイメージ", 1536, 1024),
  roofPanelsTree3: photo("roof-panels-tree-3", "青空と太陽光パネルの家のイメージ", 1536, 1024),

  // ───────── アイコン（装飾）
  iconSunPanel: icon("icon-sun-panel", "太陽と太陽光パネルのアイコン"),
  iconHouseSolar: icon("icon-house-solar", "太陽光パネルを載せた家のアイコン"),
  iconHouseBattery: icon("icon-house-battery", "太陽光パネルの家と蓄電池のアイコン"),
  iconPanelLeaf: icon("icon-panel-leaf", "太陽光パネルと葉のアイコン"),
  iconHouseYen: icon("icon-house-yen", "太陽光パネルの家と円マークのアイコン"),
  iconHouseShield: icon("icon-house-shield", "太陽光パネルの家と盾のアイコン"),
  iconPanelWrench: icon("icon-panel-wrench", "太陽光パネルと工具のアイコン"),
  iconHouseEv: icon("icon-house-ev", "太陽光パネルの家と電気自動車のアイコン"),
  iconClipboardHouse: icon("icon-clipboard-house", "チェックリストと太陽光パネルの家のアイコン"),
  iconHandPanel: icon("icon-hand-panel", "手のひらに載せた太陽光パネルのアイコン"),

  // ───────── 人物イラスト（装飾）
  peopleCoupleTalk: people("people-couple-talk", "相談する夫婦のイラスト"),
  peopleCoupleThink: people("people-couple-think", "考え込む夫婦のイラスト"),
  peopleFamily: people("people-family", "笑顔の家族のイラスト"),
  peopleStaffPoint: people("people-staff-point", "説明するスタッフのイラスト"),
  peopleStaffWoman: people("people-staff-woman", "説明する女性スタッフのイラスト"),
  peopleCoupleClipboard: people("people-couple-clipboard", "書類を確認する夫婦のイラスト"),
  peopleStaffOk: people("people-staff-ok", "OKサインをするスタッフのイラスト"),
  peopleWomanThink: people("people-woman-think", "考える女性のイラスト"),
  peopleCoupleHappy: people("people-couple-happy", "喜ぶ夫婦のイラスト"),
  peopleFamily2: people("people-family-2", "家族のイラスト"),
  peopleStaffPoint2: people("people-staff-point-2", "説明するスタッフのイラスト", 1200, 800),
  peopleStaffPoint3: people("people-staff-point-3", "説明するスタッフのイラスト", 1200, 800),
} as const;

export type ImageKey = keyof typeof images;
