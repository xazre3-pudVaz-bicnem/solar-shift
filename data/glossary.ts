import { sources, type VerifiedSource } from "./sources";
import { getSubsidy } from "./subsidies";
import { KATSUSHIKA_PRE_CONSULTATION_WEEKS, KATSUSHIKA_REPORT_DEADLINE, KATSUSHIKA_REPORT_WITHIN_MONTHS } from "./subsidies/katsushika-details";
import { fit } from "./fit";
import { solarAssumptions } from "./solar-assumptions";

/**
 * 用語集（/glossary）。見積書・区の案内・申請書類に出てくる言葉の、短い説明。
 *
 * - 説明は、事実シート（docs/VERIFIED_FACTS.md）で確かめられる内容だけで書く。出どころのある語には source を付ける。
 * - 金額・期間は、ここに直接書かずに data/subsidies・data/fit などから組み立てる（制度が変わったら、元のデータだけを直す）。
 * - 1語あたり2〜3文。くわしい説明は、link のページに任せる（用語集で同じ説明を繰り返さない）。
 */
export type GlossaryGroup = "subsidy" | "selling" | "equipment" | "contract";

export const glossaryGroupLabel: Record<GlossaryGroup, string> = {
  subsidy: "補助金・申請のことば",
  selling: "売電・電気代のことば",
  equipment: "機器のことば",
  contract: "契約のことば",
};

export interface GlossaryTerm {
  /** ページ内のアンカー（#id） */
  id: string;
  term: string;
  /** よみがな（並べ替えと検索に使う） */
  reading: string;
  group: GlossaryGroup;
  definition: string;
  link?: { href: string; label: string };
  source?: VerifiedSource;
}

const ks = getSubsidy("katsushika-solar")!;
const kb = getSubsidy("katsushika-battery")!;
const addon = getSubsidy("katsushika-solar-battery-addon")!;
const dr = getSubsidy("national-dr-battery")!;
const [fitEarly, fitLate] = fit.residential.steps;

