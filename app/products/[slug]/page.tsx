import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { publishedProducts, getProduct, priceLabel, productCategoryLabel, productsByCategory } from "@/data/products";
import { getManufacturer } from "@/data/manufacturers";
import { subsidiesByEquipment } from "@/data/subsidies";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { Badge } from "@/components/ui/Badge";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { FaqSection } from "@/components/sections/FaqSection";
import { ProductComparison } from "@/components/product/ProductComparison";
import { CtaSection } from "@/components/sections/CtaSection";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, productSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return buildMetadata({
    title: `${p.manufacturer} ${p.name}｜仕様・特徴・葛飾区での導入`,
    description: `${p.manufacturer}の${productCategoryLabel[p.category]}「${p.name}（${p.modelNumber}）」の仕様・特徴・向いている家庭・注意点・補助金対象の可能性・葛飾区で導入するときの考え方を解説。`,
    path: `/products/${p.slug}`,
    keywords: [p.manufacturer, p.name, p.modelNumber, productCategoryLabel[p.category]].filter(Boolean),
    modifiedTime: p.updatedAt,
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const mf = getManufacturer(p.manufacturerId);
  const path = `/products/${p.slug}`;
  const listHref = p.category === "solar" ? "/products/solar" : p.category === "battery" ? "/products/battery" : "/products";
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "取扱商品", href: "/products" },
    { name: `${productCategoryLabel[p.category]}一覧`, href: listHref },
    { name: p.name, href: path },
  ];
  const others = (p.category === "solar" || p.category === "battery" ? productsByCategory(p.category) : []).filter((o) => o.slug !== p.slug).slice(0, 3);
  const subsidies = subsidiesByEquipment(p.category === "hybrid" ? "battery" : p.category === "hems" ? "hems" : p.category === "v2h" ? "v2h" : p.category).filter((s) => s.area !== "national");

  const specRows = [
    { term: "メーカー", description: mf ? <a href={mf.officialUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4">{p.manufacturer}</a> : p.manufacturer },
    { term: "商品名", description: p.name },
    { term: "型番", description: p.modelNumber || "—" },
    { term: "カテゴリ", description: productCategoryLabel[p.category] },
    ...(p.ratedOutputW ? [{ term: "公称最大出力", description: `${p.ratedOutputW}W` }] : []),
    ...(p.efficiencyPct ? [{ term: "モジュール変換効率", description: `${p.efficiencyPct}%` }] : []),
    ...(p.capacityKwh ? [{ term: "蓄電容量", description: `${p.capacityKwh}kWh` }] : []),
    ...(p.ratedPowerKw ? [{ term: "定格出力", description: `${p.ratedPowerKw}kW` }] : []),
    ...(p.loadType ? [{ term: "負荷タイプ", description: p.loadType }] : []),
    ...(p.installation ? [{ term: "設置場所", description: p.installation }] : []),
    ...(p.size ? [{ term: "サイズ", description: p.size }] : []),
    ...(p.weightKg ? [{ term: "重量", description: `${p.weightKg}kg` }] : []),
    ...(p.warranty ? [{ term: "保証", description: p.warranty }] : []),
    { term: "販売価格", description: <span className="font-bold text-navy-900">{priceLabel(p)}</span> },
    ...(p.msrp !== null ? [{ term: "メーカー希望小売価格", description: `${p.msrp.toLocaleString("ja-JP")}円（税込）` }] : []),
    ...(p.specSourceUrl ? [{ term: "仕様の出典", description: <a href={p.specSourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4">メーカー公式ページ</a> }] : []),
  ];

  return (
    <>
      <Container className="pt-5 sm:pt-6">
        <Breadcrumb crumbs={crumbs} />
      </Container>
      <Container className="py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <ImagePlaceholder src={p.image} alt={p.imageAlt ?? `${p.manufacturer} ${p.name}`} ratio="4/3" label="商品画像準備中" priority />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="navy">{productCategoryLabel[p.category]}</Badge>
              {p.recommended && <Badge tone="accent">おすすめ</Badge>}
            </div>
            <p className="mt-4 text-[14px] text-ink-3">{p.manufacturer}</p>
            <h1 className="text-[28px] leading-[1.35] font-bold text-navy-900 sm:text-[34px]">{p.name}</h1>
            {p.modelNumber && <p className="mt-1 text-[14px] text-ink-3">型番：{p.modelNumber}</p>}
            {p.differentiation && <p className="mt-5 text-[15px] leading-[1.9] text-ink">{p.differentiation}</p>}
            <p className="mt-6 text-[22px] font-bold text-navy-900">{priceLabel(p)}</p>
            {p.price === null && <p className="mt-1 text-[13px] text-ink-3">価格は屋根条件・工事内容により異なります。現地調査のうえでお見積もりします。</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex h-12 items-center rounded-full bg-cta px-6 text-[15px] font-bold text-white shadow-pill hover:bg-cta-dark">この商品について問い合わせる</Link>
              <Link href="/simulation" className="inline-flex h-12 items-center rounded-full bg-green-600 px-6 text-[15px] font-bold text-white hover:bg-green-700">補助金を試算する</Link>
            </div>
            <LastUpdated updatedAt={p.updatedAt} showSupervisor={false} className="mt-6" />
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-12">
            <section aria-labelledby="spec">
              <h2 id="spec" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">仕様</h2>
              <DefinitionList rows={specRows} className="mt-4" />
              {p.officialUrl && (
                <p className="mt-3 text-[13px]">
                  <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4">メーカー公式の商品ページ</a>
                </p>
              )}
            </section>

            {p.features.length > 0 && (
              <section aria-labelledby="features">
                <h2 id="features" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">特徴</h2>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.85]">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </section>
            )}

            {p.recommendedFor.length > 0 && (
              <section aria-labelledby="for">
                <h2 id="for" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">どんな家庭に向いているか</h2>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.85]">
                  {p.recommendedFor.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </section>
            )}

            {(p.merits.length > 0 || p.cautions.length > 0) && (
              <section aria-labelledby="pros" className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h2 id="pros" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">メリット</h2>
                  <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.85]">
                    {p.merits.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
                <div>
                  <h2 className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">注意点</h2>
                  <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.85]">
                    {p.cautions.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              </section>
            )}

            {p.pairing && (
              <section aria-labelledby="pairing">
                <h2 id="pairing" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">太陽光との組み合わせ</h2>
                <p className="mt-4 text-[15px] leading-[1.9]">{p.pairing}</p>
              </section>
            )}

            <section aria-labelledby="subsidy">
              <h2 id="subsidy" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">補助金対象になる可能性</h2>
              {p.subsidyNote && <p className="mt-4 text-[15px] leading-[1.9]">{p.subsidyNote}</p>}
              {subsidies.length > 0 && (
                <div className="mt-4">
                  <SubsidyTable menus={subsidies} showArea />
                </div>
              )}
              <p className="mt-3 text-[13px] text-ink-3">対象可否は制度の要件・機器の登録状況・申請時期で変わります。{formatDateJa(subsidies[0]?.lastVerified ?? p.updatedAt)}時点の公式情報です。</p>
              <SubsidyDisclaimer className="mt-4" />
            </section>

            {p.katsushikaNote && (
              <section aria-labelledby="katsushika">
                <h2 id="katsushika" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">葛飾区で導入するときの考え方</h2>
                <p className="mt-4 text-[15px] leading-[1.9]">{p.katsushikaNote}</p>
              </section>
            )}

            {p.faq.length > 0 && (
              <section aria-labelledby="faq">
                <h2 id="faq" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">この商品についてよくある質問</h2>
                <FaqSection items={p.faq} withSchema className="mt-4" />
              </section>
            )}

            {others.length > 1 && (p.category === "solar" || p.category === "battery") && (
              <section aria-labelledby="others">
                <h2 id="others" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">他製品との違い</h2>
                <div className="mt-4">
                  <ProductComparison products={[p, ...others]} category={p.category} />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-beige p-5 text-[14px] leading-[1.8]">
              <p className="font-bold text-navy-900">関連ページ</p>
              <ul className="mt-2 space-y-1.5">
                <li><Link href={listHref} className="text-navy-600 underline underline-offset-4">{productCategoryLabel[p.category]}一覧</Link></li>
                <li><Link href="/subsidy/katsushika" className="text-navy-600 underline underline-offset-4">葛飾区の補助金</Link></li>
                <li><Link href="/subsidy/tokyo" className="text-navy-600 underline underline-offset-4">東京都の補助金</Link></li>
                <li><Link href="/flow" className="text-navy-600 underline underline-offset-4">導入までの流れ</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>

      <CtaSection title={`${p.name} の導入をご検討なら`} body="屋根条件・設置場所・補助金の対象可否を現地調査で確認し、お見積もりをお出しします。相談・見積もりは無料です。" />

      <JsonLd
        data={graph(
          productSchema({
            path,
            name: `${p.manufacturer} ${p.name}`,
            description: p.differentiation || `${p.manufacturer}の${productCategoryLabel[p.category]}`,
            brand: p.manufacturer,
            model: p.modelNumber,
            image: p.image,
            price: p.price,
          }),
        )}
      />
    </>
  );
}
