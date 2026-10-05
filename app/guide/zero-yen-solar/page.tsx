import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { sources as verified } from "@/data/sources";
import { reveal } from "@/lib/reveal";
import { GuideArticle } from "@/components/sections/GuideArticle";
import { ProseTable } from "@/components/ui/ProseTable";

/**
 * 0円ソーラー（リース・PPA）と購入の違いのガイド。
 * 検索意図：「0円ソーラー」「太陽光 リース PPA 違い」「0円ソーラー 後悔」
 * ＝ 初期費用ゼロの仕組みと、買う場合との違い、契約前に確かめることを知りたい。
 *
 * - 仕組みの説明は、太陽光発電協会（JPEA）と東京都の資料にあることだけ。特定の会社・サービスの名前は出さない。
 * - どちらが得かは言い切らない（事業者やプランで違う）。比べる軸と、確かめる項目を示す。
 * - SOLAR SHIFT がリース・PPAを提供しているかは確認できていないので、書かない。
 */
const entry = getGuide("zero-yen-solar")!;

export const metadata: Metadata = buildMetadata({
  title: "0円ソーラー（リース・PPA）と購入の違い｜補助金と契約前の確認点",
  description:
    "初期費用0円で太陽光発電を載せられる「0円ソーラー」（リース・PPA）は、購入とどこが違うのか。所有権と費用の負担、東京都の初期費用ゼロの助成、区の補助金の扱い、契約前に確かめる点を、公式資料をもとに整理しました。",
  path: entry.path,
  keywords: ["0円ソーラー", "太陽光 リース PPA 違い", "0円ソーラー 後悔", "太陽光 初期費用ゼロ", "PPA 太陽光 東京都"],
  type: "article",
  publishedTime: entry.publishedAt,
  modifiedTime: entry.updatedAt,
});

