import Image from "next/image";

/**
 * 画像差し替え用コンポーネント。
 * src があれば next/image で描画し、なければ「画像準備中」のプレースホルダーを同じ比率で出す。
 * - fit="cover"（既定）: 写真向け。枠いっぱいにトリミング。
 * - fit="contain": アイコン・イラスト向け。余白を残して全体を表示（背景は白）。
 * 人物のダミー写真は使わない（施主提供のイラストのみ）。
 */
export function ImagePlaceholder({
  src,
  alt,
  label = "画像準備中",
  ratio = "4/3",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className = "",
  fill = true,
  fit = "cover",
  frame = true,
}: {
  src?: string | null;
  alt: string;
  label?: string;
  ratio?: "4/3" | "3/2" | "16/9" | "1/1" | "21/9";
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  fit?: "cover" | "contain";
  frame?: boolean;
}) {
  const ratioCls = {
    "4/3": "aspect-[4/3]",
    "3/2": "aspect-[3/2]",
    "16/9": "aspect-video",
    "1/1": "aspect-square",
    "21/9": "aspect-[21/9]",
  }[ratio];

  if (src) {
    const bg = fit === "contain" ? "bg-white" : "bg-paper-3";
    const border = frame ? "border border-line" : "";
    return (
      <div className={`relative overflow-hidden ${bg} ${border} ${ratioCls} ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes}
          priority={priority}
          className={fit === "contain" ? "object-contain p-3" : "object-cover"}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-line bg-paper-3 ${ratioCls} ${className}`}
      role="img"
      aria-label={alt}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 14px, rgba(15,23,42,0.04) 14px 15px)",
        }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <svg className="h-7 w-7 text-ink-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="m3 16 5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="16" cy="9" r="1.5" fill="currentColor" />
        </svg>
        <span className="text-[12px] font-bold tracking-wide text-ink-3">{label}</span>
      </div>
    </div>
  );
}
