/**
 * 取扱メーカーの一覧。
 *
 * 2026-10-02 に運営者から「大手メーカーはおおむね取り扱っている。メーカー・商品は数が多いので、個別の商品は載せない」
 * との連絡があった。最初の依頼文で名前の挙がっていた7社を「取扱あり」にしている。
 *
 * 決まり
 *   - 画面に出すのは relationship が "handling" / "authorized" のメーカーだけ。"candidate" は名前を出さない
 *   - 「正規取扱店」「認定店」「メーカー認定」の表現は、証憑を確認できた "authorized" のときだけ。いまは1社も該当しない
 *   - メーカーを足すときは、運営者に取扱いを確認してから（推測で足さない）
 *   - logo は、ロゴの使用を確認できたものだけ入れる（public/images/makers/ に置く）。無いメーカーは社名を文字で表示する。
 *     2026-10-05 に運営者から「取扱メーカーのロゴを使ってよい」と連絡があり、7社のロゴを入れた。
 *     画像は各社の公式サイトに掲載されているもの（logoSource）。形・色は変えず、まわりの透明な余白だけを切り詰めている
 *     （作り方：scratchpad の make-maker-logos.cjs と同じ手順。縦横比を変えない・色を変えない・ほかの要素と組み合わせない）
 *   - summary と categories は、メーカーの公式サイトで確認できる範囲だけ（評価・順位・仕様の数値は書かない）
 */

export type ManufacturerRelationship =
  /** 取扱を検討中（運営者に未確認）。画面には出さない */
  | "candidate"
  /** 取扱あり（運営者に確認済み） */
  | "handling"
  /** 正規取扱店・施工店として認定（証憑確認済み） */
  | "authorized";

export type ManufacturerCategory = "solar" | "battery" | "v2h" | "hems" | "hybrid";

export interface ManufacturerLogo {
  src: string;
  width: number;
  height: number;
  /** 元にした画像（メーカーの公式サイト） */
  source: string;
}

export interface Manufacturer {
  id: string;
  /** 正式な社名 */
  name: string;
  /** 一覧に出す名前（ブランド名） */
  brand: string;
  /** 英字の表記（ロゴが無いあいだ、文字で表示する） */
  nameEn: string;
  country: string;
  categories: ManufacturerCategory[];
  officialUrl: string;
  relationship: ManufacturerRelationship;
  /** 公式サイトで確認できる範囲の紹介文（評価・順位は書かない） */
  summary: string;
  /** ロゴ（使用を確認できたもの。無ければ社名を文字で表示する） */
  logo?: ManufacturerLogo;
}

