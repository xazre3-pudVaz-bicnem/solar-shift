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
    <article className="flex flex-col border border-line bg-white">
      <Link href={`/products/${product.slug}`} className="block">
        <ImagePlaceholder src={product.image} alt={product.imageAlt ?? `${product.manufacturer} ${product.name}`} ratio="4/3" label="商品画像準備中" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge tone="navy">{productCategoryLabel[product.category]}</Badge>
          {product.recommended && <Badge tone="accent">おすすめ</Badge>}
        </div>
        <p className="mt-3 text-[12px] text-ink-3">{product.manufacturer}</p>
        <h3 className="text-[16px] font-bold text-navy-900">
          <Link href={`/products/${product.slug}`} className="hover:text-accent-text">
            {product.name}
          </Link>
        </h3>
        {product.modelNumber && <p className="text-[12px] text-ink-3">{product.modelNumber}</p>}
        <p className="mt-2 text-[13px] text-ink-2">{spec.filter(Boolean).join("・")}</p>
        <p className="mt-auto pt-4 text-[14px] font-bold text-navy-900">{priceLabel(product)}</p>
      </div>
    </article>
  );
}
