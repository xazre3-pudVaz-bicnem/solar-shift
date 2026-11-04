import type { MetadataRoute } from "next";
import { SITE_URL, IS_PUBLIC } from "@/lib/seo";
import { getAllPosts, getPostsByCategory, categoriesWithPosts, isCategoryIndexable, latestUpdate } from "@/lib/blog";
import { publishedProducts } from "@/data/products";
import { publishedWorks } from "@/data/works";
import { areasWithPage } from "@/data/areas";
import { getWardProgram } from "@/data/ward-programs";
import { guides } from "@/data/guides";
import { siteConfig } from "@/lib/site";
import { STATIC_ROUTES, EXTRA_UPDATED_AT, routeUpdatedAt, wardPageUpdatedAt } from "@/lib/routes";
import { HELD_BACK } from "@/lib/indexing";

/**
 * sitemap.xml。検索結果に出すページだけを載せる。
 * - 施工事例・お客様の声・おすすめ商品など、中身が無く noindex にしているページは載せない（lib/indexing.ts）
 * - 記事が少なく noindex にしているブログのカテゴリは載せない
 * - 一覧の2ページ目以降は載せない（記事そのものが載っている）
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!IS_PUBLIC || !SITE_URL) return [];
  const base = SITE_URL;
  // lastmod は「内容を直した日」だけで決める。公式情報を確かめた日（siteConfig.subsidyInfoDate・各制度の lastVerified）は使わない
  // （確かめただけでは内容は変わらない。偽の更新の合図を Google に送らない）
  const infoDate = new Date(siteConfig.contentUpdatedAt);
  const posts = getAllPosts();
  const latestPost = latestUpdate(posts);
  const latestGuide = guides.reduce<string>((max, g) => (g.updatedAt > max ? g.updatedAt : max), siteConfig.contentUpdatedAt);

  const hidden = HELD_BACK;

  // 固定ページ：そのページの内容を最後に直した日（lib/routes.ts の updatedAt）。
  // 一覧のページ（/blog・/guide）と TOP は、載っている記事・ガイドの更新日も見る。ビルドした日は使わない
  const later = (a: Date, b: Date) => (a > b ? a : b);
  const lastModifiedFor = (path: string): Date => {
    const own = new Date(routeUpdatedAt(path));
    if (path === "/blog" && latestPost) return later(own, new Date(latestPost));
    if (path === "/guide") return later(own, new Date(latestGuide));
    if (path === "/" && latestPost) return later(own, new Date(latestPost));
    return own;
  };

  const statics: MetadataRoute.Sitemap = STATIC_ROUTES.filter((r) => !hidden.has(r.path)).map((r) => ({
    url: `${base}${r.path === "/" ? "" : r.path}`,
    lastModified: lastModifiedFor(r.path),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${base}${g.path}`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 周辺の区のページは、制度の内容かページを直した日を lastmod にする（公式ページを確かめただけでは進めない）
  const areaPages: MetadataRoute.Sitemap = areasWithPage.map((a) => {
    const ward = getWardProgram(a.slug);
    return {
      url: `${base}/area/${a.slug}`,
      lastModified: ward ? new Date(wardPageUpdatedAt(a.slug, ward.updatedAt)) : later(infoDate, new Date(EXTRA_UPDATED_AT[`/area/${a.slug}`] ?? siteConfig.contentUpdatedAt)),
      changeFrequency: "monthly",
      priority: a.status === "primary" ? 0.9 : 0.7,
    };
  });

  const productPages: MetadataRoute.Sitemap = publishedProducts.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const workPages: MetadataRoute.Sitemap = publishedWorks.map((w) => ({
    url: `${base}/works/${w.slug}`,
    lastModified: new Date(w.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = categoriesWithPosts()
    .filter((c) => isCategoryIndexable(c.slug))
    .map((c) => ({
      url: `${base}/blog/category/${c.slug}`,
      lastModified: new Date(latestUpdate(getPostsByCategory(c.slug)) ?? siteConfig.contentUpdatedAt),
      changeFrequency: "weekly",
      priority: 0.4,
    }));

  return [...statics, ...guidePages, ...areaPages, ...productPages, ...workPages, ...postPages, ...categoryPages];
}
