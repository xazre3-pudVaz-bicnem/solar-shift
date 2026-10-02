import type { ReactNode } from "react";

/**
 * 確認用のチェックリスト。
 * チェックボックスはブラウザ標準のもの（JavaScript なしで動く・サーバーコンポーネントのまま使える）。
 * チェックの状態は保存しない（ページを離れると消える）。印刷して使うことも想定している。
 * 行全体が label なので、どこを押してもチェックできる（行の高さは 44px 以上）。
 */
export interface ChecklistItem {
  title: ReactNode;
  body?: ReactNode;
}

export function Checklist({
  items,
  name,
  numbered = false,
  className = "",
}: {
  items: ChecklistItem[];
  /** チェックボックスの name の接頭辞（ページ内で重ならないもの） */
  name: string;
  /** 項目の先頭に番号を出す（公式資料の番号と対応させたいとき） */
  numbered?: boolean;
  className?: string;
}) {
  return (
    <ul className={`divide-y divide-line ${className}`}>
      {items.map((it, i) => (
        <li key={i}>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 px-4 py-3 has-[:checked]:bg-paper-2 sm:px-5">
            <input type="checkbox" name={`${name}-${i + 1}`} className="mt-0.5 h-6 w-6 shrink-0 accent-navy-900" />
            <span className="min-w-0 flex-1">
              <span className="block text-base leading-[1.7] font-bold text-navy-900">
                {numbered && (
                  <span className="mr-2 font-en text-[14px] text-accent-text" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                {it.title}
              </span>
              {it.body && <span className="mt-0.5 block text-base leading-[1.8] font-normal text-ink-2">{it.body}</span>}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
