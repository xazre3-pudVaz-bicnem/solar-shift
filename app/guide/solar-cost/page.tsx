import { ProseTable } from "@/components/ui/ProseTable";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { getSubsidy } from "@/data/subsidies";
import { GuideArticle } from "@/components/sections/GuideArticle";

const entry = getGuide("solar-cost")!;

export const metadata: Metadata = buildMetadata({
  title: "太陽光発電の費用はいくら？内訳と葛飾区で使える補助金",
  description:
    "住宅用太陽光発電の設置費用は何で決まるのか。機器費・工事費・足場などの内訳、費用が上下する要因、葛飾区・東京都の補助金を差し引いた考え方を整理します。",
  path: entry.path,
  keywords: ["太陽光発電 費用", "太陽光 設置費用 内訳", "葛飾区 太陽光 費用", "太陽光 補助金 差し引き"],
  type: "article",
  modifiedTime: entry.updatedAt,
});

export default function Page() {
  const kSolar = getSubsidy("katsushika-solar")!;
  const tSolar = getSubsidy("tokyo-solar-existing")!;

  return (
    <GuideArticle
      entry={entry}
      conclusion="太陽光発電の費用は「パネル容量 × 屋根条件 × 機器構成」で決まり、同じ容量でも屋根の形や足場の要否で差が出ます。葛飾区では区の助成（6万円/kW・上限30万円）と東京都の助成（既存住宅で3.75kW超は12万円/kW）が検討対象になるため、見積もりは補助金を差し引いた実質負担で比較してください。"
      points={[
        "費用の内訳は、太陽光パネル・パワーコンディショナ・架台・工事費・足場・申請手続きの6つに分けて確認する",
        "容量（kW）が同じでも、屋根材・勾配・面数・築年数で工事費は変わる",
        "葛飾区・東京都の補助金は制度ごとに上限があるため、容量を増やしても助成が比例して増えるとは限らない",
        "見積もりは総額ではなく「補助金を差し引いた実質負担」と「kW単価」で比較する",
      ]}
      sections={[
        {
          id: "breakdown",
          heading: "太陽光発電の費用の内訳",
          body: (
            <>
              <p>太陽光発電の見積書は、おおよそ次の6項目で構成されます。どの項目がいくらかが分かる見積もりであることが、比較の前提です。</p>
              <ol>
                <li><strong>太陽光パネル（モジュール）</strong>：容量（kW）に応じて枚数が決まる。費用全体の中で最も大きな割合を占めることが多い。</li>
                <li><strong>パワーコンディショナ</strong>：直流を交流に変換する機器。蓄電池と一体のハイブリッド型にするかで価格が変わる。</li>
                <li><strong>架台・取付金具</strong>：屋根材（スレート・瓦・金属）や工法によって種類が変わる。</li>
                <li><strong>電気工事・設置工事</strong>：配線、分電盤の改修、系統連系の工事など。</li>
                <li><strong>足場</strong>：2階建て以上の屋根工事では多くの場合必要。敷地が狭く隣家との距離が近い場合は組み方に工夫が要る。</li>
                <li><strong>申請・手続き</strong>：電力会社への系統連系申請、補助金の申請書類など。</li>
              </ol>
              <p>見積書にこれらが分かれて書かれていない場合は、内訳を出してもらいましょう。「一式」とだけ書かれた見積もりは比較できません。</p>
            </>
          ),
        },
        {
          id: "factors",
          heading: "費用が上下する5つの要因",
          body: (
            <>
              <h3>1. 容量（kW）</h3>
              <p>載せる枚数が増えれば機器費は増えますが、工事費や足場は容量に比例しません。そのため容量が大きいほど「kWあたりの単価」は下がる傾向があります。</p>
              <h3>2. 屋根の形状・面数</h3>
              <p>片流れや切妻で南向きに広い面があれば効率よく載せられます。寄棟屋根で面が分かれる場合は、枚数が制限されたり架台の種類が増えたりします。</p>
              <h3>3. 屋根材と築年数</h3>
              <p>屋根材によって工法が変わります。築年数が経っている場合は、屋根材や下地の補修が先に必要になることがあり、その費用は太陽光の費用とは別に考えます。</p>
              <h3>4. 機器構成（蓄電池を同時に入れるか）</h3>
              <p>蓄電池を同時に導入する場合、ハイブリッド型パワーコンディショナを選べるため機器を1台にまとめられます。後から蓄電池を追加するより工事を1回で済ませられる利点があります。詳しくは<Link href="/solar-battery">太陽光＋蓄電池のページ</Link>をご覧ください。</p>
              <h3>5. 足場と敷地条件</h3>
              <p>葛飾区の住宅地は隣家との距離が近い敷地が多く、足場の組み方や搬入経路によって費用が変わることがあります。現地調査で確認する項目です。</p>
            </>
          ),
        },
        {
          id: "subsidy",
          heading: "葛飾区で使える補助金を差し引いて考える",
          body: (
            <>
              <p>葛飾区にお住まいの場合、検討対象になる主な制度は次の2つです（{kSolar.lastVerified.replace(/-/g, "/")} 時点）。</p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>制度</th>
                    <th>助成額</th>
                    <th>上限</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>葛飾区 {kSolar.programName}（{kSolar.name}）</td>
                    <td>{kSolar.amount}</td>
                    <td>{kSolar.maxAmount}</td>
                  </tr>
                  <tr>
                    <td>東京都 {tSolar.programName}（{tSolar.name}）</td>
                    <td>{tSolar.amount}</td>
                    <td>{tSolar.maxAmount}</td>
                  </tr>
                </tbody>
              </ProseTable>
              <p>葛飾区の助成は上限30万円のため、5kWを超えると助成額は増えません。東京都の既存住宅向け助成は3.75kWを境に単価が変わります。容量を決めるときは、屋根に載る枚数と電気の使用量だけでなく、制度の区分も踏まえて検討します。</p>
              <p>区と都の併用可否は公式案内で明記が確認できていないため、申請前に各窓口への確認が必要です。想定額の目安は<Link href="/simulation">補助金シミュレーター</Link>で、制度の詳細は<Link href="/subsidy/katsushika">葛飾区の補助金ページ</Link>で確認できます。</p>
            </>
          ),
        },
        {
          id: "compare",
          heading: "見積もりを比較するときの3つの軸",
          body: (
            <>
              <ul>
                <li><strong>実質負担額</strong>：総額から、対象になり得る補助金の想定額を差し引いた金額。</li>
                <li><strong>kW単価</strong>：総額 ÷ 容量。容量の違う見積もりを比べるときの基準。</li>
                <li><strong>保証と保守</strong>：パネルの出力保証、機器保証、施工保証の年数と条件。パワーコンディショナの交換費用も長期の負担に含める。</li>
              </ul>
              <p>安さだけで決めると、保証が薄い・工事品質が確認できない・補助金の申請が間に合わない、といった問題が後から出てきます。<Link href="/flow">導入までの流れ</Link>で、申請と工事のスケジュールも合わせてご確認ください。</p>
            </>
          ),
        },
        {
          id: "solar-shift",
          heading: "SOLAR SHIFT の見積もりの出し方",
          body: (
            <>
              <p>SOLAR SHIFT では、現地調査のうえで内訳を分けた見積もりをお出しし、葛飾区・東京都の制度ごとの想定助成額を別紙で整理します。費用を安く見せるために補助金を合算して引いたり、確認できていない制度を前提にしたりはしません。</p>
              <p>現地調査・見積もりは無料です。屋根の状況と電気の使い方を伺ってから、容量の候補を複数お出しします。</p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "太陽光発電の費用は何kWで考えればいいですか？",
          a: "屋根に載る枚数、ご家庭の電気使用量、補助金の上限（葛飾区は30万円、東京都は容量区分あり）の3つを見て決めます。一般的な戸建では3〜6kW程度が多いですが、現地調査で屋根条件を確認してから候補を出します。",
        },
        {
          q: "見積もりに足場代が入っていないことはありますか？",
          a: "あります。足場の要否と費用は見積もり段階で必ず確認してください。後から追加されると実質負担が変わります。",
        },
        {
          q: "補助金を差し引いた金額で契約できますか？",
          a: "補助金は原則として工事完了後の実績報告を経て交付されるため、契約時の支払いは総額になります。交付のタイミングと支払いの流れを事前に確認してください。",
        },
      ]}
      sources={[
        { name: kSolar.sourceName, url: kSolar.sourceUrl, verifiedAt: kSolar.lastVerified },
        { name: tSolar.sourceName, url: tSolar.sourceUrl, verifiedAt: tSolar.lastVerified },
      ]}
      relatedCategories={["solar", "katsushika-subsidy"]}
      withSubsidyDisclaimer
      cta={{
        title: "わが家の屋根なら、いくらで、いくら補助されるのか。",
        body: "現地調査のうえで、内訳を分けた見積もりと、葛飾区・東京都それぞれの想定助成額を整理してお渡しします。相談・見積もりは無料です。",
      }}
    />
  );
}
