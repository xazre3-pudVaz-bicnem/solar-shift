import Link from "next/link";
import Image from "next/image";
import { headerNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { MobileNav } from "@/components/layout/MobileNav";

/**
 * ヘッダー。PCはCSSのみのドロップダウン（hover / focus-within）、スマホは MobileNav（client）。
 * ヘッダーのCTAは「無料相談」。ヒーローにはCTAを置かない方針のため、ここが最初の導線になる。
 * 注意: backdrop-filter を付けると内側の fixed メニュー（MobileNav）の包含ブロックが header になり、
 * メニューが表示されなくなる。背景は不透明の白にしておく。
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[84rem] items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} ホーム`}>
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            priority
            className="h-10 w-10 object-contain lg:h-11 lg:w-11"
          />
          <span className="flex flex-col leading-none">
            <span className="font-en text-[17px] font-extrabold tracking-[0.08em] text-navy-900">
              SOLAR <span className="text-orange-500">SHIFT</span>
            </span>
            <span className="mt-1 text-[10px] font-bold tracking-wide text-ink-3">葛飾区の太陽光発電・蓄電池</span>
          </span>
        </Link>

        <nav aria-label="グローバルナビゲーション" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {headerNav.map((group) => (
              <li key={group.label} className="group relative">
                {group.href ? (
                  <Link
                    href={group.href}
                    className="flex h-[72px] items-center gap-1 px-3 text-[14px] font-bold text-navy-900 hover:text-accent-text"
                  >
                    {group.label}
                    <Chevron />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="flex h-[72px] items-center gap-1 px-3 text-[14px] font-bold text-navy-900 hover:text-accent-text"
                    aria-haspopup="true"
                  >
                    {group.label}
                    <Chevron />
                  </button>
                )}
                <div className="invisible absolute top-full left-0 w-[20rem] border border-line bg-white opacity-0 shadow-[0_12px_32px_-12px_rgba(11,31,58,0.25)] transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="py-2">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="block px-5 py-2.5 hover:bg-paper-2">
                          <span className="block text-[14px] font-bold text-navy-900">{l.label}</span>
                          {l.description && <span className="block text-[12px] text-ink-3">{l.description}</span>}
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
          <Link
            href="/simulation"
            className="hidden h-11 items-center border border-navy-900 px-4 text-[13px] font-bold text-navy-900 hover:bg-navy-50 md:inline-flex"
          >
            補助金を試算
          </Link>
          <Link
            href="/contact"
            className="hidden h-11 items-center bg-navy-900 px-5 text-[13px] font-bold text-white hover:bg-navy-700 sm:inline-flex"
          >
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
    <svg className="h-3.5 w-3.5 text-ink-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
