/**
 * 記事の「主張（claim）」と「出典（source）」を突き合わせる仕組み。
 *
 * 記事に出てくる数値・日付は、すべて次の形で管理する（記事ファイルの frontmatter の claims に残る。画面には出さない）。
 *
 *   claim      … その数値を含む文
 *   source     … 根拠にした一次情報の URL（docs/VERIFIED_FACTS.md のどの節に書かれているか、から決まる）
 *   sourceType … 資料の種類（自治体／東京都／国／SII／メーカー／業界団体）
 *   verified   … 数値が、その出典の節に実際に書かれていれば true
 *
 * 根拠の正本は docs/VERIFIED_FACTS.md。節ごとに「出典：」の行があり、その節の箇条書きに出てくる数値だけが、
 * その出典で「確認済み」になる。出典の無い節・事実シートに無い数値は verified にならず、記事は公開されない。
 *
 * 資料の優先順（上ほど強い）：国・自治体 ＞ SII などの執行団体 ＞ メーカー公式 ＞ 業界団体
 */

export type SourceType = "municipality" | "tokyo" | "national" | "sii" | "manufacturer" | "industry";

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  municipality: "自治体",
  tokyo: "東京都",
  national: "国",
  sii: "SII",
  manufacturer: "メーカー",
  industry: "業界団体",
};

/** URL から資料の種類を決める。一覧に無いドメインは null（根拠として使えない） */
export function sourceTypeOf(url: string): SourceType | null {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  if (host.endsWith("city.katsushika.lg.jp")) return "municipality";
  if (host.endsWith("tokyo-co2down.jp") || host.endsWith("kuroco-img.app") || host.endsWith("metro.tokyo.lg.jp")) return "tokyo";
  if (host.endsWith("sii.or.jp") || host.endsWith("zehweb.jp")) return "sii";
  if (host.endsWith(".go.jp") || host.endsWith("cev-pc.or.jp")) return "national";
  if (host.endsWith("jpea.gr.jp") || host.endsWith("jema-net.or.jp")) return "industry";
  return null;
}

// ─────────────────────────────────────────────────────────────── 事実シートの読み込み

export interface FactSection {
  heading: string;
  /** その節の「出典：」行にある URL */
  sources: string[];
  bullets: { text: string; sources: string[] }[];
}

const URL_RE = /https?:\/\/[^\s)）」』]+/g;

/** docs/VERIFIED_FACTS.md を節ごとに分ける */
export function parseFacts(md: string): FactSection[] {
  const sections: FactSection[] = [];
  let cur: FactSection | null = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    const h = line.match(/^#{2,3}\s+(.+)$/);
    if (h) {
      cur = { heading: h[1], sources: [], bullets: [] };
      sections.push(cur);
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("出典")) {
      cur.sources.push(...(line.match(URL_RE) ?? []));
      continue;
    }
    if (line.startsWith("- ")) {
      const own = line.match(URL_RE) ?? [];
      cur.bullets.push({ text: line.slice(2), sources: own });
    }
  }
  // 「出典：」行に URL が無く、箇条書きに URL がある節（地域情報など）は、節内の URL をその節の出典にする
  for (const s of sections) {
    if (s.sources.length === 0) s.sources = [...new Set(s.bullets.flatMap((b) => b.sources))];
  }
  return sections;
}

// ─────────────────────────────────────────────────────────────── 数値の取り出し

/** 全角数字・全角記号を半角にそろえ、数字の中のカンマを取る */
export function normalizeDigits(text: string): string {
  return String(text)
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[．]/g, ".")
    .replace(/[，]/g, ",")
    .replace(/[／]/g, "/")
    .replace(/[％]/g, "%")
    .replace(/(\d),(?=\d{3})/g, "$1");
}

export interface NumToken {
  /** 照合に使う正規化した表記（例：「4週間」「R:3-4週間」「D:2027-03-31」） */
  key: string;
  /** 記事中の元の表記 */
  raw: string;
  kind: "date" | "quantity" | "range" | "fraction" | "frequency";
}

/** 検査する単位。ここに無い単位（つ・点・項目・ステップ など）は、数え上げなので検査しない */
const UNITS = [
  "億円", "万円", "円",
  "kWh", "kW", "MW", "W", "V", "A",
  "年間", "年度", "年", "か月", "ヶ月", "カ月", "ヵ月", "週間", "日間", "日", "時間",
  "万世帯", "世帯", "万人", "人",
  "か所", "ヶ所", "カ所", "箇所", "件", "棟", "戸", "台", "枚", "社",
  "㎡", "m2", "平米", "坪", "cm", "mm", "kg", "℃", "度", "倍", "割", "サイクル",
];
const UNIT_ALT = UNITS.map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

