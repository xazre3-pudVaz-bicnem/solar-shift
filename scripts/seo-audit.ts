#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜全 URL の SEO 監査（ビルド後の HTML を読む。API は呼ばない）。
 *
 *   VERCEL_ENV=production npm run build && npm run seo:audit
 *   npm run seo:audit -- --table            … URL ごとの一覧を出す
 *   npm run seo:audit -- --out <file.md>    … 一覧を Markdown で保存する
 *   npm run seo:audit -- --live             … 本番の URL を実際に取りに行き、ステータス・転送・canonical を確かめる
 *
 * seo:check（SEO マップとの突き合わせ）が見ていないところを見る。
 *   1. description の重複
 *   2. index の全ページの canonical（本番ドメインの、自分自身の URL か）
 *   3. 内部リンクのグラフ：どこからもリンクされていない index ページ（孤立）、本文からのリンクが無いページ
 *   4. sitemap.xml と index ページの突き合わせ（載せ忘れ・noindex の混入）、lastmod がビルド日で埋まっていないか
 *   5. 見出しの順番（h2 を飛ばして h3 など）、main / header / footer があるか
 *   6. 「こちら」「詳しくはこちら」だけのリンク
 *   7. alt の無い画像、事例の写真と誤解させる alt
 *   8. 構造化データ：JSON-LD が壊れていないか、ページの種類に合う型があるか
 *
 * NG が1件でもあれば、終了コード 1。注意は、人が見て判断するもの（終了コードには数えない）。
 */
import fs from "node:fs";
import path from "node:path";
import { SEO_MAP } from "../lib/seo-map";

const ROOT = process.cwd();
const APP = path.join(ROOT, ".next", "server", "app");
const args = process.argv.slice(2);
const showTable = args.includes("--table");
const live = args.includes("--live");
const outFile = args.includes("--out") ? args[args.indexOf("--out") + 1] : "";

if (!fs.existsSync(APP)) {
  console.error("ビルド結果がありません。先に VERCEL_ENV=production npm run build を実行してください。");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────── HTML の読み取り

const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (html: string) => decode(html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const attr = (html: string, re: RegExp) => decode((html.match(re) ?? [, ""])[1] ?? "");

interface LinkRef {
  href: string;
  anchor: string;
  /** 本文（main の中。パンくずは除く）からのリンクか */
  contextual: boolean;
}

interface Page {
  route: string;
  title: string;
  description: string;
  robots: string;
  canonical: string;
  h1: string[];
  /** main の中の見出しの並び（レベルと文字） */
  headings: { level: number; text: string }[];
  hasMain: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
  links: LinkRef[];
  schemaTypes: string[];
  schemaErrors: number;
  /** パンくずの、1つ上のページ */
  parent: string;
  imagesWithoutAlt: number;
  suspiciousAlts: string[];
  /** main の中の文字数（薄いページの目安） */
  mainChars: number;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** 内部リンクの行き先を、ルートの形にそろえる（# と ? と末尾の / を落とす）。内部でなければ null */
function normalizeHref(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  let p = href.split("#")[0].split("?")[0];
  if (p.length > 1) p = p.replace(/\/+$/, "");
  if (p.startsWith("/api/") || p.startsWith("/_next/") || /\.[a-z0-9]{2,5}$/i.test(p)) return null;
  return p || "/";
}

function collectTypes(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const n of node) collectTypes(n, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  const t = o["@type"];
  if (typeof t === "string") out.push(t);
  else if (Array.isArray(t)) for (const x of t) if (typeof x === "string") out.push(x);
  if (Array.isArray(o["@graph"])) collectTypes(o["@graph"], out);
}

function parse(file: string): Page {
  const html = fs.readFileSync(file, "utf8");
  let route = "/" + path.relative(APP, file).replace(/\\/g, "/").replace(/\.html$/, "");
  if (route === "/index") route = "/";

  const mainStart = html.search(/<main[\s>]/);
  const mainEnd = html.lastIndexOf("</main>");
  const main = mainStart !== -1 && mainEnd !== -1 ? html.slice(mainStart, mainEnd) : "";
  // パンくずは、本文からのリンクに数えない
  const mainNoCrumbs = main.replace(/<nav aria-label="パンくずリスト"[\s\S]*?<\/nav>/g, " ");

  const links: LinkRef[] = [];
  const pushLinks = (src: string, contextual: boolean) => {
    for (const m of src.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const href = normalizeHref(decode(m[1]));
      if (!href) continue;
      links.push({ href, anchor: text(m[2].replace(/<span class="sr-only">[\s\S]*?<\/span>/g, " ")), contextual });
    }
  };
  pushLinks(mainNoCrumbs, true);
  pushLinks(html.replace(main, " "), false);
  pushLinks((main.match(/<nav aria-label="パンくずリスト"[\s\S]*?<\/nav>/g) ?? []).join(" "), false);

  const schemaTypes: string[] = [];
  let schemaErrors = 0;
  let parent = "";
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      collectTypes(data, schemaTypes);
      const nodes: Record<string, unknown>[] = Array.isArray(data?.["@graph"]) ? data["@graph"] : [data];
      for (const n of nodes) {
        if (n?.["@type"] === "BreadcrumbList" && Array.isArray(n.itemListElement) && n.itemListElement.length >= 2) {
          const up = n.itemListElement[n.itemListElement.length - 2] as { item?: string };
          if (typeof up?.item === "string") {
            try {
              parent = new URL(up.item).pathname.replace(/\/+$/, "") || "/";
            } catch {
              parent = up.item;
            }
          }
        }
      }
    } catch {
      schemaErrors += 1;
    }
  }

  let imagesWithoutAlt = 0;
  const suspiciousAlts: string[] = [];
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const alt = m[0].match(/\balt="([^"]*)"/);
    if (!alt) {
      imagesWithoutAlt += 1;
      continue;
    }
    // 事例のページ以外で、実際の施工写真・お客様の家と読める alt
    if (!route.startsWith("/works") && /施工写真|施工後の写真|施工前の写真|[^\s]様邸|邸の(屋根|太陽光)|実際の(施工|お客様)/.test(decode(alt[1]))) suspiciousAlts.push(decode(alt[1]));
  }

  return {
    route,
    title: text((html.match(/<title>([\s\S]*?)<\/title>/) ?? [, ""])[1] ?? ""),
    description: attr(html, /<meta name="description" content="([^"]*)"/),
    robots: attr(html, /<meta name="robots" content="([^"]*)"/),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1])),
    headings: [...main.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({ level: Number(m[1]), text: text(m[2]).slice(0, 40) })),
    hasMain: mainStart !== -1,
    hasHeader: /<header[\s>]/.test(html),
    hasFooter: /<footer[\s>]/.test(html),
    links,
    schemaTypes: [...new Set(schemaTypes)],
    schemaErrors,
    parent,
    imagesWithoutAlt,
    suspiciousAlts,
    mainChars: text(main.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")).replace(/\s/g, "").length,
  };
}

