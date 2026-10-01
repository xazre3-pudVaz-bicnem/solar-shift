import { formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

/**
 * 情報の基準日・最終更新日・監修表記。
 * 補助金ページでは verifiedAt（一次情報の確認日）を必ず渡す。
 */
export function LastUpdated({
  updatedAt,
  verifiedAt,
  publishedAt,
  showSupervisor = true,
  className = "",
}: {
  updatedAt: string;
  verifiedAt?: string;
  publishedAt?: string;
  showSupervisor?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-3 ${className}`}>
      {publishedAt && (
        <span>
          公開日：<time dateTime={publishedAt}>{formatDateJa(publishedAt)}</time>
        </span>
      )}
      <span>
        最終更新日：<time dateTime={updatedAt}>{formatDateJa(updatedAt)}</time>
      </span>
      {verifiedAt && (
        <span>
          公式情報の確認日：<time dateTime={verifiedAt}>{formatDateJa(verifiedAt)}</time>
        </span>
      )}
      {showSupervisor && <span>監修・運営：{siteConfig.editorial.supervisor}</span>}
    </div>
  );
}
