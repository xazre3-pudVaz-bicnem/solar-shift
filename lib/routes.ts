/**
 * 固定ページの一覧（sitemap.xml・内部リンク検証・自動生成記事のリンク許可リストが共有する）。
 * route を追加・削除したら必ずここを更新する。
 */
export interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}

export const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/subsidy", priority: 0.9, changeFrequency: "weekly" },
  { path: "/subsidy/katsushika", priority: 1.0, changeFrequency: "weekly" },
  { path: "/subsidy/tokyo", priority: 0.9, changeFrequency: "weekly" },
  { path: "/subsidy/national", priority: 0.7, changeFrequency: "weekly" },
  { path: "/simulation", priority: 0.9, changeFrequency: "weekly" },
  { path: "/solar", priority: 0.8, changeFrequency: "monthly" },
  { path: "/battery", priority: 0.8, changeFrequency: "monthly" },
  { path: "/solar-battery", priority: 0.8, changeFrequency: "monthly" },
  { path: "/v2h", priority: 0.7, changeFrequency: "monthly" },
  { path: "/hems", priority: 0.6, changeFrequency: "monthly" },
  { path: "/products", priority: 0.6, changeFrequency: "weekly" },
  { path: "/products/solar", priority: 0.6, changeFrequency: "weekly" },
  { path: "/products/battery", priority: 0.6, changeFrequency: "weekly" },
  { path: "/recommend/solar", priority: 0.6, changeFrequency: "weekly" },
  { path: "/recommend/battery", priority: 0.6, changeFrequency: "weekly" },
  { path: "/works", priority: 0.5, changeFrequency: "weekly" },
  { path: "/reason", priority: 0.6, changeFrequency: "monthly" },
  { path: "/flow", priority: 0.7, changeFrequency: "monthly" },
  { path: "/area", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voice", priority: 0.4, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" },
  { path: "/company", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/sitemap", priority: 0.2, changeFrequency: "monthly" },
];
