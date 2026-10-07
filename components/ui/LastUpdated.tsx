import { formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

/**
 * 最終更新日・公開日・一次情報の確認日・編集と運営の表記。
 * 補助金ページでは verifiedAt（一次情報の確認日）を必ず渡す。
 * 「監修」とは書かない（資格のある第三者が監修しているわけではないため）。
 */
export function LastUpdated({
  updatedAt,
  verifiedAt,
  publishedAt,
  showPublished = false,
  showSupervisor = true,
  className = "",
}: {
  updatedAt: string;
  verifiedAt?: string;
  publishedAt?: string;
  /** 公開日が更新日と同じでも、公開日を出す（金額を扱うページとガイド） */
  showPublished?: boolean;
  showSupervisor?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1 text-[13px] leading-[1.7] text-ink-2 ${className}`}>
      <span>
        最終更新日：<time dateTime={updatedAt}>{formatDateJa(updatedAt)}</time>
      </span>
      {publishedAt && (showPublished || publishedAt !== updatedAt) && (
        <span>
          公開日：<time dateTime={publishedAt}>{formatDateJa(publishedAt)}</time>
        </span>
      )}
      {verifiedAt && (
        <span>
          公式情報の確認日：<time dateTime={verifiedAt}>{formatDateJa(verifiedAt)}</time>
        </span>
      )}
      {showSupervisor && <span>編集・運営：{siteConfig.editorial.supervisor}</span>}
    </div>
  );
}
