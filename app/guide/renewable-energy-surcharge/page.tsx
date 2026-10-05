import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { sources as verified } from "@/data/sources";
import { surcharge, surchargeYen } from "@/data/surcharge";
import { reveal, growDelay } from "@/lib/reveal";
import { GuideArticle } from "@/components/sections/GuideArticle";
import { ProseTable } from "@/components/ui/ProseTable";

/**
 * 再エネ賦課金のガイド。
 * 検索意図：「再エネ賦課金」「再エネ賦課金 2026」「再エネ賦課金 計算」「再エネ賦課金 太陽光」
 * ＝ いくら払っているのか、どう決まるのか、太陽光を載せるとどうなるのかを知りたい。
 *
 * - 単価・目安・推移は data/surcharge.ts だけから出す（年度が変わったら、そこだけを直す）。
 * - 今後の単価の予想（上がる・下がる・いつまで）は書かない。
 * - 「太陽光で賦課金がなくなる」とは書かない。減るのは、電力会社から買う電気の量に比例する負担。
 */
const entry = getGuide("renewable-energy-surcharge")!;
const s = surcharge;
const unit = `${surchargeYen(s.yenPerKwh)}円`;
const yen = (n: number) => n.toLocaleString("ja-JP");
const fy2023 = s.history.find((h) => h.year === 2023)!;

export const metadata: Metadata = buildMetadata({
  title: entry.title,
  description: `再エネ賦課金の${s.fiscalYear}の単価は1kWhあたり${unit}。月${s.model.kwhPerMonth}kWh使う家庭の目安は月${yen(s.model.monthlyYen)}円です。計算方法、2012年度からの推移、太陽光の電気を家で使うと負担がどう変わるかを、国と東京都の資料で整理しました。`,
  path: entry.path,
  keywords: ["再エネ賦課金", `再エネ賦課金 ${s.fiscalYear.replace("年度", "")}`, "再エネ賦課金 計算", "再エネ賦課金 推移", "再エネ賦課金 太陽光 自家消費"],
  type: "article",
  publishedTime: entry.publishedAt,
  modifiedTime: entry.updatedAt,
});

/** 計算のしかたを、式で見せる図 */
function FormulaFigure() {
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">再エネ賦課金の計算のしかた</figcaption>
      <div className="mt-5 grid items-center gap-2.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-3">
        <p className="rounded-2xl bg-white px-4 py-4 text-center shadow-card" {...reveal(0, "pop")}>
          <span className="block text-[13px] font-bold text-ink-2">1か月に使った電気の量</span>
          <span className="mt-1 block font-en text-[24px] font-extrabold text-navy-900">
            {s.model.kwhPerMonth}
            <span className="ml-0.5 text-[14px]">kWh</span>
          </span>
          <span className="block text-[12px] text-ink-2">国が目安に使った量</span>
        </p>
        <span className="text-center font-en text-[26px] font-extrabold text-accent-text" aria-hidden="true">
          ×
        </span>
        <p className="rounded-2xl bg-white px-4 py-4 text-center shadow-card" {...reveal(120, "pop")}>
          <span className="block text-[13px] font-bold text-ink-2">{s.fiscalYear}の単価</span>
          <span className="mt-1 block font-en text-[24px] font-extrabold text-navy-900">
            {surchargeYen(s.yenPerKwh)}
            <span className="ml-0.5 text-[14px]">円/kWh</span>
          </span>
          <span className="block text-[12px] text-ink-2">全国一律</span>
        </p>
        <span className="text-center font-en text-[26px] font-extrabold text-accent-text" aria-hidden="true">
          ＝
        </span>
        <p className="rounded-2xl bg-orange-500 px-4 py-4 text-center text-navy-900 shadow-card" {...reveal(240, "pop")}>
          <span className="block text-[13px] font-bold">1か月の再エネ賦課金</span>
          <span className="mt-1 block font-en text-[26px] font-extrabold">
            {yen(s.model.monthlyYen)}
            <span className="ml-0.5 text-[14px]">円</span>
          </span>
          <span className="block text-[12px] font-bold">年額 {yen(s.model.yearlyYen)}円</span>
        </p>
      </div>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">
        出典：{s.source.name}。経済産業省によると、{s.model.kwhPerMonth}kWhは、総務省家計調査にもとづく一般的な世帯の1か月の電力使用量です。{s.appliesFrom}から{s.appliesTo}までの電気料金に適用されます。
      </p>
    </figure>
  );
}

