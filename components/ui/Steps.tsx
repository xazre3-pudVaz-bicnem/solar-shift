import type { ReactNode } from "react";

export interface Step {
  title: string;
  body: ReactNode;
  /** 期間・タイミングの補足（例：着工の4週間前まで） */
  meta?: string;
}

/** 番号付きの流れ。導入フロー・申請の流れに使う。 */
export function Steps({ steps, className = "" }: { steps: Step[]; className?: string }) {
  return (
    <ol className={`relative ${className}`}>
      {steps.map((s, i) => (
        <li key={i} className="relative grid grid-cols-[3rem_1fr] gap-4 pb-8 last:pb-0 sm:grid-cols-[4rem_1fr] sm:gap-6">
          {i < steps.length - 1 && (
            <span className="absolute top-12 bottom-0 left-6 w-px bg-line-2 sm:left-8" aria-hidden="true" />
          )}
          <span className="flex h-12 w-12 items-center justify-center bg-navy-900 text-[15px] font-bold text-white sm:h-16 sm:w-16 sm:text-lg">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="pt-1">
            <h3 className="text-[17px] font-bold text-navy-900 sm:text-lg">{s.title}</h3>
            {s.meta && <p className="mt-1 text-[13px] font-bold text-accent-text">{s.meta}</p>}
            <div className="mt-2 text-[15px] leading-[1.85] text-ink-2">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
