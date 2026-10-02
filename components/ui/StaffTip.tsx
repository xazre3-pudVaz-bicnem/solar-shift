import type { ReactNode } from "react";
import Image from "next/image";
import { images, type SiteImage } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * スタッフのイラスト＋ひとこと。本文の途中に「ここが大事」を差し込むための部品。
 * イラストは装飾扱い（alt 空）。枠の中身が本文。
 * tone は以前の配色指定の名残で、見た目には使っていない。
 */
export function StaffTip({
  title = "ここがポイント",
  children,
  image = images.poseIdea,
  side = "left",
  className = "",
}: {
  title?: string;
  children: ReactNode;
  image?: SiteImage;
  tone?: "green" | "orange";
  side?: "left" | "right";
  className?: string;
}) {
  const right = side === "right";
  return (
    <aside className={`flex items-end gap-3 sm:gap-5 ${right ? "flex-row-reverse" : ""} ${className}`} {...reveal()}>
      <Image src={image.src} alt="" width={image.width} height={image.height} sizes="112px" className="h-auto w-16 shrink-0 sm:w-24" />
      <div className="flex-1 rounded-md border border-l-4 border-line border-l-orange-500 bg-white px-4 py-3 sm:px-5 sm:py-4">
        <p className="mb-1 font-heading text-[13px] font-bold tracking-[0.08em] text-accent-text">{title}</p>
        <div className="text-base leading-[1.85] text-ink">{children}</div>
      </div>
    </aside>
  );
}
