import Link from "next/link";

/**
 * 一覧のページ送り。1ページ目は basePath、2ページ目以降は `${basePath}/page/${n}`。
 * 記事が1ページに収まる間は何も出さない。
 */
export function Pagination({ basePath, current, total, className = "" }: { basePath: string; current: number; total: number; className?: string }) {
  if (total <= 1) return null;
  const href = (n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  // 現在の前後2ページと、最初・最後を出す
  const pages: (number | "gap")[] = [];
  for (let n = 1; n <= total; n += 1) {
    if (n === 1 || n === total || Math.abs(n - current) <= 2) pages.push(n);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }

  const pill = "flex h-11 min-w-11 items-center justify-center rounded-full px-3 font-en text-[15px] font-bold";
  return (
    <nav aria-label="ページ送り" className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {current > 1 ? (
        <Link href={href(current - 1)} rel="prev" className={`${pill} border-2 border-navy-900 bg-white font-heading text-[14px] text-navy-900 hover:bg-paper-2`}>
          ← 前へ
        </Link>
      ) : (
        <span className={`${pill} border border-line bg-white font-heading text-[14px] text-ink-3`} aria-hidden="true">
          ← 前へ
        </span>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {pages.map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className="px-1 text-ink-3" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              {p === current ? (
                <span aria-current="page" className={`${pill} bg-navy-900 text-white`}>
                  <span className="sr-only">現在のページ：</span>
                  {p}
                </span>
              ) : (
                <Link href={href(p)} aria-label={`${p}ページ目`} className={`${pill} border border-line-2 bg-white text-navy-900 hover:border-orange-400 hover:bg-paper-2`}>
                  {p}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>
      {current < total ? (
        <Link href={href(current + 1)} rel="next" className={`${pill} border-2 border-navy-900 bg-white font-heading text-[14px] text-navy-900 hover:bg-paper-2`}>
          次へ →
        </Link>
      ) : (
        <span className={`${pill} border border-line bg-white font-heading text-[14px] text-ink-3`} aria-hidden="true">
          次へ →
        </span>
      )}
    </nav>
  );
}
