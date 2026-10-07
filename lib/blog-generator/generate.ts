import Anthropic from "@anthropic-ai/sdk";
import { topics, type Topic } from "./topics";
import { loadFacts, allowedSourceUrls } from "./facts";
import { validate, similarity, countChars, MIN_BODY_CHARS, type GeneratedArticle, type ExistingPost } from "./validate";
import { buildFactIndex, compactClaims, sourceTypeOf, type Claim, type FactIndex } from "./claims";
import { formatQuality } from "./score";
import { findCannibalPage } from "../seo-map";
import { findPageLabel } from "../page-labels";
import { blogCategories } from "../../data/blog-categories";
import { guides } from "../../data/guides";
import { STATIC_ROUTES } from "../routes";
import { areasWithPage } from "../../data/areas";
import { sources as sourceRegistry } from "../../data/sources";

/**
 * ブログ記事の自動生成（共通コア）。
 * - scripts/generate-blog-post.ts（ローカル／GitHub Actions）と
 *   app/api/cron/generate-post/route.ts（Vercel Cron）の両方から使う。
 * - モデルは ANTHROPIC_MODEL（書く）と ANTHROPIC_REVIEW_MODEL（読み直す）で差し替え可能。
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

/**
 * 記事を書くモデルの既定値（ANTHROPIC_MODEL で変えられる）。
 * 同じ題材・同じ読み直しで、実際のモデルを比べて決めた（2026-10-02）。
 *   claude-haiku-4-5  … 5回書き直しても通らなかった（3回試して3回とも）。誤字（「葛飺区」「急わせる」）と、
 *                        事実シートに無い補足が毎回入り、読み直しで8件前後の指摘が入れ替わるだけだった
 *   claude-sonnet-5-5 … 読み直しの指摘は毎回1件で、4回目に合格。記事を読んでも、根拠と出どころが揃っていた
 * 安いモデルで書いて毎日落ちるより、通る記事を書けるモデルを使う（1回の実行の目安は README に記載）。
 */
export const DEFAULT_MODEL = "claude-sonnet-5-5";
/**
 * 公開前の読み直しに使うモデルの既定値（ANTHROPIC_REVIEW_MODEL で変えられる）。
 * 書くモデルと同じ軽いモデルで読み直すと、根拠のない理由づけや、対応エリアを広げた書き方を見逃した（実際に試して分かった）。
 * ここが公開の最後の関門なので、書くモデルより上のモデルを使う（そのぶん、読み直し1回の時間と費用は、書く1回より大きい）。
 * このモデルを呼べなかったとき（権限・名前の誤りなど）は、書くモデルで読み直す。
 */
export const DEFAULT_REVIEW_MODEL = "claude-opus-5-5";
/** 品質ゲートの版。検査の内容を変えたら上げる（記事の frontmatter に残る） */
export const QUALITY_GATE_VERSION = 5;
const HISTORY_SIZE = 40;
/**
 * 書き直しの回数の上限。実際のモデルで試したところ、1回目は機械の検査、2〜3回目は読み直しで落ち、
 * 指摘の数は回を追うごとに減った。4回目で合格した回があったので、余裕を見て5回目まで認める。
 */
const MAX_ATTEMPTS = 5;

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
  /** 公開しなかったとき：読み直しまで進んだ最後の原稿（保存はしない。試すときに、何が落とされたのかを読むため） */
  draft?: string;
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
/**
 * 既存の記事と検索意図・題名が近いために、新しく書かない題材（まだ同じ slug の記事は無いもの）。
 * 新しい記事を足すのではなく、当たった既存記事を直す候補として扱う。
 */
export function updateCandidates(existing: ExistingPost[]): { topic: Topic; post: ExistingPost }[] {
  const out: { topic: Topic; post: ExistingPost }[] = [];
  for (const t of topics) {
    if (existing.some((p) => p.slug === t.slug)) continue;
    const post = existing.find((p) => (p.intent && similarity(p.intent, t.intent) > 0.7) || similarity(p.title, t.title) > 0.55);
    if (post) out.push({ topic: t, post });
  }
  return out;
}

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
  例外は、事実シートの「SII の蓄電システム登録基準」にある数値だけ。使うときは「SII の登録基準では」と、出どころを同じ文に書く。
