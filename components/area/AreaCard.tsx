import Link from "next/link";
import type { Area } from "@/data/areas";
import { Badge } from "@/components/ui/Badge";

const statusLabel: Record<Area["status"], string> = {
  primary: "主要対応エリア",
  secondary: "周辺対応エリア",
  planned: "対応検討中",
};

function Pin({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function AreaCard({ area }: { area: Area }) {
  const primary = area.status === "primary";
  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[20px] font-black text-navy-900">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${primary ? "bg-orange-500 text-navy-900" : area.status === "secondary" ? "bg-navy-100 text-navy-700" : "bg-paper-3 text-ink-3"}`}>
            <Pin className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[11px] leading-none font-normal text-ink-3">{area.prefecture}</span>
            {area.name}
          </span>
        </h3>
        <Badge tone={primary ? "open" : area.status === "secondary" ? "green" : "closed"}>{statusLabel[area.status]}</Badge>
      </div>
      <p className="mt-3 text-[15px] leading-[1.8] text-ink-2">{area.summary}</p>
      {area.page && <p className="mt-3 font-heading text-[14px] font-bold text-navy-600">エリアページを見る →</p>}
    </>
  );
  const cls = `block h-full rounded-lg bg-white p-5 border border-line ${primary ? "border-[3px] border-orange-400" : "border border-line"}`;
  return area.page ? (
    <Link href={`/area/${area.slug}`} className={`${cls} duration-200 hover:bg-paper-2 transition-colors`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
