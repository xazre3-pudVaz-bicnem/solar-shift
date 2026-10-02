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

/** 手順のアイコン（線画）。TOP の流れの図でも使う */
export const STEP_ICONS: Record<StepIcon, ReactNode> = {
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
 * 番号付きの流れ。オレンジの丸アイコン＋「STEP.01」＋タイトル＋ベージュの説明ボックス。
 * li に直接 data-reveal を付ける（div で包むと ol > div > li になり無効なHTMLになる）。
 */
export function Steps({ steps, className = "" }: { steps: Step[]; className?: string }) {
  return (
    <ol className={`relative ${className}`}>
      {steps.map((s, i) => {
        const icon = s.icon ?? DEFAULT_ORDER[i % DEFAULT_ORDER.length];
        return (
          <li key={i} className="relative grid grid-cols-[4.5rem_1fr] gap-4 pb-8 last:pb-0 sm:grid-cols-[6rem_1fr] sm:gap-6" {...reveal(Math.min(i, 4) * 60)}>
            {i < steps.length - 1 && (
              <span className="absolute top-[5.75rem] bottom-1 left-[2.2rem] w-0 border-l-[3px] border-dotted border-orange-300 sm:top-[6.75rem] sm:left-[2.95rem]" aria-hidden="true" />
            )}
            <div className="flex flex-col items-center">
              <span className="font-en text-[12px] font-bold tracking-wide text-accent-text">STEP.{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-1 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-[0_8px_18px_-8px_rgba(219,117,18,0.8)] sm:h-20 sm:w-20">
                <svg className="h-8 w-8 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {STEP_ICONS[icon]}
                </svg>
              </span>
            </div>
            <div className="pt-5">
              <h3 className="text-[18px] font-black text-navy-900 sm:text-[21px]">{s.title}</h3>
              {s.meta && (
                <p className="mt-1.5">
                  <span className="inline-block rounded-md bg-green-600 px-2.5 py-[2px] text-[12px] font-bold text-white sm:text-[13px]">{s.meta}</span>
                </p>
              )}
              <div className="mt-3 rounded-2xl border-b-4 border-[#e2d9c8] bg-beige px-5 py-4 text-base leading-[1.85] text-ink-2">{s.body}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