export const manufacturers: Manufacturer[] = [
  {
    id: "hanwha-japan",
    name: "ハンファジャパン",
    brand: "Qセルズ",
    nameEn: "Q CELLS",
    country: "韓国（日本法人）",
    categories: ["solar", "battery", "hybrid"],
    officialUrl: "https://www.hanwha-japan.com/",
    logo: { src: "/images/makers/hanwha-japan.png", width: 509, height: 126, source: "https://www.hanwha-japan.com/wp/wp-content/themes/Hanwha/images/top/site-logo/qcells_logo.svg" },
    relationship: "handling",
    summary: "Qセルズブランドの太陽光モジュールと蓄電システムを展開するメーカー。",
  },
  {
    id: "canadian-solar",
    name: "カナディアン・ソーラー・ジャパン",
    brand: "カナディアン・ソーラー",
    nameEn: "Canadian Solar",
    country: "カナダ（日本法人）",
    categories: ["solar", "battery"],
    officialUrl: "https://www.canadiansolar.com/jp/",
    logo: { src: "/images/makers/canadian-solar.png", width: 435, height: 65, source: "https://www.canadiansolar.com/jp/wp-content/uploads/sites/10/2020/02/1.png" },
    relationship: "handling",
    summary: "太陽光モジュールと住宅用蓄電システムを展開するメーカー。",
  },
  {
    id: "choshu",
    name: "長州産業",
    brand: "長州産業",
    nameEn: "CIC",
    country: "日本",
    categories: ["solar", "battery", "hybrid"],
    officialUrl: "https://cic-solar.jp/",
    logo: { src: "/images/makers/choshu.png", width: 1657, height: 159, source: "https://cic-solar.jp/wp-content/themes/ill/img/logo1.svg" },
    relationship: "handling",
    summary: "山口県に本社を置く、太陽光モジュール・蓄電システムの国内メーカー。",
  },
  {
    id: "sharp",
    name: "シャープ",
    brand: "シャープ",
    nameEn: "SHARP",
    country: "日本",
    categories: ["solar", "battery", "hybrid", "hems"],
    officialUrl: "https://jp.sharp/sunvista/",
    logo: { src: "/images/makers/sharp.png", width: 1119, height: 160, source: "https://jp.sharp/assets/common/images/logo_sharp.svg" },
    relationship: "handling",
    summary: "住宅用太陽光発電システム・蓄電池システムを展開する国内メーカー。",
  },
  {
    id: "panasonic",
    name: "パナソニック",
    brand: "パナソニック",
    nameEn: "Panasonic",
    country: "日本",
    categories: ["battery", "hybrid", "hems", "v2h"],
    officialUrl: "https://sumai.panasonic.jp/",
    logo: { src: "/images/makers/panasonic.png", width: 1039, height: 160, source: "https://sumai.panasonic.jp/etc-sumai/designs/panasonic/holdings/images/holdings-plogo.svg" },
    relationship: "handling",
    summary: "住宅用の蓄電システム・HEMS・V2H関連機器を展開する国内メーカー。",
  },
  {
    id: "omron",
    name: "オムロン",
    brand: "オムロン",
    nameEn: "OMRON",
    country: "日本",
    categories: ["battery", "hybrid"],
    officialUrl: "https://socialsolution.omron.com/jp/ja/products_service/energy/",
    logo: { src: "/images/makers/omron.png", width: 829, height: 160, source: "https://socialsolution.omron.com/jp/ja/assets/img/header/Omron_Logo.svg" },
    relationship: "handling",
    summary: "住宅用蓄電システム・パワーコンディショナを展開する国内メーカー。",
  },
  {
    id: "nichicon",
    name: "ニチコン",
    brand: "ニチコン",
    nameEn: "NICHICON",
    country: "日本",
    categories: ["battery", "v2h", "hybrid"],
    officialUrl: "https://www.nichicon.co.jp/products/ess/",
    logo: { src: "/images/makers/nichicon.png", width: 977, height: 160, source: "https://www.nichicon.co.jp/_assets/images/common/logo.svg" },
    relationship: "handling",
    summary: "家庭用蓄電システムとV2Hシステムを展開する国内メーカー。",
  },
];

export function getManufacturer(id: string): Manufacturer | undefined {
  return manufacturers.find((m) => m.id === id);
}

/** 画面に出すメーカー（取扱いを確認できたものだけ）。category を渡すと、その種類を扱うメーカーに絞る */
export function handlingManufacturers(category?: ManufacturerCategory): Manufacturer[] {
  return manufacturers.filter((m) => m.relationship !== "candidate" && (!category || m.categories.includes(category)));
}

export const relationshipLabel: Record<ManufacturerRelationship, string> = {
  candidate: "取扱検討中",
  handling: "取扱あり",
  authorized: "正規取扱",
};

/** 一覧に出す、機器の種類の名前（ハイブリッド型は蓄電池の方式なので、種類としては出さない） */
export const manufacturerCategoryLabel: Record<ManufacturerCategory, string | null> = {
  solar: "太陽光パネル",
  battery: "蓄電池",
  v2h: "V2H",
  hems: "HEMS",
  hybrid: null,
};