function canonUnit(u: string): string {
  if (u === "年間" || u === "年度") return "年";
  if (u === "ヶ月" || u === "カ月" || u === "ヵ月") return "か月";
  if (u === "ヶ所" || u === "カ所" || u === "箇所") return "か所";
  if (u === "日間") return "日";
  if (u === "m2" || u === "平米") return "㎡";
  return u;
}

/**
 * 本文から、検査の対象になる数値を取り出す。
 * 金額（円・万円）と単価（円/kW など）は validate.ts の金額ゲートが別に検査するので、ここでは取り出さない。
 */
export function extractNumTokens(input: string): NumToken[] {
  let text = normalizeDigits(input)
    // Markdown のリンク先・URL に含まれる数字は対象外
    .replace(/\]\([^)]*\)/g, "]")
    .replace(URL_RE, " ")
    // 「V2H」「CO2」の数字は名前の一部（数量ではない）
    .replace(/V2H|CO2/g, "〓");
  const out: NumToken[] = [];
  const take = (re: RegExp, fn: (m: RegExpMatchArray) => NumToken | null) => {
    text = text.replace(re, (...args) => {
      const m = args.slice(0, -2) as unknown as RegExpMatchArray;
      const t = fn(m);
      if (t) out.push(t);
      return " ".repeat(String(args[0]).length);
    });
  };
  const pad = (n: string) => n.padStart(2, "0");

  // 和暦（令和8年度・令和9年3月31日）
  take(/令和\s*(\d{1,2})\s*年度?(?:\s*(\d{1,2})\s*月(?:\s*(\d{1,2})\s*日)?)?/g, (m) => {
    const y = 2018 + Number(m[1]);
    if (m[2] && m[3]) return { key: `D:${y}-${pad(m[2])}-${pad(m[3])}`, raw: m[0], kind: "date" };
    if (m[2]) return { key: `YM:${y}-${pad(m[2])}`, raw: m[0], kind: "date" };
    return { key: `Y:${y}`, raw: m[0], kind: "date" };
  });
  // 西暦の日付
  take(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g, (m) => ({ key: `D:${m[1]}-${pad(m[2])}-${pad(m[3])}`, raw: m[0], kind: "date" }));
  take(/(\d{4})\s*年\s*(\d{1,2})\s*月/g, (m) => ({ key: `YM:${m[1]}-${pad(m[2])}`, raw: m[0], kind: "date" }));
  take(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/g, (m) => ({ key: `MD:${pad(m[1])}-${pad(m[2])}`, raw: m[0], kind: "date" }));
  // 「2027年3/31」「7/17〜9/30」「3/31必着」のように、日付だと分かる文脈のスラッシュだけを日付として扱う
  // （文脈の無い「1/4」は分数。下の分数の規則が拾う）
  take(/(\d{4})\s*年\s*(\d{1,2})\/(\d{1,2})/g, (m) => ({ key: `D:${m[1]}-${pad(m[2])}-${pad(m[3])}`, raw: m[0], kind: "date" }));
  take(/(\d{1,2})\/(\d{1,2})(?=\s*(?:[〜～~]|必着|まで|から|以降|時点))/g, (m) => (Number(m[1]) <= 12 && Number(m[2]) <= 31 ? { key: `MD:${pad(m[1])}-${pad(m[2])}`, raw: m[0], kind: "date" } : null));
  take(/(?<=[〜～~]\s*)(\d{1,2})\/(\d{1,2})(?!\s*\d)/g, (m) => (Number(m[1]) <= 12 && Number(m[2]) <= 31 ? { key: `MD:${pad(m[1])}-${pad(m[2])}`, raw: m[0], kind: "date" } : null));
  take(/(20\d{2})\s*年(?:度|間)?(?![\d])/g, (m) => ({ key: `Y:${m[1]}`, raw: m[0], kind: "date" }));
  // 月だけの表記（「10月から」「12月〜2月」）は、季節の話などにも使うので検査しない（消すだけ）
  take(/(?<!\d)(\d{1,2})\s*月(?!\s*\d)/g, () => null);

  // 「4年に1度」「年に1回」のような頻度
  take(/(\d+)\s*年に\s*(\d+)\s*(度|回)/g, (m) => ({ key: `FQ:${m[1]}年に${m[2]}回`, raw: m[0], kind: "frequency" }));

  // 単価（円/kW・万円/kWh・円/戸 など）は金額ゲートの担当なので、ここでは消すだけ
  take(new RegExp(`\\d+(?:\\.\\d+)?\\s*万?円\\s*\\/\\s*(?:kWh|kW|戸|台|申請|1台)`, "g"), () => null);
  // 金額（万円・円・億円）も金額ゲートの担当
  take(/\d+(?:\.\d+)?\s*(?:億|万)?円/g, () => null);

  // 分数（1/4・1/3・3/10）
  take(/(?<![\d.])(\d{1,2})\s*\/\s*(\d{1,2})(?![\d])/g, (m) => (Number(m[1]) < Number(m[2]) && Number(m[2]) <= 10 ? { key: `F:${m[1]}/${m[2]}`, raw: m[0], kind: "fraction" } : null));
  take(/(\d{1,2})\s*分の\s*(\d{1,2})/g, (m) => ({ key: `F:${m[2]}/${m[1]}`, raw: m[0], kind: "fraction" }));

  // 範囲（3〜4週間・10〜15年・5〜10年目）
  take(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*[〜～~\\-－]\\s*(\\d+(?:\\.\\d+)?)\\s*(${UNIT_ALT})`, "g"), (m) => ({ key: `R:${m[1]}-${m[2]}${canonUnit(m[3])}`, raw: m[0], kind: "range" }));
  // 単独の数量（4週間・3.75kW・20年・447か所）
  take(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${UNIT_ALT})`, "g"), (m) => ({ key: `${m[1]}${canonUnit(m[2])}`, raw: m[0], kind: "quantity" }));
  // パーセントは validate.ts が一律に禁止しているので、ここでは取り出さない

  return out;
}

