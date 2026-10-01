#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜ブログ記事の自動生成（1日1本）
 *
 *   npm run blog:generate            … 生成して content/blog に保存
 *   npm run blog:dry-run             … 保存せず標準出力へ
 *   DRY_RUN_FIXTURE=path.json        … API を呼ばず、固定のJSONで品質ゲートだけ試す
 *
 * 環境変数
 *   ANTHROPIC_API_KEY … 必須（fixture 時は不要）
 *   ANTHROPIC_MODEL   … 使用モデル（未設定なら claude-haiku-4-5）
 *
 * Vercel Cron から実行する場合は app/api/cron/generate-post/route.ts を使う（同じコアを呼ぶ）。
 */
import fs from "node:fs";
import path from "node:path";
import { generateArticle } from "../lib/blog-generator/generate";
import { readExistingPosts } from "../lib/blog-generator/existing";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");
const DRY_RUN = process.env.DRY_RUN === "1";
const FIXTURE = process.env.DRY_RUN_FIXTURE;

async function main() {
  const existing = readExistingPosts(BLOG_DIR);
  console.log(`既存記事: ${existing.length}本`);

  const fixture = FIXTURE ? fs.readFileSync(path.resolve(ROOT, FIXTURE), "utf8") : undefined;
  if (!fixture && !process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY が設定されていません。");
    process.exit(1);
  }

  const result = await generateArticle({ existing, fixture, log: (m) => console.log(m) });

  if (result.status === "skipped") {
    console.log(`スキップ: ${result.reason}`);
    if (result.errors) for (const e of result.errors) console.log(`  - ${e}`);
    // スキップは失敗ではない（無理に公開しない）
    process.exit(0);
  }

  if (DRY_RUN || fixture) {
    console.log(`\n--- ${result.filename} ---\n${result.markdown}`);
    return;
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const file = path.join(BLOG_DIR, result.filename!);
  if (fs.existsSync(file)) {
    console.log(`同名のファイルが既にあります: ${file}（スキップ）`);
    return;
  }
  fs.writeFileSync(file, result.markdown!, "utf8");
  console.log(`保存しました: ${path.relative(ROOT, file)}（モデル: ${result.model}、試行: ${result.attempts}）`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