/** 購入と、初期費用0円のサービスを並べた図 */
function CompareFigure() {
  const rows = [
    ["設置の費用", "自分で払う", "事業者が負担する"],
    ["毎月の支払い", "ローンを組んだ場合はその返済", "電気料金、またはリース代"],
    ["期間中の所有権", "自分", "事業者"],
    ["メンテナンスの費用", "自分で負担する", "プランによって違う"],
    ["かつしかエコ助成金", "対象になり得る", "リース・レンタルは対象外"],
  ];
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-6 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">購入と、初期費用0円のサービスの違い</figcaption>
      <div className="mt-5 grid grid-cols-[1fr_1fr] gap-2.5 sm:grid-cols-[11rem_1fr_1fr] sm:gap-3">
        <span className="hidden sm:block" aria-hidden="true" />
        <p className="rounded-2xl bg-green-600 px-3 py-2 text-center text-[14px] font-black text-white" {...reveal(0, "pop")}>
          購入する（自己所有）
        </p>
        <p className="rounded-2xl bg-orange-500 px-3 py-2 text-center text-[14px] font-black text-navy-900" {...reveal(120, "pop")}>
          0円ソーラー（リース・PPA）
        </p>
        {rows.map(([label, own, zero], i) => (
          <div key={label} className="col-span-2 grid grid-cols-2 gap-2.5 sm:col-span-3 sm:grid-cols-[11rem_1fr_1fr] sm:gap-3" {...reveal(180 + i * 70)}>
            <p className="col-span-2 text-[13px] font-bold text-ink-2 sm:col-span-1 sm:flex sm:items-center sm:text-[14px]">{label}</p>
            <p className="rounded-xl bg-white px-3 py-2.5 text-[14px] leading-[1.6] text-ink shadow-card">{own}</p>
            <p className="rounded-xl bg-white px-3 py-2.5 text-[14px] leading-[1.6] text-ink shadow-card">{zero}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">出典：太陽光発電協会「住宅用太陽光発電システムの導入方法の説明」、葛飾区「かつしかエコ助成金のご案内（事前協議分）」。サービスの中身は、事業者とプランによって違います。</p>
    </figure>
  );
}

export default function Page() {
  return (
    <GuideArticle
      entry={entry}
      conclusion="0円ソーラーは、設置の費用を事業者が負担し、利用者は電気料金やリース代を毎月払う導入の方法です（リース・PPA）。期間中の太陽光発電設備は、事業者のものです。購入（自己所有）とくらべると、初期費用がいらない一方で、所有権・メンテナンスの負担・期間が終わったあとの扱いが、事業者とプランによって違います。葛飾区の助成は、リース・レンタルでの導入を対象外にしています。"
      points={[
        "0円ソーラー＝設置費用は事業者が負担。期間中の所有権は事業者（太陽光発電協会）",
        "購入＝初期費用は自分で負担。所有権は自分。メンテナンス費も自分で負担",
        "東京都は、初期費用ゼロのサービスを提供する事業者に助成し、利用料の低減で住宅所有者に全額還元している",
        "かつしかエコ助成金は、リース・レンタルでの導入を対象外にしている",
        "契約の前に、期間・月々の支払い・メンテナンス・期間終了後の扱いを書面で確かめる",
      ]}
      tip={{
        title: "「0円」は初期費用のこと",
        body: (
          <>
            0円ソーラーの「0円」は、<strong className="marker">設置のときの費用</strong>のことです。毎月の支払いと、その期間を、契約の前に確かめます。
          </>
        ),
      }}
      sections={[
        {
          id: "what",
          heading: "0円ソーラー（リース・PPA）とは",
          body: (
            <>
              <p>
                太陽光発電協会（JPEA）は、住宅用太陽光発電の導入方法を、2つに分けて説明しています。ユーザーが太陽光発電システムを購入する「自己所有」と、初期費用を事業者が負担する「初期費用0円ソーラーサービス（PPA・リース）」です。
              </p>
              <ul>
                <li><strong>自己所有</strong>：ユーザーが購入するモデル。期間中の所有権はユーザーで、初期費用が必要です。メンテナンス費もユーザーが負担します。</li>
                <li><strong>初期費用0円ソーラーサービス（PPA・リース）</strong>：設置の初期費用を事業者が負担し、電気料金またはリース代として、月々の料金を払うモデルです。期間中の所有権は事業者です。</li>
              </ul>
              <p>JPEAは、事業者やサービスプランによって、詳細は異なるとしています。</p>
              <h3>東京都が挙げている手法の例</h3>
              <p>東京都のQ&Aは、初期費用ゼロで設置する手法の例として、次のものを挙げています。</p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>手法</th>
                    <th>設置の費用</th>
                    <th>所有権</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>リース</td>
                    <td>事業者</td>
                    <td>事業者</td>
                  </tr>
                  <tr>
                    <td>電力販売</td>
                    <td>事業者</td>
                    <td>事業者</td>
                  </tr>
                  <tr>
                    <td>屋根貸し</td>
                    <td>事業者</td>
                    <td>事業者</td>
                  </tr>
                  <tr>
                    <td>売電権の譲渡（自己所有モデル）</td>
                    <td>事業者</td>
                    <td>建築主</td>
                  </tr>
                </tbody>
              </ProseTable>
            </>
          ),
          figure: <CompareFigure />,
        },
        {
          id: "tokyo",
          heading: "東京都の、初期費用ゼロの助成",
          body: (
            <>
              <p>
                東京都は、太陽光発電システム等を、住宅所有者等の初期費用の負担なしで設置するサービスを提供する事業者に、設置費用の一部を助成しています（住宅用太陽光発電初期費用ゼロ促進の増強事業）。クール・ネット東京によると、この助成金は、サービス利用料の低減等を通じて、住宅所有者等に全額還元されます。
              </p>
              <p>東京都のQ&Aによると、事業者は事前に自社の事業プラン（サービス内容）を登録する必要があります。同時に設置する蓄電池も、助成の対象です。</p>
              <p>
                購入して設置する場合は、住宅の所有者が、東京都の家庭向けの助成の対象になり得ます。既存住宅と新築住宅で単価が違い、金額と条件は<Link href="/subsidy/tokyo">東京都の補助金のページ</Link>にまとめています。
              </p>
            </>
          ),
        },
        {
          id: "katsushika",
          heading: "区の補助金は、リース・レンタルを対象にしているか",
          body: (
            <>
              <p>
                葛飾区のかつしかエコ助成金（個人住宅用）は、区内の自ら居住する住宅に、新たに対象機器を導入する個人が対象で、リース・レンタルでの導入は対象外です。0円ソーラーを考えるときは、区の助成を使えないことを前提に比べます。
              </p>
              <p>
                ほかの区の制度は、区ごとに違います。足立区・墨田区・江戸川区の制度は、<Link href="/area">対応エリアのページ</Link>から区ごとにご覧いただけます。
              </p>
            </>
          ),
        },
        {
          id: "check",
          heading: "契約の前に、書面で確かめる7つのこと",
          body: (
            <>
              <ul>
                <li><strong>契約の期間</strong>：何年の契約か。途中で解約するときの条件と費用</li>
                <li><strong>月々の支払い</strong>：電気料金なのか、リース代なのか。単価や金額が変わる条件</li>
                <li><strong>所有権</strong>：期間中はだれのものか。期間が終わったあとに、設備がどうなるか</li>
                <li><strong>メンテナンス</strong>：点検や修理、パワーコンディショナの交換の費用を、どちらが負担するか</li>
                <li><strong>自宅で使う電気と、余った電気</strong>：発電した電気をどう使い、売電の収入はだれのものになるか</li>
                <li><strong>屋根の工事や売却のとき</strong>：屋根の修理、住宅の売却や相続のときの扱い</li>
                <li><strong>補助金</strong>：区や都の補助金が、だれに、どう還元されるか</li>
              </ul>
              <p>
                太陽光発電協会は、約束事項や説明された内容を、口約束ではなく書面で確かめて保管することを勧めています。訪問販売で契約した場合は、法律で決められた書面を受け取った日から8日以内であれば、クーリング・オフができる場合があります（消費者庁）。
              </p>
            </>
          ),
        },
        {
          id: "compare",
          heading: "購入とくらべるときの考え方",
          body: (
            <>
              <p>どちらが合うかは、事業者とプラン、住まいの条件によって違います。くらべるときは、次の2つを同じ期間でそろえて見ます。</p>
              <ul>
                <li><strong>購入する場合</strong>：設置費用から補助金を引いた実質の負担額と、自宅で使って買わずに済んだ電気代・売電の収入。計算は<Link href="/guide/solar-payback">回収年数の計算の考え方と試算</Link>でできます。</li>
                <li><strong>0円ソーラーの場合</strong>：期間中に払う料金の合計と、期間が終わったあとの設備の扱い。</li>
              </ul>
              <p>
                SOLAR SHIFT にご相談いただく場合は、購入して設置するときの費用と、区・都の補助金を整理してお伝えします。0円ソーラーの見積もりと並べてくらべたいときも、遠慮なくお持ちください。
              </p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "0円ソーラーは、本当に0円ですか？",
          a: "設置のときの費用が0円という意味です。太陽光発電協会の説明では、初期費用を事業者が負担し、利用者は電気料金またはリース代として、月々の料金を払います。期間中の所有権は事業者です。",
        },
        {
          q: "0円ソーラーでも、葛飾区の補助金はもらえますか？",
          a: "かつしかエコ助成金（個人住宅用）は、リース・レンタルでの導入を対象外にしています。購入（自己所有）で導入する場合は、対象になり得ます。",
        },
        {
          q: "0円ソーラーと東京都の助成は、どういう関係ですか？",
          a: "東京都は、初期費用ゼロのサービスを提供する事業者に、設置費用の一部を助成しています。クール・ネット東京によると、助成金はサービス利用料の低減等を通じて、住宅所有者等に全額還元されます。",
        },
        {
          q: "0円ソーラーで後悔しないために、何を確かめればよいですか？",
          a: "契約の期間、月々の支払い、期間中と期間終了後の所有権、メンテナンスの負担、途中で解約するときの条件を、書面で確かめます。太陽光発電協会は、説明された内容を書面で確かめて保管することを勧めています。",
        },
      ]}
      sources={[verified.jpeaMethod, verified.tokyoSolarQa, verified.tokyoInitialCostZero, verified.katsushikaGuide, verified.jpeaSetting, verified.caaDoorToDoorSales]}
      relatedCategories={["solar", "electricity-bill", "katsushika-subsidy"]}
      withSubsidyDisclaimer
      cta={{
        title: "買う場合と、くらべてから決めませんか。",
        body: "購入して設置するときの費用と、区・都の補助金を整理してお伝えします。0円ソーラーの見積もりと並べてくらべたいときも、お気軽にご相談ください。相談・見積もりは無料です。",
      }}
    />
  );
}
