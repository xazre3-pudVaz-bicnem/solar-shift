import { siteConfig } from "../site";
import { CHAT_LIMITS, type ChatLink, type ChatReply, type ChatRequest, type ChatTurn } from "./types";
import { getFaq, getScripted, matchFaq, matchScripted, matchSmallTalk, nextSuggestions, suggestionLabel, INITIAL_SUGGESTIONS } from "./scripted";
import { checkReply } from "./guard";
import { chatLinkTargets } from "./prompt";

/**
 * チャットの応答を組み立てる（サーバー専用・副作用なし）。
 *
 *   候補ボタン      → 決まった回答（AI を呼ばない）
 *   自由入力        → AI（使える場合）→ 出力検査 → 合格ならその回答
 *                     不合格・エラー・AI なし → 決まった案内文 → よくある質問との照合 → 案内文
 *
 * AI の呼び出しは引数で受け取る。API ルートは Claude を、テストは固定の文字列を渡す。
 */

export interface RespondDeps {
  /** AI を呼ぶ関数。null を返したとき（拒否・エラー・上限超過）はローカルの回答に切り替える */
  callModel?: (messages: ChatTurn[]) => Promise<string | null>;
  /** 個人情報を含まない運用ログ（検査で落ちた理由など） */
  log?: (msg: string) => void;
}

const SITE_TEL: string = siteConfig.contact.tel;
const SITE_TEL_DISPLAY: string = siteConfig.contact.telDisplay;

const FALLBACK_TEXT = `申し訳ありません。そのご質問には、このチャットでは正確にお答えできません。下の候補から選ぶか、お問い合わせフォーム${SITE_TEL_DISPLAY ? `またはお電話（${SITE_TEL_DISPLAY}）で` : "から"}ご相談ください。ご相談・現地調査・お見積もりは無料です。`;

const FALLBACK_LINKS: ChatLink[] = [
  { href: "/contact", label: "お問い合わせ・無料相談" },
  { href: "/faq", label: "よくある質問" },
];

function dateJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${y}年${m}月${d}日` : iso;
}

/** 制御文字を落とし、長さを切り詰める */
export function sanitizeInput(value: unknown, maxChars: number): string {
  const text = String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return [...text].slice(0, maxChars).join("");
}

export function normalizeHistory(history: unknown): ChatTurn[] {
  if (!Array.isArray(history)) return [];
  const turns: ChatTurn[] = [];
  for (const h of history) {
    if (!h || typeof h !== "object") continue;
    const role = (h as { role?: unknown }).role;
    if (role !== "user" && role !== "assistant") continue;
    const content = sanitizeInput((h as { content?: unknown }).content, CHAT_LIMITS.historyChars);
    if (content) turns.push({ role, content });
  }
  const recent = turns.slice(-CHAT_LIMITS.historyTurns);
  // 最初の発言は必ず user にする（API の制約）
  while (recent.length > 0 && recent[0].role !== "user") recent.shift();
  return recent;
}

/** モデルの出力（JSON を期待）から本文とリンクを取り出す。JSON でなければ全文を本文として扱う */
export function parseModelOutput(raw: string): { answer: string; links: string[] } {
  const trimmed = String(raw ?? "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      const data = JSON.parse(trimmed.slice(start, end + 1)) as { answer?: unknown; links?: unknown };
      if (typeof data.answer === "string") {
        const links = Array.isArray(data.links) ? data.links.filter((l): l is string => typeof l === "string") : [];
        return { answer: data.answer, links };
      }
    } catch {
      // JSON として読めなければ下で全文を本文として扱う
    }
  }
  return { answer: trimmed, links: [] };
}

/** Markdown 記法を落として、チャットの吹き出しにそのまま出せる文にする */
export function cleanAnswer(text: string): string {
  return String(text ?? "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "・")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function resolveLinks(paths: string[], extra: ChatLink[] = []): ChatLink[] {
  const targets = new Map(chatLinkTargets().map((p) => [p.href, p.label]));
  targets.set("/contact", "お問い合わせ・無料相談");
  const out: ChatLink[] = [];
  const push = (href: string, label?: string) => {
    const clean = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
    const known = targets.get(clean);
    if (!known || out.some((l) => l.href === clean)) return;
    out.push({ href: clean, label: label ?? known });
  };
  for (const p of paths) push(p);
  for (const l of extra) push(l.href, l.label);
  return out.slice(0, 3);
}

/** 回答に SOLAR SHIFT の電話番号が出ているときは、押すと発信できるリンクを先頭に足す */
function withTelLink(reply: string, links: ChatLink[]): ChatLink[] {
  if (!SITE_TEL || !SITE_TEL_DISPLAY) return links;
  if (!reply.includes(SITE_TEL_DISPLAY) && !reply.includes(SITE_TEL)) return links;
  return [{ href: `tel:${SITE_TEL}`, label: "電話をかける" }, ...links].slice(0, 3);
}

/** 補助金の金額に触れているのに時点の記載が無い回答には、時点と確認の一言を足す */
function ensureDisclaimer(answer: string): string {
  const mentionsMoney = /(補助|助成)/.test(answer) && /[\d０-９.]+\s*万?円/.test(answer);
  if (!mentionsMoney || /時点/.test(answer)) return answer;
  return `${answer}\n\n※ ${dateJa(siteConfig.subsidyInfoDate)}時点の公式情報にもとづく参考情報です。実際の対象可否・助成額は住宅条件・機器・申請時期で異なります。最新情報は公式サイトでご確認ください。`;
}

function fromFaq(id: string): ChatReply | null {
  const faq = getFaq(id);
  if (!faq) return null;
  const links = resolveLinks([], [...(faq.link ? [faq.link] : []), ...(faq.scope === "service" ? [{ href: "/contact", label: "お問い合わせ・無料相談" }] : [])]);
  return { reply: faq.a, links: withTelLink(faq.a, links), mode: "faq", suggestions: nextSuggestions(id) };
}

function fromScripted(id: string): ChatReply | null {
  const s = getScripted(id);
  if (!s) return null;
  return { reply: s.answer, links: withTelLink(s.answer, resolveLinks([], s.links)), mode: "scripted", suggestions: nextSuggestions(id) };
}

function fallback(): ChatReply {
  return {
    reply: FALLBACK_TEXT,
    links: withTelLink(FALLBACK_TEXT, FALLBACK_LINKS),
    mode: "fallback",
    suggestions: INITIAL_SUGGESTIONS.slice(0, 4)
      .map((id) => ({ id, label: suggestionLabel(id) ?? id }))
      .filter((s) => s.label !== s.id),
  };
}

/** AI を使わない回答（決まった案内文 → よくある質問 → 案内文） */
export function respondLocally(message: string): ChatReply {
  const scripted = matchScripted(message);
  const faq = matchFaq(message);
  // 質問文がよくある質問とよく一致しているなら、そちらを優先する（「見積もりは無料？」など）
  if (faq && (!scripted || faq.score >= 0.62)) return fromFaq(faq.faq.id) ?? fallback();
  if (scripted) return fromScripted(scripted.id) ?? fallback();
  return fallback();
}

export async function respond(req: ChatRequest, deps: RespondDeps = {}): Promise<ChatReply> {
  const log = deps.log ?? (() => {});

  // ── 候補ボタン：決まった回答を返す
  if (typeof req.quick === "string" && req.quick) {
    const id = sanitizeInput(req.quick, 60);
    return fromScripted(id) ?? fromFaq(id) ?? fallback();
  }

  const message = sanitizeInput(req.message, CHAT_LIMITS.messageChars);
  if (!message) {
    return { ...fallback(), reply: "ご質問を入力するか、下の候補からお選びください。" };
  }

  const smallTalk = matchSmallTalk(message);
  if (smallTalk) {
    return {
      reply: smallTalk,
      links: [],
      mode: "scripted",
      suggestions: INITIAL_SUGGESTIONS.slice(0, 4)
        .map((id) => ({ id, label: suggestionLabel(id) ?? id }))
        .filter((s) => s.label !== s.id),
    };
  }

  // ── AI
  if (deps.callModel) {
    let raw: string | null = null;
    try {
      raw = await deps.callModel([...normalizeHistory(req.history), { role: "user", content: message }]);
    } catch (e) {
      log(`model error: ${(e as Error).name}`);
    }
    if (raw) {
      const parsed = parseModelOutput(raw);
      const answer = ensureDisclaimer(cleanAnswer(parsed.answer));
      const errors = checkReply(answer, message);
      if (errors.length === 0) {
        const related = matchFaq(message);
        return {
          reply: answer,
          links: withTelLink(answer, resolveLinks(parsed.links)),
          mode: "ai",
          suggestions: nextSuggestions(related ? related.faq.id : null),
        };
      }
      log(`guard rejected: ${errors.join(" / ")}`);
    }
  }

  return respondLocally(message);
}
