import { allowedYenAmounts } from "./facts";

/**
 * 生成記事の品質ゲート。1つでも引っかかったら公開しない。
 * ここは「落とす」ための検査なので、疑わしきは落とす方針。
 */

export interface GeneratedArticle {
  title: string;
  description: string;
  tags: string[];
  faq: { q: string; a: string }[];
  sources: { name: string; url: string }[];
  body: string;
}

export interface ExistingPost {
  slug: string;
  title: string;
  intent: string;
  body: string;
}

export interface ValidateContext {
  intent: string;
  existing: ExistingPost[];
  /** ガイド・固定ページが狙う検索意図（記事が重複しないように） */
  reservedIntents: string[];
  allowedPaths: Set<string>;
  allowedSourceUrls: Set<string>;
}

/** バイグラムの Dice 係数 */
export function similarity(a: string, b: string): number {
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

/**
 * 焼き直し検出用：k文字シングル（連続k文字）の重なり率（小さい方の集合に対する割合）。
 * バイグラムは同じ分野の記事どうしでも0.5前後になり使えないため、長めのシングルで
 * 「同じ文章の言い換え・コピー」だけを拾う。
 */
export function shingleOverlap(a: string, b: string, k = 8): number {
  const sh = (s: string) => {
    const t = String(s)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*>\-`|\s　]/g, "");
    const out = new Set<string>();
    for (let i = 0; i + k <= t.length; i += 1) out.add(t.slice(i, i + k));
    return out;
  };
  const A = sh(a);
  const B = sh(b);
  if (A.size === 0 || B.size === 0) return 0;
  let hit = 0;
  for (const g of A) if (B.has(g)) hit += 1;
  return hit / Math.min(A.size, B.size);
}

/** Markdown記法を除いた文字数 */
export function countChars(md: string): number {
  return String(md)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*>\-`|]/g, "")
    .replace(/\s/g, "").length;
}

/** 本文から円の金額を全角・カンマ・万円表記込みで抽出して数値にする */
function extractYenAmounts(text: string): { raw: string; value: number }[] {
  const out: { raw: string; value: number }[] = [];
  const normalized = text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/，/g, ",");
  // 「12.5万円」「120万円」「96,000円」「7,000円」
  for (const m of normalized.matchAll(/(\d+(?:\.\d+)?)\s*万円/g)) out.push({ raw: m[0], value: Math.round(parseFloat(m[1]) * 10000) });
  for (const m of normalized.matchAll(/(?<![\d.万])(\d{1,3}(?:,\d{3})+|\d+)\s*円(?!\/kWh|\/kW)/g)) {
    // 「24円/kWh」のような単価は別で検査するので除外（直後に /kWh が続くものは上で除外済み）
    out.push({ raw: m[0], value: parseInt(m[1].replace(/,/g, ""), 10) });
  }
  return out;
}

const BANNED: { re: RegExp; msg: string }[] = [
  { re: /必ず(もらえ|交付|受け取|受給|対象に|得|元が)|絶対に|確実に(元|回収|得|もらえ)|間違いなく|100%/, msg: "断定表現（必ずもらえる・絶対・確実に）があります" },
  { re: /併用(でき(ます|るため|るので|、)|が?可能(です|なため|なので|、)|OK)/, msg: "併用可能と断定しています（公式で確認できていません）" },
  { re: /相場(は|として|が)[^。]{0,20}\d/, msg: "相場の具体額を書いています" },
  { re: /年間\s*[\d,，０-９]+\s*kWh|発電量(は|が)[^。]{0,15}[\d０-９]+\s*kWh/, msg: "発電量の具体値を書いています" },
  { re: /削減(額|率)(は|が)[^。]{0,15}[\d０-９]+|[\d０-９]+\s*(%|％)\s*(削減|節約|カット)/, msg: "削減率・削減額の具体値を書いています" },
  { re: /施工事例|お客様の声|導入されたお客様|実際に導入した[^。]{0,10}様|[A-Z]様|[ぁ-んァ-ン一-龥]{1,3}様の(お宅|ご自宅)/, msg: "架空の施工事例・お客様の声になり得る表現があります" },
  { re: /施工実績|施工件数|創業|年の実績|No\.?1|ナンバーワン|地域一番|正規取扱|認定店|メーカー認定|自社施工|有資格者|資格を持つ/, msg: "確認できない実績・資格・認定の表現があります" },
  { re: /究極|絶品|最安|激安|業界最|日本一|圧倒的/, msg: "大げさな広告表現があります" },
  { re: /0120-|03-\d{4}-\d{4}(?!\s*（)|090-|080-|070-|LINE(で|から)(ご)?(相談|連絡|お問い合わせ)/, msg: "未確定の連絡先（電話・LINE）に触れています" },
  { re: /元が取れ(る|ます)|回収でき(る|ます)|[\d０-９]+年で(回収|元)/, msg: "投資回収を断定しています" },
  { re: /DR(に)?参加(すれば|すると|で)[^。]{0,12}上限(が|は)?(なくな|撤廃|無制限)/, msg: "DR参加で上限がなくなる等の断定があります" },
  { re: /すべての新築(住宅)?に(太陽光)?(が)?義務|新築は(すべて|全て)義務/, msg: "太陽光義務化の対象を誤っています（個人に義務はない）" },
];

