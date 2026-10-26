/**
 * 外部リンク（出典に使っている公式ページなど）の点検。ビルド後の HTML から外部リンクを集め、いまも開けるかを確かめる。
 *   VERCEL_ENV=production npm run build && npm run links:external
 *
 * .github/workflows/external-links.yml が毎週動かす。落ちたら GitHub からメールが届く。
 *
 * 判定
 *   200 番台                 … 問題なし
 *   転送（301・302・307・308） … 注意：リンク先が移った。移転先の URL に直す
 *   404・410・名前解決できない … 失敗：ページが無くなった。出典を探し直す
 *     ただし、そのサイトのトップが「メンテナンス」の画面なら、注意にとどめる（サイト全体の一時停止）
 *   403・429・500 番台・時間切れ … 注意：一時的な不調や、機械からのアクセスを断っている場合がある
 */
import fs from "node:fs";
import path from "node:path";

const APP = path.join(process.cwd(), ".next", "server", "app");
const SKIP = /solarshift\.jp|fonts\.googleapis\.com|fonts\.gstatic\.com|google\.com\/maps|maps\.google\.|schema\.org|wikidata\.org/;
const HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
  "accept-language": "ja,en;q=0.8",
};

if (!fs.existsSync(APP)) {
  console.error("ビルド結果がありません。先に VERCEL_ENV=production npm run build を実行してください。");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** 外部 URL → それを載せているページ */
const links = new Map();
for (const file of walk(APP)) {
  const route = ("/" + path.relative(APP, file).split(path.sep).join("/").replace(/\.html$/, "")).replace(/^\/index$/, "/");
  if (route.startsWith("/_")) continue;
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, "&");
    if (SKIP.test(url)) continue;
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(route);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 25_000);
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual", headers: HEADERS, signal: ctl.signal });
    const location = res.headers.get("location") ?? "";
    const isHtml = (res.headers.get("content-type") ?? "").includes("text/html");
    const body = isHtml ? (await res.text()).slice(0, 20_000) : (await res.body?.cancel(), "");
    return { status: res.status, location, body };
  } catch (e) {
    return { status: 0, location: "", body: "", error: String(e?.cause?.code ?? e?.name ?? e) };
  } finally {
    clearTimeout(timer);
  }
}

/** 2回まで試す（1回目が 200 以外なら、少し待って取り直す） */
async function check(url) {
  let r = await request(url);
  if (r.status < 200 || r.status >= 300) {
    await sleep(3000);
    const again = await request(url);
    if (again.status >= 200 && again.status < 300) r = again;
  }
  return r;
}

const maintenanceCache = new Map();
/** そのサイトのトップが「メンテナンス中」の画面か */
async function underMaintenance(url) {
  const origin = new URL(url).origin;
  if (!maintenanceCache.has(origin)) {
    const top = await request(origin + "/");
    const title = (top.body.match(/<title>([^<]*)<\/title>/i) ?? [])[1] ?? "";
    maintenanceCache.set(origin, /メンテナンス|maintenance/i.test(title) ? title.trim() : "");
  }
  return maintenanceCache.get(origin);
}

const urls = [...links.keys()].sort();
const results = new Map();
let next = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await check(url));
    }
  }),
);

const errors = [];
const warnings = [];
for (const url of urls) {
  const r = results.get(url);
  const pages = [...links.get(url)];
  const where = `${pages.length} ページ（${pages.slice(0, 4).join("、")}${pages.length > 4 ? " ほか" : ""}）`;
  if (r.status >= 200 && r.status < 300) continue;
  if ([301, 302, 303, 307, 308].includes(r.status)) {
    const to = r.location ? new URL(r.location, url).href : "";
    warnings.push(`移転 ${r.status}：${url} → ${to}｜${where}`);
    continue;
  }
  const gone = r.status === 404 || r.status === 410 || ["ENOTFOUND", "EAI_AGAIN"].includes(r.error ?? "");
  if (gone) {
    const maint = await underMaintenance(url);
    if (maint) warnings.push(`${r.status || r.error}（サイト全体がメンテナンス中：「${maint}」）：${url}｜${where}`);
    else errors.push(`${r.status || r.error}：${url}｜${where}`);
    continue;
  }
  warnings.push(`${r.status || r.error}：${url}｜${where}`);
}

const lines = [
  `## 外部リンクの点検`,
  ``,
  `外部リンク ${urls.length} 種類 ／ 問題なし ${urls.length - errors.length - warnings.length} ／ 注意 ${warnings.length} ／ 失敗 ${errors.length}`,
  ``,
  ...(errors.length ? ["### 失敗（ページが見つからない。出典を探し直す）", ...errors.map((e) => `- ${e}`), ""] : []),
  ...(warnings.length ? ["### 注意", ...warnings.map((w) => `- ${w}`), ""] : []),
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
process.exit(errors.length > 0 ? 1 : 0);
