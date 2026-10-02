import Image from "next/image";
import { images, type SiteImage } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * 回収年数の式の図。「実質の負担額 ÷ 1年あたりの効果額 ＝ 回収年数」を、3つの箱で見せる。
 * 箱は左から順に現れ、あいだの記号（÷・＝）は少し遅れてポンと出る。
 */
function Box({ image, title, sub, tone, delay }: { image: SiteImage; title: string; sub: string; tone: "white" | "orange"; delay: number }) {
  return (
    <li
      className={`flex flex-1 items-center gap-3 rounded-2xl px-4 py-4 sm:flex-col sm:gap-2 sm:px-3 sm:py-5 sm:text-center ${
        tone === "orange" ? "bg-orange-500 text-navy-900 shadow-[0_10px_22px_-12px_rgba(219,117,18,0.9)]" : "border-2 border-[#e9dfcd] bg-white text-navy-900"
      }`}
      {...reveal(delay, "pop")}
    >
      <Image src={image.src} alt="" width={image.width} height={image.height} sizes="72px" className={`h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16 ${tone === "orange" ? "rounded-full bg-white p-1.5" : ""}`} />
      <span>
        <span className="block text-[17px] leading-[1.4] font-black sm:text-[16px] sm:whitespace-nowrap">{title}</span>
        <span className={`phrase mt-0.5 block text-[13px] leading-[1.6] font-bold ${tone === "orange" ? "text-navy-900" : "text-ink-2"}`}>{sub}</span>
      </span>
    </li>
  );
}

function Sign({ children, delay }: { children: string; delay: number }) {
  return (
    <li className="flex items-center justify-center sm:w-10 sm:shrink-0" aria-hidden="true" {...reveal(delay, "pop")}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 font-en text-[20px] leading-none font-extrabold text-white">{children}</span>
    </li>
  );
}

export function PaybackFormulaFigure({ className = "" }: { className?: string }) {
  return (
    <figure className={`rounded-3xl bg-cream px-4 py-6 sm:px-6 sm:py-8 ${className}`}>
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">回収年数の式</figcaption>
      <ol className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-1" aria-label="実質の負担額を、1年あたりの効果額で割ると、回収年数になります">
        <Box image={images.iconGHouseYenLeaf} title="実質の負担額" sub="設置費用 − 補助金" tone="white" delay={0} />
        <Sign delay={220}>÷</Sign>
        <Box image={images.iconGBillDown} title="1年あたりの効果額" sub="買わずに済んだ電気代 ＋ 売電の収入" tone="white" delay={160} />
        <Sign delay={380}>＝</Sign>
        <Box image={images.iconGSunPanelLeaf} title="回収年数" sub="効果額の累計が、負担額を上回る年" tone="orange" delay={320} />
      </ol>
    </figure>
  );
}
