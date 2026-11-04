#!/usr/bin/env tsx
/**
 * SOLAR SHIFT｜Search Console の CSV から、直す順番を出す（ページを増やす前に、既存ページを強くするため）。
 *
 *   npm run seo:opportunities                         … data/seo/search-console/*.csv を読んで一覧を出す
 *   npm run seo:opportunities -- --min-impressions 50  … 表示回数の下限（既定 30）
 *   npm run seo:opportunities -- --out docs/seo-opportunities.md … Markdown にも書き出す
 *   npm run seo:opportunities -- --selftest            … 作り物のデータ（scripts/fixtures/gsc-synthetic.csv）で、判定を確かめる
 *
 * 読める CSV（列名は日本語・英語のどちらでも。順番は問わない）
 *   - クエリとページの組み合わせ：query, page, clicks, impressions, ctr, position（API・Looker Studio で出したもの）
 *   - 画面のエクスポートの「クエリ.csv」（上位のクエリ・クリック数・表示回数・CTR・掲載順位）
 *   - 画面のエクスポートの「ページ.csv」（上位のページ・クリック数・表示回数・CTR・掲載順位）
 *
 * 出すもの
 *   1. 伸びしろ（High Opportunity）… 掲載順位 4〜20 位で、表示回数が多いクエリ。受け持ちのページ（data/seo/keyword-map.ts）を直す
 *   2. 取り合い（Cannibalization）… 同じクエリで、2つ以上のページが表示されている（クエリとページの組み合わせの CSV があるときだけ）
 *   3. クリック率（CTR）の伸びしろ … 同じ順位帯の、このサイトのクエリの中央値より CTR が低い（業界の平均値は使わない）
 *   4. 受け持ちの無いクエリ（Content Gap）… キーワードの受け持ち表にも、ブログ記事の検索意図にも当たらない
 *   5. 表示の無い重要ページ … 受け持ち表で検索結果に出すページなのに、ページの CSV に1回も出てこない
 *
 * 指名検索（SOLAR SHIFT・ソーラーシフト・サイプレス）は、1〜4 から外して件数だけを出す。
 * ここで出した結果は「候補」。新しいページは作らず、受け持ちのページの title・見出し・冒頭の答え・内部リンクを直すのが先（docs/seo-playbook.md）。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SEO_MAP } from "../lib/seo-map";

const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const SELFTEST = args.includes("--selftest");
const MIN_IMPRESSIONS = Number(opt("--min-impressions") ?? 30);
const OUT = opt("--out");
export const DIR = path.join(process.cwd(), "data", "seo", "search-console");

/** このフォルダの CSV をすべて読む（無ければ空） */
export function readSearchConsoleDir(dir = DIR): { files: string[]; rows: Row[] } {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".csv")) : [];
  return { files, rows: files.flatMap((f) => readRows(fs.readFileSync(path.join(dir, f), "utf8"))) };
}
const SITE = /^https?:\/\/(www\.)?solarshift\.jp/i;
const BRAND = /solar\s*shift|ソーラーシフト|そーらーしふと|サイプレス|cypress/i;

export interface Row {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  /** 0〜1 */
  ctr: number;
  position: number;
}

// ─────────────────────────────────────────────────────────────── CSV
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (c === '"') quoted = false;
      else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

type Col = keyof Row;
function columnOf(header: string): Col | null {
  const h = header.trim().toLowerCase();
  if (/クエリ|query|検索キーワード/.test(h)) return "query";
  if (/ページ|page|url|landing/.test(h)) return "page";
  if (/クリック数|^クリック$|clicks?/.test(h)) return "clicks";
  if (/表示回数|impressions?/.test(h)) return "impressions";
  if (/ctr|クリック率/.test(h)) return "ctr";
  if (/掲載順位|順位|position/.test(h)) return "position";
  return null;
}

const num = (v: string) => Number(String(v ?? "").replace(/[,%\s]/g, "")) || 0;

