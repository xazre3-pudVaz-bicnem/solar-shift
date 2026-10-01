import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { recommendedProducts } from "@/data/products";
import { faqsByIds } from "@/data/faq";
import { getSubsidy } from "@/data/subsidies";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/recommend/battery";
const DESC =
  "葛飾区の住宅で検討しやすいおすすめ家庭用蓄電池を、容量帯・使い方別の選び方とともに紹介。全負荷/特定負荷、ハイブリッド/単機能、東京都の助成（10万円/kWh・SII登録機器）を踏まえた考え方。";

export const metadata: Metadata = buildMetadata({
  title: "おすすめ家庭用蓄電池｜容量帯・使い方別の選び方",
  description: DESC,
  path: PATH,
  keywords: ["おすすめ 蓄電池", "家庭用蓄電池 おすすめ", "蓄電池 選び方 容量", "葛飾区 蓄電池 おすすめ"],
});

const USE_CASES = [
  { title: "夜の電気を賄いたい（平準化重視）", body: "夕方から翌朝の使用量に見合う容量を選びます。一般的な住宅では5〜10kWh前後が選ばれることが多く、太陽光の容量でためられる量が決まるため、太陽光とのバランスを見ます。" },
  { title: "停電時に家全体を使いたい", body: "全負荷型で、定格出力が大きく200V機器に対応する機種が候補です。容量は大きめになり、設置スペースと費用も増えるため、優先回路を絞る特定負荷型との比較が必要です。" },
  { title: "既に太陽光がある（後付け）", body: "単機能型で既設パワコンを活かすか、パワコンの交換時期に合わせてハイブリッド型に替えるか。卒FITの時期も判断材料になります。" },
  { title: "オール電化・EVがある", body: "使用量が多いため容量は大きめに。V2Hがある家はEVのバッテリーも使えるので、家庭用蓄電池は日常の平準化用に絞る考え方もあります。" },
];

export default function RecommendBatteryPage() {
  const products = recommendedProducts("battery");
  const tb = getSubsidy("tokyo-battery")!;
  const kb = getSubsidy("katsushika-battery")!;
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "取扱商品", href: "/products" },
          { name: "おすすめ家庭用蓄電池", href: PATH },
        ]}
        eyebrow="おすすめ商品"
        title="おすすめ家庭用蓄電池"
        lead="蓄電池の「おすすめ」は、容量帯と使い方で変わります。ここでは使い方別の選び方と、東京都・葛飾区の助成を踏まえた考え方を整理し、理由を添えたおすすめ機種を紹介します。"
        image={images.batteryOutdoorWall}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          title="おすすめの考え方"
          conclusion={`蓄電池は「夜に使う量」「停電時にどこまで備えるか」「太陽光と同時か後付けか」で選びます。東京都の助成は${tb.amount.split("（")[0]}（${tb.maxAmount}）で、2026年10月1日以降の事前申込はSII登録機器が条件です。葛飾区は${kb.amount}（${kb.maxAmount}）。おすすめ機種は、メーカー公式情報で仕様を確認し、人が理由を書いたものだけを掲載します。`}
          points={[
            "平準化重視：夜間使用量に合う容量（一般的に5〜10kWh前後が多い）",
            "停電重視：全負荷型・定格出力・200V対応を確認",
            "後付け：単機能型か、パワコン交換と合わせてハイブリッド型か",
            "助成：東京都10万円/kWh（経費が上限・SII登録機器）、葛飾区は対象経費の1/4（上限20万円）",
          ]}
        />
        <section className="cv-block mt-12" aria-labelledby="use-h">
          <h2 id="use-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">使い方別の選び方</h2>
          <div className="mt-5 grid gap-px bg-line sm:grid-cols-2">
            {USE_CASES.map((r) => (
              <div key={r.title} className="bg-white p-6">
                <h3 className="text-[16px] font-bold text-navy-900">{r.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.85] text-ink-2">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-ink-2">
            容量と種類の詳しい考え方は<Link href="/guide/battery-how-to-choose" className="mx-1 text-navy-600 underline underline-offset-4">蓄電池の選び方</Link>、費用は<Link href="/guide/battery-cost" className="mx-1 text-navy-600 underline underline-offset-4">蓄電池の費用</Link>をご覧ください。仕様の見方は<Link href="/products/battery" className="mx-1 text-navy-600 underline underline-offset-4">蓄電池一覧</Link>にまとめています。
          </p>
        </section>
        <section className="cv-block mt-14" aria-labelledby="rec-h">
          <h2 id="rec-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">おすすめ機種</h2>
          <div className="mt-5">
            <ProductCatalog products={products} category="battery" emptyTitle="おすすめ機種は順次掲載予定です" emptyBody="メーカー公式情報で仕様とSII登録状況を確認し、使い方ごとに「なぜ勧めるのか」の理由を添えて掲載します。仕様からの自動判定や、根拠のないランキングは行いません。" />
          </div>
        </section>
        <section className="cv-block mt-14" aria-labelledby="faq-h">
          <h2 id="faq-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">よくある質問</h2>
          <FaqSection items={faqsByIds(["battery-capacity", "subsidy-tokyo-battery-sii", "cost-battery"])} withSchema className="mt-5" />
        </section>
        <SubsidyDisclaimer className="mt-10" />
      </Container>
      <CtaSection title="容量の根拠を示した提案を。" body="電気の使い方と停電時に守りたいものを伺い、容量・負荷タイプ・方式の根拠を示してご提案します。SII登録状況も確認します。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "おすすめ家庭用蓄電池", description: DESC }))} />
    </>
  );
}
