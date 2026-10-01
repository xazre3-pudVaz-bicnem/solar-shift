import { siteConfig, contactEmail } from "@/lib/site";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import { servedAreaNames } from "@/data/areas";

/**
 * JSON-LD 生成。ページ本文と一致する内容だけを出す。
 * - 口コミ・評価（Review / AggregateRating）は data/voices が空の間は一切出さない。
 * - 価格未確定の商品に Offer は付けない。
 * - 電話番号など siteConfig で空のものは出力しない。
 */

type JsonLd = Record<string, unknown>;

function compact<T extends JsonLd>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

export const ORG_ID = SITE_URL ? `${SITE_URL}/#organization` : "#organization";
export const WEBSITE_ID = SITE_URL ? `${SITE_URL}/#website` : "#website";
export const LOCALBUSINESS_ID = SITE_URL ? `${SITE_URL}/#localbusiness` : "#localbusiness";

export function organizationSchema(): JsonLd {
  return compact({
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.company.name,
    alternateName: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.png"),
    email: contactEmail(),
    founder: { "@type": "Person", name: siteConfig.company.representative },
    foundingDate: "2026-05-13",
    address: compact({
      "@type": "PostalAddress",
      postalCode: siteConfig.company.address.postalCode,
      addressRegion: siteConfig.company.address.prefecture,
      addressLocality: siteConfig.company.address.city,
      streetAddress: siteConfig.company.address.street,
      addressCountry: "JP",
    }),
    sameAs: [siteConfig.company.corporateUrl, siteConfig.social.instagram, siteConfig.social.x].filter(Boolean),
  });
}

export function localBusinessSchema(): JsonLd {
  return compact({
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": LOCALBUSINESS_ID,
    name: siteConfig.name,
    alternateName: siteConfig.nameJa,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    image: absoluteUrl("/logo.png"),
    logo: absoluteUrl("/logo.png"),
    email: contactEmail(),
    telephone: siteConfig.contact.tel || undefined,
    parentOrganization: { "@id": ORG_ID },
    address: compact({
      "@type": "PostalAddress",
      postalCode: siteConfig.company.address.postalCode,
      addressRegion: siteConfig.company.address.prefecture,
      addressLocality: siteConfig.company.address.city,
      streetAddress: siteConfig.company.address.street,
      addressCountry: "JP",
    }),
    areaServed: servedAreaNames().map((name) => ({ "@type": "AdministrativeArea", name })),
    knowsAbout: ["住宅用太陽光発電", "家庭用蓄電池", "V2H", "HEMS", "太陽光発電の補助金", "葛飾区の補助金"],
    makesOffer: [
      "住宅用太陽光発電の設置",
      "家庭用蓄電池の設置",
      "太陽光発電と蓄電池の同時導入",
      "V2Hの設置",
      "HEMSの設置",
      "補助金活用サポート",
      "現地調査・見積もり",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
    sameAs: [siteConfig.company.corporateUrl, siteConfig.gbp.mapsUrl].filter(Boolean),
  });
}

export function websiteSchema(): JsonLd {
  return compact({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    alternateName: siteConfig.nameJa,
    url: absoluteUrl("/"),
    inLanguage: "ja",
    publisher: { "@id": ORG_ID },
  });
}

export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) =>
      compact({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: absoluteUrl(c.href),
      }),
    ),
  };
}

export function faqSchema(items: { q: string; a: string }[]): JsonLd {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleSchema(input: {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  type?: "Article" | "BlogPosting";
  image?: string;
  keywords?: string[];
}): JsonLd {
  return compact({
    "@type": input.type ?? "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: "ja",
    mainEntityOfPage: absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    image: input.image ? absoluteUrl(input.image) : absoluteUrl("/opengraph-image"),
    keywords: input.keywords?.join(","),
    author: { "@type": "Organization", name: siteConfig.editorial.supervisor, url: absoluteUrl("/company") },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
  });
}

export function webPageSchema(input: { path: string; name: string; description: string; dateModified?: string }): JsonLd {
  return compact({
    "@type": "WebPage",
    "@id": absoluteUrl(input.path) ? `${absoluteUrl(input.path)}#webpage` : undefined,
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    dateModified: input.dateModified,
    inLanguage: "ja",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": LOCALBUSINESS_ID },
  });
}

export function productSchema(input: {
  path: string;
  name: string;
  description: string;
  brand: string;
  model: string;
  image?: string | null;
  price?: number | null;
}): JsonLd {
  // 価格が未確定なら Offer を付けない（架空の Offer を作らない）
  return compact({
    "@type": "Product",
    name: input.name,
    description: input.description,
    brand: { "@type": "Brand", name: input.brand },
    model: input.model,
    image: input.image ? absoluteUrl(input.image) : undefined,
    url: absoluteUrl(input.path),
    ...(input.price != null
      ? {
          offers: compact({
            "@type": "Offer",
            price: input.price,
            priceCurrency: "JPY",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(input.path),
            seller: { "@id": ORG_ID },
          }),
        }
      : {}),
  });
}

/** 複数スキーマを1つの @graph にまとめる */
export function graph(...items: JsonLd[]): JsonLd {
  return { "@context": "https://schema.org", "@graph": items };
}
