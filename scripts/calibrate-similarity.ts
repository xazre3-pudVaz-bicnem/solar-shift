#!/usr/bin/env tsx
/**
 * 既存記事どうしの類似度を測って、validate.ts の閾値が厳しすぎないか確認する。
 *   npx tsx scripts/calibrate-similarity.ts [fixture.json]
 * 手書き記事どうしの最大値より閾値が低いと、正常な記事まで「焼き直し」扱いになる。
 */
import fs from "node:fs";
import path from "node:path";
import { readExistingPosts } from "../lib/blog-generator/existing";
import { similarity, shingleOverlap } from "../lib/blog-generator/validate";

const posts = readExistingPosts(path.join(process.cwd(), "content", "blog"));
const pairs: { s: number; label: string }[] = [];
let titleMax = 0;
let intentMax = 0;
for (let i = 0; i < posts.length; i += 1) {
  for (let j = i + 1; j < posts.length; j += 1) {
    pairs.push({ s: shingleOverlap(posts[i].body, posts[j].body), label: `${posts[i].slug} <> ${posts[j].slug}` });
    titleMax = Math.max(titleMax, similarity(posts[i].title, posts[j].title));
    intentMax = Math.max(intentMax, similarity(posts[i].intent, posts[j].intent));
  }
}
pairs.sort((a, b) => b.s - a.s);
console.log(`記事数: ${posts.length}`);
console.log("本文の8文字シングル重なり率 上位5件（閾値 0.2）:");
for (const p of pairs.slice(0, 5)) console.log(`  ${p.s.toFixed(3)}  ${p.label}`);
console.log(`タイトル類似度の最大: ${titleMax.toFixed(3)}`);
console.log(`検索意図類似度の最大: ${intentMax.toFixed(3)}`);

const fixture = process.argv[2];
if (fixture) {
  const fx = JSON.parse(fs.readFileSync(path.resolve(fixture), "utf8")) as { body: string; title: string };
  let max = 0;
  let who = "";
  for (const p of posts) {
    const s = shingleOverlap(fx.body, p.body);
    if (s > max) {
      max = s;
      who = p.slug;
    }
  }
  console.log(`fixture の本文類似度の最大: ${max.toFixed(3)}（${who}）`);
}