export function validate(article: GeneratedArticle, ctx: ValidateContext): string[] {
  const errors: string[] = [];
  const body = String(article.body ?? "");
  const haystack = [article.title, article.description, body, ...(article.faq ?? []).map((f) => `${f?.q ?? ""}\n${f?.a ?? ""}`)].join("\n");

  // ── 形式
  if (!article.title || typeof article.title !== "string") errors.push("title がありません");
  if (article.title && article.title.length > 42) errors.push(`title が長すぎます（${article.title.length}文字、40文字以内）`);
  if (!article.description || article.description.length < 70) errors.push("description が短すぎます（90〜120文字）");
  if (article.description && article.description.length > 150) errors.push("description が長すぎます（90〜120文字）");
  if (!Array.isArray(article.tags) || article.tags.length < 3) errors.push("tags が3つ未満です");
  if (!Array.isArray(article.faq) || article.faq.length < 2) errors.push("faq が2つ未満です");
  else if (article.faq.some((f) => !f || !f.q || !f.a)) errors.push("faq の q または a が空です");

  // ── 分量・構成
  const length = countChars(body);
  if (length < 1400) errors.push(`本文が短すぎます（${length}字。1,600〜2,600字が目安）`);
  if (length > 3200) errors.push(`本文が長すぎます（${length}字。1,600〜2,600字が目安）`);
  if (/^#\s/m.test(body)) errors.push("本文に h1（#）が含まれています");
  const h2 = (body.match(/^##\s+/gm) ?? []).length;
  if (h2 < 4) errors.push(`## の見出しが${h2}本しかありません（4本以上）`);
  if (h2 > 7) errors.push(`## の見出しが多すぎます（${h2}本）`);
  if (/^##\s*(監修|参考資料|参考文献|出典)/m.test(body)) errors.push("本文に監修・参考資料の見出しがあります（サイト側で自動付与）");

  // ── 内部リンク
  const links = [...body.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1].replace(/\/$/, "") || "/");
  if (links.length < 2) errors.push("固定ページへの内部リンクが2本未満です");
  for (const l of links) {
    if (!ctx.allowedPaths.has(l)) {
      errors.push(`存在しないページへのリンクがあります: ${l}`);
      break;
    }
  }
  if (/\]\(https?:\/\//.test(body)) {
    for (const m of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      if (!ctx.allowedSourceUrls.has(m[1])) {
        errors.push(`許可されていない外部リンクがあります: ${m[1]}`);
        break;
      }
    }
  }

  // ── 出典
  if (!Array.isArray(article.sources)) errors.push("sources が配列ではありません");
  else {
    for (const s of article.sources) {
      if (!s?.url || !ctx.allowedSourceUrls.has(s.url)) {
        errors.push(`出典URLが検証済み一覧にありません: ${s?.url ?? "(空)"}`);
        break;
      }
    }
  }

  // ── 重複（タイトル・検索意図・本文の焼き直し）
  for (const p of ctx.existing) {
    if (p.title && similarity(article.title, p.title) > 0.55) {
      errors.push(`既存記事「${p.title}」とタイトルが似すぎています`);
      break;
    }
  }
  for (const p of ctx.existing) {
    if (p.intent && similarity(ctx.intent, p.intent) > 0.7) {
      errors.push(`既存記事「${p.title}」と検索意図がほぼ同じです`);
      break;
    }
  }
  for (const r of ctx.reservedIntents) {
    if (similarity(ctx.intent, r) > 0.75) {
      errors.push(`固定ページが狙う検索意図「${r}」と重複しています`);
      break;
    }
  }
  for (const p of ctx.existing) {
    // 8文字シングルの重なりが2割を超えたら、同じ文章の言い換え・コピーとみなす
    if (p.body && shingleOverlap(body, p.body) > 0.2) {
      errors.push(`既存記事「${p.title}」の焼き直しに近い内容です`);
      break;
    }
  }

  // ── 根拠のない数字
  const allowed = allowedYenAmounts();
  for (const { raw, value } of extractYenAmounts(haystack)) {
    if (!allowed.has(value)) {
      errors.push(`検証済み一覧にない金額があります: ${raw}`);
      break;
    }
  }
  {
    // 単価（円/kWh・円/kW）は事実シートの値だけ
    const allowedUnit = new Set(["24", "8.3", "19", "10万", "6万", "15万", "12万", "10万", "18万", "12.5万"]);
    for (const m of haystack.matchAll(/([\d.]+万?)\s*円\s*\/\s*k(W|Wh)/g)) {
      if (!allowedUnit.has(m[1])) {
        errors.push(`検証済み一覧にない単価があります: ${m[0]}`);
        break;
      }
    }
    // パーセントは 1/4・1/3・3/10 以外の数値を許さない（効率・削減率などの推測防止）
    const pct = haystack.match(/[\d０-９.]+\s*(%|％)/);
    if (pct) errors.push(`パーセント表記の数値があります（根拠を示せないため禁止）: ${pct[0]}`);
  }

  // ── 禁止表現
  for (const b of BANNED) {
    if (b.re.test(haystack)) errors.push(b.msg);
  }

  // ── キーワードの詰め込み
  const count = (re: RegExp) => (haystack.match(re) ?? []).length;
  const kats = count(/葛飾区/g);
  const hojo = count(/補助金|助成金/g);
  if (kats > 18) errors.push(`「葛飾区」の出現が多すぎます（${kats}回）`);
  if (hojo > 40) errors.push(`「補助金／助成金」の出現が多すぎます（${hojo}回）`);
  {
    // 同じ文の繰り返し
    const sentences = body.split(/[。\n]/).map((s) => s.trim()).filter((s) => s.length > 15);
    const seen = new Set<string>();
    for (const s of sentences) {
      if (seen.has(s)) {
        errors.push(`同じ文が繰り返されています: 「${s.slice(0, 30)}」`);
        break;
      }
      seen.add(s);
    }
  }

  return errors;
}
