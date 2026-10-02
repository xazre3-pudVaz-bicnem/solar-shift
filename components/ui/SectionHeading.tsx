import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";

/**
 * セクション見出し。eyebrow は吹き出し型のピル（下に小さな三角）。
 * 明るいオレンジのピルにはネイビーの文字を載せる（白文字だとコントラストが足りない）。
 */
const PILL = {
  orange: "bg-orange-500 text-navy-900 after:border-t-orange-500",
  green: "bg-green-600 text-white after:border-t-green-600",
  cream: "bg-cream text-navy-900 after:border-t-cream",
  navy: "bg-navy-900 text-white after:border-t-navy-900",
} as const;

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Tag = "h2",
  tone = "light",
  color = "orange",
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
  color?: keyof typeof PILL;
  className?: string;
  animate?: boolean;
  /** 見出しの id（section の aria-labelledby から参照する） */
  id?: string;
}) {
  const center = align === "center";
  const titleColor = tone === "dark" ? "text-white" : "text-navy-900";
  const leadColor = tone === "dark" ? "text-navy-100" : "text-ink-2";
  const pill = PILL[tone === "dark" && color === "orange" ? "cream" : color];
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""} ${className}`} {...(animate ? reveal() : {})}>
      {eyebrow && (
        <p className={`mb-5 ${center ? "flex justify-center" : "flex"}`}>
          <span
            className={`relative inline-block rounded-full px-5 py-1.5 font-heading text-[14px] font-bold tracking-wide shadow-sm after:absolute after:top-full after:border-x-[7px] after:border-t-[8px] after:border-x-transparent after:content-[''] ${
              center ? "after:left-1/2 after:-translate-x-1/2" : "after:left-7"
            } ${pill}`}
          >
            {eyebrow}
          </span>
        </p>
      )}
      <Tag id={id} className={`text-[26px] leading-[1.4] font-black sm:text-[34px] ${titleColor}`}>{title}</Tag>
      {lead && <p className={`mt-4 text-base leading-[1.9] sm:text-base ${leadColor}`}>{lead}</p>}
    </div>
  );
}
