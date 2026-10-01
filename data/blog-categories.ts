/**
 * ブログカテゴリ。slug は URL（/blog/category/[slug]）と記事 frontmatter の category に使う。
 * 自動生成スクリプトもこの一覧から選ぶ。
 */

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  /** そのカテゴリの記事から必ず内部リンクすべき固定ページ */
  pillarLinks: string[];
}

export const blogCategories: BlogCategory[] = [
  {
    slug: "katsushika-subsidy",
    name: "葛飾区の補助金",
    description: "かつしかエコ助成金を中心に、葛飾区で使える太陽光・蓄電池の補助金情報。",
    pillarLinks: ["/subsidy/katsushika", "/simulation"],
  },
  {
    slug: "tokyo-subsidy",
    name: "東京都の補助金",
    description: "クール・ネット東京の太陽光・蓄電池助成を中心とした東京都の制度情報。",
    pillarLinks: ["/subsidy/tokyo", "/simulation"],
  },
  {
    slug: "solar",
    name: "太陽光発電",
    description: "住宅用太陽光発電の仕組み・費用・選び方・導入の考え方。",
    pillarLinks: ["/solar", "/guide/solar-cost"],
  },
  {
    slug: "battery",
    name: "蓄電池",
    description: "家庭用蓄電池の容量・費用・選び方・太陽光との組み合わせ。",
    pillarLinks: ["/battery", "/guide/battery-how-to-choose"],
  },
  {
    slug: "v2h",
    name: "V2H",
    description: "電気自動車の電気を家で使うV2Hの仕組み・費用・補助金。",
    pillarLinks: ["/v2h"],
  },
  {
    slug: "electricity-bill",
    name: "電気代",
    description: "電気代の仕組みと、太陽光・蓄電池で電気代を抑える考え方。",
    pillarLinks: ["/solar-battery", "/guide/all-electric"],
  },
  {
    slug: "blackout",
    name: "停電・防災",
    description: "停電時の備えと、水害リスクを踏まえた太陽光・蓄電池の使い方。",
    pillarLinks: ["/guide/blackout", "/area/katsushika"],
  },
  {
    slug: "product-comparison",
    name: "商品比較",
    description: "太陽光パネル・蓄電池の比較軸と、メーカーごとの特徴の見方。",
    pillarLinks: ["/products", "/recommend/battery"],
  },
  {
    slug: "install-maintenance",
    name: "施工・メンテナンス",
    description: "屋根条件・工事の流れ・設置後の点検とメンテナンス。",
    pillarLinks: ["/flow", "/guide/maintenance"],
  },
  {
    slug: "fit",
    name: "FIT・売電",
    description: "売電の仕組み、FIT価格、卒FIT後の選択肢。",
    pillarLinks: ["/guide/selling-electricity", "/guide/post-fit"],
  },
  {
    slug: "energy-saving",
    name: "省エネ",
    description: "HEMSやオール電化など、暮らしの省エネと創エネの組み合わせ。",
    pillarLinks: ["/hems", "/guide/all-electric"],
  },
];

export function getCategory(slug: string): BlogCategory | undefined {
  return blogCategories.find((c) => c.slug === slug);
}
