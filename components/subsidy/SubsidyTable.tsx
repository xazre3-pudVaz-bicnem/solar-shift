import type { Subsidy } from "@/data/subsidies";
import { statusLabel, subsidySources } from "@/data/subsidies";
import { Badge } from "@/components/ui/Badge";
import { TableScroll } from "@/components/ui/TableScroll";
import { SourceNote } from "@/components/ui/SourceNote";

/**
 * 制度内のメニューを表にする。角丸の白パネル、見出し行は緑、対象機器の列はクリーム。
 * データは data/subsidies からだけ受け取る。
 * 表の下に、載せた制度の出典を出す（金額を、その場で公式の資料と照らせるようにする）。
 * すぐ上や下に出典の行があるときは showSources={false}。
 */
export function SubsidyTable({
  menus,
  caption,
  showArea = false,
  showSources = true,
}: {
  menus: Subsidy[];
  caption?: string;
  showArea?: boolean;
  showSources?: boolean;
}) {
  return (
    <>
      <TableScroll label={caption ?? "補助金の一覧表"} bordered>
        <table className="w-full min-w-[44rem] border-collapse text-[14px]">
          {caption && <caption className="px-4 pt-3 pb-1 text-left text-[12px] text-ink-3">{caption}</caption>}
          <thead>
            <tr className="bg-green-600 text-left text-white">
              {showArea && <th className="px-3 py-3 font-bold">自治体</th>}
              <th className="px-3 py-3 font-bold">対象機器</th>
              <th className="px-3 py-3 font-bold">助成額</th>
              <th className="px-3 py-3 font-bold">上限</th>
              <th className="px-3 py-3 font-bold">事前手続き</th>
              <th className="px-3 py-3 font-bold">受付状況</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((m, i) => (
              <tr key={m.id} className={`border-t border-line ${i % 2 === 1 ? "bg-paper-2" : "bg-white"}`}>
                {showArea && <td className="px-3 py-3 font-bold text-navy-900">{m.areaLabel}</td>}
                <th scope="row" className="bg-cream/70 px-3 py-3 text-left font-bold text-navy-900">
                  {m.name}
                </th>
                <td className="px-3 py-3 font-bold whitespace-pre-line text-accent-text">{m.amount}</td>
                <td className="px-3 py-3">{m.maxAmount}</td>
                <td className="px-3 py-3">{m.preApplicationRequired ? "必要" : "不要"}</td>
                <td className="px-3 py-3">
                  <Badge tone={m.status === "open" ? "open" : "closed"}>{statusLabel[m.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      {showSources && <SourceNote sources={subsidySources(menus)} className="mt-2.5" />}
    </>
  );
}