- SOLAR SHIFT 自身について書いてよいのは、事実シートの「サービス（SOLAR SHIFT）」の節にあることだけ（運営会社、対応エリア、現地調査と見積もりが無料であること）。
- 事実シートの「施工事例」の節にある内容（お客様の電気代や設備）は、記事に書かない。
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
- ## 見出しを5〜6本。### は必要なときだけ。# は使わない。見出しの下には、それぞれ350〜450字の本文を書く（短い区画を作らない）。
- 本文は2,300〜2,800字。1,800字に満たない記事は公開されない。description は90〜120文字（文字数を数えてから出す）。
- 事実シートに無い理由づけ・推測を書かない。「区がなぜそう呼びかけているのか」「業者がなぜそうするのか」を自分で作らない。
  「〜と考えられます」「〜可能性が高いです」「〜ことを示しています」「〜と判断して間違いありません」のような書き方をしない。
  事実シートにあること（だれが、何を決めている・勧めている・呼びかけている）と、読者が確かめる手順だけを書く。
- SOLAR SHIFT の対応エリアは、事実シートのとおりに書く（葛飾区が中心。周辺は足立区・江戸川区・墨田区）。「東京都内」「都内全域」のように広げない。
- 本文で事実として書いた内容は、その内容が載っている節の出典URLを、必ず sources に入れる。葛飾区のページにあることを書いたら葛飾区のページのURLを、区の案内（PDF）にあることを書いたら案内のURLを入れる。
- 公式資料の文言を「」で引用してよいのは、事実シートに「」つきで載っている文言だけ。それ以外は「」を付けず、「区は〜と呼びかけています」のように自分の言葉で書く。
- 見出しそのものをリンクにしない。リンクは本文の文章の中に置き、リンクの文言は、リンク先のページの内容に合わせる（下の一覧の、かっこの中がそのページの内容）。
- 記事の書き方そのものについての断り（「この記事では推測しません」「事実シートによると」「書かれていることだけをお伝えします」など）を本文に書かない。「事実シート」という言葉は、読者には見えない内部の資料の名前なので、使わない。
- 書き終えたら、誤字・脱字が無いかを読み返す。
- 数値を扱う箇所では Markdown の表を1つ以上使う。
- 補助金・制度の数値には「2026年10月1日時点の葛飾区の公式情報」のように、時点と出典元を添える。
- 制度に触れる記事では「最新情報は公式サイトでご確認ください」と必ず書く。
- 区と都の助成額は別々に示し、合計額は書かない。併用に触れるときは「葛飾区の案内では、国や都の補助制度との併用も可能。ただし、補助金の合計が助成対象経費を上回る場合は、上回る額が減額される」と書く。
- 大げさな広告表現（究極・最安・No.1・トップクラス・必ず・絶対）は禁止。
- SOLAR SHIFT の実績・件数・資格・スタッフ・電話番号・LINE・営業方法・返信の速さには触れない。
- 記事末尾に「監修」「参考資料」の見出しは作らない（サイト側で自動付与される）。
- 最後の段落で1回だけ、SOLAR SHIFT（運営：株式会社サイプレス）が現地調査・見積もりを無料で行っていることを短く書き、/contact か /simulation へリンクする。`;
}

/** リンク先のパスに、そのページの表示名を添える（リンクの文言を、リンク先の内容に合わせてもらうため） */
function withLabel(path: string): string {
  const label = findPageLabel(path);
  return label ? `${path}（${label}）` : path;
}

function buildUserPrompt(topic: Topic, existing: ExistingPost[], allowedPaths: Set<string>, sourceUrls: Set<string>): string {
  const history = existing.slice(0, HISTORY_SIZE);
  const category = blogCategories.find((c) => c.slug === topic.category);
  return `次の記事を書いてください。

