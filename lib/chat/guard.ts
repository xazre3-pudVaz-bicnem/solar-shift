import { allowedYenAmounts } from "../blog-generator/facts";
import { extractYenAmounts } from "../blog-generator/validate";
import { siteConfig } from "../site";

/**
 * チャットの AI 回答を画面に出す前の検査。1つでも引っかかったら AI の回答は捨てて、
 * 公開している「よくある質問」か決まった案内文に切り替える（疑わしきは出さない）。
 *
 * ブログ自動生成の品質ゲート（lib/blog-generator/validate.ts）と同じ考え方で、
 * - 金額は「検証済み事実シートの固定額」と「制度のルールから導ける計算例」だけ
 * - 断定表現・区と都の合計額・相場・発電量・削減率・実績・資格・未確定の連絡先は禁止
 * - 連絡先は lib/site.ts に入っているものだけ。電話番号はその番号と公的窓口の番号だけ許す
 */

const SITE_TEL: string = siteConfig.contact.tel;
const SITE_LINE: string = siteConfig.contact.lineUrl;
const SITE_HOURS: string = siteConfig.contact.hours;
const SITE_DAYS: string = siteConfig.contact.businessDays;

/** 連絡手段のうち、lib/site.ts でまだ空のものは案内させない */
const UNSET_CONTACT: { re: RegExp; msg: string }[] = [
  ...(SITE_LINE ? [] : [{ re: /LINE(で|から)(ご)?(相談|連絡|お問い合わせ)/, msg: "未確定の連絡手段（LINE）" }]),
  ...(SITE_TEL ? [] : [{ re: /お電話(で|にて)(ご)?(相談|連絡|お問い合わせ|受付)/, msg: "未確定の連絡手段（電話）" }]),
  ...(SITE_HOURS
    ? []
    : [
        {
          re: /営業時間は|(受付|営業|対応)時間(は|：|:)?\s*(平日|土日|毎日|午前|午後|[\d０-９])/,
          msg: "未確定の営業時間・受付時間",
        },
      ]),
  // 営業する曜日（定休日）が未確定の間は、曜日や「年中無休」を書かせない。
  // 「定休日は、このサイトに掲載していません」のような案内は通す（読点の前に曜日・有無が来るものだけを落とす）
  ...(SITE_DAYS
    ? []
    : [
        {
          re: /定休日は[^。、]{0,6}(曜|祝|ありません|なし|ない)|年中無休|無休で|(土日|土曜|日曜|祝日|毎日)[^。]{0,6}(営業|対応|受付|お休み|休み)|(平日|土日)(のみ|だけ)/,
          msg: "未確定の営業日・定休日",
        },
      ]),
  // 年末年始の休みは未確認。「定休日なし」でも「年中無休」「年末年始も営業」とは書かせない（lib/site.ts に年中無休と入るまで）
  ...(SITE_DAYS.includes("年中無休") ? [] : [{ re: /年中無休|年末年始(も|に|の間も)[^。]{0,6}(営業|対応|受付)|元日も/, msg: "未確認の年末年始の営業" }]),
  { re: /24時間(対応|受付|営業)/, msg: "営業時間と違う表現（24時間）" },
];

const BANNED: { re: RegExp; msg: string }[] = [
  { re: /必ず(もらえ|交付|受け取|受給|対象に|得|元が)|絶対に|確実に(元|回収|得|もらえ)|間違いなく|100%/, msg: "断定表現" },
  // 併用はできる（区の案内に明記）。落とすのは「上限なしに全部もらえる」と読める言い方と、区と都の合計額
  { re: /(全額|満額|両方とも全額|そのまま(全部|合計))[^。]{0,12}(もらえ|受け取れ|交付)/, msg: "補助金を上限なしに受け取れるかのような表現" },
  { re: /(区と都|葛飾区と東京都|両方|両制度)[^。|]{0,10}(合わせ|あわせ|合計|合算|トータル)[^。|]{0,10}[\d０-９.]+\s*万?円|(合わせて|あわせて|合算すると|合計すると)[^。|]{0,10}[\d０-９.]+\s*万?円/, msg: "区と都の合計額" },
  // 「交付額は30万円となります」「30万円もらえます」のように、交付されることを金額つきで言い切る表現
  { re: /交付額は[^。]{0,16}[\d０-９][^。]{0,10}(となります|になります|です)|[\d０-９.]+\s*万?円(が|を|は)?(もらえます|受け取れます|交付されます|支給されます)(?!か)/, msg: "交付を金額つきで言い切る表現" },
  { re: /相場(は|として|が)[^。]{0,20}\d/, msg: "相場の具体額" },
  { re: /年間\s*[\d,，０-９]+\s*kWh|発電量(は|が)[^。]{0,15}[\d０-９]+\s*kWh/, msg: "発電量の具体値" },
  { re: /削減(額|率)(は|が)[^。]{0,15}[\d０-９]+|[\d０-９]+\s*(%|％)\s*(削減|節約|カット)/, msg: "削減率・削減額の具体値" },
  { re: /[A-Z]様|[ぁ-んァ-ン一-龥]{1,3}様の(お宅|ご自宅)|導入されたお客様|実際に導入した[^。]{0,10}様/, msg: "架空の事例になり得る表現" },
  { re: /(施工|導入|設置)(実績|件数)[^。]{0,14}[\d０-９]+\s*(件|棟|軒|世帯)|創業\s*[\d０-９]+|[\d０-９]+年の実績|No\.?1|ナンバーワン|地域一番|正規取扱|認定店|メーカー認定|自社施工|有資格者|資格を持つ/, msg: "確認できない実績・資格・認定" },
  { re: /究極|絶品|最安|激安|業界最|日本一|圧倒的/, msg: "大げさな広告表現" },
  ...UNSET_CONTACT,
  { re: /元が取れ(ます|るでしょう)|回収でき(ます|るでしょう)|[\d０-９]+年で(回収|元)/, msg: "投資回収の断定" },
  { re: /DR(に)?参加(すれば|すると|で)[^。]{0,12}上限(が|は)?(なくな|撤廃|無制限)/, msg: "DR参加で上限がなくなる等の断定" },
  { re: /すべての新築(住宅)?に(太陽光)?(が)?義務|新築は(すべて|全て)義務/, msg: "太陽光義務化の対象の誤り" },
  { re: /https?:\/\/|www\./i, msg: "本文中のURL" },
  { re: /私は(人間|スタッフ|担当者)|担当の[ぁ-んァ-ン一-龥]{1,4}(です|と申します)/, msg: "人間を名乗る表現" },
];

