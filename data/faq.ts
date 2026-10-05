/**
 * よくある質問。
 * scope: "service" … SOLAR SHIFT 自身のこと（確認できる事実の範囲で書く）
 *        "general" … 太陽光・蓄電池・補助金の一般論
 * 補助金の金額は data/subsidies を参照する前提で、本文では「制度名・考え方」にとどめ、
 * 数値を書く場合は lastVerified と同じ基準日の情報だけを使う。
 */

import { siteConfig } from "../lib/site";

export type FaqCategory =
  | "subsidy"
  | "cost"
  | "solar"
  | "battery"
  | "v2h"
  | "install"
  | "service";

export interface FaqItem {
  id: string;
  category: FaqCategory;
  scope: "service" | "general";
  q: string;
  a: string;
  /** 詳しく読むページ */
  link?: { href: string; label: string };
}

export const faqCategoryLabel: Record<FaqCategory, string> = {
  subsidy: "補助金について",
  cost: "費用・経済性について",
  solar: "太陽光発電について",
  battery: "蓄電池について",
  v2h: "V2H・HEMSについて",
  install: "工事・導入の流れについて",
  service: "SOLAR SHIFT について",
};

export const faqs: FaqItem[] = [
  // ───────── 補助金
  {
    id: "subsidy-katsushika-overview",
    category: "subsidy",
    scope: "general",
    q: "葛飾区で太陽光発電を導入すると補助金はいくらもらえますか？",
    a: "葛飾区の「かつしかエコ助成金（個人住宅用）」では、2026年10月1日時点の公式情報で太陽光発電システムが6万円/kW（上限30万円）、蓄電池が助成対象経費の1/4（上限20万円）、太陽光と蓄電池の併設加算が一律5万円とされています。これとは別に東京都の助成制度もあります。実際の交付額は住宅条件・機器・申請時期で変わるため、最新情報は葛飾区の公式サイトでご確認ください。",
    link: { href: "/subsidy/katsushika", label: "葛飾区の補助金を詳しく見る" },
  },
  {
    id: "subsidy-pre-consultation",
    category: "subsidy",
    scope: "general",
    q: "かつしかエコ助成金は、工事の後から申請できますか？",
    a: "できません。かつしかエコ助成金は原則として工事着工の4週間前までに区へ事前協議を行い、区から事前協議回答書が届いてから工事に入る必要があります。回答書が届く前に着工した場合は対象外です。契約日ではなく「着工日」から逆算してスケジュールを組んでください。",
    link: { href: "/flow", label: "導入までの流れを見る" },
  },
  {
    id: "subsidy-combination",
    category: "subsidy",
    scope: "general",
    q: "葛飾区と東京都の補助金は併用できますか？",
    a: "併用できます。葛飾区の案内（令和8年度）には「国や都の補助制度との併用も可能」と明記されています。ただし、補助金の合計が助成対象経費を上回る場合は、上回る額が減額されます。東京都の助成も、国や区市町村の補助金を受ける場合は、合計が助成対象経費を超えない範囲で交付されます。合計は見積もりの金額によって変わるため、当サイトのシミュレーターでは区と都の金額を別々に表示しています。",
    link: { href: "/simulation", label: "補助金シミュレーターを使う" },
  },
  {
    id: "subsidy-katsushika-addon-existing",
    category: "subsidy",
    scope: "general",
    q: "太陽光がすでにある家に蓄電池を後から付ける場合も、併設加算の対象ですか？",
    a: "対象になります。葛飾区の案内では、併設加算の要件は「一方の既に設置済みの機器に併設する場合」と「両方の機器を同時に設置する場合」のいずれかとされています。併設の対象となる、いずれかの機器の申請が条件です。既設の太陽光に蓄電池を併設する場合は、電力会社が発行した、売電を確認できる書類の写しを添付します。",
    link: { href: "/subsidy/katsushika#documents", label: "必要書類のチェックリストを見る" },
  },
  {
    id: "subsidy-katsushika-change",
    category: "subsidy",
    scope: "general",
    q: "事前協議を申し込んだあとで、機種や容量を変更できますか？",
    a: "原則としてできません。葛飾区の案内では、事前協議書の提出後は、やむを得ない事情を除いて申請内容の変更を認めないとされています。機種・容量・見積もりの内容を固めてから申し込むことが大切です。",
    link: { href: "/subsidy/katsushika#before-construction", label: "着工前のチェックを見る" },
  },
  {
    id: "subsidy-katsushika-rental",
    category: "subsidy",
    scope: "general",
    q: "賃貸や、家族名義の住宅でも、かつしかエコ助成金を申請できますか？",
    a: "賃貸住宅・使用貸借住宅の場合は、住宅の所有者から機器の導入について同意を得ていれば対象になります（同意書を提出します）。ただし、申請者・居住者・領収書の名義人・助成金の振込先の名義人は、同じ人である必要があります。リース・レンタルでの導入は対象外です。",
    link: { href: "/subsidy/katsushika#eligibility", label: "対象になる方の要件を見る" },
  },
  {
    id: "subsidy-katsushika-payment",
    category: "subsidy",
    scope: "general",
    q: "かつしかエコ助成金は、いつ振り込まれますか？",
    a: "工事のあとに完了報告（交付申請）を提出し、区の審査を経て、交付額確定通知書が届いてからの交付です。区は通常3〜4週間程度で処理していると案内していますが、申請が集中した場合は長くなり、令和7年度は最大で6か月程度かかったとされています。助成金の支払いは、交付額確定通知書の発送後、4週間程度です。完了報告の最終提出期限は2027年12月28日（必着）です。",
    link: { href: "/subsidy/katsushika#flow", label: "申請の時系列を見る" },
  },
  {
    id: "subsidy-tokyo-overview",
    category: "subsidy",
    scope: "general",
    q: "東京都の太陽光補助金はいくらですか？",
    a: "東京都（クール・ネット東京）の「家庭における太陽光発電導入促進事業」では、2026年10月1日時点で既存住宅が3.75kW以下15万円/kW（上限45万円）・3.75kW超12万円/kW、新築住宅が3.6kW以下12万円/kW（上限36万円）・3.6kW超10万円/kWとされています。蓄電池は別の事業で10万円/kWh（DR実証に参加しない場合は原則上限120万円/戸）です。",
    link: { href: "/subsidy/tokyo", label: "東京都の補助金を詳しく見る" },
  },
  {
    id: "subsidy-tokyo-battery-sii",
    category: "subsidy",
    scope: "general",
    q: "東京都の蓄電池助成で、2026年10月から変わった点はありますか？",
    a: "2026年10月1日以降に事前申込をする場合、助成対象の蓄電池はSII（環境共創イニシアチブ）が登録している機器に限られます。検討している機種が登録済みかどうかを、申込前に必ず確認してください。",
    link: { href: "/subsidy/tokyo", label: "東京都の補助金を詳しく見る" },
  },
  {
    id: "subsidy-national",
    category: "subsidy",
    scope: "general",
    q: "国の補助金は使えますか？",
    a: "家庭用蓄電池向けの国の「DR家庭用蓄電池事業（令和7年度補正）」は2026年5月29日に予算到達で公募終了、V2H向けのCEV補助金も2026年8月27日に受付終了しています（2026年10月1日時点）。次回公募は未確定です。国の制度は年度途中で状況が変わるため、最新の公募状況は公式サイトでご確認ください。",
    link: { href: "/subsidy/national", label: "国の補助制度を見る" },
  },
  {
    id: "subsidy-guarantee",
    category: "subsidy",
    scope: "service",
    q: "SOLAR SHIFT に頼めば補助金は必ずもらえますか？",
    a: "いいえ。補助金の交付可否は、自治体の審査、予算の状況、住宅や機器の条件によって決まります。SOLAR SHIFT は制度の整理・申請スケジュールの逆算・必要書類の準備をサポートしますが、交付を保証することはできません。",
  },
  // ───────── 費用
  {
    id: "cost-solar",
    category: "cost",
    scope: "general",
    q: "太陽光発電の設置費用はいくらくらいですか？",
    a: "費用は、パネルの容量、屋根の形状・材質、足場の要否、パワーコンディショナの種類などで変わります。太陽光発電協会が紹介している経済産業省の資料では、2025年のシステム費用は、10kW未満の新築設置で平均28.9万円/kWでした（全国の平均で、SOLAR SHIFT の見積もり額ではありません）。既存の住宅では屋根条件によって工事費が変わるため、現地調査をしたうえで、内訳を分けた見積もりをお出しします。",
    link: { href: "/guide/solar-cost", label: "太陽光発電の費用の考え方" },
  },
  {
    id: "cost-battery",
    category: "cost",
    scope: "general",
    q: "蓄電池の価格はどのくらいですか？",
    a: "蓄電容量（kWh）、全負荷型か特定負荷型か、ハイブリッド型か単機能型か、設置場所（屋内・屋外）で変わります。東京都の助成は10万円/kWhで助成対象経費（税抜）が上限になるため、容量と費用のバランスを見ながら機種を選ぶことが大切です。",
    link: { href: "/guide/battery-cost", label: "蓄電池の費用の考え方" },
  },
  {
    id: "cost-payback",
    category: "cost",
    scope: "general",
    q: "太陽光発電は何年で元が取れますか？",
    a: "設置費用、補助金の額、ご家庭の電気使用量と使う時間帯、売電価格、屋根の向きと日射条件によって変わるため、一律には言えません。2026年度のFIT制度では10kW未満の住宅用で最初の4年間が24円/kWh、5〜10年目が8.3円/kWhと前半に手厚い設定になっています。現地調査とご家庭の電気使用量をもとに、試算をお出しします。",
    link: { href: "/guide/solar-payback", label: "回収年数の計算の考え方と試算" },
  },
  // ───────── 太陽光
  {
    id: "solar-roof",
    category: "solar",
    scope: "general",
    q: "どんな屋根でも太陽光パネルを設置できますか？",
    a: "設置できない屋根もあります。屋根の向き・勾配・面積・材質（スレート・瓦・金属など）・築年数・下地の状態・周囲の建物による影を確認する必要があります。隣の建物との距離が近い敷地では、影の影響の確認が特に大切です。",
    link: { href: "/guide/roof-conditions", label: "太陽光に向く屋根の条件" },
  },
  {
    id: "solar-lifespan",
    category: "solar",
    scope: "general",
    q: "太陽光パネルの寿命はどのくらいですか？",
    a: "太陽光発電協会（JPEA）によると、太陽電池モジュールの耐用年数は20年以上、パワーコンディショナは10〜15年といわれています。出力保証や機器保証の年数は、メーカー・製品によって異なります。長期の維持費を見込んで計画することをおすすめします。",
    link: { href: "/guide/solar-lifespan", label: "太陽光発電の寿命とメンテナンス" },
  },
  {
    id: "solar-blackout",
    category: "solar",
    scope: "general",
    q: "停電のとき、太陽光発電だけで電気は使えますか？",
    a: "太陽光のみの場合、日中にパワーコンディショナの自立運転機能で、専用コンセントから限られた電力を使えます（上限は機種によって異なります）。夜間や雨天時は使えません。夜間や長期停電に備えるなら蓄電池との組み合わせが必要です。",
    link: { href: "/guide/blackout", label: "停電時の太陽光・蓄電池" },
  },
  // ───────── 蓄電池
  {
    id: "battery-capacity",
    category: "battery",
    scope: "general",
    q: "蓄電池の容量は何kWhを選べばいいですか？",
    a: "夜間に使う電力量と、停電時にどこまで備えたいかで決めます。オール電化やEVの有無、太陽光の容量でも、合う容量は変わります。現地調査時に電気の使い方を伺って容量を提案します。",
    link: { href: "/guide/battery-how-to-choose", label: "蓄電池の選び方" },
  },
  {
    id: "battery-set",
    category: "battery",
    scope: "general",
    q: "太陽光と蓄電池は同時に導入したほうがいいですか？",
    a: "工事を1回にまとめられること、ハイブリッド型パワーコンディショナを選べることが、同時導入の主な利点です。一方、初期費用は大きくなります。葛飾区の併設加算（一律5万円）は、同時に設置する場合も、すでにある太陽光に蓄電池を足す場合も対象です。",
    link: { href: "/solar-battery", label: "太陽光＋蓄電池について" },
  },
  // ───────── V2H・HEMS
  {
    id: "v2h-what",
    category: "v2h",
    scope: "general",
    q: "V2Hとは何ですか？",
    a: "V2H（Vehicle to Home）は、電気自動車（EV・PHEV）のバッテリーに蓄えた電気を家庭で使えるようにする設備です。太陽光で発電した電気をEVに充電し、夜間や停電時に家で使うことができます。対応車種と対応機器の組み合わせに制限があります。",
    link: { href: "/v2h", label: "V2Hについて詳しく" },
  },
  {
    id: "hems-what",
    category: "v2h",
    scope: "general",
    q: "HEMSは必要ですか？",
    a: "HEMS（ホームエネルギーマネジメントシステム）は、発電・蓄電・消費の状況を見える化し、機器を制御する仕組みです。必須ではありませんが、葛飾区では太陽光とHEMSの併設加算（一律1万円）があり、東京都の蓄電池助成でもDR実証参加時にエネルギーマネジメント機器の有無で加算が変わります。",
    link: { href: "/hems", label: "HEMSについて詳しく" },
  },
  // ───────── 導入の流れ
  {
    id: "install-period",
    category: "install",
    scope: "general",
    q: "相談から設置完了までどのくらいかかりますか？",
    a: "葛飾区の助成を使う場合、事前協議は着工の4週間前までに申し込み、回答書が届いてから着工します。区の案内では、申込受付から回答書の到着まで3〜4週間程度とされています。これに現地調査・見積もり・機器の納期・工事の日程が加わるため、期間は住宅や機器によって変わります。ご相談の際に、着工日から逆算した予定をお出しします。",
    link: { href: "/flow", label: "導入までの流れを見る" },
  },
  {
    id: "install-survey",
    category: "install",
    scope: "service",
    q: "現地調査は無料ですか？",
    a: "現地調査・お見積もりは無料です。調査では屋根の状態、分電盤、設置スペース、周囲の影の状況などを確認します。",
  },
  // ───────── サービス
  {
    id: "service-company",
    category: "service",
    scope: "service",
    q: "SOLAR SHIFT はどんな会社が運営していますか？",
    a: `${siteConfig.company.address.locality}の${siteConfig.company.name}が運営する、太陽光発電・蓄電池事業のブランドです。葛飾区を中心に、足立区・江戸川区・墨田区など周辺エリアに対応しています。`,
    link: { href: "/company", label: "運営会社を見る" },
  },
  {
    id: "service-area",
    category: "service",
    scope: "service",
    q: "対応エリアはどこですか？",
    a: "主要対応エリアは東京都葛飾区です。足立区・江戸川区・墨田区など葛飾区周辺にも対応しています。千葉県松戸市など他の地域は個別にご相談ください。",
    link: { href: "/area", label: "対応エリアを見る" },
  },
  {
    id: "service-hours",
    category: "service",
    scope: "service",
    q: "営業時間を教えてください。",
    a: `営業時間は${siteConfig.contact.hours}です。お電話（${siteConfig.contact.telDisplay}）、メール、お問い合わせフォームでご連絡いただけます。`,
    link: { href: "/contact", label: "お問い合わせ" },
  },
  {
    id: "service-makers",
    category: "service",
    scope: "service",
    q: "どのメーカーの太陽光パネル・蓄電池を扱っていますか？",
    a: "Qセルズ、カナディアン・ソーラー、長州産業、シャープ、パナソニック、オムロン、ニチコンなど、国内外の主要メーカーを取り扱っています。ここに無いメーカーについても、ご相談ください。機種の数が多いため、個別の商品や価格はサイトに掲載していません。屋根と電気の使い方を伺ったうえで、機種をご提案します。",
    link: { href: "/products", label: "取扱メーカーと、機器の比べ方を見る" },
  },
  {
    id: "service-works",
    category: "service",
    scope: "service",
    q: "施工事例はありますか？",
    a: "掲載の許可をいただいたお客様の事例を、施工事例のページで紹介しています。ご家族の構成、導入した設備、導入前後の電気代をまとめています。電気代は季節や使い方で変わるため、同じ結果を保証するものではありません。",
    link: { href: "/works", label: "施工事例を見る" },
  },
  {
    id: "service-sales",
    category: "service",
    scope: "service",
    q: "訪問販売で「区の委託業者」と言われました。SOLAR SHIFT と関係がありますか？",
    a: "関係ありません。葛飾区は、特定の業者に営業・販売を委託することも、業者を紹介することもないと案内しています。SOLAR SHIFT も、区から委託を受けた業者ではありません。SOLAR SHIFT へのご相談は、お問い合わせフォーム・メール・お電話でお受けし、いただいた内容に応じてご案内します。なお区は、複数の業者から見積もりを取ることを勧めています。",
    link: { href: "/area/katsushika", label: "業者を選ぶときに確かめること" },
  },
];

export function faqsByCategory(category: FaqCategory): FaqItem[] {
  return faqs.filter((f) => f.category === category);
}

export function faqsByIds(ids: string[]): FaqItem[] {
  return ids.map((id) => faqs.find((f) => f.id === id)).filter((f): f is FaqItem => Boolean(f));
}
