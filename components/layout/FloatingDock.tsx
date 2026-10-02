"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OPEN_CHAT_EVENT } from "@/components/chat/OpenChatButton";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { images } from "@/data/images";
import { siteConfig } from "@/lib/site";

/**
 * 画面に固定して出す案内。
 *
 *   スマホ … 画面下の固定バー（高さ 52px）。文字つきのボタンは「試算・電話・相談」の3つだけ。
 *            チャットの入口は、左端にアイコンだけの小さなボタンで置く（バーを高くしない・画面を塞がない）。
 *            電話は lib/site.ts に番号が入っているときだけ出る。お問い合わせページでは「相談」を出さない。
 *   PC    … 右下に、スタッフのイラストつきのチャットの入口（相談・試算・電話はヘッダーにあるので、ここでは繰り返さない）。
 *
 * - TOP のヒーローには CTA を置かない方針なので、ヒーローを過ぎてから現れる。
 *   スクロール量は scroll イベントで測らず、ページの上のほうに置いた目印が画面から出たかどうかで判定する。
 * - チャット本体（components/chat/ChatPanel.tsx）は、開いたときに初めて読み込む。
 * - 補助金の受付状況（「予算に達すると終了」など）は、ここには書かない（区の案内で確認できていないため）。
 */
const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });

/** この位置（ページ上端からの px）を過ぎたら出す。TOP はヒーローの下端より後にする */
const SHOW_AFTER_TOP = 820;
const SHOW_AFTER = 200;

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
  const sentinel = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  // 目印（sentinel）が画面の上へ出ていったら「十分スクロールした」とみなす
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e) setShown(!e.isIntersecting && e.boundingClientRect.top < 0);
    });
    io.observe(el);
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
  const tel: string = siteConfig.contact.tel;
  // 左端にチャット（アイコンだけ・52px 角）、その右に 試算／電話／相談 を等分で並べる
  const labelled = 1 + (tel ? 1 : 0) + (onContactPage ? 0 : 1);
  const gridCols = labelled >= 3 ? "grid-cols-[52px_1fr_1fr_1fr]" : labelled === 2 ? "grid-cols-[52px_1fr_1fr]" : "grid-cols-[52px_1fr]";
  // アイコンの横に文字（320px 幅でも、1区画が約 89px あるので1行に収まる）
  const seg = "flex h-[52px] items-center justify-center gap-1.5 text-[13px] leading-none font-bold whitespace-nowrap min-[400px]:text-[14px]";
  const segIcon = "h-[18px] w-[18px] shrink-0";
  const staff = images.poseLaptop;

  return (
    <>
      <span ref={sentinel} className="pointer-events-none absolute left-0 h-px w-px" style={{ top: pathname === "/" ? SHOW_AFTER_TOP : SHOW_AFTER }} aria-hidden="true" />

      {/* PC: 右下にチャットの入口（スタッフのイラストつき） */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-30 hidden md:block">
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
            <Image src={staff.src} alt="" width={staff.width} height={staff.height} sizes="80px" className="absolute top-0 left-1/2 w-[165%] max-w-none -translate-x-[52%] transition-transform duration-300 group-hover:scale-105" />
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
        className={`fixed inset-x-0 bottom-0 z-30 grid bg-white shadow-[0_-6px_20px_-10px_rgba(11,31,58,0.35)] transition-transform duration-300 md:hidden ${gridCols} ${shown ? "translate-y-0" : "translate-y-full"}`}
      >
        <button type="button" onClick={openChat} tabIndex={shown ? 0 : -1} aria-haspopup="dialog" aria-label="チャットで質問する" className="flex h-[52px] w-[52px] items-center justify-center bg-navy-900 text-white">
          <ChatIcon className="h-[22px] w-[22px]" />
        </button>
        <Link href="/simulation" tabIndex={shown ? 0 : -1} className={`${seg} bg-green-600 text-white`}>
          <svg className={segIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" />
          </svg>
          試算
        </Link>
        {tel && (
          <a href={`tel:${tel}`} tabIndex={shown ? 0 : -1} aria-label={`電話する ${siteConfig.contact.telDisplay}`} className={`${seg} bg-white text-navy-900`}>
            <PhoneIcon className={`${segIcon} text-orange-600`} />
            電話
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
      <div className="h-[52px] bg-navy-950 md:hidden" aria-hidden="true" />

      {chatLoaded && chatOpen && <ChatPanel onClose={() => setChatOpen(false)} infoDate={infoDate} />}
    </>
  );
}
