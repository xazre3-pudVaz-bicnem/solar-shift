import type { ReactNode } from "react";

type Tone = "info" | "warn" | "important" | "note";

const tones: Record<Tone, { box: string; title: string }> = {
  info: { box: "border-navy-100 bg-navy-50", title: "text-navy-700" },
  warn: { box: "border-orange-100 bg-orange-50", title: "text-accent-text" },
  important: { box: "border-navy-900 bg-white", title: "text-navy-900" },
  note: { box: "border-line bg-paper-2", title: "text-ink-2" },
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
    <div className={`border-l-4 ${t.box} px-5 py-4 text-[15px] leading-[1.85] ${className}`} role={tone === "warn" ? "note" : undefined}>
      {title && <p className={`mb-1 font-bold ${t.title}`}>{title}</p>}
      <div className="text-ink">{children}</div>
    </div>
  );
}
