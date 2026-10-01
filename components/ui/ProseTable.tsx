import type { ReactNode } from "react";

/**
 * 本文（.prose-ss）の中に置く表。横にはみ出すときはこの枠の中でスクロールする。
 * - 枠にフォーカスを当てられるので、キーボードでも横スクロールできる。
 * - はみ出しているときだけ「横にスクロールできます」が出る（globals.css の .table-scroll::before）。
 * ガイドやサービスページで <table> を直接書かず、これを使う。Markdown の表は ArticleBody が同じ枠で包む。
 */
export function ProseTable({ children, label = "表" }: { children: ReactNode; label?: string }) {
  return (
    <div className="table-scroll" role="group" aria-label={label} tabIndex={0}>
      <table>{children}</table>
    </div>
  );
}