const pages = walk(APP)
  .map(parse)
  .filter((p) => !p.route.startsWith("/_") && !/\/(og|api)\//.test(p.route) && p.route !== "/_not-found")
  .sort((a, b) => a.route.localeCompare(b.route));
const byRoute = new Map(pages.map((p) => [p.route, p]));
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || byRoute.get("/")?.canonical || "").replace(/\/+$/, "");
const isPublicBuild = Boolean(siteUrl);

const errors: string[] = [];
const warnings: string[] = [];

const isNoindex = (p: Page) => /noindex/.test(p.robots);
const isPaged = (p: Page) => /\/page\/\d+$/.test(p.route);
const indexPages = pages.filter((p) => !isNoindex(p));

// ─────────────────────────────────────────────────────────────── 1. title / description / h1

{
  const seenDesc = new Map<string, string>();
  for (const p of indexPages) {
    if (!p.title) errors.push(`${p.route}: title がありません`);
    if (!p.description) errors.push(`${p.route}: description がありません`);
    if (p.h1.length === 0) errors.push(`${p.route}: h1 がありません`);
    if (isPaged(p) || !p.description) continue;
    const prev = seenDesc.get(p.description);
    if (prev) errors.push(`description が重複: ${prev} と ${p.route}`);
    else seenDesc.set(p.description, p.route);
    if (p.description.length < 50) warnings.push(`${p.route}: description が短い（${p.description.length}字）`);
  }
}

// ─────────────────────────────────────────────────────────────── 2. canonical

if (isPublicBuild) {
  for (const p of indexPages) {
    const expected = `${siteUrl}${p.route === "/" ? "" : p.route}`;
    if (!p.canonical) errors.push(`${p.route}: canonical がありません`);
    else if (p.canonical !== expected && p.canonical !== `${expected}/`) errors.push(`${p.route}: canonical が自分自身（${expected}）ではありません → ${p.canonical}`);
  }
} else {
  warnings.push("本番 URL なしのビルドです（canonical・sitemap の検査は省略）。VERCEL_ENV=production を付けてビルドしてください。");
}

