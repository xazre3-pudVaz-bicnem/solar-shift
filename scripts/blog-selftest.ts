#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜ブログの品質ゲートの自己テスト（API は呼ばない）。
 *
 *   npm run blog:selftest
 *
 * scripts/fixtures の記事を品質ゲートにかけ、「通すべきものが通り、落とすべきものが落ちる」ことを確かめる。
 * lib/blog-generator/validate.ts・claims.ts や docs/VERIFIED_FACTS.md を直したら、これを回す。
 *
 *   blog-good.json       … 事実シートの範囲だけで書いた記事。機械の検査に通ること
 *   blog-bad.json        … 架空の経験・事例・費用、根拠のない数値や一般論を詰めた記事。全部の種類で落ちること
 *   blog-review-ok.json  … 読み直しの結果（すべて事実シートで確認できた）。合格になること
 *   blog-review-ng.json  … 読み直しの結果（確認できない主張が1つある）。不合格になること
 */
import fs from "node:fs";
import path from "node:path";
import { validate, type GeneratedArticle } from "../lib/blog-generator/validate";
import { buildFactIndex } from "../lib/blog-generator/claims";
import { loadFacts, allowedSourceUrls } from "../lib/blog-generator/facts";
import { allowedInternalPaths, reviewArticle, toMarkdown, sourceNameFor, OPERATOR_SOURCE, QUALITY_GATE_VERSION } from "../lib/blog-generator/generate";
import { readExistingPosts } from "../lib/blog-generator/existing";
import { guides } from "../data/guides";
import matter from "gray-matter";

const FIX = path.join(process.cwd(), "scripts", "fixtures");
const load = (name: string) => fs.readFileSync(path.join(FIX, name), "utf8");
const TOPIC = {
  intent: "葛飾区 太陽光 補助金 年度末 申請 間に合う",
  slug: "katsushika-subsidy-year-end-deadline",
  title: "年度末に葛飾区の太陽光補助金を申請するときの、日付の逆算",
  angle: "",
  category: "katsushika-subsidy",
  links: ["/subsidy/katsushika", "/flow"],
};

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
  if (!ok) failed += 1;
}

