/**
 * 根拠にしている一次情報の登録簿。
 * ページの「参考資料」、記事の出典、自動生成記事の検査（数値の根拠がどの資料か）で共有する。
 *
 * sourceType は資料の種類。数値・制度・技術仕様を書くときは、次の順で根拠を探す。
 *   1. municipality / tokyo / national … 自治体・東京都・国の公式資料
 *   2. sii                              … SII（環境共創イニシアチブ）
 *   3. manufacturer                     … メーカーの公式資料
 *   4. industry                         … 業界団体（太陽光発電協会など）
 * ここに無い資料を根拠にした数値は、サイトにも記事にも書かない（「製品によって異なる」とする）。
 * 追加するときは、実際に資料を開いて該当箇所を確認し、verifiedAt に確認日を入れる。
 */
export type SourceType = "municipality" | "tokyo" | "national" | "sii" | "manufacturer" | "industry";

export interface VerifiedSource {
  id: string;
  name: string;
  url: string;
  sourceType: SourceType;
  /** 資料を開いて確認した日（YYYY-MM-DD） */
  verifiedAt: string;
}

const src = (id: string, sourceType: SourceType, name: string, url: string, verifiedAt: string): VerifiedSource => ({ id, name, url, sourceType, verifiedAt });

export const sources = {
  // ───────── 葛飾区
  katsushikaPage: src("katsushika-page", "municipality", "葛飾区公式サイト「令和8年度《個人住宅用》かつしかエコ助成金のご案内」", "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1035385/1030818.html", "2026-10-02"),
  katsushikaGuide: src("katsushika-guide", "municipality", "葛飾区「令和8年度 個人住宅用 かつしかエコ助成金のご案内（事前協議分）」", "https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/030/818/r8goannaishugo.pdf", "2026-10-02"),
  katsushikaSolarHandbook: src("katsushika-solar-handbook", "municipality", "葛飾区「太陽光発電システム手引き（個人住宅）」", "https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/036/259/r8taiyokokojin.pdf", "2026-10-02"),
  katsushikaBatteryHandbook: src("katsushika-battery-handbook", "municipality", "葛飾区「蓄電池手引き（個人住宅）」", "https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/036/354/r8chikudenchikojin.pdf", "2026-10-02"),
  katsushikaSeibi: src("katsushika-seibi", "municipality", "葛飾区公式サイト「整備地域」", "https://www.city.katsushika.lg.jp/planning/1003610/1034257.html", "2026-10-02"),
  katsushikaSolarPage: src("katsushika-solar-page", "municipality", "葛飾区公式サイト「（個人住宅用）太陽光発電システム」", "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1035385/1036257/1036259.html", "2026-10-02"),

  // ───────── 東京都（環境局）
  tokyoSolarPortal: src("tokyo-solar-portal", "tokyo", "東京都環境局「太陽光ポータル」", "https://www.kankyo.metro.tokyo.lg.jp/climate/solar_portal", "2026-10-02"),

  // ───────── 東京都（クール・ネット東京）
  tokyoSolarPage: src("tokyo-solar-page", "tokyo", "クール・ネット東京「令和8年度 家庭における太陽光発電導入促進事業」", "https://www.tokyo-co2down.jp/subsidy/fam_solar/r8/", "2026-10-02"),
  tokyoSolarHandbook: src("tokyo-solar-handbook", "tokyo", "クール・ネット東京「令和8年度 家庭における太陽光発電導入促進事業 助成金の手引き」", "https://tokyo-co2down.g.kuroco-img.app/files/user/files/subsidy/fam_solar/r8/r8taiyouko_tebiki_20260630.pdf", "2026-10-02"),
  tokyoBatteryPage: src("tokyo-battery-page", "tokyo", "クール・ネット東京「令和8年度 家庭における蓄電池導入促進事業」", "https://www.tokyo-co2down.jp/subsidy/family_tikudenchi/r8/", "2026-10-02"),
  tokyoBatteryOutline: src("tokyo-battery-outline", "tokyo", "東京都「家庭における蓄電池導入促進事業 実施要綱」", "https://tokyo-co2down.g.kuroco-img.app/files/user/files/subsidy/family_tikudenchi/r8/r8battery_jisshiyoko_20260417.pdf", "2026-10-02"),

  tokyoBatteryGrantRules: src("tokyo-battery-grant-rules", "tokyo", "クール・ネット東京（東京都環境公社）「家庭における蓄電池導入促進事業助成金交付要綱」", "https://tokyo-co2down.g.kuroco-img.app/files/user/files/subsidy/family_tikudenchi/r8/r8battery_kofuyoko_20260605.pdf", "2026-10-02"),

  // ───────── SII（環境共創イニシアチブ）
  siiBatteryRegistration: src("sii-battery-registration", "sii", "SII（環境共創イニシアチブ）「令和8年度 蓄電システム製品登録 公募要領」", "https://zehweb.jp/assets/doc/R08ZEH_moe_lib_kouboyouryou.pdf", "2026-10-02"),

  // ───────── 国
  enechoStandalone: src("enecho-standalone", "national", "資源エネルギー庁「停電時の住宅用太陽光発電パネルの自立運転機能について」", "https://www.enecho.meti.go.jp/category/saving_and_new/saiene/kaitori/dl/announce/20200706.pdf", "2026-10-02"),

  // ───────── 業界団体
  jpeaLifespan: src("jpea-lifespan", "industry", "太陽光発電協会（JPEA）よくある質問「機器の耐用年数はどれくらいですか？」", "https://www.jpea.gr.jp/faq/583/", "2026-10-02"),
  jpeaPowerOutage: src("jpea-power-outage", "industry", "太陽光発電協会（JPEA）「停電時でも電気が使えます」", "https://www.jpea.gr.jp/house/poweroutage/", "2026-10-02"),
  jpeaAbout: src("jpea-about", "industry", "太陽光発電協会（JPEA）「住宅用太陽光発電システムとは」", "https://www.jpea.gr.jp/house/about/", "2026-10-02"),
  jpeaMerit: src("jpea-merit", "industry", "太陽光発電協会（JPEA）「住宅用太陽光発電システムのメリット」", "https://www.jpea.gr.jp/house/merit/", "2026-10-02"),
  jpeaSetting: src("jpea-setting", "industry", "太陽光発電協会（JPEA）「設置までの流れ（住宅用システム）①自己所有の場合」", "https://www.jpea.gr.jp/house/setting/", "2026-10-02"),
  jpeaLongUser: src("jpea-long-user", "industry", "太陽光発電協会（JPEA）「長く使っていただくために」", "https://www.jpea.gr.jp/house/longuser/", "2026-10-02"),
  jpeaSellUser: src("jpea-sell-user", "industry", "太陽光発電協会（JPEA）「固定価格での買取期間満了（卒FIT）ユーザーへ」", "https://www.jpea.gr.jp/house/selluser/", "2026-10-02"),
  jpeaMethod: src("jpea-method", "industry", "太陽光発電協会（JPEA）「住宅用太陽光発電システムの導入方法の説明」", "https://www.jpea.gr.jp/house/method/", "2026-10-02"),
  jpeaRoof: src("jpea-faq-roof", "industry", "太陽光発電協会（JPEA）よくある質問「どんな屋根に設置できますか？」", "https://www.jpea.gr.jp/faq/561/", "2026-10-02"),
  jpeaAreaWeight: src("jpea-faq-area-weight", "industry", "太陽光発電協会（JPEA）よくある質問「太陽光発電システムの設置に必要な面積と重量はどれくらいですか？」", "https://www.jpea.gr.jp/faq/562/", "2026-10-02"),
  jpeaOutput: src("jpea-faq-output", "industry", "太陽光発電協会（JPEA）よくある質問「太陽光発電により、家庭で使用する電気を全部まかなえますか？」", "https://www.jpea.gr.jp/faq/563/", "2026-10-02"),
  jpeaSelling: src("jpea-faq-selling", "industry", "太陽光発電協会（JPEA）よくある質問「発電した電気を売ることができますか？」", "https://www.jpea.gr.jp/faq/571/", "2026-10-02"),
  jpeaPcsPlace: src("jpea-faq-pcs-place", "industry", "太陽光発電協会（JPEA）よくある質問「パワーコンディショナの設置場所はどこが良いのですか？」", "https://www.jpea.gr.jp/faq/578/", "2026-10-02"),
  jpeaInspection: src("jpea-faq-inspection", "industry", "太陽光発電協会（JPEA）よくある質問「メンテナンスや点検はどうすればいいですか？」", "https://www.jpea.gr.jp/faq/579/", "2026-10-02"),
  jpeaShade: src("jpea-faq-shade", "industry", "太陽光発電協会（JPEA）よくある質問「陰の影響はありますか？」", "https://www.jpea.gr.jp/faq/580/", "2026-10-02"),
  jpeaCost: src("jpea-faq-cost", "industry", "太陽光発電協会（JPEA）よくある質問「設置費用はいくらかかりますか？」", "https://www.jpea.gr.jp/faq/589/", "2026-10-02"),
  jpeaOrientation: src("jpea-faq-orientation", "industry", "太陽光発電協会（JPEA）よくある質問「設置方位や設置角度の影響はありますか？」", "https://www.jpea.gr.jp/faq/590/", "2026-10-02"),
  jpeaDirt: src("jpea-faq-dirt", "industry", "太陽光発電協会（JPEA）よくある質問「太陽電池モジュールの汚れによる発電量への影響はありますか？」", "https://www.jpea.gr.jp/faq/593/", "2026-10-02"),
} as const satisfies Record<string, VerifiedSource>;

export type SourceKey = keyof typeof sources;

export const sourceTypeLabel: Record<SourceType, string> = {
  municipality: "自治体",
  tokyo: "東京都",
  national: "国",
  sii: "SII",
  manufacturer: "メーカー",
  industry: "業界団体",
};
