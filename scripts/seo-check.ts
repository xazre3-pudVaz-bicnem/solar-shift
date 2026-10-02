#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜SEO マップと、ビルド後の HTML の突き合わせ（カニバリ・title/h1・canonical・noindex の検査）。
 *
 *   npm run build && npm run seo:check
 *
 * 検査すること
 *   1. マップ自体：主キーワード・関連キーワードが、ページ間で重なっていないか
 *   2. 固定ページ：title と h1 に、マップで決めた語が入っているか
 *   3. canonical：自分自身の URL を指しているか（NEXT_PUBLIC_SITE_URL を付けてビルドしたとき）
 *   4. noindex：「中身がまだ無いページ」だけが noindex になっているか（lib/indexing.ts と一致しているか）
 *   5. 全ページ：h1 が1つだけか、title・h1 が他のページと重複していないか、description があるか
 *   6. ブログ記事：固定ページのキーワードと取り合いになっていないか
 *   7. sitemap.xml：noindex のページが載っていないか
 *
 * 一覧（title / h1 / 主キーワード / 検索意図 / canonical）は --table を付けると出る。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SEO_MAP, duplicatedPrimaries, findCannibalPage } from "../lib/seo-map";
import { HELD_BACK } from "../lib/indexing";

const ROOT = process.cwd();
const APP = path.join(ROOT, ".next", "server", "app");
const showTable = process.argv.includes("--table");

if (!fs.existsSync(APP)) {
  console.error("ビルド結果がありません。先に npm run build を実行してください。");
  process.exit(1);
}

interface Page {
  route: string;
  title: string;
  h1: string[];
  description: string;
  canonical: string;
  robots: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (html: string) => decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const attr = (html: string, re: RegExp) => decode((html.match(re) ?? [, ""])[1] ?? "");

function parse(file: string): Page {
  const html = fs.readFileSync(file, "utf8");
  let route = "/" + path.relative(APP, file).replace(/\\/g, "/").replace(/\.html$/, "");
  if (route === "/index") route = "/";
  return {
    route,
    title: text((html.match(/<title>([\s\S]*?)<\/title>/) ?? [, ""])[1] ?? ""),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1])),
    description: attr(html, /<meta name="description" content="([^"]*)"/),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    robots: attr(html, /<meta name="robots" content="([^"]*)"/),
  };
}

const pages = walk(APP)
  .map(parse)
  .filter((p) => !p.route.startsWith("/_") && !/\/(og|api)\//.test(p.route) && p.route !== "/_not-found");
const byRoute = new Map(pages.map((p) => [p.route, p]));

const errors: string[] = [];
const warnings: string[] = [];
const compact = (s: string) => s.replace(/\s+/g, "");

// ── 1. マップ自体
for (const d of duplicatedPrimaries()) errors.push(`キーワードの重複: ${d}`);

// ── 2〜4. 固定ページ
const isPublicBuild = pages.some((p) => p.canonical);
// 本番 URL：環境変数が無ければ、ビルド結果のトップページの canonical から読む（next.config.ts が決めた値）
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || byRoute.get("/")?.canonical || "").replace(/\/+$/, "");
if (!isPublicBuild) warnings.push("本番 URL なしのビルドです（canonical と index/noindex の検査は省略）。本番相当で確かめるには VERCEL_ENV=production を付けてビルドしてください。");
else console.log(`本番 URL: ${siteUrl}`);

for (const e of SEO_MAP) {
  const p = byRoute.get(e.path);
  if (!p) {
    errors.push(`${e.path}: ページがありません`);
    continue;
  }
  for (const w of e.must) {
    if (!compact(p.title).includes(compact(w))) errors.push(`${e.path}: title に「${w}」がありません → ${p.title}`);
    if (!compact(p.h1.join(" ")).includes(compact(w))) errors.push(`${e.path}: h1 に「${w}」がありません → ${p.h1.join(" / ")}`);
  }
  if (isPublicBuild) {
    const expected = siteUrl ? `${siteUrl}${e.path === "/" ? "" : e.path}` : null;
    if (!p.canonical) errors.push(`${e.path}: canonical がありません`);
    else if (expected && p.canonical !== expected && p.canonical !== `${expected}/`) errors.push(`${e.path}: canonical が自分自身を指していません → ${p.canonical}`);
    else if (!p.canonical.endsWith(e.path === "/" ? "" : e.path) && !p.canonical.endsWith(`${e.path}/`)) errors.push(`${e.path}: canonical のパスが違います → ${p.canonical}`);
    const noindex = /noindex/.test(p.robots);
    if (!e.index && !noindex) errors.push(`${e.path}: マップでは noindex のはずですが、index になっています`);
    if (e.index && noindex) errors.push(`${e.path}: マップでは index のはずですが、noindex になっています`);
  }
}

