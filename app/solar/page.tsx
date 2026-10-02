import { sources as verified } from "@/data/sources";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { subsidiesByEquipment } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { ServiceLayout } from "@/components/sections/ServiceLayout";
import { images } from "@/data/images";
import { FitStepChart } from "@/components/sections/FitStepChart";

const PATH = "/solar";
const DESC =
  "住宅用太陽光発電の仕組み、向いている家・確認が必要な家、容量の決め方、2026年度のFIT価格、葛飾区・東京都の補助金まで。導入前に知っておきたいことを、葛飾区の SOLAR SHIFT が整理しました。";

export const metadata: Metadata = buildMetadata({
  title: "住宅用太陽光発電の仕組みと向いている家｜容量の決め方・補助金",
  description: DESC,
  path: PATH,
  keywords: ["住宅用 太陽光発電", "太陽光発電 仕組み", "太陽光 容量 決め方"],
});

export default function SolarPage() {
  const subsidies = subsidiesByEquipment("solar").filter((s) => s.area !== "national");
  return (
    <ServiceLayout
      path={PATH}
      pageName="住宅用太陽光発電"
      description={DESC}
      crumbs={[
        { name: "ホーム", href: "/" },
        { name: "太陽光発電", href: PATH },
      ]}
      eyebrow="太陽光発電"
      heroImage={images.houseRoofSkyWide}
      tip={{ title: "容量の決め方", body: <>容量は「<strong className="marker">屋根に載る枚数・電気の使用量・補助金の上限</strong>」の3つから決めます。大きければ得、とは限りません。</>, image: images.poseIdea }}
      title={<>住宅用太陽光発電<span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">屋根でつくった電気を、まず自宅で使う</span></>}
      lead="太陽光発電は、屋根に載せたパネルで発電した電気を自宅で使い、余った分を電力会社に売る仕組みです。電気を「買う量」を減らすことが本来の目的で、売電は補助的な収入と考えるのが2026年度以降の基本です。"
      conclusion="住宅用太陽光発電は「自家消費が主、売電が従」で考えます。2026年度のFIT制度は最初の4年間が24円/kWh、5〜10年目が8.3円/kWhと前半に手厚い設定で、葛飾区では区の助成（6万円/kW・上限30万円）と東京都の助成（既存住宅3.75kW超は12万円/kW）が検討対象です。導入の可否は屋根の向き・面積・影・築年数で決まるため、現地調査が出発点になります。"
      points={[
        "発電した電気は自宅で使うのが最も効果が大きく、余剰分を売電する",
        "屋根の向き・勾配・面積・材質・周囲の影で、載せられる容量と発電の期待値が変わる",
        "容量は「屋根に載る枚数」「電気の使用量」「補助金の上限」の3つから決める",
        "葛飾区の助成は着工4週間前までの事前協議が原則。契約前にスケジュールを確認する",
      ]}
      sections={[
        {
          id: "how",
          heading: "太陽光発電の仕組み：パネル・パワコン・分電盤",
          image: images.panelsCloseupSky,
          body: (
            <>
              <p>太陽光発電システムは、屋根の<strong>太陽電池モジュール（パネル）</strong>、直流を家庭用の交流に変える<strong>パワーコンディショナ</strong>、家の各回路へ電気を分ける<strong>分電盤</strong>、発電量と売電量を測る<strong>電力量計</strong>で構成されます。</p>
              <p>昼間に発電した電気は、まず自宅の冷蔵庫・エアコン・照明などに使われます。使い切れなかった分が電力会社の系統へ流れ、売電になります。夜間や雨天で発電が足りないときは、これまでどおり電力会社から買います。</p>
              <p>蓄電池を組み合わせると、昼に余った電気を夜に回せるため、買う電気をさらに減らせます。詳しくは<Link href="/solar-battery">太陽光＋蓄電池のページ</Link>をご覧ください。</p>
            </>
          ),
        },
        {
          id: "fit",
          heading: "売電の考え方：2026年度のFIT価格",
          figure: <FitStepChart />,
          body: (
            <>
              <p>FIT（固定価格買取制度）では、住宅用（10kW未満）の余剰電力を10年間、決められた単価で買い取ってもらえます。2026年度の単価は<strong>最初の4年間が24円/kWh、5〜10年目が8.3円/kWh</strong>です（経済産業省の公表資料、2026年10月1日時点）。</p>
              <p>前半を高く・後半を低くする「初期投資支援スキーム」により、導入初期に回収を前倒しできる一方、5年目以降は売るより使うほうが有利になります。つまり、長期的には<strong>自家消費を増やす設計</strong>が重要です。</p>
              <p>仕組みと価格の詳細は<Link href="/guide/selling-electricity">売電とFIT価格のガイド</Link>、10年後の選択肢は<Link href="/guide/post-fit">卒FIT後の選択肢</Link>で解説しています。</p>
            </>
          ),
        },
        {
          id: "roof",
          heading: "向いている家、確認が必要な家",
          image: images.roofPanelsFront,
          body: (
            <>
              <h3>向いている条件</h3>
              <ul>
                <li>南向きを中心に、東西にも面がある屋根（片流れ・切妻）</li>
                <li>隣家や電柱・樹木の影が少ない</li>
                <li>屋根材と下地の状態が良く、当面の葺き替え予定がない</li>
                <li>日中に電気を使う人がいる、または蓄電池・エコキュートで昼の電気を活かせる</li>
              </ul>
              <h3>現地での確認が特に必要な条件</h3>
              <ul>
                <li>北向きの面しか空いていない、寄棟で面が小さく分かれている</li>
                <li>隣家との距離が近く、時間帯によって影がかかる（葛飾区の住宅地では珍しくありません）</li>
                <li>築年数が経っていて屋根材・下地の補修が必要になる可能性がある</li>
                <li>陸屋根（東京都には架台設置・防水工事の追加助成メニューがあります）</li>
              </ul>
              <p>屋根条件の見方は<Link href="/guide/roof-conditions">太陽光に向く屋根の条件</Link>で詳しく解説しています。</p>
            </>
          ),
        },
        {
          id: "capacity",
          heading: "容量（kW）はどう決める？",
          image: images.iconClipboardHouse,
          body: (
            <>
              <p>容量は次の3つを突き合わせて決めます。</p>
              <ol>
                <li><strong>屋根に載る枚数</strong>：面積・形状・設置基準で物理的な上限が決まる</li>
                <li><strong>電気の使用量と時間帯</strong>：昼に使う量が多いほど大きめの容量が活きる</li>
                <li><strong>補助金の区分と上限</strong>：葛飾区は6万円/kWで上限30万円（5kWで上限）。東京都の既存住宅は3.75kWを境に単価が15万円→12万円に変わる</li>
              </ol>
              <p>「大きければ得」ではなく、使い切れる容量と制度の区分を見て決めるのが基本です。費用の考え方は<Link href="/guide/solar-cost">太陽光発電の費用</Link>をご覧ください。</p>
            </>
          ),
        },
        {
          id: "longterm",
          heading: "寿命・保証・メンテナンス",
          image: images.iconPanelWrench,
          body: (
            <>
              <p>太陽光発電協会（JPEA）によると、太陽電池モジュールの耐用年数は20年以上、パワーコンディショナは10〜15年といわれています。パワーコンディショナの交換は、長期の維持費として見込んでおきます。</p>
              <p>設置後は、発電量のモニタリングで異常に気づけるようにし、定期的な点検で配線・架台・パネルの状態を確認します。詳しくは<Link href="/guide/solar-lifespan">太陽光パネルの寿命</Link>と<Link href="/guide/maintenance">メンテナンス</Link>のガイドへ。</p>
            </>
          ),
        },
        {
          id: "katsushika",
          heading: "葛飾区で太陽光を導入するときの考え方",
          image: images.katsushikaStreetSunset,
          body: (
            <>
              <p>葛飾区には、立石・四つ木・堀切地域のように、木造の建物が密集する地域として東京都の計画で「整備地域」に指定されている地域があります（葛飾区公式サイト）。隣の建物との距離が近い敷地では、影の影響を現地で確認し、屋根の形に合わせて配置を決めます。</p>
              <p>また、区の半分近くが海抜ゼロメートル地帯で水害リスクがあります。パワーコンディショナや蓄電池の設置場所は、ハザードマップの浸水想定を踏まえて検討します。停電時の備えとしての考え方は<Link href="/guide/blackout">停電時の太陽光・蓄電池</Link>で解説しています。</p>
              <p>区の助成は工事着工4週間前までの事前協議が原則です。契約から着工までの期間に申請を組み込む必要があるため、<Link href="/flow">導入までの流れ</Link>をご確認ください。</p>
            </>
          ),
        },
      ]}
      subsidies={subsidies}
      subsidyNote={<p>葛飾区の住宅では、区と東京都の両方の制度が検討対象になります。併用できますが、補助金の合計は助成対象経費が上限です。</p>}
      faq={faqsByIds(["solar-roof", "cost-payback", "solar-lifespan", "solar-blackout"])}
      sources={[
        verified.jpeaLifespan,
        verified.katsushikaSeibi,
        { name: "経済産業省「再生可能エネルギーのFIT制度・FIP制度における2026年度以降の買取価格等と2026年度の賦課金単価を設定します」", url: "https://www.meti.go.jp/press/2025/03/20260319004/20260319004.html", verifiedAt: "2026-10-01" },
      ]}
      related={[
        { href: "/solar-battery", label: "太陽光＋蓄電池", description: "つくった電気をためて使う組み合わせ" },
        { href: "/subsidy/katsushika", label: "葛飾区の補助金", description: "かつしかエコ助成金の金額・条件・申請" },
        { href: "/guide/solar-merit-demerit", label: "メリット・デメリット", description: "導入前に両面から確認" },
        { href: "/products/solar", label: "太陽光パネル一覧", description: "取扱商品（順次掲載）" },
        { href: "/area/katsushika", label: "葛飾区の太陽光発電", description: "住宅事情・水害リスク・地域FAQ" },
        { href: "/guide/solar-cost", label: "太陽光発電の費用", description: "内訳と補助金を差し引いた考え方" },
      ]}
      relatedCategories={["solar", "katsushika-subsidy"]}
      cta={{
        title: "わが家の屋根に、何kW載るのか。現地調査から始めます。",
        body: "屋根の向き・影・築年数を確認し、容量の候補と葛飾区・東京都の想定助成額を整理してお伝えします。現地調査・お見積もりは無料です。",
      }}
    />
  );
}
