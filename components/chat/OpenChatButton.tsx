"use client";

import type { ReactNode } from "react";

/** チャットを開く合図。受け取るのは components/layout/FloatingDock.tsx */
export const OPEN_CHAT_EVENT = "solar-shift:open-chat";

/**
 * 本文の中に置く「チャットで質問する」ボタン。
 * 押すと、右下（スマホは下の固定バー）と同じチャットが開く。
 */
export function OpenChatButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <button type="button" aria-haspopup="dialog" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT))} className={className}>
      {children}
    </button>
  );
}
