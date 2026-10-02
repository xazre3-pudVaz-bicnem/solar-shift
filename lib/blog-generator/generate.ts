import Anthropic from "@anthropic-ai/sdk";
import { topics, type Topic } from "./topics";
import { loadFacts, allowedSourceUrls } from "./facts";
import { validate, similarity, countChars, MIN_BODY_CHARS, type GeneratedArticle, type ExistingPost } from "./validate";
import { buildFactIndex, compactClaims, sourceTypeOf, type Claim, type FactIndex } from "./claims";
import { findCannibalPage } from "../seo-map";
import { blogCategories } from "../../data/blog-categories";
import { guides } from "../../data/guides";
import { STATIC_ROUTES } from "../routes";
import { areasWithPage } from "../../data/areas";

/**
 * ブログ記事の自動生成（共通コア）。
 * - scripts/generate-blog-post.ts（ローカル／GitHub Actions）と
 *   app/api/cron/generate-post/route.ts（Vercel Cron）の両方から使う。
 * - モデルは ANTHROPIC_MODEL で差し替え可能（既定は Haiku 系）。
 *
 * 流れ：生成 → 品質チェック → 合格したものだけ公開
 *   1. 書く        … 事実シート（docs/VERIFIED_FACTS.md）だけを根拠に、記事を JSON で書かせる
 *   2. 機械の検査  … validate.ts。数値と出典の突き合わせ、カニバリ、薄い記事、焼き直し、禁止表現
 *   3. 読み直し    … 別の呼び出しで、数値以外の主張（制度・手続き・機器の説明）が事実シートに
 *                    書かれているかを1つずつ確かめる（reviewArticle）
 *   4. 公開        … 2 と 3 の両方に通ったものだけを保存する。通らなければ、その日は公開しない
 *
 * 「毎日1本を必ず出す」仕組みではない。毎日生成を試み、基準を満たしたときだけ公開する。
 */

export const DEFAULT_MODEL = "claude-haiku-4-5";
/** 品質ゲートの版。検査の内容を変えたら上げる（記事の frontmatter に残る） */
export const QUALITY_GATE_VERSION = 2;
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

/**
 * まだ書いていないトピックを1つ選ぶ（日付で決定的に）。
 * - 既存記事と検索意図・タイトルが近いものは選ばない
 * - 固定ページとカニバリするものは選ばない（lib/seo-map.ts）
 * - 葛飾区に固有の題材（local: true）を先に使う
 */
