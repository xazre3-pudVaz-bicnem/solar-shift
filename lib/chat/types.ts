/**
 * チャット（自動応答）の共通型。クライアント（components/chat）とサーバー（app/api/chat）が共有する。
 */

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatLink {
  href: string;
  label: string;
}

/**
 * - "ai"       … Claude が検証済み事実シートの範囲で作った回答（出力検査を通過したもの）
 * - "faq"      … 公開している「よくある質問」からそのまま返した回答
 * - "scripted" … 決まった案内文（問い合わせ先・試算ページの案内など）
 * - "fallback" … 答えられる情報が見つからなかったときの案内
 */
export type ChatMode = "ai" | "faq" | "scripted" | "fallback";

export interface ChatReply {
  reply: string;
  links: ChatLink[];
  mode: ChatMode;
  /** 次に押せる質問の候補（data/faq の id または scripted の id） */
  suggestions: { id: string; label: string }[];
}

export interface ChatRequest {
  /** 自由入力の質問 */
  message?: string;
  /** 候補ボタンを押したときの id（AI を呼ばずに決まった回答を返す） */
  quick?: string;
  /** これまでのやり取り（新しいものが後ろ）。サーバー側で件数と長さを切り詰める */
  history?: ChatTurn[];
}

export const CHAT_LIMITS = {
  /** 1回の質問の最大文字数 */
  messageChars: 400,
  /** サーバーへ送る履歴の最大件数 */
  historyTurns: 8,
  /** 履歴1件あたりの最大文字数 */
  historyChars: 700,
} as const;
