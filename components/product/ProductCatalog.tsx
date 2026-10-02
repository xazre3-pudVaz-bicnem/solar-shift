import Link from "next/link";
import type { Product, ProductCategory } from "@/data/products";
import { manufacturers } from "@/data/manufacturers";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductComparison } from "@/components/product/ProductComparison";
import { ManufacturerList } from "@/components/product/ManufacturerList";

/**
 * 商品一覧の本体。
 * - 商品は、メーカー公式情報で仕様を確認して登録したもの（status: "published"）だけが出る。
 * - 0件のときは、短い案内だけを出す（空の商品ページや、架空の商品・価格は作らない）。
 * - メーカーは、取扱いの契約を確認できたもの（relationship が handling / authorized）だけを出す。
 *   検討中（candidate）のメーカー名は、画面に出さない（取り扱っていると読めてしまうため）。
 */
export function ProductCatalog({
  products,
  category,
  emptyTitle = "個別の商品は、仕様を確認できたものから掲載します",
  emptyBody = "メーカーの公式資料で仕様を確認した商品だけを掲載します。確認が済むまでは、商品名や価格を載せません。機種のご相談は、屋根と電気の使い方を伺ったうえでお受けしています。",
  showComparison = true,
}: {
  products: Product[];
  category?: ProductCategory;
  emptyTitle?: string;
  emptyBody?: string;
  showComparison?: boolean;
}) {
  const mfCategory = category === "solar" || category === "battery" || category === "v2h" || category === "hems" || category === "hybrid" ? category : undefined;
  const confirmed = manufacturers.filter((m) => m.relationship !== "candidate" && (!mfCategory || m.categories.includes(mfCategory)));
  return (
    <div className="space-y-12">
      {products.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          {showComparison && (category === "solar" || category === "battery") && (
            <section aria-label="比較表">
              <h2 className="text-[22px] leading-[1.45] font-black text-navy-900">主な仕様の比較</h2>
              <div className="mt-4">
                <ProductComparison products={products} category={category} />
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="rounded-md border border-l-4 border-line border-l-navy-900 bg-paper-2 px-5 py-5 sm:px-6">
          <p className="font-heading text-[18px] leading-[1.5] font-black text-navy-900">{emptyTitle}</p>
          <p className="mt-2 max-w-3xl text-base leading-[1.9] text-ink-2">{emptyBody}</p>
          <p className="mt-2">
            <Link href="/contact" className="inline-flex min-h-11 items-center font-bold text-navy-700 underline underline-offset-4 hover:text-accent-text">
              機種について相談する →
            </Link>
          </p>
        </div>
      )}

      {confirmed.length > 0 && (
        <section aria-labelledby="mf-h">
          <h2 id="mf-h" className="text-[22px] leading-[1.45] font-black text-navy-900">
            取扱メーカー
          </h2>
          <div className="mt-5">
            <ManufacturerList category={mfCategory} />
          </div>
        </section>
      )}
    </div>
  );
}
