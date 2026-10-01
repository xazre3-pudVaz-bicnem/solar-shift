import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "accent" | "green" | "secondary" | "ghost" | "white";
type Size = "md" | "lg" | "sm";

/**
 * ボタンは丸いピル型。
 * - accent（朱色 #d2450e）: 最重要CTA。白文字で 4.57:1。
 * - green（#14855d）: 試算など二番手のCTA。白文字で 4.62:1。
 * - primary（ネイビー）: 汎用。
 *
 * 高さは min-h で持つ。文言が長いボタン（15文字前後）は 320〜375px 幅の端末で1行に収まらないので、
 * 640px 未満では文節で折り返せるようにしている（nowrap 固定だと画面からはみ出す）。
 */
const base =
  "group inline-flex items-center justify-center gap-2 rounded-full text-center font-heading leading-[1.35] font-bold [word-break:auto-phrase] transition-[transform,background-color,box-shadow] duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 sm:whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-700 hover:-translate-y-0.5 shadow-card",
  accent: "bg-cta text-white hover:bg-cta-dark hover:-translate-y-0.5 shadow-pill",
  green: "bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5 shadow-card",
  secondary: "border-2 border-navy-900 text-navy-900 bg-white hover:bg-cream hover:-translate-y-0.5",
  ghost: "py-1 text-navy-900 hover:text-accent-text underline underline-offset-4 decoration-2 decoration-orange-400",
  white: "bg-white text-navy-900 hover:bg-cream hover:-translate-y-0.5 shadow-card",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-5 py-1.5 text-[14px]",
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
