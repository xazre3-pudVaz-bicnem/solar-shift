import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { sources as verified } from "@/data/sources";
import { images } from "@/data/images";
import { reveal } from "@/lib/reveal";
import { GuideArticle } from "@/components/sections/GuideArticle";
import { ProseTable } from "@/components/ui/ProseTable";

/**
 * 東京都の太陽光パネル設置義務化のガイド。
 * 検索意図：「東京都 太陽光 義務化」「太陽光パネル 義務化 既存住宅」「東京都 太陽光 義務化 いつから」
 * ＝ 自分の家も対象なのか、いつから・だれに何が義務なのかを知りたい。
 *
 * - 内容は、東京都の資料（Q&A・リーフレット・広報東京都）で確かめたことだけ。「すべての新築に義務」とは書かない。
 * - 既存の住宅は対象外。既存住宅で太陽光を考える人は、補助金のページへ送る。
 */
const entry = getGuide("tokyo-solar-mandate")!;

export const metadata: Metadata = buildMetadata({
  title: "東京都の太陽光パネル設置義務化とは？対象・既存住宅・いつから",
  description:
    "東京都の太陽光パネル設置義務化は、2025年4月に始まった制度です。義務を負うのは大手ハウスメーカー等の事業者で、既存の住宅は対象外です。新築を建てる人・買う人に求められること、都の試算、相談窓口を、東京都の資料で整理しました。",
  path: entry.path,
  keywords: ["東京都 太陽光 義務化", "太陽光パネル 義務化 既存住宅", "東京都 太陽光 義務化 いつから", "建築物環境報告書制度"],
  type: "article",
  publishedTime: entry.publishedAt,
  modifiedTime: entry.updatedAt,
});

/** 「だれに、何が求められるのか」を3つの立場で並べた図 */
function WhoFigure() {
  const cards = [
    {
      who: "大手ハウスメーカー等",
      sub: "年間の都内供給延床面積が合計2万㎡以上の事業者",
      what: "太陽光パネルの設置などの義務がある",
      tone: "bg-orange-500 text-navy-900",
      badge: "義務あり",
      image: images.iconGHouseWrench,
    },
    {
      who: "新築を建てる人・買う人",
      sub: "注文住宅の施主、建売住宅の購入者など",
      what: "契約の前に、事業者から環境性能の説明を受けて判断する",
      tone: "bg-green-600 text-white",
      badge: "説明を受ける",
      image: images.iconGClipboardHouse,
    },
    {
      who: "いま住んでいる家",
      sub: "すでに建っている住宅",
      what: "制度の対象外。後から載せる義務はない",
      tone: "bg-white text-navy-900 border-2 border-[#e2d9c8]",
      badge: "対象外",
      image: images.iconGHouseYenLeaf,
    },
  ];
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-6 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">だれに、何が求められるのか</figcaption>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {cards.map((c, i) => (
          <li key={c.who} className="flex flex-col rounded-2xl bg-white p-4 shadow-card" {...reveal(i * 110, "pop")}>
            <span className={`self-start rounded-full px-3 py-[2px] text-[12px] font-bold ${c.tone}`}>{c.badge}</span>
            <span className="mt-3 flex items-center gap-2.5">
              <Image src={c.image.src} alt="" width={c.image.width} height={c.image.height} sizes="48px" className="h-11 w-11 shrink-0 object-contain" />
              <span className="text-[16px] leading-[1.45] font-black text-navy-900">{c.who}</span>
            </span>
            <span className="mt-1.5 text-[12px] leading-[1.6] text-ink-2">{c.sub}</span>
            <span className="mt-3 border-t border-dashed border-line pt-3 text-[14px] leading-[1.7] font-bold text-ink">{c.what}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">出典：東京都環境局「太陽光パネル設置に関するQ&A」（令和8年4月1日）、広報東京都2025年3月号</p>
    </figure>
  );
}

