"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NavGroup } from "@/lib/nav";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { siteConfig } from "@/lib/site";

/**
 * スマホ用メニュー。PC のメガメニューをそのまま並べず、分類ごとに開閉するアコーディオンにしている
 * （開閉は <details>。ブラウザの機能なので、ここで状態を持たない）。
 * 開閉の状態管理はメニュー全体の表示だけを client で行う。リンクのクリックで閉じる。
 * 行の高さはどれも 44px 以上。
 */
export function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        className="flex h-11 w-11 items-center justify-center rounded-md border border-navy-900 text-navy-900"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {open ? (
            <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-line bg-white">
          <nav aria-label="モバイルナビゲーション" className="px-4 pt-4 pb-24 sm:px-6">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/simulation" onClick={close} className="flex h-12 items-center justify-center rounded-md bg-navy-900 font-heading text-[15px] font-bold text-white">
                補助金を試算
              </Link>
              <Link href="/contact" onClick={close} className="flex h-12 items-center justify-center rounded-md bg-orange-500 font-heading text-[15px] font-bold text-navy-950">
                無料相談
              </Link>
            </div>
            {siteConfig.contact.telDisplay && (
              <a
                href={`tel:${siteConfig.contact.tel}`}
                className="mt-2 flex h-12 items-center justify-center gap-2 rounded-md border border-navy-900 bg-white font-heading text-[14px] font-bold text-navy-900"
              >
                <PhoneIcon className="h-4 w-4 shrink-0 text-orange-600" />
                電話で相談
                <span className="font-en text-[17px] font-extrabold tracking-[0.02em]">{siteConfig.contact.telDisplay}</span>
              </a>
            )}

            <div className="mt-5 border-t border-line">
              {groups.map((g) => (
                <details key={g.label} name="mobile-nav-group" className="group border-b border-line">
                  <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-3 font-heading text-[16px] font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
                    {g.label}
                    <svg className="h-4 w-4 shrink-0 text-accent-text transition-transform duration-200 group-open:rotate-180" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <ul className="pb-3">
                    {g.href && (
                      <li>
                        <Link href={g.href} onClick={close} className="flex min-h-11 items-center pl-3 text-base font-bold text-navy-700">
                          {g.label}のトップ
                        </Link>
                      </li>
                    )}
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={close} className="flex min-h-11 items-center pl-3 text-base text-ink">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-x-4 text-[14px] text-ink-2">
              <li><Link href="/contact" onClick={close} className="flex min-h-11 items-center">お問い合わせ</Link></li>
              <li><Link href="/faq" onClick={close} className="flex min-h-11 items-center">よくある質問</Link></li>
              <li><Link href="/privacy" onClick={close} className="flex min-h-11 items-center">プライバシーポリシー</Link></li>
              <li><Link href="/editorial-policy" onClick={close} className="flex min-h-11 items-center">編集方針</Link></li>
              <li><Link href="/sitemap" onClick={close} className="flex min-h-11 items-center">サイトマップ</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
