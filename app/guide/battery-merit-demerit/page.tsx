import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { sources as verified } from "@/data/sources";
import { getSubsidy } from "@/data/subsidies";
import { fit } from "@/data/fit";
import { surcharge, surchargeYen } from "@/data/surcharge";
import { solarAssumptions as A } from "@/data/solar-assumptions";
import { reveal, growDelay } from "@/lib/reveal";
import { GuideArticle } from "@/components/sections/GuideArticle";

/**
 * 家庭用蓄電池のメリット・デメリットのガイド。
 * 検索意図：「蓄電池 メリット デメリット」「蓄電池 いらない」「蓄電池 後悔」
 * ＝ 付けるべきか、付けなくてよいかを判断する材料がほしい。
 *
 * - 容量の決め方は /guide/battery-how-to-choose、費用は /guide/battery-cost、機器の全体像は /battery が受ける。
 *   ここは「付けるかどうか」の判断材料に絞る。
 * - 寿命・保証の年数は、SII の登録基準として書けることだけ。個々の製品の寿命は「メーカー・製品によって異なる」。
 * - 相場の金額は書かない。国の DR 事業の目標価格は、その事業の要件として書く。
 */
const entry = getGuide("battery-merit-demerit")!;
const kb = getSubsidy("katsushika-battery")!;
const addon = getSubsidy("katsushika-solar-battery-addon")!;
const tb = getSubsidy("tokyo-battery")!;
const [early, late] = fit.residential.steps;
const unit = surchargeYen(surcharge.yenPerKwh);

export const metadata: Metadata = buildMetadata({
  title: entry.title,
  description: `家庭用蓄電池はいらない？昼の電気を夜に回せる・停電に備えられるメリットと、費用・容量の劣化・置き場所のデメリットを、SIIの登録基準や国・東京都・葛飾区の資料で整理。向いている家の目安と、使える補助金もまとめました。`,
  path: entry.path,
  keywords: ["蓄電池 メリット デメリット", "蓄電池 いらない", "蓄電池 後悔", "家庭用蓄電池 必要か", "蓄電池 補助金 葛飾区"],
  type: "article",
  publishedTime: entry.publishedAt,
  modifiedTime: entry.updatedAt,
});

