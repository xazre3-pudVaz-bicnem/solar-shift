/**
 * ページ内の目次。長いページ（サービス・補助金・ガイド・記事）の冒頭に置く。
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
    <nav aria-label="目次" className={`border border-line bg-paper-2 px-5 py-4 sm:px-7 sm:py-5 ${className}`}>
      <p className="font-heading text-[14px] font-bold tracking-[0.1em] text-navy-900">{title}</p>
      <ol className="mt-1 grid gap-x-10 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={it.id} className="border-b border-line last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
            <a href={`#${it.id}`} className="flex min-h-11 items-center gap-3 py-1.5 text-[15px] leading-[1.5] font-bold text-navy-900 hover:text-accent-text">
              <span className="w-6 shrink-0 font-en text-[13px] text-accent-text" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
