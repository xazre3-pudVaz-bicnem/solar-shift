import { siteConfig, contactEmail, companyMapUrl, contactTelIntl } from "@/lib/site";
import { absoluteUrl, ogImagePath, SITE_URL } from "@/lib/seo";
import { servedAreas } from "@/data/areas";
import type { Subsidy } from "@/data/subsidies/types";

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

/**
 * 対応エリア。Wikidata の項目（data/areas.ts の wikidata）があるときは sameAs で結び、
 * 「葛飾区」がどの自治体を指すのかを、名前の文字列ではなく実体で伝える。
 * only を渡すと、その名前のエリアだけを返す（エリアページでは、その区だけを出す）。
 */
function areaServed(only?: string[]): JsonLd[] {
  return servedAreas()
    .filter((a) => !only || only.includes(a.name))
    .map((a) => compact({ "@type": "AdministrativeArea", name: `${a.prefecture}${a.name}`, sameAs: a.wikidata ? `https://www.wikidata.org/wiki/${a.wikidata}` : undefined }));
}

/** 日付（YYYY-MM-DD）に、日本時間であることを添える（検索エンジンが別の時間帯として読まないように） */
function jst(date?: string): string | undefined {
  if (!date) return undefined;
  return date.length === 10 ? `${date}T00:00:00+09:00` : date;
}

/** ロゴ（512px の軽い版。元の logo.png は 1254px で重いので、構造化データからはこちらを指す） */
function logoImage(): JsonLd | undefined {
  const url = absoluteUrl("/logo-512.png");
  return url ? { "@type": "ImageObject", url, width: 512, height: 512 } : undefined;
}

/** LocalBusiness.makesOffer に出すサービスと、その説明ページ */
const OFFERED_SERVICES: { name: string; path?: string }[] = [
  { name: "住宅用太陽光発電の設置", path: "/solar" },
  { name: "家庭用蓄電池の設置", path: "/battery" },
  { name: "太陽光発電と蓄電池の同時導入", path: "/solar-battery" },
  { name: "V2Hの設置", path: "/v2h" },
  { name: "HEMSの設置", path: "/hems" },
  { name: "補助金活用サポート", path: "/subsidy" },
  { name: "現地調査・見積もり", path: "/contact" },
];

/**
 * 営業時間（lib/site.ts の hours ＝ "9:00〜20:00" と openDays）。
 * 曜日が決まっていないとき、時刻の形が読めないときは出さない（曜日の無い営業時間は書けない）。
 */
