import { formatDateJa } from "@/lib/seo";
import type { SourceItem } from "./SourceList";

/**
 * 数字のすぐ近くに置く、出典への短いリンク。
 * ページ末尾の「参考資料・一次情報」とは別に、金額や単価を、その場で公式の資料と照らせるようにする。
 * 同じ URL はまとめる。
 */
export function SourceNote({ sources, className = "" }: { sources: SourceItem[]; className?: string }) {
  const seen = new Set<string>();
  const items = sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
  if (items.length === 0) return null;
  return (
    <p className={`text-[12px] leading-[1.9] text-ink-3 ${className}`}>
      出典：
      {items.map((s, i) => (
        <span key={s.url}>
          {i > 0 && "／"}
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
            {s.name}
          </a>
          {s.verifiedAt && `（${formatDateJa(s.verifiedAt)} 確認）`}
        </span>
      ))}
    </p>
  );
}
