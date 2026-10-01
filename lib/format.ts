/** 123456 → 123,456 */
export function yen(n: number): string {
  return `${n.toLocaleString("ja-JP")}円`;
}

/** 300000 → 30万円 / 1250000 → 125万円 / 96000 → 9.6万円 */
export function man(n: number): string {
  const v = n / 10000;
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, "");
  return `${s}万円`;
}

export function kw(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}kW`;
}

export function kwh(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)}kWh`;
}
