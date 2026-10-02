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
 *   - logo は、メーカーからロゴの使用許諾を得たものだけ入れる（public/images/makers/ に置く）。
 *     無いあいだは、社名を文字で表示する（他社の商標を、許諾なしに画像で使わない）
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
  /** メーカーから使用許諾を得たロゴ（無ければ社名を文字で表示する） */
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
