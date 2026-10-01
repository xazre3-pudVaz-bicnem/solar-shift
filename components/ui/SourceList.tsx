export interface SourceItem {
  name: string;
  url: string;
  /** 確認日（YYYY-MM-DD） */
  verifiedAt?: string;
}

/** 一次情報・参考資料の一覧。重複URLはまとめる。 */
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
    <section aria-label={title} className={`border-t border-line pt-6 ${className}`}>
      <h2 className="text-[15px] font-bold text-navy-900">{title}</h2>
      <ol className="mt-3 space-y-2 text-[14px] leading-[1.7] text-ink-2">
        {items.map((s, i) => (
          <li key={s.url} className="flex gap-2">
            <span className="shrink-0 tabular-nums text-ink-3">{i + 1}.</span>
            <span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-600 underline decoration-1 underline-offset-[3px] hover:text-accent-text"
              >
                {s.name}
              </a>
              {s.verifiedAt && <span className="ml-2 text-[12px] text-ink-3">（{s.verifiedAt} 確認）</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
