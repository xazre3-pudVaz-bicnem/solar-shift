import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import type { Crumb } from "@/lib/schema";
import type { SiteImage } from "@/data/images";

/**
 * 下層ページの見出し領域。クリーム地にパンくず＋h1＋リード、下端は波形で白に切り替える。
 * image を渡すと右側（スマホでは下）に画像を添える。
 *   - 透過のイラスト（人物・アイコン・ポーズ）… そのまま置く（ゆっくり上下に動く）
 *   - 白背景のイラスト（蓄電池）… 白い角丸カードに入れる
 *   - 写真 … 角丸で切り抜く
 * h1 は LCP になり得るので、ここにはスクロールアニメーションを付けない。
 */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  image,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  image?: SiteImage;
}) {
  const isPhoto = image && !image.decorative;
  const isWhite = image?.white;
  return (
    <header className="relative overflow-hidden bg-cream">
      <span className="absolute top-10 right-[6%] hidden h-3 w-3 animate-twinkle rounded-full bg-orange-400 sm:block" aria-hidden="true" />
      <span className="absolute top-24 right-[32%] hidden h-2 w-2 animate-twinkle rounded-full bg-green-400 [animation-delay:1.4s] lg:block" aria-hidden="true" />
      <Container className="relative pt-5 pb-12 sm:pt-6 sm:pb-16">
        <Breadcrumb crumbs={crumbs} />
        <div className={`mt-6 sm:mt-8 ${image ? "grid items-center gap-8 lg:grid-cols-[1fr_18rem] lg:gap-14" : ""}`}>
          <div className="max-w-4xl">
            {eyebrow && (
              <p className="mb-5 flex">
                <span className="relative inline-block rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[14px] font-bold tracking-wide text-navy-900 shadow-sm after:absolute after:top-full after:left-7 after:border-x-[7px] after:border-t-[8px] after:border-x-transparent after:border-t-orange-500 after:content-['']">
                  {eyebrow}
                </span>
              </p>
            )}
            <h1 className="text-[28px] leading-[1.4] font-black text-navy-900 sm:text-[38px]">{title}</h1>
            {lead && <p className="mt-5 max-w-3xl text-[15px] leading-[1.9] text-ink-2 sm:text-base">{lead}</p>}
            {children}
          </div>
          {image && (
            <div
              className={`relative mx-auto w-44 lg:mx-0 lg:w-full ${
                isPhoto ? "w-full max-w-sm overflow-hidden rounded-3xl border-4 border-white shadow-pop" : isWhite ? "rounded-3xl bg-white p-4 shadow-card" : "animate-float-slow"
              }`}
            >
              <Image
                src={image.src}
                alt={image.decorative ? "" : image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 1023px) 384px, 288px"
                {...(isPhoto ? { preload: true, quality: 60 } : { loading: "eager" as const })}
                className={!isPhoto && !isWhite ? "mx-auto h-auto" : "h-auto w-full"}
                style={!isPhoto && !isWhite ? { width: `min(100%, ${((16 * image.width) / image.height).toFixed(2)}rem)` } : undefined}
              />
            </div>
          )}
        </div>
      </Container>
      <svg className="block h-6 w-full text-white sm:h-10" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 30c180 26 420 26 720 6s540-22 720 4v20H0z" />
      </svg>
    </header>
  );
}