// ─────────────────────────────────────────────────────────────── 3. 内部リンクのグラフ

const inbound = new Map<string, { total: Set<string>; contextual: Set<string> }>();
for (const p of pages) inbound.set(p.route, { total: new Set(), contextual: new Set() });
for (const p of pages) {
  for (const l of p.links) {
    if (l.href === p.route) continue;
    const t = inbound.get(l.href);
    if (!t) continue;
    t.total.add(p.route);
    if (l.contextual) t.contextual.add(p.route);
  }
}
/** 本文からのリンクが無くてもよいページ（フッターから行ければ足りる） */
const FOOTER_ONLY_OK = new Set(["/privacy", "/sitemap", "/editorial-policy", "/company", "/contact", "/"]);
/**
 * 評価を集めたいページ。ほかのページの本文から、この数以上リンクされていること
 * （柱のページへのリンクが、記事やガイドを足すうちに減っていないかを見張る）
 */
const KEY_PAGES: Record<string, number> = {
  "/subsidy/katsushika": 20,
  "/area/katsushika": 12,
  "/simulation": 20,
  "/solar": 12,
  "/battery": 12,
  "/guide/solar-cost": 10,
  "/guide/solar-payback": 8,
  "/subsidy/tokyo": 12,
};
for (const p of indexPages) {
  const inb = inbound.get(p.route)!;
  if (p.route !== "/" && inb.total.size === 0) errors.push(`${p.route}: どのページからもリンクされていません（孤立）`);
  else if (!FOOTER_ONLY_OK.has(p.route) && !isPaged(p) && inb.contextual.size === 0) warnings.push(`${p.route}: 本文からのリンクがありません（ヘッダー・フッター・パンくずだけ）`);
  const min = KEY_PAGES[p.route];
  if (min && inb.contextual.size < min) errors.push(`${p.route}: 本文からリンクしているページが ${inb.contextual.size} しかありません（主要ページは ${min} 以上）`);
}
for (const k of Object.keys(KEY_PAGES)) if (!byRoute.has(k)) errors.push(`${k}: 主要ページが見つかりません`);

// ─────────────────────────────────────────────────────────────── 4. sitemap.xml

const sitemap = new Map<string, string>();
if (isPublicBuild) {
  const file = [path.join(APP, "sitemap.xml.body"), path.join(APP, "sitemap.xml")].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!file) {
    errors.push("sitemap.xml のビルド結果が見つかりません");
  } else {
    const xml = fs.readFileSync(file, "utf8");
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) ?? [, ""])[1] ?? "";
      const lastmod = (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) ?? [, ""])[1] ?? "";
      if (!loc.startsWith(siteUrl)) errors.push(`sitemap: 本番ドメインではない URL が載っています → ${loc}`);
      sitemap.set(loc.slice(siteUrl.length).replace(/\/+$/, "") || "/", lastmod.slice(0, 10));
    }
    for (const [route] of sitemap) {
      const p = byRoute.get(route);
      if (!p) errors.push(`sitemap: ページが見つかりません → ${route}`);
      else if (isNoindex(p)) errors.push(`sitemap: noindex のページが載っています → ${route}`);
    }
    // index なのに sitemap に無いページ（一覧の2ページ目以降は、載せない決まり）
    for (const p of indexPages) if (!isPaged(p) && !sitemap.has(p.route)) errors.push(`sitemap: index のページが載っていません → ${p.route}`);
    // lastmod がビルド日で埋まっていないか（全部が今日なら、内容の更新日ではなくビルド日を入れている疑い）
    const today = new Date().toISOString().slice(0, 10);
    const dates = [...sitemap.values()].filter(Boolean);
    const todayCount = dates.filter((d) => d === today).length;
    if (dates.length === 0) warnings.push("sitemap: lastmod がありません");
    else if (todayCount === dates.length) warnings.push("sitemap: すべての lastmod が今日の日付です（ビルド日を入れていないか確かめてください）");
    console.log(`sitemap.xml: ${sitemap.size} 件 ／ lastmod の種類 ${new Set(dates).size} 通り ／ 今日の日付 ${todayCount} 件`);
  }
}

// ─────────────────────────────────────────────────────────────── 5. 見出しの順番・main / header / footer

