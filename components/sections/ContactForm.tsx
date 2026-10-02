"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * お問い合わせフォーム。
 * 基本項目：お名前・電話番号・メールアドレス・ご住所のエリア・ご相談内容
 * 任意項目：月の電気代・太陽光の有無・蓄電池の有無（折りたたみの中。書かなくても送れる）
 *
 * 送信先は /api/contact（Resend 設定時のみメール送信。未設定なら案内メッセージを返す）。
 * 未設定のときは、入力済みの内容を本文に入れたメール（mailto）と電話番号を案内する（入力し直させない）。
 * バリデーションエラー時も入力値は state に残す。
 * 入力欄の文字は 16px（iOS で入力時に画面が拡大されない大きさ）。
 */

type Status = "idle" | "sending" | "done" | "error" | "unconfigured";

const TOPICS = ["補助金について", "太陽光発電について", "蓄電池について", "太陽光＋蓄電池について", "V2H・HEMSについて", "現地調査・見積もり", "その他"];
const AREAS = ["葛飾区", "足立区", "江戸川区", "墨田区", "その他の東京都内", "千葉県", "埼玉県", "その他"];
/** 任意項目の選択肢。「選択しない」は空文字 */
const BILLS = ["1万円未満", "1万円〜1万5千円", "1万5千円〜2万円", "2万円以上", "わからない"];
const HAS = ["あり", "なし", "わからない"];

const initial = { name: "", email: "", tel: "", area: AREAS[0], town: "", topic: TOPICS[0], message: "", bill: "", hasSolar: "", hasBattery: "", website: "" };

