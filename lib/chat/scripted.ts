import { faqs, type FaqItem } from "../../data/faq";
import { siteConfig, addressWithPostal, contactEmail } from "../site";
import type { ChatLink } from "./types";

/**
 * AI を呼ばずに返す「決まった案内文」と、よくある質問（data/faq.ts）との照合。
 *
 * - ここに書く文章は docs/VERIFIED_FACTS.md と公開ページの記載の範囲に限る。
 *   連絡先（電話・メール・所在地）は lib/site.ts に入っているものだけを書く。
 *   LINE・営業時間・実績・価格など、未確定のことは書かない。
 * - ANTHROPIC_API_KEY が無い環境でも、チャットはこのファイルだけで動く。
 */

export interface ScriptedAnswer {
  id: string;
  /** 候補ボタンに出す短い文言 */
  label: string;
  /** 自由入力に対して、この案内を返す条件 */
  pattern: RegExp;
  answer: string;
  links: ChatLink[];
}

const TEL: string = siteConfig.contact.telDisplay;
const LINE_URL: string = siteConfig.contact.lineUrl;
const HOURS: string = siteConfig.contact.hours;
const OFFICE_NOTE = "なお、葛飾区の助成制度そのものについては、葛飾区役所 環境部環境課 環境計画係（410番窓口）TEL 03-5654-8228 が窓口です。";

/** 連絡先の案内。電話・LINE・受付時間は lib/site.ts に入っているものだけを書く */
function contactInfoAnswer(): string {
  if (!TEL) {
    return `SOLAR SHIFT へのご連絡は、お問い合わせフォームで承っています。フォーム送信後、通常2〜3営業日以内に担当者よりご連絡します。${OFFICE_NOTE}`;
  }
  const email = contactEmail();
  const notListed = [LINE_URL ? "" : "LINEでの受付", HOURS ? "" : "電話の受付時間"].filter(Boolean).join("と");
  return [
    `SOLAR SHIFT へのご連絡は、お電話（${TEL}${HOURS ? `・${HOURS}` : ""}）${email ? `、メール（${email}）` : ""}、お問い合わせフォームで承っています。`,
    notListed ? `${notListed}は、現時点でこのサイトに掲載していません。` : "",
    "フォーム送信後は、通常2〜3営業日以内に担当者よりご連絡します。",
    OFFICE_NOTE,
  ].join("");
}

/** 相談・見積もりの頼み方 */
function consultAnswer(): string {
  const how = TEL ? `お問い合わせフォーム、またはお電話（${TEL}）でご連絡ください。フォーム送信後は、` : "お問い合わせフォームからご連絡ください。フォーム送信後、";
  return `ご相談・現地調査・お見積もりは無料です。${how}通常2〜3営業日以内に担当者よりご連絡します。訪問販売や電話営業は行っていません。`;
}

