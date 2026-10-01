/**
 * サイトで使う画像の登録簿。public/images/*.webp
 *   写真・アイコン・人物イラスト … scripts/prepare-images.mjs
 *   ポーズ・蓄電池イラスト       … scripts/prepare-illustrations.mjs（1枚のシートから切り出し）
 *
 * - alt は「イメージ」であることが分かる書き方にし、実在の場所・人物・施工実績を断定しない。
 * - decorative: true のものは装飾扱い（alt を空にして読み上げ対象から外す）。
 * - white: true のものは背景が白のまま（透過ではない）。白いカードの上でだけ使う。
 */

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  decorative?: boolean;
  white?: boolean;
}

const photo = (name: string, alt: string, width = 1600, height = 900): SiteImage => ({ src: `/images/${name}.webp`, alt, width, height });
const icon = (name: string, alt: string): SiteImage => ({ src: `/images/${name}.webp`, alt, width: 800, height: 800, decorative: true });
const people = (name: string, alt: string, width = 1200, height = 900): SiteImage => ({ src: `/images/${name}.webp`, alt, width, height, decorative: true });
const pose = (name: string, alt: string, width: number, height: number): SiteImage => ({ src: `/images/${name}.webp`, alt, width, height, decorative: true });
const bat = (name: string, alt: string, size: number): SiteImage => ({ src: `/images/${name}.webp`, alt, width: size, height: size, decorative: true, white: true });

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

  // ───────── アイコン：オレンジ系（透過・装飾）
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

  // ───────── アイコン：グリーン系（透過・装飾）
  iconGHouseYenLeaf: icon("icon-g-house-yen-leaf", "家と円マークと葉のアイコン"),
  iconGHandHouseYen: icon("icon-g-hand-house-yen", "手のひらに載せた家と円マークのアイコン"),
  iconGSunPanelLeaf: icon("icon-g-sun-panel-leaf", "太陽と太陽光パネルと葉のアイコン"),
  iconGHouseBattery: icon("icon-g-house-battery", "家と蓄電池のアイコン"),
  iconGBillDown: icon("icon-g-bill-down", "電気料金が下がる明細と家のアイコン"),
  iconGHouseWrench: icon("icon-g-house-wrench", "家と工具のアイコン"),
  iconGClipboardHouse: icon("icon-g-clipboard-house", "チェックリストと家のアイコン"),
  iconGHouseShield: icon("icon-g-house-shield", "家と盾のアイコン"),
  iconGHouseEv: icon("icon-g-house-ev", "家と電気自動車のアイコン"),
  iconGHouseBattery2: icon("icon-g-house-battery-2", "家と蓄電池のアイコン"),

  // ───────── 人物イラスト（透過・装飾）
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

  // ───────── スタッフのポーズ（透過・装飾）
  poseIdea: pose("pose-idea", "ひらめいたスタッフのイラスト", 297, 400),
  poseThink: pose("pose-think", "考えるスタッフのイラスト", 274, 374),
  poseLaptop: pose("pose-laptop", "ノートパソコンを持つスタッフのイラスト", 349, 362),
  poseFist: pose("pose-fist", "こぶしを握るスタッフのイラスト", 291, 368),
  posePhone: pose("pose-phone", "電話をするスタッフのイラスト", 302, 376),
  poseCalc: pose("pose-calc", "電卓を持つスタッフのイラスト", 292, 377),
  poseChart: pose("pose-chart", "資料を持つスタッフのイラスト", 322, 382),
  poseTrust: pose("pose-trust", "胸に手を当てるスタッフのイラスト", 271, 386),
  poseOk: pose("pose-ok", "OKサインをするスタッフのイラスト", 305, 378),

  // ───────── 蓄電池のイラスト（白背景・装飾）
  batUnit: bat("bat-unit", "家庭用蓄電池のイラスト", 358),
  batHouseFlow: bat("bat-house-flow", "太陽光パネルの家と蓄電池のイラスト", 408),
  batDayNight: bat("bat-day-night", "昼にためて夜に使う蓄電池のイラスト", 381),
  batHomeAppliances: bat("bat-home-appliances", "蓄電池から家電に電気を送る家のイラスト", 370),
  batShield: bat("bat-shield", "蓄電池と盾のイラスト", 383),
  batStorm: bat("bat-storm", "嵐の夜に明かりが灯る家と蓄電池のイラスト", 424),
  batStack: bat("bat-stack", "増設した蓄電池のイラスト", 376),
  batEco: bat("bat-eco", "蓄電池と葉のイラスト", 408),
  batInside: bat("bat-inside", "蓄電池の内部のイラスト", 371),
  batTemperature: bat("bat-temperature", "蓄電池と温度のイラスト", 393),
  batOutdoor: bat("bat-outdoor", "屋外に設置した蓄電池のイラスト", 375),
  batSolarToHome: bat("bat-solar-to-home", "太陽光から蓄電池を通って家電へ電気が流れる家のイラスト", 398),
  batNight: bat("bat-night", "夜の家と蓄電池のイラスト", 395),
  batCharge: bat("bat-charge", "充電された蓄電池のイラスト", 403),
  batStorm2: bat("bat-storm-2", "停電の夜の家と蓄電池のイラスト", 444),
  batYenDown: bat("bat-yen-down", "蓄電池と下向きの円マークのイラスト", 411),
  batSolarHouse: bat("bat-solar-house", "太陽光パネルの家と蓄電池のイラスト", 397),
  batEv: bat("bat-ev", "蓄電池と電気自動車のイラスト", 378),
  batCabinet: bat("bat-cabinet", "蓄電池の筐体のイラスト", 397),
  batApp: bat("bat-app", "蓄電池とスマートフォンのアプリ画面のイラスト", 378),
} as const;

export type ImageKey = keyof typeof images;
