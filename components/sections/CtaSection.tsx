import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { images } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * ページ下部の行動喚起。クリーム地に白い角丸パネル、朱色と緑のピルボタン、スタッフのイラスト。
 * 既定文言は持たず、ページごとに title / body を指定する。
 * 電話・LINE は siteConfig に値があるときだけ出す。
 */
export function CtaSection({
  title,
  body,
  primary = { href: "/contact", label: "無料相談・お見積もりを依頼する" },
  secondary = { href: "/simulation", label: "わが家の補助金を試算する" },
}: {
  title: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
  /** 互換のために残している（現在は常にクリーム地） */
  tone?: "cream" | "navy" | "light";
}) {
  const img = images.poseFist;
  return (
    <section className="relative overflow-hidden bg-cream py-14 sm:py-20">
      <span className="absolute top-8 left-[8%] h-3 w-3 animate-twinkle rounded-full bg-orange-400" aria-hidden="true" />
      <span className="absolute right-[10%] bottom-10 h-4 w-4 animate-twinkle rounded-full bg-green-400 [animation-delay:1s]" aria-hidden="true" />
      <Container>
        <div className="relative rounded-[2rem] bg-white px-5 py-9 shadow-pop sm:px-12 sm:py-12" {...reveal(0, "zoom")}>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_11rem] lg:gap-10">
            <div>
              <p className="mb-4 flex">
                <span className="relative inline-block rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[14px] font-bold text-navy-900 after:absolute after:top-full after:left-7 after:border-x-[7px] after:border-t-[8px] after:border-x-transparent after:border-t-orange-500 after:content-['']">
                  ご相談・お見積もりは無料です
                </span>
              </p>
              <h2 className="text-[24px] leading-[1.45] font-black text-navy-900 sm:text-[30px]">{title}</h2>
              <p className="mt-4 text-[15px] leading-[1.9] text-ink-2">{body}</p>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <LinkButton href={primary.href} variant="accent" size="lg" className="shine w-full sm:w-auto">
                <span className="relative z-[2]">{primary.label}</span>
                <ArrowIcon className="relative z-[2] h-4 w-4" />
              </LinkButton>
              {secondary && (
                <LinkButton href={secondary.href} variant="green" size="lg" className="w-full sm:w-auto">
                  {secondary.label}
                  <ArrowIcon />
                </LinkButton>
              )}
              {siteConfig.contact.telDisplay && (
                <a
                  href={`tel:${siteConfig.contact.tel}`}
                  className="flex min-h-14 items-center justify-center gap-3 rounded-full border-2 border-navy-900 bg-white px-5 py-1.5 text-navy-900 transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-cream"
                >
                  <PhoneIcon className="h-5 w-5 shrink-0 text-orange-600" />
                  <span className="text-left leading-none">
                    <span className="block text-[11px] font-bold text-ink-2">
                      お電話でのご相談
                      {siteConfig.contact.hours && <span className="ml-1 font-normal">（{siteConfig.contact.hours}）</span>}
                    </span>
                    <span className="mt-1 block font-en text-[20px] font-extrabold tracking-[0.02em]">{siteConfig.contact.telDisplay}</span>
                  </span>
                </a>
              )}
              {siteConfig.contact.lineUrl && (
                <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener noreferrer" className="text-center text-[14px] font-bold text-green-700 underline underline-offset-4">
                  LINEで相談する
                </a>
              )}
            </div>
            <Image src={img.src} alt="" width={img.width} height={img.height} sizes="176px" className="mx-auto hidden h-auto w-36 animate-float-slow lg:block lg:w-full" />
          </div>
        </div>
      </Container>
    </section>
  );
}