function openingHoursSpecification(): JsonLd[] | undefined {
  const days = siteConfig.contact.openDays;
  const m = siteConfig.contact.hours.match(/(\d{1,2}):(\d{2})\s*[〜～~-]\s*(\d{1,2}):(\d{2})/);
  if (days.length === 0 || !m) return undefined;
  const hm = (h: string, min: string) => `${h.padStart(2, "0")}:${min}`;
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.map((d) => `https://schema.org/${d}`),
      opens: hm(m[1], m[2]),
      closes: hm(m[3], m[4]),
    },
  ];
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
    logo: logoImage(),
    email,
    telephone: contactTelIntl(),
    founder: { "@type": "Person", name: siteConfig.company.representative, jobTitle: siteConfig.company.representativeTitle },
    foundingDate: "2026-05-13",
    address: postalAddress(),
    areaServed: areaServed(),
    knowsAbout: KNOWS_ABOUT,
    // 電話番号は siteConfig に入っているときだけ出る（空なら compact が落とす）。
    // 営業時間は、営業する曜日（siteConfig.contact.openDays）が決まっているときだけ出る
    contactPoint: compact({
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: contactTelIntl(),
      email,
      url: absoluteUrl("/contact"),
      availableLanguage: "ja",
      areaServed: "JP",
      hoursAvailable: openingHoursSpecification(),
    }),
    // 記事と補助金情報をどう作り、どう確かめているか（編集方針のページ）
    publishingPrinciples: absoluteUrl(siteConfig.editorial.policyPath),
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
    logo: logoImage(),
    email: contactEmail(),
    telephone: contactTelIntl(),
    parentOrganization: { "@id": ORG_ID },
    address: postalAddress(),
    areaServed: areaServed(),
    openingHoursSpecification: openingHoursSpecification(),
    hasMap: companyMapUrl(),
    knowsAbout: KNOWS_ABOUT,
    // 各サービスは、その説明ページ（/solar など）の Service と同じ @id で結ぶ
    makesOffer: OFFERED_SERVICES.map((s) => {
      const url = s.path ? absoluteUrl(s.path) : undefined;
      const isServicePage = Boolean(s.path && ["/solar", "/battery", "/solar-battery", "/v2h", "/hems"].includes(s.path));
      return { "@type": "Offer", itemOffered: compact({ "@type": "Service", "@id": url && isServicePage ? `${url}#service` : undefined, name: s.name, url }) };
    }),
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
  /** 記事の舞台になっている地域（施工事例の市区など）。例：「東京都葛飾区」 */
  location?: string;
}): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": input.type ?? "Article",
    "@id": url ? `${url}#article` : undefined,
    headline: input.title,
    description: input.description,
    datePublished: jst(input.datePublished),
    dateModified: jst(input.dateModified),
    inLanguage: "ja",
    mainEntityOfPage: url,
    url,
    image: absoluteUrl(input.image ?? ogImagePath(input.path)),
    keywords: input.keywords?.join(","),
    articleSection: input.section,
    wordCount: input.wordCount,
    citation: citations(input.sources),
    contentLocation: input.location ? { "@type": "AdministrativeArea", name: input.location } : undefined,
    // 書き手は運営会社。Organization の実体は layout の @graph にある（同じ @id）。url はそちらの値に任せ、ここでは重ねて書かない
    author: { "@type": "Organization", "@id": ORG_ID, name: siteConfig.company.name },
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
  /**
   * そのページの主題になっている実体の @id。
   *   "service" … そのページの Service（serviceSchema を一緒に出すページ）
   *   "organization" … 運営会社、"business" … SOLAR SHIFT（LocalBusiness）
   */
  mainEntity?: "service" | "organization" | "business" | "app";
  /** 公式情報を最後に確かめた日（補助金のページなど） */
  lastReviewed?: string;
}): JsonLd {
  const url = absoluteUrl(input.path);
  const main =
    input.mainEntity === "service" && url
      ? { "@id": `${url}#service` }
      : input.mainEntity === "app" && url
        ? { "@id": `${url}#app` }
        : input.mainEntity === "organization"
          ? { "@id": ORG_ID }
          : input.mainEntity === "business"
            ? { "@id": LOCALBUSINESS_ID }
            : undefined;
  return compact({
    "@type": input.type ?? "WebPage",
    "@id": url ? `${url}#webpage` : undefined,
    url,
    name: input.name,
    description: input.description,
    dateModified: jst(input.dateModified),
    lastReviewed: jst(input.lastReviewed),
    inLanguage: "ja",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": LOCALBUSINESS_ID },
    mainEntity: main,
    primaryImageOfPage: absoluteUrl(ogImagePath(input.path)) ? { "@type": "ImageObject", url: absoluteUrl(ogImagePath(input.path)), width: 1200, height: 630 } : undefined,
    citation: citations(input.sources),
  });
}

/** サービスページ（太陽光・蓄電池・V2H・HEMS）。料金は未確定のため Offer の価格は出さない */
export function serviceSchema(input: {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  /** その地域だけを対象にするページ（エリアページ）では、区の名前を渡す。省略すると対応エリアの全部 */
  areaNames?: string[];
}): JsonLd {
  const url = absoluteUrl(input.path);
  return compact({
    "@type": "Service",
    "@id": url ? `${url}#service` : undefined,
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url,
    provider: { "@id": LOCALBUSINESS_ID },
    areaServed: areaServed(input.areaNames),
  });
}

/**
 * 補助金・助成金の1メニュー（schema.org の FinancialIncentive）。
 * 金額・期間・受付状況は data/subsidies の値だけから作る（ここで数字を足さない）。
 * 金額は、計算の決まり（◯万円/kW・対象経費の1/4 など）が単純な数値で表せないので、説明文として出す。
 * 検索結果の表示が変わる機能ではなく、「だれが・どの地域で・いつまで・何に出す助成か」を機械が読める形で伝えるためのもの。
 */
