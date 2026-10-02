"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { OPEN_CHAT_EVENT } from "@/components/chat/OpenChatButton";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { siteConfig } from "@/lib/site";

/**
 * 画面に固定して出す案内（チャットの入口・無料相談・補助金の試算）。
 *
 *   スマホ   … 画面下の固定バー（チャット／補助金を試算／電話する／無料相談）。
 *             電話は lib/site.ts に番号が入っているときだけ出る。4つ並ぶときはアイコンの下に文字を置く
 *   PC      … 右下にチャットの入口。幅 1536px 以上では、その上に補助金の案内カードも出す
 *             （それより狭い画面でカードを出すと、本文の右端の列に重なって読めなくなるため）
 *
 * - TOP のヒーローには CTA を置かない方針なので、ページを少しスクロールしてから現れる。
 * - チャット本体（components/chat/ChatPanel.tsx）は、開いたときに初めて読み込む。
 * - カードの文言は葛飾区の公式注記（予算の状況により早期終了の可能性）の範囲で書く。
 */
const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });

const SHOW_AFTER_TOP = 520;
const SHOW_AFTER = 160;

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8.5 9.5h7M8.5 12.5h4.5" />
    </svg>
  );
}

export function FloatingDock({ infoDate }: { infoDate: string }) {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  const [cardClosed, setCardClosed] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  useEffect(() => {
    const threshold = pathname === "/" ? SHOW_AFTER_TOP : SHOW_AFTER;
    let ticking = false;
    const update = () => {
      ticking = false;
      setShown(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // フッターが見えている間は、案内カードを引っ込める（フッターの著作権表記などに重なるため）
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => setFooterVisible(entries[0]?.isIntersecting ?? false), { rootMargin: "0px 0px -120px 0px" });
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  const openChat = () => {
    setChatLoaded(true);
    setChatOpen(true);
  };

  // 本文に置いた「チャットで質問する」ボタン（OpenChatButton）からも開く
  useEffect(() => {
    const open = () => {
      setChatLoaded(true);
      setChatOpen(true);
    };
    window.addEventListener(OPEN_CHAT_EVENT, open);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, open);
  }, []);

  const onContactPage = pathname === "/contact";
  const launcherVisible = shown && !chatOpen;
  const cardVisible = launcherVisible && !cardClosed && !footerVisible && !onContactPage;

  // スマホの固定バー：区画の数で並べ方を変える（320px 幅に4つ並べると1区画 80px しかない）
  const tel: string = siteConfig.contact.tel;
  const segments = (onContactPage ? 2 : 3) + (tel ? 1 : 0);
  const stacked = segments >= 4;
  const gridCols = segments >= 4 ? "grid-cols-4" : segments === 3 ? "grid-cols-3" : "grid-cols-2";
  const seg = stacked
    ? "flex h-14 flex-col items-center justify-center gap-1 text-[11px] leading-none font-bold whitespace-nowrap min-[520px]:flex-row min-[520px]:gap-1.5 min-[520px]:text-[14px]"
    : "flex h-14 items-center justify-center gap-1 text-[13px] font-bold whitespace-nowrap min-[380px]:gap-1.5 min-[380px]:text-[14px]";
  const segIcon = stacked ? "h-5 w-5 shrink-0 min-[520px]:h-4 min-[520px]:w-4" : "h-4 w-4 shrink-0";

  return (
    <>
      {/* PC: 右下 */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-30 hidden flex-col items-end gap-3 md:flex">
        <aside
          aria-label="無料相談のご案内"
          aria-hidden={!cardVisible}
          className={`relative hidden w-64 overflow-hidden rounded-2xl border-2 border-cta bg-white shadow-pop transition-[opacity,transform] duration-300 2xl:block ${
            cardVisible ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => setCardClosed(true)}
            tabIndex={cardVisible ? 0 : -1}
            aria-label="案内を閉じる"
            className="absolute top-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/20"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <p className="bg-cta px-3 py-1.5 text-center text-[12px] font-bold text-white">令和8年度 補助金 受付中！</p>
          <div className="px-4 py-3 text-center">
            <p className="text-[12px] font-bold text-ink-2">予算に達すると受付終了</p>
            <p className="mt-0.5 font-heading text-[18px] leading-[1.4] font-black text-navy-900">
              まずは<span className="marker">無料相談</span>！
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/contact" tabIndex={cardVisible ? 0 : -1} className="rounded-full bg-cta px-2 py-2 text-[13px] font-bold text-white hover:bg-cta-dark">
                相談する
              </Link>
              <Link href="/simulation" tabIndex={cardVisible ? 0 : -1} className="rounded-full bg-green-600 px-2 py-2 text-[13px] font-bold text-white hover:bg-green-700">
                試算する
              </Link>
            </div>
            {tel && (
              <a href={`tel:${tel}`} tabIndex={cardVisible ? 0 : -1} className="mt-2.5 inline-flex items-center gap-1.5 py-0.5 font-en text-[16px] font-extrabold tracking-[0.02em] text-navy-900 hover:text-accent-text">
                <PhoneIcon className="h-[14px] w-[14px] text-orange-600" />
                {siteConfig.contact.telDisplay}
              </a>
            )}
          </div>
        </aside>

        <button
          type="button"
          onClick={openChat}
          tabIndex={launcherVisible ? 0 : -1}
          aria-hidden={!launcherVisible}
          aria-haspopup="dialog"
          className={`group flex items-center gap-2.5 rounded-full border-2 border-green-600 bg-white py-1.5 pr-5 pl-1.5 shadow-pop transition-[opacity,transform] duration-300 hover:-translate-y-0.5 ${
            launcherVisible ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-cream">
            <Image src="/images/pose-laptop.webp" alt="" width={349} height={362} sizes="80px" className="absolute top-0 left-1/2 w-[165%] max-w-none -translate-x-[52%]" />
          </span>
          <span className="text-left">
            <span className="block text-[11px] leading-[1.3] font-bold text-ink-2">補助金のこと、聞いてみる</span>
            <span className="flex items-center gap-1.5 font-heading text-[16px] leading-[1.4] font-black text-green-700">
              <ChatIcon className="h-4 w-4" />
              チャットで質問
            </span>
          </span>
        </button>
      </div>

      {/* スマホ: 下部バー */}
      <nav
        aria-label="固定メニュー"
        aria-hidden={!shown}
        className={`fixed inset-x-0 bottom-0 z-30 grid gap-px bg-white shadow-[0_-6px_20px_-10px_rgba(11,31,58,0.35)] transition-transform duration-300 md:hidden ${gridCols} ${shown ? "translate-y-0" : "translate-y-full"}`}
      >
        <button type="button" onClick={openChat} tabIndex={shown ? 0 : -1} aria-haspopup="dialog" className={`${seg} bg-navy-900 text-white`}>
          <ChatIcon className={segIcon} />
          チャット
        </button>
        <Link href="/simulation" tabIndex={shown ? 0 : -1} className={`${seg} bg-green-600 text-white`}>
          <svg className={segIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" />
          </svg>
          補助金を試算
        </Link>
        {tel && (
          <a href={`tel:${tel}`} tabIndex={shown ? 0 : -1} aria-label={`電話する ${siteConfig.contact.telDisplay}`} className={`${seg} bg-white text-navy-900`}>
            <PhoneIcon className={`${segIcon} text-orange-600`} />
            電話する
          </a>
        )}
        {!onContactPage && (
          <Link href="/contact" tabIndex={shown ? 0 : -1} className={`${seg} bg-cta text-white`}>
            <svg className={segIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16v10H4zM4 7l8 6 8-6" />
            </svg>
            無料相談
          </Link>
        )}
      </nav>
      {/* スマホの固定バーぶんの余白（フッターが隠れないように） */}
      <div className="h-14 bg-navy-950 md:hidden" aria-hidden="true" />

      {chatLoaded && chatOpen && <ChatPanel onClose={() => setChatOpen(false)} infoDate={infoDate} />}
    </>
  );
}
