import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import type { Crumb } from "@/lib/schema";
import type { SiteImage } from "@/data/images";

/**
 * 下層ページの見出し領域。パンくず＋h1＋リード。
 * image を渡すと PC では右側にイラスト（人物など）を添える。モバイルでは本文の下に小さく出す。
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
  return (
    <header className="border-b border-line bg-paper-2">
      <Container className="pt-5 pb-10 sm:pt-6 sm:pb-14">
        <Breadcrumb crumbs={crumbs} />
        <div className={`mt-6 sm:mt-8 ${image ? "grid items-end gap-8 lg:grid-cols-[1fr_20rem] lg:gap-14" : ""}`}>
          <div className="max-w-4xl">
            {eyebrow && <p className="mb-3 text-[13px] font-bold tracking-wide text-accent-text">{eyebrow}</p>}
            <h1 className="text-[28px] leading-[1.35] font-bold text-navy-900 sm:text-[38px]">{title}</h1>
            {lead && <p className="mt-5 max-w-3xl text-[15px] leading-[1.9] text-ink-2 sm:text-base">{lead}</p>}
            {children}
          </div>
          {image && (
            <div className="relative mx-auto w-56 lg:mx-0 lg:w-full" aria-hidden={image.decorative ? "true" : undefined}>
              <Image
                src={image.src}
                alt={image.decorative ? "" : image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 1024px) 224px, 320px"
                className="h-auto w-full"
              />
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
