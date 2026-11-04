import type { ChangeLogEntry } from "@/data/subsidies/changelog";
import { formatDateJa } from "@/lib/seo";

const KIND_STYLE: Record<ChangeLogEntry["kind"], string> = {
  制度の変更: "bg-orange-500 text-navy-900",
  掲載の更新: "bg-green-600 text-white",
  公式情報の再確認: "bg-navy-900 text-white",
};

/**
 * 補助金の更新履歴（data/subsidies/changelog.ts）。制度の動きと、このサイトで確かめた・直した日を、新しい順に並べる。
 * 「最終更新日」だけでは分からない、何がいつ変わったか・いつ確かめたかを、その場で見られるようにする。
 */
export function ChangeLog({ entries, id = "changelog", className = "" }: { entries: ChangeLogEntry[]; id?: string; className?: string }) {
  if (entries.length === 0) return null;
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`scroll-mt-24 rounded-3xl border-2 border-line bg-white p-5 shadow-card sm:p-7 ${className}`}>
      <h2 id={`${id}-h`} className="text-[20px] leading-[1.45] font-black text-navy-900 sm:text-[22px]">
        更新履歴（制度の動きと、このサイトでの確認）
      </h2>
      <p className="mt-2 text-[14px] leading-[1.8] text-ink-2">公式に発表された制度の変更と、このサイトが公式ページを確かめた日・内容を直した日です。</p>
      <ol className="mt-4 divide-y divide-line">
        {entries.map((e) => (
          <li key={`${e.date}-${e.kind}-${e.text.slice(0, 16)}`} className="grid gap-1.5 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
            <p className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-start sm:gap-1.5">
              <time dateTime={e.date} className="font-en text-[14px] font-bold text-navy-900 tabular-nums">
                {formatDateJa(e.date)}
              </time>
              <span className={`rounded-full px-2.5 py-[2px] text-[12px] font-bold ${KIND_STYLE[e.kind]}`}>{e.kind}</span>
            </p>
            <p className="text-[14px] leading-[1.8] text-ink">
              {e.text}
              {e.source && (
                <>
                  {" "}
                  <a href={e.source.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
                    出典：{e.source.name}
                  </a>
                </>
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
