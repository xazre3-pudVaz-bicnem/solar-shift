import { STATIC_ROUTES } from "@/lib/routes";
import { guides } from "@/data/guides";
import { areasWithPage } from "@/data/areas";
import { publishedProducts } from "@/data/products";
import { publishedWorks } from "@/data/works";
import { getAllPosts, categoriesWithPosts } from "@/lib/blog";

/**
 * SNS 共有用の画像（/og/…）を作るページの一覧。サーバー専用（ブログ記事を fs で読む）。
 * ここに無いパスの画像は作られないので、buildMetadata に渡す path は必ずここに含まれるようにする
 * （一覧の2ページ目以降は buildMetadata の ogFrom で1ページ目の画像を使う）。
 */
export interface OgPage {
  path: string;
  /** 「｜」より後ろは副題として小さく出す */
  title: string;
  /** 左上のラベル */
  eyebrow: string;
}

function eyebrowFor(path: string): string {
  if (path === "/") return "東京都葛飾区";
  if (path.startsWith("/subsidy") || path === "/simulation") return "補助金";
  if (["/solar", "/battery", "/solar-battery", "/v2h", "/hems"].includes(path)) return "サービス";
  if (path.startsWith("/products")) return "取扱メーカーと選び方";
  if (path.startsWith("/guide")) return "導入ガイド";
  if (path.startsWith("/blog")) return "ブログ";
  if (path.startsWith("/area")) return "対応エリア";
  return "葛飾区の太陽光発電・蓄電池";
}

export function ogPages(): OgPage[] {
  const pages: OgPage[] = STATIC_ROUTES.map((r) => ({ path: r.path, title: r.ogTitle, eyebrow: eyebrowFor(r.path) }));
  for (const g of guides) pages.push({ path: g.path, title: g.title, eyebrow: "導入ガイド" });
  for (const a of areasWithPage) pages.push({ path: `/area/${a.slug}`, title: `${a.name}の太陽光・蓄電池業者｜対応エリアと相談の進め方`, eyebrow: "対応エリア" });
  for (const c of categoriesWithPosts()) pages.push({ path: `/blog/category/${c.slug}`, title: `${c.name}の記事一覧`, eyebrow: "ブログ" });
  for (const p of getAllPosts()) pages.push({ path: `/blog/${p.slug}`, title: p.title, eyebrow: p.categoryName });
  for (const p of publishedProducts) pages.push({ path: `/products/${p.slug}`, title: `${p.manufacturer} ${p.name}`, eyebrow: "取扱商品" });
  for (const w of publishedWorks) pages.push({ path: `/works/${w.slug}`, title: w.title, eyebrow: "施工事例" });
  return pages;
}

export function findOgPage(path: string): OgPage | undefined {
  return ogPages().find((p) => p.path === path);
}
