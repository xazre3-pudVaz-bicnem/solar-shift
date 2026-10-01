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

const PATH = "/products/battery";
const DESC =
  "家庭用蓄電池の取扱商品一覧。蓄電容量・定格出力・全負荷/特定負荷・設置場所・保証の見方と、東京都の助成（10万円/kWh・SII登録機器）を踏まえた選び方。メーカー公式情報で確認した仕様のみ掲載。";

export const metadata: Metadata = buildMetadata({
  title: "蓄電池一覧｜容量・出力・全負荷/特定負荷の見方",
  description: DESC,
  path: PATH,
  keywords: ["蓄電池 一覧", "家庭用蓄電池 比較", "蓄電池 全負荷", "蓄電池 SII 登録", "葛飾区 蓄電池"],
});

export default function ProductsBatteryPage() {
  const products = productsByCategory("battery");
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "取扱商品", href: "/products" },
          { name: "蓄電池一覧", href: PATH },
        ]}
        eyebrow="取扱商品"
        title="家庭用蓄電池一覧"
        lead="住宅用の蓄電システムです。蓄電容量・定格出力・停電時に使える範囲（全負荷／特定負荷）・設置場所・保証で比較します。東京都の助成を使う場合はSII登録機器かどうかの確認が必要です。"
        image={images.batteryIndoor}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          title="蓄電池を比べるときの5つの軸"
          conclusion="蓄電池は「蓄電容量（kWh）」「定格出力（kW）」「全負荷か特定負荷か」「ハイブリッド型か単機能型か」「設置場所と保証」で比較します。東京都の助成は10万円/kWh（DR不参加は原則上限120万円/戸）で、2026年10月1日以降の事前申込はSII登録機器に限られるため、機種選定の段階で登録状況を確認します。"
          points={[
            "蓄電容量（kWh）：夜間の使用量と停電時の備えから決める",
            "定格出力（kW）：同時に使える機器の量。エアコン・IHを停電時に使うなら要確認",
            "全負荷／特定負荷：停電時に家全体か、決めた回路だけか",
            "ハイブリッド／単機能：太陽光と同時導入か、後付けか",
            "設置場所・保証：屋内外、動作温度、容量保証の年数",
          ]}
        />
        <div className="mt-12">
          <ProductCatalog products={products} category="battery" />
        </div>
        <p className="mt-10 text-[14px] text-ink-2">
          選び方の考え方は<Link href="/recommend/battery" className="mx-1 text-navy-600 underline underline-offset-4">おすすめ蓄電池</Link>・<Link href="/guide/battery-how-to-choose" className="mx-1 text-navy-600 underline underline-offset-4">蓄電池の選び方</Link>をご覧ください。
        </p>
      </Container>
      <CtaSection title="容量は「夜に使う量」から。機種はSII登録の確認から。" body="電気の使い方と停電時に守りたいものを伺い、容量・負荷タイプ・設置場所に合う機種をご提案します。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "家庭用蓄電池一覧", description: DESC }))} />
    </>
  );
}
