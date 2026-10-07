import { simulate, type LineResult } from "@/lib/subsidy-calc";
import { formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { CountUp } from "@/components/ui/CountUp";
import { TableScroll } from "@/components/ui/TableScroll";
import { SourceNote } from "@/components/ui/SourceNote";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, subsidySources } from "@/data/subsidies";
import { reveal } from "@/lib/reveal";

/**
 * 「容量別の想定助成額」早見表（既存住宅）。
 * 数値はすべて lib/subsidy-calc.ts（= data/subsidies のルール）から計算する。
 * 葛飾区と東京都は列を分けて示し、合算しない。
 * 葛飾区の蓄電池は「対象経費の 1/4」なので、容量では決まらない。表には上限額を出し、その旨を注記する。
 *
 *   既定           … 表だけ（補助金のページの本文の中に置く）
 *   withExample   … 左に代表例の大きな数字、右に表（TOP などの広い区画に置く）
 */
const SOLAR_KW = [3, 4, 5, 6];
const BATTERY_KWH = [5, 7, 10];
const EXAMPLE = { solarKw: 5, batteryKwh: 7 };

const base = { area: "katsushika", housing: "existing", v2h: false, hems: false } as const;

interface Row {
  label: string;
  k?: LineResult;
  t?: LineResult;
}

function Cell({ line, tone }: { line?: LineResult; tone: "k" | "t" }) {
  const amount = line?.amount ?? null;
  return (
    <td className={`px-2 py-2.5 text-center whitespace-nowrap sm:px-4 ${tone === "t" ? "bg-green-50" : "bg-white"}`}>
      {line?.isCapOnly && <span className="mr-0.5 text-[12px] font-bold text-ink-2">上限</span>}
      <span className={`num-xl text-[17px] sm:text-[22px] ${tone === "t" ? "text-green-700" : "text-accent-text"}`}>{amount === null ? "—" : amount.toLocaleString("ja-JP")}</span>
      <span className="ml-0.5 text-[12px] font-bold text-ink-2">円</span>
    </td>
  );
}

function Group({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <>
      <tr>
        <th scope="colgroup" colSpan={3} className="bg-navy-900 px-3 py-1.5 text-left text-[13px] font-bold text-white">
          {title}
        </th>
      </tr>
      {rows.map((r, i) => (
        <tr key={r.label} className="border-t border-line">
          <th scope="row" className={`px-2 py-2.5 font-en text-[15px] font-bold whitespace-nowrap text-white sm:text-[16px] ${i % 2 ? "bg-green-700" : "bg-green-600"}`}>
            {r.label}
          </th>
          <Cell line={r.k} tone="k" />
          <Cell line={r.t} tone="t" />
        </tr>
      ))}
    </>
  );
}

function MatrixTable() {
  const solarRows: Row[] = SOLAR_KW.map((kw) => {
    const r = simulate({ ...base, solarKw: kw, batteryKwh: 0 });
    return { label: `${kw}kW`, k: r.areas[0].lines[0], t: r.areas[1].lines[0] };
  });
  const batteryRows: Row[] = BATTERY_KWH.map((kwh) => {
    const r = simulate({ ...base, solarKw: 0, batteryKwh: kwh });
    return { label: `${kwh}kWh`, k: r.areas[0].lines[0], t: r.areas[1].lines[0] };
  });
  return (
    <TableScroll label="容量別の想定助成額（既存住宅）" hintBelow="sm">
      <table className="w-full min-w-[21rem] border-collapse text-[14px] sm:text-[15px]">
        <caption className="sr-only">容量別の想定助成額（既存住宅・葛飾区と東京都。合算はしていません）</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[26%] bg-white px-2 py-3 text-[13px] font-bold text-ink-2">
              容量
            </th>
            <th scope="col" className="bg-orange-500 px-2 py-3 font-heading font-bold text-navy-900">
              葛飾区
            </th>
            <th scope="col" className="bg-green-600 px-2 py-3 font-heading font-bold text-white">
              東京都
            </th>
          </tr>
        </thead>
        <tbody>
          <Group title="太陽光発電（容量別）" rows={solarRows} />
          <Group title="蓄電池（容量別）" rows={batteryRows} />
        </tbody>
      </table>
    </TableScroll>
  );
}

function Note({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-[13px] leading-[1.8] text-ink-3">
        ※ {formatDateJa(siteConfig.subsidyInfoDate)}時点の公式情報による概算（既存住宅）。葛飾区の蓄電池は「助成対象経費の1/4」で決まるため、容量にかかわらず上限額を示しています。葛飾区と東京都は別の制度で、金額は合算していません（併用できますが、合計は助成対象経費が上限です）。
      </p>
      <SourceNote sources={subsidySources([katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram])} className="mt-1" />
    </div>
  );
}

export function SubsidyMatrix({ className = "", withExample = false }: { className?: string; withExample?: boolean }) {
  if (!withExample) {
    return (
      <div className={className}>
        <MatrixTable />
        <Note className="mt-3" />
      </div>
    );
  }

  const ex = simulate({ ...base, ...EXAMPLE });
  const [k, t] = ex.areas;
  return (
    <div className={`grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 ${className}`}>
      <div className="min-w-0 text-center lg:text-left" {...reveal(0, "left")}>
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
        <Note className="mt-4" />
      </div>
      <div className="min-w-0" {...reveal(120, "right")}>
        <MatrixTable />
      </div>
    </div>
  );
}
