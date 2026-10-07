import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { sources as verified } from "@/data/sources";
import { fit } from "@/data/fit";
import { surcharge, surchargeYen } from "@/data/surcharge";
import { solarAssumptions as A, JPEA_YEARLY_KWH_PER_KW } from "@/data/solar-assumptions";
import { GuideArticle } from "@/components/sections/GuideArticle";
import { ProseTable } from "@/components/ui/ProseTable";
import { SourceNote } from "@/components/ui/SourceNote";
import { PaybackCalculator } from "@/components/guide/PaybackCalculator";
import { PaybackFormulaFigure } from "@/components/guide/PaybackFormulaFigure";
import { PublicSolarFigure } from "@/components/area/PublicSolarFigure";

/**
 * 回収年数のガイド。
 * 検索意図：「太陽光発電 元が取れる」「太陽光 元を取る 何年」「太陽光 回収年数 計算」
 * ＝ 何年で元が取れるのか、どう計算すればよいかを知りたい。
 *
 * - 「◯年で元が取れる」とは書かない（設置費用・屋根・使い方で変わるため）。式と前提を示し、自分の数字で計算してもらう。
 * - 数値は、FIT の単価（data/fit.ts）と、国の委員会の想定値（data/solar-assumptions.ts）だけ。相場の金額は置かない。
 * - 費用の内訳は /guide/solar-cost、売電の仕組みは /guide/selling-electricity が受ける（ここでは繰り返さない）。
 */
const entry = getGuide("solar-payback")!;
const [early, late] = fit.residential.steps;
const maxYears = A.operatingYears;
/** FIT の単価の出典（表のすぐ下と、ページ末尾の一覧で使う） */
const FIT_NOTE = { name: fit.sourceName, url: fit.sourceUrl, verifiedAt: fit.lastVerified };

export const metadata: Metadata = buildMetadata({
  title: "太陽光発電は何年で元が取れる？回収年数の計算の考え方と試算",
  description: `太陽光発電の回収年数は「実質の負担額÷1年あたりの効果額」で計算します。${fit.fiscalYear}のFIT単価と、国の委員会の想定値をもとに、見積書の数字を入れて試算できます。確かめたい前提も整理しました。`,
  path: entry.path,
  keywords: ["太陽光発電 元が取れる", "太陽光 元を取る 何年", "太陽光 回収年数 計算", "太陽光発電 回収 シミュレーション"],
  type: "article",
  publishedTime: entry.publishedAt,
  modifiedTime: entry.updatedAt,
});

