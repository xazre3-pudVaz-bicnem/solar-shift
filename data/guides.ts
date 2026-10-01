/**
 * ガイド（検索意図別の固定ページ）の登録簿。
 * 1ページ1検索意図。似たテーマのページを増やすときは、既存ページの intent と重ならないか確認する。
 * ページ本体は app/guide/[slug]/page.tsx ではなく、各ディレクトリに個別の page.tsx として置く
 * （内容が全て異なるため、テンプレート化しない）。
 */

export interface GuideEntry {
  slug: string;
  path: string;
  title: string;
  /** 一覧用の短い説明 */
  description: string;
  /** 狙う検索意図（カニバリ防止の基準） */
  intent: string;
  /** 関連する固定ページ */
  related: string[];
  updatedAt: string;
}

export const guides: GuideEntry[] = [
  {
    slug: "solar-cost",
    path: "/guide/solar-cost",
    title: "太陽光発電の費用はいくら？内訳と葛飾区で使える補助金の考え方",
    description: "設置費用の内訳、費用が変わる要因、補助金を差し引いた考え方を整理します。",
    intent: "太陽光発電 費用",
    related: ["/subsidy/katsushika", "/simulation", "/solar"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "solar-merit-demerit",
    path: "/guide/solar-merit-demerit",
    title: "太陽光発電のメリット・デメリット｜導入前に知っておくべきこと",
    description: "電気代・停電対策・売電の利点と、費用・屋根・メンテナンスの注意点を両面から解説。",
    intent: "太陽光発電 メリット デメリット",
    related: ["/solar", "/guide/solar-cost", "/guide/roof-conditions"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "solar-lifespan",
    path: "/guide/solar-lifespan",
    title: "太陽光パネルの寿命は何年？パワコン交換と保証の見方",
    description: "パネル・パワーコンディショナ・架台それぞれの寿命の目安と、保証の読み方。",
    intent: "太陽光パネル 寿命",
    related: ["/guide/maintenance", "/solar"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "battery-cost",
    path: "/guide/battery-cost",
    title: "家庭用蓄電池の費用はいくら？容量別の考え方と補助金",
    description: "蓄電池の価格を決める要素、容量と費用のバランス、助成を踏まえた考え方。",
    intent: "蓄電池 費用",
    related: ["/subsidy/tokyo", "/battery", "/simulation"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "battery-how-to-choose",
    path: "/guide/battery-how-to-choose",
    title: "蓄電池の選び方｜容量・全負荷/特定負荷・ハイブリッドの違い",
    description: "容量の決め方、全負荷と特定負荷、ハイブリッド型と単機能型の違いを整理。",
    intent: "蓄電池 選び方",
    related: ["/battery", "/recommend/battery", "/guide/battery-cost"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "blackout",
    path: "/guide/blackout",
    title: "停電時に太陽光発電・蓄電池はどこまで使える？葛飾区の水害リスクと備え",
    description: "自立運転の限界、蓄電池で使える範囲、水害リスクを踏まえた設置の考え方。",
    intent: "太陽光 停電時",
    related: ["/area/katsushika", "/battery", "/v2h"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "selling-electricity",
    path: "/guide/selling-electricity",
    title: "太陽光の売電とは？2026年度のFIT買取価格と仕組み",
    description: "FIT制度の仕組み、2026年度の買取価格、自家消費とのバランスの考え方。",
    intent: "太陽光 売電 価格",
    related: ["/guide/post-fit", "/solar", "/guide/solar-cost"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "post-fit",
    path: "/guide/post-fit",
    title: "卒FIT後はどうする？売電継続・蓄電池・V2Hの選択肢",
    description: "FIT期間終了後の売電単価の変化と、蓄電池やV2Hで自家消費に切り替える考え方。",
    intent: "卒FIT どうする",
    related: ["/guide/selling-electricity", "/battery", "/v2h"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "all-electric",
    path: "/guide/all-electric",
    title: "オール電化と太陽光・蓄電池の相性｜電気代を抑える組み合わせ",
    description: "オール電化住宅で太陽光・蓄電池・エコキュートを組み合わせる考え方。",
    intent: "オール電化 太陽光 相性",
    related: ["/solar-battery", "/hems"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "roof-conditions",
    path: "/guide/roof-conditions",
    title: "太陽光パネルに向く屋根の条件｜向き・勾配・材質・築年数",
    description: "設置の可否を左右する屋根の条件と、葛飾区の住宅で多い確認ポイント。",
    intent: "太陽光 屋根 条件",
    related: ["/solar", "/flow", "/area/katsushika"],
    updatedAt: "2026-10-01",
  },
  {
    slug: "maintenance",
    path: "/guide/maintenance",
    title: "太陽光発電のメンテナンス｜点検の頻度・費用・やるべきこと",
    description: "定期点検の内容、パワコン交換、汚れや故障のサイン、保証の使い方。",
    intent: "太陽光 メンテナンス",
    related: ["/guide/solar-lifespan", "/flow"],
    updatedAt: "2026-10-01",
  },
];

export function getGuide(slug: string): GuideEntry | undefined {
  return guides.find((g) => g.slug === slug);
}
