/**
 * 外部リンクの点検（scripts/check-external-links.mjs）の自己診断。手元に小さなサーバーを立てて判定を確かめる（外のサイトには接続しない）。
 *   npm run links:external:selftest
 * 確かめること：正常／転送の先が正常（移転の注意）／転送の先が 404（失敗）／転送のループ／1回目と2回目の食い違い（503→404・404→200）／
 *   一時的な不調のあとに開けた（503→200 は問題なし）／404→410（どちらも無いので失敗）／トップが転送の先でメンテナンス画面
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

// 一時のフォルダに、点検の対象になる .next/server/app を作る
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "links-selftest-"));
const SCRIPT = path.resolve("scripts/check-external-links.mjs");
// 1回目と2回目で応答を変えるページ（呼ばれた回数で切り替える）
const count = new Map();
const nth = (u) => {
  const n = count.get(u) ?? 0;
  count.set(u, n + 1);
  return n;
};
const srv = http.createServer((req, res) => {
  const u = req.url;
  if (u === "/ok") return res.writeHead(200, { "content-type": "text/html" }).end("<title>ok</title>");
  if (u === "/moved") return res.writeHead(301, { location: "/ok" }).end();
  if (u === "/moved-to-gone") return res.writeHead(301, { location: "/gone" }).end();
  if (u === "/gone") return res.writeHead(404).end();
  if (u === "/loop") return res.writeHead(302, { location: "/loop" }).end();
  if (u === "/flaky") return res.writeHead(nth(u) === 0 ? 503 : 404).end();
  if (u === "/gone-then-ok") return nth(u) === 0 ? res.writeHead(404).end() : res.writeHead(200, { "content-type": "text/html" }).end("<title>ok</title>");
  if (u === "/busy-then-ok") return nth(u) === 0 ? res.writeHead(503).end() : res.writeHead(200, { "content-type": "text/html" }).end("<title>ok</title>");
  if (u === "/404-then-410") return res.writeHead(nth(u) === 0 ? 404 : 410).end();
  if (u === "/") return res.writeHead(200, { "content-type": "text/html" }).end("<title>トップ</title>");
  res.writeHead(404).end();
});
const srv2 = http.createServer((req, res) => {
  if (req.url === "/") return res.writeHead(302, { location: "/maint" }).end();
  if (req.url === "/maint") return res.writeHead(200, { "content-type": "text/html" }).end("<title>システムメンテナンスのお知らせ</title>");
  res.writeHead(404).end();
});
await new Promise((r) => srv.listen(47811, "127.0.0.1", r));
await new Promise((r) => srv2.listen(47812, "127.0.0.1", r));
const A = "http://127.0.0.1:47811";
const B = "http://127.0.0.1:47812";
const app = path.join(ROOT, ".next", "server", "app");
fs.mkdirSync(app, { recursive: true });
fs.writeFileSync(
  path.join(app, "index.html"),
  ["/ok", "/moved", "/moved-to-gone", "/loop", "/flaky", "/gone-then-ok", "/busy-then-ok", "/404-then-410"].map((p) => `<a href="${A}${p}">x</a>`).join("") + `<a href="${B}/page">y</a>`,
);
// 同じプロセスの中のサーバーが応答できるよう、子プロセスは非同期で動かす（spawnSync だと応答が止まる）
const r = await new Promise((resolve) => {
  const p = spawn(process.execPath, [SCRIPT], { cwd: ROOT });
  let stdout = "";
  p.stdout.on("data", (d) => (stdout += d));
  p.stderr.on("data", (d) => (stdout += d));
  p.on("close", (status) => resolve({ stdout, status }));
});
srv.close();
srv2.close();
fs.rmSync(ROOT, { recursive: true, force: true });
if (process.argv.includes("--verbose")) console.log(r.stdout);
const out = r.stdout;
const expect = [
  [out.includes("問題なし 2"), "正常なリンクと、一時的な不調（503）のあとに開けたリンクは問題なし"],
  [/移転：http:\/\/127\.0\.0\.1:47811\/moved → http:\/\/127\.0\.0\.1:47811\/ok/.test(out), "転送の先が正常なら「移転」の注意"],
  [/### 失敗[\s\S]*47811\/moved-to-gone/.test(out), "転送の先が 404 なら失敗"],
  [/転送が多すぎる：http:\/\/127\.0\.0\.1:47811\/loop/.test(out), "転送のループは注意"],
  [/結果が食い違う（1回目 503・2回目 404）/.test(out), "1回目と2回目が食い違えば注意（503→404）"],
  [/結果が食い違う（1回目 404・2回目 200）/.test(out), "1回目が 404 で2回目に開けたら注意（404→200）"],
  [!/busy-then-ok/.test(out), "1回目が 503 で2回目に開けたら、一覧に出さない（503→200）"],
  [/### 失敗[\s\S]*47811\/404-then-410/.test(out), "404 のあと 410 なら失敗（どちらも無い）"],
  [/サイト全体がメンテナンス中：「システムメンテナンスのお知らせ」/.test(out), "トップが転送の先でメンテナンス画面なら注意"],
  [r.status === 1, "失敗があれば終了コード 1"],
];
let ng = 0;
for (const [ok, label] of expect) {
  console.log(ok ? "PASS" : "  NG", label);
  if (!ok) ng++;
}
console.log(ng ? `\nFAILED: ${ng}` : "\nALL PASSED");
process.exit(ng ? 1 : 0);
