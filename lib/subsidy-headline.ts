import type { Subsidy } from "@/data/subsidies";

/**
 * 補助金メニューを「大きな数字」で見せるための表示値を、計算ルール（rule）から作る。
 * 数字をページに直接書かず、必ず data/subsidies の rule から導く。
 *
 * 「最大」は上限額が制度全体の上限である場合にだけ付ける。
 * 容量区分で単価が変わる制度（東京都の太陽光）は、区分ごとの上限を「最大」と呼ぶと誤解を招くため単価を見せる。
 */
export interface Headline {
  /** 数字の前に付ける語（最大／一律 など） */
  prefix?: string;
  /** 万円単位などの数値 */
  value: number;
  decimals: number;
  unit: string;
  /** 数字の下に出す補足 */
  note: string;
}

const man = (yen: number) => yen / 10000;
const dec = (n: number) => (Number.isInteger(n) ? 0 : 1);

export function headline(s: Subsidy): Headline | null {
  const r = s.rule;
  if (!r) return null;
  switch (r.kind) {
    case "perKw":
      return r.max !== undefined
        ? { prefix: "最大", value: man(r.max), decimals: dec(man(r.max)), unit: "万円", note: `${man(r.unit)}万円/kW` }
        : { value: man(r.unit), decimals: dec(man(r.unit)), unit: "万円/kW", note: s.maxAmount };
    case "rate":
      return r.max !== undefined
        ? { prefix: "最大", value: man(r.max), decimals: dec(man(r.max)), unit: "万円", note: s.amount }
        : null;
    case "fixed":
      return s.amount.includes("一律")
        ? { prefix: "一律", value: man(r.amount), decimals: dec(man(r.amount)), unit: "万円", note: "併設する場合に加算" }
        : { value: man(r.amount), decimals: dec(man(r.amount)), unit: "万円", note: s.amount };
    case "perKwh":
      return { value: man(r.unit), decimals: dec(man(r.unit)), unit: "万円/kWh", note: s.maxAmount };
    case "tieredPerKw": {
      const [first, second] = r.tiers;
      const firstNote = first.maxKw !== null ? `${first.maxKw}kW以下` : "";
      const rest = second ? `／超は${man(second.unit)}万円/kW` : "";
      return { value: man(first.unit), decimals: dec(man(first.unit)), unit: "万円/kW", note: `${firstNote}${rest}` };
    }
  }
}
