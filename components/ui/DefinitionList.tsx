import type { ReactNode } from "react";

export interface DefinitionRow {
  term: ReactNode;
  description: ReactNode;
}

/** 会社概要・仕様表などに使う dt/dd の表。 */
export function DefinitionList({ rows, className = "" }: { rows: DefinitionRow[]; className?: string }) {
  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {rows.map((r, i) => (
        <div key={i} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
          <dt className="text-[14px] font-bold text-ink-2">{r.term}</dt>
          <dd className="text-base leading-[1.8] text-ink">{r.description}</dd>
        </div>
      ))}
    </dl>
  );
}
