import { sources } from "../sources";

/**
 * 家を新築して ZEH（ネット・ゼロ・エネルギー・ハウス）・高断熱にするときの補助金（葛飾区で使えるもの）。
 * /subsidy/katsushika の「ZEHの補助金」の節が、ここを読む。
 *
 * - 金額・期限は、各制度の公式ページ・公式資料で確かめたものだけ（docs/VERIFIED_FACTS.md に出典つきで同じ内容）。
 * - 区・都・国の金額は合算しない。制度ごとに別々に示す。
 * - 確かめた日（lastVerified）と、掲載の期限（validUntil）は lib/freshness.ts が点検する。
 */
export interface ZehProgram {
  id: string;
  /** 区・都・国 */
  level: "葛飾区" | "東京都" | "国";
  name: string;
  /** だれが・どんな家で使えるか */
  target: string;
  /** 金額（制度の表記のまま） */
  amounts: string[];
  /** 申請のしかた・時期 */
  howToApply: string[];
  /** 注意（加算の対象外・申請できる人など） */
  notes: string[];
  sources: { name: string; url: string; verifiedAt: string }[];
  lastVerified: string;
  /** この内容で掲載してよい期限（受付期間の終わり。過ぎたら公式で確かめ直す） */
  validUntil: string;
}

const VERIFIED = "2026-11-16";

export const zehPrograms: ZehProgram[] = [
  {
    id: "katsushika-high-insulation",
    level: "葛飾区",
    name: "かつしかエコ助成金「高断熱住宅」（事後申請）",
    target: "区内に新築住宅を建てて、自分で住む個人。住宅性能表示制度の断熱等性能等級が5以上の家",
    amounts: ["断熱等性能等級5：15万円", "断熱等性能等級6：60万円", "断熱等性能等級7：80万円", "『ZEH』の場合：30万円を加算"],
    howToApply: [
      "建物の引き渡しのあとに、区へ交付申請（引き渡し日から1年以内）",
      "受付は2026年4月1日〜2027年3月31日",
      "等級と『ZEH』は、建設住宅性能評価書か BELS評価書（自己評価で出したものを除く）で示す",
      "事前協議（着工の4週間前まで）は要らない",
    ],
    notes: [
      "ZEH の加算は、BELS評価書に『ZEH』マークがあるもの。「Nearly ZEH」「ZEH Oriented」は加算の対象外",
      "過去10年間に、かつしかエコ助成金の交付を受けていないこと",
      "国や都の補助制度と併用できる。ほかの補助金との合計が助成対象経費を上回る場合は、上回る額が減る",
    ],
    sources: [sources.katsushikaHighInsulation, sources.katsushikaJigoGuide],
    lastVerified: VERIFIED,
    validUntil: "2027-03-31",
  },
  {
    id: "tokyo-zero-emi",
    level: "東京都",
    name: "東京ゼロエミ住宅（新築）",
    target: "都内の新築住宅で、東京都の基準（東京ゼロエミ住宅）を満たすもの。申請するのは建築主",
    amounts: ["住宅建設費（戸建住宅）：水準C 40万円・水準B 160万円・水準A 240万円", "蓄電池：10万円/kWh（上限120万円/戸）", "V2H：機器費等の2分の1（上限50万円）"],
    howToApply: ["受付は2026年4月1日〜2027年3月31日（当面は郵送のみ）", "設計確認書の交付日から90日以内に交付申請", "認証書の交付日から180日以内に実績報告"],
    notes: ["交付申請は設計確認書の交付日から90日以内のため、建築会社と早めに段取りを決める"],
    sources: [sources.tokyoZeroEmiPress],
    lastVerified: VERIFIED,
    validUntil: "2027-03-31",
  },
  {
    id: "national-zeh",
    level: "国",
    name: "戸建ZEH支援事業（経済産業省・環境省、執行団体 SII）",
    target: "新築戸建住宅を建てる・買う個人。SII に登録された ZEHビルダー/プランナーが関わる住宅",
    amounts: ["ZEH：55万円/戸（1〜3地域）、45万円/戸（4〜8地域）", "ZEH+：90万円/戸（1〜4地域）、80万円/戸（5〜8地域）", "追加補助の例：蓄電システム 上限20万円/戸（初期実効容量5kWh以上）"],
    howToApply: ["先着順", "単年度事業の公募は2026年5月21日〜12月11日", "複数年度事業の公募は2026年11月6日〜2027年1月8日"],
    notes: ["地域区分（1〜8地域）は、省エネ基準の地域区分。家の所在地で決まるため、設計者に確かめる", "ZEH は断熱等性能等級5以上、ZEH+ は断熱等性能等級6以上が条件"],
    sources: [sources.siiZehPamphlet, sources.siiZehHouse],
    lastVerified: VERIFIED,
    validUntil: "2027-01-08",
  },
  {
    id: "national-mirai-eco-new",
    level: "国",
    name: "みらいエコ住宅2026事業（注文住宅の新築）",
    target: "GX志向型住宅はすべての世帯。長期優良住宅・ZEH水準住宅は、子育て世帯または若者夫婦世帯",
    amounts: ["GX志向型住宅：110万円/戸（5〜8地域）", "長期優良住宅：75万円/戸（5〜8地域）", "ZEH水準住宅：35万円/戸（5〜8地域）"],
    howToApply: [
      "申請は、登録した建築事業者が行う（建築主は自ら申請できない）",
      "ZEH水準住宅（注文住宅の新築）の交付申請は、2026年9月30日までで受付期間が終わっている",
      "そのほかの住宅の交付申請は、遅くとも2026年12月31日まで（予算の上限に達した時点で終了）",
    ],
    notes: ["2025年11月28日以降に基礎工事に着手したものが対象"],
    sources: [sources.miraiEcoNewHouse, sources.miraiEcoNewHouseApplication],
    lastVerified: VERIFIED,
    validUntil: "2026-12-31",
  },
];