export function financialIncentiveSchema(s: Subsidy, pagePath: string): JsonLd {
  const url = absoluteUrl(pagePath);
  const dates = [...s.applicationPeriod.matchAll(/(\d{4})年(\d{1,2})月(\d{1,2})日/g)].map((m) => `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`);
  const status = s.status === "open" ? "https://schema.org/IncentiveStatusActive" : s.status === "closed" ? "https://schema.org/IncentiveStatusRetired" : undefined;
  const areaName = s.area === "katsushika" ? "東京都葛飾区" : s.area === "tokyo" ? "東京都" : "日本";
  return compact({
    "@type": "FinancialIncentive",
    "@id": url ? `${url}#${s.id}` : undefined,
    name: `${s.programName}：${s.name}`,
    description: `${s.amount}${s.maxAmount && !s.amount.includes(s.maxAmount) ? `（${s.maxAmount}）` : ""}。対象：${s.target}`,
    incentiveType: "https://schema.org/IncentiveTypeRebateOrSubsidy",
    incentiveStatus: status,
    provider: { "@type": "GovernmentOrganization", name: s.issuer },
    areaServed: { "@type": "AdministrativeArea", name: areaName },
    validFrom: dates.length === 2 ? dates[0] : undefined,
    validThrough: dates.length === 2 ? dates[1] : undefined,
    // 制度の公式ページ
    url: s.sourceUrl,
    mainEntityOfPage: url,
  });
}

/**
 * 周辺の区の補助金の1メニュー（data/ward-programs.ts の内容だけから作る）。
 * 区の名前は Wikidata の項目と結び、どの自治体の制度かを実体で伝える。
 */
export function wardIncentiveSchema(input: {
  pagePath: string;
  /** ページ内で重ならない識別子 */
  key: string;
  programName: string;
  itemName: string;
  description: string;
  wardName: string;
  wikidata?: string;
  sourceUrl: string;
}): JsonLd {
  const url = absoluteUrl(input.pagePath);
  return compact({
    "@type": "FinancialIncentive",
    "@id": url ? `${url}#${input.key}` : undefined,
    name: `${input.wardName}「${input.programName}」：${input.itemName}`,
    description: input.description,
    incentiveType: "https://schema.org/IncentiveTypeRebateOrSubsidy",
    provider: { "@type": "GovernmentOrganization", name: input.wardName },
    areaServed: compact({ "@type": "AdministrativeArea", name: `東京都${input.wardName}`, sameAs: input.wikidata ? `https://www.wikidata.org/wiki/${input.wikidata}` : undefined }),
    url: input.sourceUrl,
    mainEntityOfPage: url,
  });
}

/** 用語集（DefinedTermSet）。ページに表示している用語と説明だけを渡す */
export function definedTermSetSchema(input: { path: string; name: string; description: string; terms: { id: string; name: string; description: string }[] }): JsonLd {
  const url = absoluteUrl(input.path);
  const setId = url ? `${url}#glossary` : undefined;
  return compact({
    "@type": "DefinedTermSet",
    "@id": setId,
    name: input.name,
    description: input.description,
    url,
    inLanguage: "ja",
    hasDefinedTerm: input.terms.map((t) =>
      compact({
        "@type": "DefinedTerm",
        "@id": url ? `${url}#${t.id}` : undefined,
        name: t.name,
        description: t.description,
        url: url ? `${url}#${t.id}` : undefined,
        inDefinedTermSet: setId ? { "@id": setId } : undefined,
      }),
    ),
  });
}

/** 外部サイトを指す項目の一覧（取扱メーカーと、その公式サイトなど） */
export function externalItemListSchema(input: { name: string; items: { name: string; url: string }[] }): JsonLd {
  return compact({
    "@type": "ItemList",
    name: input.name,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, url: item.url })),
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
        datePublished: jst(p.datePublished),
        dateModified: jst(p.dateModified),
      }),
    ),
  });
}

/** 補助金シミュレーター（無料で使えるWebツール） */
export function webApplicationSchema(input: { path: string; name: string; description: string; features?: string[] }): JsonLd {
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
    // 無料で使える道具（料金は 0 円）
    offers: { "@type": "Offer", price: 0, priceCurrency: "JPY" },
    featureList: input.features,
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
