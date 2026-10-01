import { ProseTable } from "@/components/ui/ProseTable";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { getSubsidy } from "@/data/subsidies";
import { GuideArticle } from "@/components/sections/GuideArticle";

const entry = getGuide("battery-cost")!;

export const metadata: Metadata = buildMetadata({
  title: "家庭用蓄電池の費用はいくら？容量別の考え方と補助金",
  description:
    "家庭用蓄電池の価格は容量（kWh）・全負荷か特定負荷か・ハイブリッド型か単機能型か・工事条件で決まります。容量と費用のバランスの考え方と、葛飾区・東京都の蓄電池助成を差し引いた実質負担の見方を整理します。",
  path: entry.path,
  keywords: ["蓄電池 費用", "家庭用蓄電池 価格 容量", "蓄電池 補助金 葛飾区", "蓄電池 kWh 費用"],
  type: "article",
  modifiedTime: entry.updatedAt,
});

export default function Page() {
  const kBattery = getSubsidy("katsushika-battery")!;
  const kAddon = getSubsidy("katsushika-solar-battery-addon")!;
  const tBattery = getSubsidy("tokyo-battery")!;
  const nDr = getSubsidy("national-dr-battery")!;

  return (
    <GuideArticle
      entry={entry}
      conclusion="家庭用蓄電池の費用は「容量（kWh）× 機能（全負荷/特定負荷・ハイブリッド/単機能）× 工事条件」で決まります。金額を一言で示せないのは、同じ容量でも機能と工事で大きく変わるためです。葛飾区では区の助成（助成対象経費の1/4・上限20万円）と東京都の助成（10万円/kWh・DR不参加時は原則上限120万円/戸）が検討対象になるため、助成を差し引いた実質負担で比較してください。"
      points={[
        "費用を決めるのは容量・機能・工事条件の3つ。容量だけで価格は決まらない",
        "住宅用蓄電池は一般的に5〜10kWh前後が多く選ばれる。大きいほど良いわけではない",
        "東京都の蓄電池助成は10万円/kWh。2026年10月1日以降の事前申込はSII登録機器に限られる",
        "葛飾区の蓄電池助成は対象経費の1/4・上限20万円。太陽光と同時なら併設加算が別にある",
        "見積もりは「kWh単価」と「助成を差し引いた実質負担」の2軸で比べる",
      ]}
      sections={[
        {
          id: "factors",
          heading: "蓄電池の費用を決める4つの要素",
          body: (
            <>
              <p>蓄電池の見積もりを見ると、同じ「蓄電池一式」でも金額に大きな幅があります。価格差を生む要素は次の4つです。</p>
              <h3>1. 容量（kWh）</h3>
              <p>蓄電池に貯められる電気の量です。容量が大きいほど機器費は上がりますが、工事費は容量に比例しないため、容量あたりの単価は大きいほど下がる傾向があります。</p>
              <h3>2. 全負荷型か特定負荷型か</h3>
              <p>停電時に家全体へ電気を送れる「全負荷型」と、あらかじめ決めた回路だけに送る「特定負荷型」があります。全負荷型は分電盤まわりの工事が増えるため、同じ容量でも費用は高くなります。</p>
              <h3>3. ハイブリッド型か単機能型か</h3>
              <p>太陽光のパワーコンディショナと蓄電池のパワーコンディショナを1台にまとめた「ハイブリッド型」と、蓄電池専用の「単機能型」があります。太陽光と同時に導入する場合や、既存のパワコンが交換時期に近い場合はハイブリッド型が候補になります。</p>
              <h3>4. 設置場所と工事条件</h3>
              <p>屋外設置か屋内設置か、基礎工事の要否、分電盤からの距離、搬入経路などで工事費が変わります。葛飾区の住宅地は敷地が狭いことが多く、設置場所の確保が費用に影響することがあります。</p>
              <p>機能の選び方の詳細は<Link href="/guide/battery-how-to-choose">蓄電池の選び方ガイド</Link>で解説しています。</p>
            </>
          ),
        },
        {
          id: "capacity",
          heading: "容量と費用のバランス：5〜10kWhが選ばれる理由",
          body: (
            <>
              <p>住宅用の蓄電池は、一般的に5〜10kWh前後の容量が多く選ばれています。この範囲が選ばれるのは、夜間に使う電気の量と、太陽光の余剰電力の量がこのあたりに収まるご家庭が多いためです。</p>
              <p>容量が大きすぎると、太陽光の余剰で満充電にならず、使い切れない容量に費用を払うことになります。小さすぎると、夕方から夜の電気をまかないきれず、停電時の安心感も限られます。「夜に使う電気の量」と「太陽光の余剰」の両方を見て、ちょうど収まる容量を探すのが基本です。</p>
              <p>停電時の備えを重視するなら、普段の使い方より少し大きめにする考え方もあります。ただし、東京都・葛飾区の助成には上限があり、容量を増やしても助成が比例して増えるとは限りません。容量を決めるときは制度の区分も合わせて確認します。</p>
            </>
          ),
        },
        {
          id: "subsidy",
          heading: "葛飾区・東京都の蓄電池助成を差し引く",
          body: (
            <>
              <p>葛飾区にお住まいの場合、蓄電池の導入で検討対象になる主な制度は次のとおりです（{kBattery.lastVerified.replace(/-/g, "/")} 時点）。</p>
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
                    <td>葛飾区 {kBattery.programName}（{kBattery.name}）</td>
                    <td>{kBattery.amount}</td>
                    <td>{kBattery.maxAmount}</td>
                  </tr>
                  <tr>
                    <td>葛飾区 {kAddon.programName}（{kAddon.name}）</td>
                    <td>{kAddon.amount}</td>
                    <td>{kAddon.maxAmount}</td>
                  </tr>
                  <tr>
                    <td>東京都 {tBattery.programName}（{tBattery.name}）</td>
                    <td>{tBattery.amount}</td>
                    <td>{tBattery.maxAmount}</td>
                  </tr>
                </tbody>
              </ProseTable>
              <p>東京都の助成は容量に応じた金額で、DR（デマンドレスポンス）実証に参加すると加算や上限の扱いが変わります。また、2026年10月1日以降に事前申込をする場合、助成対象はSIIが登録している機器に限られます。検討中の機種が登録済みかどうかは、見積もりの段階で確認が必要です。</p>
              <p>国の制度は状況が変わりやすく、{nDr.programName}（令和7年度補正）は2026年5月29日に予算到達で公募終了しています。区・都・国の併用可否は各制度の公式案内に明記がないものがあるため、申請前に各窓口への確認が必要です。想定額は<Link href="/simulation">補助金シミュレーター</Link>で、都の制度の詳細は<Link href="/subsidy/tokyo">東京都の補助金ページ</Link>でご確認ください。</p>
            </>
          ),
        },
        {
          id: "compare",
          heading: "見積もりを比較する2つの軸",
          body: (
            <>
              <p>蓄電池の見積もりを比べるときは、総額だけで判断せず、次の2つの軸で見ます。</p>
              <ul>
                <li><strong>kWh単価</strong>：総額 ÷ 容量。容量の違う見積もりを同じ土俵で比べる基準になります。ただし全負荷型と特定負荷型、ハイブリッド型と単機能型では機能が違うため、同じ機能同士で比べます。</li>
                <li><strong>助成を差し引いた実質負担</strong>：総額から、対象になり得る助成の想定額を引いた金額。制度ごとの上限と要件を踏まえて計算します。</li>
              </ul>
              <p>加えて、保証の年数と条件（サイクル数や年数で区切られる容量保証）、停電時に使える範囲、設置後のサポート体制も比較の材料になります。安さだけで選ぶと、停電時に使いたい機器が動かない、保証が薄い、といった問題が後から出てきます。</p>
            </>
          ),
        },
        {
          id: "timing",
          heading: "太陽光と同時か、後からか",
          body: (
            <>
              <p>蓄電池は、太陽光と同時に導入する方法と、太陽光を先に入れて後から追加する方法があります。費用の面では、同時導入のほうが工事を1回にまとめられ、ハイブリッド型パワコンで機器を1台にできるため、合計の負担を抑えやすい傾向があります。葛飾区の併設加算も同時申請が条件です。</p>
              <p>一方で、すでに太陽光を設置済みのご家庭では、パワーコンディショナの交換時期に合わせてハイブリッド型へ切り替える方法が現実的です。卒FITを迎えるタイミングで蓄電池を追加し、自家消費に切り替える考え方もあります。</p>
              <p>太陽光と蓄電池を同時に導入する場合の構成は<Link href="/solar-battery">太陽光＋蓄電池のページ</Link>で整理しています。SOLAR SHIFT では、現地調査のうえで容量と機能の候補を複数お出しし、制度ごとの想定助成額を別紙で整理します。</p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "蓄電池だけを先に入れることはできますか？",
          a: "可能です。太陽光がなくても、夜間の電気を貯めて昼に使う使い方や、停電時の備えとして導入するご家庭があります。ただし太陽光の余剰を貯める効果はないため、目的を明確にしてから容量を決めます。",
        },
        {
          q: "東京都の助成を受けるには、どの機種でもいいのですか？",
          a: "2026年10月1日以降に事前申込をする場合は、SII（環境共創イニシアチブ）が登録している機器に限られます。検討中の機種が登録済みかを、見積もりの段階で確認してください。",
        },
        {
          q: "蓄電池の費用は補助金を引いた金額で支払えますか？",
          a: "補助金は原則として工事完了後の実績報告を経て交付されるため、契約時の支払いは総額になります。交付の時期と支払いの流れを事前に確認してください。",
        },
      ]}
      sources={[
        { name: kBattery.sourceName, url: kBattery.sourceUrl, verifiedAt: kBattery.lastVerified },
        { name: tBattery.sourceName, url: tBattery.sourceUrl, verifiedAt: tBattery.lastVerified },
        { name: nDr.sourceName, url: nDr.sourceUrl, verifiedAt: nDr.lastVerified },
      ]}
      relatedCategories={["battery", "tokyo-subsidy"]}
      withSubsidyDisclaimer
      cta={{
        title: "わが家に合う容量と、差し引ける助成額を整理します。",
        body: "夜間の電気の使い方と太陽光の余剰から容量の候補を出し、葛飾区・東京都の想定助成額を別紙でお渡しします。現地調査・見積もりは無料です。",
      }}
    />
  );
}
