import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { publishedProducts } from "@/data/products";
import { sources as verified } from "@/data/sources";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { ArrowIcon } from "@/components/ui/Button";
import { SourceList } from "@/components/ui/SourceList";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

/**
 * 商品の入口。役割は「太陽光パネル・蓄電池を、どんな項目で比べればよいか」の案内。
 * 個別の商品は、メーカーの公式資料で仕様を確認できたものだけを載せる（未確認の商品・メーカー名は出さない）。
 */
const PATH = "/products";
const DESC =
  "太陽光パネル・家庭用蓄電池を選ぶ前に、どの項目を比べればよいかをまとめました。出力・容量・認証・保証の見方と、葛飾区・東京都の助成の対象になる機器の条件。個別の商品は、メーカーの公式資料で仕様を確認できたものから掲載します。";

export const metadata: Metadata = buildMetadata({
  title: "太陽光パネル・蓄電池の選び方｜比べるときに見る項目",
  description: DESC,
  path: PATH,
  keywords: ["太陽光パネル 蓄電池 メーカー 比較", "太陽光 メーカー 選び方"],
});

const GUIDES = [
  { href: "/products/solar", title: "太陽光パネルの比べ方", body: "公称最大出力・変換効率・サイズ・認証・保証の見方。屋根の形との合わせ方。" },
  { href: "/products/battery", title: "家庭用蓄電池の比べ方", body: "蓄電容量・定格出力・停電時に使える範囲・設置場所・SIIの登録の見方。" },
  { href: "/guide/battery-how-to-choose", title: "全負荷型と特定負荷型の違い", body: "停電時に使える範囲と、ハイブリッド型・単機能型の選び分け。" },
  { href: "/guide/roof-conditions", title: "太陽光に向く屋根の条件", body: "向き・勾配・材質・築年数。載せる前に確かめること。" },
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "商品の選び方", href: PATH },
        ]}
        eyebrow="商品の選び方"
        title="太陽光パネル・蓄電池の選び方"
        lead="機種を決める前に、何を比べればよいかを知っておくと、見積もりが読みやすくなります。ここでは、比べるときに見る項目と、補助金の対象になる機器の条件をまとめています。"
        image={images.panelBatteryProducts}
      />
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints
            title="このページの結論"
            conclusion="機種は、屋根と電気の使い方を見てから決めます。比べる項目は、太陽光パネルなら出力・サイズ・認証・保証、蓄電池なら容量・出力・停電時に使える範囲・設置場所です。葛飾区と東京都の助成には、対象になる機器の条件があるため、型番で確かめてから選びます。"
            points={[
              "葛飾区の太陽光の助成は、JETなどの認証を受けたモジュールが対象",
              "蓄電池は、区・都ともに、SIIに登録された機器が対象（都は2026年10月1日以降の事前申込から）",
              "保証の年数や仕様の数値は、メーカー・製品によって異なる。カタログと保証書で確かめる",
            ]}
          />

          <section className="mt-12" aria-labelledby="guides-h">
            <h2 id="guides-h" className="border-l-[5px] border-orange-500 pl-3 text-[24px] leading-[1.45] font-black text-navy-900">
              比べ方のガイド
            </h2>
            <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {GUIDES.map((c) => (
                <li key={c.href} className="bg-white">
                  <Link href={c.href} className="group flex h-full items-center gap-4 px-5 py-5 hover:bg-paper-2">
                    <span className="flex-1">
                      <span className="block text-[18px] leading-[1.5] font-black text-navy-900">{c.title}</span>
                      <span className="mt-1 block text-base leading-[1.8] text-ink-2">{c.body}</span>
                    </span>
                    <ArrowIcon className="h-4 w-4 shrink-0 text-accent-text" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="cv-block mt-14" aria-labelledby="items-h">
            <h2 id="items-h" className="border-l-[5px] border-orange-500 pl-3 text-[24px] leading-[1.45] font-black text-navy-900">
              取扱商品
            </h2>
            <div className="mt-6">
              <ProductCatalog products={publishedProducts} showComparison={false} />
            </div>
          </section>

          <SourceList sources={[verified.katsushikaGuide, verified.tokyoBatteryPage, verified.jpeaSetting]} className="mt-12" />
        </div>
      </Container>
      <CtaSection
        title="機種選びは、屋根と電気の使い方を見てから。"
        body="カタログの数字だけでは決められない部分を、現地調査で確認してからご提案します。補助金の対象になる機器かどうかも、型番で確かめてお伝えします。"
      />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "太陽光パネル・蓄電池の選び方", description: DESC, type: "CollectionPage" }))} />
    </>
  );
}
