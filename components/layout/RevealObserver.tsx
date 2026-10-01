"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 画面に入った要素に印を付ける（表示の切り替えは CSS 側）。役割は2つ。
 *
 * 1. 登場アニメーション … data-reveal を付けた要素が画面に入ったら data-revealed を付ける。
 *    - 最初の判定が終わるまで html[data-reveal-on] を付けない。つまり「最初から画面内にある要素」は
 *      一度も隠れない（LCP を遅らせない・ちらつかない）。画面外の要素だけが隠れて、入ってきたときに現れる。
 *    - getBoundingClientRect を全要素に呼ぶと content-visibility:auto の区画まで強制レイアウトされるので、
 *      判定は IntersectionObserver の結果だけで行う。
 *
 * 2. 装飾アニメーション（ふわふわ・きらきら・流れる点線など）… 画面内にあるときだけ動かす。
 *    対象の要素に data-anim を付け、画面内にある間だけ data-inview を付ける。
 *    CSS 側で「data-anim があって data-inview が無い」要素のアニメーションを止めている。
 *    アニメーション自体も数回で止まるようにしてある（globals.css）。
 *    動き続けるアニメーションが1つでもあると、Chrome は IntersectionObserver や遅延読み込み画像の判定のために
 *    毎フレーム（60回/秒）メインスレッドで描画処理を回し続ける。何も動いていない時間を作るための仕組み。
 *
 * 3. ページ内リンク（目次など）… 描画を後回しにしている区画（.cv-auto / .cv-block）は、画面に入るまで
 *    仮の高さで置かれている。なめらかにスクロールしている途中で手前の区画が本当の高さに変わると、
 *    着地点がずれる。そこで、飛ぶ前に「行き先より手前にある区画」を先に描画させてから移動する。
 *
 * 後から追加された要素（シミュレーターの結果・チャットなど）も MutationObserver で拾う。
 * JS が動かなければ html[data-reveal-on] も data-anim も付かないので、すべて表示されたまま・動いたままになる。
 */
const ANIMATED = '[class*="animate-"], .shine, .flow-x, .flow-y';

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    let first = true;

    const io = new IntersectionObserver(
      (entries) => {
        const vh = window.innerHeight;
        for (const e of entries) {
          const r = e.boundingClientRect;
          // 初回だけは「少しでも画面にかかっている」ものを全部表示済みにする
          const inView = e.isIntersecting || (first && r.height > 0 && r.top < vh && r.bottom > 0);
          if (inView) {
            (e.target as HTMLElement).dataset.revealed = "1";
            io.unobserve(e.target);
          }
        }
        first = false;
        root.dataset.revealOn = "1";
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.04 },
    );

    const animIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.dataset.inview = "1";
          else delete el.dataset.inview;
        }
      },
      { rootMargin: "60px 0px 60px 0px" },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
      document.querySelectorAll<HTMLElement>(ANIMATED).forEach((el) => {
        if (el.dataset.anim) return;
        el.dataset.anim = "1";
        animIo.observe(el);
      });
    };
    scan();

    // ── ページ内リンク：行き先より手前（と、行き先を含む）区画を先に描画させる
    const showBefore = (target: Element) => {
      document.querySelectorAll<HTMLElement>(".cv-auto, .cv-block").forEach((el) => {
        if (el.contains(target) || el.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) {
          el.style.contentVisibility = "visible";
        }
      });
    };
    const targetOf = (hash: string): Element | null => {
      if (hash.length < 2) return null;
      try {
        return document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        return null;
      }
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !a.hash || a.pathname !== window.location.pathname) return;
      const target = targetOf(a.hash);
      if (target) showBefore(target);
    };
    document.addEventListener("click", onClick, true);
    // URL に # が付いた状態で開いたとき（他ページからのリンクなど）
    const initial = targetOf(window.location.hash);
    if (initial) {
      showBefore(initial);
      initial.scrollIntoView({ behavior: "instant", block: "start" });
    }

    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick, true);
      mo.disconnect();
      io.disconnect();
      animIo.disconnect();
      // ページを移動したら印を外す（次のページで付け直す）
      document.querySelectorAll<HTMLElement>("[data-anim]").forEach((el) => {
        delete el.dataset.anim;
        delete el.dataset.inview;
      });
    };
  }, [pathname]);

  return null;
}
