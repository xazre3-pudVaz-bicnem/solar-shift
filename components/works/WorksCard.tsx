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
    <article className="border border-line bg-white">
      <Link href={`/works/${work.slug}`} className="block">
        <ImagePlaceholder src={cover?.src} alt={cover?.alt ?? `${work.area}の施工事例`} ratio="4/3" label="施工写真準備中" />
        <div className="p-5">
          <p className="text-[12px] font-bold text-accent-text">{work.area}／{work.housingType}</p>
          <h3 className="mt-1 text-[16px] font-bold text-navy-900">{work.title}</h3>
          {specs.length > 0 && <p className="mt-2 text-[13px] text-ink-2">{specs.join("・")}</p>}
        </div>
      </Link>
    </article>
  );
}
