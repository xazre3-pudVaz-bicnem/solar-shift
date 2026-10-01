import type { SubsidyProgram } from "./types";

const LAST_VERIFIED = "2026-10-01";
const FISCAL_YEAR = "令和8年度（2026年度）";

const SOLAR_SOURCE_URL = "https://www.tokyo-co2down.jp/subsidy/fam_solar/r8/";
const SOLAR_SOURCE_NAME = "クール・ネット東京「令和8年度 家庭における太陽光発電導入促進事業」";
const BATTERY_SOURCE_URL = "https://www.tokyo-co2down.jp/subsidy/family_tikudenchi/r8/";
const BATTERY_SOURCE_NAME = "クール・ネット東京「令和8年度 家庭における蓄電池導入促進事業」";

const SOLAR_CONTACT = {
  name: "クール・ネット東京 温暖化対策推進課 創エネ支援チーム（太陽光担当）",
  tel: "03-6737-7006",
  hours: "平日9:00〜17:00（祝祭日・年末年始を除く）",
};

/** 東京都（クール・ネット東京）太陽光 */
export const tokyoSolarProgram: SubsidyProgram = {
  id: "tokyo-solar-r8",
  area: "tokyo",
  programName: "家庭における太陽光発電導入促進事業",
  issuer: "東京都（公益財団法人東京都環境公社 クール・ネット東京）",
  fiscalYear: FISCAL_YEAR,
  summary:
    "都内の住宅に太陽光発電システムを設置する費用の一部を東京都が助成する制度。既存住宅と新築住宅で単価が異なり、容量区分により単価が変わる。",
  sourceName: SOLAR_SOURCE_NAME,
  sourceUrl: SOLAR_SOURCE_URL,
  lastVerified: LAST_VERIFIED,
  notes: [
    "事前申込は2026年5月29日開始、交付申請兼実績報告は2026年6月30日〜2029年3月30日（事業実施年度は令和9年度まで）。",
    "助成対象機器について、都および公社の他の同種の助成金を重複して受けることはできません。",
    "区市町村・国の制度との併用可否は、各制度の公式案内でご確認ください。",
    "「優れた機能性を有する太陽光発電システム」の認定による上乗せ、リフォーム瑕疵保険加入時の加算（1契約7,000円）があります。",
    "キャッシュバック等を受ける場合はその分が助成対象経費から除外されます。未使用品・JET/IEC認証モジュールが対象。",
  ],
  menus: [
    {
      id: "tokyo-solar-existing",
      programName: "家庭における太陽光発電導入促進事業",
      name: "太陽光発電システム（既存住宅）",
      area: "tokyo",
      areaLabel: "東京都",
      issuer: "東京都（クール・ネット東京）",
      fiscalYear: FISCAL_YEAR,
      equipment: "solar",
      target: "都内の既存住宅に、発電出力50kW未満の太陽光発電システムを新規設置する個人等",
      amount: "3.75kW以下：15万円/kW／3.75kW超：12万円/kW",
      maxAmount: "3.75kW以下の場合 上限45万円",
      rule: {
        kind: "tieredPerKw",
        housing: "existing",
        tiers: [
          { maxKw: 3.75, unit: 150000, max: 450000 },
          { maxKw: null, unit: 120000 },
        ],
      },
      applicationPeriod: "事前申込：2026年5月29日〜／交付申請兼実績報告：2026年6月30日〜2029年3月30日",
      deadline: "2029年3月30日（交付申請兼実績報告）",
      preApplicationRequired: true,
      preApplicationNote: "事前申込（Web）が必要。",
      status: "open",
      conditions: [
        "都内の住宅に新規設置する未使用品であること",
        "太陽電池モジュールがJETまたはIEC認証を取得していること",
        "発電出力が50kW未満であること",
        "東京都の環境配慮ガイドライン等の交付条件を満たすこと",
      ],
      notes: [
        "陸屋根の架台設置（既存戸建10万円/kW）や防水工事（18万円/kW）への追加助成あり（条件あり）",
        "助成対象経費（税抜）が上限となる",
      ],
      sourceName: SOLAR_SOURCE_NAME,
      sourceUrl: SOLAR_SOURCE_URL,
      lastVerified: LAST_VERIFIED,
      contact: SOLAR_CONTACT,
    },
    {
      id: "tokyo-solar-new",
      programName: "家庭における太陽光発電導入促進事業",
      name: "太陽光発電システム（新築住宅）",
      area: "tokyo",
      areaLabel: "東京都",
      issuer: "東京都（クール・ネット東京）",
      fiscalYear: FISCAL_YEAR,
      equipment: "solar",
      target: "都内の新築住宅に、発電出力50kW未満の太陽光発電システムを設置する個人等",
      amount: "3.6kW以下：12万円/kW／3.6kW超：10万円/kW",
      maxAmount: "3.6kW以下の場合 上限36万円",
      rule: {
        kind: "tieredPerKw",
        housing: "new",
        tiers: [
          { maxKw: 3.6, unit: 120000, max: 360000 },
          { maxKw: null, unit: 100000 },
        ],
      },
      applicationPeriod: "事前申込：2026年5月29日〜／交付申請兼実績報告：2026年6月30日〜2029年3月30日",
      deadline: "2029年3月30日（交付申請兼実績報告）",
      preApplicationRequired: true,
      preApplicationNote: "事前申込（Web）が必要。",
      status: "open",
      conditions: [
        "都内の新築住宅に設置する未使用品であること",
        "太陽電池モジュールがJETまたはIEC認証を取得していること",
        "発電出力が50kW未満であること",
      ],
      notes: ["助成対象経費（税抜）が上限となる"],
      sourceName: SOLAR_SOURCE_NAME,
      sourceUrl: SOLAR_SOURCE_URL,
      lastVerified: LAST_VERIFIED,
      contact: SOLAR_CONTACT,
    },
  ],
};

