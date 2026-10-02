import { Container } from "@/components/ui/Container";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { siteConfig } from "@/lib/site";
import { reveal } from "@/lib/reveal";

/**
 * ページ下部の行動喚起。ライトグレーの帯に、左に文章・右に操作（相談／試算／電話）を置く。
 * 既定文言は持たず、ページごとに title / body を指定する。
 * 電話・LINE は siteConfig に値があるときだけ出す。
 * 操作は最大3つ（相談・試算・電話）。これ以上は増やさない。
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
  /** 互換のために残している（見た目には使っていない） */
  tone?: "cream" | "navy" | "light";
}) {
  return (
    <section className="border-t border-line bg-paper-2 py-14 sm:py-20">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_22rem] lg:gap-16" {...reveal()}>
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-3 font-heading text-[13px] font-bold tracking-[0.14em] text-accent-text">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              ご相談・お見積もりは無料です
            </p>
            <h2 className="text-[24px] leading-[1.5] font-black text-navy-900 sm:text-[30px]">{title}</h2>
            <p className="mt-4 text-base leading-[1.9] text-ink-2">{body}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <LinkButton href={primary.href} variant="accent" size="lg" className="w-full">
              {primary.label}
              <ArrowIcon />
            </LinkButton>
            {secondary && (
              <LinkButton href={secondary.href} variant="primary" size="lg" className="w-full">
                {secondary.label}
                <ArrowIcon />
              </LinkButton>
            )}
            {siteConfig.contact.telDisplay && (
              <a
                href={`tel:${siteConfig.contact.tel}`}
                className="flex min-h-14 items-center justify-center gap-3 rounded-md border border-navy-900 bg-white px-5 py-1.5 text-navy-900 transition-colors duration-200 hover:bg-navy-50"
              >
                <PhoneIcon className="h-5 w-5 shrink-0 text-orange-600" />
                <span className="text-left leading-none">
                  <span className="block text-[12px] font-bold text-ink-2">
                    お電話でのご相談
                    {siteConfig.contact.hours && <span className="ml-1 font-normal">（{siteConfig.contact.hours}）</span>}
                  </span>
                  <span className="mt-1 block font-en text-[20px] font-extrabold tracking-[0.02em]">{siteConfig.contact.telDisplay}</span>
                </span>
              </a>
            )}
            {siteConfig.contact.lineUrl && (
              <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center text-[14px] font-bold text-navy-700 underline underline-offset-4">
                LINEで相談する
              </a>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
