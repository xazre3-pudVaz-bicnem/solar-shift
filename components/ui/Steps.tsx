import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";

export type StepIcon = "mail" | "search" | "doc" | "calc" | "handshake" | "tools" | "support" | "check" | "home" | "stamp";

export interface Step {
  title: string;
  body: ReactNode;
  /** 期間・タイミングの補足（例：着工の4週間前まで） */
  meta?: string;
  icon?: StepIcon;
}

const ICONS: Record<StepIcon, ReactNode> = {
  mail: <path d="M4 7h16v10H4zM4 7l8 6 8-6" />,
  search: <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.5-4.5" />,
  doc: <path d="M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h5M9.5 15.5h5" />,
  calc: <path d="M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 14.5h2M13 14.5h2M9 18h6" />,
  handshake: <path d="M3 9h4l4-2 4 2h6M3 9v7h3l5 4 6-4h4V9M11 7l-3 4c1 1.5 2.5 1.5 4 0l1-1 5 5" />,
  tools: <path d="M14.5 6.5a3.5 3.5 0 0 0 4 4l-9 9-3-3 9-9zM5 19l-1 1M15 3l6 6" />,
  support: <path d="M5 13v-2a7 7 0 0 1 14 0v2M5 13a2 2 0 0 0 2 2h1v-5H7a2 2 0 0 0-2 2zM19 13a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2zM17 15v1a3 3 0 0 1-3 3h-2" />,
  check: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12l2.5 2.5 4.5-5" />,
  home: <path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-6h4v6" />,
  stamp: <path d="M9 3h6v5l2 4H7l2-4zM5 16h14v3H5zM7 12v4M17 12v4" />,
};

const DEFAULT_ORDER: StepIcon[] = ["mail", "search", "calc", "doc", "handshake", "tools", "check", "support"];

/**
 * 番号付きの流れ（縦の時系列）。左にネイビーの丸（アイコン）と縦線、右に「STEP 01」・見出し・説明。
 * 説明は箱に入れず、そのまま本文として置く。
 * li に直接 data-reveal を付ける（div で包むと ol > div > li になり無効なHTMLになる）。
 */
export function Steps({ steps, className = "" }: { steps: Step[]; className?: string }) {
  return (
    <ol className={`relative ${className}`}>
      {steps.map((s, i) => {
        const icon = s.icon ?? DEFAULT_ORDER[i % DEFAULT_ORDER.length];
        return (
          <li key={i} className="relative grid grid-cols-[3rem_1fr] gap-4 pb-9 last:pb-0 sm:grid-cols-[3.5rem_1fr] sm:gap-6" {...reveal(Math.min(i, 4) * 50)}>
            {i < steps.length - 1 && <span className="absolute top-12 bottom-0 left-6 w-px bg-line-2 sm:top-14 sm:left-7" aria-hidden="true" />}
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-white sm:h-14 sm:w-14">
              <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[icon]}
              </svg>
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-en text-[12px] font-bold tracking-[0.12em] text-accent-text">STEP {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-0.5 text-[18px] leading-[1.5] font-black text-navy-900 sm:text-[20px]">{s.title}</h3>
              {s.meta && (
                <p className="mt-1.5">
                  <span className="inline-block rounded-sm border border-navy-200 bg-navy-50 px-2 py-[1px] text-[13px] font-bold text-navy-900">{s.meta}</span>
                </p>
              )}
              <div className="mt-2.5 text-base leading-[1.85] text-ink-2">{s.body}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