/** 東京都（クール・ネット東京）蓄電池 */
export const tokyoBatteryProgram: SubsidyProgram = {
  id: "tokyo-battery-r8",
  area: "tokyo",
  programName: "家庭における蓄電池導入促進事業",
  issuer: "東京都（公益財団法人東京都環境公社 クール・ネット東京）",
  fiscalYear: FISCAL_YEAR,
  summary:
    "都内の住宅に家庭用蓄電池を設置する費用の一部を東京都が助成する制度。蓄電容量に応じた助成で、DR（デマンドレスポンス）実証への参加で加算や上限の扱いが変わる。",
  sourceName: BATTERY_SOURCE_NAME,
  sourceUrl: BATTERY_SOURCE_URL,
  lastVerified: LAST_VERIFIED,
  notes: [
    "事前申込は2026年5月29日開始、交付申請兼実績報告は2026年6月30日開始。",
    "【重要】2026年10月1日以降に事前申込をする場合、助成対象機器はSII（環境共創イニシアチブ）が登録している機器に限られます。検討中の機種が登録済みかを必ず確認してください。",
    "DR実証に参加する場合、エネルギーマネジメント機器の設置有無に応じた加算があります。加算額や上限の扱いは公式案内でご確認ください。",
    "都および公社の他の同種の助成金との重複受給はできません。区市町村・国の制度との併用可否は各制度の公式案内でご確認ください。",
  ],
  menus: [
    {
      id: "tokyo-battery",
      programName: "家庭における蓄電池導入促進事業",
      name: "蓄電池パッケージ（新規設置）",
      area: "tokyo",
      areaLabel: "東京都",
      issuer: "東京都（クール・ネット東京）",
      fiscalYear: FISCAL_YEAR,
      equipment: "battery",
      target: "都内の住宅に家庭用蓄電池システムを新規設置する機器の所有者（国・地方公共団体を除く）",
      amount: "10万円/kWh（助成対象経費（税抜）が上限）",
      maxAmount: "DR実証に参加しない場合 原則上限120万円/戸",
      rule: { kind: "perKwh", unit: 100000, max: 1200000 },
      applicationPeriod: "事前申込：2026年5月29日〜／交付申請兼実績報告：2026年6月30日〜",
      deadline: "公式案内で要確認（予算到達時は早期終了の可能性あり）",
      preApplicationRequired: true,
      preApplicationNote: "事前申込（Web）が必要。2026年10月1日以降の事前申込はSII登録機器に限る。",
      status: "open",
      conditions: [
        "都内の住宅に新規設置する未使用品であること",
        "SIIに登録されている助成対象機器であること（2026年10月1日以降の事前申込）",
        "東京都の交付要綱の要件を満たすこと",
      ],
      notes: [
        "蓄電池ユニットの増設は6万円/kWh（DR不参加時 上限72万円/戸）",
        "DR実証参加時の加算（エネルギーマネジメント機器あり15万円／なし10万円）は公式案内で要確認",
      ],
      sourceName: BATTERY_SOURCE_NAME,
      sourceUrl: BATTERY_SOURCE_URL,
      lastVerified: LAST_VERIFIED,
    },
  ],
};
