import { allowedYenAmounts } from "./facts";
import { checkNumericClaims, normalizeDigits, sourceTypeOf, type Claim, type FactIndex } from "./claims";
import { findCannibalPage } from "../seo-map";

/**
 * 生成記事の品質ゲート。1つでも引っかかったら公開しない。
 * ここは「落とす」ための検査なので、疑わしきは落とす方針（記事が0本の日があってよい）。
 *
 * 公開しない条件
 *   1. 既存記事とタイトルが近い
 *   2. 既存記事と検索意図が同じ
 *   3. 固定ページとカニバリする（lib/seo-map.ts のキーワードと取り合いになる）
 *   4. 数値に一次情報がない（事実シートの「出典つきの節」に無い数値・出典が sources に無い数値）
 *   5. メーカー不明の機器仕様（効率・サイクル数・保証年数など）
 *   6. 架空の経験（「実際に設置してみると」「よくいただくご相談」など）
 *   7. 架空の事例（「Aさんのお宅では」など）
 *   8. 架空の費用（「工事費は◯万円ほど」など）
 *   9. 根拠なしの「一般的に」
 *  10. 根拠なしの No.1・最上級
 *  11. 薄い記事（本文 1,800 字未満・見出しごとの中身が無い）
 *  12. 同じ構成の焼き直し（見出しの並びが既存記事とほぼ同じ・本文の言い換え）
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
  /** 事実シートの索引（数値と出典の突き合わせに使う）。渡さなければ数値の出典検査は行わない */
  factIndex?: FactIndex;
  /** 本文に必ず入れる固定ページ（トピックが指定する、その記事の「親」のページ） */
  requiredLinks?: string[];
  /** その記事のカテゴリの親ページ（data/blog-categories.ts の pillarLinks）。どれか1つへのリンクが必要 */
  pillarLinks?: string[];
  /** 既存記事の点検（scripts/blog-audit.ts）のとき true。既存記事どうしの重複検査を緩める */
  audit?: boolean;
}

export interface ValidateResult {
  errors: string[];
  /** 数値ごとの「主張・出典・種類・確認済み」（frontmatter に残す） */
  claims: Claim[];
}

/** 本文の最低文字数（Markdown 記法を除く）。これより短い記事は薄いとみなして公開しない */
export const MIN_BODY_CHARS = 1800;
export const MAX_BODY_CHARS = 3600;

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
export function extractYenAmounts(text: string): { raw: string; value: number }[] {
  const out: { raw: string; value: number }[] = [];
  const normalized = text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/，/g, ",");
  // 「12.5万円」「120万円」「96,000円」「7,000円」
  // 「6万円/kW」のような単価は、下の単価の検査（allowedUnit）が見るので、ここでは金額として数えない
  for (const m of normalized.matchAll(/(\d+(?:\.\d+)?)\s*万円(?!\s*\/\s*k)/g)) out.push({ raw: m[0], value: Math.round(parseFloat(m[1]) * 10000) });
  for (const m of normalized.matchAll(/(?<![\d.万])(\d{1,3}(?:,\d{3})+|\d+)\s*円(?!\/kWh|\/kW)/g)) {
    // 「24円/kWh」のような単価は別で検査するので除外（直後に /kWh が続くものは上で除外済み）
    out.push({ raw: m[0], value: parseInt(m[1].replace(/,/g, ""), 10) });
  }
  return out;
}

