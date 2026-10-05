import { isHeldBack } from "./indexing";

/**
 * ナビゲーション定義。ヘッダー・フッター・HTMLサイトマップが共有する。
 * 存在しないパスを書かないこと（scripts/check-links は sitemap と突き合わせる）。
 *
 * 施工事例・お客様の声・おすすめ商品など、中身がまだ無いページはここに書いたままでよい。
 * lib/indexing.ts が「準備中」と判定している間は、下の visible() が自動で外す
 * （データが登録されると、何も直さなくてもメニューに戻る）。
 * ヘッダーの最上位は5つまで。
 */

export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  href?: string;
  links: NavLink[];
}

const allHeaderNav: NavGroup[] = [
  {
    label: "サービス",
    links: [
      { href: "/solar", label: "太陽光発電", description: "住宅用太陽光発電の基礎と導入の考え方" },
      { href: "/battery", label: "家庭用蓄電池", description: "役割・容量の決め方・選び方" },
      { href: "/solar-battery", label: "太陽光＋蓄電池", description: "セット導入の利点と注意点" },
      { href: "/v2h", label: "V2H", description: "電気自動車の電気を家で使う" },
      { href: "/hems", label: "HEMS", description: "エネルギーの見える化と制御" },
    ],
  },
  {
    label: "補助金",
    href: "/subsidy",
    links: [
      { href: "/subsidy/katsushika", label: "葛飾区の補助金", description: "かつしかエコ助成金" },
      { href: "/subsidy/tokyo", label: "東京都の補助金", description: "クール・ネット東京の助成" },
      { href: "/subsidy/national", label: "国の補助制度", description: "DR補助金・CEV補助金ほか" },
      { href: "/simulation", label: "補助金シミュレーター", description: "わが家の想定助成額を試算" },
    ],
  },
  {
    label: "商品",
    href: "/products",
    links: [
      { href: "/products/solar", label: "太陽光パネルの比べ方" },
      { href: "/products/battery", label: "蓄電池の比べ方" },
    ],
  },
  {
    label: "導入ガイド",
    href: "/guide",
    links: [
      { href: "/guide/solar-cost", label: "太陽光発電の費用" },
      { href: "/guide/battery-cost", label: "蓄電池の費用" },
      { href: "/guide/solar-merit-demerit", label: "メリット・デメリット" },
      { href: "/guide/blackout", label: "停電時の備え" },
      { href: "/guide/selling-electricity", label: "売電とFIT価格" },
      { href: "/guide/solar-payback", label: "何年で元が取れるか" },
      { href: "/glossary", label: "用語集" },
      { href: "/faq", label: "よくある質問" },
    ],
  },
  {
    label: "SOLAR SHIFT",
    links: [
      { href: "/reason", label: "大切にしていること" },
      { href: "/flow", label: "導入までの流れ" },
      { href: "/area", label: "対応エリア" },
      { href: "/works", label: "施工事例" },
      { href: "/voice", label: "お客様の声" },
      { href: "/blog", label: "ブログ" },
      { href: "/company", label: "運営会社" },
    ],
  },
];

const allFooterNav: NavGroup[] = [
  {
    label: "サービス",
    links: [
      { href: "/solar", label: "太陽光発電" },
      { href: "/battery", label: "家庭用蓄電池" },
      { href: "/solar-battery", label: "太陽光＋蓄電池" },
      { href: "/v2h", label: "V2H" },
      { href: "/hems", label: "HEMS" },
      { href: "/products", label: "商品の選び方" },
      { href: "/products/solar", label: "太陽光パネルの比べ方" },
      { href: "/products/battery", label: "蓄電池の比べ方" },
    ],
  },
  {
    label: "補助金",
    links: [
      { href: "/subsidy", label: "補助金総合ページ" },
      { href: "/subsidy/katsushika", label: "葛飾区の補助金" },
      { href: "/subsidy/tokyo", label: "東京都の補助金" },
      { href: "/subsidy/national", label: "国の補助制度" },
      { href: "/simulation", label: "補助金シミュレーター" },
      { href: "/area/adachi", label: "足立区の補助金" },
      { href: "/area/sumida", label: "墨田区の補助金" },
      { href: "/area/edogawa", label: "江戸川区の補助金" },
    ],
  },
  {
    label: "導入ガイド",
    links: [
      { href: "/guide", label: "導入ガイド一覧" },
      { href: "/guide/solar-cost", label: "太陽光発電の費用" },
      { href: "/guide/solar-payback", label: "何年で元が取れるか" },
      { href: "/guide/solar-merit-demerit", label: "メリット・デメリット" },
      { href: "/guide/solar-lifespan", label: "太陽光パネルの寿命" },
      { href: "/guide/battery-cost", label: "蓄電池の費用" },
      { href: "/guide/battery-how-to-choose", label: "全負荷型と特定負荷型の違い" },
      { href: "/guide/blackout", label: "停電時の備え" },
      { href: "/guide/selling-electricity", label: "売電とFIT価格" },
      { href: "/guide/post-fit", label: "卒FIT後の選択肢" },
      { href: "/guide/all-electric", label: "オール電化との相性" },
      { href: "/guide/roof-conditions", label: "屋根の条件" },
      { href: "/guide/maintenance", label: "メンテナンス" },
      { href: "/guide/solar-safety", label: "火災・台風・水害のリスク" },
      { href: "/guide/zero-yen-solar", label: "0円ソーラーと購入の違い" },
      { href: "/guide/tokyo-solar-mandate", label: "東京都の設置義務化" },
      { href: "/glossary", label: "用語集" },
    ],
  },
  {
    label: "SOLAR SHIFT",
    links: [
      { href: "/reason", label: "大切にしていること" },
      { href: "/flow", label: "導入までの流れ" },
      { href: "/area", label: "対応エリア" },
      { href: "/area/katsushika", label: "葛飾区の太陽光・蓄電池業者" },
      { href: "/works", label: "施工事例" },
      { href: "/voice", label: "お客様の声" },
      { href: "/faq", label: "よくある質問" },
      { href: "/blog", label: "ブログ" },
      { href: "/company", label: "運営会社" },
      { href: "/contact", label: "お問い合わせ" },
    ],
  },
];

function visible(groups: NavGroup[]): NavGroup[] {
  return groups.map((g) => ({ ...g, links: g.links.filter((l) => !isHeldBack(l.href)) })).filter((g) => g.links.length > 0);
}

export const headerNav: NavGroup[] = visible(allHeaderNav);
export const footerNav: NavGroup[] = visible(allFooterNav);

export const legalNav: NavLink[] = [
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/editorial-policy", label: "編集方針" },
  { href: "/sitemap", label: "サイトマップ" },
];
