import Link from "next/link";
import type { Work } from "@/data/works";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export function WorksCard({ work }: { work: Work }) {
  const cover = work.images[0];
  const specs = [
    work.solarKw !== null ? `太陽光 ${work.solarKw}kW` : null,
    work.batteryKwh !== null ? `蓄電池 ${work.batteryKwh}kWh` : null,
    work.v2h ? "V2H" : null,
    work.hems ? "HEMS" : null,
  ].filter(Boolean);
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-card transition-transform duration-200 hover:-translate-y-1">
      <Link href={`/works/${work.slug}`} className="block">
        <ImagePlaceholder src={cover?.src} alt={cover?.alt ?? `${work.area}の施工事例`} ratio="4/3" label="施工写真準備中" frame={false} className="rounded-none" />
        <div className="p-5">
          <p>
            <span className="inline-block rounded-full bg-green-600 px-3 py-[2px] text-[12px] font-bold text-white">
              {work.area}／{work.housingType}
            </span>
          </p>
          <h3 className="mt-2 text-[17px] font-bold text-navy-900">{work.title}</h3>
          {specs.length > 0 && <p className="mt-2 text-[13px] font-bold text-accent-text">{specs.join("・")}</p>}
        </div>
      </Link>
    </article>
  );
}
