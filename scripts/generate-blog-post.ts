#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜ブログ記事の自動生成
 *
 * 毎日1本を必ず出す仕組みではない。毎日、生成を試み、品質基準を満たしたときだけ保存する
 * （基準を満たさなければ、その日は何も保存せずに終わる。終了コードは 0）。
 *
 *   npm run blog:generate            … 生成 → 品質チェック → 合格なら content/blog に保存
 *   npm run blog:dry-run             … 保存せず標準出力へ
 *   npm run blog:audit               … 公開済みの記事を、同じ品質ゲートで点検する（API は呼ばない）
 *
 * 環境変数
 *   ANTHROPIC_API_KEY        … 必須（fixture 時は不要）
 *   ANTHROPIC_MODEL          … 記事を書くモデル（未設定なら claude-haiku-4-5）
 *   ANTHROPIC_REVIEW_MODEL   … 公開前の読み直しに使うモデル（未設定なら記事と同じモデル）
 *   DRY_RUN=1                … 保存しない
 *   DRY_RUN_FIXTURE=path     … API を呼ばず、固定の JSON（記事）で機械の検査だけ試す
 *   DRY_RUN_REVIEW_FIXTURE=path … fixture のとき、読み直しの結果として使う JSON（省略すると読み直しは行わない）
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
const REVIEW_FIXTURE = process.env.DRY_RUN_REVIEW_FIXTURE;

async function main() {
  const existing = readExistingPosts(BLOG_DIR);
  console.log(`既存記事: ${existing.length}本`);

  const fixture = FIXTURE ? fs.readFileSync(path.resolve(ROOT, FIXTURE), "utf8") : undefined;
  const reviewFixture = REVIEW_FIXTURE ? fs.readFileSync(path.resolve(ROOT, REVIEW_FIXTURE), "utf8") : undefined;
  if (!fixture && !process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY が設定されていません。");
    process.exit(1);
  }

  const result = await generateArticle({ existing, fixture, reviewFixture, log: (m) => console.log(m) });

  if (result.status === "skipped") {
    console.log(`公開しません: ${result.reason}`);
    if (result.errors) for (const e of result.errors) console.log(`  - ${e}`);
    // 公開しないことは失敗ではない（基準を満たさない記事を出さないのが、この仕組みの役目）
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
