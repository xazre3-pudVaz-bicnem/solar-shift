import { EnergyFlowFigure } from "@/components/sections/EnergyFlowFigure";
import { ProseTable } from "@/components/ui/ProseTable";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getSubsidy } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { simulate } from "@/lib/subsidy-calc";
import { ServiceLayout } from "@/components/sections/ServiceLayout";
import { images } from "@/data/images";
import { SubsidyBars } from "@/components/subsidy/SubsidyBars";

const PATH = "/solar-battery";
const DESC =
  "太陽光と蓄電池はセットで導入すべきか。同時導入の利点（工事1回・ハイブリッド型・葛飾区の併設加算5万円）と注意点、後付けとの違い、葛飾区・東京都の補助金を踏まえた判断基準を整理。SOLAR SHIFT（株式会社サイプレス）。";

export const metadata: Metadata = buildMetadata({
  title: "太陽光＋蓄電池のセット導入｜利点・注意点・葛飾区の併設加算",
  description: DESC,
  path: PATH,
  keywords: ["太陽光 蓄電池 セット", "太陽光 蓄電池 同時 導入", "太陽光 蓄電池 補助金", "葛飾区 太陽光 蓄電池", "太陽光 蓄電池 セット お得"],
});

export default function SolarBatteryPage() {
  const ids = ["katsushika-solar", "katsushika-battery", "katsushika-solar-battery-addon", "tokyo-solar-existing", "tokyo-battery"];
  const subsidies = ids.map((id) => getSubsidy(id)!).filter(Boolean);
  const addon = getSubsidy("katsushika-solar-battery-addon")!;
  const ex = simulate({ area: "katsushika", housing: "existing", solarKw: 5, batteryKwh: 7, v2h: false, hems: false });

  return (
    <ServiceLayout
      path={PATH}
      pageName="太陽光＋蓄電池のセット導入"
      description={DESC}
      crumbs={[
        { name: "ホーム", href: "/" },
        { name: "太陽光＋蓄電池", href: PATH },
      ]}
      eyebrow="太陽光＋蓄電池"
      heroImage={images.houseBatterySunset}
      tip={{ title: "葛飾区の併設加算", body: <>葛飾区では、太陽光と蓄電池を併設すると<strong className="marker">併設加算（一律5万円）</strong>の対象になります。同時に設置する場合も、すでにある機器に足す場合も対象です。</>, image: images.poseOk }}
      title={<>太陽光＋蓄電池<span className="block text-[0.7em] text-ink-2">つくった電気を、ためて使う</span></>}
      lead="太陽光発電と蓄電池を組み合わせると、昼につくった電気を夜に使えるようになり、買う電気を減らしながら停電にも備えられます。同時に導入するか、後から追加するかで、工事・機器・補助金の扱いが変わります。"
      conclusion={`太陽光と蓄電池の同時導入は、工事を1回にまとめられること、ハイブリッド型パワーコンディショナで機器を集約できることが主な利点です。葛飾区の併設加算（${addon.amount}）は、同時に設置する場合も、すでにある機器に足す場合も対象になります。同時導入は初期費用が大きくなるため、「夜に使う電気の量」と「停電への備えの必要性」で判断します。既に太陽光がある家は、パワコンの交換時期に合わせた後付けも選択肢です。`}
      points={[
        "同時導入の利点：工事が1回で済む・ハイブリッド型で機器を集約できる",
        "葛飾区の併設加算（一律5万円）は、同時に設置する場合も、既設の機器に足す場合も対象",
        "同時導入の注意点：初期費用が大きい。容量の組み合わせを誤ると蓄電池を使い切れない",
        "後付けの利点：先に太陽光の実績を見てから容量を決められる。注意点：単機能型になりやすく、工事が2回",
        "2026年度のFITは5年目以降8.3円/kWh。売るより使う設計に蓄電池が効く",
        "葛飾区の助成は着工4週間前の事前協議、東京都の蓄電池助成はSII登録機器が条件",
      ]}
      sections={[
        {
          id: "why",
          heading: "なぜ組み合わせるのか：昼の電気を夜に",
          figure: <EnergyFlowFigure />,
          body: (
            <>
              <p>太陽光だけの家では、昼に発電した電気のうち使い切れない分を売電し、夜は電力会社から買います。2026年度のFITは最初の4年間が24円/kWhですが、5〜10年目は8.3円/kWhに下がります。買う電気の単価のほうが高い状態が続けば、<strong>売るより自宅で使うほうが有利</strong>です。</p>
              <p>蓄電池を加えると、昼の余剰電力を夜に回せます。発電量が多い季節は買う電気を大きく減らせ、停電時には太陽光で充電しながら蓄電池の電気を使えます。</p>
              <p>それぞれの基礎は<Link href="/solar">太陽光発電</Link>・<Link href="/battery">家庭用蓄電池</Link>のページで解説しています。</p>
            </>
          ),
        },
        {
          id: "together",
          heading: "同時導入の利点と注意点",
          image: images.houseBatteryOutdoor,
          body: (
            <>
              <h3>利点</h3>
              <ul>
                <li><strong>工事が1回で済む</strong>：足場・電気工事・申請をまとめられる</li>
                <li><strong>ハイブリッド型を選べる</strong>：太陽光と蓄電池のパワーコンディショナを1台に集約し、変換ロスと機器数を減らせる</li>
                <li><strong>葛飾区の併設加算</strong>：太陽光と蓄電池を併設すると{addon.amount}が加算される。同時に設置する場合も、既設の機器に足す場合も対象（{addon.lastVerified.replace(/-/g, "/")} 時点の公式情報）</li>
                <li><strong>設計を一体で考えられる</strong>：太陽光の容量と蓄電池の容量のバランスを最初から合わせられる</li>
              </ul>
              <h3>注意点</h3>
              <ul>
                <li>初期費用が大きくなる。補助金を差し引いた実質負担で判断する</li>
                <li>太陽光の容量に対して蓄電池が大きすぎると、ためる電気が足りず使い切れない</li>
                <li>東京都の蓄電池助成は2026年10月1日以降の事前申込からSII登録機器が条件。機種選定前に確認が必要</li>
              </ul>
            </>
          ),
        },
        {
          id: "later",
          heading: "後付けの場合：既に太陽光がある家",
          image: images.batDayNight,
          body: (
            <>
              <p>既に太陽光がある家に蓄電池を後付けする場合、既設のパワーコンディショナを残して蓄電池専用の単機能型を追加するか、パワーコンディショナごとハイブリッド型に交換するかの2通りがあります。</p>
              <p>太陽光発電協会によると、パワーコンディショナの耐用年数は10〜15年といわれます。<strong>交換時期と蓄電池の導入を合わせる</strong>と、工事を一度にまとめられます。FITの買取期間（10年）が終わる「卒FIT」のタイミングも、自家消費に切り替える節目になります。</p>
              <p>葛飾区の併設加算は、すでにある太陽光に蓄電池を足す場合も対象です（区の案内）。その場合は、電力会社が発行した、売電を確認できる書類の写しを添えて申し込みます。卒FIT後の考え方は<Link href="/guide/post-fit">卒FIT後の選択肢</Link>へ。</p>
            </>
          ),
        },
        {
          id: "example",
          heading: "導入例：既存住宅に太陽光5kW＋蓄電池7kWh",
          figure: <SubsidyBars result={ex} />,
          body: (
            <>
              <p>葛飾区の既存住宅で、太陽光5kWと蓄電池7kWhを同時導入した場合の想定助成額を、制度ごとに分けて示します（{addon.lastVerified.replace(/-/g, "/")} 時点の公式情報による概算。区と都は合算していません）。</p>
              <ProseTable>
                <thead>
                  <tr>
                    <th>自治体</th>
                    <th>制度・メニュー</th>
                    <th>計算式</th>
                    <th>想定額</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.areas.flatMap((a) =>
                    a.lines.map((l) => (
                      <tr key={l.subsidy.id}>
                        <td>{a.label}</td>
                        <td>{l.subsidy.name}</td>
                        <td>{l.formula}</td>
                        <td>
                          {l.amount === null ? "—" : `${l.amount.toLocaleString("ja-JP")}円`}
                          {l.isCapOnly ? "（上限額）" : ""}
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </ProseTable>
              <p>葛飾区の蓄電池は対象経費の1/4のため、経費が未確定の段階では上限額で示しています。ご自宅の条件での試算は<Link href="/simulation">補助金シミュレーター</Link>をご利用ください。</p>
            </>
          ),
        },
        {
          id: "decide",
          heading: "セットにするかどうかの判断基準",
          image: images.poseThink,
          body: (
            <>
              <ol>
                <li><strong>夜に使う電気が多いか</strong>：共働きで夜に集中する、オール電化、EVがある → 蓄電池の効果が大きい</li>
                <li><strong>停電への備えをどこまで求めるか</strong>：水害リスクのある地域で在宅避難を想定するなら、蓄電池の価値は高い</li>
                <li><strong>初期費用と補助金のバランス</strong>：補助金を差し引いた実質負担で無理がないか</li>
                <li><strong>屋根に載る太陽光の容量</strong>：容量が小さいと蓄電池をためきれない。先に太陽光の容量を確定する</li>
              </ol>
              <p>SOLAR SHIFT では、太陽光のみ・太陽光＋蓄電池・将来の後付けの3案を並べて比較できる形でご提案します。</p>
            </>
          ),
        },
      ]}
      subsidies={subsidies}
      subsidyNote={<p>太陽光と蓄電池を併設すると、葛飾区の併設加算の対象になります（既設の機器に足す場合も対象）。区と都は併用できますが、補助金の合計は助成対象経費が上限です。</p>}
      faq={faqsByIds(["battery-set", "battery-capacity", "subsidy-combination", "cost-payback"])}
      related={[
        { href: "/subsidy/katsushika", label: "葛飾区の補助金", description: "併設加算を含む金額・条件" },
        { href: "/subsidy/tokyo", label: "東京都の補助金", description: "太陽光・蓄電池の助成額" },
        { href: "/simulation", label: "補助金シミュレーター", description: "区と都を分けて試算" },
        { href: "/guide/all-electric", label: "オール電化との相性", description: "電気を使う家ほど効く組み合わせ" },
        { href: "/guide/blackout", label: "停電時の備え", description: "どこまで使えるかを具体的に" },
        { href: "/flow", label: "導入までの流れ", description: "申請の順番と工事日程" },
      ]}
      relatedCategories={["battery", "solar", "katsushika-subsidy"]}
      cta={{
        title: "太陽光のみ・セット・後付け。3案を並べて比べられる提案を。",
        body: "屋根に載る容量と電気の使い方から、太陽光だけで十分か、蓄電池まで入れるべきかを一緒に判断します。葛飾区・東京都の想定助成額も制度ごとに整理します。相談は無料です。",
      }}
    />
  );
}
