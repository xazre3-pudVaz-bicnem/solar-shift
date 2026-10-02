import Link from "next/link";
import type { Product } from "@/data/products";
import { priceLabel, productCategoryLabel } from "@/data/products";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product }: { product: Product }) {
  const spec =
    product.category === "solar"
      ? [product.ratedOutputW ? `${product.ratedOutputW}W` : null, product.efficiencyPct ? `変換効率${product.efficiencyPct}%` : null]
      : [product.capacityKwh ? `${product.capacityKwh}kWh` : null, product.loadType];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-transform duration-200 hover:-translate-y-1">
      <ImagePlaceholder src={product.image} alt={product.imageAlt ?? `${product.manufacturer} ${product.name}`} ratio="4/3" label="商品画像準備中" frame={false} className="rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge tone="green">{productCategoryLabel[product.category]}</Badge>
          {product.recommended && <Badge tone="accent">おすすめ</Badge>}
        </div>
        <p className="mt-3 text-[12px] text-ink-3">{product.manufacturer}</p>
        <h3 className="text-[17px] font-bold text-navy-900">
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-accent-text">
            {product.name}
          </Link>
        </h3>
        {product.modelNumber && <p className="text-[12px] text-ink-3">{product.modelNumber}</p>}
        <p className="mt-2 text-[13px] text-ink-2">{spec.filter(Boolean).join("・")}</p>
        <p className="mt-auto pt-4 font-heading text-[15px] font-black text-navy-900">{priceLabel(product)}</p>
      </div>
    </article>
  );
}