export default function Page() {
  return (
    <GuideArticle
      entry={entry}
      conclusion={`太陽光発電の回収年数は、「実質の負担額 ÷ 1年あたりの効果額」で考えます。効果額は、自宅で使って買わずに済んだ電気代と、売電の収入の合計です。${fit.fiscalYear}のFITは、${early.label}が${early.yenPerKwh}円/kWh、${late.label}が${late.yenPerKwh}円/kWhで、5年目から売電の収入が下がります。年数は、設置費用・補助金・屋根の条件・電気の使い方で変わるため、わが家の数字で計算します。`}
      points={[
        "回収年数 ＝（設置費用 − 補助金）÷ 1年あたりの効果額",
        "効果額 ＝ 自宅で使った分 × 買う電気の単価 ＋ 売った分 × 売電の単価",
        `国の委員会の想定は、発電した電気の${A.surplusSellPercent}％を売り、${A.selfUsePercent}％を自宅で使う`,
        "FITは5年目から単価が下がる。11年目以降は、電力会社ごとの単価になる",
        "点検と、パワーコンディショナの交換の費用も、試算に入れて考える",
      ]}
      tip={{
        title: "前提を、書面でもらう",
        body: (
          <>
            「◯年で元が取れます」と言われたら、<strong className="marker">計算の前提</strong>を書面でもらいましょう。発電量・自宅で使う割合・単価のどれかが違うと、年数は変わります。
          </>
        ),
      }}
      sections={[
        {
          id: "formula",
          heading: "太陽光発電の回収年数は、どう計算する？",
          body: (
            <>
              <p>回収年数は、実質の負担額を、1年あたりの効果額で割って出します。実質の負担額は、設置費用から補助金を引いた金額です。効果額は、買わずに済んだ電気代と、売電の収入を足した金額です。</p>
              <p>「何年で元が取れる」と一律に言えないのは、式の中身が家ごとに違うからです。設置費用、補助金の額、屋根の向きと影、電気を使う時間帯で、年数は変わります。</p>
            </>
          ),
          figure: <PaybackFormulaFigure />,
        },
        {
          id: "benefit",
          heading: "1年あたりの効果額の出し方",
          body: (
            <>
              <h3>1. 年間の発電量を見積もる</h3>
              <p>
                太陽光発電協会（JPEA）の計算例では、設置容量1kWあたりの年間発電量を、約{JPEA_YEARLY_KWH_PER_KW.toLocaleString("ja-JP")}kWhとしています。4kWのシステムなら、年間4,000kWh程度です。これは、水平に対して30度傾け、真南に向けて設置した場合の計算例です。発電量は、地域・方位・角度によって変わります。
              </p>
              <p>葛飾区は、太陽光発電システムを設置した区の公共施設について、出力と年間の想定発電量を公表しています。住宅に近い規模の例もあります。</p>
            </>
          ),
          figure: <PublicSolarFigure limit={3} />,
        },
        {
          id: "price",
          heading: "自宅で使う分と、売る分に分けて、単価を掛ける",
          body: (
            <>
              <p>
                発電した電気は、まず自宅で使い、余った分を売ります。国の委員会は、住宅用の買取価格を決めるとき、発電した電気の{A.surplusSellPercent}％を売り、残りの{A.selfUsePercent}％を自宅で使うと想定しています。{A.surplusSellActual.period}に集めた案件では、売った割合の平均は{A.surplusSellActual.averagePercent}％でした。
              </p>
              <p>自宅で使った分と、売った分には、それぞれ別の単価を掛けます。</p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>分け方</th>
                    <th>掛ける単価</th>
                    <th>{fit.fiscalYear}の値</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>自宅で使った分</td>
                    <td>買っている電気の単価</td>
                    <td>
                      検針票の単価。電力量料金の単価に、燃料費調整額の単価を足し引きし、<Link href="/guide/renewable-energy-surcharge">再エネ賦課金</Link>（{surcharge.fiscalYear}は{surchargeYen(surcharge.yenPerKwh)}円/kWh）を足したもの。国の資料では、大手電力の直近10年間（{A.retailPeriod}）の平均は{A.retailYenPerKwh}円/kWh
                    </td>
                  </tr>
                  <tr>
                    <td>売った分（{early.label}）</td>
                    <td>FITの単価</td>
                    <td>{early.yenPerKwh}円/kWh</td>
                  </tr>
                  <tr>
                    <td>売った分（{late.label}）</td>
                    <td>FITの単価</td>
                    <td>{late.yenPerKwh}円/kWh</td>
                  </tr>
                  <tr>
                    <td>売った分（{fit.residential.termYears + 1}年目以降）</td>
                    <td>電力会社ごとの単価</td>
                    <td>国の委員会の想定値は{A.postFitYenPerKwh.toFixed(1)}円/kWh</td>
                  </tr>
                </tbody>
              </ProseTable>
              <SourceNote sources={[FIT_NOTE, verified.metiProcurementOpinion]} className="mt-2" />
              <p>
                上の表の数字で比べると、売るよりも、自宅で使うほうが、1kWhあたりの効果は大きくなります。5年目からは売る単価が下がるので、その差が広がります。売電の仕組みは、<Link href="/guide/selling-electricity">売電とFIT価格のガイド</Link>で解説しています。
              </p>
            </>
          ),
        },
        {
          id: "tokyo-estimate",
          heading: "東京都の試算：4kWの太陽光パネルの場合",
          body: (
            <>
              <p>東京都は、太陽光パネルを設置した場合の経済性を試算して、公表しています。令和7年10月時点、東京都区部・2人以上の世帯を想定した試算です。</p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>東京都の試算（4kW）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>初期費用</td>
                    <td>117万円（株式会社資源総合システム調べ、令和6年度末の新築住宅の場合の価格）</td>
                  </tr>
                  <tr>
                    <td>回収できる計算の年数</td>
                    <td>13.8年程度。都の試算で想定した補助（10万円/kW）を使うと8.4年程度</td>
                  </tr>
                  <tr>
                    <td>30年間の支出と収入の差</td>
                    <td>87万円程度。補助を使うと127万円程度</td>
                  </tr>
                  <tr>
                    <td>試算の条件</td>
                    <td>売電単価 24円/kWh（1〜4年目）・8.3円/kWh（5〜10年目）・8.5円/kWh（11〜30年目）、電気料金 33.50円/kWh、期間中にパワーコンディショナを一度交換（33万円）</td>
                  </tr>
                </tbody>
              </ProseTable>
              <SourceNote sources={[verified.tokyoSolarQa]} className="mt-2" />
              <p>東京都は、一定の条件をもとに算出したもので、今後の状況の変化で変わる場合があるとしています。期間中に点検費用（1回約5万円）がかかる場合があり、リサイクルの際には約30万円の費用が別にかかるとも書いています。</p>
              <p>既存の住宅に載せる場合は、屋根の状態や足場の条件で費用が変わります。東京都の補助金の単価も、新築と既存住宅で違います。下の試算に、見積書の数字を入れて確かめてください。</p>
            </>
          ),
        },
        {
          id: "calc",
          heading: "わが家の数字で、回収年数を計算してみる",
          body: (
            <>
              <p>見積書にある、設置費用・補助金の見込み額・容量を入れると、回収の目安が出ます。初めから入っている前提の数値は、国の委員会の想定値と、太陽光発電協会の計算例です。「計算の前提を変える」を開くと、わが家の数字に直せます。</p>
              <SourceNote sources={[verified.metiProcurementOpinion, verified.jpeaOutput, FIT_NOTE]} className="mt-2" />
            </>
          ),
          figure: (
            <PaybackCalculator
              defaults={{
                yearlyKwhPerKw: JPEA_YEARLY_KWH_PER_KW,
                selfUsePercent: A.selfUsePercent,
                retailYenPerKwh: A.retailYenPerKwh,
                postFitYenPerKwh: A.postFitYenPerKwh,
                fitSteps: fit.residential.steps,
                maxYears,
                surcharge: { fiscalYear: surcharge.fiscalYear, yenPerKwh: surchargeYen(surcharge.yenPerKwh) },
              }}
            />
          ),
        },
        {
          id: "factors",
          heading: "回収年数が変わる5つの要因",
          body: (
            <>
              <h3>1. 屋根の向き・角度・影</h3>
              <p>
                発電量は、屋根の向きと角度、周りの建物の影で変わります。図面だけでは分からないので、現地で確かめます。屋根の条件は、<Link href="/guide/roof-conditions">太陽光に向く屋根の条件</Link>にまとめています。
              </p>
              <h3>2. 昼に電気を使う量</h3>
              <p>昼に家で電気を使うほど、自宅で使う割合が上がります。買う電気の単価は、売る単価より高いので、効果額も上がります。</p>
              <h3>3. 補助金</h3>
              <p>
                補助金は、設置費用から差し引いて考えます。葛飾区と東京都の助成は併用できますが、補助金の合計は助成対象経費が上限です。制度の全体像は、<Link href="/subsidy">補助金の総合ページ</Link>で確かめられます。
              </p>
              <h3>4. 蓄電池を入れるか</h3>
              <p>
                蓄電池を入れると、初期費用が増えます。一方で、昼に余った電気を夜に使えるので、自宅で使う割合が上がります。停電への備えという、金額に表れない役割もあります。考え方は、<Link href="/solar-battery">太陽光＋蓄電池のページ</Link>で解説しています。
              </p>
              <h3>5. 点検と、機器の交換</h3>
              <p>
                国の委員会の資料には、太陽光発電協会へのヒアリングの結果が載っています。{A.hearing.capacityKw}kWの設備を想定した場合、{A.hearing.inspectionEvery}の定期点検が推奨されていて、1回あたりの点検費用の相場は約{A.hearing.inspectionCostManYen}万円程度です。パワーコンディショナは{A.hearing.powerConditionerWithinYears}年間で一度は交換され、{A.hearing.powerConditionerCostManYen}万円程度が一般的な相場とされています。これは国の資料にある数値で、SOLAR SHIFT の見積もり額ではありません。
              </p>
            </>
          ),
        },
        {
          id: "check",
          heading: "「◯年で元が取れます」と言われたら、確かめる7つの前提",
          body: (
            <>
              <ul>
                <li><strong>発電量</strong>：屋根の向き・角度・影を、現地で確かめた数字か</li>
                <li><strong>自宅で使う割合</strong>：何％で計算しているか（国の委員会の想定は{A.selfUsePercent}％）</li>
                <li><strong>買う電気の単価</strong>：いくらで計算しているか。将来の値上がりを見込んでいないか</li>
                <li><strong>5年目からの売電の単価</strong>：{early.yenPerKwh}円のままで計算していないか（{fit.fiscalYear}のFITは、{late.label}が{late.yenPerKwh}円/kWh）</li>
                <li><strong>{fit.residential.termYears + 1}年目以降の売電の単価</strong>：固定価格の買取が終わったあとを、いくらで見ているか</li>
                <li><strong>点検と交換の費用</strong>：定期点検と、パワーコンディショナの交換が入っているか</li>
                <li><strong>補助金</strong>：交付が決まった額か、見込みの額か（交付の可否と金額は、区と都の審査で決まります）</li>
              </ul>
              <p>前提が書かれていない試算は、比べようがありません。前提を書面でもらい、複数の業者の試算を並べて比べてください。葛飾区も、複数の業者から見積もりを取ることを勧めています。</p>
            </>
          ),
        },
        {
          id: "solar-shift",
          heading: "SOLAR SHIFT の試算の出し方",
          body: (
            <>
              <p>SOLAR SHIFT では、現地調査と、ご家庭の電気の使用量をもとに、試算をお出しします。葛飾区と東京都の補助金は、制度ごとに分けて整理します。試算の前提は、遠慮なくご確認ください。</p>
              <p>
                現地調査・お見積もりは無料です。設置費用の内訳の見方は、<Link href="/guide/solar-cost">太陽光発電の費用のガイド</Link>にまとめています。
              </p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "回収年数は、どうやって計算しますか？",
          a: "実質の負担額（設置費用から補助金を引いた金額）を、1年あたりの効果額で割って出します。効果額は、自宅で使って買わずに済んだ電気代と、売電の収入の合計です。設置費用・屋根の条件・電気の使い方で変わるため、わが家の数字で計算します。",
        },
        {
          q: "FITの単価が下がる5年目からは、回収が遅くなりますか？",
          a: `${fit.fiscalYear}のFITは、${early.label}が${early.yenPerKwh}円/kWh、${late.label}が${late.yenPerKwh}円/kWhです。5年目からは、売電の収入が減ります。昼に発電した電気を自宅で使う割合が高いほど、その影響は小さくなります。`,
        },
        {
          q: "蓄電池も入れると、回収年数はどうなりますか？",
          a: "蓄電池を入れると、初期費用が増えます。一方で、昼に余った電気を夜に使えるので、自宅で使う割合が上がります。年数は、蓄電池の費用と電気の使い方によって変わります。停電への備えという、金額に表れない役割もあります。",
        },
        {
          q: "回収年数の試算に、パワーコンディショナの交換は入れるべきですか？",
          a: `入れて考えることをおすすめします。国の委員会の資料では、太陽光発電協会へのヒアリングの結果として、パワーコンディショナは${A.hearing.powerConditionerWithinYears}年間で一度は交換され、${A.hearing.capacityKw}kWの設備で${A.hearing.powerConditionerCostManYen}万円程度が一般的な相場とされています。`,
        },
        {
          q: "補助金は、回収年数の計算にどう入れますか？",
          a: "設置費用から差し引いて、実質の負担額にします。葛飾区と東京都の助成は併用できますが、補助金の合計は助成対象経費が上限です。交付の可否と金額は、区と都の審査で決まります。",
        },
      ]}
      sources={[
        verified.metiProcurementOpinion,
        verified.tokyoSolarQa,
        FIT_NOTE,
        verified.jpeaOutput,
        verified.katsushikaPublicSolar,
      ]}
      relatedCategories={["fit", "electricity-bill", "solar"]}
      withSubsidyDisclaimer
      cta={{
        title: "わが家の屋根と電気の使い方で、何年になるか。",
        body: "現地調査と、ご家庭の電気の使用量をもとに、試算をお出しします。葛飾区と東京都の補助金は、制度ごとに整理します。現地調査・お見積もりは無料です。",
      }}
    />
  );
}
