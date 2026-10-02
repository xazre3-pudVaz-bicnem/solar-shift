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
  /** 注意が必要な段階（朱色で強調） */
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
    <ol className={`grid gap-3 lg:grid-cols-5 lg:gap-0 ${className}`}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.title} className="relative flex lg:block" {...reveal(i * 110, "left")}>
            {/* つなぎの矢印（PC: 右向き／スマホ: 下向き） */}
            {!last && (
              <span className="absolute top-full left-7 z-10 -mt-0.5 hidden h-3 w-3 lg:top-9 lg:right-[-7px] lg:left-auto lg:mt-0 lg:block" aria-hidden="true">
                <svg className="h-4 w-4 text-navy-900" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 2l7 6-7 6z" />
                </svg>
              </span>
            )}
            <div className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 lg:mx-1.5 lg:h-full lg:flex-col lg:items-center lg:gap-2 lg:px-3 lg:text-center ${s.alert ? "bg-cta text-white shadow-pill" : "bg-white text-navy-900 shadow-card"}`}>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-en text-[18px] font-extrabold ${s.alert ? "bg-white text-cta" : "bg-orange-500 text-navy-900"}`}>{i + 1}</span>
              <div>
                <p className={`inline-block rounded-full px-2.5 py-[1px] text-[12px] font-bold ${s.alert ? "bg-white text-cta" : "bg-green-600 text-white"}`}>{s.label}</p>
                <p className={`mt-1 font-heading text-[16px] leading-[1.4] font-black ${s.alert ? "text-white" : "text-navy-900"}`}>{s.title}</p>
                {s.note && <p className={`mt-0.5 text-[13px] leading-[1.5] ${s.alert ? "text-white" : "text-ink-2"}`}>{s.note}</p>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
