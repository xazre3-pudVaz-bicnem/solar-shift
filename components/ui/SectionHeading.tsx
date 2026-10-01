import type { ReactNode } from "react";

/**
 * セクション見出し。eyebrow（小さな見出しラベル）＋ h2 ＋ リード文。
 * 英語ラベルは使わず、日本語で意味の通るラベルにする。
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Tag = "h2",
  tone = "light",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  tone?: "light" | "dark";
  className?: string;
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "";
  const titleColor = tone === "dark" ? "text-white" : "text-navy-900";
  const leadColor = tone === "dark" ? "text-navy-100/90" : "text-ink-2";
  const eyebrowColor = tone === "dark" ? "text-orange-400" : "text-accent-text";
  return (
    <div className={`max-w-3xl ${alignCls} ${className}`}>
      {eyebrow && (
        <p className={`mb-3 text-[13px] font-bold tracking-wide ${eyebrowColor}`}>
          <span className="mr-2 inline-block h-[2px] w-5 translate-y-[-3px] bg-current align-middle" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <Tag className={`text-[26px] leading-[1.35] font-bold sm:text-[32px] ${titleColor}`}>{title}</Tag>
      {lead && <p className={`mt-4 text-[15px] leading-[1.9] sm:text-base ${leadColor}`}>{lead}</p>}
    </div>
  );
}
