"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ChatLink, ChatMode, ChatReply, ChatTurn } from "@/lib/chat/types";
import { CHAT_LIMITS } from "@/lib/chat/types";
import { CHAT_GREETING, CHAT_INITIAL_SUGGESTIONS } from "@/lib/chat/initial";
import { PhoneIcon } from "@/components/ui/PhoneIcon";

/**
 * チャット（自動応答）の本体。開いたときに初めて読み込まれる（components/layout/FloatingDock.tsx が遅延読み込みする）。
 *
 * - 回答は /api/chat が作る。ここは表示と入力だけを扱う。
 * - やり取りはこのブラウザの sessionStorage にだけ残す（タブを閉じると消える）。
 * - 日本語入力の変換確定の Enter では送信しない（isComposing を見る）。
 */

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  links?: ChatLink[];
  mode?: ChatMode;
  suggestions?: { id: string; label: string }[];
}

const STORAGE_KEY = "solar-shift-chat-v1";
const MAX_STORED = 40;

const MODE_LABEL: Partial<Record<ChatMode, string>> = {
  ai: "AIによる自動回答",
  faq: "よくある質問からの回答",
};

const greeting: Message = { id: 0, role: "assistant", content: CHAT_GREETING, suggestions: CHAT_INITIAL_SUGGESTIONS };

function load(): Message[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [greeting];
    const parsed = JSON.parse(raw) as Message[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [greeting];
  } catch {
    return [greeting];
  }
}