for (const p of pages) {
  if (!p.hasMain) errors.push(`${p.route}: main がありません`);
  if (!p.hasHeader) errors.push(`${p.route}: header がありません`);
  if (!p.hasFooter) errors.push(`${p.route}: footer がありません`);
  if (p.headings.length > 0 && p.headings[0].level !== 1) warnings.push(`${p.route}: main の最初の見出しが h1 ではありません（h${p.headings[0].level}「${p.headings[0].text}」）`);
  for (let i = 1; i < p.headings.length; i += 1) {
    if (p.headings[i].level - p.headings[i - 1].level > 1) {
      warnings.push(`${p.route}: 見出しが飛んでいます（h${p.headings[i - 1].level}「${p.headings[i - 1].text}」の次が h${p.headings[i].level}「${p.headings[i].text}」）`);
      break;
    }
  }
}

// ─────────────────────────────────────────────────────────────── 6. 「こちら」だけのリンク

{
  const GENERIC = /^(こちら|こちらから|こちらへ|詳しくはこちら|詳細はこちら|詳しく見る|もっと見る|続きを読む|クリック|ここ|more|read more)$/i;
  const hits = new Map<string, Set<string>>();
  for (const p of pages) {
    for (const l of p.links) {
      const a = l.anchor.replace(/[→＞>›»\s]/g, "");
      if (GENERIC.test(a)) {
        const k = `「${l.anchor}」→ ${l.href}`;
        if (!hits.has(k)) hits.set(k, new Set());
        hits.get(k)!.add(p.route);
      }
    }
  }
  for (const [k, routes] of hits) warnings.push(`行き先が分からないリンクの文言: ${k}（${[...routes].slice(0, 4).join("、")}${routes.size > 4 ? ` ほか${routes.size - 4}ページ` : ""}）`);
}

// ─────────────────────────────────────────────────────────────── 7. 画像の alt

for (const p of pages) {
  if (p.imagesWithoutAlt > 0) errors.push(`${p.route}: alt の無い画像が ${p.imagesWithoutAlt} 枚あります`);
  for (const a of p.suspiciousAlts) warnings.push(`${p.route}: 実際の施工写真と読める alt → 「${a}」`);
}

// ─────────────────────────────────────────────────────────────── 8. 構造化データ

for (const p of pages) {
  if (p.schemaErrors > 0) errors.push(`${p.route}: JSON-LD が壊れています（${p.schemaErrors} 個）`);
  if (isNoindex(p)) continue;
  const has = (t: string) => p.schemaTypes.includes(t);
  if (p.route === "/") for (const t of ["Organization", "WebSite", "LocalBusiness"]) if (!has(t)) errors.push(`/: 構造化データに ${t} がありません`);
  if (p.route !== "/" && !has("BreadcrumbList")) warnings.push(`${p.route}: BreadcrumbList がありません`);
  if (/^\/blog\/[^/]+$/.test(p.route) && !/^\/blog\/(page|category)$/.test(p.route) && !has("BlogPosting") && !has("Article")) errors.push(`${p.route}: 記事の構造化データ（BlogPosting / Article）がありません`);
  if (/^\/guide\/[^/]+$/.test(p.route) && !has("Article")) errors.push(`${p.route}: ガイドの構造化データ（Article）がありません`);
  if (["/solar", "/battery", "/solar-battery", "/v2h", "/hems"].includes(p.route) && !has("Service")) errors.push(`${p.route}: Service の構造化データがありません`);
  if (has("Review") || has("AggregateRating")) errors.push(`${p.route}: Review / AggregateRating が出ています（出さない決まり）`);
}

// ─────────────────────────────────────────────────────────────── 薄いページ（soft 404 の目安）

for (const p of indexPages) if (!isPaged(p) && p.mainChars < 400) warnings.push(`${p.route}: 本文が短い（${p.mainChars}字）。中身が無いなら noindex を検討`);

// ─────────────────────────────────────────────────────────────── 一覧

