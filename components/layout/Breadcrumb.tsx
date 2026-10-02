import Link from "next/link";
import type { Crumb } from "@/lib/schema";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * 視覚的なパンくず＋BreadcrumbList 構造化データ。crumbs は「ホーム」から始める。
 * リンクの行の高さは 44px（スマホで押しやすい大きさ）。現在のページ名は、長いときに末尾を省略する。
 */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <nav aria-label="パンくずリスト" className="overflow-hidden">
        <ol className="flex min-w-0 items-center gap-1.5 text-[13px] whitespace-nowrap text-ink-2">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.href} className={`flex min-h-11 items-center gap-1.5 ${last ? "min-w-0 flex-1" : "shrink-0"}`}>
                {i > 0 && (
                  <svg className="h-3 w-3 shrink-0 text-line-2" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="m4.5 2.5 3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                )}
                {last ? (
                  <span aria-current="page" className="block min-w-0 truncate text-ink-2">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="inline-flex min-h-11 min-w-11 items-center px-1 underline-offset-4 hover:text-navy-900 hover:underline">
                    {c.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={graph(breadcrumbSchema(crumbs))} />
    </>
  );
}
