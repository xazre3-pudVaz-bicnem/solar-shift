import Link from "next/link";
import type { FaqItem } from "@/data/faq";
import { faqSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

type Item = Pick<FaqItem, "q" | "a"> & { id?: string; link?: FaqItem["link"] };

/**
 * FAQ の表示。details/summary で JS なしに開閉できる。
 * withSchema=true のとき、表示している項目と同じ内容で FAQPage 構造化データを出す。
 * 1ページに FAQPage は1つまで（複数のセクションに分けるときは withSchema を1つだけにする）。
 */
export function FaqSection({
  items,
  withSchema = false,
  headingLevel = "h3",
  className = "",
}: {
  items: Item[];
  withSchema?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  if (items.length === 0) return null;
  const H = headingLevel;
  return (
    <div className={`divide-y divide-line border-y border-line ${className}`}>
      {items.map((f, i) => (
        <details key={f.id ?? i} className="group" {...(i === 0 ? { open: true } : {})}>
          <summary className="flex cursor-pointer list-none items-start gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <span className="mt-[2px] shrink-0 font-en text-[15px] font-extrabold text-orange-500">Q</span>
            <H className="flex-1 text-[15px] leading-[1.7] font-bold text-navy-900 sm:text-base">{f.q}</H>
            <span className="mt-1 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </summary>
          <div className="flex gap-4 pb-6">
            <span className="mt-[2px] shrink-0 font-en text-[15px] font-extrabold text-navy-600">A</span>
            <div className="flex-1 text-[15px] leading-[1.9] text-ink">
              <p>{f.a}</p>
              {f.link && (
                <p className="mt-3">
                  <Link href={f.link.href} className="text-[14px] font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                    {f.link.label}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </details>
      ))}
      {withSchema && <JsonLd data={graph(faqSchema(items.map((f) => ({ q: f.q, a: f.a }))))} />}
    </div>
  );
}
