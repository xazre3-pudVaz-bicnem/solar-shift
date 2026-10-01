import type { SubsidyProgram } from "@/data/subsidies";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyCard } from "@/components/subsidy/SubsidyCard";
import { Callout } from "@/components/ui/Callout";
import { formatDateJa } from "@/lib/seo";

/**
 * 制度1つ分のまとまり：概要 → 一覧表 → 注意点 → メニュー詳細カード。
 * detailed=false のときは表と注意点だけ（総合ページ・TOP用）。
 */
export function SubsidyProgramSection({
  program,
  detailed = true,
  headingLevel = "h2",
}: {
  program: SubsidyProgram;
  detailed?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  return (
    <section aria-labelledby={`program-${program.id}`} className="space-y-6">
      <div>
        <p className="text-[12px] font-bold text-ink-3">{program.issuer}／{program.fiscalYear}</p>
        <H id={`program-${program.id}`} className="mt-1 text-[22px] font-bold text-navy-900 sm:text-[26px]">
          {program.programName}
        </H>
        <p className="mt-3 text-[15px] leading-[1.9] text-ink-2">{program.summary}</p>
        <p className="mt-2 text-[13px] text-ink-3">
          出典：
          <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4">
            {program.sourceName}
          </a>
          （{formatDateJa(program.lastVerified)} 確認）
        </p>
      </div>

      <SubsidyTable menus={program.menus} />

      {program.notes.length > 0 && (
        <Callout tone="warn" title="この制度の注意点">
          <ul className="list-disc space-y-1 pl-5">
            {program.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Callout>
      )}

      {detailed && (
        <div className="space-y-5">
          {program.menus.map((m) => (
            <SubsidyCard key={m.id} subsidy={m} id={m.id} />
          ))}
        </div>
      )}
    </section>
  );
}
