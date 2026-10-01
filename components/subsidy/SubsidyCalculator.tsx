"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { simulate, type SimulationInput } from "@/lib/subsidy-calc";
import { statusLabel } from "@/data/subsidies";
import { images } from "@/data/images";
import { formatDateJa } from "@/lib/seo";
import { SubsidyBars } from "@/components/subsidy/SubsidyBars";
import { TableScroll } from "@/components/ui/TableScroll";

/**
 * 補助金簡易シミュレーター（client）。
 * 計算は lib/subsidy-calc.ts（純関数）に委ね、ここでは入力と表示だけを扱う。
 * 自治体をまたいだ合算は行わない。
 */

const DEFAULT: SimulationInput = {
  area: "katsushika",
  housing: "existing",
  solarKw: 5,
  batteryKwh: 7,
  v2h: false,
  hems: false,
};

function yen(n: number) {
  return `${n.toLocaleString("ja-JP")}円`;
}

export function SubsidyCalculator({ infoDate }: { infoDate: string }) {
  const [input, setInput] = useState<SimulationInput>(DEFAULT);
  const [batteryCost, setBatteryCost] = useState<string>("");
  const [v2hCost, setV2hCost] = useState<string>("");

  const result = useMemo(() => {
    const bc = Number(batteryCost.replace(/[^\d]/g, ""));
    const vc = Number(v2hCost.replace(/[^\d]/g, ""));
    return simulate({
      ...input,
      batteryCost: bc > 0 ? bc : undefined,
      v2hCost: vc > 0 ? vc : undefined,
    });
  }, [input, batteryCost, v2hCost]);

  const set = <K extends keyof SimulationInput>(k: K, v: SimulationInput[K]) => setInput((s) => ({ ...s, [k]: v }));
  const hasCapOnly = result.areas.some((a) => a.hasCapOnly);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[23rem_minmax(0,1fr)] lg:gap-10">
      {/* 入力 */}
      <form className="relative min-w-0 rounded-3xl border-[3px] border-orange-300 bg-white shadow-card lg:sticky lg:top-24 lg:self-start" onSubmit={(e) => e.preventDefault()} aria-label="シミュレーションの条件">
        <p className="absolute inset-x-0 -top-[1.15rem] z-[1] flex justify-center">
          <span className="rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[15px] font-bold text-navy-900 shadow-sm">条件を選んでください</span>
        </p>
        <div className="space-y-6 p-5 pt-8 sm:p-6 sm:pt-9 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain">

        <Field step={1} label="住所エリア">
          <select
            aria-label="住所エリア"
            value={input.area}
            onChange={(e) => set("area", e.target.value as SimulationInput["area"])}
            className="h-12 w-full rounded-xl border-2 border-line-2 bg-white px-3 text-[16px] font-bold text-navy-900"
          >
            <option value="katsushika">東京都葛飾区</option>
          </select>
          <p className="mt-1 text-[12px] text-ink-3">他の地域は順次追加予定です。</p>
        </Field>

        <Field step={2} label="住宅区分">
          <div className="grid grid-cols-2 gap-2">
            {(["existing", "new"] as const).map((h) => (
              <label
                key={h}
                className={`relative flex h-12 cursor-pointer items-center justify-center rounded-xl border-2 font-heading text-[15px] font-bold transition-colors ${
                  input.housing === h ? "border-green-600 bg-green-600 text-white" : "border-line-2 bg-white text-navy-900 hover:border-green-400"
                }`}
              >
                <input type="radio" name="housing" value={h} checked={input.housing === h} onChange={() => set("housing", h)} className="sr-only" />
                {h === "existing" ? "既存住宅" : "新築住宅"}
              </label>
            ))}
          </div>
        </Field>

        <Field step={3} label="太陽光発電の容量" hint="導入しない場合は 0">
          <NumberInput value={input.solarKw} onChange={(v) => set("solarKw", v)} step={0.5} max={50} unit="kW" label="太陽光発電の容量" />
        </Field>

        <Field step={4} label="蓄電池の容量" hint="導入しない場合は 0">
          <NumberInput value={input.batteryKwh} onChange={(v) => set("batteryKwh", v)} step={0.5} max={50} unit="kWh" label="蓄電池の容量" />
        </Field>

        {input.batteryKwh > 0 && (
          <Field label="蓄電池の助成対象経費（税抜・任意）" hint="葛飾区は対象経費の1/4で計算します。未入力なら上限額を表示します。">
            <CostInput value={batteryCost} onChange={setBatteryCost} placeholder="例：1500000" label="蓄電池の助成対象経費" />
          </Field>
        )}

        <Field step={5} label="V2H・HEMS">
          <div className="space-y-3">
            <Toggle checked={input.v2h} onChange={(v) => set("v2h", v)} label="V2Hを導入する" />
            <Toggle checked={input.hems} onChange={(v) => set("hems", v)} label="HEMSを導入する" />
          </div>
        </Field>
        {input.v2h && (
          <Field label="V2H本体価格（任意）" hint="葛飾区は本体価格の1/3で計算します。未入力なら上限額を表示します。">
            <CostInput value={v2hCost} onChange={setV2hCost} placeholder="例：600000" label="V2H本体価格" />
          </Field>
        )}

        <button
          type="button"
          onClick={() => {
            setInput(DEFAULT);
            setBatteryCost("");
            setV2hCost("");
          }}
          className="text-[13px] text-ink-3 underline underline-offset-4"
        >
          条件をリセット
        </button>
        </div>
      </form>

      {/* 結果 */}
      <div className="min-w-0 space-y-8" aria-live="polite">
        <div className="flex items-end gap-3">
          <Image src={images.poseCalc.src} alt="" width={images.poseCalc.width} height={images.poseCalc.height} sizes="96px" className="h-auto w-20 shrink-0 sm:w-24" />
          <p className="relative mb-3 flex-1 rounded-2xl border-2 border-green-500 bg-white px-4 py-3 font-heading text-[15px] leading-[1.6] font-bold text-navy-900 shadow-card sm:text-[17px]">
            <span className="absolute bottom-5 -left-[9px] h-4 w-4 rotate-45 border-2 border-t-0 border-r-0 border-green-500 bg-white" aria-hidden="true" />
            この条件での<span className="marker">想定助成額</span>はこちらです
          </p>
        </div>

        <SubsidyBars result={result} caption={hasCapOnly ? "※ 経費を入力していない項目（葛飾区の蓄電池・V2H）は上限額で計算しています。" : undefined} />

        <p className="rounded-2xl border-l-8 border-orange-500 bg-orange-50 px-4 py-3 text-[14px] leading-[1.8] text-ink">
          葛飾区と東京都の金額は<strong>別々に表示し、合算していません</strong>。両制度の併用可否・併用時の上限は公式情報で明記が確認できていないため、申請前に各窓口へご確認ください。
        </p>

        {result.areas.map((a, ai) => (
          <section key={a.area} aria-labelledby={`result-${a.area}`} className="cv-block space-y-4">
            <h2 id={`result-${a.area}`} className="flex items-center gap-3 text-[20px] font-black text-navy-900">
              <span className={`shrink-0 rounded-full px-4 py-1 text-[15px] whitespace-nowrap ${ai === 0 ? "bg-orange-500 text-navy-900" : "bg-green-600 text-white"}`}>{a.label}</span>
              の内訳
            </h2>
            {a.lines.length === 0 ? (
              <p className="rounded-2xl bg-beige px-4 py-3 text-[14px] text-ink-2">この条件で計算できる制度はありません。</p>
            ) : (
              <TableScroll label={`${a.label}の内訳`}>
                <table className="w-full min-w-[40rem] border-collapse text-[14px]">
                  <thead>
                    <tr className={`text-left ${ai === 0 ? "bg-orange-500 text-navy-900" : "bg-green-600 text-white"}`}>
                      <th className="px-3 py-2.5 font-bold">制度名</th>
                      <th className="px-3 py-2.5 font-bold">計算式</th>
                      <th className="px-3 py-2.5 font-bold">想定額</th>
                      <th className="px-3 py-2.5 font-bold">上限</th>
                      <th className="px-3 py-2.5 font-bold">状況</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.lines.map((l) => (
                      <tr key={l.subsidy.id} className="border-t border-line">
                        <td className="px-3 py-2.5">
                          <span className="block text-[12px] text-ink-3">{l.subsidy.programName}</span>
                          <span className="font-bold text-navy-900">{l.subsidy.name}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[13px] text-ink-2">{l.skippedReason ? <span className="text-ink-3">{l.skippedReason}</span> : l.formula}</td>
                        <td className="px-3 py-2.5 font-heading text-[16px] font-black whitespace-nowrap text-navy-900">
                          {l.amount === null ? "—" : yen(l.amount)}
                          {l.isCapOnly && <span className="ml-1 text-[11px] font-bold text-accent-text">（上限額）</span>}
                          {l.capped && !l.isCapOnly && <span className="ml-1 text-[11px] font-normal text-ink-3">（上限適用）</span>}
                        </td>
                        <td className="px-3 py-2.5 text-[13px]">{l.subsidy.maxAmount}</td>
                        <td className="px-3 py-2.5 text-[13px]">{statusLabel[l.subsidy.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            )}
            <ul className="list-disc space-y-1 pl-5 text-[13px] leading-[1.8] text-ink-2 marker:text-orange-600">
              {a.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
              {a.lines
                .flatMap((l) => l.subsidy.notes.map((n) => `${l.subsidy.name}：${n}`))
                .map((n) => (
                  <li key={n}>{n}</li>
                ))}
            </ul>
            <p className="text-[12px] text-ink-3">
              出典：
              {Array.from(new Set(a.lines.map((l) => l.subsidy.sourceUrl))).map((url) => {
                const s = a.lines.find((l) => l.subsidy.sourceUrl === url)!.subsidy;
                return (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="mr-3 text-navy-600 underline underline-offset-4">
                    {s.sourceName}（{formatDateJa(s.lastVerified)}確認）
                  </a>
                );
              })}
            </p>
          </section>
        ))}

        <section aria-labelledby="result-national" className="cv-block space-y-3">
          <h2 id="result-national" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[20px] font-black text-navy-900">
            <span className="shrink-0 rounded-full bg-navy-900 px-4 py-1 text-[15px] whitespace-nowrap text-white">国</span>
            の制度（参考・自動計算の対象外）
          </h2>
          <ul className="divide-y divide-line rounded-2xl bg-white px-4 text-[14px] shadow-card">
            {result.reference.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="block text-[12px] text-ink-3">{s.programName}</span>
                  <span className="font-bold text-navy-900">{s.name}</span>
                  <span className="ml-2 text-ink-2">
                    {s.amount}／{s.maxAmount}
                  </span>
                </span>
                <span className={`rounded-full px-3 py-[2px] text-[12px] font-bold ${s.status === "open" ? "bg-green-600 text-white" : "bg-paper-3 text-ink-3"}`}>{statusLabel[s.status]}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-ink-3">
            国の制度は公募状況が変わりやすく、受付終了中のものもあります。詳細は
            <Link href="/subsidy/national" className="mx-1 text-navy-600 underline underline-offset-4">
              国の補助制度ページ
            </Link>
            をご覧ください。
          </p>
        </section>

        <div className="rounded-3xl bg-beige p-5 text-[13px] leading-[1.8] text-ink-2">
          <p className="font-bold text-ink">この試算について</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-orange-600">
            <li>{formatDateJa(infoDate)}時点の公式情報をもとにした概算です。実際の対象可否・助成額は住宅条件、機器、申請時期等で異なります。</li>
            <li>法律・制度上、併用の可否が確認できない組み合わせは自動的に合算していません。</li>
            <li>予算の消化状況により、年度途中で受付が終了する場合があります。</li>
            <li>この試算は交付を保証するものではありません。最新情報は必ず各自治体の公式サイトでご確認ください。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, step, children }: { label: string; hint?: string; step?: number; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-2 flex items-center gap-2 font-heading text-[15px] font-bold text-navy-900">
        {step && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 font-en text-[12px] text-white">{step}</span>}
        {label}
      </span>
      {children}
      {hint && <p className="mt-1 text-[12px] text-ink-3">{hint}</p>}
    </div>
  );
}

function NumberInput({ value, onChange, step, max, unit, label }: { value: number; onChange: (v: number) => void; step: number; max: number; unit: string; label: string }) {
  const btn = "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[22px] font-bold text-navy-900 transition-transform hover:scale-105 active:scale-95";
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`${label}を減らす`} onClick={() => onChange(Math.max(0, Math.round((value - step) * 100) / 100))} className={btn}>
        −
      </button>
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="decimal"
          aria-label={label}
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(Number.isFinite(v) ? Math.min(max, Math.max(0, v)) : 0);
          }}
          className="num-xl h-12 w-full rounded-xl border-2 border-line-2 bg-white px-3 pr-14 text-right text-[24px] text-navy-900"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px] font-bold text-ink-3">{unit}</span>
      </div>
      <button type="button" aria-label={`${label}を増やす`} onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))} className={btn}>
        ＋
      </button>
    </div>
  );
}

function CostInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border-2 border-line-2 bg-white px-3 pr-10 text-right text-[16px] font-bold text-navy-900 placeholder:font-normal placeholder:text-ink-3"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px] font-bold text-ink-3">円</span>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="relative flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy-600 ${checked ? "bg-green-600" : "bg-line-2"}`}
        aria-hidden="true"
      >
        <span className={`absolute top-[3px] left-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </span>
      <span className="text-[15px] font-bold text-navy-900">{label}</span>
    </label>
  );
}
