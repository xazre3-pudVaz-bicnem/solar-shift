import { reveal } from "@/lib/reveal";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { publishedWorks, WORK_BILL_NOTE } from "@/data/works";
import { isHeldBack } from "@/lib/indexing";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { WorksCard } from "@/components/works/WorksCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema, itemListSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/works";
const DESC =
  "SOLAR SHIFTの施工事例。葛飾区を中心に、太陽光発電・蓄電池を導入されたお客様の事例を、ご家族の構成・導入した設備・導入前後の電気代とともに紹介します。掲載の許可をいただいた事例だけを掲載しています。";

export const metadata: Metadata = buildMetadata({
  title: "施工事例｜葛飾区の太陽光発電・蓄電池",
  description: DESC,
  path: PATH,
  keywords: ["葛飾区 太陽光 施工事例", "太陽光 施工", "蓄電池 施工事例"],
  // 事例が0件の間は検索結果に出さない（薄いページを index させない）
  noindex: isHeldBack(PATH),
});

const FIELDS = ["地域（市区）", "住宅タイプ・築年数", "屋根形状", "太陽光パネルの容量（kW）", "蓄電池の容量（kWh）", "V2H・HEMSの有無", "メーカー", "活用した補助金", "施工前・施工後の状況と写真", "工事期間", "設置した理由", "お客様の声（掲載の許可をいただいたもの）"];

export default function WorksPage() {
  const has = publishedWorks.length > 0;
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "施工事例", href: PATH },
        ]}
        eyebrow="施工事例"
        title={
          <>
            施工事例
            <span className="mt-2 block text-[0.6em] leading-[1.6] text-ink-2">葛飾区を中心とした、太陽光発電・蓄電池の導入事例</span>
          </>
        }
        lead={
          has
            ? "実際に導入されたお客様の事例を、掲載の許可をいただいた範囲で紹介します。お名前はイニシャル、地域は市区までの掲載です。架空の事例や、架空の写真は掲載しません。"
            : "実際に施工し、お客様の掲載許可をいただいた事例のみを掲載します。架空の事例・架空の削減率・架空の写真は掲載しません。"
        }
        image={images.peopleFamily}
      />
      <Container className="py-10 sm:py-14">
        {has ? (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {publishedWorks.map((w, i) => (
                <li key={w.slug} {...reveal((i % 3) * 90)}>
                  <WorksCard work={w} level={2} />
                </li>
              ))}
            </ul>
            <Callout tone="note" title="事例の見方" className="mt-10">
              <ul className="list-disc space-y-1 pl-5">
                <li>{WORK_BILL_NOTE}</li>
                <li>設備の容量・機種は、屋根の形、電気の使い方、ご予算によって変わります。同じ構成が、すべての住まいに合うわけではありません。</li>
                <li>お客様の写真は、掲載の許可をいただいた場合だけ掲載します。</li>
              </ul>
            </Callout>
            <p className="mt-8 text-base leading-[1.9] text-ink-2">
              ご自宅の条件での想定助成額は
              <Link href="/simulation" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
                補助金シミュレーター
              </Link>
              で試算できます。相談から工事までの順番は
              <Link href="/flow" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">
                導入・施工の流れ
              </Link>
              にまとめています。
            </p>
          </>
        ) : (
          <div className="rounded-[2rem] border-[3px] border-dashed border-orange-200 bg-white px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-[20px] leading-[1.45] font-black text-navy-900">施工事例は順次掲載予定です</p>
            <p className="mt-3 max-w-3xl text-base leading-[1.9] text-ink-2">
              施工が完了し、お客様の掲載許可をいただいた事例から、次の項目とともにご紹介していきます。
            </p>
            <ul className="mt-5 grid gap-x-6 gap-y-1.5 text-[14px] text-ink sm:grid-cols-2">
              {FIELDS.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
      <CtaSection title="ご自宅の条件で、設備と補助金を整理します。" body="屋根の形と電気の使い方を伺い、容量の候補と、葛飾区・東京都それぞれの想定助成額を整理してお伝えします。現地調査・お見積もりは無料です。" />
      <JsonLd
        data={graph(
          webPageSchema({ path: PATH, name: "施工事例", description: DESC, type: "CollectionPage" }),
          ...(has ? [itemListSchema({ name: "施工事例", items: publishedWorks.map((w) => ({ name: `${w.label}：${w.title}`, path: `/works/${w.slug}` })) })] : []),
        )}
      />
    </>
  );
}