export default function ChatPanel({ onClose, infoDate }: { onClose: () => void; infoDate: string }) {
  const [messages, setMessages] = useState<Message[]>(load);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(messages.reduce((m, x) => Math.max(m, x.id), 0) + 1);

  // 保存（個人情報を入力しないよう案内しているが、念のためこのタブの中だけにとどめる）
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // 保存できない環境（プライベートモードなど）では何もしない
    }
  }, [messages]);

  // 新しい発言が出たら一番下へ
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  // 開いたとき：Esc で閉じる。マウス操作の端末では入力欄へフォーカス（スマホではキーボードを勝手に出さない）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = useCallback(
    async (payload: { message?: string; quick?: string }, shown: string) => {
      if (busy) return;
      const history: ChatTurn[] = messages
        .filter((m) => m.id !== 0)
        .slice(-CHAT_LIMITS.historyTurns)
        .map((m) => ({ role: m.role, content: m.content }));
      const userMessage: Message = { id: nextId.current++, role: "user", content: shown };
      setMessages((prev) => [...prev, userMessage]);
      setBusy(true);
      let reply: Message;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, history }),
        });
        const data = (await res.json()) as Partial<ChatReply> & { error?: string };
        if (!res.ok || typeof data.reply !== "string") {
          reply = {
            id: nextId.current++,
            role: "assistant",
            content: data.error ?? "うまく応答できませんでした。時間をおいてもう一度お試しください。",
            links: [{ href: "/contact", label: "お問い合わせ・無料相談" }],
            mode: "fallback",
          };
        } else {
          reply = { id: nextId.current++, role: "assistant", content: data.reply, links: data.links ?? [], mode: data.mode, suggestions: data.suggestions ?? [] };
        }
      } catch {
        reply = {
          id: nextId.current++,
          role: "assistant",
          content: "通信に失敗しました。電波の状況を確認して、もう一度お試しください。",
          links: [{ href: "/contact", label: "お問い合わせ・無料相談" }],
          mode: "fallback",
        };
      }
      setMessages((prev) => [...prev, reply]);
      setBusy(false);
    },
    [busy, messages],
  );

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void send({ message: text }, text);
  };

  const reset = () => {
    setMessages([greeting]);
    nextId.current = 1;
  };

  const last = messages[messages.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end md:pointer-events-none md:inset-auto md:right-4 md:bottom-4">
      {/* スマホは背景を暗くして、外側を押したら閉じる */}
      <button type="button" aria-label="チャットを閉じる" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-navy-950/45 md:hidden" />
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="chat-title"
        className="pointer-events-auto relative flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-xl border border-line bg-paper-2 md:h-[min(40rem,calc(100dvh-2rem))] md:w-[24rem] md:rounded-xl md:border-2 md:border-navy-900"
      >
        <header className="flex items-center gap-3 bg-navy-900 px-4 py-3 text-white">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-paper-2">
            <Image src="/images/illustrations/pose-laptop.webp" alt="" width={349} height={362} sizes="72px" className="absolute top-0 left-1/2 w-[165%] max-w-none -translate-x-[52%]" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="chat-title" className="font-heading text-[16px] leading-[1.3] font-black text-white">
              チャットで質問
            </h2>
            <p className="text-[12px] leading-[1.4] text-white">自動応答｜補助金・太陽光・蓄電池</p>
          </div>
          <button type="button" onClick={reset} className="min-h-11 rounded-md px-2.5 text-[13px] font-bold text-white underline underline-offset-2 hover:bg-white/15">
            最初から
          </button>
          <button type="button" onClick={onClose} aria-label="チャットを閉じる" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div ref={listRef} role="log" aria-live="polite" aria-label="チャットのやり取り" tabIndex={0} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-lg rounded-br-md bg-navy-900 px-3.5 py-2.5 text-[15px] leading-[1.7] whitespace-pre-line text-white">{m.content}</p>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[92%]">
                  <div className="rounded-lg rounded-bl-md border border-line bg-white px-3.5 py-3">
                    <p className="text-[15px] leading-[1.8] whitespace-pre-line text-ink">{m.content}</p>
                    {m.links && m.links.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {m.links.map((l) => (
                          <li key={l.href}>
                            {l.href.startsWith("tel:") ? (
                              <a
                                href={l.href}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border-2 border-navy-900 bg-white px-3.5 py-1 text-[14px] font-bold text-navy-900 hover:bg-paper-2"
                              >
                                <PhoneIcon className="h-3 w-3 text-orange-600" />
                                {l.label}
                              </a>
                            ) : (
                              <Link
                                href={l.href}
                                onClick={onClose}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-navy-900 px-3.5 py-1 text-[14px] leading-[1.4] font-bold text-white hover:bg-navy-700"
                              >
                                {l.label}
                                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                  <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {m.mode && MODE_LABEL[m.mode] && <p className="mt-1 pl-1 text-[12px] text-ink-3">{MODE_LABEL[m.mode]}</p>}
                </div>
              </div>
            ),
          )}
          {busy && (
            <div className="flex justify-start" aria-label="回答を作成中です">
              <p className="flex items-center gap-1.5 rounded-lg rounded-bl-md border border-line bg-white px-4 py-3.5">
                <span className="h-2 w-2 rounded-full bg-navy-900" />
                <span className="h-2 w-2 rounded-full bg-navy-900 [animation-delay:0.3s]" />
                <span className="h-2 w-2 rounded-full bg-navy-900 [animation-delay:0.6s]" />
              </p>
            </div>
          )}
          {!busy && last?.role === "assistant" && last.suggestions && last.suggestions.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1" aria-label="質問の候補">
              {last.suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => void send({ quick: s.id }, s.label)}
                    className="min-h-11 rounded-md border-2 border-orange-300 bg-white px-3.5 py-1.5 text-left text-[14px] leading-[1.4] font-bold text-navy-900 hover:border-orange-500 hover:bg-orange-50"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line bg-white px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              質問を入力
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              rows={2}
              maxLength={CHAT_LIMITS.messageChars}
              placeholder="例：5kW載せたら補助金はいくら？"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // 変換確定の Enter では送らない。Shift+Enter は改行
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              className="min-h-[3.25rem] flex-1 resize-none rounded-lg border border-line-2 bg-white px-3 py-2 text-[16px] leading-[1.5] text-ink placeholder:text-ink-3 focus:border-navy-900 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || input.trim().length === 0}
              aria-label="送信"
              className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full bg-orange-500 text-navy-950 transition-colors hover:bg-orange-400 disabled:bg-line-2 disabled:text-navy-950"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12 20 4l-5 16-3.5-6.5L4 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <p className="mt-2 text-[12px] leading-[1.6] text-ink-3">
            自動応答です。{infoDate}時点の公式情報にもとづく参考情報で、補助金の交付を保証するものではありません。氏名・住所・電話番号などの個人情報は入力しないでください。
            <Link href="/privacy" onClick={onClose} className="ml-1 inline-block py-1 underline underline-offset-2">
              情報の取り扱い
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
