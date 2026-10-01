import Link from "next/link";
import Image from "next/image";
import type { Product, ProductCategory } from "@/data/products";
import { images } from "@/data/images";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductComparison } from "@/components/product/ProductComparison";
import { ManufacturerList } from "@/components/product/ManufacturerList";
import { reveal } from "@/lib/reveal";

/**
 * 商品一覧の本体。商品が0件のときは「順次掲載予定」と候補メーカーを出し、
 * 架空の商品・価格は一切出さない。
 */
export function ProductCatalog({
  products,
  category,
  emptyTitle = "商品ページは順次掲載予定です",
  emptyBody = "メーカー公式情報で仕様を確認した商品から順に掲載します。価格が未確定の商品は「お問い合わせください」と表示し、架空の価格は掲載しません。",
  showComparison = true,
}: {
  products: Product[];
  category?: ProductCategory;
  emptyTitle?: string;
  emptyBody?: string;
  showComparison?: boolean;
}) {
  const mfCategory = category === "solar" || category === "battery" || category === "v2h" || category === "hems" || category === "hybrid" ? category : undefined;
  const pose = images.poseChart;
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
              <h2 className="text-[22px] font-black text-navy-900">主な仕様の比較</h2>
              <div className="mt-4">
                <ProductComparison products={products} category={category} />
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="grid items-center gap-5 rounded-[2rem] border-[3px] border-dashed border-orange-200 bg-white p-6 sm:grid-cols-[9rem_1fr] sm:p-8" {...reveal()}>
          <Image src={pose.src} alt="" width={pose.width} height={pose.height} sizes="144px" className="mx-auto h-auto w-28 sm:w-full" />
          <div>
            <p className="font-heading text-[20px] font-black text-navy-900">{emptyTitle}</p>
            <p className="mt-2 max-w-3xl text-[14px] leading-[1.9] text-ink-2">{emptyBody}</p>
            <p className="mt-4 text-[14px]">
              機種のご相談は
              <Link href="/contact" className="mx-1 font-bold text-navy-600 underline decoration-orange-400 decoration-2 underline-offset-4">
                お問い合わせフォーム
              </Link>
              から受け付けています。
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="mf-h">
        <h2 id="mf-h" className="text-[22px] font-black text-navy-900">
          取扱を検討しているメーカー
        </h2>
        <p className="mt-2 text-[14px] leading-[1.8] text-ink-2">
          取扱契約の有無を確認中のため、現時点では「正規取扱店」「認定店」などの表記は行っていません。メーカーの選定にあたっては、公式サイトの仕様・保証情報を確認してからご提案します。
        </p>
        <div className="mt-5">
          <ManufacturerList category={mfCategory} />
        </div>
      </section>
    </div>
  );
}
