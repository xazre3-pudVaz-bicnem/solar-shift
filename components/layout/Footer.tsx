import Link from "next/link";
import Image from "next/image";
import { footerNav, legalNav } from "@/lib/nav";
import { siteConfig, contactEmail } from "@/lib/site";
import { secondaryAreas, primaryAreas, areasWithPage } from "@/data/areas";

/**
 * フッター。運営会社の名称・所在地・電話・メール・対応エリア（NAP）を、全ページで同じ表記で出す。
 * リンクの行は、スマホでは高さ 44px（押しやすい大きさ）、PC では詰めて並べる。
 */
const navLink = "flex min-h-11 items-center text-[14px] text-navy-100/80 hover:text-white md:inline-block md:min-h-0 md:py-[3px] md:text-[13px]";

export function Footer() {
  const year = new Date().getFullYear();
  const email = contactEmail();
  const a = siteConfig.company.address;
  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <Link href="/" className="inline-flex min-h-11 items-center gap-3" aria-label={`${siteConfig.name} ホーム`}>
              <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 bg-white object-contain p-[2px]" />
              <span className="font-en text-[18px] font-extrabold tracking-[0.08em] text-white">
                SOLAR <span className="text-orange-400">SHIFT</span>
              </span>
            </Link>
            <p className="mt-4 text-[14px] leading-[1.9] text-navy-100/80">
              {siteConfig.primaryArea.prefecture}{siteConfig.primaryArea.name}を中心に、住宅用太陽光発電・家庭用蓄電池・V2H・HEMSの導入と、補助金の活用をサポートするサービスです。
            </p>
            <dl className="mt-6 space-y-2.5 text-[14px] text-navy-100/85">
              <div className="flex gap-3">
                <dt className="w-[4.5rem] shrink-0 text-navy-100/70">運営会社</dt>
                <dd>
                  <Link href="/company" className="underline decoration-white/30 underline-offset-4 hover:text-white">{siteConfig.company.name}</Link>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-[4.5rem] shrink-0 text-navy-100/70">所在地</dt>
                <dd>
                  {a.postalCode && (
                    <>
                      〒{a.postalCode}
                      <br />
                    </>
                  )}
                  {a.full}
                </dd>
              </div>
              {siteConfig.contact.telDisplay && (
                <div className="flex gap-3">
                  <dt className="w-[4.5rem] shrink-0 text-navy-100/70">電話</dt>
                  <dd>
                    <a href={`tel:${siteConfig.contact.tel}`} className="-my-2 inline-flex min-h-11 items-center font-en text-[17px] font-bold tracking-[0.03em] text-white hover:text-orange-300">{siteConfig.contact.telDisplay}</a>
                    {siteConfig.contact.hours && <span className="ml-2">（営業時間 {siteConfig.contact.hours}）</span>}
                  </dd>
                </div>
              )}
              {email && (
                <div className="flex gap-3">
                  <dt className="w-[4.5rem] shrink-0 text-navy-100/70">メール</dt>
                  <dd>
                    <a href={`mailto:${email}`} className="-my-2 inline-flex min-h-11 items-center break-all underline decoration-white/30 underline-offset-4 hover:text-white">{email}</a>
                  </dd>
                </div>
              )}
              <div className="flex gap-3">
                <dt className="w-[4.5rem] shrink-0 text-navy-100/70">対応エリア</dt>
                <dd>
                  {primaryAreas.map((area) => (
                    <Link key={area.slug} href={`/area/${area.slug}`} className="underline decoration-white/30 underline-offset-4 hover:text-white">{area.name}</Link>
                  ))}
                  {secondaryAreas.length > 0 && (
                    <>
                      （周辺：
                      {secondaryAreas.map((area, i) => (
                        <span key={area.slug}>
                          {i > 0 && "・"}
                          {areasWithPage.some((a) => a.slug === area.slug) ? (
                            <Link href={`/area/${area.slug}`} className="underline decoration-white/30 underline-offset-4 hover:text-white">
                              {area.name}
                            </Link>
                          ) : (
                            area.name
                          )}
                        </span>
                      ))}
                      ）
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <nav aria-label="フッターナビゲーション" className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {footerNav.map((g) => (
              <div key={g.label}>
                <p className="mb-2 border-b border-white/15 pb-2 text-[13px] font-bold tracking-wide text-white">{g.label}</p>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={navLink}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-5 text-[13px] text-navy-100/70 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-5">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-white md:min-h-0 md:py-1">{l.label}</Link>
              </li>
            ))}
            <li>
              <a href={siteConfig.company.corporateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-white md:min-h-0 md:py-1">
                株式会社サイプレス コーポレートサイト
              </a>
            </li>
          </ul>
          <p>© {year} {siteConfig.company.name} / {siteConfig.name}</p>
        </div>
      </div>
    </footer>
  );
}
