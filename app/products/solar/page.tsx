import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { productsByCategory } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/products/solar";
const DESC =
  "太陽光パネル（太陽電池モジュール）の取扱商品一覧。公称最大出力・変換効率・サイズ・保証の見方と、葛飾区の住宅で選ぶときの考え方。メーカー公式情報で確認した仕様のみ掲載。";

export const metadata: Metadata = buildMetadata({
  title: "太陽光パネル一覧｜出力・変換効率・保証の見方",
  description: DESC,
  path: PATH,
  keywords: ["太陽光パネル 一覧", "太陽光パネル 比較", "ソーラーパネル 変換効率", "太陽光パネル 保証", "葛飾区 ソーラーパネル"],
});

export default function ProductsSolarPage() {
  const products = productsByCategory("solar");
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "取扱商品", href: "/products" },
          { name: "太陽光パネル一覧", href: PATH },
        ]}
        eyebrow="取扱商品"
        title="太陽光パネル一覧"
        lead="住宅用の太陽電池モジュールです。1枚あたりの出力・変換効率・サイズ・保証の4点で比較し、屋根の形と面積に合わせて選びます。"
        image={images.roofPanelsSky2}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          title="太陽光パネルを比べるときの4つの軸"
          conclusion="太陽光パネルは「1枚あたりの公称最大出力」「変換効率」「サイズ（屋根に何枚載るか）」「出力保証・製品保証」の4点で比較します。面積が限られる屋根では変換効率の高い機種が有利ですが、屋根に載る枚数と総容量、そして補助金の区分（葛飾区は6万円/kW・上限30万円）まで含めて判断します。"
          points={[
            "公称最大出力（W/枚）：枚数 × 出力 = システム容量（kW）",
            "変換効率（%）：同じ面積でどれだけ発電できるか。面積が限られる屋根ほど重要",
            "サイズ・重量：屋根の寸法と構造で載せられる枚数が決まる",
            "保証：出力保証（25年前後が主流）と製品保証の年数・条件",
          ]}
        />
        <div className="mt-12">
          <ProductCatalog products={products} category="solar" />
        </div>
        <p className="mt-10 text-[14px] text-ink-2">
          選び方の考え方は<Link href="/recommend/solar" className="mx-1 text-navy-600 underline underline-offset-4">おすすめ太陽光パネル</Link>・屋根条件は<Link href="/guide/roof-conditions" className="mx-1 text-navy-600 underline underline-offset-4">太陽光に向く屋根の条件</Link>をご覧ください。
        </p>
      </Container>
      <CtaSection title="屋根に何枚載るかで、選ぶべきパネルは変わります。" body="現地調査で屋根の寸法・向き・影を確認し、容量の候補と機種の組み合わせをご提案します。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "太陽光パネル一覧", description: DESC }))} />
    </>
  );
}
