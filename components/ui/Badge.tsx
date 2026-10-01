import type { ReactNode } from "react";

type Tone = "open" | "closed" | "neutral" | "accent" | "navy";

const tones: Record<Tone, string> = {
  open: "bg-navy-900 text-white",
  closed: "bg-paper-3 text-ink-3 border border-line-2",
  neutral: "bg-paper-3 text-ink-2",
  accent: "bg-orange-50 text-accent-text border border-orange-100",
  navy: "bg-navy-50 text-navy-700",
};

export function Badge({ tone = "neutral", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-[2px] text-[12px] font-bold leading-[1.6] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
