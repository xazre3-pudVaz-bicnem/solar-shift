/**
 * ページ内の目次。長いページ（サービス・補助金・ガイド・記事）の冒頭に置く。
 * 見た目は、オレンジの点線で囲んだ白い角丸の枠。
 * 行の高さは 44px 以上（スマホで押しやすい大きさ）。
 * 行き先の区画が描画を後回しにしていても正しい位置に着くよう、移動の前処理は
 * components/layout/RevealObserver.tsx がページ内リンク全般に対して行っている。
 */
export interface TocItem {
  id: string;
  label: string;
}

export function Toc({ items, title = "このページの内容", className = "" }: { items: TocItem[]; title?: string; className?: string }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="目次" className={`rounded-3xl border-2 border-dashed border-orange-200 bg-white px-5 py-5 sm:px-7 ${className}`}>
      <p className="flex items-center gap-2 font-heading text-[15px] font-black text-navy-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-navy-900">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 4h10M3 8h10M3 12h6" />
          </svg>
        </span>
        {title}
      </p>
      <ol className="mt-2 grid gap-x-10 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={it.id} className="border-b border-dashed border-line last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
            <a href={`#${it.id}`} className="group flex min-h-11 items-center gap-3 py-1.5 text-[15px] leading-[1.5] font-bold text-navy-900 hover:text-accent-text">
              <span className="w-6 shrink-0 font-en text-[13px] text-accent-text" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="underline decoration-line-2 underline-offset-4 group-hover:decoration-orange-400">{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