/**
 * 案内してよい電話番号（数字だけにしたもの）。
 * 事実シートに載っている公的窓口の番号と、lib/site.ts に入っている SOLAR SHIFT の番号だけ。
 */
const ALLOWED_PHONE_DIGITS = new Set(["0356548228", "0356548531", "0367377006", "0356548550", "0359905236", "0362585315", ...(SITE_TEL ? [SITE_TEL.replace(/\D/g, "")] : [])]);

/** 単価（円/kW・円/kWh）として書いてよい値（事実シートの値だけ） */
const ALLOWED_UNIT = new Set(["24", "8.3", "19", "4.18", "6万", "10万", "12万", "15万", "18万", "28.9万", "29.4万", "12.5万"]);

/**
 * 「上限」「最大」として書いてよい金額（円）。制度ごとの上限額だけ。
 * 金額のホワイトリストは計算例まで広く許すので、「葛飾区の太陽光は最大35万円」のような
 * 取り違えを通してしまう。上限・最大に続く金額だけは、この一覧で別に検査する。
 */
const ALLOWED_CAPS = new Set([300000, 200000, 150000, 450000, 360000, 1200000, 720000, 600000]);

export const MAX_REPLY_CHARS = 520;

function toHalfWidth(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[−－―‐]/g, "-");
}

/**
 * @param reply 画面に出そうとしている回答
 * @param userText 利用者が今回入力した文（利用者自身が書いた金額の復唱は許す）
 * @returns 問題点の一覧（空なら合格）
 */
export function checkReply(reply: string, userText = ""): string[] {
  const errors: string[] = [];
  const text = String(reply ?? "").trim();
  if (!text) return ["回答が空です"];
  if ([...text].length > MAX_REPLY_CHARS) errors.push(`回答が長すぎます（${[...text].length}字）`);

  for (const b of BANNED) if (b.re.test(text)) errors.push(b.msg);

  // 金額：事実シートの固定額・制度ルールから導ける額・利用者が書いた額だけ
  const allowed = allowedYenAmounts();
  for (const { value } of extractYenAmounts(userText)) allowed.add(value);
  for (const { raw, value } of extractYenAmounts(text)) {
    if (!allowed.has(value)) {
      errors.push(`検証済み一覧にない金額: ${raw}`);
      break;
    }
  }

  const half = toHalfWidth(text);
  for (const m of half.matchAll(/(?:上限|最大|最高)(?:額)?(?:は|で|が)?\s*(?:約)?\s*([\d.]+)\s*万円/g)) {
    const value = Math.round(parseFloat(m[1]) * 10000);
    if (!ALLOWED_CAPS.has(value)) {
      errors.push(`制度の上限額にない金額: ${m[0]}`);
      break;
    }
  }
  for (const m of half.matchAll(/([\d.]+万?)\s*円\s*\/\s*k(W|Wh)/g)) {
    if (!ALLOWED_UNIT.has(m[1])) {
      errors.push(`検証済み一覧にない単価: ${m[0]}`);
      break;
    }
  }
  if (/[\d.]+\s*(%|％)/.test(half)) errors.push("パーセント表記の数値");

  // 電話番号：ハイフン・かっこの有無にかかわらず、0 から始まる 10〜11 桁はすべて調べる
  for (const m of half.matchAll(/(?<![\d.])0\d(?:[-\s()（）]{0,2}\d){8,9}(?!\d)/g)) {
    if (!ALLOWED_PHONE_DIGITS.has(m[0].replace(/\D/g, ""))) {
      errors.push(`案内できない電話番号: ${m[0]}`);
      break;
    }
  }
  // 連絡先の話の中の時刻の範囲（9時〜18時 など）。営業時間が未確定の間は書かせない。決まったあとは lib/site.ts と同じ時刻だけ許す
  // （「昼の10時〜14時に発電が多い」のような一般論まで落とさないよう、連絡先の語がある文だけを見る）
  const siteHours = new Set((toHalfWidth(SITE_HOURS).match(/\d{1,2}(?=\s*[:：時])/g) ?? []).map(Number));
  for (const sentence of half.split(/[。\n]/)) {
    if (!/(受付|営業|電話|問い合わせ|窓口|対応|連絡|定休)/.test(sentence)) continue;
    const range = sentence.match(/(\d{1,2})\s*(?:時|:|：)\s*\d{0,2}\s*分?\s*(?:〜|～|~|-|から)\s*(\d{1,2})\s*(?:時|:|：)/);
    if (!range) continue;
    if (!SITE_HOURS) {
      errors.push("未確定の営業時間・受付時間（時刻の範囲）");
      break;
    }
    if (!siteHours.has(Number(range[1])) || !siteHours.has(Number(range[2]))) {
      errors.push("サイトの営業時間と違う時刻");
      break;
    }
  }
  return errors;
}
