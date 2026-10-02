/**
 * サイトで使う画像の登録簿。public/images/<用途>/*.webp
 *   hero/          … TOP のヒーロー背景（横長の大きな写真）
 *   solar/         … 太陽光パネル・住宅の写真
 *   battery/       … 蓄電池・V2H の写真
 *   scene/         … 暮らし・相談・街並みの写真
 *   icons/         … 設備のアイコン（サービスの説明に使う）
 *   illustrations/ … 人物・ポーズ・蓄電池のイラスト（よくある質問・相談・流れに使う）
 * 写真・アイコン・人物イラストは scripts/prepare-images.mjs、ポーズ・蓄電池イラストは
 * scripts/prepare-illustrations.mjs（1枚のシートから切り出し）が作る。
 *
 * 使い分け：1つのセクションの中で、写真・人物イラスト・アイコンを混ぜない。
 * 「-portrait」など 322×458 の小さな写真は、小さなサムネイル専用（大きく引き伸ばさない）。
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
  // ───────── ヒーロー背景（1672×941）
  heroSolarHomeBlueSky: photo("hero/solar-home-blue-sky", "青空の下、屋根に太陽光パネルを載せた住宅と街並みのイメージ", 1672, 941),
  /** スマホ用の縦長トリミング（584×941）。元画像の右寄り（住宅と屋根）を切り出したもの */
  heroSolarHomeBlueSkyPortrait: photo("hero/solar-home-blue-sky-portrait", "青空の下、屋根に太陽光パネルを載せた住宅のイメージ", 584, 941),
  heroSolarHomeRiverside: photo("hero/solar-home-riverside", "太陽光パネルを載せた住宅と、川沿いの街並みのイメージ", 1672, 941),

  // ───────── 小さな写真（322×458・サムネイル専用）
  solarHomeRoofPortrait: photo("solar/solar-home-roof-portrait", "屋根に太陽光パネルを載せた住宅のイメージ", 322, 458),
  solarPanelCloseupPortrait: photo("solar/solar-panel-closeup-portrait", "太陽光パネルの表面と青空のイメージ", 323, 458),
  solarInstallationTechnician: photo("solar/solar-installation-technician", "屋根で太陽光パネルを取り付ける作業のイメージ", 322, 459),
  homeBatteryPortrait: photo("battery/home-battery-portrait", "住宅の外壁沿いに置かれた家庭用蓄電池のイメージ", 322, 458),
  evChargingPortrait: photo("battery/ev-charging-portrait", "自宅の充電設備につないだ電気自動車のイメージ", 323, 458),
  brightLivingRoom: photo("scene/bright-living-room", "日差しの入る明るいリビングのイメージ", 322, 458),
  familyAtHome: photo("scene/family-at-home", "自宅でくつろぐ家族のイメージ", 322, 459),
  riversideTown: photo("scene/riverside-town", "川沿いの住宅地と街並みのイメージ", 322, 459),
  savingsConsultationTablet: photo("scene/savings-consultation-tablet", "タブレットで費用と補助金の資料を確認するイメージ", 323, 459),

  // ───────── 写真（イメージ）
  heroHouseSunset: photo("solar/house-sunset-town", "太陽光パネルを載せた住宅と夕暮れの街並みのイメージ", 1672, 941),
  roofPanelsSunset: photo("solar/roof-panels-sunset", "夕日を受ける屋根の太陽光パネルのイメージ"),
  batteryIndoor: photo("battery/battery-indoor", "屋内に設置された家庭用蓄電池のイメージ"),
  houseBatterySunset: photo("battery/house-battery-sunset", "太陽光パネルと屋外蓄電池を備えた住宅の夕景イメージ"),
  houseEvV2h: photo("battery/house-ev-v2h", "太陽光パネル・蓄電池・電気自動車を備えた住宅のイメージ"),
  consultationDesk: photo("scene/consultation-desk", "タブレットと資料で太陽光発電の計画を確認する打ち合わせのイメージ"),
  panelBatteryProducts: photo("battery/panel-battery-products", "太陽光パネルと家庭用蓄電池・パワーコンディショナのイメージ"),
  katsushikaStreetSunset: photo("scene/residential-street-sunset", "戸建住宅が並ぶ住宅街と夕暮れの街並みのイメージ"),
  installationRoofWork: photo("solar/installation-roof-work", "屋根で太陽光パネルを設置する作業のイメージ"),
  houseDuskLights: photo("solar/house-dusk-lights", "夕暮れに明かりの灯る太陽光パネル付き住宅のイメージ"),
  roofPanelsSky1: photo("solar/roof-panels-sky-1", "青空の下の屋根に設置された太陽光パネルのイメージ"),
  houseRoofPanelsSky: photo("solar/house-roof-panels-sky", "屋根に太陽光パネルを載せた住宅と青空のイメージ"),
  panelsCloseupSky: photo("solar/panels-closeup-sky", "太陽光パネルの表面と青空のクローズアップイメージ"),
  batteryOutdoorWall: photo("battery/battery-outdoor-wall", "住宅の外壁沿いに設置された屋外用蓄電池のイメージ"),
  houseBatteryOutdoor: photo("battery/house-battery-outdoor", "太陽光パネルと屋外蓄電池を備えた住宅の昼のイメージ"),
  roofPanelsTree1: photo("solar/roof-panels-tree-1", "樹木越しに見る屋根の太陽光パネルのイメージ"),
  roofPanelsFront: photo("solar/roof-panels-front", "正面から見た屋根の太陽光パネルの配置イメージ"),
  batteryPowerconOutdoor: photo("battery/battery-powercon-outdoor", "外壁に設置されたパワーコンディショナと屋外蓄電池のイメージ"),
  roofPanelsSky2: photo("solar/roof-panels-sky-2", "屋根の太陽光パネルと青空のイメージ"),
  roofPanelsTree2: photo("solar/roof-panels-tree-2", "緑と青空の中の屋根の太陽光パネルのイメージ"),
  houseRoofSkyWide: photo("solar/house-roof-sky-wide", "太陽光パネルを載せた屋根と太陽のイメージ", 1536, 1024),
  roofPanelsTree3: photo("solar/roof-panels-tree-3", "青空と太陽光パネルの家のイメージ", 1536, 1024),

  // ───────── アイコン：オレンジ系（透過・装飾）
  iconSunPanel: icon("icons/icon-sun-panel", "太陽と太陽光パネルのアイコン"),
  iconHouseSolar: icon("icons/icon-house-solar", "太陽光パネルを載せた家のアイコン"),
  iconHouseBattery: icon("icons/icon-house-battery", "太陽光パネルの家と蓄電池のアイコン"),
  iconPanelLeaf: icon("icons/icon-panel-leaf", "太陽光パネルと葉のアイコン"),
  iconHouseYen: icon("icons/icon-house-yen", "太陽光パネルの家と円マークのアイコン"),
  iconHouseShield: icon("icons/icon-house-shield", "太陽光パネルの家と盾のアイコン"),
  iconPanelWrench: icon("icons/icon-panel-wrench", "太陽光パネルと工具のアイコン"),
  iconHouseEv: icon("icons/icon-house-ev", "太陽光パネルの家と電気自動車のアイコン"),
  iconClipboardHouse: icon("icons/icon-clipboard-house", "チェックリストと太陽光パネルの家のアイコン"),
  iconHandPanel: icon("icons/icon-hand-panel", "手のひらに載せた太陽光パネルのアイコン"),

  // ───────── アイコン：グリーン系（透過・装飾）
  iconGHouseYenLeaf: icon("icons/icon-g-house-yen-leaf", "家と円マークと葉のアイコン"),
  iconGHandHouseYen: icon("icons/icon-g-hand-house-yen", "手のひらに載せた家と円マークのアイコン"),
  iconGSunPanelLeaf: icon("icons/icon-g-sun-panel-leaf", "太陽と太陽光パネルと葉のアイコン"),
  iconGHouseBattery: icon("icons/icon-g-house-battery", "家と蓄電池のアイコン"),
  iconGBillDown: icon("icons/icon-g-bill-down", "電気料金が下がる明細と家のアイコン"),
  iconGHouseWrench: icon("icons/icon-g-house-wrench", "家と工具のアイコン"),
  iconGClipboardHouse: icon("icons/icon-g-clipboard-house", "チェックリストと家のアイコン"),
  iconGHouseShield: icon("icons/icon-g-house-shield", "家と盾のアイコン"),
  iconGHouseEv: icon("icons/icon-g-house-ev", "家と電気自動車のアイコン"),
  iconGHouseBattery2: icon("icons/icon-g-house-battery-2", "家と蓄電池のアイコン"),

  // ───────── 人物イラスト（透過・装飾）
  peopleCoupleTalk: people("illustrations/people-couple-talk", "相談する夫婦のイラスト"),
  peopleCoupleThink: people("illustrations/people-couple-think", "考え込む夫婦のイラスト"),
  peopleFamily: people("illustrations/people-family", "笑顔の家族のイラスト"),
  peopleStaffPoint: people("illustrations/people-staff-point", "説明するスタッフのイラスト"),
  peopleStaffWoman: people("illustrations/people-staff-woman", "説明する女性スタッフのイラスト"),
  peopleCoupleClipboard: people("illustrations/people-couple-clipboard", "書類を確認する夫婦のイラスト"),
  peopleStaffOk: people("illustrations/people-staff-ok", "OKサインをするスタッフのイラスト"),
  peopleWomanThink: people("illustrations/people-woman-think", "考える女性のイラスト"),
  peopleCoupleHappy: people("illustrations/people-couple-happy", "喜ぶ夫婦のイラスト"),
  peopleFamily2: people("illustrations/people-family-2", "家族のイラスト"),
  peopleStaffPoint2: people("illustrations/people-staff-point-2", "説明するスタッフのイラスト", 1200, 800),
  peopleStaffPoint3: people("illustrations/people-staff-point-3", "説明するスタッフのイラスト", 1200, 800),

  // ───────── スタッフのポーズ（透過・装飾）
  poseIdea: pose("illustrations/pose-idea", "ひらめいたスタッフのイラスト", 297, 400),
  poseThink: pose("illustrations/pose-think", "考えるスタッフのイラスト", 274, 374),
  poseLaptop: pose("illustrations/pose-laptop", "ノートパソコンを持つスタッフのイラスト", 349, 362),
  poseFist: pose("illustrations/pose-fist", "こぶしを握るスタッフのイラスト", 291, 368),
  posePhone: pose("illustrations/pose-phone", "電話をするスタッフのイラスト", 302, 376),
  poseCalc: pose("illustrations/pose-calc", "電卓を持つスタッフのイラスト", 292, 377),
  poseChart: pose("illustrations/pose-chart", "資料を持つスタッフのイラスト", 322, 382),
  poseTrust: pose("illustrations/pose-trust", "胸に手を当てるスタッフのイラスト", 271, 386),
  poseOk: pose("illustrations/pose-ok", "OKサインをするスタッフのイラスト", 305, 378),

  // ───────── 蓄電池のイラスト（白背景・装飾）
  batUnit: bat("illustrations/bat-unit", "家庭用蓄電池のイラスト", 358),
  batHouseFlow: bat("illustrations/bat-house-flow", "太陽光パネルの家と蓄電池のイラスト", 408),
  batDayNight: bat("illustrations/bat-day-night", "昼にためて夜に使う蓄電池のイラスト", 381),
  batHomeAppliances: bat("illustrations/bat-home-appliances", "蓄電池から家電に電気を送る家のイラスト", 370),
  batShield: bat("illustrations/bat-shield", "蓄電池と盾のイラスト", 383),
  batStorm: bat("illustrations/bat-storm", "嵐の夜に明かりが灯る家と蓄電池のイラスト", 424),
  batStack: bat("illustrations/bat-stack", "増設した蓄電池のイラスト", 376),
  batEco: bat("illustrations/bat-eco", "蓄電池と葉のイラスト", 408),
  batInside: bat("illustrations/bat-inside", "蓄電池の内部のイラスト", 371),
  batTemperature: bat("illustrations/bat-temperature", "蓄電池と温度のイラスト", 393),
  batOutdoor: bat("illustrations/bat-outdoor", "屋外に設置した蓄電池のイラスト", 375),
  batSolarToHome: bat("illustrations/bat-solar-to-home", "太陽光から蓄電池を通って家電へ電気が流れる家のイラスト", 398),
  batNight: bat("illustrations/bat-night", "夜の家と蓄電池のイラスト", 395),
  batCharge: bat("illustrations/bat-charge", "充電された蓄電池のイラスト", 403),
  batStorm2: bat("illustrations/bat-storm-2", "停電の夜の家と蓄電池のイラスト", 444),
  batYenDown: bat("illustrations/bat-yen-down", "蓄電池と下向きの円マークのイラスト", 411),
  batSolarHouse: bat("illustrations/bat-solar-house", "太陽光パネルの家と蓄電池のイラスト", 397),
  batEv: bat("illustrations/bat-ev", "蓄電池と電気自動車のイラスト", 378),
  batCabinet: bat("illustrations/bat-cabinet", "蓄電池の筐体のイラスト", 397),
  batApp: bat("illustrations/bat-app", "蓄電池とスマートフォンのアプリ画面のイラスト", 378),
} as const;

export type ImageKey = keyof typeof images;