async function main() {
  const facts = loadFacts();
  const factIndex = buildFactIndex(facts);
  // 既存記事のうち、同じ題材（年度末の申請）を扱うものがあれば、重複検査から外して試す
  const existing = readExistingPosts().filter((p) => p.intent !== TOPIC.intent);
  const ctx = {
    intent: TOPIC.intent,
    existing,
    reservedIntents: guides.map((g) => g.intent),
    allowedPaths: allowedInternalPaths(existing),
    allowedSourceUrls: allowedSourceUrls(facts),
    factIndex,
    requiredLinks: TOPIC.links,
  };

  // ── 通すべき記事
  const good = JSON.parse(load("blog-good.json")) as GeneratedArticle;
  const g = validate(good, ctx);
  check("事実シートの範囲で書いた記事が、機械の検査に通る", g.errors.length === 0, g.errors.join(" / "));
  check("数値の主張が、出典つきで記録される", g.claims.length >= 10 && g.claims.every((c) => c.verified && c.source && c.sourceType), `${g.claims.length} 件`);

  // ── 落とすべき記事（種類ごとに、対応するエラーが出ること）
  const bad = JSON.parse(load("blog-bad.json")) as GeneratedArticle;
  const b = validate(bad, ctx).errors.join("\n");
  const expect: [string, RegExp][] = [
    ["薄い記事", /本文が短すぎます/],
    ["数値に一次情報がない", /一次情報で確認できていない数値/],
    ["メーカー不明の機器仕様", /機器仕様の数値/],
    ["架空の経験", /架空の経験/],
    ["架空の事例", /架空の施工事例/],
    ["架空の費用", /費用の具体額/],
    ["根拠なしの「一般的に」", /根拠を示さない一般化/],
    ["根拠なしの No.1", /No\.1・最上級/],
    ["出典元のない伝聞", /伝聞/],
    ["断定（必ずもらえる）", /断定表現/],
    ["区と都の合計額", /合計額/],
    ["実績・資格の主張", /実績・資格/],
    ["電話番号", /電話番号/],
    ["親ページへのリンクなし", /親になる固定ページ/],
  ];
  for (const [name, re] of expect) check(`落とす：${name}`, re.test(b));

  // ── 固定ページとのカニバリ・既存記事との重複
  const cannibal = validate(good, { ...ctx, intent: "葛飾区 太陽光 補助金" }).errors.join("\n");
  check("落とす：固定ページとカニバリする検索意図", /カニバリ/.test(cannibal));
  const dupe = validate(good, { ...ctx, existing: [...existing, { slug: "x", title: good.title, intent: TOPIC.intent, body: good.body }] }).errors.join("\n");
  check("落とす：既存記事とタイトル・検索意図・本文が同じ", /タイトルが似すぎ/.test(dupe) && /検索意図がほぼ同じ/.test(dupe) && /焼き直し/.test(dupe));
  // 見出しはそのまま、本文だけを別の文章に差し替えた「既存記事」を置く
  const skeleton = good.body
    .split("\n")
    .map((l) => (l.startsWith("## ") || !l.trim() ? l : "ここは別の文章です。"))
    .join("\n");
  const sameStructure = validate(good, { ...ctx, existing: [...existing, { slug: "y", title: "別の題名", intent: "別の意図", body: skeleton }] }).errors.join("\n");
  check("落とす：見出しの構成が既存記事と同じ", /見出しの構成がほぼ同じ/.test(sameStructure));

  // ── 読み直し（数値以外の主張）
  const client = null as never;
  const ok = await reviewArticle({ client, model: "fixture", facts, index: factIndex, article: good, fixture: load("blog-review-ok.json") });
  check("読み直し：すべて確認できた記事は合格", ok.ok && ok.claims.length === 3, ok.errors.join(" / "));
  const ng = await reviewArticle({ client, model: "fixture", facts, index: factIndex, article: good, fixture: load("blog-review-ng.json") });
  check("読み直し：確認できない主張が1つでもあれば不合格", !ng.ok && /確認できない主張/.test(ng.errors.join("\n")));
  const broken = await reviewArticle({ client, model: "fixture", facts, index: factIndex, article: good, fixture: "JSON ではない返答" });
  check("読み直し：結果を解析できなければ不合格（公開しない）", !broken.ok);
  // 運営者から確認した内容（事実シートの「サービス」の節）は、出典URLが無くても通す
  const operatorOk = await reviewArticle({
    client,
    model: "fixture",
    facts,
    index: factIndex,
    article: good,
    fixture: JSON.stringify({ claims: [{ claim: "SOLAR SHIFT は現地調査と見積もりを無料で行っている", source: OPERATOR_SOURCE, supported: true }] }),
  });
  check("読み直し：運営者から確認した内容は、出典URLが無くても通す", operatorOk.ok, operatorOk.errors.join(" / "));
  // 運営者の説明ではない主張に "operator" が付いていたら落とす（抜け道にしない）
  const operatorNg = await reviewArticle({
    client,
    model: "fixture",
    facts,
    index: factIndex,
    article: good,
    fixture: JSON.stringify({ claims: [{ claim: "蓄電池は15年使える", source: OPERATOR_SOURCE, supported: true }] }),
  });
  check("読み直し：運営者の説明ではない主張に operator が付いていたら不合格", !operatorNg.ok);
  // 根拠は確認できたが、記事の sources に無い出典は、足す対象として返す（不合格にはしない）
  const extraUrl = [...factIndex.sources.keys()].find((u) => !good.sources.some((s) => s.url === u))!;
  const missing = await reviewArticle({
    client,
    model: "fixture",
    facts,
    index: factIndex,
    article: good,
    fixture: JSON.stringify({ claims: [{ claim: "事実シートにある内容", source: extraUrl, supported: true }] }),
  });
  check("読み直し：sources に無い出典は、足す対象として返す", missing.ok && missing.missingSources.length === 1 && missing.missingSources[0] === extraUrl);
  check("出典の表示名を、登録簿か事実シートから取れる", sourceNameFor(extraUrl, facts) !== extraUrl, sourceNameFor(extraUrl, facts));

  // ── 保存される形（frontmatter に claim / source / sourceType / verified が残る）
  const md = toMarkdown(good, TOPIC, "selftest", "2026-10-02", [...g.claims, ...ok.claims], { gate: QUALITY_GATE_VERSION, checkedAt: "2026-10-02", chars: 0, reviewer: "fixture" });
  const fm = matter(md).data as { claims?: { claim: string; source: string; sourceType: string; verified: boolean }[]; pillar?: string; quality?: { gate: number } };
  check("frontmatter に主張と出典が残る", Array.isArray(fm.claims) && fm.claims.length > 0 && fm.claims.every((c) => c.claim && c.source && c.sourceType && c.verified === true));
  check("frontmatter に親ページと検査の版が残る", fm.pillar === "/subsidy/katsushika" && fm.quality?.gate === QUALITY_GATE_VERSION);

  console.log(failed === 0 ? "\nALL PASSED" : `\n${failed} FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
