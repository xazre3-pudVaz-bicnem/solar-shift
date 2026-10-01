"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { simulate, type SimulationInput } from "@/lib/subsidy-calc";
import { statusLabel } from "@/data/subsidies";
import { formatDateJa } from "@/lib/seo";

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

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-12">
      {/* 入力 */}
      <form
        className="space-y-6 border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start"
        onSubmit={(e) => e.preventDefault()}
        aria-label="シミュレーションの条件"
      >
        <Field label="住所エリア">
          <select
            value={input.area}
            onChange={(e) => set("area", e.target.value as SimulationInput["area"])}
            className="h-11 w-full border border-line-2 bg-white px-3 text-[15px]"
          >
            <option value="katsushika">東京都葛飾区</option>
          </select>
          <p className="mt-1 text-[12px] text-ink-3">他の地域は順次追加予定です。</p>
        </Field>

        <Field label="住宅区分">
          <div className="grid grid-cols-2 gap-2">
            {(["existing", "new"] as const).map((h) => (
              <label key={h} className={`flex h-11 cursor-pointer items-center justify-center border text-[14px] font-bold ${input.housing === h ? "border-navy-900 bg-navy-900 text-white" : "border-line-2 bg-white text-navy-900"}`}>
                <input type="radio" name="housing" value={h} checked={input.housing === h} onChange={() => set("housing", h)} className="sr-only" />
                {h === "existing" ? "既存住宅" : "新築住宅"}
              </label>
            ))}
          </div>
        </Field>

        <Field label="太陽光発電の容量（kW）" hint="導入しない場合は 0">
          <NumberInput value={input.solarKw} onChange={(v) => set("solarKw", v)} step={0.5} max={50} unit="kW" />
        </Field>

        <Field label="蓄電池の容量（kWh）" hint="導入しない場合は 0">
          <NumberInput value={input.batteryKwh} onChange={(v) => set("batteryKwh", v)} step={0.5} max={50} unit="kWh" />
        </Field>

        {input.batteryKwh > 0 && (
          <Field label="蓄電池の助成対象経費（税抜・任意）" hint="葛飾区は対象経費の1/4で計算します。未入力なら上限額を表示します。">
            <CostInput value={batteryCost} onChange={setBatteryCost} placeholder="例：1500000" />
          </Field>
        )}

        <Field label="V2H">
          <Toggle checked={input.v2h} onChange={(v) => set("v2h", v)} label="V2Hを導入する" />
        </Field>
        {input.v2h && (
          <Field label="V2H本体価格（任意）" hint="葛飾区は本体価格の1/3で計算します。未入力なら上限額を表示します。">
            <CostInput value={v2hCost} onChange={setV2hCost} placeholder="例：600000" />
          </Field>
        )}

        <Field label="HEMS">
          <Toggle checked={input.hems} onChange={(v) => set("hems", v)} label="HEMSを導入する" />
        </Field>

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
      </form>

      {/* 結果 */}
      <div className="space-y-8" aria-live="polite">
        <div className="grid gap-4 sm:grid-cols-2">
          {result.areas.map((a) => (
            <div key={a.area} className="border border-navy-900 bg-white p-5">
              <p className="text-[13px] font-bold text-ink-3">{a.label}の想定助成額（小計）</p>
              <p className="mt-1 text-[30px] leading-none font-bold text-navy-900">
                {a.subtotal > 0 ? yen(a.subtotal) : "—"}
              </p>
              {a.hasCapOnly && <p className="mt-2 text-[12px] text-accent-text">※ 経費未入力の項目は上限額で計算しています</p>}
            </div>
          ))}
        </div>

        <p className="border-l-4 border-orange-500 bg-orange-50 px-4 py-3 text-[14px] leading-[1.8] text-ink">
          葛飾区と東京都の金額は<strong>別々に表示し、合算していません</strong>。両制度の併用可否・併用時の上限は公式情報で明記が確認できていないため、申請前に各窓口へご確認ください。
        </p>

        {result.areas.map((a) => (
          <section key={a.area} aria-labelledby={`result-${a.area}`} className="space-y-4">
            <h3 id={`result-${a.area}`} className="text-[18px] font-bold text-navy-900">
              {a.label}
            </h3>
            {a.lines.length === 0 ? (
              <p className="text-[14px] text-ink-3">この条件で計算できる制度はありません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse text-[14px]">
                  <thead>
                    <tr className="bg-paper-2 text-left">
                      <th className="border border-line px-3 py-2 font-bold">制度名</th>
                      <th className="border border-line px-3 py-2 font-bold">計算式</th>
                      <th className="border border-line px-3 py-2 font-bold">想定額</th>
                      <th className="border border-line px-3 py-2 font-bold">上限</th>
                      <th className="border border-line px-3 py-2 font-bold">状況</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.lines.map((l) => (
                      <tr key={l.subsidy.id}>
                        <td className="border border-line px-3 py-2">
                          <span className="block text-[12px] text-ink-3">{l.subsidy.programName}</span>
                          <span className="font-bold text-navy-900">{l.subsidy.name}</span>
                        </td>
                        <td className="border border-line px-3 py-2 text-[13px] text-ink-2">
                          {l.skippedReason ? <span className="text-ink-3">{l.skippedReason}</span> : l.formula}
                        </td>
                        <td className="border border-line px-3 py-2 font-bold whitespace-nowrap text-navy-900">
                          {l.amount === null ? "—" : yen(l.amount)}
                          {l.isCapOnly && <span className="ml-1 text-[11px] font-normal text-accent-text">（上限額）</span>}
                          {l.capped && !l.isCapOnly && <span className="ml-1 text-[11px] font-normal text-ink-3">（上限適用）</span>}
                        </td>
                        <td className="border border-line px-3 py-2 text-[13px]">{l.subsidy.maxAmount}</td>
                        <td className="border border-line px-3 py-2 text-[13px]">{statusLabel[l.subsidy.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <ul className="list-disc space-y-1 pl-5 text-[13px] leading-[1.8] text-ink-2">
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

        <section aria-labelledby="result-national" className="space-y-3">
          <h3 id="result-national" className="text-[18px] font-bold text-navy-900">
            国の制度（参考・自動計算の対象外）
          </h3>
          <ul className="divide-y divide-line border-y border-line text-[14px]">
            {result.reference.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="block text-[12px] text-ink-3">{s.programName}</span>
                  <span className="font-bold text-navy-900">{s.name}</span>
                  <span className="ml-2 text-ink-2">{s.amount}／{s.maxAmount}</span>
                </span>
                <span className={`text-[12px] font-bold ${s.status === "open" ? "text-navy-700" : "text-ink-3"}`}>{statusLabel[s.status]}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-ink-3">
            国の制度は公募状況が変わりやすく、受付終了中のものもあります。詳細は
            <Link href="/subsidy/national" className="mx-1 text-navy-600 underline underline-offset-4">国の補助制度ページ</Link>
            をご覧ください。
          </p>
        </section>

        <div className="border border-line bg-paper-2 p-5 text-[13px] leading-[1.8] text-ink-2">
          <p className="font-bold text-ink">この試算について</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-2 block text-[13px] font-bold text-navy-900">{label}</span>
      {children}
      {hint && <p className="mt-1 text-[12px] text-ink-3">{hint}</p>}
    </div>
  );
}

function NumberInput({ value, onChange, step, max, unit }: { value: number; onChange: (v: number) => void; step: number; max: number; unit: string }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="減らす" onClick={() => onChange(Math.max(0, Math.round((value - step) * 100) / 100))} className="h-11 w-11 border border-line-2 text-lg font-bold text-navy-900">
        −
      </button>
      <div className="relative flex-1">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(Number.isFinite(v) ? Math.min(max, Math.max(0, v)) : 0);
          }}
          className="h-11 w-full border border-line-2 bg-white px-3 pr-12 text-right text-[16px] font-bold text-navy-900"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-ink-3">{unit}</span>
      </div>
      <button type="button" aria-label="増やす" onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))} className="h-11 w-11 border border-line-2 text-lg font-bold text-navy-900">
        ＋
      </button>
    </div>
  );
}

function CostInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        placeholder={placeholder}
        className="h-11 w-full border border-line-2 bg-white px-3 pr-10 text-right text-[16px] font-bold text-navy-900 placeholder:font-normal placeholder:text-ink-3"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-ink-3">円</span>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`relative h-7 w-12 shrink-0 border transition-colors ${checked ? "border-navy-900 bg-navy-900" : "border-line-2 bg-paper-3"}`} aria-hidden="true">
        <span className={`absolute top-[3px] h-5 w-5 bg-white transition-transform ${checked ? "translate-x-[24px]" : "translate-x-[3px]"}`} />
      </span>
      <span className="text-[14px] font-bold text-navy-900">{label}</span>
    </label>
  );
}