export default function Page() {
  return (
    <GuideArticle
      entry={entry}
      conclusion="東京都の太陽光パネル設置義務化は、2025年4月に始まった「東京都建築物環境報告書制度」です。義務を負うのは、年間の都内供給延床面積が合計2万㎡以上の大手ハウスメーカー等の事業者で、新築の建物だけが対象です。すでに建っている住宅は対象外で、後から太陽光パネルを載せる義務はありません。"
      points={[
        "対象は、延床面積2,000㎡未満の新築建物。既存の住宅は対象外",
        "義務を負うのは、大手ハウスメーカー等の事業者（約50社の見込み）",
        "どの建物に載せるかは、事業者が日照や屋根の形などを踏まえて判断する",
        "新築を建てる人・買う人は、契約の前に、事業者から環境性能の説明を受ける",
        "既存の住宅で太陽光を考えるときは、区と都の補助金を使える",
      ]}
      tip={{
        title: "いまの家は対象外",
        body: (
          <>
            設置義務化の対象は<strong className="marker">新築だけ</strong>です。「義務化されたので、今の家にも載せないといけない」という説明を受けたら、東京都の資料と照らし合わせてください。
          </>
        ),
      }}
      sections={[
        {
          id: "what",
          heading: "東京都の太陽光パネル設置義務化とは",
          body: (
            <>
              <p>東京都は、2025年4月から、新築住宅等への太陽光発電設備の設置や、断熱・省エネ性能の確保等を義務付ける制度を始めました。制度の名前は「東京都建築物環境報告書制度」です。</p>
              <p>対象は、延床面積2,000㎡未満の、中小規模の新築建物です。注文住宅や建売住宅も、この対象に入ります。</p>
              <p>東京都の資料では、対象の事業者の義務は、次の5つです。</p>
              <ol>
                <li>断熱・省エネ性能の確保</li>
                <li>再生可能エネルギー利用設備の設置</li>
                <li>電気自動車充電設備等の設置</li>
                <li>施主や購入者等への環境性能の説明</li>
                <li>東京都への建築物環境報告書の提出</li>
              </ol>
            </>
          ),
          figure: <WhoFigure />,
        },
        {
          id: "who",
          heading: "義務を負うのは、大手ハウスメーカー等の事業者",
          body: (
            <>
              <p>
                義務を負うのは、住宅を建てる人や買う人ではなく、ハウスメーカー等の事業者です。東京都のQ&Aによると、対象は年間の都内供給延床面積が合計20,000㎡以上の事業者で、都内の大手住宅メーカー約50社が対象になる見込みです。都内の年間新築棟数の半数程度の規模を想定しています。
              </p>
              <p>年間供給5,000㎡以上の事業者は、希望すれば、都の承認を受けて任意で参加できます。</p>
              <h3>すべての新築に載るわけではない</h3>
              <p>
                東京都のQ&Aによると、どの建物に太陽光パネルを設置するかは、義務の対象の事業者が、日照などの立地条件や住宅の形状等を踏まえて判断します。事業者が供給する建物全体で、設置の基準を達成する仕組みです。
              </p>
              <p>屋根の面積が一定の規模に満たない住宅などは、基準の算定から外せます。たとえば、南を含む東から西向きまでの屋根と水平の屋根のうち、最も大きい屋根の水平投影面積が20㎡未満、といった条件です。屋根の北面も、算定から外せます。</p>
              <p>太陽熱や地中熱の利用も、義務の履行に使えます。東京都のQ&Aでは、太陽光パネル2kWの設置と同等に評価するとしています。</p>
            </>
          ),
        },
        {
          id: "buyer",
          heading: "新築を建てる人・買う人に求められること",
          body: (
            <>
              <p>
                東京都の資料によると、対象の事業者は、注文住宅の施主や建売住宅の購入者等に、契約までに、断熱・省エネ・再エネ等の環境性能を書面で説明します。施主や購入者等は、その説明を判断材料にして、注文や購入を決めます。
              </p>
              <p>説明を受けたら、太陽光パネルの容量、設置の有無、そのほかの環境性能を確かめておくと、あとで比べやすくなります。</p>
            </>
          ),
        },
        {
          id: "existing",
          heading: "いま住んでいる家は、義務化の対象外",
          body: (
            <>
              <p>東京都の資料では、新築だけが対象で、既存の物件は対象外です。すでに建っている住宅に、後から太陽光パネルを載せる義務はありません。</p>
              <p>
                いまの家に太陽光発電を載せるかどうかは、住む人が決めることです。載せる場合は、東京都と区の補助金を使えます。制度の全体像は<Link href="/subsidy">補助金の総合ページ</Link>、東京都の助成は<Link href="/subsidy/tokyo">東京都の補助金のページ</Link>にまとめています。
              </p>
            </>
          ),
        },
        {
          id: "estimate",
          heading: "東京都の試算：4kWなら、何年で回収できる計算か",
          body: (
            <>
              <p>東京都は、太陽光パネルを設置した場合の経済性を試算して、公表しています。令和7年10月時点、東京都区部・2人以上の世帯を想定した試算です。</p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>東京都の試算（4kWの場合）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>初期費用</td>
                    <td>117万円</td>
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
              <p>
                東京都は、一定の条件をもとに算出したもので、今後の状況の変化で変わる場合があるとしています。期間中に点検費用（1回約5万円）がかかる場合があり、リサイクルの際には約30万円の費用が別にかかるとも書いています。わが家の数字で考えるときは、<Link href="/guide/solar-payback">回収年数の計算の考え方と試算</Link>をお使いください。
              </p>
            </>
          ),
        },
        {
          id: "others",
          heading: "ほかの自治体の義務化",
          body: (
            <>
              <p>東京都のQ&Aによると、京都府・市（2022年から）、群馬県（2023年から）、川崎市（2025年から）が、新築建物等への設置を義務化しています。仙台市（2027年から）と長野県（2028年から）は、開始の予定です。</p>
              <p>千葉県松戸市と相模原市でも、制度の導入に向けた検討が始まっていると、東京都のQ&Aは書いています。</p>
            </>
          ),
        },
        {
          id: "contact",
          heading: "制度について相談できる窓口",
          body: (
            <>
              <p>東京都の制度の相談は、クール・ネット東京のワンストップ相談窓口が受け付けています。電話は03-5990-5236で、受付時間は平日9時〜17時です。</p>
              <p>
                既存の住宅に太陽光発電や蓄電池を載せる相談は、SOLAR SHIFT でもお受けしています。区と都の補助金を整理し、申請の順番からご案内します。現地調査・お見積もりは無料です。
              </p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "東京都の太陽光パネル設置義務化は、いつから始まりましたか？",
          a: "2025年4月に始まりました。東京都建築物環境報告書制度という名前で、新築住宅等への太陽光発電設備の設置や、断熱・省エネ性能の確保等を、大手ハウスメーカー等の事業者に義務付けています。",
        },
        {
          q: "いま住んでいる家にも、太陽光パネルを載せる義務がありますか？",
          a: "ありません。東京都の資料では、新築だけが対象で、既存の物件は対象外です。載せるかどうかは、住む人が決めます。載せる場合は、東京都と区の補助金を使えます。",
        },
        {
          q: "新築の家を建てると、必ず太陽光パネルが載りますか？",
          a: "必ずではありません。東京都のQ&Aによると、どの建物に設置するかは、義務の対象の事業者が、日照などの立地条件や住宅の形状等を踏まえて判断します。屋根が小さい住宅などは、基準の算定から外せます。",
        },
        {
          q: "義務化の対象になるハウスメーカーは、どこですか？",
          a: "東京都のQ&Aによると、年間の都内供給延床面積が合計20,000㎡以上の事業者で、都内の大手住宅メーカー約50社が対象になる見込みです。個々の会社が対象かどうかは、建てる会社に確かめてください。",
        },
        {
          q: "太陽光パネルを載せた新築は、何年で元が取れる計算ですか？",
          a: "東京都の試算（令和7年10月時点・4kW）では、初期費用117万円を13.8年程度で回収できる計算です。都の試算で想定した補助（10万円/kW）を使うと8.4年程度です。条件によって変わるため、わが家の数字で確かめてください。",
        },
      ]}
      sources={[verified.tokyoKohoMandate, verified.tokyoSolarQa, verified.tokyoReportLeaflet, verified.tokyoSolarPortal]}
      relatedCategories={["tokyo-subsidy", "solar"]}
      withSubsidyDisclaimer
      cta={{
        title: "今の家に載せるなら、補助金の整理から。",
        body: "既存の住宅は義務化の対象外です。載せるかどうかを決めるために、屋根の条件と、区・都の補助金を整理してお伝えします。現地調査・お見積もりは無料です。",
      }}
    />
  );
}
