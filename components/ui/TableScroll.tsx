import type { ReactNode } from "react";

/**
 * 横に長い表の入れ物。
 * - スマホでは表が画面からはみ出して横スクロールになるので、「横にスクロールできます」の一言を添える
 *   （これが無いと、右側の列があることに気づけない）。
 * - キーボードでも横スクロールできるよう、領域にフォーカスを当てられるようにしている。
 *
 * hintBelow … この幅より狭い画面でだけ案内を出す。表の min-width に合わせて選ぶ
 *             （min-w が 40rem 以上の表は "md"、それより狭い表は "sm"）。
 */
export function TableScroll({
  children,
  label,
  className = "",
  hintBelow = "md",
}: {
  children: ReactNode;
  /** 読み上げ用の表の名前（例：「葛飾区の助成額の一覧」） */
  label: string;
  className?: string;
  /** 以前の指定の名残（いまは常に枠線つき） */
  bordered?: boolean;
  hintBelow?: "sm" | "md";
}) {
  return (
    <div className={className}>
      <p className={`mb-1.5 flex items-center justify-end gap-1 text-[12px] font-bold text-ink-3 ${hintBelow === "sm" ? "sm:hidden" : "md:hidden"}`} aria-hidden="true">
        横にスクロールできます
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none">
          <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </p>
      <div role="group" aria-label={label} tabIndex={0} className="overflow-x-auto rounded-lg border border-line bg-white">
        {children}
      </div>
    </div>
  );
}