- テーマ: ${topic.title}
- 狙う検索: 「${topic.intent}」
- 切り口: ${topic.angle}
- カテゴリ: ${topic.category}（${category?.name ?? ""}）
- 本文に必ず入れる固定ページへの内部リンク（すべて入れる。かっこの中は、そのページの内容）: ${topic.links.map(withLabel).join(" , ")}
- リンクしてよいパス（これ以外へのリンクは禁止。かっこの中は、そのページの内容）: ${[...allowedPaths]
    .filter((p) => !p.startsWith("/blog/"))
    .map(withLabel)
    .join(" , ")}
- 出典に使ってよいURL（これ以外は禁止。本文で使った数値・制度の出典を、すべて sources に入れる）: ${[...sourceUrls].join(" , ")}

すでに公開している記事（内容・タイトル・検索意図・見出しの構成が重ならないようにしてください）:
${history.length ? history.map((p) => `- ${p.title}（狙い: ${p.intent || "不明"}）`).join("\n") : "（まだありません）"}

次の形式のJSONだけを返してください。前後に説明文やコードフェンスを付けないでください。

{
  "title": "35文字以内。検索意図に沿い、具体的であること",
  "description": "90〜120文字。この記事を読むと何がわかるかを説明する",
  "tags": ["3〜5個", "日本語の短い語"],
  "sources": [{ "name": "出典名", "url": "許可されたURLのみ。本文の数値・制度の根拠にしたものをすべて" }],
  "faq": [
    { "q": "この記事の内容に関する質問", "a": "事実シートの範囲で答える。60〜140文字" },
    { "q": "もう1つの質問", "a": "同上" }
  ],
  "body": "Markdown本文。2,300〜2,800字（1,800字未満は不合格）。## の見出しを使う。[表示テキスト](/パス) で内部リンク"
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
  /**
   * 主張の根拠として確認できたのに、記事の sources に入っていなかった出典URL。
   * 合格した記事には、この出典を足してから保存する（本文と参考資料の対応を、機械的にそろえる）。
   */
  missingSources: string[];
  /**
   * 読み直しそのものを終えられなかった（出力の上限に達した・返答を解析できなかった など）。
   * 記事の出来とは関係が無いので、書き直しは求めずに、読み直しだけをやり直す。
   */
  incomplete?: boolean;
  /** 制限時間が来て、読み直しを途中で打ち切った */
  timedOut?: boolean;
  /** 読み直しで使ったトークン数（ログに出して、上限と費用の見当をつける。fixture のときは無い） */
  usage?: { input: number; output: number };
}

/**
 * 読み直しの出力の上限。上位のモデルは、答えを書く前の思考も出力として数えるので、余裕を持たせる
 * （4,096 のときは、思考だけで上限に達して、結果の JSON が途中で切れた）。
 * 上限は「ここまでは使ってよい」という歯止めで、実際に使う量は記事の長さで決まる。
 */
const REVIEW_MAX_TOKENS = 16000;

/** 読み直しで、運営者から確認した内容（事実シートの「サービス」の節。出典URLなし）を指すときの source の値 */
export const OPERATOR_SOURCE = "operator";
/** 運営者についての説明だと言える主張か（"operator" を、関係のない主張の抜け道にさせない） */
const OPERATOR_CLAIM = /SOLAR SHIFT|ソーラーシフト|サイプレス|運営|現地調査|見積|対応エリア|お問い合わせ|ご相談|無料/;

/** 出典URLの表示名。出典の登録簿（data/sources.ts）に無ければ、事実シートの「出典：」の行から取る */
export function sourceNameFor(url: string, facts: string): string {
  const registered = Object.values(sourceRegistry).find((s) => s.url === url);
  if (registered) return registered.name;
  for (const line of facts.split(/\r?\n/)) {
    const i = line.indexOf(url);
    if (i <= 0) continue;
    const label = line
      .slice(0, i)
      .replace(/^[-\s]*出典[：:]?/, "")
      .trim();
    if (label) return label;
  }
  return url;
}

