/**
 * ガイド（検索意図別の固定ページ）の登録簿。
 * 1ページ1検索意図。似たテーマのページを増やすときは、既存ページの intent と重ならないか確認する。
 * ページ本体は app/guide/[slug]/page.tsx ではなく、各ディレクトリに個別の page.tsx として置く
 * （内容が全て異なるため、テンプレート化しない）。
 */

import type { ImageKey } from "./images";
import { surcharge, surchargeYen } from "./surcharge";

export interface GuideEntry {
  slug: string;
  /** 見出し横に出すイラスト（data/images.ts のキー） */
  image: ImageKey;
  path: string;
  title: string;
  /** 一覧用の短い説明 */
  description: string;
  /** 狙う検索意図（カニバリ防止の基準） */
  intent: string;
  /** 関連する固定ページ */
  related: string[];
  /** 最初に公開した日 */
  publishedAt: string;
  updatedAt: string;
}

export const guides: GuideEntry[] = [
  {
    slug: "solar-cost",
    image: "poseCalc",
    path: "/guide/solar-cost",
    title: "太陽光発電の費用はいくら？内訳と葛飾区で使える補助金の考え方",
    description: "設置費用の内訳、費用が変わる要因、補助金を差し引いた考え方を整理します。",
    intent: "太陽光発電 費用",
    related: ["/subsidy/katsushika", "/simulation", "/solar"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "solar-merit-demerit",
    image: "poseThink",
    path: "/guide/solar-merit-demerit",
    title: "太陽光発電のメリット・デメリット｜導入前に知っておくべきこと",
    description: "電気代・停電対策・売電の利点と、費用・屋根・メンテナンスの注意点を両面から解説。",
    intent: "太陽光発電 メリット デメリット",
    related: ["/solar", "/guide/solar-cost", "/guide/roof-conditions"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "solar-lifespan",
    image: "iconPanelWrench",
    path: "/guide/solar-lifespan",
    title: "太陽光パネルの寿命は何年？パワコン交換と保証の見方",
    description: "パネル・パワーコンディショナ・架台それぞれの寿命の目安と、保証の読み方。",
    intent: "太陽光パネル 寿命",
    related: ["/guide/maintenance", "/solar"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "battery-cost",
    image: "batYenDown",
    path: "/guide/battery-cost",
    title: "家庭用蓄電池の費用はいくら？容量別の考え方と補助金",
    description: "蓄電池の価格を決める要素、容量と費用のバランス、助成を踏まえた考え方。",
    intent: "蓄電池 費用",
    related: ["/subsidy/tokyo", "/battery", "/simulation"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "battery-how-to-choose",
    image: "batStack",
    path: "/guide/battery-how-to-choose",
    title: "蓄電池の全負荷型と特定負荷型の違い｜ハイブリッド・単機能の選び分け",
    description: "容量の決め方、全負荷と特定負荷、ハイブリッド型と単機能型の違いを整理。",
    intent: "蓄電池 全負荷 特定負荷 違い",
    related: ["/battery", "/products/battery", "/guide/battery-cost"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "blackout",
    image: "batStorm",
    path: "/guide/blackout",
    title: "停電時に太陽光発電・蓄電池はどこまで使える？葛飾区の水害リスクと備え",
    description: "自立運転の限界、蓄電池で使える範囲、水害リスクを踏まえた設置の考え方。",
    intent: "太陽光 停電時",
    related: ["/area/katsushika", "/battery", "/v2h"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "selling-electricity",
    image: "iconHandPanel",
    path: "/guide/selling-electricity",
    title: "太陽光の売電とは？2026年度のFIT買取価格と仕組み",
    description: "FIT制度の仕組み、2026年度の買取価格、自家消費とのバランスの考え方。",
    intent: "太陽光 売電 価格",
    related: ["/guide/post-fit", "/guide/renewable-energy-surcharge", "/guide/solar-tax", "/solar"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-01",
  },
  {
    slug: "post-fit",
    image: "batDayNight",
    path: "/guide/post-fit",
    title: "卒FIT後はどうする？売電継続・蓄電池・V2Hの選択肢",
    description: "FIT期間終了後の売電単価の変化と、蓄電池やV2Hで自家消費に切り替える考え方。",
    intent: "卒FIT どうする",
    related: ["/guide/selling-electricity", "/battery", "/v2h"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "all-electric",
    image: "batHomeAppliances",
    path: "/guide/all-electric",
    title: "オール電化と太陽光・蓄電池の相性｜電気代を抑える組み合わせ",
    description: "オール電化住宅で太陽光・蓄電池・エコキュートを組み合わせる考え方。",
    intent: "オール電化 太陽光 相性",
    related: ["/solar-battery", "/hems"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "roof-conditions",
    image: "iconHouseSolar",
    path: "/guide/roof-conditions",
    title: "太陽光パネルに向く屋根の条件｜向き・勾配・材質・築年数",
    description: "設置の可否を左右する屋根の条件と、葛飾区の住宅で多い確認ポイント。",
    intent: "太陽光 屋根 条件",
    related: ["/solar", "/flow", "/area/katsushika"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-01",
  },
  {
    slug: "maintenance",
    image: "iconGHouseWrench",
    path: "/guide/maintenance",
    title: "太陽光発電のメンテナンス｜点検の頻度・費用・やるべきこと",
    description: "定期点検の内容、パワコン交換、汚れや故障のサイン、保証の使い方。",
    intent: "太陽光 メンテナンス",
    related: ["/guide/solar-lifespan", "/flow"],
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-02",
  },
  {
    slug: "solar-payback",
    image: "iconGBillDown",
    path: "/guide/solar-payback",
    title: "太陽光発電は何年で元が取れる？回収年数の計算の考え方",
    description: "回収年数の式、1年あたりの効果額の出し方、国の想定値を使った試算。確かめたい前提も整理します。",
    intent: "太陽光発電 元が取れる 何年",
    related: ["/guide/solar-cost", "/guide/renewable-energy-surcharge", "/guide/selling-electricity", "/guide/solar-merit-demerit"],
    publishedAt: "2026-10-02",
    updatedAt: "2026-10-02",
  },
  {
    slug: "tokyo-solar-mandate",
    image: "iconGClipboardHouse",
    path: "/guide/tokyo-solar-mandate",
    title: "東京都の太陽光パネル設置義務化とは？対象・既存住宅・いつから",
    description: "2025年4月に始まった制度の対象、既存住宅の扱い、新築を建てる人・買う人に求められること、都の試算を、東京都の資料で整理します。",
    intent: "東京都 太陽光 義務化",
    related: ["/subsidy/tokyo", "/guide/solar-payback", "/guide/solar-safety"],
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
  },
  {
    slug: "solar-safety",
    image: "iconGHouseShield",
    path: "/guide/solar-safety",
    title: "太陽光パネルの火災・台風・水害のリスクは？安全性と火災保険",
    description: "台風・雹・落雷・火災・地震・水害への備え、火災保険の扱い、撤去とリサイクルを、東京都の公式Q&Aにもとづいて整理します。",
    intent: "太陽光パネル 火災 台風 安全性",
    related: ["/guide/blackout", "/guide/maintenance", "/guide/tokyo-solar-mandate"],
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
  },
  {
    slug: "zero-yen-solar",
    image: "iconGHandHouseYen",
    path: "/guide/zero-yen-solar",
    title: "0円ソーラー（リース・PPA）と購入の違い｜補助金と契約前の確認点",
    description: "所有権と費用の負担、東京都の初期費用ゼロの助成、区の補助金の扱い、契約前に書面で確かめることを整理します。",
    intent: "0円ソーラー リース PPA 違い",
    related: ["/guide/solar-cost", "/guide/solar-payback", "/subsidy/tokyo"],
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
  },
  {
    slug: "renewable-energy-surcharge",
    image: "iconGHouseYenLeaf",
    path: "/guide/renewable-energy-surcharge",
    // 単価は data/surcharge.ts から入る（年度が変わったら、そちらだけを直す）
    title: `再エネ賦課金とは？${surcharge.fiscalYear}は${surchargeYen(surcharge.yenPerKwh)}円/kWh｜計算方法と太陽光の効果`,
    description: "再エネ賦課金の単価と家庭の負担の目安、計算のしかた、2012年度からの推移、太陽光の電気を家で使うと負担がどう変わるかを、国と東京都の資料で整理します。",
    intent: "再エネ賦課金 2026 計算 太陽光",
    related: ["/guide/solar-payback", "/guide/selling-electricity", "/solar-battery"],
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
  },
  {
    slug: "solar-tax",
    image: "iconHouseYen",
    path: "/guide/solar-tax",
    title: "太陽光の売電収入は確定申告が必要？｜雑所得・住民税・補助金の扱い",
    description: "会社員が自宅の太陽光で余った電気を売った収入の税金を、国税庁・葛飾区・東京都主税局の資料で整理します。確定申告の20万円、住民税の申告、消費税、補助金、固定資産税。",
    intent: "太陽光 売電 確定申告 税金",
    related: ["/guide/selling-electricity", "/subsidy/katsushika", "/guide/renewable-energy-surcharge"],
    publishedAt: "2026-10-05",
    updatedAt: "2026-10-05",
  },
  {
    slug: "battery-merit-demerit",
    image: "iconGHouseBattery",
    path: "/guide/battery-merit-demerit",
    title: "家庭用蓄電池はいらない？メリット・デメリットと判断の目安",
    description: "昼の電気を夜に回せる・停電に備えられるメリットと、費用・容量の劣化・置き場所のデメリットを、SIIの登録基準や国・東京都・葛飾区の資料で整理します。向いている家の目安と補助金も。",
    intent: "蓄電池 メリット デメリット いらない 後悔",
    related: ["/guide/battery-how-to-choose", "/guide/battery-cost", "/guide/blackout", "/guide/renewable-energy-surcharge"],
    publishedAt: "2026-10-06",
    updatedAt: "2026-10-06",
  },
];

export function getGuide(slug: string): GuideEntry | undefined {
  return guides.find((g) => g.slug === slug);
}
