import { simulate } from "@/lib/subsidy-calc";
import { formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { CountUp } from "@/components/ui/CountUp";
import { reveal } from "@/lib/reveal";

/**
 * 「容量別の想定助成額」早見表。左に代表例の大きな数字、右に容量別の表。
 * 数値はすべて lib/subsidy-calc.ts（= data/subsidies のルール）から計算する。
 * 葛飾区と東京都は列を分けて示し、合算しない。
 */
const SOLAR_KW = [3, 4, 5, 6];
const BATTERY_KWH = [5, 7, 10];
const EXAMPLE = { solarKw: 5, batteryKwh: 7 };

const base = { area: "katsushika", housing: "existing", v2h: false, hems: false } as const;

function yen(n: number) {
  return n.toLocaleString("ja-JP");
}

export function SubsidyMatrix() {
  const ex = simulate({ ...base, ...EXAMPLE });
  const [k, t] = ex.areas;

  const solarRows = SOLAR_KW.map((kw) => {
    const r = simulate({ ...base, solarKw: kw, batteryKwh: 0 });
    return { label: `${kw}kW`, k: r.areas[0].lines[0], t: r.areas[1].lines[0] };
  });
  const batteryRows = BATTERY_KWH.map((kwh) => {
    const r = simulate({ ...base, solarKw: 0, batteryKwh: kwh });
    return { label: `${kwh}kWh`, k: r.areas[0].lines[0], t: r.areas[1].lines[0] };
  });

  const Cell = ({ amount, capOnly, tone }: { amount: number | null; capOnly?: boolean; tone: "k" | "t" }) => (
    <td className={`px-2 py-2.5 text-center sm:px-4 ${tone === "t" ? "bg-green-50" : "bg-white"}`}>
      {capOnly && <span className="mr-0.5 text-[10px] font-bold text-ink-3 sm:text-[11px]">最大</span>}
      <span className={`num-xl text-[17px] sm:text-[22px] ${tone === "t" ? "text-green-700" : "text-accent-text"}`}>{amount === null ? "—" : yen(amount)}</span>
      <span className="ml-0.5 text-[10px] font-bold text-ink-2 sm:text-[12px]">円</span>
    </td>
  );

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
      <div className="text-center lg:text-left" {...reveal(0, "left")}>
        <p>
          <span className="relative inline-block rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[15px] font-bold text-navy-900 shadow-sm">
            太陽光{EXAMPLE.solarKw}kW＋蓄電池{EXAMPLE.batteryKwh}kWhなら…
          </span>
        </p>
        <p className="mt-5 flex flex-wrap items-baseline justify-center gap-x-2 font-heading font-black text-navy-900 lg:justify-start">
          <span className="text-[18px] sm:text-[22px]">葛飾区から</span>
          {k.hasCapOnly && <span className="rounded-md bg-navy-900 px-2 py-[2px] text-[13px] text-white">最大</span>}
          <CountUp value={k.subtotal / 10000} className="num-xl text-[64px] text-orange-600 sm:text-[88px]" />
          <span className="text-[26px] sm:text-[34px]">万円</span>
        </p>
        <p className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 font-heading font-black text-navy-900 lg:justify-start">
          <span className="text-[18px] sm:text-[22px]">東京都から</span>
          <CountUp value={t.subtotal / 10000} className="num-xl text-[64px] text-green-600 sm:text-[88px]" />
          <span className="text-[26px] sm:text-[34px]">万円</span>
        </p>
        <p className="mt-3 font-heading text-[20px] leading-[1.5] font-black text-navy-900 sm:text-[26px]">
          の<span className="marker">助成が想定</span>されます
        </p>
        <p className="mt-4 text-[12px] leading-[1.8] text-ink-3">
          ※ {formatDateJa(siteConfig.subsidyInfoDate)}時点の公式情報による概算（既存住宅）。葛飾区の蓄電池は対象経費の1/4のため上限額で計算しています。区と都は合算していません（併用可否は各窓口でご確認ください）。交付を保証するものではありません。
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-pop" {...reveal(120, "right")}>
        <table className="w-full border-collapse text-[13px] sm:text-[15px]">
          <caption className="sr-only">容量別の想定助成額（既存住宅・葛飾区と東京都）</caption>
          <thead>
            <tr>
              <td className="w-[26%] bg-white px-2 py-3" />
              <th scope="col" className="bg-orange-500 px-2 py-3 font-heading font-bold text-navy-900">
                葛飾区
              </th>
              <th scope="col" className="bg-green-600 px-2 py-3 font-heading font-bold text-white">
                東京都
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="rowgroup" colSpan={3} className="bg-navy-900 px-3 py-1.5 text-left text-[12px] font-bold text-white sm:text-[13px]">
                太陽光発電（容量別）
              </th>
            </tr>
            {solarRows.map((r, i) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className={`px-2 py-2.5 font-en text-[14px] font-bold text-white sm:text-[16px] ${i % 2 ? "bg-green-700" : "bg-green-600"}`}>
                  {r.label}
                </th>
                <Cell amount={r.k?.amount ?? null} tone="k" />
                <Cell amount={r.t?.amount ?? null} tone="t" />
              </tr>
            ))}
            <tr>
              <th scope="rowgroup" colSpan={3} className="bg-navy-900 px-3 py-1.5 text-left text-[12px] font-bold text-white sm:text-[13px]">
                蓄電池（容量別）
              </th>
            </tr>
            {batteryRows.map((r, i) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className={`px-2 py-2.5 font-en text-[14px] font-bold text-white sm:text-[16px] ${i % 2 ? "bg-green-700" : "bg-green-600"}`}>
                  {r.label}
                </th>
                <Cell amount={r.k?.amount ?? null} capOnly={r.k?.isCapOnly} tone="k" />
                <Cell amount={r.t?.amount ?? null} tone="t" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
