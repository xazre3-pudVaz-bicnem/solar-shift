import type { SubsidyProgram } from "@/data/subsidies";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyCard } from "@/components/subsidy/SubsidyCard";
import { Callout } from "@/components/ui/Callout";
import { formatDateJa } from "@/lib/seo";
import { reveal } from "@/lib/reveal";

/**
 * 制度1つ分のまとまり：概要 → 一覧表 → 注意点 → メニュー詳細カード。
 * detailed=false のときは表と注意点だけ（総合ページ・TOP用）。
 */
export function SubsidyProgramSection({
  program,
  detailed = true,
  headingLevel = "h2",
  className = "",
}: {
  program: SubsidyProgram;
  detailed?: boolean;
  headingLevel?: "h2" | "h3";
  /** 単独で並べるとき（外側に cv-block の区画が無いとき）は "cv-block cv-tall" を渡す */
  className?: string;
}) {
  const H = headingLevel;
  const areaPill = program.area === "katsushika" ? "bg-orange-500 text-navy-900" : program.area === "tokyo" ? "bg-green-600 text-white" : "bg-navy-900 text-white";
  return (
    <section aria-labelledby={`program-${program.id}`} className={`space-y-6 ${className}`}>
      <div {...reveal()}>
        <p className="flex flex-wrap items-center gap-2 text-[12px] font-bold text-ink-3">
          <span className={`rounded-full px-3 py-[2px] text-[12px] font-bold ${areaPill}`}>{program.area === "katsushika" ? "葛飾区" : program.area === "tokyo" ? "東京都" : "国"}</span>
          {program.issuer}／{program.fiscalYear}
        </p>
        <H id={`program-${program.id}`} className="mt-2 text-[22px] leading-[1.4] font-black text-navy-900 sm:text-[26px]">
          {program.programName}
        </H>
        <p className="mt-3 text-base leading-[1.9] text-ink-2">{program.summary}</p>
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
          <ul className="list-disc space-y-1 pl-5 marker:text-orange-600">
            {program.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Callout>
      )}

      {detailed && (
        <div className="space-y-5">
          {program.menus.map((m) => (
            <SubsidyCard key={m.id} subsidy={m} id={m.id} collapsible />
          ))}
        </div>
      )}
    </section>
  );
}