/** ## 見出しの一覧（記号・番号を除いた本文） */
export function headingsOf(md: string): string[] {
  return [...String(md).matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].replace(/[#*`]/g, "").trim());
}

/** どの記事にも出てくる、構成の比較に使わない見出し */
const GENERIC_HEADING = /^(まとめ|おわりに|最後に|結論|よくある質問|注意点|はじめに)$/;

/**
 * 見出しの並びが既存記事とどれだけ同じか（0〜1）。
 * 同じ題材を、見出しだけ少し変えて書き直した記事（構成の焼き直し）を見つける。
 */
export function structureOverlap(a: string[], b: string[]): number {
  const A = a.filter((h) => !GENERIC_HEADING.test(h));
  const B = b.filter((h) => !GENERIC_HEADING.test(h));
  if (A.length < 3 || B.length < 3) return 0;
  let hit = 0;
  for (const h of A) if (B.some((x) => similarity(h, x) >= 0.7)) hit += 1;
  return hit / A.length;
}

function sentencesOf(text: string): string[] {
  return String(text)
    .split(/(?<=[。！？!?])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * quoted: true … 「」の中の言葉（業者のセールストークや、よくある誤解の例として引用したもの）は検査しない。
 *                「『必ずもらえます』と言う業者に注意」のような注意喚起まで落とさないため。
 */
const BANNED: { re: RegExp; msg: string; quoted?: boolean }[] = [
  { quoted: true, re: /必ず(もらえ|交付|受け取|受給|対象に|得|元が)|絶対に|確実に(元|回収|得|もらえ)|間違いなく|100%/, msg: "断定表現（必ずもらえる・絶対・確実に）があります" },
  { quoted: true, re: /(全額|満額|両方とも全額|そのまま(全部|合計))[^。]{0,12}(もらえ|受け取れ|交付)/, msg: "補助金を上限なしに受け取れるかのような表現があります" },
  { re: /(区と都|葛飾区と東京都|両方|両制度)[^。|]{0,10}(合わせ|あわせ|合計|合算|トータル)[^。|]{0,10}[\d０-９.]+\s*万?円|(合わせて|あわせて|合算すると|合計すると)[^。|]{0,10}[\d０-９.]+\s*万?円/, msg: "区と都の合計額を書いています（合計は助成対象経費が上限のため、書かない）" },
  { re: /相場(は|として|が)[^。]{0,20}\d/, msg: "相場の具体額を書いています" },
  { re: /年間\s*[\d,，０-９]+\s*kWh|発電量(は|が)[^。]{0,15}[\d０-９]+\s*kWh/, msg: "発電量の具体値を書いています" },
  { re: /削減(額|率)(は|が)[^。]{0,15}[\d０-９]+|[\d０-９]+\s*(%|％)\s*(削減|節約|カット)/, msg: "削減率・削減額の具体値を書いています" },
  // 架空の事例
  {
    re: /施工事例|お客様の声|導入されたお客様|実際に導入した[^。]{0,10}様|[A-ZＡ-Ｚ](さん|様)|[ぁ-んァ-ン一-龥]{1,3}様の(お宅|ご自宅)|〇〇(さん|様)|ある(ご家庭|お宅|お客様)(では|の場合|は、)|(にお住まいの|在住の)[^。]{0,8}(さん|様|ご家族)|築\s*[\d０-９]+\s*年の(お宅|住宅|家)(に|で|へ)(設置|導入|取り付け)|ケーススタディ|導入事例|設置事例|実例/,
    msg: "架空の施工事例・お客様の声になり得る表現があります",
  },
  // 架空の経験
  {
    re: /(私|わたし|筆者|弊社|当社|私たち|わたしたち|私ども)(は|が|の|も|で)|実際に(行って|訪問して|設置して|施工して|工事して|導入して|使って|試して|見て|聞いて)|(経験|体験)(上|から|では|談)|現場(では|で)(よく|しばしば|多く)|お客様から(よく|多く)|よく(いただく|聞かれる|受ける|寄せられる)(ご)?(質問|相談|声)|ご?相談(が|を)(多く|よく)(いただ|寄せ|受け)|多く(寄せられ|いただ|受け)[^。]{0,8}(質問|相談|声|疑問)|という声(が|を|には|も)|(これまで|過去)(に|の)(施工|相談|経験|事例|対応)|(スタッフ|担当者|職人)(が|の)(経験|実感|話|声)|実感(して|として)|(多くの|たくさんの)(お客様|ご家庭)(が|から|に)/,
    msg: "架空の経験になり得る表現があります（経験・相談件数・現場の話は書かない）",
  },
  // 根拠なしの No.1・最上級
  {
    re: /No\.?\s*[1１]|ナンバーワン|日本一|業界最|トップクラス|最大級|随一|シェア\s*(1|１|No|ナンバー)|人気\s*(No|ナンバー|1位|１位)|ランキング|第?[1１]位|最も(選ばれ|売れ|人気)|いちばん(選ばれ|売れ|人気)|満足度\s*[\d０-９]|究極|絶品|最安|激安|圧倒的/,
    msg: "根拠のない No.1・最上級・大げさな広告表現があります",
  },
  { re: /LINE(で|から)(ご)?(相談|連絡|お問い合わせ)/, msg: "記事本文に LINE の案内を書いています（未確定のため書かない）" },
  { quoted: true, re: /元が取れ(る|ます)|回収でき(る|ます)|[\d０-９]+年で(回収|元)/, msg: "投資回収を断定しています" },
  { re: /DR(に)?参加(すれば|すると|で)[^。]{0,12}上限(が|は)?(なくな|撤廃|無制限)/, msg: "DR参加で上限がなくなる等の断定があります" },
  { quoted: true, re: /すべての新築(住宅)?に(太陽光)?(が)?義務|新築は(すべて|全て)義務|個人(に|にも)(設置)?義務が(あり|生じ|課)/, msg: "太陽光義務化の対象を誤っています（義務を負うのは大手ハウスメーカー等の事業者）" },
  { re: /訪問販売(や|・)?(電話営業)?(は|を)?(して|行って|おこなって)(い|お)(ません|りません)|(営業日|時間)以内に(ご)?(連絡|返信|回答)/, msg: "確認できていない約束（営業方法・返信の速さ）を書いています" },
  // 区の資料の言い方は「悪徳な販売業者」。「詐欺」は、相手を断定的に非難する言葉なので使わない
  { re: /詐欺/, msg: "「詐欺」という断定的な非難の言葉があります（区の資料にある言い方で書く）" },
  // 根拠のない言い切り
  { quoted: true, re: /間違いありません|に違いありません|と断言でき|疑いようがありません/, msg: "根拠のない言い切りがあります（「〜と判断して間違いありません」など）" },
  // 対応エリアを、事実シートより広く書かない（主要は葛飾区。周辺は足立区・江戸川区・墨田区）
  {
    re: /(SOLAR SHIFT|ソーラーシフト|当サービス|当社)[^。\n]{0,60}(東京都内|都内(全域|各地|どこでも)|東京(23|２３)区|首都圏|関東(一円|全域)?|全国)[^。\n]{0,20}(対応|伺|訪問|行って|実施|承)/,
    msg: "SOLAR SHIFT の対応エリアを、事実シートより広く書いています（葛飾区が中心。周辺は足立区・江戸川区・墨田区）",
  },
];

/** 実績・資格・認定・保証の語。SOLAR SHIFT について確認できている事実が無いので、主張としては書けない */
const CREDENTIAL_TERMS = /施工実績|施工件数|創業|年の実績|地域一番|正規取扱|認定店|メーカー認定|自社施工|有資格者|資格を持つ|保証付き|工事保険|賠償(責任)?保険/;
/** 根拠を示さずに一般化する言い回し */
export const GENERALIZATION = /一般的(に|です|な|で)|一般に|多くの(場合|機種|製品|家庭|住宅|方|業者|ケース)|ほとんどの|大半の|通常は|平均(的|して|で)|標準的(に|な)|よくある(ケース|パターン)|ことが多(く|い)|がち(です|に|な|で)|ありがち|傾向(が|に)あ|典型(です|的)|可能性が(高い|大きい)|(だ|である|している|いる)と(考え|思わ|推測さ)れます|ことを(示して|意味して)い(ます|る)/g;
/** 伝聞の言い回し。出どころを同じ文で示していなければ、根拠なしとみなす */
export const HEARSAY = /と(言|い)われています|と(言|い)われる|とされています|だそうです|らしいです|ようです。/;
/**
 * だれの資料に書いてあるかを、同じ文で示しているか（一般化・伝聞の言い回しを通してよい条件）。
 *
 * 以前は「葛飾区」「案内」などの語が文のどこかにあれば通していたが、それでは
 *   「葛飾区の助成金を使う場合、申請は業者がサポートすることが多いです」（葛飾区という語があるだけ）
 *   「業者によって費用や提案内容が異なることが多い」（「提案内容」の中に「案内」がある）
 * のような、根拠のない一般化まで通ってしまった（実際のモデルで試して分かった）。
 * 「〜によると」「◯◯の案内では」「◯◯は、〜と説明しています」のように、出どころを示す形の文だけを通す。
 */
export const ATTRIBUTION = new RegExp(
  [
    // 「〜によると」「〜によれば」
    "によると|によれば",
    // 「区の案内では」「公式案内には」「都の手引きによると」（「提案内容」の中の「案内」は、あとに「では」が続かないので当たらない）
    "(?:案内|手引き|要綱|公募要領|公式サイト|公式情報|公式資料|資料|よくある質問)(?:では|には|にも)|公式情報で",
    // 制度を主語にする形：「かつしかエコ助成金（個人住宅用）」では／〜促進事業では
    "(?:助成金|補助金|事業|制度)(?:（[^）]*）)?」?\\s*では",
    // 文末のかっこで出どころを示す形：「〜と言われています（太陽光発電協会）。」
    "（[^）]*(?:太陽光発電協会|JPEA|葛飾区|東京都|経済産業省|資源エネルギー庁|環境省|国土交通省|クール・ネット東京|SII|区の案内|都の手引き)[^）]*）",
    // 「葛飾区は、〜を呼びかけています」「太陽光発電協会は、〜と説明しています」
    "(?:葛飾区|区|東京都|都|国|経済産業省|資源エネルギー庁|環境省|国土交通省|公社|クール・ネット東京|太陽光発電協会|協会|JPEA|SII|環境共創イニシアチブ)(?:は|が|も)、?[^。]*?(?:説明し|案内し|紹介し|勧め|推奨し|挙げ|呼びかけ|公表し|定め|としてい|と書い|明記し|示し)",
  ].join("|"),
);
/** 機器の仕様の語。メーカーの一次資料が事実シートに無い間は、数値と一緒に書けない */
const SPEC_TERMS = /変換効率|サイクル数|サイクル試験|充放電回数|定格出力|実効容量|出力保証|製品保証|機器保証|容量保証|期待寿命|設計寿命|性能年数|劣化率|保証(期間|年数)/;
/**
 * 仕様の数値を書いてよい例外：SII の登録基準（事実シートに出典つきで載っている）として書く場合。
 * 「SII の登録基準では〜」のように、同じ文で出どころを示していることが条件。
 * 数値そのものが事実シートにあるか・出典が記事の参考資料にあるかは、checkNumericClaims が別に確かめる。
 */
const SPEC_SOURCE = /SII|環境共創イニシアチブ|登録(の)?基準|公募要領/;
/** 費用の語。金額と同じ文にあると「架空の費用」になり得る */
const COST_TERMS = /費用|価格|値段|工事費|設置費|見積(もり)?(額|金額)|総額|初期費用|導入費用|相場|本体(の)?(価格|代)/;
const SUBSIDY_CONTEXT = /助成|補助|対象経費|上限|限度額|加算|単価|円\s*\/\s*k|のとき|の場合|計算|以内|\d\s*\/\s*\d|分の|FIT|買取|売電|調達/;

export function validate(article: GeneratedArticle, ctx: ValidateContext): ValidateResult {
  const errors: string[] = [];
  const body = String(article.body ?? "");
  const haystack = [article.title, article.description, body, ...(article.faq ?? []).map((f) => `${f?.q ?? ""}\n${f?.a ?? ""}`)].join("\n");
  const sourceUrls = Array.isArray(article.sources) ? article.sources.map((s) => s?.url).filter((u): u is string => Boolean(u)) : [];

  // ── 形式
  if (!article.title || typeof article.title !== "string") errors.push("title がありません");
  if (article.title && article.title.length > 42) errors.push(`title が長すぎます（${article.title.length}文字、40文字以内）`);
  if (!article.description || article.description.length < 70) errors.push("description が短すぎます（90〜120文字）");
  if (article.description && article.description.length > 150) errors.push("description が長すぎます（90〜120文字）");
  if (!Array.isArray(article.tags) || article.tags.length < 3) errors.push("tags が3つ未満です");
  if (!Array.isArray(article.faq) || article.faq.length < 2) errors.push("faq が2つ未満です");
  else if (article.faq.some((f) => !f || !f.q || !f.a)) errors.push("faq の q または a が空です");

  // ── 分量・構成（薄い記事を出さない）
  const length = countChars(body);
  if (length < MIN_BODY_CHARS) errors.push(`本文が短すぎます（${length}字。${MIN_BODY_CHARS.toLocaleString("ja-JP")}字以上、2,000〜3,000字が目安）`);
  if (length > MAX_BODY_CHARS) errors.push(`本文が長すぎます（${length}字。2,000〜3,000字が目安）`);
  if (/^#\s/m.test(body)) errors.push("本文に h1（#）が含まれています");
  const headings = headingsOf(body);
  const h2 = headings.length;
  if (h2 < 4) errors.push(`## の見出しが${h2}本しかありません（4本以上）`);
  if (h2 > 7) errors.push(`## の見出しが多すぎます（${h2}本）`);
  if (/^##\s*(監修|参考資料|参考文献|出典)/m.test(body)) errors.push("本文に監修・参考資料の見出しがあります（サイト側で自動付与）");
  {
    // 見出しだけで中身の無い区画（見出しの下が 120 字未満）
    const parts = body.split(/^##\s+.+$/m).slice(1);
    const thin = parts.filter((p) => countChars(p) < 120).length;
    if (thin > 0) errors.push(`中身の薄い区画があります（見出しの下が120字未満の区画が${thin}つ）`);
    const intro = body.split(/^##\s+/m)[0] ?? "";
    if (countChars(intro) < 100) errors.push("導入が短すぎます（冒頭の見出しの前に、結論を含む150〜250字の導入を書く）");
  }

  // ── 内部リンク
  const links = [...body.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1].replace(/\/$/, "") || "/");
  if (links.length < 2) errors.push("固定ページへの内部リンクが2本未満です");
  for (const l of links) {
    if (!ctx.allowedPaths.has(l)) {
      errors.push(`存在しないページへのリンクがあります: ${l}`);
      break;
    }
  }
  for (const required of ctx.requiredLinks ?? []) {
    if (!links.includes(required)) errors.push(`この記事の親になる固定ページへのリンクがありません: ${required}`);
  }
  const pillars = ctx.pillarLinks ?? [];
  if (pillars.length > 0 && !pillars.some((l) => links.includes(l))) {
    errors.push(`カテゴリの親ページ（${pillars.join(" / ")}）へのリンクがありません`);
  }
  if (/\]\(https?:\/\//.test(body)) {
    for (const m of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      if (!ctx.allowedSourceUrls.has(m[1])) {
        errors.push(`許可されていない外部リンクがあります: ${m[1]}`);
        break;
      }
    }
  }
  // 見出しはページの骨組み（目次にもなる）。見出しそのものをリンクにしない
  if (/^#{2,4}\s.*\]\(/m.test(body)) errors.push("見出しの中にリンクがあります（リンクは、本文の文章の中に置く）");

  // ── 「」での引用：公式資料の文言を引用する形で書いた文は、事実シートにある文言と一致していること
  //    （言い換えた文を「」で囲んで「と明記されています」と書くと、原文に無い言葉を引用したことになる）
  if (ctx.factIndex) {
    const flat = (s: string) => normalizeDigits(s).replace(/[\s、。，,.・「」『』（）()]/g, "");
    const sheet = flat(ctx.factIndex.sections.flatMap((s) => s.bullets.map((b) => b.text)).join("\n"));
    const quoted = haystack.matchAll(/「([^」]{10,})」\s*(?:と|という|との)(?:明記|記載|書かれ|書いて|案内|呼びかけ|述べ|注意を|推奨)/g);
    for (const m of quoted) {
      if (!sheet.includes(flat(m[1]))) {
        errors.push(`引用の形で書いた文が、事実シートの文言と一致しません: 「${m[1].slice(0, 30)}」（「」を外して自分の言葉で書くか、事実シートにある文言をそのまま使う）`);
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
      if (!sourceTypeOf(s.url)) {
        errors.push(`出典が一次情報（国・自治体・SII・メーカー・業界団体）ではありません: ${s.url}`);
        break;
      }
    }
  }

  // ── 重複（タイトル・検索意図・固定ページとのカニバリ・本文と構成の焼き直し）
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
  {
    const hit = findCannibalPage(ctx.intent);
    if (hit) errors.push(`固定ページとカニバリします：${hit.reason}。より細かい疑問（ロングテール）に絞ってください`);
  }
  for (const p of ctx.existing) {
    // 8文字シングルの重なりが2割を超えたら、同じ文章の言い換え・コピーとみなす
    if (p.body && shingleOverlap(body, p.body) > 0.2) {
      errors.push(`既存記事「${p.title}」の焼き直しに近い内容です`);
      break;
    }
  }
  for (const p of ctx.existing) {
    if (!p.body) continue;
    const overlap = structureOverlap(headings, headingsOf(p.body));
    if (overlap >= 0.6) {
      errors.push(`既存記事「${p.title}」と見出しの構成がほぼ同じです（${Math.round(overlap * 100)}%が一致）。切り口と構成を変えてください`);
      break;
    }
  }

  // ── 根拠のない数字（金額）
  const allowed = allowedYenAmounts();
  const yen = extractYenAmounts(haystack);
  for (const { raw, value } of yen) {
    if (!allowed.has(value)) {
      errors.push(`検証済み一覧にない金額があります: ${raw}`);
      break;
    }
  }
  let hasUnitPrice = false;
  {
    // 単価（円/kWh・円/kW）は事実シートの値だけ
    // 28.9万・29.4万 は、経済産業省の資料にある 2025年のシステム費用（10kW未満・新築）の平均値・中央値。12.5万 は国の DR 事業の目標価格
    const allowedUnit = new Set(["24", "8.3", "19", "10万", "6万", "15万", "12万", "18万", "28.9万", "29.4万", "12.5万"]);
    for (const m of haystack.matchAll(/([\d.]+万?)\s*円\s*\/\s*k(W|Wh)/g)) {
      hasUnitPrice = true;
      if (!allowedUnit.has(m[1])) {
        errors.push(`検証済み一覧にない単価があります: ${m[0]}`);
        break;
      }
    }
    // パーセントは書かない（効率・削減率などの推測防止）
    const pct = haystack.match(/[\d０-９.]+\s*(%|％)/);
    if (pct) errors.push(`パーセント表記の数値があります（根拠を示せないため禁止）: ${pct[0]}`);
  }

  // ── 数値と出典の対応（金額以外の数値・日付）
  let claims: Claim[] = [];
  if (ctx.factIndex) {
    const check = checkNumericClaims(haystack, sourceUrls, ctx.factIndex);
    errors.push(...check.errors);
    claims = check.claims;
    // 金額・単価を書くなら、その制度の一次情報を出典に挙げる
    const types = new Set(sourceUrls.map((u) => sourceTypeOf(u)));
    const text = normalizeDigits(haystack);
    if ((yen.length > 0 || hasUnitPrice) && sourceUrls.length === 0) errors.push("金額を書いているのに、出典（sources）がありません");
    if (/(葛飾区|かつしかエコ助成金)[^。\n]{0,60}\d+(\.\d+)?\s*万?円/.test(text) && !types.has("municipality")) errors.push("葛飾区の金額を書いていますが、葛飾区の公式資料が出典にありません");
    if (/(東京都|クール・ネット東京|都の助成)[^。\n]{0,60}\d+(\.\d+)?\s*万?円/.test(text) && !types.has("tokyo")) errors.push("東京都の金額を書いていますが、東京都（クール・ネット東京）の公式資料が出典にありません");
    if (/\d+(\.\d+)?\s*円\s*\/\s*kWh/.test(text) && !sourceUrls.some((u) => /meti\.go\.jp/.test(u))) errors.push("売電単価（円/kWh）を書いていますが、経済産業省の資料が出典にありません");
    if (yen.length > 0 || hasUnitPrice) {
      // 金額の主張も claims に残す（金額そのものは上の一覧で検査済み）
      const seen = new Set(claims.map((c) => c.claim));
      for (const s of sentencesOf(haystack)) {
        const clean = s.replace(/^[\s#>*\-|]+/, "").replace(/\s+/g, " ").trim();
        if (!/\d+(\.\d+)?\s*(万|億)?円/.test(normalizeDigits(clean)) || seen.has(clean.slice(0, 160))) continue;
        const t = normalizeDigits(clean);
        const want = /円\s*\/\s*kWh/.test(t) && !/万円\s*\/\s*kWh/.test(t) ? "meti" : /葛飾区|かつしか|区の/.test(t) ? "municipality" : /東京都|都の|クール・ネット/.test(t) ? "tokyo" : null;
        const src = sourceUrls.find((u) => (want === "meti" ? /meti\.go\.jp/.test(u) : want ? sourceTypeOf(u) === want : Boolean(sourceTypeOf(u))));
        if (!src) continue;
        seen.add(clean.slice(0, 160));
        claims.push({ claim: clean.slice(0, 160), source: src, sourceType: sourceTypeOf(src)!, verified: true });
      }
    }
  }

  // ── 禁止表現
  // タグも見る（本文には無い言葉が、タグにだけ入ることがある）
  const withTags = `${haystack}\n${(Array.isArray(article.tags) ? article.tags : []).join(" ")}`;
  const unquoted = withTags.replace(/「[^」]*」/g, "「」");
  for (const b of BANNED) {
    if (b.re.test(b.quoted ? unquoted : withTags)) errors.push(b.msg);
  }
  {
    // 電話番号：公的な窓口（事実シートの出典つきの節にある番号）以外は書かない
    const allowedPhones = ctx.factIndex?.phones ?? new Set<string>();
    for (const m of normalizeDigits(haystack).matchAll(/0\d{1,4}-\d{1,4}-\d{3,4}/g)) {
      if (!allowedPhones.has(m[0])) {
        errors.push(`記事に電話番号があります（公的な窓口以外の番号は書かない）: ${m[0]}`);
        break;
      }
    }
  }

  // ── 文ごとの検査：根拠なしの一般論・伝聞・機器仕様・費用
  {
    // 根拠なしの「一般的に」：だれの資料かを同じ文で示していない一般化は、1つでも落とす
    const generalization = new RegExp(GENERALIZATION.source);
    for (const s of sentencesOf(haystack)) {
      if (generalization.test(s) && !ATTRIBUTION.test(s)) {
        errors.push(`根拠を示さない一般化があります（根拠なしの「一般的に」）: 「${s.slice(0, 40)}」。公式資料にあることだけを書くか、「製品によって異なる」としてください`);
        break;
      }
    }
    // 実績・資格・認定・保証：「〜しているかを確認する」という確認点として書く場合だけ可
    for (const s of sentencesOf(haystack)) {
      if (CREDENTIAL_TERMS.test(s) && !/確認|かどうか|いるか|あるか|尋ね|聞い|チェック|注意/.test(s)) {
        errors.push(`確認できない実績・資格・認定・保証の表現があります: 「${s.slice(0, 40)}」`);
        break;
      }
    }
    for (const s of sentencesOf(haystack)) {
      if (HEARSAY.test(s) && !ATTRIBUTION.test(s)) {
        errors.push(`出典元を示さない伝聞があります: 「${s.slice(0, 40)}」（だれの資料かを書くか、文を削ってください）`);
        break;
      }
    }
    for (const s of sentencesOf(haystack)) {
      if (SPEC_TERMS.test(s) && /\d+(\.\d+)?\s*(年|か月|ヶ月|%|割|回|サイクル|kWh|kW|W)(?!目)/.test(normalizeDigits(s)) && !/助成|補助/.test(s) && !SPEC_SOURCE.test(s)) {
        errors.push(`メーカーの資料で確認していない機器仕様の数値があります: 「${s.slice(0, 40)}」（「製品によって異なる」とするか、SII の登録基準として出どころを同じ文に書いてください）`);
        break;
      }
    }
    for (const s of sentencesOf(haystack)) {
      const n = normalizeDigits(s);
      if (COST_TERMS.test(s) && /\d+(\.\d+)?\s*(万|千|億)?円/.test(n) && !SUBSIDY_CONTEXT.test(s)) {
        errors.push(`費用の具体額を書いています（架空の費用になり得る）: 「${s.slice(0, 40)}」`);
        break;
      }
    }
  }

  // ── 併用に触れるなら、上限（助成対象経費）も書く
  if (/併用/.test(haystack) && !/助成対象経費/.test(haystack)) errors.push("補助金の併用に触れていますが、「合計は助成対象経費が上限」の説明がありません");

  // ── キーワードの詰め込み
  const count = (re: RegExp) => (haystack.match(re) ?? []).length;
  const kats = count(/葛飾区/g);
  const hojo = count(/補助金|助成金/g);
  if (kats > 20) errors.push(`「葛飾区」の出現が多すぎます（${kats}回）`);
  if (hojo > 40) errors.push(`「補助金／助成金」の出現が多すぎます（${hojo}回）`);
  {
    // 同じ文の繰り返し
    const sentences = body.split(/[。\n]/).map((s) => s.trim()).filter((s) => s.length > 15 && !s.startsWith("|"));
    const seen = new Set<string>();
    for (const s of sentences) {
      if (seen.has(s)) {
        errors.push(`同じ文が繰り返されています: 「${s.slice(0, 30)}」`);
        break;
      }
      seen.add(s);
    }
  }

  return { errors, claims };
}
