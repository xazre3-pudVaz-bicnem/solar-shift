import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import type { Crumb } from "@/lib/schema";
import type { SiteImage } from "@/data/images";

/**
 * 下層ページの見出し領域。ライトグレーの地にパンくず＋h1＋リード。下端は罫線で区切る。
 * image を渡すと右側（スマホでは下）に画像を添える。
 *   - 写真 … 小さめの角丸で切り抜く（最初の画面に入るので先読みする）
 *   - イラスト（人物・アイコン・ポーズ）… そのまま置く。白背景のものは白い枠に入れる
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
    <header className="border-b border-line bg-paper-2">
      <Container className="pt-2 pb-10 sm:pt-3 sm:pb-14">
        <Breadcrumb crumbs={crumbs} />
        <div className={`mt-4 sm:mt-6 ${image ? "grid items-center gap-8 lg:grid-cols-[1fr_18rem] lg:gap-14" : ""}`}>
          <div className="max-w-4xl">
            {eyebrow && (
              <p className="mb-3 flex items-center gap-3 font-heading text-[13px] font-bold tracking-[0.14em] text-accent-text">
                <span className="h-px w-8 bg-current" aria-hidden="true" />
                {eyebrow}
              </p>
            )}
            <h1 className="text-[28px] leading-[1.45] font-black text-navy-900 sm:text-[38px]">{title}</h1>
            {lead && <p className="mt-5 max-w-3xl text-base leading-[1.9] text-ink-2">{lead}</p>}
            {children}
          </div>
          {image && (
            <div
              className={`relative mx-auto w-40 lg:mx-0 lg:w-full ${
                isPhoto ? "w-full max-w-sm overflow-hidden rounded-xl" : isWhite ? "rounded-xl border border-line bg-white p-4" : ""
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
                style={!isPhoto && !isWhite ? { width: `min(100%, ${((14 * image.width) / image.height).toFixed(2)}rem)` } : undefined}
              />
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
