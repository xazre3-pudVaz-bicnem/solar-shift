import Anthropic from "@anthropic-ai/sdk";
import { topics, type Topic } from "./topics";
import { loadFacts, allowedSourceUrls } from "./facts";
import { validate, similarity, countChars, type GeneratedArticle, type ExistingPost } from "./validate";
import { blogCategories } from "../../data/blog-categories";
import { guides } from "../../data/guides";
import { STATIC_ROUTES } from "../routes";
import { areasWithPage } from "../../data/areas";

/**
 * ブログ記事の自動生成（共通コア）。
 * - scripts/generate-blog-post.ts（ローカル／GitHub Actions）と
 *   app/api/cron/generate-post/route.ts（Vercel Cron）の両方から使う。
 * - モデルは ANTHROPIC_MODEL で差し替え可能（既定は Haiku 系）。
 * - 品質ゲート（validate）を通らない記事は公開しない。失敗時は skipped を返す。
 */

export const DEFAULT_MODEL = "claude-haiku-4-5";
const HISTORY_SIZE = 40;
const MAX_ATTEMPTS = 3;

export interface GenerateResult {
  status: "generated" | "skipped";
  reason?: string;
  topic?: Topic;
  filename?: string;
  slug?: string;
  markdown?: string;
  errors?: string[];
  attempts: number;
  model: string;
}

