import { TableScroll } from "@/components/ui/TableScroll";
import Link from "next/link";
import type { Product } from "@/data/products";
import { priceLabel } from "@/data/products";

/** 同カテゴリ商品の比較表。商品が2件未満なら何も出さない。 */
export function ProductComparison({ products, category }: { products: Product[]; category: "solar" | "battery" }) {
  if (products.length < 2) return null;
  const cols =
    category === "solar"
      ? [
          { label: "公称最大出力", get: (p: Product) => (p.ratedOutputW ? `${p.ratedOutputW}W` : "—") },
          { label: "変換効率", get: (p: Product) => (p.efficiencyPct ? `${p.efficiencyPct}%` : "—") },
          { label: "サイズ", get: (p: Product) => p.size ?? "—" },
          { label: "保証", get: (p: Product) => p.warranty ?? "—" },
        ]
      : [
          { label: "蓄電容量", get: (p: Product) => (p.capacityKwh ? `${p.capacityKwh}kWh` : "—") },
          { label: "定格出力", get: (p: Product) => (p.ratedPowerKw ? `${p.ratedPowerKw}kW` : "—") },
          { label: "負荷タイプ", get: (p: Product) => p.loadType ?? "—" },
          { label: "設置場所", get: (p: Product) => p.installation ?? "—" },
          { label: "保証", get: (p: Product) => p.warranty ?? "—" },
        ];
  return (
    <TableScroll label="商品の比較表">
      <table className="w-full min-w-[40rem] border-collapse text-[14px]">
        <thead>
          <tr className="bg-navy-900 text-white">
            <th className="border border-line px-3 py-2 text-left font-bold">商品</th>
            {cols.map((c) => (
              <th key={c.label} className="border border-line px-3 py-2 text-left font-bold">{c.label}</th>
            ))}
            <th className="border border-line px-3 py-2 text-left font-bold">価格</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug}>
              <td className="border border-line px-3 py-2">
                <Link href={`/products/${p.slug}`} className="font-bold text-navy-600 underline underline-offset-4">
                  {p.manufacturer} {p.name}
                </Link>
              </td>
              {cols.map((c) => (
                <td key={c.label} className="border border-line px-3 py-2">{c.get(p)}</td>
              ))}
              <td className="border border-line px-3 py-2">{priceLabel(p)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}
