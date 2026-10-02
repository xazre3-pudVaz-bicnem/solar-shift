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
    a: "葛飾区の公式案内には他制度との併用に関する明記がなく、東京都の案内は「都および公社の他の同種の助成金との重複受給は不可」としています。区と都の併用については、区の窓口と東京都（クール・ネット東京）にご自宅の条件で確認することをおすすめします。当サイトのシミュレーターでは、確認できていない併用を前提とした合算は行っていません。",
    link: { href: "/simulation", label: "補助金シミュレーターを使う" },
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
    a: "費用はパネルの容量、屋根の形状・材質、足場の要否、パワーコンディショナの種類などで大きく変わります。同じ容量でも屋根条件によって工事費が変わるため、現地調査をしたうえでの見積もりが必要です。SOLAR SHIFT では現地調査後に内訳を明示した見積もりをお出しします。",
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
    link: { href: "/guide/selling-electricity", label: "売電の仕組みと2026年度の価格" },
  },
  // ───────── 太陽光
  {
    id: "solar-roof",
    category: "solar",
    scope: "general",
    q: "どんな屋根でも太陽光パネルを設置できますか？",
    a: "設置できない屋根もあります。屋根の向き・勾配・面積・材質（スレート・瓦・金属など）・築年数・下地の状態・周囲の建物による影を確認する必要があります。葛飾区は隣家との距離が近い敷地が多く、影の影響の確認が特に大切です。",
    link: { href: "/guide/roof-conditions", label: "太陽光に向く屋根の条件" },
  },
  {
    id: "solar-lifespan",
    category: "solar",
    scope: "general",
    q: "太陽光パネルの寿命はどのくらいですか？",
    a: "太陽光パネル本体は一般に20〜30年程度使われることが多く、メーカーの出力保証は25年前後が主流です。一方、パワーコンディショナは10〜15年程度で交換が必要になるのが一般的です。長期の維持費を見込んで計画することをおすすめします。",
    link: { href: "/guide/solar-lifespan", label: "太陽光発電の寿命とメンテナンス" },
  },
  {
    id: "solar-blackout",
    category: "solar",
    scope: "general",
    q: "停電のとき、太陽光発電だけで電気は使えますか？",
    a: "太陽光のみの場合、日中にパワーコンディショナの自立運転機能で、専用コンセントから限られた電力（多くの機種で最大1.5kW程度）を使えます。夜間や雨天時は使えません。夜間や長期停電に備えるなら蓄電池との組み合わせが必要です。",
    link: { href: "/guide/blackout", label: "停電時の太陽光・蓄電池" },
  },
  // ───────── 蓄電池
  {
    id: "battery-capacity",
    category: "battery",
    scope: "general",
    q: "蓄電池の容量は何kWhを選べばいいですか？",
    a: "夜間に使う電力量と、停電時にどこまで備えたいかで決めます。一般的な家庭では5〜10kWh前後が選ばれることが多いですが、オール電化やEVの有無、太陽光の容量でも最適値は変わります。現地調査時に電気の使い方を伺って容量を提案します。",
    link: { href: "/guide/battery-how-to-choose", label: "蓄電池の選び方" },
  },
  {
    id: "battery-set",
    category: "battery",
    scope: "general",
    q: "太陽光と蓄電池は同時に導入したほうがいいですか？",
    a: "工事を1回にまとめられること、ハイブリッド型パワーコンディショナを選べること、葛飾区の併設加算（一律5万円）の対象になることが同時導入の主な利点です。一方、初期費用は大きくなります。すでに太陽光がある場合は、後付けできる機種もあります。",
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
    a: "葛飾区の助成を使う場合、事前協議の申し込みから回答書の到着まで数週間かかり、回答書が届いてから着工になります。機器の納期や足場の手配も含めると、相談から設置完了まで数か月を見込んでください。年度末は申請が集中しやすいため、早めの相談をおすすめします。",
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
    id: "service-sales",
    category: "service",
    scope: "service",
    q: "訪問販売や電話営業はありますか？",
    a: "SOLAR SHIFT から突然ご自宅へ訪問したり、電話で勧誘したりすることはありません。お問い合わせをいただいた方にのみご連絡します。なお葛飾区は特定の業者に営業・販売を委託しておらず、「区の委託業者」を名乗る勧誘にはご注意ください。",
  },
];

export function faqsByCategory(category: FaqCategory): FaqItem[] {
  return faqs.filter((f) => f.category === category);
}

export function faqsByIds(ids: string[]): FaqItem[] {
  return ids.map((id) => faqs.find((f) => f.id === id)).filter((f): f is FaqItem => Boolean(f));
}
