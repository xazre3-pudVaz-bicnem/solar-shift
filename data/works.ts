/**
 * 施工事例データ。
 *
 * 2026-10-02 に、運営者から「実際のお客様の事例」として5件を受け取り、掲載した。
 * 2026-10-05 に、運営者から「施工事例は載せてよい」と連絡があった。
 * 見出し・本文・電気代・設備は、運営者から受け取った表記のまま載せている（こちらで数値を足したり、言い換えたりしない）。
 *
 * 決まり
 *   - 架空の事例（仮の顧客名・架空の削減率・架空の写真・架空の口コミ）は絶対に追加しない
 *   - 実際に導入し、お客様の掲載許可が取れたものだけを追加する。お客様の名前はイニシャルまで、地域は市区まで
 *   - 受け取っていない項目（築年数・屋根形状・メーカー・施工日・工事期間・写真）は null / 空のままにする。空の項目は画面に出ない
 *   - 写真は、その事例の実際の写真だけ。イメージ写真や生成画像を、事例の写真として使わない
 *   - 電気代は、受け取った金額をそのまま出す。差額・削減率・年間の金額を、こちらで計算して書かない
 *     （季節・使用量・料金プランで変わる。同じ結果を保証するものではない、という注記を必ず添える）
 *   - Review / AggregateRating の構造化データは出さない
 *   - 1件でも公開されていると、/works は index になり、メニューと sitemap.xml に入る（lib/indexing.ts）
 */

export interface WorkImage {
  src: string;
  alt: string;
  caption?: string;
  /** いつの写真か（施工前・施工中・施工後）。施工前後を並べて見せるときに使う */
  phase?: "before" | "during" | "after";
}

export interface Work {
  slug: string;
  /** 公開可否（お客様の掲載許可が取れたら true） */
  published: boolean;
  /** 見出し */
  title: string;
  /** 一覧のラベル（地域・ご家族・設備の種類） */
  label: string;
  prefecture: string;
  /** 市区まで */
  city: string;
  /** data/areas.ts の slug（エリアページがある地域だけ、そのページへリンクする） */
  areaSlug: string | null;
  /** お客様（イニシャル・年代・ご家族） */
  customer: string;
  /** 住宅タイプ（受け取ったものだけ） */
  housingType: string | null;
  /** 築年数（例：「築18年」。不明なら null） */
  buildingAge: string | null;
  roofShape: string | null;
  /** 導入した設備（受け取った表記のまま） */
  equipment: string;
  /** 太陽光容量（kW）。絞り込み・並べ替え用。未設置・不明なら null */
  solarKw: number | null;
  /** 蓄電容量（kWh）。未設置・不明なら null */
  batteryKwh: number | null;
  hasBattery: boolean;
  evCharger: boolean;
  v2h: boolean;
  hems: boolean;
  manufacturer: string[];
  /** 導入前の電気代（受け取った表記のまま） */
  billBefore: string | null;
  /** 導入後の電気代（受け取った表記のまま） */
  billAfter: string | null;
  /** 本文（受け取った文章のまま） */
  story: string;
  /** そのほかの項目（補助金・ポイント・導入目的など。受け取った表記のまま） */
  extras: { label: string; value: string }[];
  /** お客様の声（ご本人の言葉を、そのまま掲載できる場合だけ。無ければ null） */
  voice: string | null;
  /** 施工した年月（YYYY-MM）。不明なら null */
  installedAt: string | null;
  /** 工事期間（例：「2日間」）。不明なら null */
  constructionPeriod: string | null;
  images: WorkImage[];
  /** 掲載日 */
  publishedAt: string;
  updatedAt: string;
}

const PUBLISHED = "2026-10-02";