/** 2012年度からの単価の推移（棒は、画面に入ったときに左から伸びる） */
function HistoryFigure() {
  const max = Math.max(...s.history.map((h) => h.yenPerKwh));
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">
        再エネ賦課金の単価の推移<span className="ml-2 inline-block text-[13px] font-bold text-ink-2">1kWhあたり</span>
      </figcaption>
      <ul className="mt-5 space-y-2" {...reveal()}>
        {s.history.map((h, i) => {
          const latest = i === s.history.length - 1;
          return (
            <li key={h.year} className="grid grid-cols-[4.75rem_1fr_3.75rem] items-center gap-2 sm:grid-cols-[5.5rem_1fr_4.5rem] sm:gap-3">
              <span className={`text-[13px] font-bold sm:text-[14px] ${latest ? "text-navy-900" : "text-ink-2"}`}>{h.year}年度</span>
              <span className="h-4 overflow-hidden rounded-full bg-white">
                <span className={`grow-x block h-full rounded-full ${latest ? "bg-orange-500" : "bg-green-500"}`} style={{ width: `${Math.max(3, (h.yenPerKwh / max) * 100)}%`, ...growDelay(100 + i * 45) }} />
              </span>
              <span className="text-right">
                <span className={`font-en text-[16px] font-extrabold ${latest ? "text-accent-text" : "text-navy-900"}`}>{surchargeYen(h.yenPerKwh)}</span>
                <span className="ml-0.5 text-[11px] font-bold text-ink-2">円</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">出典：東京都環境局「太陽光パネル設置に関するQ&A」Q29 の「再エネ賦課金の推移」。東京電力のホームページをもとに作成されたものです。</p>
    </figure>
  );
}

/** 家で使った電気と、買った電気の違い */
function SelfUseFigure() {
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">太陽光の電気を家で使うと、何が減るか</figcaption>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card" {...reveal(0, "left")}>
          <p className="inline-block rounded-full bg-green-600 px-3 py-1 text-[13px] font-black text-white">太陽光でつくって、家で使った電気</p>
          <p className="mt-3 text-[15px] leading-[1.75] text-ink">電力会社から買わない電気です。その分の電気料金も、再エネ賦課金も払いません。</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card" {...reveal(120, "right")}>
          <p className="inline-block rounded-full bg-orange-500 px-3 py-1 text-[13px] font-black text-navy-900">電力会社から買った電気</p>
          <p className="mt-3 text-[15px] leading-[1.75] text-ink">
            太陽光があっても、夜や雨の日に買う電気には、使った量に応じて再エネ賦課金がかかります。{s.fiscalYear}は1kWhあたり{unit}です。
          </p>
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">住宅用（10kW未満）の太陽光は、家で使ったあとの余りが買取の対象です（資源エネルギー庁）。売る電気と買う電気の量は、電気の使い方で変わります。</p>
    </figure>
  );
}

export default function Page() {
  return (
    <GuideArticle
      entry={entry}
      conclusion={`再エネ賦課金は、固定価格買取制度で再生可能エネルギーの電気を買い取る費用を、電気を使うすべての人が、毎月の電気料金とあわせて負担するものです。${s.fiscalYear}の単価は1kWhあたり${unit}で、${s.appliesFrom}から${s.appliesTo}まで適用されます。負担額は電気の使用量に比例します。太陽光の電気を家で使うと、電力会社から買う電気が減るぶん、賦課金の負担も減ります。`}
      points={[
        `${s.fiscalYear}の単価は1kWhあたり${unit}（経済産業省）`,
        `月${s.model.kwhPerMonth}kWh使う家庭の目安は、月額${yen(s.model.monthlyYen)}円・年額${yen(s.model.yearlyYen)}円（経済産業省）`,
        "計算は「使った電気の量（kWh）× 単価」。単価は全国一律（資源エネルギー庁・東京都のQ&A）",
        `単価は毎年度、経済産業大臣が決める。2012年度の${surchargeYen(s.history[0].yenPerKwh)}円から、${s.fiscalYear}は${unit}`,
        "太陽光の電気を家で使うと、買う電気が減るぶん、賦課金の負担も減る",
      ]}
      tip={{
        title: "回収年数の計算にも入れます",
        body: (
          <>
            太陽光の電気を家で使って減らせるのは、電力量料金だけではありません。<strong className="marker">買う電気1kWhごとにかかる再エネ賦課金</strong>も減ります。回収年数を考えるときは、この分も入れます。
          </>
        ),
      }}
      sections={[
        {
          id: "what",
          heading: "再エネ賦課金とは",
          body: (
            <>
              <p>
                資源エネルギー庁によると、再エネ賦課金は、固定価格買取制度で買い取られる再生可能エネルギーの電気の、買い取りに要した費用をまかなうものです。正式な名前は「再生可能エネルギー発電促進賦課金」です。電気を使う人から広く集められ、毎月の電気料金とあわせて払います。
              </p>
              <p>資源エネルギー庁は、再エネ賦課金の特徴を、次のように説明しています。</p>
              <ul>
                <li>電気を使うすべての方が負担する</li>
                <li>電気料金の一部になっている</li>
                <li>負担額は、電気の使用量に比例する</li>
                <li>単価は、全国一律になるよう調整する</li>
              </ul>
              <p>資源エネルギー庁の「月々の電気料金の内訳」によると、毎月の電気料金は、契約容量で決まる基本料金と、使用電力量に応じて計算する電力量料金に、再エネ賦課金を加えた合計です。</p>
            </>
          ),
        },
        {
          id: "fy2026",
          heading: `${s.fiscalYear}の単価と、家庭の負担の目安`,
          body: (
            <>
              <p>
                経済産業省は、{s.fiscalYear}の単価を、再エネの導入状況や卸電力市場価格等を踏まえて、1kWhあたり{unit}としました。目安として、1か月の電力使用量が{s.model.kwhPerMonth}kWhの家庭の負担額は、月額{yen(s.model.monthlyYen)}円、年額{yen(s.model.yearlyYen)}円です。
              </p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>{s.fiscalYear}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>単価</td>
                    <td>1kWhあたり{unit}</td>
                  </tr>
                  <tr>
                    <td>適用される電気料金</td>
                    <td>
                      {s.appliesFrom}から{s.appliesTo}まで
                    </td>
                  </tr>
                  <tr>
                    <td>月{s.model.kwhPerMonth}kWh使う家庭の目安</td>
                    <td>
                      月額{yen(s.model.monthlyYen)}円、年額{yen(s.model.yearlyYen)}円
                    </td>
                  </tr>
                </tbody>
              </ProseTable>
              <p>東京都のQ&Aも、計算のしかたを「自分が使用した電気の量（kWh）× 単価」と示しています。わが家の負担は、検針票などで1か月に使った電気の量を確かめて、単価をかけると分かります。</p>
            </>
          ),
          figure: <FormulaFigure />,
        },
        {
          id: "history",
          heading: "単価の推移と、決まり方",
          body: (
            <>
              <p>
                東京都のQ&Aに載っている推移では、2012年度の{surchargeYen(s.history[0].yenPerKwh)}円から、{s.fiscalYear}は{unit}になっています。2023年度は{surchargeYen(fy2023.yenPerKwh)}円と、前後の年度より低くなっています。
              </p>
              <p>
                資源エネルギー庁によると、単価は、買取価格等を踏まえて、年間でどのくらい再生可能エネルギーが導入されるかを推測し、毎年度、経済産業大臣が決めます。推測した値と実績の差は、翌々年度の単価で調整します。単価を計算するときは、買い取りに要した費用から、電気事業者が再エネの電気を買い取ることで節約できた燃料費等を差し引いています。
              </p>
              <p>東京都のQ&Aによると、再エネ賦課金は、FITの買取価格や、電力の市場価格に連動する回避可能費用等を要素として計算されるため、これらが変わると単価も変わります。</p>
              <h3>{s.fiscalYear}の単価の算定根拠</h3>
              <p>経済産業省は、{s.fiscalYear}の単価の算定根拠として、次の想定を示しています。</p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>{s.fiscalYear}における想定</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>買取費用等</td>
                    <td>{s.basis.purchaseCost}</td>
                  </tr>
                  <tr>
                    <td>回避可能費用等</td>
                    <td>{s.basis.avoidedCost}</td>
                  </tr>
                  <tr>
                    <td>販売電力量</td>
                    <td>{s.basis.salesKwh}</td>
                  </tr>
                </tbody>
              </ProseTable>
            </>
          ),
          figure: <HistoryFigure />,
        },
        {
          id: "solar",
          heading: "太陽光を載せると、再エネ賦課金はどうなる？",
          body: (
            <>
              <p>
                資源エネルギー庁によると、住宅の屋根に載せるような10kW未満の太陽光は、自分で消費した後の余りが買取の対象です。太陽光発電協会の説明でも、昼間に発電した電気はまず家庭で使い、足りない分を電力会社から買います。
              </p>
              <p>再エネ賦課金の負担は、電気の使用量に比例します。太陽光の電気を家で使うと、電力会社から買う電気の量が減り、その分の電気料金と再エネ賦課金を払わずに済みます。</p>
              <p>
                一方で、太陽光を載せても、夜や雨の日など、電力会社から買う電気には、これまでどおり再エネ賦課金がかかります。昼の電気を夜に回す考え方は、<Link href="/solar-battery">太陽光＋蓄電池のページ</Link>にまとめています。
              </p>
              <h3>回収年数を計算するときの注意</h3>
              <p>
                自宅で使って「買わずに済んだ電気」の金額は、電力量料金の単価だけでなく、再エネ賦課金の単価も含めて考えます。見積書と検針票の数字を入れて試算できる道具は、<Link href="/guide/solar-payback">回収年数の計算の考え方と試算</Link>にあります。売る電気の単価は、<Link href="/guide/selling-electricity">売電価格のガイド</Link>をご覧ください。
              </p>
            </>
          ),
          figure: <SelfUseFigure />,
        },
      ]}
      faq={[
        {
          q: `${s.fiscalYear}の再エネ賦課金はいくらですか？`,
          a: `1kWhあたり${unit}です（経済産業省）。${s.appliesFrom}の電気料金から、${s.appliesTo}まで適用されます。`,
        },
        {
          q: "再エネ賦課金は、毎月いくら払っていますか？",
          a: `使った電気の量（kWh）に単価をかけた額です。経済産業省は、1か月に${s.model.kwhPerMonth}kWh使う家庭の目安を、月額${yen(s.model.monthlyYen)}円、年額${yen(s.model.yearlyYen)}円としています。`,
        },
        {
          q: "太陽光発電を付けると、再エネ賦課金は払わなくてよくなりますか？",
          a: "なくなりはしません。電力会社から買う電気には、これまでどおりかかります。資源エネルギー庁によると負担額は電気の使用量に比例するので、太陽光の電気を家で使って買う電気が減れば、そのぶん負担も減ります。",
        },
        {
          q: "再エネ賦課金の単価は、だれがどう決めていますか？",
          a: "資源エネルギー庁によると、毎年度、経済産業大臣が決めます。買取価格等を踏まえて、年間でどのくらい再生可能エネルギーが導入されるかを推測して決め、推測と実績の差は、翌々年度の単価で調整します。",
        },
        {
          q: "再エネ賦課金が減額されることはありますか？",
          a: "東京都のQ&Aによると、賦課金の額が減免されるのは、大量の電力を消費する事業所で、国が定める要件に該当する場合です。",
        },
      ]}
      sources={[verified.metiSurcharge2026, verified.enechoSurcharge, verified.enechoBillBreakdown, verified.tokyoSolarQa, verified.jpeaSelling]}
      relatedCategories={["electricity-bill", "fit"]}
      cta={{
        title: "買う電気と、家で使う電気の見込みを整理します。",
        body: "検針票の使用量と屋根の条件をもとに、家で使う電気と売る電気の見込みを整理し、補助金を引いた費用と並べてお伝えします。相談・見積もりは無料です。",
      }}
    />
  );
}
