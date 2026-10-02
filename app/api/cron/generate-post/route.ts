import { NextResponse } from "next/server";
import { generateArticle } from "@/lib/blog-generator/generate";
import { readExistingPosts } from "@/lib/blog-generator/existing";

/**
 * Vercel Cron から1日1回呼ばれる記事生成エンドポイント。
 *
 * 認証: Authorization: Bearer <CRON_SECRET>（Vercel Cron は CRON_SECRET を設定すると自動で付ける）
 * 手動で試すとき: URL の末尾に ?dry=1 を付けると、保存せずに生成された内容だけを返す
 *
 * 永続化: サーバーレス関数はファイルを書けないため、GitHub の Contents API で
 *         content/blog/<file>.md をコミットする（→ Vercel が自動で再デプロイ）。
 *         GITHUB_TOKEN / GITHUB_REPO が未設定の場合は生成結果を返すだけで保存しない。
 *
 * 毎日1本を必ず出す仕組みではない。生成 → 機械の検査 → 読み直し の全部に通ったときだけコミットする。
 * 通らなかった日・時間内に終わらなかった日は、何も保存せずに status: "skipped" を返す（失敗ではない）。
 *
 * 必要な環境変数:
 *   ANTHROPIC_API_KEY, ANTHROPIC_MODEL（任意）, ANTHROPIC_REVIEW_MODEL（任意）, CRON_SECRET
 *   GITHUB_TOKEN（contents:write）, GITHUB_REPO（owner/name）, GITHUB_BRANCH（任意・既定 main）
 *
 * 実行時間: 執筆と読み直しで2回以上モデルを呼ぶため、1分では足りないことがある。
 *   maxDuration はあえて書かない。Vercel の Fluid compute（既定で有効）なら、関数の上限は既定で 300 秒になる。
 *   プランの上限を超える値をここに書くと、デプロイそのものが失敗する（Fluid compute を切った Hobby プランは上限 60 秒）。
 *   300 秒の少し手前（TIME_BUDGET_MS）で自分から終える。上限がそれより短い設定のプロジェクトでは、
 *   途中で打ち切られて何も保存されないので、GitHub Actions 版（.github/workflows/daily-blog.yml）を使う。
 */

export const dynamic = "force-dynamic";
/** 上限の手前で終えるための持ち時間（GitHub へのコミットと応答の時間を残す） */
const TIME_BUDGET_MS = 270_000;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

async function commitToGitHub(filename: string, markdown: string, message: string) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) return { persisted: false as const, reason: "GITHUB_TOKEN / GITHUB_REPO が未設定" };

  const apiPath = `https://api.github.com/repos/${repo}/contents/content/blog/${filename}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  // 同名ファイルが既にあれば二重投稿しない
  const head = await fetch(`${apiPath}?ref=${encodeURIComponent(branch)}`, { headers });
  if (head.status === 200) return { persisted: false as const, reason: "同名のファイルが既に存在" };

  const res = await fetch(apiPath, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message,
      content: Buffer.from(markdown, "utf8").toString("base64"),
      branch,
      committer: { name: "SOLAR SHIFT Blog Bot", email: "bot@users.noreply.github.com" },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { persisted: false as const, reason: `GitHub API ${res.status}: ${body.slice(0, 200)}` };
  }
  const json = (await res.json()) as { commit?: { sha?: string } };
  return { persisted: true as const, sha: json.commit?.sha };
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, error: "ANTHROPIC_API_KEY が未設定" }, { status: 500 });
  }

  const logs: string[] = [];
  const existing = readExistingPosts();
  let result: Awaited<ReturnType<typeof generateArticle>>;
  try {
    result = await generateArticle({ existing, deadlineAt: Date.now() + TIME_BUDGET_MS, log: (m) => logs.push(m) });
  } catch (e) {
    // API の障害など。記事は保存されていない（次の回にやり直す）
    return NextResponse.json({ ok: false, status: "error", error: (e as Error).message.slice(0, 300), logs }, { status: 502 });
  }

  if (result.status === "skipped") {
    return NextResponse.json({ ok: true, status: "skipped", reason: result.reason, errors: result.errors, topic: result.topic?.title, model: result.model, logs });
  }

  // ?dry=1 … 保存せずに、生成された内容だけを返す（手動で試すとき用）
  const dryRun = new URL(req.url).searchParams.get("dry") === "1";
  const commit = dryRun
    ? { persisted: false as const, reason: "dry=1 のため保存していません" }
    : await commitToGitHub(result.filename!, result.markdown!, `blog: ${result.topic!.title}`);

  return NextResponse.json({
    ok: true,
    status: "generated",
    filename: result.filename,
    slug: result.slug,
    title: result.topic?.title,
    model: result.model,
    attempts: result.attempts,
    persisted: commit.persisted,
    commit: commit.persisted ? commit.sha : commit.reason,
    logs,
    ...(dryRun || !commit.persisted ? { markdown: result.markdown } : {}),
  });
}
