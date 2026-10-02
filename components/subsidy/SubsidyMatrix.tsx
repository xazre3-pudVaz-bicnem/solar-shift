import { simulate, type LineResult } from "@/lib/subsidy-calc";
import { formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { TableScroll } from "@/components/ui/TableScroll";

/**
 * 「容量別の想定助成額」早見表（既存住宅）。
 * 数値はすべて lib/subsidy-calc.ts（= data/subsidies のルール）から計算する。
 * 葛飾区と東京都は列を分けて示し、合算しない。
 * 葛飾区の蓄電池は「対象経費の 1/4」なので、容量では決まらない。表には上限額を出し、その旨を注記する。
 */
const SOLAR_KW = [3, 4, 5, 6];
const BATTERY_KWH = [5, 7, 10];

const base = { area: "katsushika", housing: "existing", v2h: false, hems: false } as const;

interface Row {
  label: string;
  k?: LineResult;
  t?: LineResult;
}

function Cell({ line }: { line?: LineResult }) {
  const amount = line?.amount ?? null;
  return (
    <td className="border-t border-l border-line px-3 py-3 text-right whitespace-nowrap sm:px-5">
      {line?.isCapOnly && <span className="mr-1 text-[12px] font-bold text-ink-2">上限</span>}
      <span className="num-xl text-[18px] text-navy-900 sm:text-[21px]">{amount === null ? "—" : amount.toLocaleString("ja-JP")}</span>
      <span className="ml-0.5 text-[13px] font-bold text-ink-2">円</span>
    </td>
  );
}

function Group({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <>
      <tr>
        <th scope="colgroup" colSpan={3} className="border-t border-line bg-paper-2 px-3 py-2 text-left text-[14px] font-bold text-navy-900 sm:px-5">
          {title}
        </th>
      </tr>
      {rows.map((r) => (
        <tr key={r.label}>
          <th scope="row" className="border-t border-line px-3 py-3 text-left font-en text-[16px] font-bold whitespace-nowrap text-navy-900 sm:px-5">
            {r.label}
          </th>
          <Cell line={r.k} />
          <Cell line={r.t} />
        </tr>
      ))}
    </>
  );
}

export function SubsidyMatrix({ className = "" }: { className?: string }) {
  const solarRows: Row[] = SOLAR_KW.map((kw) => {
    const r = simulate({ ...base, solarKw: kw, batteryKwh: 0 });
    return { label: `${kw}kW`, k: r.areas[0].lines[0], t: r.areas[1].lines[0] };
  });
  const batteryRows: Row[] = BATTERY_KWH.map((kwh) => {
    const r = simulate({ ...base, solarKw: 0, batteryKwh: kwh });
    return { label: `${kwh}kWh`, k: r.areas[0].lines[0], t: r.areas[1].lines[0] };
  });

  return (
    <div className={className}>
      <TableScroll label="容量別の想定助成額（既存住宅）" hintBelow="sm">
        <table className="w-full min-w-[21rem] border-collapse bg-white text-base">
          <caption className="sr-only">容量別の想定助成額（既存住宅・葛飾区と東京都。合算はしていません）</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[24%] bg-navy-900 px-3 py-3 text-left text-[14px] font-bold text-white sm:px-5">
                容量
              </th>
              <th scope="col" className="border-l border-navy-700 bg-navy-900 px-3 py-3 text-right text-[14px] font-bold text-white sm:px-5">
                葛飾区
              </th>
              <th scope="col" className="border-l border-navy-700 bg-navy-900 px-3 py-3 text-right text-[14px] font-bold text-white sm:px-5">
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
      <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">
        ※ {formatDateJa(siteConfig.subsidyInfoDate)}時点の公式情報による概算（既存住宅）。葛飾区の蓄電池は「助成対象経費の1/4」で決まるため、容量にかかわらず上限額を示しています。葛飾区と東京都は別の制度で、金額は合算していません（併用できますが、合計は助成対象経費が上限です）。
      </p>
    </div>
  );
}
