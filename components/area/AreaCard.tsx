import Link from "next/link";
import type { Area } from "@/data/areas";
import { Badge } from "@/components/ui/Badge";

const statusLabel: Record<Area["status"], string> = {
  primary: "主要対応エリア",
  secondary: "周辺対応エリア",
  planned: "対応検討中",
};

export function AreaCard({ area }: { area: Area }) {
  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[18px] font-bold text-navy-900">
          <span className="mr-1 text-[12px] font-normal text-ink-3">{area.prefecture}</span>
          {area.name}
        </h3>
        <Badge tone={area.status === "primary" ? "open" : area.status === "secondary" ? "navy" : "closed"}>
          {statusLabel[area.status]}
        </Badge>
      </div>
      <p className="mt-3 text-[14px] leading-[1.8] text-ink-2">{area.summary}</p>
      {area.page && <p className="mt-3 text-[13px] font-bold text-navy-600">エリアページを見る →</p>}
    </>
  );
  const cls = "block border border-line bg-white p-5";
  return area.page ? (
    <Link href={`/area/${area.slug}`} className={`${cls} hover:border-navy-900`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
