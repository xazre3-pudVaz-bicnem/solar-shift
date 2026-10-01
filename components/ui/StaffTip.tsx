import type { ReactNode } from "react";
import Image from "next/image";
import { images, type SiteImage } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * スタッフのイラスト＋吹き出し。本文の途中に「ここが大事」を差し込むための部品。
 * イラストは装飾扱い（alt 空）。吹き出しの中身が本文。
 */
export function StaffTip({
  title = "ここがポイント",
  children,
  image = images.poseIdea,
  tone = "green",
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
  const border = tone === "green" ? "border-green-500" : "border-orange-500";
  const label = tone === "green" ? "bg-green-600 text-white" : "bg-orange-500 text-navy-900";
  const right = side === "right";
  return (
    <aside className={`flex items-end gap-3 sm:gap-5 ${right ? "flex-row-reverse" : ""} ${className}`} {...reveal(0, right ? "right" : "left")}>
      <Image
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        sizes="128px"
        className="h-auto w-20 shrink-0 sm:w-28"
      />
      <div className={`relative flex-1 rounded-2xl border-2 bg-white px-4 py-3 shadow-card sm:px-5 sm:py-4 ${border}`}>
        {/* 吹き出しのしっぽ */}
        <span
          className={`absolute bottom-6 h-4 w-4 rotate-45 border-2 bg-white ${border} ${
            right ? "-right-[9px] border-b-0 border-l-0" : "-left-[9px] border-t-0 border-r-0"
          }`}
          aria-hidden="true"
        />
        <p className="mb-1">
          <span className={`inline-block rounded-full px-3 py-[2px] text-[12px] font-bold ${label}`}>{title}</span>
        </p>
        <div className="text-[14px] leading-[1.85] text-ink sm:text-[15px]">{children}</div>
      </div>
    </aside>
  );
}
