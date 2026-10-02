/**
 * 固定ページの一覧（sitemap.xml・内部リンク検証・自動生成記事のリンク許可リスト・OG画像が共有する）。
 * route を追加・削除したら必ずここを更新する。
 *
 * ogTitle … SNS で共有されたときの画像（/og/…）に大きく出す見出し。「｜」より後ろは小さめの副題になる。
 */
export interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  ogTitle: string;
}

export const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly", ogTitle: "葛飾区の太陽光発電・蓄電池｜補助金の整理から設置・導入後まで" },
  { path: "/subsidy", priority: 0.9, changeFrequency: "weekly", ogTitle: "太陽光・蓄電池の補助金｜区・都・国の3つの制度と申請の順番" },
  { path: "/subsidy/katsushika", priority: 1.0, changeFrequency: "weekly", ogTitle: "葛飾区の太陽光・蓄電池補助金｜かつしかエコ助成金の金額・条件・申請" },
  { path: "/subsidy/tokyo", priority: 0.9, changeFrequency: "weekly", ogTitle: "東京都の太陽光・蓄電池補助金｜クール・ネット東京の家庭向け助成" },
  { path: "/subsidy/national", priority: 0.7, changeFrequency: "weekly", ogTitle: "国の太陽光・蓄電池補助金｜DR補助金・CEV補助金・みらいエコ住宅の現状" },
  { path: "/simulation", priority: 0.9, changeFrequency: "weekly", ogTitle: "補助金シミュレーター｜葛飾区・東京都の想定助成額を試算" },
  { path: "/solar", priority: 0.8, changeFrequency: "monthly", ogTitle: "住宅用太陽光発電｜仕組みと向いている家" },
  { path: "/battery", priority: 0.8, changeFrequency: "monthly", ogTitle: "家庭用蓄電池の選び方｜役割・容量の決め方・補助金" },
  { path: "/solar-battery", priority: 0.8, changeFrequency: "monthly", ogTitle: "太陽光発電＋蓄電池｜同時導入の利点と併設加算" },
  { path: "/v2h", priority: 0.7, changeFrequency: "monthly", ogTitle: "V2H｜電気自動車の電気を家で使う" },
  { path: "/hems", priority: 0.6, changeFrequency: "monthly", ogTitle: "HEMS｜エネルギーの見える化と葛飾区の助成" },
  { path: "/products", priority: 0.6, changeFrequency: "weekly", ogTitle: "太陽光パネル・蓄電池の選び方｜比べるときに見る項目" },
  { path: "/products/solar", priority: 0.6, changeFrequency: "weekly", ogTitle: "太陽光パネルの比べ方｜出力・変換効率・保証の見方" },
  { path: "/products/battery", priority: 0.6, changeFrequency: "weekly", ogTitle: "家庭用蓄電池の比べ方｜容量・出力・負荷タイプの見方" },
  { path: "/works", priority: 0.5, changeFrequency: "weekly", ogTitle: "施工事例" },
  { path: "/reason", priority: 0.6, changeFrequency: "monthly", ogTitle: "SOLAR SHIFT が大切にしていること" },
  { path: "/flow", priority: 0.7, changeFrequency: "monthly", ogTitle: "導入・施工の流れ｜相談から申請・工事・運転開始まで" },
  { path: "/area", priority: 0.7, changeFrequency: "monthly", ogTitle: "対応エリア｜葛飾区を中心に足立区・江戸川区・墨田区" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly", ogTitle: "よくある質問｜太陽光・蓄電池・補助金" },
  { path: "/voice", priority: 0.4, changeFrequency: "monthly", ogTitle: "お客様の声" },
  { path: "/guide", priority: 0.7, changeFrequency: "monthly", ogTitle: "太陽光・蓄電池の導入ガイド｜費用・選び方・停電・売電" },
  { path: "/blog", priority: 0.7, changeFrequency: "daily", ogTitle: "ブログ｜葛飾区の太陽光・蓄電池・補助金の最新情報" },
  { path: "/company", priority: 0.6, changeFrequency: "yearly", ogTitle: "運営会社｜株式会社サイプレス" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly", ogTitle: "お問い合わせ・無料相談｜現地調査・お見積もりは無料" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly", ogTitle: "プライバシーポリシー" },
  { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly", ogTitle: "記事・補助金情報の編集方針" },
  { path: "/sitemap", priority: 0.2, changeFrequency: "monthly", ogTitle: "サイトマップ" },
];
