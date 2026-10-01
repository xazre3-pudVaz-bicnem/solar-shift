import { NextResponse } from "next/server";
import { generateArticle } from "@/lib/blog-generator/generate";
import { readExistingPosts } from "@/lib/blog-generator/existing";

/**
 * Vercel Cron から1日1回呼ばれる記事生成エンドポイント。
 *
 * 認証: Authorization: Bearer <CRON_SECRET>（Vercel Cron は CRON_SECRET を設定すると自動で付ける）
 *
 * 永続化: サーバーレス関数はファイルを書けないため、GitHub の Contents API で
 *         content/blog/<file>.md をコミットする（→ Vercel が自動で再デプロイ）。
 *         GITHUB_TOKEN / GITHUB_REPO が未設定の場合は生成結果を返すだけで保存しない。
 *
 * 必要な環境変数:
 *   ANTHROPIC_API_KEY, ANTHROPIC_MODEL（任意）, CRON_SECRET, SITE_URL（任意）
 *   GITHUB_TOKEN（contents:write）, GITHUB_REPO（owner/name）, GITHUB_BRANCH（任意・既定 main）
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  const result = await generateArticle({ existing, log: (m) => logs.push(m) });

  if (result.status === "skipped") {
    return NextResponse.json({ ok: true, status: "skipped", reason: result.reason, errors: result.errors, topic: result.topic?.title, model: result.model, logs });
  }

  const commit = await commitToGitHub(result.filename!, result.markdown!, `blog: ${result.topic!.title}（自動生成）`);
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry") === "1";

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
