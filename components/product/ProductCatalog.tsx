import type { Product, ProductCategory } from "@/data/products";
import type { ManufacturerCategory } from "@/data/manufacturers";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductComparison } from "@/components/product/ProductComparison";
import { MakerShowcase } from "@/components/product/MakerShowcase";

/**
 * 商品ページの本体。取扱メーカーの一覧を出す。
 *
 * 方針（2026-10-02・運営者の指示）：メーカー・商品は数が多いので、個別の商品（型番・仕様・価格）は掲載しない。
 * 代わりに、取り扱っているメーカーを一覧で見せる（components/product/MakerShowcase.tsx）。
 *
 * data/products.ts に、仕様を確認して status: "published" にした商品がある場合だけ、その商品のカードも出す
 * （いまは0件。空の商品ページや、架空の商品・価格は作らない）。
 */
export function ProductCatalog({
  products,
  category,
  detail = false,
  showComparison = true,
  headingId,
}: {
  products: Product[];
  category?: ProductCategory;
  /** メーカーごとの紹介文と、公式サイトへのリンクも出す */
  detail?: boolean;
  showComparison?: boolean;
  headingId?: string;
}) {
  const mfCategory: ManufacturerCategory | undefined = category === "solar" || category === "battery" || category === "v2h" || category === "hems" || category === "hybrid" ? category : undefined;
  return (
    <div className="space-y-12">
      <MakerShowcase category={mfCategory} detail={detail} headingId={headingId} />

      {products.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          {showComparison && (category === "solar" || category === "battery") && (
            <section aria-label="比較表">
              <h3 className="text-[20px] leading-[1.45] font-black text-navy-900">主な仕様の比較</h3>
              <div className="mt-4">
                <ProductComparison products={products} category={category} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
