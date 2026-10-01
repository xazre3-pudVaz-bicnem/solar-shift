"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NavGroup } from "@/lib/nav";

/**
 * スマホ用メニュー。開閉の状態管理だけを client で行う。
 * ヘッダーは backdrop-blur を使っているため、メニュー本体は header の外側に fixed で描画する。
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
        className="flex h-11 w-11 items-center justify-center border border-line text-navy-900"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {open ? (
            <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-white">
          <nav aria-label="モバイルナビゲーション" className="px-4 pt-2 pb-10 sm:px-6">
            <div className="grid grid-cols-2 gap-2 py-3">
              <Link href="/simulation" onClick={close} className="flex h-12 items-center justify-center border border-navy-900 text-[14px] font-bold text-navy-900">
                補助金を試算
              </Link>
              <Link href="/contact" onClick={close} className="flex h-12 items-center justify-center bg-navy-900 text-[14px] font-bold text-white">
                無料相談
              </Link>
            </div>
            {groups.map((g) => (
              <section key={g.label} className="border-t border-line py-4">
                <h2 className="mb-2 text-[12px] font-bold tracking-wide text-ink-3">
                  {g.href ? (
                    <Link href={g.href} onClick={close}>
                      {g.label}
                    </Link>
                  ) : (
                    g.label
                  )}
                </h2>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={close} className="flex items-center justify-between py-2.5 text-[15px] font-bold text-navy-900">
                        {l.label}
                        <svg className="h-3.5 w-3.5 text-line-2" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="m4.5 2.5 3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <section className="border-t border-line py-4">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-2">
                <li><Link href="/contact" onClick={close}>お問い合わせ</Link></li>
                <li><Link href="/privacy" onClick={close}>プライバシーポリシー</Link></li>
                <li><Link href="/editorial-policy" onClick={close}>編集方針</Link></li>
                <li><Link href="/sitemap" onClick={close}>サイトマップ</Link></li>
              </ul>
            </section>
          </nav>
        </div>
      )}
    </div>
  );
}
