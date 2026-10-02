import Link from "next/link";
import type { FaqItem } from "@/data/faq";
import { faqSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { reveal } from "@/lib/reveal";

type Item = Pick<FaqItem, "q" | "a"> & { id?: string; link?: FaqItem["link"] };

/**
 * FAQ の表示。罫線で区切った一覧（カードを積み重ねない）。details/summary で JS なしに開閉。
 * 質問の行は高さ 52px 以上（スマホで押しやすい大きさ）。
 * withSchema=true のとき、表示している項目と同じ内容で FAQPage 構造化データを出す。
 * 1ページに FAQPage は1つまで。
 */
export function FaqSection({
  items,
  withSchema = false,
  headingLevel = "h3",
  className = "",
  moreLink = true,
}: {
  items: Item[];
  withSchema?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
  /** 最後に「よくある質問」一覧へのリンクを出す */
  moreLink?: boolean;
}) {
  if (items.length === 0) return null;
  const H = headingLevel;
  return (
    <div className={className}>
      <div className="border-t border-line-2">
        {items.map((f, i) => (
          <details key={f.id ?? i} className="group border-b border-line-2" {...(i === 0 ? { open: true } : {})} {...reveal(Math.min(i, 5) * 40)}>
            <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-start gap-3 py-3.5 sm:gap-4 [&::-webkit-details-marker]:hidden">
              <span className="w-6 shrink-0 font-en text-[19px] leading-[1.6] font-extrabold text-orange-600" aria-hidden="true">
                Q
              </span>
              <H className="flex-1 text-base leading-[1.75] font-bold text-navy-900 sm:text-[17px]">{f.q}</H>
              <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center text-navy-900 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <div className="flex gap-3 pb-5 sm:gap-4">
              <span className="w-6 shrink-0 font-en text-[19px] leading-[1.6] font-extrabold text-navy-700" aria-hidden="true">
                A
              </span>
              <div className="flex-1 text-base leading-[1.9] text-ink">
                <p>{f.a}</p>
                {f.link && (
                  <p className="mt-2">
                    <Link href={f.link.href} className="inline-flex min-h-11 items-center text-[15px] font-bold text-navy-700 underline underline-offset-4 hover:text-accent-text">
                      {f.link.label} →
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
      {moreLink && (
        <p className="pt-3 text-right" {...reveal(Math.min(items.length, 5) * 40)}>
          <Link href="/faq" className="inline-flex min-h-11 items-center text-[15px] font-bold text-navy-700 underline underline-offset-4 hover:text-accent-text">
            ほかの質問も見る（よくある質問） →
          </Link>
        </p>
      )}
      {withSchema && <JsonLd data={graph(faqSchema(items.map((f) => ({ q: f.q, a: f.a }))))} />}
    </div>
  );
}