export const scriptedAnswers: ScriptedAnswer[] = [
  {
    id: "tel",
    label: "連絡先を知りたい",
    // 「ガイドライン」「オンライン」「hotel」などに反応しないよう、前後の文字を見る
    pattern: /電話|でんわ|(?<![a-z])tel(?![a-z])|ＴＥＬ|番号|(?<![a-z])line(?![a-z])|ＬＩＮＥ|(?<!ガイド|オン|アウト|パイプ|ボーダー)ライン|メール|営業時間|受付時間|何時(から|まで)|定休|休み/i,
    answer: contactInfoAnswer(),
    links: [{ href: "/contact", label: "お問い合わせ・無料相談" }],
  },
  {
    id: "address",
    label: "所在地を知りたい",
    // 「設置場所」「申請窓口はどこ」などに反応しないよう、会社・事業所の話に限る
    pattern: /(会社|事務所|事業所|御社|そちら|solar ?shift|ソーラーシフト|サイプレス|運営会社|拠点)[^。？?対エ補申窓設]{0,8}(住所|所在地|場所|どこ|地図|マップ|アクセス)|所在地(は|を|って)|(住所|所在地)(を)?(教えて|知りたい)/i,
    answer: `SOLAR SHIFT（運営：${siteConfig.company.name}）の所在地は、${addressWithPostal()} です。会社概要は運営会社のページでご覧いただけます。現地調査・お見積もりは無料で、葛飾区を中心に足立区・江戸川区・墨田区にも対応しています。`,
    links: [
      { href: "/company", label: "運営会社" },
      { href: "/area", label: "対応エリア" },
    ],
  },
  {
    id: "contact",
    label: "相談・見積もりを頼みたい",
    pattern: /相談(し|を|の|で|は)|問い?合わ?せ|見積|申し?込み(たい|は|方法)|依頼|頼みたい|来てほしい|担当(者)?と|スタッフと|人と話/,
    answer: consultAnswer(),
    links: [
      { href: "/contact", label: "お問い合わせ・無料相談" },
      { href: "/flow", label: "導入までの流れ" },
    ],
  },
  {
    id: "simulate",
    label: "わが家の補助金を試算したい",
    pattern: /シミュレ|試算|計算(し|でき|したい)|概算|わが家(は|の|で|だと)|うち(は|の|だと)(いくら|どのくらい)/,
    answer:
      "補助金シミュレーターで、住宅区分・太陽光の容量・蓄電池の容量などを選ぶと、葛飾区と東京都それぞれの想定助成額を試算できます。区と都の金額は別々に表示し、確認できていない併用を前提とした合算はしていません。試算は概算で、交付を保証するものではありません。",
    links: [
      { href: "/simulation", label: "補助金シミュレーター" },
      { href: "/subsidy/katsushika", label: "葛飾区の補助金" },
    ],
  },
  {
    id: "works",
    label: "施工事例はありますか？",
    pattern: /施工(事例|実績|件数)|事例|実績|口コミ|クチコミ|評判|レビュー|お客様の声|導入(例|した人)/,
    answer:
      "SOLAR SHIFT は2026年に始まった新しいサービスのため、現時点で公開できる施工事例・お客様の声はありません。施工が完了し、掲載の許可をいただいた事例から順次公開します。架空の事例や数字は掲載しません。",
    links: [
      { href: "/works", label: "施工事例" },
      { href: "/reason", label: "選ばれる理由" },
    ],
  },
  {
    id: "products",
    label: "取り扱いメーカー・商品は？",
    pattern: /メーカー|取扱|取り扱い|商品|機種|型番|製品|どこの(パネル|蓄電池)/,
    answer:
      "取扱商品は、メーカー公式情報で仕様を確認したものから順次掲載しています。機種は、屋根の条件と電気の使い方を現地で確認してからご提案します。価格が未確定の商品には価格を表示していません。",
    links: [
      { href: "/products", label: "取扱商品" },
      { href: "/recommend/solar", label: "おすすめ太陽光パネル" },
      { href: "/recommend/battery", label: "おすすめ蓄電池" },
    ],
  },
];

/** あいさつ・お礼など、制度の話ではない短い入力 */
const SMALL_TALK: { pattern: RegExp; answer: string }[] = [
  {
    pattern: /^(こんにち[はわ]|こんばん[はわ]|おはよう(ございます)?|はじめまして|hello|hi|もしもし|やあ)[!！。、\s]*$/i,
    answer: "こんにちは。SOLAR SHIFT の自動応答チャットです。葛飾区・東京都の補助金や、太陽光発電・蓄電池の導入について、分かる範囲でお答えします。下の候補から選ぶか、質問を入力してください。",
  },
  {
    pattern: /^(ありがとう(ございます|ございました)?|助かりました|サンキュー|thanks?|thank you|了解(です|しました)?|わかりました|分かりました|ok|おk)[!！。、\s]*$/i,
    answer: "こちらこそ、ありがとうございます。ほかに気になる点があれば、続けてご質問ください。ご自宅の条件での具体的なご相談は、お問い合わせフォームから無料で承っています。",
  },
];

/** 最初に出す候補ボタン（FAQ の id と scripted の id を混ぜてよい） */
export const INITIAL_SUGGESTIONS = ["subsidy-katsushika-overview", "subsidy-tokyo-overview", "subsidy-combination", "subsidy-pre-consultation", "battery-capacity", "simulate"];