export function toPath(url: string): string {
  let p = String(url).trim().replace(SITE, "");
  p = p.replace(/[?#].*$/, "");
  if (p === "") p = "/";
  if (p.length > 1) p = p.replace(/\/+$/, "");
  try {
    p = decodeURI(p);
  } catch {
    /* そのまま */
  }
  return p;
}

export function readRows(text: string): Row[] {
  const [header, ...body] = parseCsv(text);
  if (!header) return [];
  const cols = header.map(columnOf);
  if (!cols.includes("impressions")) return [];
  return body.map((cells) => {
    const r: Row = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    cells.forEach((v, i) => {
      const c = cols[i];
      if (!c) return;
      if (c === "query") r.query = v.trim();
      else if (c === "page") r.page = toPath(v);
      else if (c === "ctr") r.ctr = /%/.test(v) ? num(v) / 100 : num(v) > 1 ? num(v) / 100 : num(v);
      else r[c] = num(v);
    });
    if (!r.ctr && r.impressions > 0) r.ctr = r.clicks / r.impressions;
    return r;
  });
}

// ─────────────────────────────────────────────────────────────── 受け持ち（キーワードの受け持ち表・ブログ記事の検索意図）
interface Owner {
  path: string;
  keywords: string[];
  kind: "固定ページ" | "記事";
  /** 調べもの（informational・tool）か、依頼・案内（transactional・navigational など）か */
  informational: boolean;
}

/** 調べものの語を含むクエリは、問い合わせ・案内のページの受け持ちにしない */
const INFO_QUERY = /見方|とは|仕組み|方法|違い|何年|いつ|寿命|やり方|計算|比較|選び方|メリット|デメリット|費用|相場|必要/;

const tokens = (s: string) => String(s).toLowerCase().replace(/[　]/g, " ").split(/\s+/).filter(Boolean);
function dice(a: string, b: string): number {
  const grams = (s: string) => {
    const t = String(s).toLowerCase().replace(/[\s　「」『』（）()・、。！？!?｜|：:【】]/g, "");
    const out = new Set<string>();
    for (let i = 0; i < t.length - 1; i += 1) out.add(t.slice(i, i + 2));
    return out;
  };
  const A = grams(a);
  const B = grams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let hit = 0;
  for (const g of A) if (B.has(g)) hit += 1;
  return (2 * hit) / (A.size + B.size);
}

/**
 * クエリと受け持ちのキーワードの近さ（0〜1）。次の3つの大きいほう
 *   - 受け持ちのキーワードの語が、クエリにどれだけ入っているか（クエリ側の余分な語が多いほど少し下げる）
 *   - クエリの語が、受け持ちのキーワードにどれだけ入っているか（短いクエリ × 長い検索意図の記事。完全一致より少し下に置く）
 *   - 文字の並びの近さ（空白なしのクエリ向け）
 */
export function closeness(query: string, keyword: string): number {
  const q = tokens(query);
  const k = tokens(keyword);
  let byTokens = 0;
  if (q.length > 0 && k.length > 0) {
    const hitK = k.filter((x) => q.some((t) => t === x || t.includes(x) || x.includes(t))).length;
    byTokens = hitK / k.length;
    // クエリ側に、受け持ちに無い語が多いほど少し下げる（ロングテールは、受け持ちの子として扱う）
    const extra = q.filter((t) => !k.some((x) => t === x || t.includes(x) || x.includes(t))).length;
    byTokens = byTokens * (1 - Math.min(0.3, extra * 0.1));
  }
  const byQuery = q.length > 0 ? q.filter((t) => k.some((x) => t === x || t.includes(x) || x.includes(t))).length / q.length : 0;
  return Math.max(byTokens, 0.9 * byQuery, dice(query, keyword));
}

export function loadOwners(): Owner[] {
  const owners: Owner[] = SEO_MAP.filter((e) => e.index).map((e) => ({ path: e.path, keywords: [e.primary, ...e.secondary], kind: "固定ページ" as const, informational: e.intentType === "informational" || e.intentType === "tool" }));
  const blogDir = path.join(process.cwd(), "content", "blog");
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith(".md"))) {
      const { data } = matter(fs.readFileSync(path.join(blogDir, f), "utf8"));
      if (data.draft) continue;
      const slug = String(data.slug ?? f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""));
      if (data.intent) owners.push({ path: `/blog/${slug}`, keywords: [String(data.intent)], kind: "記事", informational: true });
    }
  }
  return owners;
}

/**
 * クエリの受け持ち（近さ 0.6 以上のいちばん近いページ）。
 * 表示されているページ（ranking）自身が十分近ければ、それを受け持ちとみなす（すでに検索エンジンがそのページと結び付けている）
 */