export const works: Work[] = [
  {
    slug: "katsushika-solar-battery-family-of-four",
    published: true,
    title: "電気代の負担を抑えながら、停電への備えもできました",
    label: "葛飾区・4人家族｜太陽光＋蓄電池",
    prefecture: "東京都",
    city: "葛飾区",
    areaSlug: "katsushika",
    customer: "K様（40代・4人家族）",
    housingType: null,
    buildingAge: null,
    roofShape: null,
    equipment: "太陽光5.0kW＋蓄電池7kWh",
    solarKw: 5,
    batteryKwh: 7,
    hasBattery: true,
    evCharger: false,
    v2h: false,
    hems: false,
    manufacturer: [],
    billBefore: "月約25,000円",
    billAfter: "月約8,000円",
    story:
      "導入前は、夏場や冬場になると電気代が月25,000円前後まで上がることもあり、今後の電気料金の値上がりを心配されていました。太陽光発電と家庭用蓄電池を組み合わせ、昼間につくった電気を家庭で使い、余った電気を蓄電池へ充電するプランをご提案。夜間も蓄えた電気を活用できるようになり、電力会社から購入する電気を大きく減らせるようになりました。停電時にも一定の電気を使えるため、防災面でも安心感が増したとのことです。",
    extras: [{ label: "補助金", value: "対象制度を確認のうえ申請" }],
    voice: null,
    installedAt: null,
    constructionPeriod: null,
    images: [],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
  },
  {
    slug: "katsushika-solar-dual-income-couple",
    published: true,
    title: "昼間の発電を活用して、年間の電気代を見直しました",
    label: "葛飾区・共働き夫婦｜太陽光発電",
    prefecture: "東京都",
    city: "葛飾区",
    areaSlug: "katsushika",
    customer: "S様（30代・2人暮らし）",
    housingType: null,
    buildingAge: null,
    roofShape: null,
    equipment: "太陽光4.5kW",
    solarKw: 4.5,
    batteryKwh: null,
    hasBattery: false,
    evCharger: false,
    v2h: false,
    hems: false,
    manufacturer: [],
    billBefore: "月約15,000円",
    billAfter: "月約8,500円",
    story:
      "共働きで日中は不在の時間が多く、「太陽光を付けても意味があるのか」と相談いただきました。屋根の日当たりや電力使用状況を確認し、過剰な容量ではなく住宅に合った太陽光発電システムをご提案。日中に発電した電気は家庭内で優先的に利用し、余った電気は売電に回すことで、年間を通して電気代の負担軽減につながっています。将来的には蓄電池の追加も検討されています。",
    extras: [{ label: "ポイント", value: "将来の蓄電池追加も考慮した設計" }],
    voice: null,
    installedAt: null,
    constructionPeriod: null,
    images: [],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
  },
  {
    slug: "katsushika-all-electric-solar-battery",
    published: true,
    title: "電気を多く使う家庭だからこそ、太陽光と蓄電池をセットで",
    label: "葛飾区・オール電化住宅｜太陽光＋大容量蓄電池",
    prefecture: "東京都",
    city: "葛飾区",
    areaSlug: "katsushika",
    customer: "M様（50代・3人家族）",
    housingType: "オール電化住宅",
    buildingAge: null,
    roofShape: null,
    equipment: "太陽光6.0kW＋蓄電池10kWh",
    solarKw: 6,
    batteryKwh: 10,
    hasBattery: true,
    evCharger: false,
    v2h: false,
    hems: false,
    manufacturer: [],
    billBefore: "月約32,000円",
    billAfter: "月約13,000円",
    story:
      "オール電化住宅で、エアコン・IH・給湯など電気の使用量が多く、冬場には月30,000円を超えることもありました。そこで太陽光発電に加え、夜間や悪天候時にも活用できる蓄電池を導入。日中の自家消費率を高めながら、余剰電力を蓄電することで、夕方以降の購入電力を抑える運用を目指しました。電気代対策だけでなく、非常時の電源確保も導入理由の一つでした。",
    extras: [],
    voice: null,
    installedAt: null,
    constructionPeriod: null,
    images: [],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
  },
  {
    slug: "edogawa-solar-battery-family-with-children",
    published: true,
    title: "子どもがいる家庭だから、電気代と防災の両方を考えました",
    label: "江戸川区・子育て世帯｜太陽光＋蓄電池",
    prefecture: "東京都",
    city: "江戸川区",
    areaSlug: null,
    customer: "T様（30代・4人家族）",
    housingType: null,
    buildingAge: null,
    roofShape: null,
    equipment: "太陽光5.5kW＋蓄電池9.8kWh",
    solarKw: 5.5,
    batteryKwh: 9.8,
    hasBattery: true,
    evCharger: false,
    v2h: false,
    hems: false,
    manufacturer: [],
    billBefore: "月約28,000円",
    billAfter: "月約10,000円",
    story:
      "在宅時間が長く、夏場はエアコンを長時間使用するため、電気代の上昇が悩みでした。また、小さなお子様がいるため、停電時にも冷蔵庫や照明、スマートフォンの充電など最低限の電気を確保したいというご希望がありました。太陽光発電と蓄電池を組み合わせ、自家消費を中心としたプランをご提案。普段の電気代削減と、災害時への備えを両立できる設備構成としました。",
    extras: [{ label: "導入目的", value: "電気代削減＋防災対策" }],
    voice: null,
    installedAt: null,
    constructionPeriod: null,
    images: [],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
  },
  {
    slug: "matsudo-solar-battery-ev",
    published: true,
    title: "家でつくった電気を、暮らしとクルマに活用",
    label: "松戸市・EV所有家庭｜太陽光＋蓄電池＋EV",
    prefecture: "千葉県",
    city: "松戸市",
    areaSlug: null,
    customer: "A様（40代・3人家族）",
    housingType: null,
    buildingAge: null,
    roofShape: null,
    equipment: "太陽光6.5kW＋蓄電池＋EV充電設備",
    solarKw: 6.5,
    batteryKwh: null,
    hasBattery: true,
    evCharger: true,
    v2h: false,
    hems: false,
    manufacturer: [],
    billBefore: "月約22,000円",
    billAfter: "月約9,000円",
    story:
      "電気自動車への買い替えをきっかけに、ご家庭全体のエネルギー利用を見直したケースです。屋根に太陽光パネルを設置し、発電した電気を住宅内で利用。余った電力を蓄電池へため、夜間の家電利用やEV充電にも活用できるようにしました。電力会社から電気を購入するだけだった生活から、「自宅でつくった電気を使う」生活へ変わり、電気代とガソリン代の両方を見直すきっかけになりました。",
    extras: [{ label: "導入目的", value: "電気代削減＋EV活用＋将来のV2H検討" }],
    voice: null,
    installedAt: null,
    constructionPeriod: null,
    images: [],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
  },
];