/**
 * 根拠が無くても書いてよい数量（主張ではなく、言い回し・例として置く値）。
 *   - 「1日」「1年」「1台」「1枚あたり」のような、単位あたりの言い方
 *   - 計算例として置く容量：太陽光 1〜20kW、蓄電池 1〜30kWh（0.5 刻み）。金額のほうは金額ゲートが検査する
 */
export function isNeutralQuantity(key: string, allowRange = false): boolean {
  // 範囲（R:3-6kW）は、見出しなどで計算例の幅を示すときだけ（固定ページの点検用）。
  // 記事の検査では認めない（「3〜6kWが多い」のような、相場の言い方に使われやすいため）
  const r = key.match(/^R:(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)(.+)$/);
  if (r) return allowRange && isNeutralQuantity(`${r[1]}${r[3]}`) && isNeutralQuantity(`${r[2]}${r[3]}`);
  const m = key.match(/^(\d+(?:\.\d+)?)(.+)$/);
  if (!m) return false;
  const n = Number(m[1]);
  const unit = m[2];
  if (n === 1 && ["日", "年", "か月", "週間", "時間", "台", "枚", "人", "件", "戸", "棟", "社", "度", "か所", "kW", "kWh"].includes(unit)) return true;
  if (unit === "kW" && n >= 1 && n <= 20 && Number.isInteger(n * 2)) return true;
  if (unit === "kWh" && n >= 1 && n <= 30 && Number.isInteger(n * 2)) return true;
  if (unit === "V" && (n === 100 || n === 200)) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────── 索引

export interface FactIndex {
  /** 正規化した数値 → その数値が書かれている節の出典 URL */
  tokens: Map<string, Set<string>>;
  /** 事実シートにある出典 URL → 種類 */
  sources: Map<string, SourceType>;
  /** 「◯年◯月◯日時点」のような、情報の基準日として書く日付（主張ではないので出典を求めない） */
  neutral: Set<string>;
  /** 出典つきの節にある電話番号（公的な窓口）。記事に書いてよい番号はこれだけ */
  phones: Set<string>;
  /** 出典の無い節（運営者から確認した会社情報など）にある数値。記事の根拠にはしないが、固定ページの点検では既知として扱う */
  operator: Set<string>;
  sections: FactSection[];
}

/** 日付は、年月日が確認できていれば「月日だけ」「年月だけ」「年だけ」の言い方も確認済みとして扱う */
function derivedKeys(key: string): string[] {
  const d = key.match(/^D:(\d{4})-(\d{2})-(\d{2})$/);
  if (d) return [key, `MD:${d[2]}-${d[3]}`, `YM:${d[1]}-${d[2]}`, `Y:${d[1]}`];
  const ym = key.match(/^YM:(\d{4})-(\d{2})$/);
  if (ym) return [key, `Y:${ym[1]}`];
  return [key];
}

export function buildFactIndex(md: string): FactIndex {
  const sections = parseFacts(md);
  const tokens = new Map<string, Set<string>>();
  const sources = new Map<string, SourceType>();
  const phones = new Set<string>();
  const operator = new Set<string>();
  // 事実シートの1行目（# 検証済み事実シート（2026-10-01 確認／…））にある日付が、情報の基準日
  const neutral = new Set<string>();
  const h1 = md.split(/\r?\n/).find((l) => l.startsWith("# ")) ?? "";
  for (const m of h1.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) {
    for (const k of derivedKeys(`D:${m[1]}-${m[2]}-${m[3]}`)) neutral.add(k);
  }
  for (const s of sections) {
    for (const u of s.sources) {
      const t = sourceTypeOf(u);
      if (t) sources.set(u, t);
    }
    for (const b of s.bullets) {
      const urls = (b.sources.length > 0 ? b.sources : s.sources).filter((u) => sourceTypeOf(u));
      // 出典の無い節（サービス情報・書かないことの一覧）にある数値は、根拠として数えない
      if (urls.length === 0) {
        for (const t of extractNumTokens(b.text)) for (const k of derivedKeys(t.key)) operator.add(k);
        continue;
      }
      for (const m of normalizeDigits(b.text).matchAll(/0\d{1,4}-\d{1,4}-\d{3,4}/g)) phones.add(m[0]);
      for (const u of urls) if (!sources.has(u)) sources.set(u, sourceTypeOf(u)!);
      for (const t of extractNumTokens(`${s.heading}\n${b.text}`)) {
        for (const k of derivedKeys(t.key)) {
          const set = tokens.get(k) ?? new Set<string>();
          // 節の出典と、箇条書き自身の出典の両方を根拠にできる
          for (const u of [...urls, ...s.sources.filter((x) => sourceTypeOf(x))]) set.add(u);
          tokens.set(k, set);
        }
      }
    }
  }
  return { tokens, sources, neutral, phones, operator, sections };
}

// ─────────────────────────────────────────────────────────────── 記事の検査

export interface Claim {
  claim: string;
  source: string;
  sourceType: SourceType;
  verified: boolean;
}

export interface ClaimCheck {
  /** 確認できた主張（frontmatter に残す） */
  claims: Claim[];
  errors: string[];
}

function sentencesOf(text: string): string[] {
  return String(text)
    .split(/(?<=[。！？!?])|\n+/)
    .map((s) => s.replace(/^[\s#>*\-|]+/, "").replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);
}

/**
 * 記事の数値を1つずつ、事実シートと出典に突き合わせる。
 *
 *  1. 事実シートの「出典つきの節」に書かれていない数値 → エラー（数値に一次情報がない）
 *  2. 書かれているが、その節の出典が記事の sources に入っていない → エラー（出典と本文が対応していない）
 *  3. 記事の sources に、本文のどの数値の根拠にもなっていない出典がある → 注意（エラーにはしない）
 *
 * @param text    検査する文章（タイトル・説明・本文・FAQ をつないだもの）
 * @param sources 記事が挙げている出典の URL
 */
export function checkNumericClaims(text: string, sources: string[], index: FactIndex): ClaimCheck {
  const errors: string[] = [];
  const claims: Claim[] = [];
  const listed = new Set(sources);
  const unverified = new Set<string>();
  const unsourced = new Map<string, string>();
  const seenClaim = new Set<string>();

  for (const sentence of sentencesOf(text)) {
    for (const t of extractNumTokens(sentence)) {
      if (t.kind === "quantity" && isNeutralQuantity(t.key)) continue;
      if (t.kind === "date" && index.neutral.has(t.key)) continue;
      const backing = index.tokens.get(t.key);
      if (!backing || backing.size === 0) {
        unverified.add(t.raw.trim());
        continue;
      }
      const used = [...backing].find((u) => listed.has(u));
      if (!used) {
        unsourced.set(t.raw.trim(), [...backing][0]);
        continue;
      }
      const key = `${sentence}|${used}`;
      if (seenClaim.has(key)) continue;
      seenClaim.add(key);
      claims.push({ claim: sentence.slice(0, 160), source: used, sourceType: index.sources.get(used) ?? sourceTypeOf(used) ?? "national", verified: true });
    }
  }

  if (unverified.size > 0) {
    errors.push(`一次情報で確認できていない数値があります（事実シートに無い）: ${[...unverified].slice(0, 6).join("、")}。数値を書かないか、「製品によって異なる」としてください`);
  }
  if (unsourced.size > 0) {
    const first = [...unsourced.entries()].slice(0, 3).map(([raw, url]) => `${raw} → ${url}`);
    errors.push(`数値の出典が sources にありません: ${first.join(" ／ ")}`);
  }
  return { claims, errors };
}

/** frontmatter 用：同じ出典の主張をまとめ、数を抑える（1記事あたり最大 max 件） */
export function compactClaims(claims: Claim[], max = 24): Claim[] {
  const seen = new Set<string>();
  const out: Claim[] = [];
  for (const c of claims) {
    const k = c.claim;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length >= max) break;
  }
  return out;
}
