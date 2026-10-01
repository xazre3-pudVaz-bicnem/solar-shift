/**
 * メーカー一覧。
 * relationship は取扱契約が確認できるまで "candidate"（検討中）のままにする。
 * "candidate" のメーカーについて「正規取扱店」「認定店」などの表現はサイトのどこにも出さない。
 */

export type ManufacturerRelationship =
  /** 取扱を検討中（契約未確認） */
  | "candidate"
  /** 取扱あり（契約確認済み） */
  | "handling"
  /** 正規取扱店・施工店として認定（証憑確認済み） */
  | "authorized";

export interface Manufacturer {
  id: string;
  name: string;
  nameEn?: string;
  country: string;
  categories: ("solar" | "battery" | "v2h" | "hems" | "hybrid")[];
  officialUrl: string;
  relationship: ManufacturerRelationship;
  /** 公式サイトで確認できる範囲の紹介文（評価・順位は書かない） */
  summary: string;
}

export const manufacturers: Manufacturer[] = [
  {
    id: "hanwha-japan",
    name: "ハンファジャパン（Qセルズ）",
    nameEn: "Hanwha Japan",
    country: "韓国（日本法人）",
    categories: ["solar", "battery", "hybrid"],
    officialUrl: "https://www.hanwha-japan.com/",
    relationship: "candidate",
    summary: "Qセルズブランドの太陽光モジュールと蓄電システムを展開するメーカー。",
  },
  {
    id: "canadian-solar",
    name: "カナディアン・ソーラー",
    nameEn: "Canadian Solar",
    country: "カナダ（日本法人）",
    categories: ["solar", "battery"],
    officialUrl: "https://www.canadiansolar.com/jp/",
    relationship: "candidate",
    summary: "太陽光モジュールと住宅用蓄電システムを展開するメーカー。",
  },
  {
    id: "choshu",
    name: "長州産業",
    nameEn: "CIC",
    country: "日本",
    categories: ["solar", "battery", "hybrid"],
    officialUrl: "https://cic-solar.jp/",
    relationship: "candidate",
    summary: "山口県に本社を置く、太陽光モジュール・蓄電システムの国内メーカー。",
  },
  {
    id: "sharp",
    name: "シャープ",
    nameEn: "SHARP",
    country: "日本",
    categories: ["solar", "battery", "hybrid", "hems"],
    officialUrl: "https://jp.sharp/sunvista/",
    relationship: "candidate",
    summary: "住宅用太陽光発電システム・蓄電池システムを展開する国内メーカー。",
  },
  {
    id: "panasonic",
    name: "パナソニック",
    nameEn: "Panasonic",
    country: "日本",
    categories: ["battery", "hybrid", "hems", "v2h"],
    officialUrl: "https://sumai.panasonic.jp/",
    relationship: "candidate",
    summary: "住宅用の蓄電システム・HEMS・V2H関連機器を展開する国内メーカー。",
  },
  {
    id: "omron",
    name: "オムロン",
    nameEn: "OMRON",
    country: "日本",
    categories: ["battery", "hybrid"],
    officialUrl: "https://socialsolution.omron.com/jp/ja/products_service/energy/",
    relationship: "candidate",
    summary: "住宅用蓄電システム・パワーコンディショナを展開する国内メーカー。",
  },
  {
    id: "nichicon",
    name: "ニチコン",
    nameEn: "NICHICON",
    country: "日本",
    categories: ["battery", "v2h", "hybrid"],
    officialUrl: "https://www.nichicon.co.jp/products/ess/",
    relationship: "candidate",
    summary: "家庭用蓄電システムとV2Hシステムを展開する国内メーカー。",
  },
];

export function getManufacturer(id: string): Manufacturer | undefined {
  return manufacturers.find((m) => m.id === id);
}

export const relationshipLabel: Record<ManufacturerRelationship, string> = {
  candidate: "取扱検討中",
  handling: "取扱あり",
  authorized: "正規取扱",
};
