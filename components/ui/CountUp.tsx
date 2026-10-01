"use client";

import { useEffect, useRef } from "react";

/**
 * 数字のカウントアップ。
 * - サーバーでは最終値をそのまま出力する（検索エンジン・JSなしの環境には正しい数字が見える）。
 * - マウント時に画面外にあるものだけ 0 に戻し、画面に入ったら最終値まで数える。
 *   最初から画面内にある数字は動かさない（ちらつき防止）。
 * - 桁数ぶんの幅を先に確保するので、数えている間にまわりの文字が動かない（CLS を出さない）。
 */
export function CountUp({
  value,
  decimals = 0,
  duration = 1300,
  className = "",
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => n.toLocaleString("ja-JP", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const final = format(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fmt = (n: number) => n.toLocaleString("ja-JP", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    // textContent を代入すると React が管理しているテキストノードが作り直され、
    // 親の再描画で値が更新されなくなる。必ず既存ノードの data を書き換える。
    const write = (text: string) => {
      const node = el.firstChild;
      if (node && node.nodeType === Node.TEXT_NODE) (node as Text).data = text;
    };
    let raf = 0;
    let armed = false;
    let done = false;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!armed) {
          // 初回の通知。すでに画面内なら何もしない
          armed = true;
          if (entry.isIntersecting) {
            done = true;
            io.disconnect();
            return;
          }
          write(fmt(0));
          return;
        }
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          write(fmt(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
          else write(fmt(value));
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      write(fmt(value));
    };
  }, [value, decimals, duration]);

  return (
    <span ref={ref} className={`inline-block text-right tabular-nums ${className}`} style={{ minWidth: `${final.length * 0.62}em` }}>
      {final}
    </span>
  );
}