/** 候補ボタン用の短い文言（指定が無い FAQ は質問文をそのまま使う） */
const FAQ_SHORT_LABEL: Record<string, string> = {
  "subsidy-katsushika-overview": "葛飾区の補助金はいくら？",
  "subsidy-pre-consultation": "工事の後から申請できる？",
  "subsidy-combination": "区と都は併用できる？",
  "subsidy-tokyo-overview": "東京都の補助金はいくら？",
  "subsidy-tokyo-battery-sii": "2026年10月からの変更点は？",
  "subsidy-national": "国の補助金は使える？",
  "subsidy-guarantee": "補助金は必ずもらえる？",
  "cost-solar": "太陽光の費用は？",
  "cost-battery": "蓄電池の価格は？",
  "cost-payback": "何年で元が取れる？",
  "solar-roof": "どんな屋根でも載せられる？",
  "solar-lifespan": "パネルの寿命は？",
  "solar-blackout": "停電のとき使える？",
  "battery-capacity": "蓄電池は何kWhが目安？",
  "battery-set": "太陽光と同時がいい？",
  "v2h-what": "V2Hとは？",
  "hems-what": "HEMSは必要？",
  "install-period": "設置までの期間は？",
  "install-survey": "現地調査は無料？",
  "service-company": "運営会社は？",
  "service-area": "対応エリアは？",
  "service-sales": "訪問販売はありますか？",
};

/**
 * 照合用の言い換え。質問文と言い回しが違っても拾えるように、利用者が打ちそうな短い言い方を足す。
 * （回答の内容はあくまで data/faq.ts の a をそのまま返す）
 */
const FAQ_HINTS: Record<string, string[]> = {
  "subsidy-katsushika-overview": ["葛飾区の補助金はいくら", "かつしかエコ助成金の金額", "区の助成金はいくらもらえる", "葛飾区 太陽光 補助金", "葛飾区 蓄電池 補助金 いくら", "補助金の金額を教えて"],
  "subsidy-pre-consultation": ["工事の後から申請", "申請はいつまで", "事前協議とは", "着工前に何が必要", "契約してから申請しても間に合う", "申請のタイミング", "申請期限 締め切り"],
  "subsidy-combination": ["区と都は併用できる", "両方もらえる", "葛飾区と東京都の補助金を同時に", "併用 重複 合算"],
  "subsidy-tokyo-overview": ["東京都の補助金はいくら", "都の助成金", "クールネット東京 太陽光", "東京都 蓄電池 補助金 いくら"],
  "subsidy-tokyo-battery-sii": ["SII 登録機器", "2026年10月から何が変わった", "蓄電池の対象機器", "東京都 蓄電池 変更点"],
  "subsidy-national": ["国の補助金", "DR補助金", "CEV補助金", "国の蓄電池補助金はまだある"],
  "subsidy-guarantee": ["補助金は必ずもらえる", "絶対もらえる", "補助金がもらえなかったら", "交付は保証される"],
  "cost-solar": ["太陽光の費用", "設置費用はいくら", "太陽光パネルの値段", "太陽光 価格 相場"],
  "cost-battery": ["蓄電池の価格", "蓄電池はいくら", "蓄電池の値段 相場"],
  "cost-payback": ["何年で元が取れる", "回収年数", "得するのか", "損しない", "売電でいくら"],
  "solar-roof": ["うちの屋根でも設置できる", "屋根の条件", "狭い屋根 古い家でも載せられる", "瓦屋根 陸屋根"],
  "solar-lifespan": ["パネルの寿命", "何年もつ", "パワコンの交換", "耐用年数"],
  "solar-blackout": ["停電のとき使える", "災害時 自立運転", "停電対策"],
  "battery-capacity": ["蓄電池は何kWh", "容量の選び方", "蓄電池の大きさ", "どのくらいの容量が必要"],
  "battery-set": ["太陽光と蓄電池は同時がいい", "後付けできる", "セット導入", "蓄電池だけ後から"],
  "v2h-what": ["V2Hとは", "電気自動車の電気を家で使う", "EVから給電"],
  "hems-what": ["HEMSとは", "ヘムス 必要", "見える化"],
  "install-period": ["設置までどのくらいかかる", "工事期間", "いつ頃つけられる", "納期"],
  "install-survey": ["現地調査は無料", "見積もりは無料", "調査で何を見る", "費用はかかる 相談料"],
  "service-company": ["運営会社", "どんな会社", "サイプレスとは", "会社の場所 住所"],
  "service-area": ["対応エリア", "足立区は対応している", "江戸川区 墨田区 松戸", "葛飾区以外でも頼める"],
  "service-sales": ["訪問販売はある", "電話営業", "しつこい勧誘", "区の委託業者"],
};

