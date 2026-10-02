import { sources, type VerifiedSource } from "./sources";

/**
 * 葛飾区が公表している、区の公共施設の太陽光発電システムと、年間の想定発電量。
 * 2026-10-02 に、区の公式ページを開いて転記した（区のページの更新日は 2026-09-15）。
 *
 * - 区が公表している「想定」の値で、住宅の発電量を示すものではない。
 *   ページに出すときは、公共施設の例であること、屋根の向き・角度・影で変わることを必ず添える。
 * - ここにある数値から、1kWあたりの発電量などを計算して載せない（区が公表している数値だけを出す）。
 */
export interface PublicSolarFacility {
  name: string;
  /** 設置した年度 */
  installed: string;
  /** 太陽電池モジュールの出力（kW） */
  moduleKw: number;
  /** モジュールの構成（区の表記） */
  modules: string;
  /** 年間想定発電量（kWh/年） */
  yearlyKwh: number;
}

export const katsushikaPublicSolar: { source: VerifiedSource; pageUpdatedAt: string; facilities: PublicSolarFacility[] } = {
  source: sources.katsushikaPublicSolar,
  pageUpdatedAt: "2026-09-15",
  facilities: [
    { name: "子ども未来プラザ東四つ木", installed: "令和5年度", moduleKw: 5.25, modules: "375W×14枚", yearlyKwh: 5146 },
    { name: "西小菅小学校", installed: "令和4年度", moduleKw: 10.98, modules: "305W×36枚", yearlyKwh: 11641 },
    { name: "清掃事務所", installed: "令和6年度", moduleKw: 12.3, modules: "410W×30枚", yearlyKwh: 11794 },
    { name: "高砂小学校・高砂中学校", installed: "令和4年度", moduleKw: 27, modules: "375W×72枚", yearlyKwh: 25872 },
    { name: "水元小学校", installed: "令和7年度", moduleKw: 49.2, modules: "410W×120枚", yearlyKwh: 51222 },
    { name: "二上小学校", installed: "令和7年度", moduleKw: 94.6, modules: "455W×208枚", yearlyKwh: 70072 },
  ],
};
