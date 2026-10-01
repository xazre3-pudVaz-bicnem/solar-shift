import type { ReactNode } from "react";

type Tone = "open" | "closed" | "neutral" | "accent" | "navy" | "green";

const tones: Record<Tone, string> = {
  open: "bg-green-600 text-white",
  closed: "bg-paper-3 text-ink-3 border border-line-2",
  neutral: "bg-paper-3 text-ink-2",
  accent: "bg-orange-50 text-accent-text border border-orange-100",
  navy: "bg-navy-50 text-navy-700",
  green: "bg-green-50 text-green-700 border border-green-100",
};

export function Badge({ tone = "neutral", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-[2px] text-[12px] font-bold leading-[1.6] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
