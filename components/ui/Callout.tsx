import type { ReactNode } from "react";

type Tone = "info" | "warn" | "important" | "note";

/** 本文中の注記。色面ではなく左の罫線で種類を示す（warn だけ薄いオレンジ地） */
const tones: Record<Tone, { box: string; title: string }> = {
  info: { box: "border-line border-l-navy-600 bg-paper-2", title: "text-navy-900" },
  warn: { box: "border-orange-200 border-l-orange-500 bg-orange-50", title: "text-accent-text" },
  important: { box: "border-line border-l-navy-900 bg-navy-50", title: "text-navy-900" },
  note: { box: "border-line border-l-line-2 bg-paper-2", title: "text-ink-2" },
};

export function Callout({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div className={`rounded-md border border-l-4 ${t.box} px-5 py-4 text-base leading-[1.85] ${className}`} role={tone === "warn" ? "note" : undefined}>
      {title && <p className={`mb-1 font-bold ${t.title}`}>{title}</p>}
      <div className="text-ink">{children}</div>
    </div>
  );
}
