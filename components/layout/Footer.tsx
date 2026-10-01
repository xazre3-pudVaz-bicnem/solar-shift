import Link from "next/link";
import Image from "next/image";
import { footerNav, legalNav } from "@/lib/nav";
import { siteConfig, contactEmail } from "@/lib/site";
import { secondaryAreas, primaryAreas } from "@/data/areas";

export function Footer() {
  const year = new Date().getFullYear();
  const email = contactEmail();
  return (
    <footer className="border-t border-line bg-navy-950 text-navy-100">
      <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label={`${siteConfig.name} ホーム`}>
              <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 bg-white object-contain p-[2px]" />
              <span className="font-en text-[18px] font-extrabold tracking-[0.08em] text-white">
                SOLAR <span className="text-orange-400">SHIFT</span>
              </span>
            </Link>
            <p className="mt-5 text-[14px] leading-[1.9] text-navy-100/80">
              {siteConfig.primaryArea.prefecture}{siteConfig.primaryArea.name}を中心に、住宅用太陽光発電・家庭用蓄電池・V2H・HEMSの導入と、補助金の活用をサポートするサービスです。
            </p>
            <dl className="mt-6 space-y-2 text-[13px] text-navy-100/80">
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-navy-100/50">運営</dt>
                <dd>
                  <Link href="/company" className="hover:text-white">{siteConfig.company.name}</Link>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-navy-100/50">所在地</dt>
                <dd>{siteConfig.company.address.full}</dd>
              </div>
              {email && (
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-navy-100/50">メール</dt>
                  <dd>
                    <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
                  </dd>
                </div>
              )}
              {siteConfig.contact.telDisplay && (
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-navy-100/50">電話</dt>
                  <dd>
                    <a href={`tel:${siteConfig.contact.tel}`} className="hover:text-white">{siteConfig.contact.telDisplay}</a>
                  </dd>
                </div>
              )}
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-navy-100/50">対応エリア</dt>
                <dd>
                  {primaryAreas.map((a) => (
                    <Link key={a.slug} href={`/area/${a.slug}`} className="hover:text-white">{a.name}</Link>
                  ))}
                  {secondaryAreas.length > 0 && <>（周辺：{secondaryAreas.map((a) => a.name).join("・")}）</>}
                </dd>
              </div>
            </dl>
          </div>

          <nav aria-label="フッターナビゲーション" className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerNav.map((g) => (
              <div key={g.label}>
                <h2 className="mb-3 text-[12px] font-bold tracking-wide text-white">{g.label}</h2>
                <ul className="space-y-2">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[13px] text-navy-100/75 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12px] text-navy-100/60 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
            <li>
              <a href={siteConfig.company.corporateUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
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
