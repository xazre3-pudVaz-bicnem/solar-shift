import { manufacturers, relationshipLabel } from "@/data/manufacturers";
import { Badge } from "@/components/ui/Badge";

/**
 * メーカー一覧。relationship が candidate の間は「取扱検討中」とだけ表示し、
 * 「正規取扱店」などの表現は出さない。
 */
export function ManufacturerList({ category }: { category?: "solar" | "battery" | "v2h" | "hems" | "hybrid" }) {
  const list = category ? manufacturers.filter((m) => m.categories.includes(category)) : manufacturers;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((m) => (
        <li key={m.id} className="border border-line bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold text-navy-900">{m.name}</h3>
            <Badge tone={m.relationship === "candidate" ? "closed" : "open"}>{relationshipLabel[m.relationship]}</Badge>
          </div>
          <p className="mt-2 text-[13px] leading-[1.7] text-ink-2">{m.summary}</p>
          <a href={m.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[12px] text-navy-600 underline underline-offset-4">
            メーカー公式サイト
          </a>
        </li>
      ))}
    </ul>
  );
}
