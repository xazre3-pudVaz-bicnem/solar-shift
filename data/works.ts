/**
 * 施工事例データ。
 *
 * 現時点で公開できる施工事例はないため、配列は空。
 * 架空の事例（仮の顧客名・架空の削減率・架空の写真・架空の口コミ）は絶対に追加しない。
 * 実際の施工が完了し、お客様の掲載許可が取れたものだけを追加する。
 */

export interface WorkImage {
  src: string;
  alt: string;
  caption?: string;
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
  images: WorkImage[];
  updatedAt: string;
}

export const works: Work[] = [];

export const publishedWorks = works.filter((w) => w.published);

export function getWork(slug: string): Work | undefined {
  return publishedWorks.find((w) => w.slug === slug);
}
