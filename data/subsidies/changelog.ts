import { sources } from "../sources";

/**
 * 補助金の更新履歴。補助金のページの「更新履歴」に出す。
 *
 * 載せるのは、実際にあったことだけ：
 *   - 制度の変更 … 公式に発表された制度の動き（受付の開始・終了、要件の変更など）。日付は、公式の発表・適用の日
 *   - 掲載の更新 … このサイトの内容を、公式情報にもとづいて直した日
 *   - 公式情報の再確認 … 公式ページを開き直して確かめた日（内容は変えていない）
 * 新しい年度（令和9年度など）の情報が出たら、ここに足して、古い年度の行は残す（URL は毎年作り直さない）。
 * 日付と数字は docs/VERIFIED_FACTS.md にあるものだけ（npm run facts:audit が見る）。
 */
export type ChangeLogKind = "制度の変更" | "掲載の更新" | "公式情報の再確認";

export interface ChangeLogEntry {
  /** YYYY-MM-DD */
  date: string;
  /** どの制度の話か（all は、区・都・国のまとめての確認） */
  area: "katsushika" | "tokyo" | "national" | "all";
  kind: ChangeLogKind;
  text: string;
  source?: { name: string; url: string };
}

export const subsidyChangeLog: ChangeLogEntry[] = [
  {
    date: "2026-11-04",
    area: "tokyo",
    kind: "掲載の更新",
    text: "東京都の太陽光・蓄電池：令和8年度に事前申込を受け付けた申請は、交付申請兼実績報告のときに「金融機関発行の証明書等」が必須（現金の受け渡しによる取引は対象外）であることを掲載。蓄電池の問い合わせ先（蓄電池ヘルプデスク）を追加",
    source: { name: sources.tokyoDocsChange.name, url: sources.tokyoDocsChange.url },
  },
  {
    date: "2026-11-04",
    area: "all",
    kind: "公式情報の再確認",
    text: "葛飾区・東京都・国の制度を、公式ページで確かめ直した。助成額・申込期限の変更はなし",
  },
  {
    date: "2026-10-26",
    area: "national",
    kind: "掲載の更新",
    text: "みらいエコ住宅2026：交付申請の予約（遅くとも2026年11月16日まで）と、交付申請（遅くとも2026年12月31日まで）の期限を掲載",
    source: { name: "みらいエコ住宅2026事業【公式】リフォーム", url: "https://mirai-eco2026.mlit.go.jp/reform/" },
  },
  {
    date: "2026-10-01",
    area: "tokyo",
    kind: "制度の変更",
    text: "東京都の蓄電池：2026年10月1日以降の事前申込は、SII（環境共創イニシアチブ）の登録機器に限る（2026年4月1日〜6月30日に契約を結んだ、または契約・工事を終えた事業は除く）",
    source: { name: sources.tokyoBatteryPage.name, url: sources.tokyoBatteryPage.url },
  },
  {
    date: "2026-08-27",
    area: "national",
    kind: "制度の変更",
    text: "国の CEV 補助金（V2H 充放電設備）：受付終了",
    source: { name: "一般社団法人 次世代自動車振興センター", url: "https://www.cev-pc.or.jp/" },
  },
  {
    date: "2026-05-29",
    area: "national",
    kind: "制度の変更",
    text: "国の DR 家庭用蓄電池事業（令和7年度補正）：予算に達したため公募終了",
    source: { name: "SII「DR家庭用蓄電池事業」", url: "https://dr-battery.sii.or.jp/r7h/about/" },
  },
  {
    date: "2026-05-29",
    area: "tokyo",
    kind: "制度の変更",
    text: "東京都の太陽光・蓄電池（令和8年度）：事前申込の受付開始",
    source: { name: sources.tokyoSolarPage.name, url: sources.tokyoSolarPage.url },
  },
  {
    date: "2026-04-01",
    area: "katsushika",
    kind: "制度の変更",
    text: "葛飾区：令和8年度 かつしかエコ助成金（個人住宅用）の受付開始（2027年3月31日必着まで）",
    source: { name: sources.katsushikaPage.name, url: sources.katsushikaPage.url },
  },
];

/** その制度の行（「all」の確認の行も含める）を、新しい順に */
export function changeLogFor(areas: ChangeLogEntry["area"][]): ChangeLogEntry[] {
  return subsidyChangeLog.filter((e) => e.area === "all" || areas.includes(e.area)).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
