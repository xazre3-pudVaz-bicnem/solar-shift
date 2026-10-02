import { publishedWorks } from "../data/works";
import { publishedVoices } from "../data/voices";
import { recommendedProducts } from "../data/products";

/**
 * 「中身がまだ無いので、検索結果にも案内にも出さない」固定ページの一覧。
 * データ（施工事例・お客様の声・おすすめ商品）が登録されると、自動で外れる。
 *
 * ここに入っているページは、次の4か所で同じ扱いになる。
 *   - そのページの robots … noindex（リンクはたどらせる）
 *   - sitemap.xml         … 載せない（app/sitemap.ts）
 *   - ヘッダー・フッター・HTML サイトマップ・チャットの案内 … リンクを出さない（lib/nav.ts）
 *   - lib/seo-map.ts の index: false と一致していること（scripts/seo-check.ts が検査）
 *
 * ページ自体は残す（URL を変えずに、中身が揃ったらそのまま公開できる）。
 * クライアント側（ヘッダー）からも読むので、fs などサーバー専用のものは import しない。
 */
export const HELD_BACK: ReadonlySet<string> = new Set<string>([
  ...(publishedWorks.length === 0 ? ["/works"] : []),
  ...(publishedVoices.length === 0 ? ["/voice"] : []),
  ...(recommendedProducts("solar").length === 0 ? ["/recommend/solar"] : []),
  ...(recommendedProducts("battery").length === 0 ? ["/recommend/battery"] : []),
]);

export function isHeldBack(path: string): boolean {
  return HELD_BACK.has(path);
}
