import type { Subsidy } from "@/data/subsidies";
import { statusLabel } from "@/data/subsidies";
import { Badge } from "@/components/ui/Badge";

/**
 * 制度内のメニューを表にする。金額・上限・事前手続き・受付状況を一覧できる。
 * データは data/subsidies からだけ受け取る。
 */
export function SubsidyTable({ menus, caption, showArea = false }: { menus: Subsidy[]; caption?: string; showArea?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-[14px]">
        {caption && <caption className="pb-2 text-left text-[13px] text-ink-3">{caption}</caption>}
        <thead>
          <tr className="bg-navy-900 text-left text-white">
            {showArea && <th className="border border-navy-800 px-3 py-2.5 font-bold">自治体</th>}
            <th className="border border-navy-800 px-3 py-2.5 font-bold">対象機器</th>
            <th className="border border-navy-800 px-3 py-2.5 font-bold">助成額</th>
            <th className="border border-navy-800 px-3 py-2.5 font-bold">上限</th>
            <th className="border border-navy-800 px-3 py-2.5 font-bold">事前手続き</th>
            <th className="border border-navy-800 px-3 py-2.5 font-bold">受付状況</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((m, i) => (
            <tr key={m.id} className={i % 2 === 1 ? "bg-paper-2" : "bg-white"}>
              {showArea && <td className="border border-line px-3 py-2.5 font-bold">{m.areaLabel}</td>}
              <th scope="row" className="border border-line px-3 py-2.5 text-left font-bold text-navy-900">
                {m.name}
              </th>
              <td className="border border-line px-3 py-2.5 whitespace-pre-line">{m.amount}</td>
              <td className="border border-line px-3 py-2.5">{m.maxAmount}</td>
              <td className="border border-line px-3 py-2.5">{m.preApplicationRequired ? "必要" : "不要"}</td>
              <td className="border border-line px-3 py-2.5">
                <Badge tone={m.status === "open" ? "open" : "closed"}>{statusLabel[m.status]}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
