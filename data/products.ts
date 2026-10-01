/**
 * 取扱商品データ。
 *
 * 運用ルール
 * - status が "published" の商品だけが一覧・詳細・構造化データ・sitemap に出る。
 * - 価格が未確定の商品は price を null にする。UI は「お問い合わせください」と表示し、
 *   Offer 構造化データを生成しない（架空の価格を作らない）。
 * - スペックはメーカー公式サイトで確認したものだけを記入し、specSourceUrl に出典を残す。
 * - 「正規取扱店」「メーカー認定」などの表現は、契約が確認できた場合のみ
 *   data/manufacturers.ts の relationship を変更して表示する。
 */

export type ProductCategory = "solar" | "battery" | "v2h" | "hems" | "hybrid";
export type ProductStatus = "draft" | "published" | "discontinued";

export interface ProductFaq {
  q: string;
  a: string;
}

export interface Product {
  slug: string;
  status: ProductStatus;
  manufacturerId: string;
  manufacturer: string;
  name: string;
  modelNumber: string;
  category: ProductCategory;
  /** 太陽光：公称最大出力（W/枚） */
  ratedOutputW: number | null;
  /** 太陽光：モジュール変換効率（%） */
  efficiencyPct: number | null;
  /** 蓄電池：蓄電容量（kWh） */
  capacityKwh: number | null;
  /** 蓄電池：定格出力（kW） */
  ratedPowerKw: number | null;
  /** 全負荷 / 特定負荷（蓄電池・V2H） */
  loadType: "全負荷" | "特定負荷" | null;
  /** 設置場所 */
  installation: "屋内" | "屋外" | "屋内外" | null;
  size: string | null;
  weightKg: number | null;
  warranty: string | null;
  /** 特徴（箇条書き） */
  features: string[];
  /** どんな住宅・家庭に向いているか */
  recommendedFor: string[];
  merits: string[];
  cautions: string[];
  /** 他製品との違い */
  differentiation: string;
  /** 太陽光との組み合わせ・相性 */
  pairing: string;
  /** 補助金対象になる可能性（断定しない） */
  subsidyNote: string;
  /** 葛飾区で導入するときの考え方 */
  katsushikaNote: string;
  faq: ProductFaq[];
  /** 販売価格（税込・円）。未確定は null → 「お問い合わせください」 */
  price: number | null;
  /** メーカー希望小売価格（税込・円）。公表されていなければ null */
  msrp: number | null;
  /** 画像パス（public/ 配下）。未提供は null → プレースホルダー表示 */
  image: string | null;
  imageAlt: string | null;
  officialUrl: string | null;
  /** スペックの出典（メーカー公式ページ） */
  specSourceUrl: string | null;
  /** おすすめ掲載（/recommend/* に出す） */
  recommended: boolean;
  recommendReason?: string;
  updatedAt: string;
}

export const productCategoryLabel: Record<ProductCategory, string> = {
  solar: "太陽光パネル",
  battery: "家庭用蓄電池",
  v2h: "V2H",
  hems: "HEMS",
  hybrid: "ハイブリッド蓄電システム",
};

/**
 * 商品はここに追加する。下のテンプレートをコピーし、
 * メーカー公式情報を確認したうえで値を埋め、status を "published" にする。
 */
export const products: Product[] = [
  {
    slug: "template-solar-module",
    status: "draft",
    manufacturerId: "",
    manufacturer: "",
    name: "（テンプレート）太陽光モジュール",
    modelNumber: "",
    category: "solar",
    ratedOutputW: null,
    efficiencyPct: null,
    capacityKwh: null,
    ratedPowerKw: null,
    loadType: null,
    installation: null,
    size: null,
    weightKg: null,
    warranty: null,
    features: [],
    recommendedFor: [],
    merits: [],
    cautions: [],
    differentiation: "",
    pairing: "",
    subsidyNote: "",
    katsushikaNote: "",
    faq: [],
    price: null,
    msrp: null,
    image: null,
    imageAlt: null,
    officialUrl: null,
    specSourceUrl: null,
    recommended: false,
    updatedAt: "2026-10-01",
  },
  {
    slug: "template-battery",
    status: "draft",
    manufacturerId: "",
    manufacturer: "",
    name: "（テンプレート）家庭用蓄電池",
    modelNumber: "",
    category: "battery",
    ratedOutputW: null,
    efficiencyPct: null,
    capacityKwh: null,
    ratedPowerKw: null,
    loadType: null,
    installation: null,
    size: null,
    weightKg: null,
    warranty: null,
    features: [],
    recommendedFor: [],
    merits: [],
    cautions: [],
    differentiation: "",
    pairing: "",
    subsidyNote: "",
    katsushikaNote: "",
    faq: [],
    price: null,
    msrp: null,
    image: null,
    imageAlt: null,
    officialUrl: null,
    specSourceUrl: null,
    recommended: false,
    updatedAt: "2026-10-01",
  },
];

export const publishedProducts = products.filter((p) => p.status === "published");

export function productsByCategory(category: ProductCategory): Product[] {
  return publishedProducts.filter((p) => p.category === category);
}

export function recommendedProducts(category: ProductCategory): Product[] {
  return productsByCategory(category).filter((p) => p.recommended);
}

export function getProduct(slug: string): Product | undefined {
  return publishedProducts.find((p) => p.slug === slug);
}

/** 価格表示（null は「お問い合わせください」） */
export function priceLabel(p: Product): string {
  return p.price === null ? "お問い合わせください" : `${p.price.toLocaleString("ja-JP")}円（税込）`;
}
