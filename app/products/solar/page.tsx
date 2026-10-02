import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { productsByCategory } from "@/data/products";
import { getSubsidy } from "@/data/subsidies";
import { sources as verified } from "@/data/sources";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { SourceList } from "@/components/ui/SourceList";
import { CompareGuide } from "@/components/product/CompareGuide";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

/**
 * 太陽光パネルの比べ方。仕様の数値の目安は書かない（製品によって異なるため）。
 * 個別の商品は、メーカーの公式資料で確認して登録したものだけが下に並ぶ。
 */
const PATH = "/products/solar";
const DESC =
  "太陽光パネル（太陽電池モジュール）を比べるときに見る項目をまとめました。公称最大出力、変換効率、サイズと形、認証、保証、設置方法。葛飾区・東京都の助成の対象になるモジュールの条件も確認できます。";

export const metadata: Metadata = buildMetadata({
  title: "太陽光パネルの比べ方｜出力・変換効率・認証・保証の見方",
  description: DESC,
  path: PATH,
  keywords: ["太陽光パネル 比較 見方", "太陽光パネル 出力 変換効率 見方"],
});

const H2 = "border-l-[5px] border-orange-500 pl-3 text-[24px] leading-[1.45] font-black text-navy-900";
const TEXT_LINK = "font-bold text-navy-700 underline underline-offset-4 hover:text-accent-text";

export default function ProductsSolarPage() {
  const products = productsByCategory("solar");
  const k = getSubsidy("katsushika-solar")!;
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "商品の選び方", href: "/products" },
          { name: "太陽光パネルの比べ方", href: PATH },
        ]}
        eyebrow="商品の選び方"
        title="太陽光パネルの比べ方"
        lead="太陽光パネルは、1枚あたりの出力・サイズ・認証・保証で比べます。屋根の形と面積に合うかどうかを、先に確かめます。"
        image={images.roofPanelsSky2}
      />
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints
            conclusion={`太陽光パネルは、カタログの数値だけでなく、「屋根に何枚載るか」と合わせて比べます。枚数と1枚あたりの出力で、システムの容量（kW）が決まります。葛飾区の助成（${k.amount}・${k.maxAmount}）は、この容量で計算します。対象になるのは、JETなどの認証を受けたモジュールです。`}
            points={["比べる項目は、出力・変換効率・サイズと形・認証・保証・設置方法の6つ", "仕様の数値と保証の年数は、メーカー・製品によって異なる", "屋根の向き・形・影は、現地で確かめる"]}
          />

          <section className="mt-12" aria-labelledby="compare-h">
            <h2 id="compare-h" className={H2}>
              比べるときに見る6つの項目
            </h2>
            <CompareGuide
              className="mt-6"
              items={[
                {
                  term: "公称最大出力",
                  what: "パネル1枚が発電できる電力の大きさです（単位はW）。枚数を掛けた合計が、システムの容量（kW）になります。",
                  check: "見積書に、型番・枚数・合計の容量が書かれているか。葛飾区の助成は、公称最大出力の合計が1kW以上のシステムが対象です。",
                },
                {
                  term: "変換効率",
                  what: "同じ面積で、どれだけ発電できるかを表します。屋根の面積が限られるときに、比べる意味が大きくなります。",
                  check: "数値は製品によって異なります。メーカーの仕様書で、同じ条件の数値どうしを比べます。",
                },
                {
                  term: "サイズと形",
                  what: "屋根に何枚載るかは、パネルの寸法と屋根の形で決まります。太陽光発電協会は、寄せ棟の屋根では、三角形や台形のモジュールがあると出力を多く取れると説明しています。",
                  check: "屋根の図面と、パネルの割付図（どこに何枚置くか）を見せてもらいます。割付図は、区の助成の申し込みにも必要です。",
                },
                {
                  term: "認証",
                  what: "葛飾区の助成は、JETの太陽電池モジュール認証、またはIECの認証制度に加盟する海外認証機関の認証を受けたモジュールが対象です。",
                  check: "型番が、認証の登録リストに載っているか。申し込みのときに、リストの該当部分を印刷して出します。",
                },
                {
                  term: "保証",
                  what: "メーカーの保証の内容・年数・条件は、メーカー・製品によって異なります。",
                  check: "保証書を見せてもらい、年数・条件・窓口を書面で確かめます。設置業者が独自の保証書を出すこともあります。",
                },
                {
                  term: "設置方法",
                  what: "屋根材の上に架台を取り付けて載せる「屋根置き型」と、屋根材の機能を持たせた「屋根建材型」があります。",
                  check: "自宅の屋根材に合う工法か。陸屋根の場合は、東京都の助成に架台・防水工事の追加の助成があります（条件あり）。",
                },
              ]}
            />
            <p className="mt-4 text-[15px] leading-[1.8] text-ink-2">
              屋根の条件は
              <Link href="/guide/roof-conditions" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                太陽光に向く屋根の条件
              </Link>
              、補助金の条件は
              <Link href="/subsidy/katsushika" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                葛飾区の補助金
              </Link>
              をご覧ください。
            </p>
          </section>

          <div className="cv-block mt-16">
            <ProductCatalog products={products} category="solar" headingId="makers-h" />
          </div>

          <SourceList sources={[verified.katsushikaGuide, verified.katsushikaSolarHandbook, verified.jpeaSetting, verified.jpeaAbout, verified.tokyoSolarHandbook]} className="mt-12" />
        </div>
      </Container>
      <CtaSection title="屋根に何枚載るかで、選ぶパネルは変わります。" body="現地調査で屋根の寸法・向き・影を確認し、容量の候補と機種の組み合わせをご提案します。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "太陽光パネルの比べ方", description: DESC }))} />
    </>
  );
}