function buildReviewPrompt(article: GeneratedArticle): string {
  return `次のブログ記事を、公開前に点検してください。

点検すること：記事の中の「制度・手続き・要件・日付・機器や技術の説明・SOLAR SHIFT についての説明」にあたる主張を1つずつ取り出し、
システムプロンプトの「検証済み事実シート」に書かれているかどうかを判定する。

- 事実シートに書かれている主張 … supported を true にし、source にその節の出典URLを入れる
- 事実シートに書かれていない主張 … supported を false にし、source は空文字にする
  （数値が無くても、制度の条件・手続きの順番・機器の性質を事実として述べていれば対象）
- SOLAR SHIFT 自身についての説明（運営会社、対応エリア、現地調査と見積もりが無料であること）で、
  事実シートの「サービス（SOLAR SHIFT）」の節に書かれているもの … supported を true にし、source に "operator" と入れる
  （この節は運営者から確認した内容で、出典URLが無い）
- 事実シートの「施工事例」の節にある内容（お客様の電気代・設備）を記事が書いていたら … supported を false にする（記事には書けない決まり）
- SOLAR SHIFT の対応エリアを、事実シートより広く書いていたら（例：「東京都内で対応」）… supported を false にする
- 事実シートに無い理由づけ・推測を、事実のように書いている文 … supported を false にする
  （例：「区がこう呼びかけているのは〜だからです」「〜という営業手法が存在することを示しています」「〜する業者は、〜している可能性が高いです」。
   区や協会が何を言っているかは事実シートで確かめられるが、その理由や、業者の意図は、事実シートに書かれていない）
- 「2026年10月1日時点の公式情報」のように、情報の時点と出どころを示すだけの言い回しは、主張として取り出さない
- 判定しなくてよいもの：読者への呼びかけ、「見積もりで確認しましょう」のような助言、
  「機種によって異なる」という書き方、屋根や電気の使い方によって変わるという一般的な注意

あわせて、文章の誤りを wording に挙げてください（無ければ空の配列）。
- 誤字・脱字、日本語として存在しない語や活用（例：「急わせる」）
- リンクの文言と、リンク先のページの内容が合っていない箇所（例：補助金の話なのに、業者選びのページへリンクしている）

claims には、supported が false のものをすべて入れる。supported が true のものは、記事の要になる主張を20件まで（細かい言い換えを1つずつ挙げなくてよい）。

次の形式のJSONだけを返してください。前後に説明文やコードフェンスを付けないでください。

{
  "claims": [
    { "claim": "記事中の主張（1文・80字以内に要約）", "source": "出典URLまたは空文字", "supported": true }
  ],
  "wording": ["誤りのある箇所と、その理由（1件40字以内）"]
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
export async function reviewArticle(opts: {
  client: Anthropic;
  model: string;
  facts: string;
  index: FactIndex;
  article: GeneratedArticle;
  fixture?: string;
  /** この時間（ミリ秒）が過ぎたら、読み直しを打ち切る。実行時間に上限のある場所から呼ぶときに渡す */
  timeoutMs?: number;
}): Promise<ReviewResult> {
  let text = opts.fixture;
  let usage: ReviewResult["usage"];
  // 読み直しを終えられなかったときの結果（記事の出来とは関係が無い。呼び出し側が、読み直しだけをやり直す）
  const unfinished = (message: string, timedOut = false): ReviewResult => ({ ok: false, claims: [], errors: [message], missingSources: [], incomplete: true, timedOut, usage });

  if (text === undefined) {
    // 出力の上限を大きく取るので、ストリーミングで受け取る（長い応答で接続が切れるのを避ける）。結果は finalMessage() でまとめて受け取る。
    // 事実シートを含む system は読み直しのたびに同じなので、キャッシュさせる（同じ回の2度目からの読み直しが安く・速くなる）
    const stream = opts.client.messages.stream({
      model: opts.model,
      max_tokens: REVIEW_MAX_TOKENS,
      system: [
        {
          type: "text",
          text: `あなたは、公開前の記事を事実と照らし合わせる校閲者です。記事を良く見せる必要はありません。事実シートに書かれていない主張を、見逃さずに挙げてください。\n\n${opts.facts}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildReviewPrompt(opts.article) }],
    });
    const timer = opts.timeoutMs === undefined ? undefined : setTimeout(() => stream.abort(), Math.max(0, opts.timeoutMs));
    let response: Anthropic.Message;
    try {
      response = await stream.finalMessage();
    } catch (e) {
      // 自分で打ち切ったとき。それ以外の失敗（権限・通信など）は、呼び出し側へそのまま伝える
      if (e instanceof Anthropic.APIUserAbortError) return unfinished("読み直しが制限時間内に終わりませんでした", true);
      throw e;
    } finally {
      clearTimeout(timer);
    }
    usage = {
      input: response.usage.input_tokens + (response.usage.cache_creation_input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0),
      output: response.usage.output_tokens,
    };
    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
      return unfinished(`読み直しを完了できませんでした（${response.stop_reason}）`);
    }
    text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  let parsed: { claims?: ReviewedClaim[]; wording?: unknown };
  try {
    parsed = extractJson<{ claims?: ReviewedClaim[]; wording?: unknown }>(text);
  } catch (e) {
    return unfinished(`読み直しの結果を解析できませんでした: ${(e as Error).message}`);
  }
  if (!Array.isArray(parsed.claims)) return unfinished("読み直しの結果に claims がありません");

  const errors: string[] = [];
  const claims: Claim[] = [];
  const listed = new Set(opts.article.sources.map((s) => s.url));
  const missing = new Set<string>();
  for (const c of parsed.claims) {
    if (!c || typeof c.claim !== "string") continue;
    if (!c.supported) {
      errors.push(`事実シートで確認できない主張: 「${c.claim.slice(0, 60)}」`);
      continue;
    }
    // 運営者から確認した内容（事実シートの「サービス」の節）。出典URLは無いので、sources との突き合わせはしない。
    // 運営者についての説明だと言えない主張に "operator" が付いていたら、根拠なしとして落とす
    if (c.source === OPERATOR_SOURCE) {
      if (!OPERATOR_CLAIM.test(c.claim)) errors.push(`出典を特定できない主張: 「${c.claim.slice(0, 60)}」`);
      continue;
    }
    const type = c.source ? opts.index.sources.get(c.source) ?? null : null;
    if (!c.source || !type) {
      errors.push(`出典を特定できない主張: 「${c.claim.slice(0, 60)}」`);
      continue;
    }
    // 根拠は事実シートで確認できたが、記事の sources に入っていない。記事が合格したときに、この出典を足す
    if (!listed.has(c.source)) missing.add(c.source);
    claims.push({ claim: c.claim.slice(0, 160), source: c.source, sourceType: type, verified: true });
  }
  // 誤字・不自然な語・リンクの文言とリンク先の食い違い
  if (Array.isArray(parsed.wording)) {
    for (const w of parsed.wording) {
      if (typeof w === "string" && w.trim()) errors.push(`文章の誤りがあります: ${w.trim().slice(0, 80)}`);
    }
  }
  return { ok: errors.length === 0, claims, errors: errors.slice(0, 8), missingSources: [...missing], usage };
}

