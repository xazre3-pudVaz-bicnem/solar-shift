import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  size = "content",
}: {
  children: ReactNode;
  className?: string;
  size?: "content" | "prose" | "wide";
}) {
  const max = size === "prose" ? "max-w-(--container-prose)" : size === "wide" ? "max-w-[84rem]" : "max-w-(--container-content)";
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${max} ${className}`}>{children}</div>;
}
