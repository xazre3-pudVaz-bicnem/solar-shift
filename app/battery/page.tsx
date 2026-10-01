import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { subsidiesByEquipment, getSubsidy } from "@/data/subsidies";
import { siteConfig } from "@/lib/site";
import { faqsByIds } from "@/data/faq";
import { ServiceLayout } from "@/components/sections/ServiceLayout";
import { images } from "@/data/images";

const PATH = "/battery";
const DESC =
  "葛飾区で家庭用蓄電池を検討する方へ。蓄電池の役割、容量（kWh）の決め方、全負荷・特定負荷、ハイブリッド型と単機能型の違い、設置場所、葛飾区・東京都の補助金（都は10万円/kWh・2026年10月からSII登録機器限定）を整理。";

export const metadata: Metadata = buildMetadata({
  title: "葛飾区の家庭用蓄電池｜容量の決め方・種類・補助金",
  description: DESC,
  path: PATH,
  keywords: ["葛飾区 蓄電池", "家庭用蓄電池 容量", "蓄電池 全負荷 特定負荷", "蓄電池 ハイブリッド 単機能", "葛飾区 蓄電池 補助金"],
});

export default function BatteryPage() {
  const subsidies = subsidiesByEquipment("battery");
  const kBattery = getSubsidy("katsushika-battery")!;
  const kAddon = getSubsidy("katsushika-solar-battery-addon")!;
  return (
    <ServiceLayout
      path={PATH}
      pageName="葛飾区の家庭用蓄電池"
      description={DESC}
      crumbs={[
        { name: "ホーム", href: "/" },
        { name: "家庭用蓄電池", href: PATH },
      ]}
      eyebrow="家庭用蓄電池"
      heroImage={images.batteryOutdoorWall}
      tip={{ title: "機種を決める前に", body: <>東京都の助成は、2026年10月1日以降の事前申込から<strong className="marker">SII登録機器</strong>に限られます。型番が登録済みかを先に確認しましょう。</>, image: images.poseIdea }}
      title={<>家庭用蓄電池<span className="block text-[0.7em] text-ink-2">昼の電気を夜に使い、停電に備える</span></>}
      lead="家庭用蓄電池は、太陽光で発電した電気や夜間の安い電気をためておき、必要なときに使う設備です。電気代の平準化と、停電時の備えという2つの役割があります。容量・負荷タイプ・設置場所で選び方が変わります。"
      conclusion="蓄電池は「夜に使う電気の量」と「停電時にどこまで備えたいか」で容量と種類を決めます。一般的な住宅では5〜10kWh前後が選ばれることが多く、全負荷型なら家全体、特定負荷型なら決めた回路だけを停電時に使えます。東京都の助成は10万円/kWh（DR不参加は原則上限120万円/戸）で、2026年10月1日以降の事前申込はSII登録機器に限られます。葛飾区は対象経費の1/4（上限20万円）です。"
      points={[
        "役割は2つ：昼に余った電気を夜に回す「平準化」と、停電時の「備え」",
        "容量は夜間の使用量・停電時の優先回路・太陽光の容量・EVの有無から決める",
        "全負荷型は家全体、特定負荷型は選んだ回路だけが停電時に使える",
        "太陽光と同時導入ならハイブリッド型でパワコンを1台に集約できる。後付けなら単機能型が選択肢",
        "東京都の助成はSII登録機器が条件（2026年10月以降の事前申込）。機種選定前に登録状況を確認する",
      ]}
      sections={[
        {
          id: "role",
          heading: "蓄電池の2つの役割",
          image: images.batteryIndoor,
          body: (
            <>
              <h3>1. 電気の使い方を平準化する</h3>
              <p>太陽光がある家では、昼に余った電気をためて夜に使えます。2026年度のFITは5年目以降の売電単価が8.3円/kWhに下がるため、売るより使うほうが有利な時期が来ます。蓄電池はその「使う」を増やす設備です。</p>
              <h3>2. 停電時の備え</h3>
              <p>停電時に蓄電池の電気で冷蔵庫・照明・通信機器などを動かせます。太陽光と組み合わせれば、日中に充電しながら使えるため、長期の停電でも最低限の電力を確保しやすくなります。</p>
              <p>葛飾区は荒川・中川・江戸川に囲まれ、区の半分近くが海抜ゼロメートル地帯です。在宅避難の備えとして蓄電池を検討する場合は、設置場所の浸水想定も合わせて確認します。詳しくは<Link href="/guide/blackout">停電時の太陽光・蓄電池</Link>へ。</p>
            </>
          ),
        },
        {
          id: "capacity",
          heading: "容量（kWh）の決め方",
          image: images.batCharge,
          body: (
            <>
              <p>容量は次の4つから考えます。</p>
              <ol>
                <li><strong>夜間に使う電気の量</strong>：夕方から翌朝までの使用量が、日常的にためておきたい量の目安</li>
                <li><strong>停電時の優先回路</strong>：冷蔵庫・照明・通信・医療機器など、止めたくないものと必要な時間</li>
                <li><strong>太陽光の容量</strong>：昼にためられる量は太陽光の発電量で決まる</li>
                <li><strong>EV・オール電化の有無</strong>：使用量が多い家は大きめ、V2Hがある家はEVのバッテリーも使える</li>
              </ol>
              <p>一般的な住宅では5〜10kWh前後が選ばれることが多いですが、東京都の助成（10万円/kWh）は助成対象経費が上限になるため、容量と費用のバランスを見て決めます。考え方は<Link href="/guide/battery-how-to-choose">蓄電池の選び方</Link>で詳しく解説しています。</p>
            </>
          ),
        },
        {
          id: "type",
          heading: "全負荷と特定負荷、ハイブリッドと単機能",
          image: images.batteryPowerconOutdoor,
          body: (
            <>
              <h3>全負荷型／特定負荷型</h3>
              <ul>
                <li><strong>全負荷型</strong>：停電時に家全体の回路に電気を供給。200V機器（エアコン・IH）も使える機種がある。容量が大きめになりやすい</li>
                <li><strong>特定負荷型</strong>：停電時にあらかじめ決めた回路だけに供給。費用を抑えやすいが、使える範囲は限定される</li>
              </ul>
              <h3>ハイブリッド型／単機能型</h3>
              <ul>
                <li><strong>ハイブリッド型</strong>：太陽光と蓄電池のパワーコンディショナが1台。変換ロスが少なく、太陽光と同時導入する場合に向く</li>
                <li><strong>単機能型</strong>：蓄電池専用のパワーコンディショナを追加。既設の太陽光に後付けする場合の選択肢</li>
              </ul>
              <p>既に太陽光がある家は、パワーコンディショナの交換時期と蓄電池の導入を合わせると、機器をハイブリッド型にまとめられることがあります。</p>
            </>
          ),
        },
        {
          id: "place",
          heading: "設置場所と環境",
          image: images.batTemperature,
          body: (
            <>
              <p>蓄電池には屋外設置型と屋内設置型があり、重量・サイズ・動作温度の条件が機種ごとに異なります。設置場所は次の点を確認します。</p>
              <ul>
                <li>直射日光・高温・塩害を避けられるか</li>
                <li>基礎の施工スペースと搬入経路が確保できるか</li>
                <li>水害リスクのある地域では、浸水想定深に対して設置高さを確保できるか</li>
                <li>分電盤からの配線距離</li>
              </ul>
              <p>葛飾区の住宅地では敷地に余裕がないことも多く、現地調査で設置場所の候補を一緒に確認します。</p>
            </>
          ),
        },
        {
          id: "katsushika",
          heading: "葛飾区で蓄電池を導入するときの考え方",
          image: images.houseDuskLights,
          body: (
            <>
              <p>葛飾区は荒川・中川・江戸川・新中川に囲まれ、区の半分近くが海抜ゼロメートル地帯です。蓄電池やパワーコンディショナは電気機器のため、設置場所はハザードマップの浸水想定を踏まえ、設置高さや屋内設置も含めて検討します。考え方は<Link href="/guide/blackout">停電時の太陽光・蓄電池</Link>と<Link href="/area/katsushika">葛飾区の太陽光発電・蓄電池</Link>で解説しています。</p>
              <p>
                葛飾区の「{kBattery.programName}」では、蓄電池は<strong>{kBattery.amount}（{kBattery.maxAmount}）</strong>、太陽光発電と同時に導入する場合は併設加算（{kAddon.amount}）があります（{formatDateJa(siteConfig.subsidyInfoDate)}時点の公式情報）。区の助成は工事着工の4週間前までの事前協議が原則のため、機種を決めたら着工日から逆算して申請を組み込みます。詳しくは<Link href="/subsidy/katsushika">葛飾区の補助金</Link>をご覧ください。
              </p>
              <p>東京都の助成とは、制度も窓口も別です。併用の可否は公式情報で明記が確認できていないため、申請前に各窓口への確認が必要です。</p>
            </>
          ),
        },
        {
          id: "sii",
          heading: "東京都の助成はSII登録機器が条件に",
          image: images.iconGClipboardHouse,
          body: (
            <>
              <p>東京都の蓄電池助成では、<strong>2026年10月1日以降に事前申込をする場合、助成対象機器はSII（環境共創イニシアチブ）が登録している機器に限られます</strong>。検討中の型番が登録されているか、機種選定の段階で確認することが大切です。</p>
              <p>助成は10万円/kWhで、DR実証に参加しない場合は原則上限120万円/戸、助成対象経費（税抜）が上限です。詳細は<Link href="/subsidy/tokyo">東京都の補助金ページ</Link>をご覧ください。</p>
            </>
          ),
        },
      ]}
      subsidies={subsidies}
      subsidyNote={<p>国のDR家庭用蓄電池事業は2026年5月29日に受付終了しています（受付状況は変わるため公式サイトで要確認）。</p>}
      faq={faqsByIds(["battery-capacity", "battery-set", "cost-battery", "subsidy-tokyo-battery-sii"])}
      related={[
        { href: "/solar-battery", label: "太陽光＋蓄電池", description: "同時導入の利点と併設加算" },
        { href: "/subsidy/tokyo", label: "東京都の補助金", description: "10万円/kWhの条件とSII登録要件" },
        { href: "/guide/battery-cost", label: "蓄電池の費用", description: "価格を決める要素と助成の考え方" },
        { href: "/guide/battery-how-to-choose", label: "蓄電池の選び方", description: "容量・負荷タイプ・方式の違い" },
        { href: "/recommend/battery", label: "おすすめ蓄電池", description: "取扱商品（順次掲載）" },
        { href: "/products/battery", label: "蓄電池一覧", description: "容量・出力・負荷タイプの見方" },
      ]}
      relatedCategories={["battery", "tokyo-subsidy"]}
      cta={{
        title: "夜に使う電気の量から、必要な容量を一緒に考えます。",
        body: "電気の使い方と停電時に守りたいものを伺い、容量・負荷タイプ・設置場所の候補をご提案します。SII登録機器かどうかも確認します。相談・見積もりは無料です。",
      }}
    />
  );
}
