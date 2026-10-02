import { manufacturers, relationshipLabel } from "@/data/manufacturers";
import { Badge } from "@/components/ui/Badge";

/**
 * 取扱メーカーの一覧。
 * 取扱いの契約を確認できたメーカー（relationship が handling / authorized）だけを出す。
 * 検討中（candidate）のメーカーは、名前を出さない。「正規取扱」の表記は authorized のときだけ。
 */
export function ManufacturerList({ category }: { category?: "solar" | "battery" | "v2h" | "hems" | "hybrid" }) {
  const list = manufacturers.filter((m) => m.relationship !== "candidate" && (!category || m.categories.includes(category)));
  if (list.length === 0) return null;
  return (
    <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {list.map((m) => (
        <li key={m.id} className="bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-navy-900">{m.name}</h3>
            <Badge tone="navy">{relationshipLabel[m.relationship]}</Badge>
          </div>
          <p className="mt-2 text-[15px] leading-[1.7] text-ink-2">{m.summary}</p>
          <a href={m.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[14px] font-bold text-navy-700 underline underline-offset-4">
            メーカー公式サイト
          </a>
        </li>
      ))}
    </ul>
  );
}
