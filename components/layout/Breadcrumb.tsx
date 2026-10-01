import Link from "next/link";
import type { Crumb } from "@/lib/schema";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

/** 視覚的なパンくず＋BreadcrumbList 構造化データ。crumbs は「ホーム」から始める。 */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <nav aria-label="パンくずリスト" className="overflow-x-auto">
        <ol className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-ink-3">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg className="h-3 w-3 shrink-0 text-line-2" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="m4.5 2.5 3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                )}
                {last ? (
                  <span aria-current="page" className="text-ink-2">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-navy-900">
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
