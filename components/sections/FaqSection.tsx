import Link from "next/link";
import { faqs, type FaqItem } from "@/data/faq";
import { faqSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { reveal } from "@/lib/reveal";

/** /faq でマークアップしている、共通の質問 */
const SHARED_QUESTIONS = new Set(faqs.map((f) => f.q));

type Item = Pick<FaqItem, "q" | "a"> & { id?: string; link?: FaqItem["link"] };

/**
 * FAQ の表示。白い角丸カードに Q（オレンジ丸）／A（緑丸）。details/summary で JS なしに開閉。
 * withSchema=true のとき、表示している項目と同じ内容で FAQPage 構造化データを出す。
 * 1ページに FAQPage は1つまで。
 *
 * 共通の質問（data/faq.ts にあるもの）は、/faq だけでマークアップする。
 * 同じ質問と回答を複数のページでマークアップしない、という検索エンジンの指針に合わせるため。
 * ここでは、そのページにしか無い質問だけを構造化データに出す（表示はすべて出す）。
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
  const schemaItems = withSchema ? items.filter((f) => !SHARED_QUESTIONS.has(f.q)) : [];
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((f, i) => (
        <details key={f.id ?? i} className="group rounded-2xl border border-line bg-white shadow-card open:border-orange-200" {...(i === 0 ? { open: true } : {})} {...reveal(Math.min(i, 5) * 50)}>
          <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 font-en text-[15px] font-extrabold text-navy-900">Q</span>
            <H className="flex-1 pt-1 text-[15px] leading-[1.7] font-bold text-navy-900 sm:text-base">{f.q}</H>
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-navy-900 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </summary>
          <div className="flex gap-3 px-4 pb-5 sm:gap-4 sm:px-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 font-en text-[15px] font-extrabold text-white">A</span>
            <div className="flex-1 pt-1 text-base leading-[1.9] text-ink">
              <p>{f.a}</p>
              {f.link && (
                <p className="mt-1">
                  <Link href={f.link.href} className="inline-flex min-h-11 items-center text-[15px] font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                    {f.link.label} →
                  </Link>
                </p>
              )}
            </div>
          </div>
        </details>
      ))}
      {moreLink && (
        <p className="pt-1 text-right" {...reveal(Math.min(items.length, 5) * 50)}>
          <Link href="/faq" className="inline-flex min-h-11 items-center text-[15px] font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
            ほかの質問も見る（よくある質問） →
          </Link>
        </p>
      )}
      {schemaItems.length > 0 && <JsonLd data={graph(faqSchema(schemaItems.map((f) => ({ q: f.q, a: f.a }))))} />}
    </div>
  );
}