export const publishedWorks = works.filter((w) => w.published);

export function getWork(slug: string): Work | undefined {
  return publishedWorks.find((w) => w.slug === slug);
}

/** 「東京都葛飾区」のように、都県と市区をつなげた表記 */
export function workArea(w: Work): string {
  return `${w.prefecture}${w.city}`;
}

/** その地域（市区）の事例 */
export function worksInCity(city: string): Work[] {
  return publishedWorks.filter((w) => w.city === city);
}

/**
 * 設備の種類で絞った事例（太陽光・蓄電池などのサービスのページ用）。
 * preferCity の事例を先に並べ、最大 limit 件にする。
 */
export function worksWithEquipment(opts: { solar?: boolean; battery?: boolean }, preferCity: string, limit = 3): Work[] {
  const list = publishedWorks.filter((w) => (!opts.solar || w.solarKw !== null) && (!opts.battery || w.hasBattery));
  return [...list.filter((w) => w.city === preferCity), ...list.filter((w) => w.city !== preferCity)].slice(0, limit);
}

/**
 * 事例の電気代に、必ず添える注記。
 * 金額は運営者から受け取った「おおよその月額」で、季節・使用量・料金プランで変わる。
 */
export const WORK_BILL_NOTE =
  "電気代は、導入前後のおおよその月額です。季節、電気の使い方、料金プランによって変わります。同じ結果を保証するものではありません。";