// ─────────────────────────────────────────────────────────────── 出力

export interface QualityMeta {
  gate: number;
  checkedAt: string;
  chars: number;
  /** 品質スコア（6項目・各1〜5点）を1行にしたもの（score.ts の formatQuality） */
  scores?: string;
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
    ...(quality ? ["quality:", `  gate: ${quality.gate}`, `  checkedAt: "${quality.checkedAt}"`, `  chars: ${quality.chars}`, ...(quality.scores ? [`  scores: "${escapeYaml(quality.scores)}"`] : []), `  reviewer: "${escapeYaml(quality.reviewer)}"`] : []),
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

/**
 * 1回の執筆に見ておく時間・読み直しに見ておく時間（ミリ秒）。残りがこれより短ければ始めない。
 * 読み直しは、上位のモデルだと1分前後かかる（実測：出力 4,096 トークンで約35秒）。
 * 始めたあとに制限時間が来たら、読み直しを打ち切って「この回は公開しない」で終える。
 */
const WRITE_BUDGET_MS = 80_000;
const REVIEW_BUDGET_MS = 60_000;
/**
 * 記事を書くときの出力の上限。記事そのものは 4,000 トークン前後だが、思考を行うモデルは、思考も出力として数えられる
 * （実測：既定のモデルの1回目は 10,837 トークン、書き直しは 3,600〜4,900 トークン）。途中で切れないように余裕を持たせる。
 */
const WRITE_MAX_TOKENS = 16000;

export async function generateArticle(opts: GenerateOptions): Promise<GenerateResult> {
  const log = opts.log ?? (() => {});
  const model = (opts.model ?? process.env.ANTHROPIC_MODEL ?? "").trim() || DEFAULT_MODEL;
  // 読み直しに使うモデル。呼べなかったときは、書くモデルに切り替える（その実行のあいだ）
  let reviewModel = (opts.reviewModel ?? process.env.ANTHROPIC_REVIEW_MODEL ?? "").trim() || DEFAULT_REVIEW_MODEL;
  const existing = opts.existing;

  // 既存の記事と検索意図が近い題材は、新しく書かない（その記事の更新で受ける）。どれが当たったかをログに残す
  for (const c of updateCandidates(existing)) log(`題材「${c.topic.title}」は、既存記事「${c.post.title}」と検索意図が近いため書きません（既存記事の更新候補）`);

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
  let lastDraft: string | undefined;
  const remaining = () => (opts.deadlineAt === undefined ? Number.POSITIVE_INFINITY : opts.deadlineAt - Date.now());
  const outOfTime = (attempts: number): GenerateResult => ({
    status: "skipped",
    reason: "制限時間内に品質チェックを終えられませんでした（この回は公開しません）",
    topic,
    errors: lastErrors,
    attempts,
    model,
    draft: lastDraft,
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
      const writeStartedAt = Date.now();
      const response = await client!.messages.create({ model, max_tokens: WRITE_MAX_TOKENS, system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }], messages });
      const writeInput = response.usage.input_tokens + (response.usage.cache_creation_input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0);
      log(`試行${attempt}（${model}）: 入力 ${writeInput.toLocaleString("en-US")} / 出力 ${response.usage.output_tokens.toLocaleString("en-US")} トークン・${Math.round((Date.now() - writeStartedAt) / 1000)}秒`);
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
    log(`試行${attempt}: 品質スコア ${formatQuality(checked.scores)}`);
    let errors = checked.errors;
    let claims = checked.claims;
    let reviewer = "none";
    /** この試行の不合格が、読み直しによるものか（機械の検査には通っている） */
    let reviewed = false;

    // ── 読み直し（機械の検査に通ったものだけ）。読み直す時間が残っていなければ、公開しない
    if (errors.length === 0 && client && remaining() < REVIEW_BUDGET_MS) {
      log("読み直し: 残り時間が足りないため、行えませんでした");
      return outOfTime(attempt);
    }
    if (errors.length === 0 && (client || opts.reviewFixture !== undefined)) {
      const reviewing = article;
      const startedAt = Date.now();
      // 制限時間があるときは、残り時間が尽きたところで読み直しを打ち切る
      const runReview = (reviewWith: string) =>
        reviewArticle({
          client: client as Anthropic,
          model: reviewWith,
          facts,
          index: factIndex,
          article: reviewing,
          fixture: opts.reviewFixture,
          timeoutMs: opts.deadlineAt === undefined ? undefined : remaining(),
        });
      let review: ReviewResult;
      try {
        review = await runReview(reviewModel);
      } catch (e) {
        // 読み直し用のモデルを呼べなかった（権限が無い・名前が違うなど）。書くモデルで読み直す
        if (reviewModel === model) throw e;
        log(`読み直し: ${reviewModel} を呼べなかったため、${model} で読み直します（${(e as Error).message.slice(0, 120)}）`);
        reviewModel = model;
        review = await runReview(reviewModel);
      }
      // 読み直しを最後まで終えられなかった（出力が上限に達した・結果を解析できなかった）。記事の出来とは関係が無いので、
      // 書き直しは求めずに、読み直しだけをもう一度行う
      const live = opts.reviewFixture === undefined;
      if (live && review.incomplete && !review.timedOut && remaining() >= REVIEW_BUDGET_MS) {
        log(`読み直し: 最後まで終えられなかったため、やり直します（${review.errors[0]}）`);
        review = await runReview(reviewModel);
      }
      reviewer = live ? reviewModel : "fixture";
      const spent = review.usage ? `・入力 ${review.usage.input.toLocaleString("en-US")} / 出力 ${review.usage.output.toLocaleString("en-US")} トークン・${Math.round((Date.now() - startedAt) / 1000)}秒` : "";
      // それでも終えられなければ、この回は公開しない（下位のモデルの読み直しで代えることはしない。読み直せていない記事は出さない）
      if (live && review.incomplete) {
        log(`読み直し: 終えられませんでした（${review.errors[0]}${spent}）`);
        lastErrors = review.errors;
        if (review.timedOut) return outOfTime(attempt);
        return { status: "skipped", reason: "公開前の読み直しを終えられませんでした（この回は公開しません）", topic, errors: review.errors, attempts: attempt, model };
      }
      if (!review.ok) {
        errors = review.errors;
        reviewed = true;
        lastDraft = toMarkdown(article, topic, topic.slug || slugFromIntent(topic.intent, topic.category), todayJst());
      } else {
        claims = [...claims, ...review.claims];
        // 本文の根拠になっているのに sources に無かった出典を足す（参考資料と本文の対応をそろえる）
        for (const url of review.missingSources) article.sources.push({ name: sourceNameFor(url, facts), url });
        if (review.missingSources.length > 0) log(`読み直し: 本文の根拠になっている出典を sources に追加（${review.missingSources.length} 件）`);
      }
      log(`読み直し（${reviewer}）: ${review.ok ? `合格（主張 ${review.claims.length} 件を確認${spent}）` : `不合格 ${review.errors.length} 件${spent ? `（${spent.slice(1)}）` : ""}`}`);
    }

    if (errors.length === 0) {
      const date = todayJst();
      const slug = topic.slug || slugFromIntent(topic.intent, topic.category);
      const chars = countChars(article.body);
      const markdown = toMarkdown(article, topic, slug, date, compactClaims(claims), { gate: QUALITY_GATE_VERSION, checkedAt: date, chars, scores: formatQuality(checked.scores), reviewer });
      log(`合格（${chars}字・主張 ${claims.length} 件）: ${article.title}`);
      return { status: "generated", topic, slug, filename: `${date}-${slug}.md`, markdown, attempts: attempt, model };
    }
    lastErrors = errors;
    log(`試行${attempt}: 品質ゲートで${errors.length}件 → ${errors.join(" / ")}`);
    if (opts.fixture) break;
    const minChars = MIN_BODY_CHARS.toLocaleString("ja-JP");
    // 読み直しで落ちた記事は、機械の検査には通っている。全体を書き直させると、直した分だけ新しい説明が足されて、また落ちる
    // （実際のモデルで試すと、指摘が 8件 → 8件 → 3件 と入れ替わるだけで、5回とも通らなかった）。指摘された文だけを直させる
    const request = reviewed
      ? `前回の記事を、公開前の読み直しにかけたところ、次の箇所が事実シートで確認できませんでした。
指摘された文だけを、削るか、事実シートに書いてある内容に直してください。指摘されていない文は、一字も変えないでください（新しい説明・理由づけ・一般論を足さない）。
削って本文が${minChars}字を下回るときは、事実シートの関連する節にある内容（条件・書類・日付・手順）を、出どころを添えて足してください。
同じJSON形式で、記事の全体を返してください。`
      : `前回の記事には次の問題がありました。修正して、同じJSON形式で書き直してください。事実シートに無い内容は、言い換えるのではなく削ってください（本文は${minChars}字以上を保つこと）。`;
    messages.push({ role: "assistant", content: text }, { role: "user", content: `${request}\n${errors.map((e) => `- ${e}`).join("\n")}` });
  }

  return { status: "skipped", reason: "品質ゲートを通過できませんでした（この回は公開しません）", topic, errors: lastErrors, attempts: MAX_ATTEMPTS, model, draft: lastDraft };
}
