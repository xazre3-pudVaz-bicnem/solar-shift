export interface SourceItem {
  name: string;
  url: string;
  /** 確認日（YYYY-MM-DD） */
  verifiedAt?: string;
}

/** 参考資料（一次情報）の一覧。重複URLはまとめる。上下の罫線で区切るだけの、静かな体裁。 */
export function SourceList({
  sources,
  title = "参考資料・一次情報",
  className = "",
}: {
  sources: SourceItem[];
  title?: string;
  className?: string;
}) {
  const seen = new Set<string>();
  const items = sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className={`border-y border-line py-5 ${className}`}>
      <h2 className="font-heading text-[16px] font-black text-navy-900">{title}</h2>
      {/* リンクは1行でも高さ 44px（スマホで押しやすい大きさ）になるよう、上下に余白を持たせる */}
      <ol className="mt-1 text-[14px] leading-[1.7] text-ink-2">
        {items.map((s, i) => (
          <li key={s.url} className="flex gap-2">
            <span className="shrink-0 pt-[11px] font-en font-bold tabular-nums text-accent-text">{i + 1}.</span>
            <span className="min-w-0">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="block py-[11px] text-navy-700 underline decoration-1 underline-offset-[3px] hover:text-accent-text">
                {s.name}
              </a>
              {s.verifiedAt && <span className="-mt-2 block pb-1 text-[12px] text-ink-3">（{s.verifiedAt} 確認）</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