export function ownerOf(query: string, owners: Owner[], ranking?: string): { owner: Owner; score: number } | null {
  const info = INFO_QUERY.test(query);
  const candidates = owners.filter((o) => !info || o.informational || o.path === ranking);
  if (ranking) {
    const own = candidates.find((o) => o.path === ranking);
    const s = own ? Math.max(...own.keywords.map((k) => closeness(query, k))) : 0;
    if (own && s >= 0.6) return { owner: own, score: s };
  }
  let best: { owner: Owner; score: number } | null = null;
  for (const o of candidates) {
    for (const k of o.keywords) {
      const s = closeness(query, k);
      // 同じ近さなら固定ページを優先（記事は固定ページの子）
      if (!best || s > best.score + 1e-9 || (Math.abs(s - best.score) < 1e-9 && o.kind === "固定ページ" && best.owner.kind === "記事")) best = { owner: o, score: s };
    }
  }
  return best && best.score >= 0.6 ? best : null;
}

// ─────────────────────────────────────────────────────────────── 集計
export interface Report {
  brandQueries: number;
  opportunity: { query: string; impressions: number; clicks: number; position: number; page?: string; owner?: string }[];
  cannibal: { query: string; pages: { page: string; impressions: number; position: number }[]; owner?: string }[];
  ctr: { query: string; impressions: number; ctr: number; median: number; position: number; page?: string }[];
  gap: { query: string; impressions: number; position: number; page?: string }[];
  silentPages: string[];
  hasPairs: boolean;
  hasPages: boolean;
}

const bucketOf = (pos: number) => (pos <= 3 ? "1〜3位" : pos <= 6 ? "4〜6位" : pos <= 10 ? "7〜10位" : pos <= 20 ? "11〜20位" : "21位〜");
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0 ? 0 : s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

