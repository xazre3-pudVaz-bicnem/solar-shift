import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { publishedProducts } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/products";
const DESC =
  "SOLAR SHIFTの取扱商品（太陽光パネル・家庭用蓄電池・V2H・HEMS）。メーカー公式情報で仕様を確認した商品を順次掲載。価格未確定の商品は架空の価格を出さず「お問い合わせください」と表示します。";

export const metadata: Metadata = buildMetadata({
  title: "取扱商品・おすすめ商品一覧｜太陽光パネル・蓄電池・V2H・HEMS",
  description: DESC,
  path: PATH,
  keywords: ["太陽光パネル 商品", "蓄電池 商品", "太陽光 メーカー 比較", "蓄電池 メーカー 比較"],
});

const CATEGORIES = [
  { href: "/products/solar", title: "太陽光パネル一覧", body: "公称最大出力・変換効率・サイズ・保証で比較。屋根の形に合わせた選び方。" },
  { href: "/products/battery", title: "蓄電池一覧", body: "蓄電容量・定格出力・全負荷/特定負荷・設置場所で比較。SII登録の確認。" },
  { href: "/recommend/solar", title: "おすすめ太陽光パネル", body: "葛飾区の住宅で検討しやすい機種を、理由とともに。" },
  { href: "/recommend/battery", title: "おすすめ家庭用蓄電池", body: "容量帯ごとの考え方と、東京都の助成を踏まえた選び方。" },
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "取扱商品", href: PATH },
        ]}
        eyebrow="取扱商品"
        title="取扱商品・おすすめ商品"
        lead="太陽光パネル・家庭用蓄電池・V2H・HEMSの取扱商品です。仕様はメーカー公式情報で確認したものだけを掲載し、価格が未確定の商品には価格を表示しません。"
        image={images.panelBatteryProducts}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          title="商品の掲載方針"
          conclusion="商品は「メーカー公式情報で仕様を確認できたもの」だけを掲載します。価格が未確定の商品は架空の価格を出さず「お問い合わせください」と表示し、取扱契約が確認できていないメーカーについて「正規取扱店」などの表現は使いません。"
          points={[
            "各商品ページには、仕様・特徴・向いている家庭・メリット・注意点・他製品との違い・太陽光との組み合わせ・補助金対象の可能性・葛飾区で導入する考え方・FAQを掲載",
            "東京都の蓄電池助成は2026年10月1日以降の事前申込からSII登録機器が条件。登録状況は機種ごとに確認",
            "おすすめは「人が理由を書いたもの」だけ。仕様からの自動判定は行わない",
          ]}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <Link key={c.href} href={c.href} className="block rounded-3xl border border-line bg-white p-5 shadow-card transition-transform duration-200 hover:-translate-y-1 hover:border-orange-400">
              <h2 className="text-[17px] font-bold text-navy-900">{c.title}</h2>
              <p className="mt-2 text-[14px] leading-[1.8] text-ink-2">{c.body}</p>
              <p className="mt-3 text-[13px] font-bold text-navy-600">一覧を見る →</p>
            </Link>
          ))}
        </div>
        <div className="mt-14">
          <ProductCatalog products={publishedProducts} showComparison={false} />
        </div>
      </Container>
      <CtaSection
        title="機種選びは、屋根と電気の使い方を見てから。"
        body="カタログの数字だけでは決められない部分を、現地調査で確認してからご提案します。価格・納期・補助金の対象可否もあわせてお伝えします。相談は無料です。"
      />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "取扱商品・おすすめ商品一覧", description: DESC, type: "CollectionPage" }))} />
    </>
  );
}