export function ContactForm({ fallbackEmail, tel = "", telDisplay = "" }: { fallbackEmail: string; tel?: string; telDisplay?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [values, setValues] = useState(initial);

  const onChange = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!values.name.trim() || !values.message.trim()) {
      setError("お名前とご相談内容は必須です。");
      return;
    }
    if (!values.email.trim() && !values.tel.trim()) {
      setError("ご連絡先として、メールアドレスか電話番号のどちらかをご記入ください。");
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

  const mailSubject = encodeURIComponent("【SOLAR SHIFT】お問い合わせ");
  const mailBody = [
    `お名前：${values.name}`,
    `メールアドレス：${values.email || "（未入力）"}`,
    `電話番号：${values.tel || "（未入力）"}`,
    `ご住所のエリア：${values.area}${values.town ? `（${values.town}）` : ""}`,
    `ご相談の種類：${values.topic}`,
    `月の電気代：${values.bill || "（未選択）"}`,
    `太陽光発電：${values.hasSolar || "（未選択）"}`,
    `蓄電池：${values.hasBattery || "（未選択）"}`,
    "",
    "ご相談内容：",
    values.message.slice(0, 1500),
  ].join("\r\n");

  if (status === "done") {
    return (
      <div className="rounded-lg border border-l-4 border-line border-l-navy-900 bg-white p-6" role="status">
        <p className="text-[18px] font-bold text-navy-900">お問い合わせを受け付けました</p>
        <p className="mt-2 text-base leading-[1.8] text-ink-2">
          内容を確認のうえ、担当者よりご連絡します。
          {telDisplay ? (
            <>
              お急ぎの場合は、お電話（
              <a href={`tel:${tel}`} className="font-bold text-navy-700 underline underline-offset-4">
                {telDisplay}
              </a>
              ）でも受け付けています。
            </>
          ) : (
            "お急ぎの場合は、メールでも受け付けています。"
          )}
        </p>
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <div className="rounded-lg border border-l-4 border-orange-200 border-l-orange-500 bg-orange-50 p-6">
        <p className="text-[17px] font-bold text-navy-900">フォーム送信は現在準備中です</p>
        <p className="mt-2 text-base leading-[1.8] text-ink-2">お手数ですが、下のボタンからメールでお送りください。ご入力いただいた内容は、メールの本文にそのまま入ります。</p>
        <p className="mt-4">
          <a
            href={`mailto:${fallbackEmail}?subject=${mailSubject}&body=${encodeURIComponent(mailBody)}`}
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-orange-500 px-6 py-2 text-center font-heading text-base leading-[1.35] font-bold text-navy-950 hover:bg-orange-400"
          >
            入力した内容をメールで送る
          </a>
        </p>
        <p className="mt-4 text-base leading-[1.9] text-ink-2">
          メール：
          <a href={`mailto:${fallbackEmail}?subject=${mailSubject}`} className="inline-flex min-h-11 items-center font-bold break-all text-navy-700 underline underline-offset-4">
            {fallbackEmail}
          </a>
          {telDisplay && (
            <>
              <br />
              お電話：
              <a href={`tel:${tel}`} className="inline-flex min-h-11 items-center font-bold text-navy-700 underline underline-offset-4">
                {telDisplay}
              </a>
            </>
          )}
        </p>
        <p className="mt-1">
          <button type="button" onClick={() => setStatus("idle")} className="min-h-11 text-[15px] font-bold text-navy-700 underline underline-offset-4">
            入力内容に戻る
          </button>
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
        <Field label="電話番号" hint="メールアドレスか電話番号の、どちらかをご記入ください。">
          <input type="tel" name="tel" autoComplete="tel" inputMode="tel" value={values.tel} onChange={onChange("tel")} className={inputCls} />
        </Field>
        <Field label="メールアドレス">
          <input type="email" name="email" autoComplete="email" inputMode="email" value={values.email} onChange={onChange("email")} className={inputCls} />
        </Field>
        <Field label="ご住所のエリア">
          <select name="area" value={values.area} onChange={onChange("area")} className={inputCls}>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="ご相談の種類">
        <select name="topic" value={values.topic} onChange={onChange("topic")} className={inputCls}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="ご相談内容" required hint="「補助金の対象になるか知りたい」「見積もりがほしい」など、ひとことでも構いません。">
        <textarea name="message" rows={5} value={values.message} onChange={onChange("message")} required className={`${inputCls} h-auto py-3`} />
      </Field>

      <details className="group rounded-md border border-line bg-paper-2">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
          <span className="flex-1 text-[15px] leading-[1.5] font-bold text-navy-900">
            分かる範囲で教えてください
            <span className="block text-[13px] font-normal text-ink-2">任意です。書かなくても送れます</span>
          </span>
          <svg className="h-4 w-4 shrink-0 text-navy-900 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m3.5 6 4.5 4.5L12.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="grid gap-5 border-t border-line bg-white px-4 py-5 sm:grid-cols-2">
          <Field label="町名">
            <input type="text" name="town" autoComplete="address-level3" placeholder="例：亀有" value={values.town} onChange={onChange("town")} className={inputCls} />
          </Field>
          <Field label="月の電気代">
            <select name="bill" value={values.bill} onChange={onChange("bill")} className={inputCls}>
              <option value="">選択しない</option>
              {BILLS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="太陽光発電は、いま付いていますか">
            <select name="hasSolar" value={values.hasSolar} onChange={onChange("hasSolar")} className={inputCls}>
              <option value="">選択しない</option>
              {HAS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="蓄電池は、いま付いていますか">
            <select name="hasBattery" value={values.hasBattery} onChange={onChange("hasBattery")} className={inputCls}>
              <option value="">選択しない</option>
              {HAS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </details>

      {/* スパム対策のハニーポット（人は入力しない） */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onChange("website")} />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-l-4 border-orange-200 border-l-orange-500 bg-orange-50 px-4 py-2.5 text-[15px] font-bold text-accent-text">
          {error}
        </p>
      )}

      <p className="text-[14px] leading-[1.8] text-ink-2">
        ご入力いただいた情報は、お問い合わせへの回答のためにのみ使用します。詳しくは
        <Link href="/privacy" className="mx-1 inline-block py-1 font-bold text-navy-700 underline underline-offset-4">
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-md bg-orange-500 px-10 font-heading text-[17px] font-bold text-navy-950 transition-colors duration-200 hover:bg-orange-400 disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "送信中…" : "この内容で送信する"}
      </button>
    </form>
  );
}

const inputCls = "h-12 w-full rounded-md border border-line-2 bg-white px-3 text-[16px] text-ink focus:border-navy-900";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-[15px] font-bold text-navy-900">
        {label}
        {required && <span className="rounded-sm bg-navy-900 px-1.5 py-[1px] text-[11px] font-bold text-white">必須</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[13px] leading-[1.6] text-ink-2">{hint}</span>}
    </label>
  );
}
