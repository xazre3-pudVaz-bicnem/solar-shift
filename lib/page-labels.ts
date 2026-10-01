import { headerNav, footerNav, legalNav } from "./nav";

/**
 * パス → 表示名。リンクのアンカーテキストに URL をそのまま出さないための対応表。
 * ナビゲーション定義（lib/nav.ts）を正本にして作るので、ページを足したら nav に書けばここにも反映される。
 * チャットの「関連ページ」・ブログの「このテーマの基本ページ」・カテゴリページが共有する。
 */
const labels = new Map<string, string>([
  ["/", "ホーム"],
  ["/contact", "お問い合わせ・無料相談"],
  ["/simulation", "補助金シミュレーター"],
  ["/subsidy", "補助金の総合ページ"],
  ["/products", "取扱商品"],
]);

for (const group of [...footerNav, ...headerNav]) {
  for (const link of group.links) {
    if (!labels.has(link.href)) labels.set(link.href, link.label);
  }
}
for (const link of legalNav) {
  if (!labels.has(link.href)) labels.set(link.href, link.label);
}

/** 表示名が登録されていないパスは undefined（呼び出し側でリンクを出さない判断ができるように） */
export function findPageLabel(href: string): string | undefined {
  return labels.get(href);
}

export function pageLabel(href: string): string {
  return labels.get(href) ?? href;
}

/** 表示名つきで案内できるページの一覧（チャットのリンク許可リストに使う） */
export function labelledPages(): { href: string; label: string }[] {
  return [...labels.entries()].map(([href, label]) => ({ href, label }));
}
