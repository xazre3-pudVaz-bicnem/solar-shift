import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { respond } from "@/lib/chat/respond";
import { buildChatSystemPrompt } from "@/lib/chat/prompt";
import { loadFacts } from "@/lib/blog-generator/facts";
import type { ChatRequest, ChatTurn } from "@/lib/chat/types";

/**
 * チャット（自動応答）の API。
 *
 * - ANTHROPIC_API_KEY があり CHATBOT_AI が off でなければ、Claude が「検証済み事実シート」の範囲で答える。
 *   回答は lib/chat/guard.ts の検査を通ったものだけ返す。
 * - キーが無い／上限に達した／検査で落ちた場合は、公開している「よくある質問」と決まった案内文で答える。
 *   つまり、キーが無くてもチャットは動く（AI の費用は発生しない）。
 * - 会話の内容はサーバーに保存しない。ログにも本文は出さない。
 *
 * 環境変数
 *   ANTHROPIC_API_KEY      … AI 回答に使う（ブログ自動投稿と共用）
 *   ANTHROPIC_CHAT_MODEL   … 既定は claude-haiku-4-5
 *   CHATBOT_AI=off         … AI を止めて、よくある質問だけで答える
 *   CHAT_AI_DAILY_LIMIT    … AI 回答の1日あたり上限（既定 300。サーバーのインスタンスごとの概算）
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const DEFAULT_CHAT_MODEL = "claude-haiku-4-5";
const MAX_BODY_BYTES = 16 * 1024;

/** 1つの接続元あたり：1分に何回まで受け付けるか／AI 回答は1日何回までか */
const PER_MINUTE = 10;
const AI_PER_IP_PER_DAY = 40;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Bucket {
  minute: number[];
  aiDayStart: number;
  aiCount: number;
}
const buckets = new Map<string, Bucket>();
const globalAi = { dayStart: 0, count: 0 };

function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

function bucketFor(key: string, now: number): Bucket {
  // 溜まりすぎないように、古い記録を間引く
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.minute.every((t) => now - t > 60_000) && now - b.aiDayStart > DAY_MS) buckets.delete(k);
    }
  }
  let b = buckets.get(key);
  if (!b) {
    b = { minute: [], aiDayStart: now, aiCount: 0 };
    buckets.set(key, b);
  }
  b.minute = b.minute.filter((t) => now - t < 60_000);
  if (now - b.aiDayStart > DAY_MS) {
    b.aiDayStart = now;
    b.aiCount = 0;
  }
  return b;
}

function aiDailyLimit(): number {
  const n = Number(process.env.CHAT_AI_DAILY_LIMIT);
  return Number.isFinite(n) && n >= 0 ? n : 300;
}

/** この接続元に、いま AI の回答を使ってよいか（使うならカウントを進める） */
function takeAiBudget(bucket: Bucket, now: number): boolean {
  if (now - globalAi.dayStart > DAY_MS) {
    globalAi.dayStart = now;
    globalAi.count = 0;
  }
  if (bucket.aiCount >= AI_PER_IP_PER_DAY || globalAi.count >= aiDailyLimit()) return false;
  bucket.aiCount += 1;
  globalAi.count += 1;
  return true;
}

let client: Anthropic | null = null;
let systemPrompt: string | null = null;

function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY) && (process.env.CHATBOT_AI ?? "").toLowerCase() !== "off";
}

async function callModel(messages: ChatTurn[]): Promise<string | null> {
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 20_000, maxRetries: 1 });
  systemPrompt ??= buildChatSystemPrompt(loadFacts());
  const model = (process.env.ANTHROPIC_CHAT_MODEL ?? "").trim() || DEFAULT_CHAT_MODEL;
  try {
    const response = await client.messages.create({
      model,
      max_tokens: 700,
      // システムプロンプト（事実シート＋よくある質問）は毎回同じなのでキャッシュする
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return text || null;
  } catch (error) {
    // 本文は出さず、種類だけ記録する
    if (error instanceof Anthropic.RateLimitError) console.warn("[chat] rate limited by API");
    else if (error instanceof Anthropic.AuthenticationError) console.error("[chat] invalid ANTHROPIC_API_KEY");
    else if (error instanceof Anthropic.APIError) console.warn(`[chat] API error ${error.status}`);
    else console.warn("[chat] request failed");
    return null;
  }
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function POST(req: Request) {
  // 他サイトのページからの呼び出しは受け付けない（ブラウザ経由の悪用を防ぐ）
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin) {
    let sameOrigin = false;
    try {
      sameOrigin = new URL(origin).host === host;
    } catch {
      sameOrigin = false;
    }
    if (!sameOrigin) return json({ error: "このページからは利用できません。" }, 403);
  }
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return json({ error: "このページからは利用できません。" }, 403);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "メッセージが長すぎます。" }, 413);
  let data: ChatRequest;
  try {
    data = JSON.parse(raw) as ChatRequest;
  } catch {
    return json({ error: "不正なリクエストです。" }, 400);
  }
  if (!data || typeof data !== "object") return json({ error: "不正なリクエストです。" }, 400);

  const now = Date.now();
  const bucket = bucketFor(clientKey(req), now);
  if (bucket.minute.length >= PER_MINUTE) {
    return json({ error: "短い時間に多くの質問が送られました。少し時間をおいてお試しください。" }, 429);
  }
  bucket.minute.push(now);

  // 候補ボタン（quick）は AI を使わない。自由入力のときだけ AI の枠を使う
  const wantsAi = !data.quick && typeof data.message === "string" && data.message.trim().length > 0;
  const useAi = wantsAi && aiEnabled() && takeAiBudget(bucket, now);

  const reply = await respond(data, {
    callModel: useAi ? callModel : undefined,
    log: (msg) => console.warn(`[chat] ${msg}`),
  });
  return json(reply);
}

export function GET() {
  return json({ error: "POST で送信してください。" }, 405);
}
