"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NavGroup } from "@/lib/nav";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { siteConfig } from "@/lib/site";

/**
 * スマホ用メニュー。開閉の状態管理だけを client で行う。
 * リンクのクリックで閉じる（pathname 監視で setState しない）。
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
        className="flex h-11 w-11 flex-col items-center justify-center gap-[3px] rounded-full bg-navy-900 text-white"
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
        <div id="mobile-nav" className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-cream">
          <nav aria-label="モバイルナビゲーション" className="px-4 pt-3 pb-24 sm:px-6">
            <div className="grid grid-cols-2 gap-2 py-2">
              <Link href="/simulation" onClick={close} className="flex h-12 items-center justify-center rounded-full bg-green-600 font-heading text-[15px] font-bold text-white">
                補助金を試算
              </Link>
              <Link href="/contact" onClick={close} className="flex h-12 items-center justify-center rounded-full bg-cta font-heading text-[15px] font-bold text-white">
                無料相談
              </Link>
            </div>
            {siteConfig.contact.telDisplay && (
              <a
                href={`tel:${siteConfig.contact.tel}`}
                className="mb-1 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-navy-900 bg-white font-heading text-[14px] font-bold text-navy-900"
              >
                <PhoneIcon className="h-4 w-4 shrink-0 text-orange-600" />
                電話で相談
                <span className="font-en text-[17px] font-extrabold tracking-[0.02em]">{siteConfig.contact.telDisplay}</span>
              </a>
            )}
            {groups.map((g) => (
              <section key={g.label} className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-card">
                <h2 className="mb-1 flex items-center gap-2 text-[13px] font-bold text-accent-text">
                  <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
                  {g.href ? (
                    <Link href={g.href} onClick={close}>
                      {g.label}
                    </Link>
                  ) : (
                    g.label
                  )}
                </h2>
                <ul className="divide-y divide-dashed divide-line">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={close} className="flex items-center justify-between py-2.5 text-[15px] font-bold text-navy-900">
                        {l.label}
                        <svg className="h-3.5 w-3.5 text-orange-600" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="m4.5 2.5 3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 px-1 text-[13px] text-ink-2">
              <li><Link href="/contact" onClick={close}>お問い合わせ</Link></li>
              <li><Link href="/privacy" onClick={close}>プライバシーポリシー</Link></li>
              <li><Link href="/editorial-policy" onClick={close}>編集方針</Link></li>
              <li><Link href="/sitemap" onClick={close}>サイトマップ</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
