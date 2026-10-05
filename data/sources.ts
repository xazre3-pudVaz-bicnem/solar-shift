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
  katsushikaConsumerCenter: src("katsushika-consumer-center", "municipality", "葛飾区公式サイト「消費生活相談はこちら」", "https://www.city.katsushika.lg.jp/kurashi/1000061/1003797/1003863.html", "2026-10-02"),
  katsushikaGuide: src("katsushika-guide", "municipality", "葛飾区「令和8年度 個人住宅用 かつしかエコ助成金のご案内（事前協議分）」", "https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/030/818/r8goannaishugo.pdf", "2026-10-02"),
  katsushikaSolarHandbook: src("katsushika-solar-handbook", "municipality", "葛飾区「太陽光発電システム手引き（個人住宅）」", "https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/036/259/r8taiyokokojin.pdf", "2026-10-02"),
  katsushikaBatteryHandbook: src("katsushika-battery-handbook", "municipality", "葛飾区「蓄電池手引き（個人住宅）」", "https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/036/354/r8chikudenchikojin.pdf", "2026-10-02"),
  katsushikaSeibi: src("katsushika-seibi", "municipality", "葛飾区公式サイト「整備地域」", "https://www.city.katsushika.lg.jp/planning/1003610/1034257.html", "2026-10-02"),
  katsushikaSolarPage: src("katsushika-solar-page", "municipality", "葛飾区公式サイト「（個人住宅用）太陽光発電システム」", "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1035385/1036257/1036259.html", "2026-10-02"),

  katsushikaQa: src("katsushika-qa", "municipality", "葛飾区「かつしかエコ助成金 よくあるご質問」", "https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/035/385/r8qa.pdf", "2026-10-02"),
  katsushikaEcoIndex: src("katsushika-eco-index", "municipality", "葛飾区公式サイト「かつしかエコ助成金」", "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1035385/index.html", "2026-10-02"),
  katsushikaNoticePeriod: src("katsushika-notice-period", "municipality", "葛飾区公式サイト「かつしかエコ助成金 交付額確定通知書発送までの目安期間」", "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1035385/1041425.html", "2026-10-02"),
  katsushikaResidentTax: src("katsushika-resident-tax", "municipality", "葛飾区公式サイト「令和8年度住民税の申告をお願いします」", "https://www.city.katsushika.lg.jp/kurashi/1000047/1001463/1022540.html", "2026-10-05"),
  katsushikaResidentTaxFaq: src("katsushika-resident-tax-faq", "municipality", "葛飾区 よくある質問「住民税の申告の対象者を知りたいのですが。」", "https://www.city.katsushika.lg.jp/faq/1030270/1007655/1007969/1008032.html", "2026-10-05"),
  katsushikaPublicSolar: src("katsushika-public-solar", "municipality", "葛飾区公式サイト「助成金を活用した太陽光発電システムの導入」", "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1032675.html", "2026-10-02"),

  // ───────── 東京都（環境局）
  tokyoSolarPortal: src("tokyo-solar-portal", "tokyo", "東京都環境局「太陽光ポータル」", "https://www.kankyo.metro.tokyo.lg.jp/climate/solar_portal", "2026-10-02"),

  tokyoSolarQa: src("tokyo-solar-qa-2026", "tokyo", "東京都環境局「太陽光パネル設置に関するQ&A【新築・中小規模制度】」（令和8年4月1日）", "https://www.kankyo.metro.tokyo.lg.jp/documents/d/kankyo/q-a_260401", "2026-10-05"),
  tokyoReportLeaflet: src("tokyo-report-leaflet", "tokyo", "東京都環境局「環境性能の説明が必要です～東京都建築物環境報告書制度～」", "https://www.kankyo.metro.tokyo.lg.jp/documents/d/kankyo/leaflet_setsumei_260306", "2026-10-05"),
  tokyoTaxDepreciable: src("tokyo-tax-depreciable", "tokyo", "東京都主税局「固定資産税（償却資産）」", "https://www.tax.metro.tokyo.lg.jp/kazei/work/shokyak_sis", "2026-10-05"),
  tokyoTaxAssetTable: src("tokyo-tax-asset-table", "tokyo", "東京都主税局「償却資産と家屋の区分表（東京都（23区）の取扱い）」（令和6年4月1日時点）", "https://www.tax.metro.tokyo.lg.jp/documents/d/tax/kubunhyou", "2026-10-05"),
  tokyoKohoMandate: src("tokyo-koho-mandate", "tokyo", "広報東京都2025年3月号「太陽光パネルの設置を義務付ける制度が2025年4月から始まります」", "https://www.koho.metro.tokyo.lg.jp/2025/03/02.html", "2026-10-05"),

  // ───────── 東京都（クール・ネット東京）
  tokyoSolarPage: src("tokyo-solar-page", "tokyo", "クール・ネット東京「令和8年度 家庭における太陽光発電導入促進事業」", "https://www.tokyo-co2down.jp/subsidy/fam_solar/r8/", "2026-10-02"),
  tokyoSolarHandbook: src("tokyo-solar-handbook", "tokyo", "クール・ネット東京「令和8年度 家庭における太陽光発電導入促進事業 助成金の手引き」", "https://tokyo-co2down.g.kuroco-img.app/files/user/files/subsidy/fam_solar/r8/r8taiyouko_tebiki_20260630.pdf", "2026-10-02"),
  tokyoBatteryPage: src("tokyo-battery-page", "tokyo", "クール・ネット東京「令和8年度 家庭における蓄電池導入促進事業」", "https://www.tokyo-co2down.jp/subsidy/family_tikudenchi/r8/", "2026-10-02"),
  tokyoBatteryOutline: src("tokyo-battery-outline", "tokyo", "東京都「家庭における蓄電池導入促進事業 実施要綱」", "https://tokyo-co2down.g.kuroco-img.app/files/user/files/subsidy/family_tikudenchi/r8/r8battery_jisshiyoko_20260417.pdf", "2026-10-02"),

  tokyoInitialCostZero: src("tokyo-initial-cost-zero", "tokyo", "クール・ネット東京「住宅用太陽光発電初期費用ゼロ促進の増強事業」", "https://www.tokyo-co2down.jp/subsidy/initial-cost0-zokyo/", "2026-10-05"),
  tokyoBatteryGrantRules: src("tokyo-battery-grant-rules", "tokyo", "クール・ネット東京（東京都環境公社）「家庭における蓄電池導入促進事業助成金交付要綱」", "https://tokyo-co2down.g.kuroco-img.app/files/user/files/subsidy/family_tikudenchi/r8/r8battery_kofuyoko_20260605.pdf", "2026-10-02"),

  // ───────── SII（環境共創イニシアチブ）
  siiBatteryRegistration: src("sii-battery-registration", "sii", "SII（環境共創イニシアチブ）「令和8年度 蓄電システム製品登録 公募要領」", "https://zehweb.jp/assets/doc/R08ZEH_moe_lib_kouboyouryou.pdf", "2026-10-02"),

  // ───────── 国
  metiSurcharge2026: src("meti-surcharge-2026", "national", "経済産業省「再生可能エネルギーのFIT制度・FIP制度における2026年度以降の買取価格等と2026年度の賦課金単価を設定します」（2026年3月19日）", "https://www.meti.go.jp/press/2025/03/20260319004/20260319004.html", "2026-10-05"),
  enechoSurcharge: src("enecho-surcharge", "national", "資源エネルギー庁「なっとく！再生可能エネルギー 制度の概要（再生可能エネルギー発電促進賦課金とは）」", "https://www.enecho.meti.go.jp/category/saving_and_new/saiene/kaitori/surcharge.html", "2026-10-05"),
  enechoBillBreakdown: src("enecho-bill-breakdown", "national", "資源エネルギー庁「月々の電気料金の内訳」", "https://www.enecho.meti.go.jp/category/electricity_and_gas/electric/fee/stracture/spec.html", "2026-10-05"),
  ntaSellingIncome: src("nta-selling-income", "national", "国税庁 質疑応答事例（所得税）「自宅に設置した太陽光発電設備による余剰電力の売却収入」", "https://www.nta.go.jp/law/shitsugi/shotoku/02/44.htm", "2026-10-05"),
  ntaSellingConsumptionTax: src("nta-selling-consumption-tax", "national", "国税庁 質疑応答事例（消費税）「会社員が自宅に設置した太陽光発電設備による余剰電力の売却」", "https://www.nta.go.jp/law/shitsugi/shohi/02/42.htm", "2026-10-05"),
  ntaSalaryEarnerFiling: src("nta-1900", "national", "国税庁 タックスアンサー No.1900「給与所得者で確定申告が必要な人」", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900.htm", "2026-10-05"),
  ntaFilingNotRequiredQa: src("nta-1900-qa", "national", "国税庁 タックスアンサー No.1900 の Q&A「確定申告を要しない場合の意義」", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1900_qa.htm", "2026-10-05"),
  ntaKeisanSelling: src("nta-keisan-selling", "national", "国税庁 確定申告書等作成コーナー よくある質問「太陽光発電設備による売電収入がある場合」", "https://www.keisan.nta.go.jp/r3yokuaru/cat2/cat21/cat21e/cid954.html", "2026-10-05"),
  ntaSubsidyIncome: src("nta-2202", "national", "国税庁 タックスアンサー No.2202「国庫補助金等を受け取ったとき」", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2202.htm", "2026-10-05"),
  ntaTemporaryIncomeCircular: src("nta-tsutatsu-34", "national", "国税庁 所得税基本通達「法第34条《一時所得》関係」", "https://www.nta.go.jp/law/tsutatsu/kihon/shotoku/04/08.htm", "2026-10-05"),
  ntaTemporaryIncome: src("nta-1490", "national", "国税庁 タックスアンサー No.1490「一時所得」", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1490.htm", "2026-10-05"),
  enechoStandalone: src("enecho-standalone", "national", "資源エネルギー庁「停電時の住宅用太陽光発電パネルの自立運転機能について」", "https://www.enecho.meti.go.jp/category/saving_and_new/saiene/kaitori/dl/announce/20200706.pdf", "2026-10-02"),

  metiProcurementOpinion: src("meti-procurement-opinion-2026", "national", "調達価格等算定委員会「令和8年度以降の調達価格等に関する意見」", "https://www.meti.go.jp/shingikai/santeii/pdf/20260205_1.pdf", "2026-10-02"),
  caaDoorToDoorSales: src("caa-door-to-door-sales", "national", "消費者庁「特定商取引法ガイド 訪問販売」", "https://www.no-trouble.caa.go.jp/what/doortodoorsales/", "2026-10-02"),
  caaHotline188: src("caa-hotline-188", "national", "消費者庁「消費者ホットライン」", "https://www.caa.go.jp/policies/policy/local_cooperation/local_consumer_administration/hotline/", "2026-10-02"),

  // ───────── 周辺の区
  adachiSolarBattery: src("adachi-solar-battery", "municipality", "足立区「太陽光発電システム及び蓄電池設置費補助金（設置後申請）」", "https://www.city.adachi.tokyo.jp/kankyo/kurashi/kankyo/taiyoukouhatuden.html", "2026-10-02"),
  sumidaEcoSubsidy: src("sumida-eco-subsidy", "municipality", "墨田区「地球温暖化防止設備導入助成制度」", "https://www.city.sumida.lg.jp/kurashi/kankyou_hozen/jyoseikin/ecojyoseiseido.html", "2026-10-02"),
  sumidaEcoPamphlet: src("sumida-eco-pamphlet", "municipality", "墨田区「［申請編］令和8年度地球温暖化防止設備導入助成制度パンフレット」", "https://www.city.sumida.lg.jp/kurashi/kankyou_hozen/jyoseikin/ecojyoseiseido.files/01_R8pamphlet_s.pdf", "2026-10-02"),
  edogawaDecarbon: src("edogawa-decarbon", "municipality", "江戸川区「江戸川区脱炭素補助金」", "https://www.city.edogawa.tokyo.jp/e086/toshikeikaku/kankyo/inochi/hojokin/index.html", "2026-10-02"),

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
