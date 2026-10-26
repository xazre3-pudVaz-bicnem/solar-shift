/**
 * 外部リンク（出典に使っている公式ページなど）の点検。ビルド後の HTML から外部リンクを集め、いまも開けるかを確かめる。
 *   VERCEL_ENV=production npm run build && npm run links:external
 *
 * .github/workflows/external-links.yml が毎週動かす。失敗があると GitHub からメールが届く。
 *
 * 確かめ方
 *   - 転送は最大5回までたどり、最後に着いたページの応答で判定する（転送そのものも「移転」として注意に出す）
 *   - 1回目が 200 番台でなければ、少し待ってもう一度取る。2回の結果を両方見て判定する
 *
 * 判定
 *   200 番台に着いた                       … 問題なし（途中に転送があれば、注意：移転先の URL に直す）
 *     1回目が 500 番台・時間切れで、2回目に開けた … 問題なし（一時的な不調。再試行はそのためにある）
 *     1回目が 404・410 で、2回目に開けた         … 注意：結果が食い違う。再確認する
 *   2回とも 404・410・名前が無い（ENOTFOUND） … 失敗：ページが無くなった。出典を探し直す（404 と 410 の組み合わせも、どちらも「無い」なので失敗）
 *     ただし、そのサイトのトップが「メンテナンス」の画面なら、注意にとどめる（サイト全体の一時停止）
 *   2回の結果が食い違う                     … 注意：再確認する
 *   403・429・500 番台・時間切れ・一時的な名前解決の失敗（EAI_AGAIN）・転送が多すぎる … 注意：一時的な不調や、機械からのアクセスを断っている場合がある
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
const MAX_REDIRECTS = 5;

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
const isRedirect = (s) => [301, 302, 303, 307, 308].includes(s);
const isOk = (r) => r.status >= 200 && r.status < 300;
/** ページが無くなった、とみなす応答 */
const isGone = (r) => r.status === 404 || r.status === 410 || r.error === "ENOTFOUND";

/** 1回分の取得（転送は自分でたどる）。戻り値：最後の応答と、たどった転送 */
async function request(url) {
  const hops = [];
  let current = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 25_000);
    try {
      const res = await fetch(current, { method: "GET", redirect: "manual", headers: HEADERS, signal: ctl.signal });
      if (isRedirect(res.status)) {
        const location = res.headers.get("location");
        await res.body?.cancel();
        if (!location) return { status: res.status, url: current, hops, body: "", error: "転送先が無い" };
        const next = new URL(location, current).href;
        hops.push({ status: res.status, from: current, to: next });
        current = next;
        continue;
      }
      const isHtml = (res.headers.get("content-type") ?? "").includes("text/html");
      const body = isHtml ? (await res.text()).slice(0, 20_000) : (await res.body?.cancel(), "");
      return { status: res.status, url: current, hops, body };
    } catch (e) {
      return { status: 0, url: current, hops, body: "", error: String(e?.cause?.code ?? e?.name ?? e) };
    } finally {
      clearTimeout(timer);
    }
  }
  return { status: 0, url: current, hops, body: "", error: "転送が多すぎる" };
}

/** 2回まで取る。1回目が 200 番台なら、それで終わり */
async function check(url) {
  const first = await request(url);
  if (isOk(first)) return { first, second: null };
  await sleep(3000);
  return { first, second: await request(url) };
}

const maintenanceCache = new Map();
/** そのサイトのトップ（転送もたどる）が「メンテナンス中」の画面か */
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

const label = (r) => (r.status ? String(r.status) : r.error);
const errors = [];
const warnings = [];
let okCount = 0;
for (const url of urls) {
  const { first, second } = results.get(url);
  const pages = [...links.get(url)];
  const where = `${pages.length} ページ（${pages.slice(0, 4).join("、")}${pages.length > 4 ? " ほか" : ""}）`;
  const final = second && isOk(second) ? second : first;
  const moved = final.hops.length > 0 ? `（転送：${final.hops.slice(0, 3).map((h) => `${h.status} → ${h.to}`).join("、")}${final.hops.length > 3 ? "、…" : ""}）` : "";

  if (isOk(final)) {
    // 1回目が「無くなった」応答で、2回目に開けた：サーバーが不安定なので、再確認に回す
    // （1回目が 500 番台や時間切れで、2回目に開けたときは、一時的な不調として問題なしにする。再試行はそのためにある）
    if (second && isGone(first)) warnings.push(`結果が食い違う（1回目 ${label(first)}・2回目 ${label(second)}）：${url}｜再確認する｜${where}`);
    else if (final.hops.length > 0) warnings.push(`移転：${url} → ${final.url}｜移転先の URL に直す｜${where}`);
    else okCount += 1;
    continue;
  }
  if (isGone(first) && second && isGone(second)) {
    const maint = await underMaintenance(url);
    if (maint) warnings.push(`${label(second)}（サイト全体がメンテナンス中：「${maint}」）：${url}${moved}｜${where}`);
    else errors.push(`${label(second)}：${url}${moved}｜${where}`);
    continue;
  }
  if (second && label(first) !== label(second)) {
    warnings.push(`結果が食い違う（1回目 ${label(first)}・2回目 ${label(second)}）：${url}${moved}｜再確認する｜${where}`);
    continue;
  }
  warnings.push(`${label(second ?? first)}：${url}${moved}｜${where}`);
}

const lines = [
  `## 外部リンクの点検`,
  ``,
  `外部リンク ${urls.length} 種類 ／ 問題なし ${okCount} ／ 注意 ${warnings.length} ／ 失敗 ${errors.length}`,
  ``,
  ...(errors.length ? ["### 失敗（ページが見つからない。出典を探し直す）", ...errors.map((e) => `- ${e}`), ""] : []),
  ...(warnings.length ? ["### 注意", ...warnings.map((w) => `- ${w}`), ""] : []),
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
process.exit(errors.length > 0 ? 1 : 0);
