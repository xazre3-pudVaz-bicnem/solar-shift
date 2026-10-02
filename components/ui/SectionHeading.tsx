import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";

/**
 * セクション見出し。
 * eyebrow は「短い線＋小さな文字」のラベル（吹き出しや色つきのピルにはしない）。
 * color は以前の配色指定の名残で、見た目には使っていない（呼び出し側を変えずに済むよう残している）。
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Tag = "h2",
  tone = "light",
  className = "",
  animate = true,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  tone?: "light" | "dark";
  color?: "orange" | "green" | "cream" | "navy";
  className?: string;
  animate?: boolean;
  /** 見出しの id（section の aria-labelledby から参照する） */
  id?: string;
}) {
  const center = align === "center";
  const dark = tone === "dark";
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""} ${className}`} {...(animate ? reveal() : {})}>
      {eyebrow && (
        <p className={`mb-3 flex items-center gap-3 font-heading text-[13px] font-bold tracking-[0.14em] ${dark ? "text-orange-300" : "text-accent-text"} ${center ? "justify-center" : ""}`}>
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          {eyebrow}
          {center && <span className="h-px w-8 bg-current" aria-hidden="true" />}
        </p>
      )}
      <Tag id={id} className={`text-[26px] leading-[1.45] font-black sm:text-[34px] ${dark ? "text-white" : "text-navy-900"}`}>
        {title}
      </Tag>
      {lead && <p className={`mt-4 text-base leading-[1.9] ${dark ? "text-navy-100" : "text-ink-2"}`}>{lead}</p>}
    </div>
  );
}
