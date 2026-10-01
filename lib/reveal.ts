import type { CSSProperties } from "react";

/**
 * スクロールで現れるアニメーション用の属性を返す（サーバーコンポーネントからそのまま使える）。
 *   <div {...reveal()}>            … 下からふわっと
 *   <li {...reveal(120, "pop")}>   … 120ms 遅らせてポンと出る
 *
 * 実際に表示へ切り替えるのは components/layout/RevealObserver.tsx。
 * li や dt を div で包まずに済むよう、ラッパーコンポーネントではなく属性で付ける。
 * className が状態で変わる client コンポーネントの要素にも使える（判定は data 属性で行う）。
 */
export type RevealKind = "up" | "left" | "right" | "zoom" | "pop" | "fade";

export function reveal(delayMs = 0, kind: RevealKind = "up"): { "data-reveal": string; style?: CSSProperties } {
  const attr = { "data-reveal": kind === "up" ? "" : kind };
  if (!delayMs) return attr;
  return { ...attr, style: { "--reveal-delay": `${delayMs}ms` } as CSSProperties };
}

/** 棒グラフなどの伸びるアニメーションの遅延 */
export function growDelay(delayMs: number): CSSProperties {
  return { "--grow-delay": `${delayMs}ms` } as CSSProperties;
}