export function analyze(rows: Row[], owners: Owner[], minImpressions = MIN_IMPRESSIONS): Report {
  const pairs = rows.filter((r) => r.query && r.page);
  const queryRows = rows.filter((r) => r.query && !r.page);
  const pageRows = rows.filter((r) => r.page && !r.query);

  // クエリごとに合算（組み合わせの CSV しか無いときは、そこから作る）
  const byQuery = new Map<string, { impressions: number; clicks: number; posSum: number; pages: Map<string, { impressions: number; posSum: number }> }>();
  const src = queryRows.length > 0 ? queryRows : pairs;
  for (const r of src) {
    const q = r.query!;
    const cur = byQuery.get(q) ?? { impressions: 0, clicks: 0, posSum: 0, pages: new Map() };
    cur.impressions += r.impressions;
    cur.clicks += r.clicks;
    cur.posSum += r.position * r.impressions;
    byQuery.set(q, cur);
  }
  for (const r of pairs) {
    const cur = byQuery.get(r.query!);
    if (!cur) continue;
    const p = cur.pages.get(r.page!) ?? { impressions: 0, posSum: 0 };
    p.impressions += r.impressions;
    p.posSum += r.position * r.impressions;
    cur.pages.set(r.page!, p);
  }

  const queries = [...byQuery.entries()].map(([query, v]) => {
    const position = v.impressions > 0 ? v.posSum / v.impressions : 0;
    const pages = [...v.pages.entries()].map(([page, p]) => ({ page, impressions: p.impressions, position: p.impressions > 0 ? p.posSum / p.impressions : 0 })).sort((a, b) => b.impressions - a.impressions);
    return { query, impressions: v.impressions, clicks: v.clicks, ctr: v.impressions > 0 ? v.clicks / v.impressions : 0, position, pages };
  });

  const brand = queries.filter((q) => BRAND.test(q.query));
  const generic = queries.filter((q) => !BRAND.test(q.query));
  const enough = generic.filter((q) => q.impressions >= minImpressions);

  const opportunity = enough
    .filter((q) => q.position >= 4 && q.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .map((q) => ({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, page: q.pages[0]?.page, owner: ownerOf(q.query, owners, q.pages[0]?.page)?.owner.path }));

  const cannibal = generic
    .filter((q) => q.impressions >= minImpressions && q.pages.length >= 2)
    .map((q) => ({ q, strong: q.pages.filter((p) => p.impressions >= q.impressions * 0.1) }))
    .filter(({ strong }) => strong.length >= 2)
    .sort((a, b) => b.q.impressions - a.q.impressions)
    .map(({ q, strong }) => ({ query: q.query, pages: strong, owner: ownerOf(q.query, owners)?.owner.path }));

  // CTR：同じ順位帯の、このサイトのクエリの中央値と比べる（帯に5件以上あるときだけ）
  const medians = new Map<string, number>();
  for (const b of ["1〜3位", "4〜6位", "7〜10位", "11〜20位"]) {
    const xs = enough.filter((q) => bucketOf(q.position) === b).map((q) => q.ctr);
    if (xs.length >= 5) medians.set(b, median(xs));
  }
  const ctr = enough
    .filter((q) => q.position <= 10 && medians.has(bucketOf(q.position)) && q.ctr < medians.get(bucketOf(q.position))! * 0.5)
    .sort((a, b) => b.impressions - a.impressions)
    .map((q) => ({ query: q.query, impressions: q.impressions, ctr: q.ctr, median: medians.get(bucketOf(q.position))!, position: q.position, page: q.pages[0]?.page }));

  const gap = enough
    .filter((q) => !ownerOf(q.query, owners, q.pages[0]?.page))
    .sort((a, b) => b.impressions - a.impressions)
    .map((q) => ({ query: q.query, impressions: q.impressions, position: q.position, page: q.pages[0]?.page }));

  const seenPages = new Set<string>([...pageRows.map((r) => r.page!), ...pairs.map((r) => r.page!)]);
  const hasPages = seenPages.size > 0;
  const silentPages = hasPages ? SEO_MAP.filter((e) => e.index && !seenPages.has(e.path)).map((e) => e.path) : [];

  return { brandQueries: brand.length, opportunity, cannibal, ctr, gap, silentPages, hasPairs: pairs.length > 0, hasPages };
}

// ─────────────────────────────────────────────────────────────── 表示
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const pos = (x: number) => x.toFixed(1);

export function toMarkdown(r: Report, minImpressions = MIN_IMPRESSIONS): string {
  const out: string[] = [];
  out.push(`表示回数 ${minImpressions} 回以上のクエリが対象。指名検索 ${r.brandQueries} 件は除いた。`);
  out.push("", "## 1. 伸びしろ（掲載順位 4〜20 位・表示回数の多い順）", "");
  if (r.opportunity.length === 0) out.push("該当なし");
  else {
    out.push("| クエリ | 表示回数 | クリック | 平均順位 | 表示されたページ | 受け持ち | すること |", "|---|---:|---:|---:|---|---|---|");
    for (const o of r.opportunity.slice(0, 30)) {
      const todo = !o.owner ? "受け持ちが無い：既存ページで答えられるかを先に検討" : o.page && o.page !== o.owner ? `順位が付いているのは ${o.page}。受け持ちの ${o.owner} へ文脈リンクを足し、受け持ちの本文で答える` : `${o.owner} の title・見出し・冒頭の答えを、この語で見直す`;
      out.push(`| ${o.query} | ${o.impressions} | ${o.clicks} | ${pos(o.position)} | ${o.page ?? "-"} | ${o.owner ?? "-"} | ${todo} |`);
    }
  }
  out.push("", "## 2. 取り合い（同じクエリで2ページ以上）", "");
  if (!r.hasPairs) out.push("クエリとページの組み合わせの CSV が無いため、判定していません（data/seo/search-console/README.md）。");
  else if (r.cannibal.length === 0) out.push("該当なし");
  else {
    out.push("| クエリ | ページ（表示回数・平均順位） | 受け持ち | すること |", "|---|---|---|---|");
    for (const c of r.cannibal.slice(0, 30)) {
      const pages = c.pages.map((p) => `${p.page}（${p.impressions}・${pos(p.position)}位）`).join("<br>");
      const todo = c.owner ? `受け持ちは ${c.owner}。ほかのページの title・見出しからこの語を外し、受け持ちへ文脈リンク。統合は最後の手段` : "受け持ちを決めてから直す（data/seo/keyword-map.ts）";
      out.push(`| ${c.query} | ${pages} | ${c.owner ?? "-"} | ${todo} |`);
    }
  }
  out.push("", "## 3. クリック率の伸びしろ（同じ順位帯の、このサイトの中央値の半分未満）", "");
  if (r.ctr.length === 0) out.push("該当なし（順位帯ごとに5件以上のクエリがあるときだけ判定）");
  else {
    out.push("| クエリ | 表示回数 | CTR | 帯の中央値 | 平均順位 | ページ | すること |", "|---|---:|---:|---:|---:|---|---|");
    for (const c of r.ctr.slice(0, 30)) out.push(`| ${c.query} | ${c.impressions} | ${pct(c.ctr)} | ${pct(c.median)} | ${pos(c.position)} | ${c.page ?? "-"} | title と description が、このクエリの答えを先に示しているかを見直す |`);
  }
  out.push("", "## 4. 受け持ちの無いクエリ", "");
  if (r.gap.length === 0) out.push("該当なし");
  else {
    out.push("| クエリ | 表示回数 | 平均順位 | 表示されたページ | すること |", "|---|---:|---:|---|---|");
    for (const g of r.gap.slice(0, 30)) out.push(`| ${g.query} | ${g.impressions} | ${pos(g.position)} | ${g.page ?? "-"} | 既存ページの中で答えるか、受け持ち表の関連キーワードに足す。新しいページは、作る条件（docs/seo-playbook.md）を満たすときだけ |`);
  }
  out.push("", "## 5. 表示の無い重要ページ（受け持ち表で検索結果に出すページ）", "");
  if (!r.hasPages) out.push("ページの CSV が無いため、判定していません。");
  else if (r.silentPages.length === 0) out.push("該当なし");
  else out.push(...r.silentPages.map((p) => `- ${p}`));
  return out.join("\n");
}

// ─────────────────────────────────────────────────────────────── 実行
function selftest(): void {
  const file = path.join(process.cwd(), "scripts", "fixtures", "gsc-synthetic.csv");
  const rows = readRows(fs.readFileSync(file, "utf8"));
  const owners = loadOwners();
  const r = analyze(rows, owners, 30);
  let failed = 0;
  const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
    if (!ok) failed += 1;
  };
  check("列名（英語）と CTR の % 表記を読める", rows.length >= 10 && rows.every((x) => x.ctr >= 0 && x.ctr <= 1), `${rows.length} 行`);
  check("ページの URL を、サイト内のパスにそろえる", toPath("https://www.solarshift.jp/subsidy/katsushika/?utm=1") === "/subsidy/katsushika");
  check("指名検索は、伸びしろの判定から外す", r.brandQueries >= 1 && !r.opportunity.some((o) => /solar shift|ソーラーシフト/i.test(o.query)));
  const opp = r.opportunity.find((o) => o.query === "葛飾区 太陽光 補助金");
  check("伸びしろ：4〜20位で表示の多いクエリを拾い、受け持ちのページを示す", Boolean(opp) && opp?.owner === "/subsidy/katsushika", JSON.stringify(opp));
  check("伸びしろ：3位以内のクエリは入れない", !r.opportunity.some((o) => o.position < 4));
  check("取り合い：同じクエリで2ページ以上が表示されたら挙げる", r.cannibal.some((c) => c.query === "蓄電池 補助金 東京都" && c.pages.length >= 2));
  check("受け持ちの無いクエリを挙げる", r.gap.some((g) => g.query === "雨漏り 修理 費用"));
  check("受け持ちのあるクエリは、受け持ちの無いクエリに入れない", !r.gap.some((g) => g.query === "葛飾区 太陽光 補助金"));
  check("表示回数の下限より少ないクエリは対象にしない", !r.opportunity.some((o) => o.impressions < 30) && !r.gap.some((g) => g.impressions < 30));
  check("クリック率：同じ順位帯の中央値の半分未満を挙げる", r.ctr.some((c) => c.query === "蓄電池 寿命 何年"), JSON.stringify(r.ctr.map((c) => c.query)));
  const ja = readRows("上位のクエリ,クリック数,表示回数,CTR,掲載順位\n葛飾区 蓄電池,3,120,2.5%,8.4\n");
  check("画面のエクスポート（日本語の列名）を読める", ja.length === 1 && ja[0].query === "葛飾区 蓄電池" && ja[0].impressions === 120 && Math.abs(ja[0].ctr - 0.025) < 1e-9 && ja[0].position === 8.4);
  console.log(failed === 0 ? "\nALL PASSED" : `\nFAILED: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

function main(): void {
  if (SELFTEST) return selftest();
  const { files, rows } = readSearchConsoleDir();
  if (files.length === 0) {
    console.log(`Search Console の CSV がまだありません（${path.relative(process.cwd(), DIR)}/）。`);
    console.log("出し方と置き方は data/seo/search-console/README.md を見てください。CSV を置いたら、もう一度実行します。");
    return;
  }
  console.log(`読んだファイル: ${files.join("、")}（${rows.length} 行）`);
  const md = toMarkdown(analyze(rows, loadOwners()));
  console.log(`\n${md}`);
  if (OUT) {
    fs.writeFileSync(path.join(process.cwd(), OUT), `# Search Console から見た、直す順番\n\n${md}\n`);
    console.log(`\n書き出し: ${OUT}`);
  }
}

// ほかのスクリプト（blog-audit の --prune）から CSV の読み込みだけを使えるように、直接実行したときだけ動かす
if (/seo-opportunities\.ts$/.test(process.argv[1] ?? "")) main();
