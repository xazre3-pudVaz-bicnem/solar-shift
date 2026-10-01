import type { MetadataRoute } from "next";
import { SITE_URL, IS_PUBLIC } from "@/lib/seo";
import { getAllPosts, categoriesWithPosts } from "@/lib/blog";
import { publishedProducts } from "@/data/products";
import { publishedWorks } from "@/data/works";
import { areasWithPage } from "@/data/areas";
import { guides } from "@/data/guides";
import { siteConfig } from "@/lib/site";
import { STATIC_ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!IS_PUBLIC || !SITE_URL) return [];
  const base = SITE_URL;
  const infoDate = new Date(siteConfig.subsidyInfoDate);

  // 施工事例・お客様の声が0件の間は noindex にしているため sitemap からも外す
  const hidden = new Set<string>([...(publishedWorks.length === 0 ? ["/works"] : []), "/voice"]);

  const statics: MetadataRoute.Sitemap = STATIC_ROUTES.filter((r) => !hidden.has(r.path)).map((r) => ({
    url: `${base}${r.path}`,
    lastModified: infoDate,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${base}${g.path}`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const areaPages: MetadataRoute.Sitemap = areasWithPage.map((a) => ({
    url: `${base}/area/${a.slug}`,
    lastModified: infoDate,
    changeFrequency: "monthly",
    priority: a.status === "primary" ? 0.9 : 0.6,
  }));

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

  const posts = getAllPosts();
  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = categoriesWithPosts().map((c) => ({
    url: `${base}/blog/category/${c.slug}`,
    lastModified: infoDate,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...statics, ...guidePages, ...areaPages, ...productPages, ...workPages, ...postPages, ...categoryPages];
}