/** 日本時間の今日（YYYY-MM-DD） */
export function todayJst(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function slugFromIntent(intent: string, category: string): string {
  let h = 0;
  for (let i = 0; i < intent.length; i += 1) h = (h * 31 + intent.charCodeAt(i)) >>> 0;
  return `${category}-${h.toString(36)}`;
}

function escapeYaml(s: string): string {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

/** 既存記事・ガイドに無いトピックを1つ選ぶ（日付で決定的に） */
export function pickTopic(existing: ExistingPost[]): Topic | null {
  const usedIntents = existing.map((p) => p.intent).filter(Boolean);
  const unused = topics.filter(
    (t) => !usedIntents.some((u) => similarity(u, t.intent) > 0.7) && !existing.some((p) => similarity(p.title, t.title) > 0.55),
  );
  if (unused.length === 0) return null;
  const recentCategories = existing.slice(0, 3).map((p) => (p as ExistingPost & { category?: string }).category).filter(Boolean);
  const preferred = unused.filter((t) => !recentCategories.includes(t.category));
  const pool = preferred.length > 0 ? preferred : unused;
  const seed = Number(todayJst().replace(/-/g, ""));
  return pool[seed % pool.length];
}

export function allowedInternalPaths(existing: ExistingPost[]): Set<string> {
  const set = new Set<string>(STATIC_ROUTES.map((r) => r.path));
  for (const g of guides) set.add(g.path);
  for (const a of areasWithPage) set.add(`/area/${a.slug}`);
  for (const c of blogCategories) set.add(`/blog/category/${c.slug}`);
  for (const p of existing) set.add(`/blog/${p.slug}`);
  return set;
}

function buildSystemPrompt(facts: string): string {
  return `あなたは、東京都葛飾区の太陽光発電・蓄電池サービス「SOLAR SHIFT」（運営：株式会社サイプレス）の公式ブログの書き手です。
読者は、葛飾区やその周辺に住み、自宅への太陽光発電・蓄電池の導入と補助金について調べている一般の方です。

# 最優先ルール：確認できていないことは書かない
以下の「検証済み事実シート」にある数値・制度・事実だけを、事実として書いてよいものとします。
ここに無い数値（相場価格、発電量、削減額、割合、年数の断定など）は一切書かないでください。
一般論を書くときは「一般的に」「多くの機種で」「〜と言われています」のように主張の強さを下げ、数値は入れないでください。

${facts}

# 文章の決まり
- 敬体（です・ます）。一文は60文字以内を目安に短く。
- 冒頭に見出しを置かず、150〜250字の導入から始め、導入の中で結論を先に書く。
- ## 見出しを4〜6本。### は必要なときだけ。# は使わない。
- 数値を扱う箇所では Markdown の表を1つ以上使う。
- 補助金・制度の数値には「2026年10月1日時点の〇〇公式情報」のように時点と出典元を添える。
- 制度に触れる記事では「最新情報は公式サイトでご確認ください」と必ず書く。
- 区と都の助成額は別々に示し、合計しない。「併用可否は各窓口で確認」と書く。
- 大げさな広告表現（究極・絶品・最安・No.1・必ず・絶対）は禁止。
- SOLAR SHIFT の実績・件数・資格・スタッフ・電話番号・LINEには触れない。
- 記事末尾に「監修」「参考資料」の見出しは作らない（サイト側で自動付与される）。
- 最後の段落で1回だけ、SOLAR SHIFT（運営：株式会社サイプレス）が現地調査・見積もりを無料で行っていること、または申請スケジュールの整理を手伝えることを短く書き、/contact か /simulation へリンクする。`;
}

function buildUserPrompt(topic: Topic, existing: ExistingPost[], allowedPaths: Set<string>, sourceUrls: Set<string>): string {
  const history = existing.slice(0, HISTORY_SIZE);
  const category = blogCategories.find((c) => c.slug === topic.category);
  return `次の記事を書いてください。

- テーマ: ${topic.title}
- 狙う検索: 「${topic.intent}」
- 切り口: ${topic.angle}
- カテゴリ: ${topic.category}（${category?.name ?? ""}）
- 本文に必ず入れる固定ページへの内部リンク（2〜3本）: ${topic.links.join(" , ")}
- リンクしてよいパス（これ以外へのリンクは禁止）: ${[...allowedPaths].filter((p) => !p.startsWith("/blog/")).join(" , ")}
- 出典に使ってよいURL（これ以外は禁止）: ${[...sourceUrls].join(" , ")}

すでに公開している記事（内容・タイトル・検索意図が重ならないようにしてください）:
${history.length ? history.map((p) => `- ${p.title}（狙い: ${p.intent || "不明"}）`).join("\n") : "（まだありません）"}

次の形式のJSONだけを返してください。前後に説明文やコードフェンスを付けないでください。

{
  "title": "40文字以内。検索意図に沿い、具体的であること",
  "description": "90〜120文字。この記事を読むと何がわかるかを説明する",
  "tags": ["3〜5個", "日本語の短い語"],
  "sources": [{ "name": "出典名", "url": "許可されたURLのみ" }],
  "faq": [
    { "q": "この記事の内容に関する質問", "a": "事実シートの範囲で答える。60〜140文字" },
    { "q": "もう1つの質問", "a": "同上" }
  ],
  "body": "Markdown本文。1,600〜2,600字。## の見出しを使う。[表示テキスト](/パス) で内部リンク"
}`;
}

function extractJson(text: string): GeneratedArticle {
  const trimmed = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSONが見つかりませんでした");
  return JSON.parse(trimmed.slice(start, end + 1)) as GeneratedArticle;
}

export function toMarkdown(article: GeneratedArticle, topic: Topic, slug: string, date: string): string {
  const fm = [
    "---",
    `title: "${escapeYaml(article.title)}"`,
    `slug: "${slug}"`,
    `description: "${escapeYaml(article.description)}"`,
    `category: "${topic.category}"`,
    `tags: [${article.tags.map((t) => `"${escapeYaml(t)}"`).join(", ")}]`,
    `intent: "${escapeYaml(topic.intent)}"`,
    `publishedAt: "${date}"`,
    `updatedAt: "${date}"`,
    "sources:",
    ...article.sources.flatMap((s) => [`  - name: "${escapeYaml(s.name)}"`, `    url: "${s.url}"`]),
    "faq:",
    ...article.faq.flatMap((f) => [`  - q: "${escapeYaml(f.q)}"`, `    a: "${escapeYaml(f.a)}"`]),
    "draft: false",
    "generated: true",
    "---",
    "",
  ].join("\n");
  return `${fm}${article.body.trim()}\n`;
}

export interface GenerateOptions {
  existing: ExistingPost[];
  apiKey?: string;
  model?: string;
  /** API を呼ばずに固定レスポンスで検証だけ行う（テスト用） */
  fixture?: string;
  log?: (msg: string) => void;
}

export async function generateArticle(opts: GenerateOptions): Promise<GenerateResult> {
  const log = opts.log ?? (() => {});
  const model = (opts.model ?? process.env.ANTHROPIC_MODEL ?? "").trim() || DEFAULT_MODEL;
  const existing = opts.existing;

  const topic = pickTopic(existing);
  if (!topic) return { status: "skipped", reason: "未使用のトピックがありません（topics.ts に追加してください）", attempts: 0, model };
  log(`トピック: ${topic.title}（${topic.intent}）`);

  const facts = loadFacts();
  const sourceUrls = allowedSourceUrls(facts);
  const allowedPaths = allowedInternalPaths(existing);
  const reservedIntents = guides.map((g) => g.intent);
  const ctx = { intent: topic.intent, existing, reservedIntents, allowedPaths, allowedSourceUrls: sourceUrls };

  const client = opts.fixture ? null : new Anthropic({ apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY });
  const system = buildSystemPrompt(facts);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: buildUserPrompt(topic, existing, allowedPaths, sourceUrls) }];

  let lastErrors: string[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let text: string;
    if (opts.fixture) {
      text = opts.fixture;
    } else {
      const response = await client!.messages.create({ model, max_tokens: 8192, system, messages });
      if (response.stop_reason === "refusal") {
        return { status: "skipped", reason: "モデルが生成を拒否しました", topic, attempts: attempt, model };
      }
      text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      if (response.stop_reason === "max_tokens") log("警告: max_tokens に達しました");
    }

    let article: GeneratedArticle;
    try {
      article = extractJson(text);
    } catch (e) {
      lastErrors = [`JSONの解析に失敗: ${(e as Error).message}`];
      log(`試行${attempt}: ${lastErrors[0]}`);
      if (opts.fixture) break;
      messages.push({ role: "assistant", content: text }, { role: "user", content: "JSONとして解析できませんでした。同じ内容を、前後に説明を付けずJSONだけで返してください。" });
      continue;
    }

    const errors = validate(article, ctx);
    if (errors.length === 0) {
      const date = todayJst();
      const slug = slugFromIntent(topic.intent, topic.category);
      const markdown = toMarkdown(article, topic, slug, date);
      log(`合格（${countChars(article.body)}字）: ${article.title}`);
      return { status: "generated", topic, slug, filename: `${date}-${slug}.md`, markdown, attempts: attempt, model };
    }
    lastErrors = errors;
    log(`試行${attempt}: 品質ゲートで${errors.length}件 → ${errors.join(" / ")}`);
    if (opts.fixture) break;
    messages.push(
      { role: "assistant", content: text },
      { role: "user", content: `前回の記事には次の問題がありました。修正して、同じJSON形式で書き直してください。\n${errors.map((e) => `- ${e}`).join("\n")}` },
    );
  }

  return { status: "skipped", reason: "品質ゲートを通過できませんでした", topic, errors: lastErrors, attempts: MAX_ATTEMPTS, model };
}
