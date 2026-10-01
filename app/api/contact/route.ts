import { NextResponse } from "next/server";
import { siteConfig, contactEmail } from "@/lib/site";

/**
 * お問い合わせフォームの送信先。
 * RESEND_API_KEY と CONTACT_EMAIL_TO が設定されていれば Resend でメール送信する。
 * 未設定なら 503 を返し、フロント側でメールアドレスを案内する（送信したふりをしない）。
 */

export const dynamic = "force-dynamic";

interface Payload {
  name?: string;
  email?: string;
  tel?: string;
  area?: string;
  topic?: string;
  message?: string;
  website?: string; // ハニーポット
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
  const topic = clean(data.topic, 100);
  const message = clean(data.message, 4000);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "お名前・メールアドレス・ご相談内容は必須です。" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "メールアドレスの形式が正しくありません。" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO || contactEmail();
  const from = process.env.CONTACT_EMAIL_FROM;
  if (!apiKey || !to || !from) {
    return NextResponse.json({ error: "フォーム送信は準備中です。" }, { status: 503 });
  }

  const text = [
    `${siteConfig.name} サイトからお問い合わせがありました。`,
    "",
    `お名前: ${name}`,
    `メール: ${email}`,
    `電話: ${tel || "（未入力）"}`,
    `エリア: ${area}`,
    `種類: ${topic}`,
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
      reply_to: email,
      subject: `【${siteConfig.name}】お問い合わせ：${topic}（${name} 様）`,
      text,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "送信に失敗しました。時間をおいて再度お試しください。" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