/** メリットとデメリットを並べた図 */
function BalanceFigure() {
  const merits = ["昼に余った太陽光の電気を、夜に使える", "買う電気が減り、その分の再エネ賦課金も減る", "FITの単価が下がったあとも、電気を活かせる", "停電のときに、ためた電気を使える"];
  const demerits = ["設置の費用がかかる", "使うほど、ためられる量は少しずつ減る", "置き場所と、浸水への備えが要る", "停電時に使える範囲は、機種の型で違う"];
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">蓄電池のメリットとデメリット</figcaption>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card" {...reveal(0, "left")}>
          <p className="inline-block rounded-full bg-green-600 px-3 py-1 text-[13px] font-black text-white">メリット</p>
          <ul className="mt-3 space-y-2">
            {merits.map((m) => (
              <li key={m} className="flex gap-2 text-[15px] leading-[1.7] text-ink">
                <span className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card" {...reveal(120, "right")}>
          <p className="inline-block rounded-full bg-orange-500 px-3 py-1 text-[13px] font-black text-navy-900">デメリット・注意点</p>
          <ul className="mt-3 space-y-2">
            {demerits.map((m) => (
              <li key={m} className="flex gap-2 text-[15px] leading-[1.7] text-ink">
                <span className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">どれがどれだけ効くかは、太陽光の容量、昼と夜の電気の使い方、住まいの条件で変わります。</p>
    </figure>
  );
}

/** 買う電気の単価と、売る電気の単価のちがい */
function PriceGapFigure() {
  const rows = [
    { label: "買う電気の単価", sub: `国の委員会の資料の平均値（${A.retailPeriod}）`, value: A.retailYenPerKwh, tone: "bg-orange-500" },
    { label: `売る電気（${early.label}）`, sub: `${fit.fiscalYear}のFIT`, value: early.yenPerKwh, tone: "bg-green-500" },
    { label: `売る電気（${late.label}）`, sub: `${fit.fiscalYear}のFIT`, value: late.yenPerKwh, tone: "bg-green-500" },
  ];
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">
        買う電気と、売る電気の単価<span className="ml-2 inline-block text-[13px] font-bold text-ink-2">1kWhあたり</span>
      </figcaption>
      <ul className="mt-5 space-y-4" {...reveal()}>
        {rows.map((r, i) => (
          <li key={r.label} className="grid gap-1.5 sm:grid-cols-[13rem_1fr] sm:items-center sm:gap-4">
            <p className="text-[14px] leading-[1.5] font-bold text-navy-900">
              {r.label}
              <span className="block text-[12px] font-normal text-ink-2">{r.sub}</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-white">
                <div className={`grow-x h-full rounded-full ${r.tone}`} style={{ width: `${Math.max(4, (r.value / max) * 100)}%`, ...growDelay(150 + i * 120) }} />
              </div>
              <p className="w-[6.5rem] shrink-0 text-right">
                <span className="font-en text-[18px] font-extrabold text-navy-900">{r.value}</span>
                <span className="ml-0.5 text-[12px] font-bold text-ink-2">円/kWh</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">
        買う電気の単価は、調達価格等算定委員会の資料にある、大手電力の家庭用電気料金単価の平均に消費税を加味した値です。わが家の単価は検針票で確かめます。買う電気には、このほかに再エネ賦課金（{surcharge.fiscalYear}は{unit}円/kWh）がかかります。
      </p>
    </figure>
  );
}

export default function Page() {
  return (
    <GuideArticle
      entry={entry}
      conclusion={`家庭用蓄電池のメリットは、昼に太陽光でつくって余った電気をためて夜に使えることと、停電のときにためた電気を使えることです。${fit.fiscalYear}のFITでは住宅用の売電単価が${late.label}に${late.yenPerKwh}円/kWhへ下がり、国の委員会の資料にある買う電気の単価の平均は${A.retailYenPerKwh}円/kWhです。一方で、設置の費用がかかり、使うほどためられる量は少しずつ減り、置き場所も要ります。太陽光の余る量と、停電への備えをどれだけ重く見るかで判断します。`}
      points={[
        "メリット：昼に余った電気を夜に回せる。買う電気が減り、その分の再エネ賦課金も減る",
        `売電単価は${late.label}に${late.yenPerKwh}円/kWh。買う電気の単価の平均は${A.retailYenPerKwh}円/kWh（国の委員会の資料）`,
        "メリット：停電のときに、ためた電気を使える。使える範囲は全負荷型・特定負荷型で違う",
        "デメリット：費用がかかる。容量は使うほど減る前提で、SIIの登録基準は10年以上の保証などを求めている",
        `補助金：葛飾区は${kb.amount}（${kb.maxAmount}）、東京都は${tb.amount.split("（")[0]}。どちらもSII登録機器が対象`,
      ]}
      tip={{
        title: "「いらない」か「必要」かは、余る電気の量で決まります",
        body: (
          <>
            昼に家にいない時間が長いほど、太陽光の電気は余ります。<strong className="marker">余った電気を、売るか、ためて夜に使うか</strong>。この差が、蓄電池を付けるかどうかの分かれ目です。
          </>
        ),
      }}
      sections={[
        {
          id: "merit",
          heading: "蓄電池のメリット",
          body: (
            <>
              <h3>1. 昼に余った電気を、夜に使える</h3>
              <p>
                太陽光発電協会の説明では、住宅の太陽光は、昼間に発電した電気をまず家で使い、余った電気を電力会社に売ります。夜や発電が少ないときは、足りない分を電力会社から買います。蓄電池があれば、昼に余った電気をためて、夜に回せます。
              </p>
              <h3>2. 売る単価と、買う単価の差を活かせる</h3>
              <p>
                {fit.fiscalYear}のFITでは、住宅用の売電単価は{early.label}が{early.yenPerKwh}円/kWh、{late.label}が{late.yenPerKwh}円/kWhです。調達価格等算定委員会の資料にある、大手電力の家庭用電気料金単価の平均（{A.retailPeriod}・消費税を加味）は{A.retailYenPerKwh}円/kWhです。買う電気には、このほかに再エネ賦課金（{surcharge.fiscalYear}は1kWhあたり{unit}円）もかかります。
              </p>
              <p>ためた電気を夜に使うと、その分の電気を買わずに済みます。売電単価が下がったあとほど、この差は大きくなります。</p>
              <h3>3. 買取期間が終わったあとも、電気を活かせる</h3>
              <p>太陽光発電協会は、固定価格での買取期間が終わったあとは、売電より自宅で使うほうが経済メリットが出る場合があると説明し、組み合わせて使う機器として蓄電池や電気自動車を挙げています。</p>
              <h3>4. 停電のときに、ためた電気を使える</h3>
              <p>
                停電のときに、どの部屋のどの機器まで使えるかは、家じゅうに電気を送れる全負荷型か、決めた回路だけに送る特定負荷型かで違います。違いは<Link href="/guide/battery-how-to-choose">全負荷型と特定負荷型の違い</Link>、停電のときの使い方は<Link href="/guide/blackout">停電時の備え</Link>にまとめています。
              </p>
            </>
          ),
          figure: <PriceGapFigure />,
        },
        {
          id: "demerit",
          heading: "蓄電池のデメリット・注意点",
          body: (
            <>
              <h3>1. 設置の費用がかかる</h3>
              <p>
                費用は、容量・機種・工事の内容で変わります。参考として、国の「DR家庭用蓄電池事業（令和7年度補正）」は、蓄電システムの購入価格と工事費の合計が、目標価格の12.5万円/kWh（税抜）以下であることを要件の1つにしていました。この事業は、2026年5月29日に予算に達して公募を終えています。費用の考え方は<Link href="/guide/battery-cost">蓄電池の費用</Link>をご覧ください。
              </p>
              <h3>2. 使うほど、ためられる量は少しずつ減る</h3>
              <p>
                葛飾区と東京都の助成の対象になる、SIIの蓄電システム登録基準は、メーカーの保証年数と、サイクル試験による性能年数が、どちらも10年以上であることを求めています。性能年数10年の場合は3,650サイクルの試験のあとに、定格容量の6割以上が残ることが条件です。実際の保証の年数と条件は、メーカー・製品によって異なるため、カタログと保証書で確かめます。
              </p>
              <h3>3. 置き場所と、浸水への備えが要る</h3>
              <p>
                屋外に置くか屋内に置くか、必要な広さや重さ、動作する温度の条件は、機種ごとに違います。浸水のおそれがある場所では、置く高さも考えます。葛飾区での考え方は、<Link href="/blog/katsushika-flood-hazard-battery-placement">浸水に備えた蓄電池の置き場所</Link>の記事にまとめています。
              </p>
              <h3>4. 停電のときに、家じゅうが使えるとは限らない</h3>
              <p>特定負荷型では、停電のときに使えるのは、あらかじめ決めた回路だけです。停電のときに動かしたい機器から、型と容量を決めます。</p>
            </>
          ),
          figure: <BalanceFigure />,
        },
        {
          id: "judge",
          heading: "付けるか迷ったときの、判断の目安",
          body: (
            <>
              <p>次のような家は、蓄電池を付ける理由を見つけやすくなります。</p>
              <ul>
                <li>
                  <strong>昼に家にいない時間が長い</strong>：太陽光の電気が余りやすく、ためて夜に回せる電気が多くなります
                </li>
                <li>
                  <strong>FITの{late.label}や、買取期間の終わりが近い</strong>：売電単価が下がるので、売るより使う電気を増やす意味が大きくなります
                </li>
                <li>
                  <strong>停電への備えを重く見る</strong>：在宅避難のときに、冷蔵庫や照明、スマートフォンの充電などに使う電気を確保したい
                </li>
              </ul>
              <p>反対に、昼に家で電気を多く使う家は、太陽光の電気がそもそも余りにくく、ためられる電気も少なくなります。まず太陽光だけを載せて、余る量を見てから蓄電池を足す考え方もあります。</p>
              <p>
                あとから足す場合も、葛飾区の太陽光と蓄電池の併設加算（{addon.amount}）は、一方が既設の機器に併設する場合も対象です。後付けの考え方は<Link href="/blog/battery-retrofit-decision">蓄電池の後付けの判断</Link>の記事をご覧ください。
              </p>
            </>
          ),
        },
        {
          id: "subsidy",
          heading: "使える補助金",
          body: (
            <>
              <p>
                葛飾区のかつしかエコ助成金は、蓄電池が{kb.amount}（{kb.maxAmount}）です。東京都の家庭向けの助成は、蓄電池が{tb.amount}で、{tb.maxAmount}です。葛飾区と東京都の蓄電池の助成は、どちらもSIIに登録された機器が対象です。区と都の制度は併用できますが、金額は合算せずに、それぞれの条件で確かめます。
              </p>
              <p>
                金額と条件は<Link href="/subsidy/katsushika">葛飾区の補助金</Link>と<Link href="/subsidy/tokyo">東京都の補助金</Link>のページに、区と都を分けた試算は<Link href="/simulation">補助金シミュレーター</Link>にあります。
              </p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "家庭用蓄電池は、いらないのでしょうか？",
          a: "太陽光の電気がどれだけ余るかと、停電への備えをどれだけ重く見るかで決まります。昼に家にいない時間が長く、太陽光の電気が余りやすい家ほど、ためて夜に使える電気が多くなります。昼に電気を多く使う家は、余る電気が少ないので、まず太陽光だけで余る量を見る考え方もあります。",
        },
        {
          q: "蓄電池は何年くらい使えますか？",
          a: "製品の寿命は、メーカー・製品によって異なります。葛飾区と東京都の助成の対象になるSIIの登録基準は、メーカーの保証年数と、サイクル試験による性能年数が、どちらも10年以上であることを求めています。実際の保証の年数と条件は、カタログと保証書で確かめます。",
        },
        {
          q: "太陽光と同時に付けるのと、後から付けるのは、どちらがよいですか？",
          a: `どちらにも理由があります。葛飾区の太陽光と蓄電池の併設加算（${addon.amount}）は、両方を同時に設置する場合だけでなく、一方が既設の機器に併設する場合も対象です。同時なら工事が1回で済み、後からなら太陽光の余る量を見てから容量を決められます。`,
        },
        {
          q: "蓄電池の補助金は、どこから出ますか？",
          a: `葛飾区（${kb.amount}・${kb.maxAmount}）と東京都（${tb.amount.split("（")[0]}）の制度があり、併用できます。どちらもSIIに登録された機器が対象です。国のDR家庭用蓄電池事業（令和7年度補正）は、2026年5月29日に予算に達して公募を終えています。`,
        },
        {
          q: "停電のとき、家じゅうの電気が使えますか？",
          a: "全負荷型なら家じゅうに電気を送れますが、特定負荷型では、あらかじめ決めた回路だけです。どちらでも、ためた電気の量と、同時に使える電力には限りがあります。停電のときに動かしたい機器から、型と容量を決めます。",
        },
      ]}
      sources={[
        verified.jpeaSelling,
        verified.jpeaSellUser,
        verified.metiProcurementOpinion,
        verified.metiSurcharge2026,
        verified.siiBatteryRegistration,
        verified.katsushikaBatteryHandbook,
        { name: tb.sourceName, url: tb.sourceUrl, verifiedAt: tb.lastVerified },
        { name: "SII「令和7年度補正 DR家庭用蓄電池事業」", url: "https://dr-battery.sii.or.jp/r7h/about/", verifiedAt: "2026-10-01" },
      ]}
      relatedCategories={["battery", "blackout"]}
      withSubsidyDisclaimer
      cta={{
        title: "わが家に蓄電池が要るか、一緒に考えます。",
        body: "電気の使い方と屋根の条件から、太陽光の余る量と、ためて使える電気の見込みを整理します。区と都の補助金を引いた費用と並べてお伝えします。相談・見積もりは無料です。",
      }}
    />
  );
}
