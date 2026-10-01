import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { publishedWorks } from "@/data/works";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorksCard } from "@/components/works/WorksCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/works";
const DESC = "SOLAR SHIFTの施工事例一覧。葛飾区を中心とした太陽光発電・蓄電池・V2Hの施工事例を、地域・住宅タイプ・屋根形状・容量・活用した補助金とともに掲載します（お客様の掲載許可を得たもののみ）。";

export const metadata: Metadata = buildMetadata({
  title: "施工事例｜葛飾区の太陽光発電・蓄電池",
  description: DESC,
  path: PATH,
  keywords: ["葛飾区 太陽光 施工事例", "太陽光 施工", "蓄電池 施工事例"],
  // 事例が0件の間は検索結果に出さない（薄いページを index させない）
  noindex: publishedWorks.length === 0,
});

const FIELDS = ["地域（市区）", "住宅タイプ", "屋根形状", "太陽光容量（kW）", "蓄電池容量（kWh）", "V2H・HEMSの有無", "メーカー・商品", "活用した補助金", "施工前の状況", "施工後の状況", "導入理由", "お客様の声（掲載許可のあるもの）", "施工日", "施工写真"];

export default function WorksPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "施工事例", href: PATH },
        ]}
        eyebrow="施工事例"
        title="施工事例"
        lead="実際に施工し、お客様の掲載許可をいただいた事例のみを掲載します。架空の事例・架空の削減率・架空の写真は掲載しません。"
        image={images.peopleFamily}
      />
      <Container className="py-10 sm:py-14">
        {publishedWorks.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publishedWorks.map((w) => (
              <WorksCard key={w.slug} work={w} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border-[3px] border-dashed border-orange-200 bg-white p-8 sm:p-10">
            <p className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">施工事例は順次掲載予定です</p>
            <p className="mt-3 max-w-3xl text-[15px] leading-[1.9] text-ink-2">
              SOLAR SHIFT は2026年に始まった新しいサービスのため、現時点で公開できる施工事例はありません。施工が完了し、お客様の掲載許可をいただいた事例から、次の項目とともにご紹介していきます。
            </p>
            <ul className="mt-5 grid gap-x-6 gap-y-1.5 text-[14px] text-ink sm:grid-cols-2">
              {FIELDS.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-[5px] w-[5px] bg-orange-500" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px] text-ink-2">
              導入をご検討中の方は、<Link href="/flow" className="mx-1 text-navy-600 underline underline-offset-4">導入までの流れ</Link>と<Link href="/reason" className="mx-1 text-navy-600 underline underline-offset-4">SOLAR SHIFT が大切にすること</Link>をご覧ください。
            </p>
          </div>
        )}
      </Container>
      <CtaSection title="最初の事例を、あなたの家から。" body="新しいサービスだからこそ、1件ごとに丁寧に向き合います。現地調査・お見積もりは無料です。掲載の可否はお客様のご意向を最優先します。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "施工事例", description: DESC }))} />
    </>
  );
}
