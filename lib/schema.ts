import { siteConfig, contactEmail, companyMapUrl, contactTelIntl } from "@/lib/site";
import { absoluteUrl, ogImagePath, SITE_URL } from "@/lib/seo";
import { servedAreaNames } from "@/data/areas";

/**
 * JSON-LD 生成。ページ本文と一致する内容だけを出す。
 * - 口コミ・評価（Review / AggregateRating）は data/voices が空の間は一切出さない。
 * - 価格未確定の商品に Offer は付けない。
 * - 電話番号・営業時間・緯度経度など siteConfig で空のもの／未確認のものは出力しない。
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

const KNOWS_ABOUT = ["住宅用太陽光発電", "家庭用蓄電池", "V2H", "HEMS", "太陽光発電の補助金", "葛飾区の補助金", "かつしかエコ助成金", "東京都の太陽光・蓄電池助成"];

function postalAddress(): JsonLd {
  return compact({
    "@type": "PostalAddress",
    postalCode: siteConfig.company.address.postalCode,
    addressRegion: siteConfig.company.address.prefecture,
    addressLocality: siteConfig.company.address.city,
    streetAddress: siteConfig.company.address.street,
    addressCountry: "JP",
  });
}

function areaServed(): JsonLd[] {
  return servedAreaNames().map((name) => ({ "@type": "AdministrativeArea", name }));
}

export function organizationSchema(): JsonLd {
  const email = contactEmail();
  return compact({
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.company.name,
    legalName: siteConfig.company.name,
    alternateName: [siteConfig.name, siteConfig.company.nameEn],
    description: siteConfig.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.png"),
    email,
    telephone: contactTelIntl(),
    founder: { "@type": "Person", name: siteConfig.company.representative, jobTitle: siteConfig.company.representativeTitle },
    foundingDate: "2026-05-13",
    address: postalAddress(),
    areaServed: areaServed(),
    knowsAbout: KNOWS_ABOUT,
    // 電話番号は siteConfig に入っているときだけ出る（空なら compact が落とす）。受付時間は未確定のため出さない
    contactPoint: compact({
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: contactTelIntl(),
      email,
      url: absoluteUrl("/contact"),
      availableLanguage: "ja",
      areaServed: "JP",
    }),
    sameAs: [siteConfig.company.corporateUrl, siteConfig.social.instagram, siteConfig.social.x, siteConfig.social.youtube].filter(Boolean),
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
    image: absoluteUrl(ogImagePath("/")),
    logo: absoluteUrl("/logo.png"),
    email: contactEmail(),
    telephone: contactTelIntl(),
    parentOrganization: { "@id": ORG_ID },
    address: postalAddress(),
    areaServed: areaServed(),
    hasMap: companyMapUrl(),
    knowsAbout: KNOWS_ABOUT,
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
    description: siteConfig.description,
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

/** 出典（一次情報）を citation として渡す形 */
export interface SchemaSource {
  name: string;
  url: string;
}

function citations(sources?: SchemaSource[]): JsonLd[] | undefined {
  if (!sources || sources.length === 0) return undefined;
  return sources.map((s) => ({ "@type": "CreativeWork", name: s.name, url: s.url }));
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
  /** 記事のカテゴリ（ブログのカテゴリ名など） */
  section?: string;
  /** 本文の文字数 */
  wordCount?: number;
  /** ページに表示している出典（一次情報） */
  sources?: SchemaSource[];
}): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": input.type ?? "Article",
    "@id": url ? `${url}#article` : undefined,
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: "ja",
    mainEntityOfPage: url,
    url,
    image: absoluteUrl(input.image ?? ogImagePath(input.path)),
    keywords: input.keywords?.join(","),
    articleSection: input.section,
    wordCount: input.wordCount,
    citation: citations(input.sources),
    author: compact({ "@type": "Organization", "@id": ORG_ID, name: siteConfig.company.name, url: absoluteUrl("/company") }),
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": LOCALBUSINESS_ID },
  });
}

export type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "QAPage";

export function webPageSchema(input: {
  path: string;
  name: string;
  description: string;
  dateModified?: string;
  /** 会社概要は AboutPage、問い合わせは ContactPage、一覧は CollectionPage */
  type?: WebPageType;
  sources?: SchemaSource[];
}): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": input.type ?? "WebPage",
    "@id": url ? `${url}#webpage` : undefined,
    url,
    name: input.name,
    description: input.description,
    dateModified: input.dateModified,
    inLanguage: "ja",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": LOCALBUSINESS_ID },
    primaryImageOfPage: absoluteUrl(ogImagePath(input.path)) ? { "@type": "ImageObject", url: absoluteUrl(ogImagePath(input.path)), width: 1200, height: 630 } : undefined,
    citation: citations(input.sources),
  });
}

/** サービスページ（太陽光・蓄電池・V2H・HEMS）。料金は未確定のため Offer の価格は出さない */
export function serviceSchema(input: { path: string; name: string; description: string; serviceType: string }): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": "Service",
    "@id": url ? `${url}#service` : undefined,
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url,
    provider: { "@id": LOCALBUSINESS_ID },
    areaServed: areaServed(),
  });
}

/** 手順の説明（導入の流れなど）。ページに表示している手順と同じ内容だけを渡す */
export function howToSchema(input: { path: string; name: string; description: string; steps: { name: string; text: string }[] }): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": "HowTo",
    "@id": url ? `${url}#howto` : undefined,
    name: input.name,
    description: input.description,
    inLanguage: "ja",
    step: input.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
  });
}

/** 一覧ページに並べている項目（記事・ガイド・エリアなど） */
export function itemListSchema(input: { name: string; items: { name: string; path: string }[] }): JsonLd {
  return compact({
    "@type": "ItemList",
    name: input.name,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, i) =>
      compact({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      }),
    ),
  });
}

/** ブログ一覧 */
export function blogSchema(input: { path: string; name: string; description: string; posts: { title: string; path: string; datePublished: string; dateModified: string }[] }): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": "Blog",
    "@id": url ? `${url}#blog` : undefined,
    name: input.name,
    description: input.description,
    url,
    inLanguage: "ja",
    publisher: { "@id": ORG_ID },
    blogPost: input.posts.map((p) =>
      compact({
        "@type": "BlogPosting",
        headline: p.title,
        url: absoluteUrl(p.path),
        datePublished: p.datePublished,
        dateModified: p.dateModified,
      }),
    ),
  });
}

/** 補助金シミュレーター（無料で使えるWebツール） */
export function webApplicationSchema(input: { path: string; name: string; description: string }): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": "WebApplication",
    "@id": url ? `${url}#app` : undefined,
    name: input.name,
    description: input.description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "JavaScript が有効なブラウザ",
    isAccessibleForFree: true,
    inLanguage: "ja",
    provider: { "@id": ORG_ID },
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
