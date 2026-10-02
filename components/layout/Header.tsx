import Link from "next/link";
import Image from "next/image";
import { headerNav } from "@/lib/nav";
import { MobileNav } from "@/components/layout/MobileNav";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { siteConfig } from "@/lib/site";

/**
 * ヘッダー。PCはCSSのみのドロップダウン（hover / focus-within）、スマホは MobileNav（client）。
 * ヒーローにはCTAを置かない方針のため、ここが最初の導線になる。
 * 注意: backdrop-filter を付けると内側の fixed メニュー（MobileNav）の包含ブロックが header になり、
 * メニューが表示されなくなる。背景は不透明の白にしておく。
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_2px_14px_-8px_rgba(11,31,58,0.35)]">
      <div className="mx-auto flex h-16 max-w-[84rem] items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={44} height={44} loading="eager" className="h-10 w-10 object-contain lg:h-11 lg:w-11" />
          <span className="flex flex-col leading-none">
            <span className="font-en text-[17px] font-extrabold tracking-[0.08em] text-navy-900">
              SOLAR <span className="text-orange-700">SHIFT</span>
            </span>
            <span className="mt-1 text-[10px] font-bold tracking-wide text-ink-3">葛飾区の太陽光発電・蓄電池</span>
          </span>
          <span className="sr-only">（ホームへ）</span>
        </Link>

        <nav aria-label="グローバルナビゲーション" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {headerNav.map((group) => (
              <li key={group.label} className="group relative">
                {group.href ? (
                  <Link href={group.href} className="flex h-[72px] items-center gap-1 px-3 font-heading text-[15px] font-bold text-navy-900 hover:text-accent-text">
                    {group.label}
                    <Chevron />
                  </Link>
                ) : (
                  <button type="button" className="flex h-[72px] items-center gap-1 px-3 font-heading text-[15px] font-bold text-navy-900 hover:text-accent-text" aria-haspopup="true">
                    {group.label}
                    <Chevron />
                  </button>
                )}
                <div className="invisible absolute top-[calc(100%-6px)] left-0 w-[20rem] translate-y-1 overflow-hidden rounded-2xl border-t-4 border-orange-500 bg-white opacity-0 shadow-pop transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <ul className="py-2">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="flex items-center gap-3 px-5 py-2.5 hover:bg-cream">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                          <span>
                            <span className="block text-[14px] font-bold text-navy-900">{l.label}</span>
                            {l.description && <span className="block text-[12px] leading-[1.5] text-ink-3">{l.description}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* 電話番号は、ナビとボタンの間に余白が残る幅（1344px 以上）でだけ出す */}
          {siteConfig.contact.telDisplay && (
            <a href={`tel:${siteConfig.contact.tel}`} className="mr-2 hidden flex-col items-end leading-none min-[1344px]:flex">
              <span className="text-[10px] font-bold tracking-wide text-ink-3">お電話でのご相談</span>
              <span className="mt-1.5 flex items-center gap-1.5 font-en text-[17px] font-extrabold tracking-[0.02em] text-navy-900">
                <PhoneIcon className="h-[15px] w-[15px] text-orange-600" />
                {siteConfig.contact.telDisplay}
              </span>
            </a>
          )}
          <Link
            href="/simulation"
            className="hidden h-11 items-center gap-1.5 rounded-full bg-green-600 px-5 font-heading text-[14px] font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-green-700 md:inline-flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" />
            </svg>
            補助金を試算
          </Link>
          <Link
            href="/contact"
            className="hidden h-11 items-center gap-1.5 rounded-full bg-cta px-5 font-heading text-[14px] font-bold text-white shadow-pill transition-transform duration-200 hover:-translate-y-0.5 hover:bg-cta-dark sm:inline-flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7h16v10H4zM4 7l8 6 8-6" />
            </svg>
            無料相談
          </Link>
          <MobileNav groups={headerNav} />
        </div>
      </div>
    </header>
  );
}

function Chevron() {
  return (
    <svg className="h-3.5 w-3.5 text-orange-600 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
