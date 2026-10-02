/**
 * 施工事例データ。
 *
 * 現時点で公開できる施工事例はないため、配列は空。
 * 架空の事例（仮の顧客名・架空の削減率・架空の写真・架空の口コミ）は絶対に追加しない。
 * 実際の施工が完了し、お客様の掲載許可が取れたものだけを追加する。
 *
 * 1件に載せる項目：地域・住宅タイプ・築年数・屋根形状・パネル容量・蓄電池容量・メーカー・活用した補助金・
 * 施工前後の状況と写真・工事期間・設置した理由。数値（容量・築年数・工事期間）は、実際の値だけを書く。
 * 電気代の削減額・削減率は、お客様の明細で確認できた場合だけ本文に書く（推定値は書かない）。
 * 1件でも登録されると、/works は自動で index になり、メニューと sitemap.xml に戻る（lib/indexing.ts）。
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
  title: string;
  /** 地域（市区までにとどめる） */
  area: string;
  areaSlug: string;
  /** 住宅タイプ（戸建・二世帯・新築・既存 など） */
  housingType: string;
  /** 築年数（例：「築18年」。お客様に確認できたものだけ。不明なら null） */
  buildingAge: string | null;
  roofShape: string;
  /** 太陽光容量（kW）。未設置なら null */
  solarKw: number | null;
  /** 蓄電容量（kWh）。未設置なら null */
  batteryKwh: number | null;
  v2h: boolean;
  hems: boolean;
  manufacturer: string[];
  /** data/products.ts の slug */
  productSlugs: string[];
  /** 活用した補助金（制度名のみ。金額は本人確認済みのものだけ） */
  subsidies: string[];
  /** 施工前の状況 */
  before: string;
  /** 施工後の状況 */
  after: string;
  /** 導入理由 */
  reason: string;
  /** お客様の声（本人確認済みのもののみ。無ければ null） */
  voice: string | null;
  /** 施工日（YYYY-MM） */
  installedAt: string;
  /** 工事期間（例：「2日間」。実際にかかった日数。不明なら null） */
  constructionPeriod: string | null;
  images: WorkImage[];
  updatedAt: string;
}

export const works: Work[] = [];

export const publishedWorks = works.filter((w) => w.published);

export function getWork(slug: string): Work | undefined {
  return publishedWorks.find((w) => w.slug === slug);
}
