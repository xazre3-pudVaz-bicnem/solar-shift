import { reveal, growDelay } from "@/lib/reveal";
import { formatDateJa } from "@/lib/seo";
import { katsushikaPublicSolar } from "@/data/katsushika-public-solar";

/**
 * 葛飾区の公共施設の太陽光発電：出力（kW）と、区が公表している年間の想定発電量（kWh/年）の図。
 *
 * - 棒の長さは、年間想定発電量に比例する（画面に入ったときに、左から伸びる）。
 * - limit を渡すと、出力の小さい順に、その件数だけを出す（住宅に近い規模の例を見せたいとき）。
 * - 区の公共施設の「想定」の値。住宅の発電量を示すものではないことを、図の中に書く。
 */
export function PublicSolarFigure({ limit, className = "" }: { limit?: number; className?: string }) {
  const { facilities, source, pageUpdatedAt } = katsushikaPublicSolar;
  const rows = limit ? facilities.slice(0, limit) : facilities;
  const max = Math.max(...rows.map((f) => f.yearlyKwh));
  return (
    <figure className={`rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8 ${className}`} {...reveal()}>
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">
        葛飾区の公共施設の太陽光発電<span className="ml-2 inline-block text-[13px] font-bold text-ink-2">出力と、年間の想定発電量</span>
      </figcaption>
      <ul className="mt-6 space-y-4">
        {rows.map((f, i) => (
          <li key={f.name} className="grid gap-1.5 sm:grid-cols-[15rem_1fr] sm:items-center sm:gap-4">
            <p className="text-[14px] leading-[1.5] font-bold text-navy-900">
              {f.name}
              <span className="ml-1.5 text-[12px] font-normal text-ink-2">
                {f.moduleKw}kW（{f.modules}）
              </span>
            </p>
            <div className="flex items-center gap-3">
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-white">
                <div className="grow-x h-full rounded-full bg-orange-500" style={{ width: `${Math.max(4, (f.yearlyKwh / max) * 100)}%`, ...growDelay(150 + i * 110) }} />
              </div>
              <p className="w-[7.5rem] shrink-0 text-right">
                <span className="font-en text-[18px] font-extrabold text-navy-900">{f.yearlyKwh.toLocaleString("ja-JP")}</span>
                <span className="ml-0.5 text-[12px] font-bold text-ink-2">kWh/年</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[12px] leading-[1.8] text-ink-2">
        ※ 区が公表している、公共施設の「想定」の発電量です（区のページの更新日：{formatDateJa(pageUpdatedAt)}）。住宅の発電量を示すものではありません。発電量は、屋根の向き・角度・影によって変わります。出典：
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
          {source.name}
        </a>
        （{formatDateJa(source.verifiedAt)} 確認）
      </p>
    </figure>
  );
}