function normalize(s: string): string {
  return String(s)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s　「」『』（）()・、。！？!?｜|：:【】\-〜~／/]/g, "");
}

function bigrams(s: string): Set<string> {
  const t = normalize(s);
  const out = new Set<string>();
  for (let i = 0; i < t.length - 1; i += 1) out.add(t.slice(i, i + 2));
  return out;
}

function dice(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit += 1;
  return (2 * hit) / (a.size + b.size);
}

/** 質問のバイグラムのうち、相手に含まれる割合（短い質問でも拾えるように） */
function containment(query: Set<string>, target: Set<string>): number {
  if (query.size === 0) return 0;
  let hit = 0;
  for (const g of query) if (target.has(g)) hit += 1;
  return hit / query.size;
}

const FAQ_INDEX = faqs.map((f) => {
  const variants = [f.q, ...(FAQ_HINTS[f.id] ?? [])];
  return {
    faq: f,
    variants: variants.map(bigrams),
    all: bigrams(variants.join(" ")),
  };
});

export interface FaqMatch {
  faq: FaqItem;
  score: number;
}

/** これ未満は「該当なし」として扱う（scripts/chat-selftest.ts の質問集で調整した値） */
export const FAQ_MATCH_THRESHOLD = 0.4;

export function matchFaq(query: string): FaqMatch | null {
  const q = bigrams(query);
  if (q.size === 0) return null;
  let best: FaqMatch | null = null;
  for (const entry of FAQ_INDEX) {
    const d = Math.max(...entry.variants.map((v) => dice(q, v)));
    const c = containment(q, entry.all);
    const score = 0.6 * d + 0.4 * c;
    if (!best || score > best.score) best = { faq: entry.faq, score };
  }
  return best && best.score >= FAQ_MATCH_THRESHOLD ? best : null;
}

export function matchScripted(query: string): ScriptedAnswer | null {
  const text = String(query).normalize("NFKC");
  return scriptedAnswers.find((s) => s.pattern.test(text)) ?? null;
}

export function matchSmallTalk(query: string): string | null {
  const text = String(query).normalize("NFKC").trim();
  return SMALL_TALK.find((s) => s.pattern.test(text))?.answer ?? null;
}

export function getFaq(id: string): FaqItem | undefined {
  return faqs.find((f) => f.id === id);
}

export function getScripted(id: string): ScriptedAnswer | undefined {
  return scriptedAnswers.find((s) => s.id === id);
}

export function suggestionLabel(id: string): string | undefined {
  const s = getScripted(id);
  if (s) return s.label;
  const f = getFaq(id);
  if (f) return FAQ_SHORT_LABEL[id] ?? f.q;
  return undefined;
}

/** 回答のあとに出す次の候補。同じカテゴリの質問を優先し、最後に相談への導線を足す */
export function nextSuggestions(currentId: string | null, askedIds: string[] = []): { id: string; label: string }[] {
  const asked = new Set([...askedIds, currentId ?? ""]);
  const current = currentId ? getFaq(currentId) : undefined;
  const pool: string[] = [];
  if (current) {
    for (const f of faqs) if (f.category === current.category && !asked.has(f.id)) pool.push(f.id);
  }
  for (const id of INITIAL_SUGGESTIONS) if (!asked.has(id) && !pool.includes(id)) pool.push(id);
  const picked = pool.slice(0, 3);
  if (!asked.has("contact") && !picked.includes("contact")) picked.push("contact");
  return picked.map((id) => ({ id, label: suggestionLabel(id) ?? id })).filter((s) => s.label !== s.id);
}