export const glossary: GlossaryTerm[] = [
  // ───────── 補助金・申請
  {
    id: "katsushika-eco",
    term: "かつしかエコ助成金",
    reading: "かつしかえこじょせいきん",
    group: "subsidy",
    definition: `葛飾区が、太陽光発電システムや蓄電池などを導入する費用の一部を助成する制度です。個人住宅用の${ks.fiscalYear.split("（")[0]}の助成額は、太陽光発電が${ks.amount}（${ks.maxAmount}）、蓄電池が${kb.amount}（${kb.maxAmount}）です。`,
    link: { href: "/subsidy/katsushika", label: "葛飾区の補助金" },
    source: sources.katsushikaPage,
  },
  {
    id: "pre-consultation",
    term: "事前協議",
    reading: "じぜんきょうぎ",
    group: "subsidy",
    definition: `かつしかエコ助成金で、工事を始める前に区へ申し込む手続きです。原則として、工事着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに、事前協議書を提出します。`,
    link: { href: "/subsidy/katsushika#flow", label: "申請の時系列" },
    source: sources.katsushikaGuide,
  },
  {
    id: "pre-consultation-reply",
    term: "事前協議回答書",
    reading: "じぜんきょうぎかいとうしょ",
    group: "subsidy",
    definition: "事前協議の審査のあと、区から郵送される書類です。回答書が届く前に工事を始めると、助成の対象外になります。区の案内では、申込の受付から到着まで、3〜4週間程度です。",
    link: { href: "/subsidy/katsushika#before-construction", label: "着工前のチェック" },
    source: sources.katsushikaPage,
  },
  {
    id: "completion-report",
    term: "完了報告",
    reading: "かんりょうほうこく",
    group: "subsidy",
    definition: `工事のあとに、完了報告書兼助成金交付申請書を区へ提出する手続きです。工事が完了してから${KATSUSHIKA_REPORT_WITHIN_MONTHS}か月以内に提出することが前提で、最終の提出期限は${KATSUSHIKA_REPORT_DEADLINE}（必着）です。`,
    link: { href: "/subsidy/katsushika#official-qa", label: "事前協議書の書き方・提出のQ&A" },
    source: sources.katsushikaQa,
  },
  {
    id: "addon",
    term: "併設加算",
    reading: "へいせつかさん",
    group: "subsidy",
    definition: `太陽光発電システムと蓄電池を併設したときに、葛飾区の助成に加わる金額です。どちらかの機器に上乗せするのではなく、独立して${addon.amount}が加算されます。すでにある機器に足す場合も、同時に設置する場合も対象です。`,
    link: { href: "/solar-battery", label: "太陽光＋蓄電池のセット導入" },
    source: sources.katsushikaQa,
  },
  {
    id: "eligible-cost",
    term: "助成対象経費",
    reading: "じょせいたいしょうけいひ",
    group: "subsidy",
    definition: "助成金を計算するもとになる費用です。かつしかエコ助成金では、対象となる機器の本体価格と、工事代の合計です。区や都の補助金の合計は、この経費が上限になります。",
    link: { href: "/subsidy/katsushika#combination", label: "国・東京都の補助金との併用" },
    source: sources.katsushikaGuide,
  },
  {
    id: "tax-payment-certificate",
    term: "納税証明書",
    reading: "のうぜいしょうめいしょ",
    group: "subsidy",
    definition: "税金を滞納していないことを示す証明書です。かつしかエコ助成金の申し込みに必要で、「課税証明書」では代わりになりません。発行後3か月以内の原本を提出します。",
    link: { href: "/subsidy/katsushika#documents", label: "必要書類のチェックリスト" },
    source: sources.katsushikaGuide,
  },
  {
    id: "cool-net-tokyo",
    term: "クール・ネット東京",
    reading: "くーるねっととうきょう",
    group: "subsidy",
    definition: "東京都地球温暖化防止活動推進センターの愛称です。東京都の、家庭向けの太陽光発電・蓄電池の助成の窓口になっています。",
    link: { href: "/subsidy/tokyo", label: "東京都の補助金" },
    source: sources.tokyoSolarPage,
  },
  {
    id: "sii",
    term: "SII（環境共創イニシアチブ）",
    reading: "えすあいあい",
    group: "subsidy",
    definition: "国の補助事業を執行している団体です。蓄電システムの製品を登録していて、葛飾区と東京都の蓄電池の助成は、SIIに登録された機器が対象です。",
    link: { href: "/battery", label: "家庭用蓄電池の選び方" },
    source: sources.siiBatteryRegistration,
  },
  {
    id: "dr-subsidy",
    term: "DR補助金",
    reading: "でぃーあーるほじょきん",
    group: "subsidy",
    definition: `家庭用の蓄電システムを対象にした、国の補助金です。正式な名前は「${dr.programName}」です。令和7年度補正の事業は、${dr.amount}（${dr.maxAmount}）で、2026年5月29日に公募を終了しています。`,
    link: { href: "/subsidy/national", label: "国の補助制度" },
  },
  // ───────── 売電・電気代
  {
    id: "fit",
    term: "FIT（固定価格買取制度）",
    reading: "ふぃっと",
    group: "selling",
    definition: `太陽光などで発電した電気を、決まった価格で、決まった期間、電力会社が買い取る制度です。${fit.fiscalYear}の住宅用（10kW未満）は、${fitEarly.label}が${fitEarly.yenPerKwh}円/kWh、${fitLate.label}が${fitLate.yenPerKwh}円/kWhで、期間は${fit.residential.termYears}年です。`,
    link: { href: "/guide/selling-electricity", label: "売電とFIT価格" },
  },
  {
    id: "initial-investment-scheme",
    term: "初期投資支援スキーム",
    reading: "しょきとうししえんすきーむ",
    group: "selling",
    definition: `FITの買取価格を、最初の4年間は高く、5年目からは低くする仕組みです。${fit.fiscalYear}の住宅用では、${fitEarly.yenPerKwh}円/kWhから${fitLate.yenPerKwh}円/kWhに下がります。`,
    link: { href: "/blog/fit-24yen-initial-investment-scheme", label: "FIT価格24円の仕組み" },
  },
  {
    id: "post-fit",
    term: "卒FIT",
    reading: "そつふぃっと",
    group: "selling",
    definition: `FITの買取期間（住宅用は${fit.residential.termYears}年）が終わることです。終わったあとも、余った電気は売ることができます。単価は、電力会社ごとに決まります。`,
    link: { href: "/guide/post-fit", label: "卒FIT後の選択肢" },
    source: sources.jpeaSellUser,
  },
  {
    id: "surplus-selling",
    term: "余剰売電",
    reading: "よじょうばいでん",
    group: "selling",
    definition: "発電した電気をまず自宅で使い、余った分だけを電力会社に売る方式です。10kW未満の住宅用太陽光発電は、この方式です。売り買いは、自動で行われます。",
    link: { href: "/guide/selling-electricity", label: "売電とFIT価格" },
    source: sources.jpeaSelling,
  },
  {
    id: "self-consumption",
    term: "自家消費",
    reading: "じかしょうひ",
    group: "selling",
    definition: "発電した電気を、売らずに自宅で使うことです。そのぶん、電力会社から買う電気が減ります。蓄電池があると、昼にためた電気を夜に使えるので、自家消費を増やせます。",
    link: { href: "/solar-battery", label: "太陽光＋蓄電池のセット導入" },
    source: sources.jpeaAbout,
  },
  {
    id: "surplus-sell-rate",
    term: "余剰売電比率",
    reading: "よじょうばいでんひりつ",
    group: "selling",
    definition: `発電した電気のうち、売った分の割合です。国の委員会は、住宅用の買取価格を決めるときに、${solarAssumptions.surplusSellPercent}％と想定しています。残りの${solarAssumptions.selfUsePercent}％が、自宅で使う分です。`,
    link: { href: "/guide/solar-payback", label: "回収年数の計算の考え方" },
    source: sources.metiProcurementOpinion,
  },
  {
    id: "payback-years",
    term: "回収年数",
    reading: "かいしゅうねんすう",
    group: "selling",
    definition: "設置費用から補助金を引いた実質の負担額を、1年あたりの効果額で割った年数です。設置費用・屋根の条件・電気の使い方で変わるため、わが家の数字で計算します。",
    link: { href: "/guide/solar-payback", label: "回収年数の計算の考え方" },
  },
  {
    id: "kw-kwh",
    term: "kW と kWh",
    reading: "きろわっと",
    group: "selling",
    definition: "kW（キロワット）は、一度に出せる電気の大きさです。太陽光発電の容量に使います。kWh（キロワットアワー）は、電気の量です。蓄電池の容量や、発電量・使用量に使います。",
    link: { href: "/solar", label: "住宅用太陽光発電" },
  },
  // ───────── 機器
  {
    id: "module",
    term: "太陽電池モジュール",
    reading: "たいようでんちもじゅーる",
    group: "equipment",
    definition: "太陽の光のエネルギーを、電気に変える装置です。太陽光パネルとも呼ばれます。",
    link: { href: "/products/solar", label: "太陽光パネルの比べ方" },
    source: sources.jpeaAbout,
  },
  {
    id: "power-conditioner",
    term: "パワーコンディショナ",
    reading: "ぱわーこんでぃしょな",
    group: "equipment",
    definition: "太陽電池モジュールで発電した直流の電気を、家庭で使える交流の電気に変える装置です。パワコンとも呼ばれます。",
    link: { href: "/blog/power-conditioner-replacement-timing", label: "パワーコンディショナの交換時期" },
    source: sources.jpeaAbout,
  },
  {
    id: "battery",
    term: "蓄電池",
    reading: "ちくでんち",
    group: "equipment",
    definition: "電気をためる装置です。昼に発電した電気をためて夜に使うことで、自家消費を増やせます。電気をためてあれば、停電のときにも使えます。",
    link: { href: "/battery", label: "家庭用蓄電池の選び方" },
    source: sources.jpeaAbout,
  },
  {
    id: "standalone-operation",
    term: "自立運転",
    reading: "じりつうんてん",
    group: "equipment",
    definition: "停電のときに、太陽光発電の電気を、専用のコンセントから使う機能です。太陽光発電協会は、使える電力は最大1.5kWで、日射量によって変わる、と説明しています。操作の方法は、メーカーや機種によって違います。",
    link: { href: "/guide/blackout", label: "停電時の備え" },
    source: sources.jpeaMerit,
  },
  {
    id: "grid-connection",
    term: "系統連系",
    reading: "けいとうれんけい",
    group: "equipment",
    definition: "太陽光発電システムを、電力会社の電線につなぐことです。かつしかエコ助成金の太陽光発電は、申込者が、電力会社と系統連系の契約を結ぶことが条件です。",
    link: { href: "/flow", label: "導入の流れ" },
    source: sources.katsushikaGuide,
  },
  {
    id: "v2h",
    term: "V2H",
    reading: "ぶいつーえいち",
    group: "equipment",
    definition: "Vehicle to Home の略です。電気自動車のバッテリーにためた電気を、家庭で使えるようにする設備です。",
    link: { href: "/v2h", label: "V2Hとは" },
  },
  {
    id: "hems",
    term: "HEMS",
    reading: "へむす",
    group: "equipment",
    definition: "Home Energy Management System の略です。発電量、蓄電池の残量、家の消費電力を1つの画面で確かめ、機器を制御する仕組みです。",
    link: { href: "/hems", label: "HEMSとは" },
  },
  {
    id: "periodic-inspection",
    term: "定期点検",
    reading: "ていきてんけん",
    group: "equipment",
    definition: "専門の業者に依頼する点検です。太陽光発電協会は、設置後1年目と、その後は4年に1度の点検を推奨しています。",
    link: { href: "/guide/maintenance", label: "メンテナンス" },
    source: sources.jpeaLongUser,
  },
  // ───────── 契約
  {
    id: "ppa-lease",
    term: "PPA・リース",
    reading: "ぴーぴーえー",
    group: "contract",
    definition: "設置の初期費用を事業者が負担し、利用者は電気料金やリース代を月々支払う、導入の方法です。期間中の所有権は、事業者にあります。かつしかエコ助成金は、リース・レンタルを対象外にしています。",
    link: { href: "/subsidy/katsushika#eligibility", label: "対象になる方の要件" },
    source: sources.jpeaMethod,
  },
  {
    id: "cooling-off",
    term: "クーリング・オフ",
    reading: "くーりんぐおふ",
    group: "contract",
    definition: "訪問販売で契約したあとでも、法律で決められた書面を受け取った日から数えて8日以内であれば、申込みの撤回や契約の解除ができる制度です。個別の契約が対象になるかどうかは、消費生活センターで確かめられます。",
    link: { href: "/area/katsushika#checkpoints", label: "業者を選ぶときに確かめること" },
    source: sources.caaDoorToDoorSales,
  },
  {
    id: "hotline-188",
    term: "消費者ホットライン188",
    reading: "しょうひしゃほっとらいん",
    group: "contract",
    definition: "身近な消費生活センターや、消費生活相談の窓口を案内する電話番号です。相談は無料です。相談窓口につながった時点から、通話料金がかかります。",
    source: sources.caaHotline188,
  },
  {
    id: "itemized-quote",
    term: "見積書の内訳",
    reading: "みつもりしょのうちわけ",
    group: "contract",
    definition: "機器の本体・工事費・調整額を、それぞれ分けて書いたものです。かつしかエコ助成金の申し込みでは、「一式」とだけ書かれた見積書には、内訳書を付ける必要があります。",
    link: { href: "/blog/solar-quote-how-to-read", label: "太陽光の見積書の見方" },
    source: sources.katsushikaSolarHandbook,
  },
];

export function glossaryByGroup(group: GlossaryGroup): GlossaryTerm[] {
  return glossary.filter((t) => t.group === group);
}
