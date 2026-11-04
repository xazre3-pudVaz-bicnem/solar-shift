/**
 * キーワードの受け持ち表（data/seo/keyword-map.ts）を使う関数：取り合い（カニバリ）の判定・主キーワードの重複の検出など。
 * 表そのものは data/seo/keyword-map.ts にある。
 *
 * このファイルは Node のスクリプト（tsx）からも読むので、"@/…" の別名や fs は使わない。
 */
import { SEO_MAP, type SeoEntry } from "../data/seo/keyword-map";

export { SEO_MAP, type SeoEntry };

export function getSeoEntry(path: string): SeoEntry | undefined {
  return SEO_MAP.find((e) => e.path === path);
}

/** 検索結果に出さないと決めている固定ページ（noindex・sitemap 対象外） */
export function isHeldBack(path: string): boolean {
  return SEO_MAP.some((e) => e.path === path && !e.index);
}

function tokens(s: string): string[] {
  return String(s)
    .replace(/[　]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** バイグラムの Dice 係数（記号・空白を除く） */
function dice(a: string, b: string): number {
  const grams = (s: string) => {
    const t = String(s).replace(/[\s　「」『』（）()・、。！？!?｜|：:【】]/g, "");
    const out = new Set<string>();
    for (let i = 0; i < t.length - 1; i += 1) out.add(t.slice(i, i + 2));
    return out;
  };
  const A = grams(a);
  const B = grams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let hit = 0;
  for (const g of A) if (B.has(g)) hit += 1;
  return (2 * hit) / (A.size + B.size);
}

export interface CannibalHit {
  path: string;
  keyword: string;
  reason: string;
}

/**
 * 記事の検索意図（スペース区切りのキーワード）が、固定ページのキーワードと取り合いにならないかを調べる。
 *
 * 取り合いとみなす条件（どちらか）
 *   A. 固定ページのキーワードの語を全部含み、記事側の追加の語が1つ以下
 *      例：固定「葛飾区 太陽光 補助金」 × 記事「葛飾区 太陽光 補助金」→ 取り合い
 *          固定「葛飾区 太陽光 業者」   × 記事「葛飾区 太陽光 業者 選び方」→ 取り合い（追加1語では絞れていない）
 *          固定「葛飾区 太陽光 補助金」 × 記事「葛飾区 太陽光 補助金 年度末 申請 間に合う」→ ロングテールなので可
 *   B. 文字の並びがほぼ同じ（Dice 係数 0.8 以上）
 *
 * 「よくある質問」のような一般語だけのキーワードで誤検知しないよう、SOLAR SHIFT を含むキーワードと
 * 1語だけのキーワードは対象から外す。
 */
export function findCannibalPage(intent: string): CannibalHit | null {
  const it = tokens(intent);
  if (it.length === 0) return null;
  for (const e of SEO_MAP) {
    for (const kw of [e.primary, ...e.secondary]) {
      if (kw.includes("SOLAR SHIFT")) continue;
      const kt = tokens(kw);
      if (kt.length < 2) continue;
      const contains = kt.every((k) => it.some((t) => t === k || t.includes(k)));
      if (contains) {
        const extra = it.filter((t) => !kt.some((k) => t === k || t.includes(k))).length;
        if (extra <= 1) return { path: e.path, keyword: kw, reason: `固定ページ ${e.path} のキーワード「${kw}」とほぼ同じ検索意図です（追加の語が${extra}つ）` };
      }
      if (dice(intent, kw) >= 0.8) return { path: e.path, keyword: kw, reason: `固定ページ ${e.path} のキーワード「${kw}」と文字の並びがほぼ同じです` };
    }
  }
  return null;
}

/** 主キーワードの重複（マップ自体の誤り）を返す。空なら問題なし */
export function duplicatedPrimaries(): string[] {
  const seen = new Map<string, string>();
  const out: string[] = [];
  for (const e of SEO_MAP) {
    for (const kw of [e.primary, ...e.secondary]) {
      const key = tokens(kw).sort().join(" ");
      const prev = seen.get(key);
      if (prev && prev !== e.path) out.push(`「${kw}」が ${prev} と ${e.path} で重複`);
      else seen.set(key, e.path);
    }
  }
  return out;
}