// lib/indexing.ts（データから決まる「準備中」）と、マップの index: false が一致しているか
{
  const mapHeld = new Set(SEO_MAP.filter((e) => !e.index).map((e) => e.path));
  for (const h of HELD_BACK) if (!mapHeld.has(h)) errors.push(`${h}: 準備中（lib/indexing.ts）ですが、SEO マップでは index: true です`);
  for (const h of mapHeld) if (!HELD_BACK.has(h)) errors.push(`${h}: SEO マップでは index: false ですが、中身が登録されています（マップを index: true に直してください）`);
}

// ── 5. 全ページ
{
  const titles = new Map<string, string>();
  const h1s = new Map<string, string>();
  for (const p of pages) {
    const paged = /\/page\/\d+$/.test(p.route);
    if (p.h1.length !== 1) errors.push(`${p.route}: h1 が ${p.h1.length} 個あります`);
    if (!p.title) errors.push(`${p.route}: title がありません`);
    if (!p.description) errors.push(`${p.route}: description がありません`);
    else if (p.description.length > 160) warnings.push(`${p.route}: description が長い（${p.description.length}字）`);
    if (paged) continue;
    const t = titles.get(p.title);
    if (t) errors.push(`title が重複: ${t} と ${p.route} → ${p.title}`);
    else titles.set(p.title, p.route);
    const h = p.h1[0] ?? "";
    const prev = h1s.get(h);
    if (h && prev) errors.push(`h1 が重複: ${prev} と ${p.route} → ${h}`);
    else if (h) h1s.set(h, p.route);
  }
}

// ── 6. ブログ記事と固定ページの取り合い
{
  const dir = path.join(ROOT, "content", "blog");
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith(".md")) : []) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
    if (data.draft) continue;
    const hit = findCannibalPage(String(data.intent ?? ""));
    if (hit) errors.push(`記事 ${data.slug}: ${hit.reason}`);
    const fixedLinks = [...content.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1]).filter((l) => !l.startsWith("/blog/"));
    if (fixedLinks.length === 0) errors.push(`記事 ${data.slug}: 固定ページへのリンクがありません`);
  }
}

// ── 7. sitemap.xml
{
  const candidates = [path.join(APP, "sitemap.xml.body"), path.join(APP, "sitemap.xml")];
  const file = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (file) {
    const xml = fs.readFileSync(file, "utf8");
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      const route = siteUrl && loc.startsWith(siteUrl) ? loc.slice(siteUrl.length) || "/" : new URL(loc).pathname;
      const p = byRoute.get(route);
      if (!p) errors.push(`sitemap: ページが見つかりません → ${loc}`);
      else if (/noindex/.test(p.robots)) errors.push(`sitemap: noindex のページが載っています → ${route}`);
      if (HELD_BACK.has(route)) errors.push(`sitemap: 準備中のページが載っています → ${route}`);
    }
    if (isPublicBuild) {
      const set = new Set(locs.map((l) => (siteUrl && l.startsWith(siteUrl) ? l.slice(siteUrl.length) || "/" : new URL(l).pathname)));
      for (const e of SEO_MAP) if (e.index && !set.has(e.path)) errors.push(`sitemap: index のページが載っていません → ${e.path}`);
      console.log(`sitemap.xml: ${locs.length} 件`);
    }
  } else if (isPublicBuild) {
    warnings.push("sitemap.xml のビルド結果が見つかりません");
  }
}

if (showTable) {
  console.log("\npath | 主キーワード | 検索意図 | title | h1 | canonical | robots");
  for (const e of SEO_MAP) {
    const p = byRoute.get(e.path);
    console.log([e.path, e.primary, e.intent, p?.title ?? "-", p?.h1.join(" / ") ?? "-", p?.canonical || "-", p?.robots || "index"].join(" | "));
  }
}

console.log(`\nページ ${pages.length} ／ マップ ${SEO_MAP.length} ／ 準備中 ${HELD_BACK.size}`);
for (const w of warnings) console.log(`注意: ${w}`);
for (const e of errors) console.log(`NG: ${e}`);
console.log(errors.length === 0 ? "ALL PASSED" : `${errors.length} 件の問題があります`);
process.exit(errors.length === 0 ? 0 : 1);
