import { Container } from "@/components/ui/Container";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

/**
 * ページ下部の行動喚起。既定文言は持たず、ページごとに title / body を指定する。
 * 電話・LINE は siteConfig に値があるときだけ出す。
 */
export function CtaSection({
  title,
  body,
  primary = { href: "/contact", label: "無料相談・お見積もりを依頼する" },
  secondary = { href: "/simulation", label: "わが家の補助金を試算する" },
  tone = "navy",
}: {
  title: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
  tone?: "navy" | "light";
}) {
  const dark = tone === "navy";
  return (
    <section className={`${dark ? "bg-navy-900 text-white" : "border-y border-line bg-paper-2 text-navy-900"} py-16 sm:py-20`}>
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className={`mb-3 text-[13px] font-bold tracking-wide ${dark ? "text-orange-400" : "text-accent-text"}`}>
              ご相談・お見積もりは無料です
            </p>
            <h2 className={`text-[24px] leading-[1.4] font-bold sm:text-[30px] ${dark ? "text-white" : "text-navy-900"}`}>{title}</h2>
            <p className={`mt-4 text-[15px] leading-[1.9] ${dark ? "text-navy-100/85" : "text-ink-2"}`}>{body}</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <LinkButton href={primary.href} variant={dark ? "accent" : "primary"} size="lg" className="w-full sm:w-auto">
              {primary.label}
              <ArrowIcon />
            </LinkButton>
            {secondary && (
              <LinkButton href={secondary.href} variant={dark ? "white" : "secondary"} size="lg" className="w-full sm:w-auto">
                {secondary.label}
              </LinkButton>
            )}
            {siteConfig.contact.telDisplay && (
              <a href={`tel:${siteConfig.contact.tel}`} className={`mt-2 text-[14px] ${dark ? "text-white" : "text-navy-900"}`}>
                お電話：{siteConfig.contact.telDisplay}
                {siteConfig.contact.hours && <span className="ml-2 text-[12px] opacity-70">（{siteConfig.contact.hours}）</span>}
              </a>
            )}
            {siteConfig.contact.lineUrl && (
              <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener noreferrer" className={`text-[14px] underline underline-offset-4 ${dark ? "text-white" : "text-navy-900"}`}>
                LINEで相談する
              </a>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
