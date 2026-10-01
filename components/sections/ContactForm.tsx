"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * お問い合わせフォーム。入力項目は最小限（名前・メール・エリア・相談内容）。
 * 送信先は /api/contact（Resend 設定時のみメール送信。未設定なら案内メッセージを返す）。
 * バリデーションエラー時も入力値は state に残す。
 */

type Status = "idle" | "sending" | "done" | "error" | "unconfigured";

const TOPICS = ["太陽光発電について", "蓄電池について", "太陽光＋蓄電池について", "V2H・HEMSについて", "補助金について", "現地調査・見積もり", "その他"];

export function ContactForm({ fallbackEmail }: { fallbackEmail: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [values, setValues] = useState({ name: "", email: "", tel: "", area: "葛飾区", topic: TOPICS[0], message: "", website: "" });

  const onChange = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setError("お名前・メールアドレス・ご相談内容は必須です。");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 503) {
        setStatus("unconfigured");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "送信に失敗しました。時間をおいて再度お試しください。");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("送信に失敗しました。時間をおいて再度お試しください。");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-navy-900 bg-white p-6">
        <p className="text-[18px] font-bold text-navy-900">お問い合わせを受け付けました</p>
        <p className="mt-2 text-[15px] leading-[1.8] text-ink-2">
          内容を確認のうえ、通常2〜3営業日以内に担当者よりご連絡します。お急ぎの場合は、メールでも受け付けています。
        </p>
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <div className="border border-orange-100 bg-orange-50 p-6">
        <p className="text-[16px] font-bold text-navy-900">フォーム送信は現在準備中です</p>
        <p className="mt-2 text-[15px] leading-[1.8] text-ink-2">
          お手数ですが、下記メールアドレス宛に「お名前・ご住所（市区）・ご相談内容」をお送りください。
        </p>
        <p className="mt-3">
          <a href={`mailto:${fallbackEmail}?subject=${encodeURIComponent("【SOLAR SHIFT】お問い合わせ")}`} className="text-[16px] font-bold text-navy-600 underline underline-offset-4">
            {fallbackEmail}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="お名前" required>
          <input type="text" name="name" autoComplete="name" value={values.name} onChange={onChange("name")} required className={inputCls} />
        </Field>
        <Field label="メールアドレス" required>
          <input type="email" name="email" autoComplete="email" value={values.email} onChange={onChange("email")} required className={inputCls} />
        </Field>
        <Field label="電話番号（任意）">
          <input type="tel" name="tel" autoComplete="tel" value={values.tel} onChange={onChange("tel")} className={inputCls} />
        </Field>
        <Field label="ご住所のエリア">
          <select name="area" value={values.area} onChange={onChange("area")} className={inputCls}>
            {["葛飾区", "足立区", "江戸川区", "墨田区", "その他の東京都内", "千葉県", "埼玉県", "その他"].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="ご相談の種類">
        <select name="topic" value={values.topic} onChange={onChange("topic")} className={inputCls}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="ご相談内容" required hint="屋根の形状・築年数・現在の電気代・ご希望の設備など、分かる範囲でお書きください。">
        <textarea name="message" rows={6} value={values.message} onChange={onChange("message")} required className={`${inputCls} h-auto py-3`} />
      </Field>
      {/* スパム対策のハニーポット（人は入力しない） */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onChange("website")} />
        </label>
      </div>

      {error && (
        <p role="alert" className="border-l-4 border-orange-500 bg-orange-50 px-4 py-2 text-[14px] text-accent-text">
          {error}
        </p>
      )}

      <p className="text-[13px] leading-[1.8] text-ink-2">
        ご入力いただいた情報は、お問い合わせへの回答のためにのみ使用します。詳しくは
        <Link href="/privacy" className="mx-1 text-navy-600 underline underline-offset-4">プライバシーポリシー</Link>
        をご確認ください。
      </p>

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-14 w-full items-center justify-center bg-navy-900 px-8 text-base font-bold text-white hover:bg-navy-700 disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "送信中…" : "この内容で送信する"}
      </button>
    </form>
  );
}

const inputCls = "h-12 w-full border border-line-2 bg-white px-3 text-[16px] text-ink focus:border-navy-900";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-[14px] font-bold text-navy-900">
        {label}
        {required && <span className="bg-orange-600 px-1.5 py-[1px] text-[11px] text-white">必須</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-ink-3">{hint}</span>}
    </label>
  );
}
