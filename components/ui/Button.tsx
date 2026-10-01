import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "white";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-700",
  accent: "bg-orange-600 text-white hover:bg-orange-500",
  secondary: "border border-navy-900 text-navy-900 bg-white hover:bg-navy-50",
  ghost: "text-navy-900 hover:text-accent-text underline underline-offset-4 decoration-1",
  white: "bg-white text-navy-900 hover:bg-navy-50",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[14px]",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
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

export function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
