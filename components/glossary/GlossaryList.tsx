"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * 用語集の一覧（client）。上の入力欄で、ことばを絞り込める。
 * 初めの表示（サーバーで作る HTML）には、すべての用語が入っている。絞り込みは、表示を隠すだけ。
 */
export interface GlossaryItem {
  id: string;
  term: string;
  reading: string;
  definition: string;
  link?: { href: string; label: string };
  source?: { name: string; url: string };
}

export interface GlossaryGroupView {
  key: string;
  label: string;
  icon: { src: string; width: number; height: number };
  terms: GlossaryItem[];
}

/** カタカナをひらがなにそろえ、大文字・小文字と空白の違いを無くす */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s　・]/g, "");
}

export function GlossaryList({ groups }: { groups: GlossaryGroupView[] }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const q = normalize(query);
  const filtered = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        terms: q ? g.terms.filter((t) => normalize(`${t.term}${t.reading}${t.definition}`).includes(q)) : g.terms,
      })),
    [groups, q],
  );
  const count = filtered.reduce((n, g) => n + g.terms.length, 0);

  return (
    <div>
      <div className="rounded-3xl bg-cream px-4 py-5 sm:px-6">
        <label htmlFor={inputId} className="block text-[15px] font-bold text-navy-900">
          ことばを探す
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例：事前協議、FIT、パワコン"
            className="h-12 w-full min-w-0 rounded-full border-2 border-line-2 bg-white px-5 text-[16px] text-navy-900 placeholder:text-ink-3 focus:border-orange-500 focus:outline-none"
          />
          <p className="shrink-0 text-[14px] font-bold text-ink-2" aria-live="polite">
            <span className="font-en text-[20px] font-extrabold text-navy-900">{count}</span> 語
          </p>
        </div>
      </div>

      {count === 0 && (
        <p className="mt-8 rounded-2xl border-2 border-dashed border-[#e2d9c8] px-4 py-6 text-center text-base text-ink-2">
          「{query}」に合うことばは、見つかりませんでした。別の言い方でお試しください。
        </p>
      )}

      <div className="mt-10 space-y-14">
        {filtered.map((g, gi) =>
          g.terms.length === 0 ? null : (
            <section key={g.key} id={g.key} aria-labelledby={`${g.key}-h`} className={`scroll-mt-24 ${gi > 0 ? "cv-block cv-tall" : ""}`}>
              <h2 id={`${g.key}-h`} className="flex items-center gap-3 text-[22px] leading-[1.35] font-black text-navy-900 sm:text-[26px]">
                <Image src={g.icon.src} alt="" width={g.icon.width} height={g.icon.height} sizes="56px" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
                {g.label}
              </h2>
              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                {g.terms.map((t) => (
                  <div key={t.id} id={t.id} className="scroll-mt-24 rounded-2xl border border-line border-l-[6px] border-l-orange-400 bg-white px-4 py-4 shadow-card target:ring-4 target:ring-orange-200 sm:px-5">
                    <dt>
                      <span className="block text-[18px] leading-[1.45] font-black text-navy-900">{t.term}</span>
                      <span className="block text-[12px] text-ink-2">{t.reading}</span>
                    </dt>
                    <dd className="mt-2 text-base leading-[1.85] text-ink">
                      {t.definition}
                      {(t.link || t.source) && (
                        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                          {t.link && (
                            <Link href={t.link.href} className="inline-flex min-h-11 items-center text-[14px] font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                              {t.link.label} →
                            </Link>
                          )}
                          {t.source && (
                            <a href={t.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[12px] text-ink-2 underline underline-offset-4 hover:text-accent-text">
                              出典：{t.source.name}
                            </a>
                          )}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
