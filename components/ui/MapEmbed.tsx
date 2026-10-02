"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 所在地の Google マップ（Googleビジネスプロフィールの埋め込み用 URL を渡して使う）。
 *
 * 地図（外部の iframe）は重く、Cookie も使うので、ページを開いた時点では読み込まない。
 * 利用者がページを操作（スクロール・タップ・キー入力）し、地図の枠が画面に近づいたときに
 * 初めて読み込む。読み込む前は、住所と「地図を表示する」ボタンを出しておく。
 *
 * src には lib/site.ts の gbp.embedUrl（プロフィールの埋め込み用 URL）を渡す。
 * 住所の文字列で検索した地図は、建物の名称のカードが出てしまうので使わない。
 */
export function MapEmbed({ src, address, title, mapUrl, className = "" }: { src: string; address: string; title: string; mapUrl: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || active || !("IntersectionObserver" in window)) return;
    let io: IntersectionObserver | null = null;
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    const arm = () => {
      events.forEach((name) => window.removeEventListener(name, arm));
      if (io) return;
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setActive(true);
            io?.disconnect();
          }
        },
        { rootMargin: "300px 0px" },
      );
      io.observe(el);
    };
    events.forEach((name) => window.addEventListener(name, arm, { passive: true }));
    return () => {
      events.forEach((name) => window.removeEventListener(name, arm));
      io?.disconnect();
    };
  }, [active]);

  return (
    <div className={className}>
      <div ref={ref} className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-green-50 shadow-card sm:aspect-[16/9]">
        {active ? (
          <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center">
            <svg className="h-9 w-9 text-orange-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            <p className="text-[14px] leading-[1.7] font-bold text-navy-900">{address}</p>
            <button
              type="button"
              onClick={() => setActive(true)}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-navy-900 px-5 py-1.5 font-heading text-[14px] font-bold text-white hover:bg-navy-700"
            >
              地図を表示する
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-[13px] leading-[1.8] text-ink-2">
        地図は Google マップを利用しています。
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="ml-1 inline-block py-0.5 font-bold text-navy-600 underline underline-offset-4">
          Googleマップで開く
        </a>
      </p>
    </div>
  );
}
