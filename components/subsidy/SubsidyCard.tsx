import type { Subsidy } from "@/data/subsidies";
import { statusLabel } from "@/data/subsidies";
import { Badge } from "@/components/ui/Badge";
import { formatDateJa } from "@/lib/seo";

/**
 * 1メニューの詳細カード。対象者・金額・申請時期・条件・注意点・出典・確認日を構造化して出す。
 * AI検索から引用されやすいよう、項目名を明示した dl にする。
 */
export function SubsidyCard({ subsidy, id }: { subsidy: Subsidy; id?: string }) {
  const s = subsidy;
  return (
    <article id={id} className="overflow-hidden rounded-3xl bg-white shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-cream px-5 py-4">
        <div>
          <p className="text-[12px] font-bold text-ink-3">{s.areaLabel}／{s.programName}／{s.fiscalYear}</p>
          <h3 className="mt-1 text-[18px] font-bold text-navy-900">{s.name}</h3>
        </div>
        <Badge tone={s.status === "open" ? "open" : "closed"}>{statusLabel[s.status]}</Badge>
      </header>
      <dl className="divide-y divide-line px-5">
        <Row term="助成額">
          <span className="text-[17px] font-bold text-navy-900">{s.amount}</span>
          <span className="ml-3 text-[14px] text-ink-2">{s.maxAmount}</span>
        </Row>
        <Row term="対象者・対象住宅">{s.target}</Row>
        <Row term="申請期間">{s.applicationPeriod}</Row>
        <Row term="締切">{s.deadline}</Row>
        <Row term="事前手続き">
          {s.preApplicationRequired ? (
            <>
              <span className="font-bold text-accent-text">必要</span>
              {s.preApplicationNote && <span className="ml-2">{s.preApplicationNote}</span>}
            </>
          ) : (
            "不要"
          )}
        </Row>
        {s.conditions.length > 0 && (
          <Row term="主な条件">
            <ul className="list-disc space-y-1 pl-5">
              {s.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Row>
        )}
        {s.notes.length > 0 && (
          <Row term="注意点">
            <ul className="list-disc space-y-1 pl-5">
              {s.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Row>
        )}
        {s.contact && (
          <Row term="問い合わせ窓口">
            {s.contact.name}
            {s.contact.tel && <span className="ml-2">TEL {s.contact.tel}</span>}
            {s.contact.hours && <span className="ml-2 text-ink-3">（{s.contact.hours}）</span>}
          </Row>
        )}
        <Row term="出典・確認日">
          <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
            {s.sourceName}
          </a>
          <span className="ml-2 text-[13px] text-ink-3">（{formatDateJa(s.lastVerified)} 確認）</span>
        </Row>
      </dl>
    </article>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
      <dt className="text-[13px] font-bold text-ink-3">{term}</dt>
      <dd className="text-[14px] leading-[1.8] text-ink">{children}</dd>
    </div>
  );
}
