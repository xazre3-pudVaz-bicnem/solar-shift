import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { recommendedProducts } from "@/data/products";
import { faqsByIds } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/recommend/solar";
const DESC =
  "葛飾区の住宅で検討しやすいおすすめ太陽光パネルを、屋根タイプ別の選び方とともに紹介。面積が限られる屋根・寄棟・陸屋根それぞれの考え方と、葛飾区・東京都の補助金区分を踏まえた容量設計。";

export const metadata: Metadata = buildMetadata({
  title: "おすすめ太陽光パネル｜葛飾区の屋根タイプ別の選び方",
  description: DESC,
  path: PATH,
  keywords: ["おすすめ 太陽光パネル", "太陽光パネル 選び方", "葛飾区 太陽光 おすすめ", "太陽光 メーカー おすすめ"],
});

const ROOF_TYPES = [
  { title: "南向きに広い面がある屋根（片流れ・切妻）", body: "載せられる枚数が多いため、1枚あたりの出力よりも「枚数 × 出力」の総容量と、補助金の区分（葛飾区は上限30万円＝5kW相当、東京都の既存住宅は3.75kW超で12万円/kW）を見て容量を決めます。" },
  { title: "面が分かれる屋根（寄棟）", body: "1面あたりの枚数が少なくなるため、変換効率の高い機種や、小さな面にも載せやすいサイズの機種が候補になります。東西面への配置も含めて設計します。" },
  { title: "面積が限られる屋根", body: "変換効率を優先します。同じ面積でより多く発電できる機種を選び、容量は無理に増やさず、蓄電池やエコキュートで自家消費率を上げる方向で考えます。" },
  { title: "陸屋根", body: "架台で角度をつけて設置します。東京都の助成には陸屋根向けの架台設置・防水工事の追加メニューがあるため（条件あり）、工法と合わせて検討します。" },
];

export default function RecommendSolarPage() {
  const products = recommendedProducts("solar");
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "取扱商品", href: "/products" },
          { name: "おすすめ太陽光パネル", href: PATH },
        ]}
        eyebrow="おすすめ商品"
        title="おすすめ太陽光パネル"
        lead="「どの家にも最適な1枚」はありません。屋根のタイプと面積、補助金の区分、電気の使い方で選ぶべき機種は変わります。ここでは屋根タイプ別の考え方と、理由を添えたおすすめ機種を紹介します。"
        image={images.roofPanelsTree3}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          title="おすすめの考え方"
          conclusion="太陽光パネルのおすすめは、屋根タイプごとに「何を優先するか」で決まります。広い屋根なら総容量と補助金区分、面が分かれる屋根や面積が限られる屋根なら変換効率とサイズ、陸屋根なら架台と防水を優先します。おすすめ機種は、メーカー公式情報で仕様を確認し、人が理由を書いたものだけを掲載します。"
          points={[
            "広い屋根：総容量と補助金区分（葛飾区上限30万円、都の容量区分）を基準に",
            "寄棟・小さな面：変換効率とサイズで載せられる枚数を確保",
            "陸屋根：東京都の架台・防水の追加助成を含めて工法を検討",
            "保証：出力保証25年前後が主流。製品保証と施工保証の条件もあわせて確認",
          ]}
        />
        <section className="cv-block mt-12" aria-labelledby="roof-h">
          <h2 id="roof-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">屋根タイプ別の選び方</h2>
          <div className="mt-5 grid gap-px bg-line sm:grid-cols-2">
            {ROOF_TYPES.map((r) => (
              <div key={r.title} className="bg-white p-6">
                <h3 className="text-[16px] font-bold text-navy-900">{r.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.85] text-ink-2">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-ink-2">
            屋根条件の詳しい見方は<Link href="/guide/roof-conditions" className="mx-1 text-navy-600 underline underline-offset-4">太陽光に向く屋根の条件</Link>をご覧ください。
          </p>
        </section>
        <section className="cv-block mt-14" aria-labelledby="rec-h">
          <h2 id="rec-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">おすすめ機種</h2>
          <div className="mt-5">
            <ProductCatalog products={products} category="solar" emptyTitle="おすすめ機種は順次掲載予定です" emptyBody="メーカー公式情報で仕様を確認し、屋根タイプごとに「なぜ勧めるのか」の理由を添えて掲載します。仕様からの自動判定や、根拠のないランキングは行いません。" />
          </div>
        </section>
        <section className="cv-block mt-14" aria-labelledby="faq-h">
          <h2 id="faq-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">よくある質問</h2>
          <FaqSection items={faqsByIds(["solar-roof", "solar-lifespan", "cost-solar"])} withSchema className="mt-5" />
        </section>
      </Container>
      <CtaSection title="屋根を見てから、機種を。順番を逆にしません。" body="現地調査で屋根の寸法・向き・影を確認し、屋根タイプに合う機種と容量の候補をご提案します。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "おすすめ太陽光パネル", description: DESC }))} />
    </>
  );
}
