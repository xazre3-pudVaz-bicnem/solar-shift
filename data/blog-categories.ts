/**
 * ブログカテゴリ。slug は URL（/blog/category/[slug]）と記事 frontmatter の category に使う。
 * 自動生成スクリプトもこの一覧から選ぶ。
 */

import type { ImageKey } from "./images";

export interface BlogCategory {
  slug: string;
  name: string;
  /** 一覧・meta description 用の短い説明 */
  description: string;
  /**
   * カテゴリページの冒頭に出す紹介文。記事の一覧だけのページにしないための、そのカテゴリ固有の文章。
   * 数値は書かない（制度の数値は data/subsidies と記事本文が持つ）。
   */
  lead: string;
  /** 記事カードに出すイラスト（data/images.ts のキー） */
  icon: ImageKey;
  /** そのカテゴリの記事から必ず内部リンクすべき固定ページ */
  pillarLinks: string[];
}

export const blogCategories: BlogCategory[] = [
  {
    slug: "katsushika-subsidy",
    icon: "iconHouseYen",
    name: "葛飾区の補助金",
    description: "かつしかエコ助成金を中心に、葛飾区で使える太陽光・蓄電池の補助金情報。",
    lead: "葛飾区の「かつしかエコ助成金（個人住宅用）」について、対象になる機器、申し込みの順番、事前協議の進め方を記事ごとに整理しています。金額や申込期間は年度ごとに変わるため、各記事には確認日と葛飾区公式サイトへのリンクを付けています。制度の全体像は「葛飾区の補助金」のページ、ご自宅の条件での試算は補助金シミュレーターをご利用ください。",
    pillarLinks: ["/subsidy/katsushika", "/simulation"],
  },
  {
    slug: "tokyo-subsidy",
    icon: "iconGHandHouseYen",
    name: "東京都の補助金",
    description: "クール・ネット東京の太陽光・蓄電池助成を中心とした東京都の制度情報。",
    lead: "東京都（クール・ネット東京）の家庭向け太陽光・蓄電池助成について、容量区分の考え方、事前申込から交付申請までの流れ、対象機器の条件を記事ごとに解説しています。葛飾区の制度とは窓口も手続きも別です。制度の全体像は「東京都の補助金」のページにまとめています。",
    pillarLinks: ["/subsidy/tokyo", "/simulation", "/guide/tokyo-solar-mandate"],
  },
  {
    slug: "solar",
    icon: "iconSunPanel",
    name: "太陽光発電",
    description: "住宅用太陽光発電の仕組み・費用・選び方・導入の考え方。",
    lead: "住宅用太陽光発電を検討するときに出てくる疑問を、屋根の条件・費用の内訳・見積もりの読み方・契約前の確認点といった切り口で、1記事ずつ取り上げています。隣の建物との距離が近い敷地での考え方も扱います。基礎から知りたい方は「太陽光発電」のページもあわせてご覧ください。",
    pillarLinks: ["/solar", "/guide/solar-cost", "/guide/zero-yen-solar"],
  },
  {
    slug: "battery",
    icon: "iconGHouseBattery",
    name: "蓄電池",
    description: "家庭用蓄電池の容量・費用・選び方・太陽光との組み合わせ。",
    lead: "家庭用蓄電池の容量の決め方、全負荷型と特定負荷型の違い、太陽光への後付けの判断など、機種を選ぶ前に整理しておきたい点を記事にしています。補助金の条件と合わせて考えるための材料としてお使いください。",
    pillarLinks: ["/battery", "/guide/battery-how-to-choose", "/guide/battery-merit-demerit"],
  },
  {
    slug: "v2h",
    icon: "iconHouseEv",
    name: "V2H",
    description: "電気自動車の電気を家で使うV2Hの仕組み・費用・補助金。",
    lead: "電気自動車のバッテリーを家の電源として使うV2Hについて、仕組み、対応車種と機器の組み合わせ、補助金の受付状況を扱う記事をまとめています。国の制度は年度の途中で受付が終わることがあるため、各記事に確認日を明記しています。",
    pillarLinks: ["/v2h"],
  },
  {
    slug: "electricity-bill",
    icon: "iconGBillDown",
    name: "電気代",
    description: "電気代の仕組みと、太陽光・蓄電池で電気代を抑える考え方。",
    lead: "電気代の仕組みと、太陽光発電・蓄電池で買う電気を減らす考え方を扱う記事です。どれだけ減るかは住宅・使用量・料金プランで変わるため、具体的な金額ではなく、考え方と確認の手順を中心に解説しています。",
    pillarLinks: ["/solar-battery", "/guide/all-electric", "/guide/renewable-energy-surcharge"],
  },
  {
    slug: "blackout",
    icon: "iconHouseShield",
    name: "停電・防災",
    description: "停電時の備えと、水害リスクを踏まえた太陽光・蓄電池の使い方。",
    lead: "停電時に太陽光発電と蓄電池でどこまで電気を使えるか、葛飾区の水害リスクを踏まえて機器をどこに置くかを扱う記事です。自立運転の使い方や、避難が必要な場合の考え方も取り上げています。",
    pillarLinks: ["/guide/blackout", "/area/katsushika"],
  },
  {
    slug: "product-comparison",
    icon: "iconClipboardHouse",
    name: "商品比較",
    description: "太陽光パネル・蓄電池の比較軸と、メーカーごとの特徴の見方。",
    lead: "太陽光パネルや蓄電池を比べるときに見る項目（出力・容量・保証・設置条件など）を解説する記事です。メーカー公式情報で確認できた仕様だけをもとにし、根拠のないランキングは掲載していません。",
    pillarLinks: ["/products", "/products/battery"],
  },
  {
    slug: "install-maintenance",
    icon: "iconPanelWrench",
    name: "施工・メンテナンス",
    description: "屋根条件・工事の流れ・設置後の点検とメンテナンス。",
    lead: "現地調査から工事、設置後の点検までを扱う記事です。見積書の内訳の読み方、業者を選ぶときの確認点、パワーコンディショナの交換時期など、契約の前後で役立つ内容をまとめています。",
    pillarLinks: ["/flow", "/guide/maintenance", "/guide/solar-safety"],
  },
  {
    slug: "fit",
    icon: "iconHandPanel",
    name: "FIT・売電",
    description: "売電の仕組み、FIT価格、卒FIT後の選択肢。",
    lead: "売電の仕組みとFIT（固定価格買取制度）の価格、卒FIT後の選択肢を扱う記事です。2026年度の住宅用FITは前半に手厚い設定のため、売電と自家消費のバランスの考え方もあわせて解説しています。",
    pillarLinks: ["/guide/selling-electricity", "/guide/post-fit", "/guide/solar-tax"],
  },
  {
    slug: "energy-saving",
    icon: "iconPanelLeaf",
    name: "省エネ",
    description: "HEMSやオール電化など、暮らしの省エネと創エネの組み合わせ。",
    lead: "HEMSやオール電化など、暮らしの省エネと太陽光発電・蓄電池の組み合わせを扱う記事です。機器を増やす前に、電気の使い方を見える化して確かめる手順を紹介しています。",
    pillarLinks: ["/hems", "/guide/all-electric"],
  },
];

export function getCategory(slug: string): BlogCategory | undefined {
  return blogCategories.find((c) => c.slug === slug);
}
