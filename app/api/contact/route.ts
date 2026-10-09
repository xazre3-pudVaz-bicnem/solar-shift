import { NextResponse } from "next/server";
import { siteConfig, contactEmail } from "@/lib/site";

/**
 * お問い合わせフォームの送信先。
 * RESEND_API_KEY が設定されていれば、Resend でメールを送る。
 * 未設定なら 503 を返し、フロント側でメールアドレスを案内する（送信したふりをしない）。
 *
 * 送信先 … CONTACT_EMAIL_TO。無ければ lib/site.ts の連絡先メール
 * 送信元 … CONTACT_EMAIL_FROM。無ければ「サイト名 <noreply@本番ドメイン>」（Resend で確認済みのドメイン solarshift.jp）
 * 返信先 … お客様がメールアドレスを書いたときは、そのアドレス（届いたメールにそのまま返信できる）
 *
 * 必須：お名前・ご相談内容・連絡先（メールアドレスか電話番号のどちらか）
 * 任意：町名・月の電気代・太陽光の有無・蓄電池の有無
 */

export const dynamic = "force-dynamic";

interface Payload {
  name?: string;
  email?: string;
  tel?: string;
  area?: string;
  town?: string;
  topic?: string;
  message?: string;
  bill?: string;
  hasSolar?: string;
  hasBattery?: string;
  website?: string; // ハニーポット
}

/** 送信元の既定値。本番ドメインから www. を除いたもの（Resend で確認済みのドメイン）のアドレスにする */
function defaultFrom(): string {
  const domain = new URL(siteConfig.productionUrl).hostname.replace(/^www\./, "");
  return `${siteConfig.name} <noreply@${domain}>`;
}

function clean(v: unknown, max = 2000): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function POST(req: Request) {
  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }

  // ハニーポットに値があればスパム扱い（成功を装って終了）
  if (clean(data.website)) return NextResponse.json({ ok: true });

  const name = clean(data.name, 100);
  const email = clean(data.email, 200);
  const tel = clean(data.tel, 40);
  const area = clean(data.area, 50);
  const town = clean(data.town, 50);
  const topic = clean(data.topic, 100);
  const message = clean(data.message, 4000);
  const bill = clean(data.bill, 40);
  const hasSolar = clean(data.hasSolar, 20);
  const hasBattery = clean(data.hasBattery, 20);

  if (!name || !message) {
    return NextResponse.json({ error: "お名前とご相談内容は必須です。" }, { status: 400 });
  }
  if (!email && !tel) {
    return NextResponse.json({ error: "ご連絡先として、メールアドレスか電話番号のどちらかをご記入ください。" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "メールアドレスの形式が正しくありません。" }, { status: 400 });
  }
  if (tel && !/^[0-9+\-()\s]{9,20}$/.test(tel)) {
    return NextResponse.json({ error: "電話番号の形式が正しくありません。" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO || contactEmail();
  const from = process.env.CONTACT_EMAIL_FROM || defaultFrom();
  if (!apiKey || !to) {
    return NextResponse.json({ error: "フォーム送信は準備中です。" }, { status: 503 });
  }

  const text = [
    `${siteConfig.name} サイトからお問い合わせがありました。`,
    "",
    `お名前: ${name}`,
    `メール: ${email || "（未入力）"}`,
    `電話: ${tel || "（未入力）"}`,
    `エリア: ${area}${town ? `（${town}）` : ""}`,
    `種類: ${topic}`,
    `月の電気代: ${bill || "（未選択）"}`,
    `太陽光発電: ${hasSolar || "（未選択）"}`,
    `蓄電池: ${hasBattery || "（未選択）"}`,
    "",
    "ご相談内容:",
    message,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      ...(email ? { reply_to: email } : {}),
      subject: `【${siteConfig.name}】お問い合わせ：${topic}（${name} 様）`,
      text,
    }),
  });

  if (!res.ok) {
    // 原因を Vercel のログで追えるようにする（お客様の入力やキーは出さない）
    const detail = (await res.json().catch(() => null)) as { name?: string; message?: string } | null;
    console.error("[contact] Resend での送信に失敗", res.status, detail?.name ?? "", detail?.message ?? "");
    return NextResponse.json({ error: "送信に失敗しました。時間をおいて再度お試しください。" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