export function pickTopic(existing: ExistingPost[]): Topic | null {
  const usedIntents = existing.map((p) => p.intent).filter(Boolean);
  const unused = topics.filter(
    (t) => !usedIntents.some((u) => similarity(u, t.intent) > 0.7) && !existing.some((p) => similarity(p.title, t.title) > 0.55) && !findCannibalPage(t.intent),
  );
  if (unused.length === 0) return null;
  const local = unused.filter((t) => t.local);
  const base = local.length > 0 ? local : unused;
  const recentCategories = existing.slice(0, 2).map((p) => (p as ExistingPost & { category?: string }).category).filter(Boolean);
  const preferred = base.filter((t) => !recentCategories.includes(t.category));
  const pool = preferred.length > 0 ? preferred : base;
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

# 最優先ルール：一次情報で確認できていないことは書かない
以下の「検証済み事実シート」にある数値・制度・手続き・事実だけを、事実として書いてよいものとします。
各節の「出典：」が、その節の内容の根拠です。

- 数値（金額・容量の相場・発電量・削減額・割合・年数・日数・件数・保証年数・効率など）は、事実シートにあるものだけを書く。
- 事実シートに無い数値は、言い方を弱めても書かない。「機種によって異なる」「メーカー・製品によって異なる」「見積もりで確認する」と書く。
- 「一般的に」「多くの場合」「通常は」「〜と言われています」のように、根拠を示さずに一般化する書き方はしない。
  だれの資料に書いてあるかを主語にする（例：「葛飾区の案内では」「東京都の手引きでは」「太陽光発電協会によると」）。
- 機器の仕様（変換効率・サイクル数・寿命・保証年数・出力）は、メーカーの資料が事実シートに無いので、数値を書かない。
- 経験談・相談の多さ・現場の話・お客様の例・施工事例・費用の例は、作らない。施工事例は、サイトの施工事例のページに載せているものだけです。記事の中では、事例の内容や金額に触れません。
- 計算例として容量（◯kW・◯kWh）を置くのは構いません。その場合の金額は、事実シートの計算ルールで求められるものだけを書く。

${facts}

# 記事の役割
- この記事は、固定ページ（制度の全体をまとめたページ）では扱いきれない「1つの細かい疑問」に答えるためのものです。
- 制度の全体説明を繰り返さない。疑問に対する答えを先に書き、全体は固定ページへのリンクで案内する。
- 葛飾区の読者に固有の事情（区の制度の決まり、区の公式の注意喚起、区の地域情報）を、事実シートの範囲で具体的に書く。

# 文章の決まり
- 敬体（です・ます）。一文は60文字以内を目安に短く。
- 冒頭に見出しを置かず、150〜250字の導入から始める。導入の最初の2文で、疑問への答え（結論）を書く。
- ## 見出しを4〜6本。### は必要なときだけ。# は使わない。見出しの下には、それぞれ150字以上の本文を書く。
- 数値を扱う箇所では Markdown の表を1つ以上使う。
- 補助金・制度の数値には「2026年10月1日時点の葛飾区の公式情報」のように、時点と出典元を添える。
- 制度に触れる記事では「最新情報は公式サイトでご確認ください」と必ず書く。
- 区と都の助成額は別々に示し、合計額は書かない。併用に触れるときは「葛飾区の案内では、国や都の補助制度との併用も可能。ただし、補助金の合計が助成対象経費を上回る場合は、上回る額が減額される」と書く。
- 大げさな広告表現（究極・最安・No.1・トップクラス・必ず・絶対）は禁止。
- SOLAR SHIFT の実績・件数・資格・スタッフ・電話番号・LINE・営業方法・返信の速さには触れない。
- 記事末尾に「監修」「参考資料」の見出しは作らない（サイト側で自動付与される）。
- 最後の段落で1回だけ、SOLAR SHIFT（運営：株式会社サイプレス）が現地調査・見積もりを無料で行っていることを短く書き、/contact か /simulation へリンクする。`;
}

function buildUserPrompt(topic: Topic, existing: ExistingPost[], allowedPaths: Set<string>, sourceUrls: Set<string>): string {
  const history = existing.slice(0, HISTORY_SIZE);
  const category = blogCategories.find((c) => c.slug === topic.category);
  return `次の記事を書いてください。

- テーマ: ${topic.title}
- 狙う検索: 「${topic.intent}」
- 切り口: ${topic.angle}
- カテゴリ: ${topic.category}（${category?.name ?? ""}）
- 本文に必ず入れる固定ページへの内部リンク（すべて入れる）: ${topic.links.join(" , ")}
- リンクしてよいパス（これ以外へのリンクは禁止）: ${[...allowedPaths].filter((p) => !p.startsWith("/blog/")).join(" , ")}
- 出典に使ってよいURL（これ以外は禁止。本文で使った数値・制度の出典を、すべて sources に入れる）: ${[...sourceUrls].join(" , ")}

すでに公開している記事（内容・タイトル・検索意図・見出しの構成が重ならないようにしてください）:
${history.length ? history.map((p) => `- ${p.title}（狙い: ${p.intent || "不明"}）`).join("\n") : "（まだありません）"}

次の形式のJSONだけを返してください。前後に説明文やコードフェンスを付けないでください。

{
  "title": "40文字以内。検索意図に沿い、具体的であること",
  "description": "90〜120文字。この記事を読むと何がわかるかを説明する",
  "tags": ["3〜5個", "日本語の短い語"],
  "sources": [{ "name": "出典名", "url": "許可されたURLのみ。本文の数値・制度の根拠にしたものをすべて" }],
  "faq": [
    { "q": "この記事の内容に関する質問", "a": "事実シートの範囲で答える。60〜140文字" },
    { "q": "もう1つの質問", "a": "同上" }
  ],
  "body": "Markdown本文。2,000〜3,000字。## の見出しを使う。[表示テキスト](/パス) で内部リンク"
}`;
}

function extractJson<T>(text: string): T {
  const trimmed = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSONが見つかりませんでした");
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

// ─────────────────────────────────────────────────────────────── 読み直し（数値以外の主張）

interface ReviewedClaim {
  claim: string;
  /** 事実シートのどの出典に書かれているか（URL）。書かれていなければ空 */
  source: string;
  supported: boolean;
}

export interface ReviewResult {
  ok: boolean;
  claims: Claim[];
  errors: string[];
}

function buildReviewPrompt(article: GeneratedArticle): string {
  return `次のブログ記事を、公開前に点検してください。

点検すること：記事の中の「制度・手続き・要件・日付・機器や技術の説明・SOLAR SHIFT についての説明」にあたる主張を1つずつ取り出し、
システムプロンプトの「検証済み事実シート」に書かれているかどうかを判定する。

- 事実シートに書かれている主張 … supported を true にし、source にその節の出典URLを入れる
- 事実シートに書かれていない主張 … supported を false にし、source は空文字にする
  （数値が無くても、制度の条件・手続きの順番・機器の性質を事実として述べていれば対象）
- 判定しなくてよいもの：読者への呼びかけ、「見積もりで確認しましょう」のような助言、
  「機種によって異なる」という書き方、屋根や電気の使い方によって変わるという一般的な注意

次の形式のJSONだけを返してください。前後に説明文やコードフェンスを付けないでください。

{
  "claims": [
    { "claim": "記事中の主張（1文・80字以内に要約）", "source": "出典URLまたは空文字", "supported": true }
  ]
}

# 記事
タイトル: ${article.title}
説明: ${article.description}

${article.body}

# FAQ
${article.faq.map((f) => `Q. ${f.q}\nA. ${f.a}`).join("\n")}`;
}

/**
 * 数値以外の主張を、別の呼び出しで事実シートと照らし合わせる。
 * 判定できなかった場合（呼び出しの失敗・JSON の解析失敗）は「不合格」として扱う（疑わしきは公開しない）。
 */
export async function reviewArticle(opts: { client: Anthropic; model: string; facts: string; index: FactIndex; article: GeneratedArticle; fixture?: string }): Promise<ReviewResult> {
  let text = opts.fixture;
  if (text === undefined) {
    const response = await opts.client.messages.create({
      model: opts.model,
      max_tokens: 4096,
      system: `あなたは、公開前の記事を事実と照らし合わせる校閲者です。記事を良く見せる必要はありません。事実シートに書かれていない主張を、見逃さずに挙げてください。\n\n${opts.facts}`,
      messages: [{ role: "user", content: buildReviewPrompt(opts.article) }],
    });
    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      return { ok: false, claims: [], errors: [`読み直しを完了できませんでした（${response.stop_reason}）`] };
    }
    text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  let parsed: { claims?: ReviewedClaim[] };
  try {
    parsed = extractJson<{ claims?: ReviewedClaim[] }>(text);
  } catch (e) {
    return { ok: false, claims: [], errors: [`読み直しの結果を解析できませんでした: ${(e as Error).message}`] };
  }
  if (!Array.isArray(parsed.claims)) return { ok: false, claims: [], errors: ["読み直しの結果に claims がありません"] };

  const errors: string[] = [];
  const claims: Claim[] = [];
  const listed = new Set(opts.article.sources.map((s) => s.url));
  for (const c of parsed.claims) {
    if (!c || typeof c.claim !== "string") continue;
    if (!c.supported) {
      errors.push(`事実シートで確認できない主張: 「${c.claim.slice(0, 60)}」`);
      continue;
    }
    const type = c.source ? opts.index.sources.get(c.source) ?? null : null;
    if (!c.source || !type) {
      errors.push(`出典を特定できない主張: 「${c.claim.slice(0, 60)}」`);
      continue;
    }
    if (!listed.has(c.source)) {
      errors.push(`主張の出典が sources にありません: 「${c.claim.slice(0, 40)}」→ ${c.source}`);
      continue;
    }
    claims.push({ claim: c.claim.slice(0, 160), source: c.source, sourceType: type, verified: true });
  }
  return { ok: errors.length === 0, claims, errors: errors.slice(0, 8) };
}

// ─────────────────────────────────────────────────────────────── 出力

export interface QualityMeta {
  gate: number;
  checkedAt: string;
  chars: number;
  /** 読み直しに使ったモデル。読み直しを行っていなければ "none" */
  reviewer: string;
}

export function toMarkdown(article: GeneratedArticle, topic: Topic, slug: string, date: string, claims: Claim[] = [], quality?: QualityMeta): string {
  const fm = [
    "---",
    `title: "${escapeYaml(article.title)}"`,
    `slug: "${slug}"`,
    `description: "${escapeYaml(article.description)}"`,
    `category: "${topic.category}"`,
    `tags: [${article.tags.map((t) => `"${escapeYaml(t)}"`).join(", ")}]`,
    `intent: "${escapeYaml(topic.intent)}"`,
    `pillar: "${topic.links[0]}"`,
    `publishedAt: "${date}"`,
    `updatedAt: "${date}"`,
    "sources:",
    ...article.sources.flatMap((s) => [`  - name: "${escapeYaml(s.name)}"`, `    url: "${s.url}"`, `    sourceType: "${sourceTypeOf(s.url) ?? ""}"`]),
    "faq:",
    ...article.faq.flatMap((f) => [`  - q: "${escapeYaml(f.q)}"`, `    a: "${escapeYaml(f.a)}"`]),
    // 内部の管理用（画面には出さない）：数値・制度の主張と、その出典
    ...(claims.length > 0 ? ["claims:", ...claims.flatMap((c) => [`  - claim: "${escapeYaml(c.claim)}"`, `    source: "${c.source}"`, `    sourceType: "${c.sourceType}"`, `    verified: ${c.verified}`])] : []),
    ...(quality ? ["quality:", `  gate: ${quality.gate}`, `  checkedAt: "${quality.checkedAt}"`, `  chars: ${quality.chars}`, `  reviewer: "${escapeYaml(quality.reviewer)}"`] : []),
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
  /** 読み直しに使うモデル（未指定なら ANTHROPIC_REVIEW_MODEL、それも無ければ記事と同じモデル） */
  reviewModel?: string;
  /** API を呼ばずに固定レスポンスで検証だけ行う（テスト用） */
  fixture?: string;
  /** fixture のとき、読み直しの結果として使う JSON（省略すると、読み直しは行わず機械の検査だけ） */
  reviewFixture?: string;
  /**
   * この時刻（Date.now() と同じ単位）までに終える。実行時間に上限のある場所（Vercel の関数）から呼ぶときに渡す。
   * 残り時間が足りなければ、書き直しや読み直しを始めずに「この回は公開しない」で終える（途中で打ち切られて中途半端な状態を残さない）。
   */
  deadlineAt?: number;
  log?: (msg: string) => void;
}

/** 1回の執筆に見ておく時間・読み直しに見ておく時間（ミリ秒）。残りがこれより短ければ始めない */
const WRITE_BUDGET_MS = 80_000;
const REVIEW_BUDGET_MS = 25_000;

export async function generateArticle(opts: GenerateOptions): Promise<GenerateResult> {
  const log = opts.log ?? (() => {});
  const model = (opts.model ?? process.env.ANTHROPIC_MODEL ?? "").trim() || DEFAULT_MODEL;
  const reviewModel = (opts.reviewModel ?? process.env.ANTHROPIC_REVIEW_MODEL ?? "").trim() || model;
  const existing = opts.existing;

  const topic = pickTopic(existing);
  if (!topic) return { status: "skipped", reason: "未使用のトピックがありません（topics.ts に追加してください）", attempts: 0, model };
  log(`トピック: ${topic.title}（${topic.intent}）`);

  const facts = loadFacts();
  const factIndex = buildFactIndex(facts);
  const sourceUrls = allowedSourceUrls(facts);
  const allowedPaths = allowedInternalPaths(existing);
  const reservedIntents = guides.map((g) => g.intent);
  const pillarLinks = blogCategories.find((c) => c.slug === topic.category)?.pillarLinks ?? [];
  const ctx = { intent: topic.intent, existing, reservedIntents, allowedPaths, allowedSourceUrls: sourceUrls, factIndex, requiredLinks: topic.links, pillarLinks };

  const client = opts.fixture ? null : new Anthropic({ apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY });
  const system = buildSystemPrompt(facts);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: buildUserPrompt(topic, existing, allowedPaths, sourceUrls) }];

  let lastErrors: string[] = [];
  const remaining = () => (opts.deadlineAt === undefined ? Number.POSITIVE_INFINITY : opts.deadlineAt - Date.now());
  const outOfTime = (attempts: number): GenerateResult => ({
    status: "skipped",
    reason: "制限時間内に品質チェックを終えられませんでした（この回は公開しません）",
    topic,
    errors: lastErrors,
    attempts,
    model,
  });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let text: string;
    if (opts.fixture) {
      text = opts.fixture;
    } else {
      if (remaining() < WRITE_BUDGET_MS) {
        log(`試行${attempt}: 残り時間が足りないため、ここで終えます`);
        return outOfTime(attempt - 1);
      }
      // 事実シートを含む system は試行のたびに同じなので、キャッシュさせる（書き直しの呼び出しが安く・速くなる）
      const response = await client!.messages.create({ model, max_tokens: 8192, system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }], messages });
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
      article = extractJson<GeneratedArticle>(text);
    } catch (e) {
      lastErrors = [`JSONの解析に失敗: ${(e as Error).message}`];
      log(`試行${attempt}: ${lastErrors[0]}`);
      if (opts.fixture) break;
      messages.push({ role: "assistant", content: text }, { role: "user", content: "JSONとして解析できませんでした。同じ内容を、前後に説明を付けずJSONだけで返してください。" });
      continue;
    }

    // ── 機械の検査
    const checked = validate(article, ctx);
    let errors = checked.errors;
    let claims = checked.claims;
    let reviewer = "none";

    // ── 読み直し（機械の検査に通ったものだけ）。読み直す時間が残っていなければ、公開しない
    if (errors.length === 0 && client && remaining() < REVIEW_BUDGET_MS) {
      log("読み直し: 残り時間が足りないため、行えませんでした");
      return outOfTime(attempt);
    }
    if (errors.length === 0 && (client || opts.reviewFixture !== undefined)) {
      const review = await reviewArticle({ client: client as Anthropic, model: reviewModel, facts, index: factIndex, article, fixture: opts.reviewFixture });
      reviewer = opts.reviewFixture !== undefined ? "fixture" : reviewModel;
      if (!review.ok) errors = review.errors;
      else claims = [...claims, ...review.claims];
      log(`読み直し: ${review.ok ? `合格（主張 ${review.claims.length} 件を確認）` : `不合格 ${review.errors.length} 件`}`);
    }

    if (errors.length === 0) {
      const date = todayJst();
      const slug = topic.slug || slugFromIntent(topic.intent, topic.category);
      const chars = countChars(article.body);
      const markdown = toMarkdown(article, topic, slug, date, compactClaims(claims), { gate: QUALITY_GATE_VERSION, checkedAt: date, chars, reviewer });
      log(`合格（${chars}字・主張 ${claims.length} 件）: ${article.title}`);
      return { status: "generated", topic, slug, filename: `${date}-${slug}.md`, markdown, attempts: attempt, model };
    }
    lastErrors = errors;
    log(`試行${attempt}: 品質ゲートで${errors.length}件 → ${errors.join(" / ")}`);
    if (opts.fixture) break;
    messages.push(
      { role: "assistant", content: text },
      {
        role: "user",
        content: `前回の記事には次の問題がありました。修正して、同じJSON形式で書き直してください。事実シートに無い内容は、言い換えるのではなく削ってください（本文は${MIN_BODY_CHARS.toLocaleString("ja-JP")}字以上を保つこと）。\n${errors.map((e) => `- ${e}`).join("\n")}`,
      },
    );
  }

  return { status: "skipped", reason: "品質ゲートを通過できませんでした（この回は公開しません）", topic, errors: lastErrors, attempts: MAX_ATTEMPTS, model };
}
