import { Fragment } from "react";
import { reveal } from "@/lib/reveal";
import { areas } from "@/data/areas";
import { wardPrograms, type WardOrderStep } from "@/data/ward-programs";
import { KATSUSHIKA_PRE_CONSULTATION_WEEKS } from "@/data/subsidies/katsushika-details";

/**
 * 区ごとの「申請の順番」を横に並べた図。
 * 申請が工事の前に来るのか、あとに来るのかを、オレンジの印ひとつで見分けられるようにする。
 *
 * - 手順は、各区の公式ページで確かめたものだけ（葛飾区は data/subsidies、ほかの区は data/ward-programs.ts）。
 * - only を渡すと、その区と葛飾区だけを並べる（区のページで、葛飾区とのちがいを見せる）。
 * - 点線が流れる動きは回数が決まっていて、画面に入っているあいだだけ動く（RevealObserver）。
 */
const KATSUSHIKA_ORDER: WardOrderStep[] = [
  { label: "事前協議を申し込む", note: `着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前まで`, apply: true },
  { label: "回答書が届く" },
  { label: "設置工事" },
  { label: "完了報告・交付申請" },
];

function Chip({ step, index }: { step: WardOrderStep; index: number }) {
  return (
    <li
      className={`relative flex min-w-0 flex-1 flex-col justify-center rounded-2xl px-3 py-2.5 text-center sm:px-4 ${
        step.apply ? "bg-orange-500 text-navy-900 shadow-[0_8px_18px_-10px_rgba(219,117,18,0.9)]" : "border-2 border-[#e9dfcd] bg-white text-navy-900"
      }`}
      {...reveal(120 + index * 110, "pop")}
    >
      {step.apply && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-navy-900 px-2.5 py-[1px] text-[11px] font-bold whitespace-nowrap text-white">ここで申請</span>
      )}
      <span className="phrase block text-[14px] leading-[1.45] font-bold sm:text-[15px]">{step.label}</span>
      {step.note && <span className={`phrase mt-0.5 block text-[12px] leading-[1.45] ${step.apply ? "font-bold text-navy-900" : "text-ink-2"}`}>{step.note}</span>}
    </li>
  );
}

export function ApplyOrderFigure({ only, className = "" }: { only?: string; className?: string }) {
  const rows = [
    { slug: "katsushika", name: "葛飾区", order: KATSUSHIKA_ORDER, ended: "" },
    ...wardPrograms.map((w) => ({
      slug: w.slug as string,
      name: areas.find((a) => a.slug === w.slug)?.name ?? "",
      order: w.order ?? [],
      ended: w.order ? "" : w.timingLabel,
    })),
  ].filter((r) => !only || r.slug === only || r.slug === "katsushika");

  return (
    <figure className={`rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8 ${className}`}>
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">
        申請は、工事の前？ あと？<span className="ml-2 inline-block text-[13px] font-bold text-ink-2">区ごとの順番</span>
      </figcaption>
      <div className="mt-6 space-y-7">
        {rows.map((r) => (
          <div key={r.slug} className="grid gap-3 lg:grid-cols-[6.5rem_1fr] lg:items-center lg:gap-5">
            <p className="flex">
              <span className={`inline-flex items-center rounded-full px-4 py-1 text-[15px] font-black ${r.slug === only ? "bg-green-600 text-white" : "bg-white text-navy-900 shadow-card"}`}>{r.name}</span>
            </p>
            {r.order.length > 0 ? (
              <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
                {r.order.map((s, i) => (
                  <Fragment key={s.label}>
                    {i > 0 && (
                      <li className="flex items-center justify-center sm:w-7 sm:shrink-0" aria-hidden="true">
                        <span className="flow-y h-4 text-orange-400 sm:hidden" />
                        <span className="flow-x hidden w-full text-orange-400 sm:block" />
                      </li>
                    )}
                    <Chip step={s} index={i} />
                  </Fragment>
                ))}
              </ol>
            ) : (
              <p className="rounded-2xl border-2 border-dashed border-[#e2d9c8] bg-white/70 px-4 py-3 text-[14px] leading-[1.7] font-bold text-ink-2 sm:text-[15px]">{r.ended}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-[12px] leading-[1.8] text-ink-2">
        ※ 各区の公式ページで確かめた順番です。区ごとに手続きが違うので、契約の前に、お住まいの区の順番を確かめてください。
      </p>
    </figure>
  );
}
