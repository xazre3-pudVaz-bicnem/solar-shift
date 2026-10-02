import { KATSUSHIKA_REPORT_DEADLINE } from "@/data/subsidies/katsushika-details";
import { reveal } from "@/lib/reveal";

/**
 * 申請の時系列を横に並べた図（スマホでは縦）。
 * 「着工の4週間前までに事前協議」→「回答書」→「着工」→「完了報告」→「交付」の順番を一目で伝える。
 * 文言は葛飾区の公式案内にある手順の範囲で書く。
 * 日数は、区が案内している目安（申込受付から回答書の到着まで3〜4週間程度）と期限だけを使う。
 */
export interface TimelineStep {
  label: string;
  title: string;
  note?: string;
  /** 注意が必要な段階（オレンジの枠で強調） */
  alert?: boolean;
}

export const KATSUSHIKA_TIMELINE: TimelineStep[] = [
  { label: "着工の4週間前まで", title: "事前協議を申し込む", note: "見積書・カタログなどを添えて区へ", alert: true },
  { label: "申込から3〜4週間程度", title: "回答書が届く", note: "区から郵送されます" },
  { label: "回答書の到着後", title: "工事を始める", note: "届く前の着工は対象外", alert: true },
  { label: "工事のあと", title: "完了報告・交付申請", note: "最終期限は" + KATSUSHIKA_REPORT_DEADLINE },
  { label: "審査のあと", title: "助成金の交付", note: "交付額確定の通知後" },
];

export function ApplicationTimeline({ steps = KATSUSHIKA_TIMELINE, className = "" }: { steps?: TimelineStep[]; className?: string }) {
  return (
    <ol className={`grid gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-5 ${className}`} {...reveal()}>
      {steps.map((s, i) => (
        <li key={s.title} className={`flex items-start gap-4 px-4 py-4 lg:flex-col lg:gap-2 lg:px-4 lg:py-5 ${s.alert ? "bg-orange-50" : "bg-white"}`}>
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-en text-[15px] font-extrabold ${s.alert ? "bg-orange-500 text-navy-950" : "bg-navy-900 text-white"}`}>{i + 1}</span>
          <div className="min-w-0">
            <p className={`text-[13px] font-bold ${s.alert ? "text-accent-text" : "text-ink-2"}`}>{s.label}</p>
            <p className="mt-0.5 font-heading text-[16px] leading-[1.45] font-black text-navy-900">{s.title}</p>
            {s.note && <p className="mt-1 text-[13px] leading-[1.6] text-ink-2">{s.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
