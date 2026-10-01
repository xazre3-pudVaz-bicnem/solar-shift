import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ExistingPost } from "./validate";

/**
 * 既存記事の読み込み（generator 用の軽量版）。
 * lib/blog.ts と同じディレクトリ・同じ frontmatter を読むが、
 * draft も含めて「重複チェックの対象」にする。
 */
export function readExistingPosts(dir = path.join(process.cwd(), "content", "blog")): (ExistingPost & { category: string; publishedAt: string })[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse()
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: String(data.slug ?? f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "")),
        title: String(data.title ?? ""),
        intent: String(data.intent ?? ""),
        category: String(data.category ?? ""),
        publishedAt: String(data.publishedAt ?? ""),
        body: content,
      };
    });
}
