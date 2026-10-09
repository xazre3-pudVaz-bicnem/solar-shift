/**
 * お問い合わせフォームの送信（app/api/contact/route.ts）の自己診断。メールは送らない（fetch を差し替える）。
 *   npx tsx scripts/contact-selftest.ts
 *
 * - キーが無い間は 503（送信したふりをしない）
 * - キーがあると、Resend に「送信元＝確認済みドメインのアドレス」「送信先＝連絡先メール」「返信先＝お客様のメール」で送る
 * - 入力の不備は 400、ハニーポットに値があれば送らない、Resend が失敗したら 502
 */
import { siteConfig, contactEmail } from "../lib/site";

let failed = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  console.log(`${cond ? "PASS" : "  NG"}  ${label}${!cond && detail ? `  →  ${detail}` : ""}`);
  if (!cond) failed += 1;
};

interface Sent {
  url: string;
  auth: string;
  body: { from: string; to: string[]; reply_to?: string; subject: string; text: string };
}
const sent: Sent[] = [];
let resendStatus = 200;
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (!url.startsWith("https://api.resend.com/")) return realFetch(input, init);
  const headers = new Headers(init?.headers);
  sent.push({ url, auth: headers.get("authorization") ?? "", body: JSON.parse(String(init?.body ?? "{}")) });
  return resendStatus === 200
    ? new Response(JSON.stringify({ id: "test" }), { status: 200 })
    : new Response(JSON.stringify({ name: "validation_error", message: "The domain is not verified." }), { status: resendStatus });
}) as typeof fetch;

const valid = { name: "葛飾 太郎", email: "taro@example.com", tel: "", area: "葛飾区", town: "亀有", topic: "太陽光発電の相談", message: "見積もりをお願いします。" };
const post = async (payload: unknown) => {
  const { POST } = await import("../app/api/contact/route");
  const res = await POST(new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }));
  return { status: res.status, json: (await res.json()) as { ok?: boolean; error?: string } };
};

(async () => {
  const savedLog = console.error;
  const errors: string[] = [];
  console.error = (...a: unknown[]) => errors.push(a.map(String).join(" "));

  // ── 1. キーが無い間
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_EMAIL_FROM;
  delete process.env.CONTACT_EMAIL_TO;
  let r = await post(valid);
  ok(r.status === 503 && sent.length === 0, "キーが無い間は 503 で、何も送らない", `status=${r.status} sent=${sent.length}`);

  // ── 2. キーがあるとき（送信元・送信先は既定値）
  process.env.RESEND_API_KEY = "re_selftest";
  r = await post(valid);
  const m = sent[0];
  ok(r.status === 200 && r.json.ok === true && sent.length === 1, "キーがあると送信して 200", `status=${r.status} sent=${sent.length}`);
  const domain = new URL(siteConfig.productionUrl).hostname.replace(/^www\./, "");
  ok(m?.body.from === `${siteConfig.name} <noreply@${domain}>`, "送信元は、確認済みドメインのアドレス", m?.body.from);
  ok(domain === "solarshift.jp", "送信元のドメインは solarshift.jp（Resend で確認したドメイン）", domain);
  ok(m?.body.to.length === 1 && m.body.to[0] === contactEmail(), "送信先は、連絡先メール", String(m?.body.to));
  ok(m?.body.reply_to === valid.email, "返信先は、お客様のメール", String(m?.body.reply_to));
  ok(m?.auth === "Bearer re_selftest", "キーは Authorization ヘッダーで渡す");
  ok(Boolean(m?.body.subject.includes(valid.topic) && m.body.subject.includes(valid.name)), "件名に、相談の種類とお名前", m?.body.subject);
  ok(Boolean(m?.body.text.includes(valid.message) && m.body.text.includes("亀有")), "本文に、相談内容と町名");

  // ── 3. 電話番号だけのとき（返信先は付けない）
  sent.length = 0;
  r = await post({ ...valid, email: "", tel: "090-0000-0000" });
  ok(r.status === 200 && sent.length === 1 && sent[0].body.reply_to === undefined, "電話番号だけのときは、返信先を付けない", JSON.stringify(sent[0]?.body.reply_to));

  // ── 4. 環境変数で上書き
  sent.length = 0;
  process.env.CONTACT_EMAIL_FROM = "SOLAR SHIFT <form@solarshift.jp>";
  process.env.CONTACT_EMAIL_TO = "someone@example.com";
  r = await post(valid);
  ok(sent[0]?.body.from === "SOLAR SHIFT <form@solarshift.jp>" && sent[0]?.body.to[0] === "someone@example.com", "送信元と送信先は、環境変数で変えられる");
  delete process.env.CONTACT_EMAIL_FROM;
  delete process.env.CONTACT_EMAIL_TO;

  // ── 5. 入力の不備
  sent.length = 0;
  ok((await post({ ...valid, name: "" })).status === 400, "お名前が無ければ 400");
  ok((await post({ ...valid, message: "" })).status === 400, "相談内容が無ければ 400");
  ok((await post({ ...valid, email: "", tel: "" })).status === 400, "連絡先が無ければ 400");
  ok((await post({ ...valid, email: "not-an-email" })).status === 400, "メールアドレスの形が違えば 400");
  ok((await post({ ...valid, email: "", tel: "abc" })).status === 400, "電話番号の形が違えば 400");
  ok(sent.length === 0, "不備のある入力では、何も送らない", `sent=${sent.length}`);

  // ── 6. ハニーポット
  r = await post({ ...valid, website: "http://spam.example" });
  ok(r.status === 200 && sent.length === 0, "ハニーポットに値があれば、成功を装って送らない", `status=${r.status} sent=${sent.length}`);

  // ── 7. Resend が失敗したとき
  resendStatus = 403;
  r = await post(valid);
  ok(r.status === 502, "Resend が失敗したら 502", `status=${r.status}`);
  ok(
    errors.some((e) => e.includes("[contact]") && e.includes("403") && e.includes("validation_error")),
    "失敗の理由をログに出す",
    errors.join(" / "),
  );
  ok(!errors.some((e) => e.includes(valid.name) || e.includes(valid.email) || e.includes("re_selftest")), "ログに、お客様の入力やキーを出さない");

  console.error = savedLog;
  console.log(failed === 0 ? "\nALL PASSED" : `\nFAILED: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
})();
