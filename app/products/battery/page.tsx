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
 * 家庭用蓄電池の比べ方。仕様の数値の目安は書かない（製品によって異なるため）。
 * 個別の商品は、メーカーの公式資料で確認して登録したものだけが下に並ぶ。
 */
const PATH = "/products/battery";
const DESC =
  "家庭用蓄電池を比べるときに見る項目をまとめました。蓄電容量、定格出力、停電時に使える範囲、パワーコンディショナの方式、設置場所、SIIの登録、保証。葛飾区・東京都の助成の対象になる機器の条件も確認できます。";

export const metadata: Metadata = buildMetadata({
  title: "家庭用蓄電池を比較するときの見方｜容量・出力・SII登録・保証",
  description: DESC,
  path: PATH,
  keywords: ["蓄電池 比較 見方", "蓄電池 容量 出力 見方"],
});

const H2 = "border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900";
const TEXT_LINK = "font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text";

export default function ProductsBatteryPage() {
  const products = productsByCategory("battery");
  const tb = getSubsidy("tokyo-battery")!;
  const kb = getSubsidy("katsushika-battery")!;
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "商品の選び方", href: "/products" },
          { name: "家庭用蓄電池の比べ方", href: PATH },
        ]}
        eyebrow="商品の選び方"
        title="家庭用蓄電池の比べ方"
        lead="蓄電池は、ためられる量（容量）と、一度に使える量（出力）、停電のときに使える範囲で比べます。補助金の対象になる機器かどうかも、型番で確かめます。"
        image={images.batteryIndoor}
      />
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints
            conclusion={`蓄電池は、夜に使う電気の量と、停電のときに守りたいものから選びます。東京都の助成は${tb.amount.split("（")[0]}、葛飾区の助成は${kb.amount}（${kb.maxAmount}）で、どちらも、SIIに登録された機器が対象です。容量や保証の年数は、製品によって異なります。`}
            points={["比べる項目は、容量・出力・停電時に使える範囲・方式・設置場所・SIIの登録・保証の7つ", "区と都の助成を使うなら、型番でSIIの登録を確かめてから機種を決める", "置き場所は、浸水の想定とメーカーの設置基準の両方を確かめる"]}
          />

          <section className="mt-12" aria-labelledby="compare-h">
            <h2 id="compare-h" className={H2}>
              比べるときに見る7つの項目
            </h2>
            <CompareGuide
              className="mt-6"
              items={[
                {
                  term: "蓄電容量",
                  what: "ためておける電気の量です（単位はkWh）。夜に使う電気の量と、太陽光で昼に余る電気の量から考えます。",
                  check: `東京都の助成は、容量に応じて決まります（${tb.amount.split("（")[0]}）。見積書に、型番と容量が書かれているかを確かめます。`,
                },
                {
                  term: "定格出力",
                  what: "一度に取り出せる電力の大きさです（単位はkW）。同時に動かしたい機器が多いほど、大きな出力が必要になります。",
                  check: "停電のときに動かしたい機器を書き出し、その機種で足りるかを確かめます。数値は製品によって異なります。",
                },
                {
                  term: "停電時に使える範囲",
                  what: "家全体に電気を送る「全負荷型」と、あらかじめ決めた回路だけに送る「特定負荷型」があります。",
                  check: "停電のときに、どの部屋・どの機器を使いたいか。200Vの機器（エアコンなど）を使いたい場合は、対応しているかを確かめます。",
                },
                {
                  term: "パワーコンディショナの方式",
                  what: "太陽光と蓄電池を1台で制御する「ハイブリッド型」と、蓄電池専用の機器を追加する「単機能型」があります。",
                  check: "太陽光と同時に入れるのか、あとから足すのか。あとから足す場合は、いまあるパワーコンディショナとの対応を、メーカーの対応表で確かめます。",
                },
                {
                  term: "設置場所",
                  what: "屋外に置く機種と、屋内に置く機種があります。置ける場所の条件は、メーカー・機種によって異なります。",
                  check: "葛飾区は、区の半分近くが海抜ゼロメートル地帯です。水害ハザードマップで浸水の想定を確かめ、置く高さと場所を決めます。",
                },
                {
                  term: "SIIの登録",
                  what: "葛飾区の助成は、国のZEH支援事業でSIIに登録された蓄電池が対象です。東京都の助成も、2026年10月1日以降の事前申込から、SIIが登録している機器に限られます。",
                  check: "型番が、SIIの登録済製品の一覧に載っているか。区の申し込みでは、一覧の該当部分を印刷して出します。",
                },
                {
                  term: "保証",
                  what: "メーカーの保証の年数と条件は、製品によって異なります。SIIの登録基準では、メーカー保証年数とサイクル試験による性能年数が、どちらも10年以上であることが求められています。",
                  check: "保証書を見せてもらい、年数・条件・窓口を書面で確かめます。メーカーの無償保証と、販売店による保証は分けて確かめます。",
                },
              ]}
            />
            <p className="mt-4 text-base leading-[1.8] text-ink-2">
              種類の違いは
              <Link href="/guide/battery-how-to-choose" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                全負荷型と特定負荷型の違い
              </Link>
              、選び方の全体は
              <Link href="/battery" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                家庭用蓄電池の選び方
              </Link>
              をご覧ください。
            </p>
          </section>

          <div className="cv-block mt-16">
            <ProductCatalog products={products} category="battery" headingId="makers-h" />
          </div>

          <SourceList sources={[verified.katsushikaGuide, verified.katsushikaBatteryHandbook, verified.tokyoBatteryPage, verified.siiBatteryRegistration, verified.jpeaAbout]} className="mt-12" />
        </div>
      </Container>
      <CtaSection title="容量は「夜に使う量」から。機種は、SIIの登録の確認から。" body="電気の使い方と、停電のときに守りたいものを伺い、容量・方式・設置場所に合う機種をご提案します。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "家庭用蓄電池の比べ方", description: DESC }))} />
    </>
  );
}
