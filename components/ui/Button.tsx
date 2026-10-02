import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "accent" | "green" | "secondary" | "ghost" | "white";
type Size = "md" | "lg" | "sm";

/**
 * ボタン。角は小さめ（住宅設備の会社らしい、落ち着いた直線的な形）。
 * - accent（ソーラーオレンジ地にネイビーの文字・7.5:1）: いちばん押してほしい操作。1画面に1つまで。
 * - primary / green（ネイビー地に白文字）: 二番手の操作（試算など）。green は旧名で、見た目は primary と同じ。
 * - secondary（白地にネイビーの枠）: 三番手。
 *
 * 高さは min-h で持つ。文言が長いボタン（15文字前後）は 320〜375px 幅の端末で1行に収まらないので、
 * 640px 未満では文節で折り返せるようにしている（nowrap 固定だと画面からはみ出す）。
 * どのサイズも高さ 44px 以上（スマホで押しやすい大きさ）。
 */
const base =
  "group inline-flex items-center justify-center gap-2 rounded-md text-center font-heading leading-[1.35] font-bold [word-break:auto-phrase] transition-[background-color,border-color,color] duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 sm:whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-700",
  accent: "bg-orange-500 text-navy-950 hover:bg-orange-400",
  green: "bg-navy-900 text-white hover:bg-navy-700",
  secondary: "border border-navy-900 bg-white text-navy-900 hover:bg-navy-50",
  ghost: "min-h-11 text-navy-900 underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text",
  white: "bg-white text-navy-900 hover:bg-navy-50",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-5 py-1.5 text-[14px]",
  md: "min-h-12 px-6 py-2 text-[15px] sm:px-7",
  lg: "min-h-14 px-4 py-2 text-[15px] min-[400px]:px-7 min-[400px]:text-[16px] sm:px-9 sm:text-[17px]",
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
}) {
  const cls = `${base} ${variants[variant]} ${variant === "ghost" ? "" : sizes[size]} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** 矢印。親に group が付いていればホバーで少し右へ動く */
export function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0 transition-transform duration-200 group-hover:translate-x-1`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