const mapByPath = new Map(SEO_MAP.map((e) => [e.path, e]));
function row(p: Page): string[] {
  const m = mapByPath.get(p.route);
  const inb = inbound.get(p.route)!;
  return [
    p.route,
    isNoindex(p) ? "noindex" : "index",
    p.title,
    String(p.description.length),
    p.h1.join(" / "),
    p.canonical ? (p.canonical === `${siteUrl}${p.route === "/" ? "" : p.route}` ? "self" : p.canonical) : "-",
    m?.primary ?? "",
    (m?.secondary ?? []).join("、"),
    m?.intent ?? "",
    p.parent || "-",
    `${inb.total.size}/${inb.contextual.size}`,
    sitemap.has(p.route) ? "○" : "-",
    sitemap.get(p.route) || "-",
    p.schemaTypes.filter((t) => !["ListItem", "Question", "Answer", "PostalAddress", "ImageObject", "ContactPoint", "AdministrativeArea", "Offer", "Person", "OpeningHoursSpecification", "CreativeWork", "EntryPoint", "SearchAction", "HowToStep", "DefinedTerm"].includes(t)).join(","),
  ];
}
const HEAD = ["URL", "index", "title", "description字数", "H1", "canonical", "主キーワード", "関連キーワード", "検索意図", "親ページ", "被リンク(全体/本文)", "sitemap", "更新日", "schema"];
if (showTable) {
  console.log("\n" + HEAD.join(" | "));
  for (const p of pages) console.log(row(p).join(" | "));
}
if (outFile) {
  const esc = (s: string) => s.replace(/\|/g, "｜");
  const md = [
    `# SEO 監査の一覧（${new Date().toISOString().slice(0, 10)} のビルド）`,
    "",
    "`npm run seo:audit -- --out <このファイル>` で作り直せる。被リンクは「リンクしているページの数（全体／本文から）」。",
    "",
    `| ${HEAD.join(" | ")} |`,
    `| ${HEAD.map(() => "---").join(" | ")} |`,
    ...pages.map((p) => `| ${row(p).map(esc).join(" | ")} |`),
    "",
  ].join("\n");
  fs.mkdirSync(path.dirname(path.resolve(ROOT, outFile)), { recursive: true });
  fs.writeFileSync(path.resolve(ROOT, outFile), md);
  console.log(`一覧を保存しました: ${outFile}`);
}

// ─────────────────────────────────────────────────────────────── 本番の実測（--live）

async function liveCheck(): Promise<void> {
  if (!siteUrl) {
    warnings.push("--live: 本番 URL が分からないため省略");
    return;
  }
  const host = new URL(siteUrl).host;
  const apex = host.replace(/^www\./, "");
  const get = async (url: string) => {
    const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "solar-shift-seo-audit" } });
    return { status: res.status, location: res.headers.get("location") ?? "", robots: res.headers.get("x-robots-tag") ?? "", body: res.status === 200 ? await res.text() : "" };
  };
  // ドメインの統一：www・https 以外は、すべて転送されること
  for (const u of [`https://${apex}/`, `http://${apex}/`, `http://${host}/`]) {
    try {
      const r = await get(u);
      if (r.status < 300 || r.status >= 400) errors.push(`--live: ${u} が転送されていません（${r.status}）`);
    } catch (e) {
      warnings.push(`--live: ${u} を取得できません（${e instanceof Error ? e.message : e}）`);
    }
  }
  // 末尾のスラッシュ
  {
    const r = await get(`${siteUrl}/subsidy/katsushika/`);
    if (r.status < 300 || r.status >= 400) errors.push(`--live: 末尾に / を付けた URL が転送されていません（${r.status}）`);
  }
  // index の全ページ
  let ok = 0;
  const queue = indexPages.filter((p) => !isPaged(p)).map((p) => p.route);
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length > 0) {
        const route = queue.shift()!;
        const url = `${siteUrl}${route === "/" ? "/" : route}`;
        try {
          const r = await get(url);
          if (r.status !== 200) {
            errors.push(`--live: ${route} が ${r.status} です${r.location ? `（→ ${r.location}）` : ""}`);
            continue;
          }
          const canonical = attr(r.body, /<link rel="canonical" href="([^"]*)"/);
          const expected = `${siteUrl}${route === "/" ? "" : route}`;
          if (canonical !== expected) errors.push(`--live: ${route} の canonical が違います → ${canonical || "（なし）"}`);
          if (/noindex/.test(r.robots) || /noindex/.test(attr(r.body, /<meta name="robots" content="([^"]*)"/))) errors.push(`--live: ${route} が本番で noindex です`);
          ok += 1;
        } catch (e) {
          warnings.push(`--live: ${route} を取得できません（${e instanceof Error ? e.message : e}）`);
        }
      }
    }),
  );
  console.log(`--live: 本番の index ページ ${ok} 件が 200・canonical 一致`);
}

async function main() {
  if (live) await liveCheck();
  const noindexCount = pages.length - indexPages.length;
  console.log(`\nページ ${pages.length}（index ${indexPages.length} ／ noindex ${noindexCount}）`);
  for (const w of warnings) console.log(`注意: ${w}`);
  for (const e of errors) console.log(`NG: ${e}`);
  console.log(errors.length === 0 ? `ALL PASSED（注意 ${warnings.length} 件）` : `${errors.length} 件の問題があります`);
  process.exit(errors.length === 0 ? 0 : 1);
}
main();
