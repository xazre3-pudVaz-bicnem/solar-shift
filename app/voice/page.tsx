import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { publishedVoices } from "@/data/voices";
import { isHeldBack } from "@/lib/indexing";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/voice";
const DESC = "SOLAR SHIFTのお客様の声。実際に太陽光発電・蓄電池を導入されたお客様から掲載許可を得た声のみを掲載します。架空の口コミは掲載しません。";

export const metadata: Metadata = buildMetadata({
  title: "お客様の声",
  description: DESC,
  path: PATH,
  // 声が0件の間は検索結果に出さない
  noindex: isHeldBack(PATH),
});

export default function VoicePage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "お客様の声", href: PATH },
        ]}
        eyebrow="お客様の声"
        title="お客様の声"
        lead="実際に導入されたお客様から、掲載の許可をいただいた声のみを掲載します。架空の口コミや評価は掲載しません。"
        image={images.peopleFamily2}
      />
      <Container className="py-10 sm:py-14">
        {publishedVoices.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {publishedVoices.map((v) => (
              <article key={v.id} className="rounded-3xl bg-white p-6 shadow-card">
                <p className="text-[13px] font-bold text-accent-text">{v.area}・{v.displayName}</p>
                <p className="mt-1 text-[12px] text-ink-3">{v.equipment.join("・")}／{v.date}</p>
                <blockquote className="mt-4 text-base leading-[1.9] text-ink">{v.body}</blockquote>
                {v.workSlug && (
                  <p className="mt-3">
                    <Link href={`/works/${v.workSlug}`} className="text-[13px] font-bold text-navy-600 underline underline-offset-4">施工事例を見る</Link>
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border-[3px] border-dashed border-orange-200 bg-white px-5 py-6 sm:px-8 sm:py-8">
            <Image src={images.peopleCoupleTalk.src} alt="" width={images.peopleCoupleTalk.width} height={images.peopleCoupleTalk.height} sizes="176px" className="mb-4 h-auto w-36 sm:float-right sm:mb-2 sm:ml-6 sm:w-44" />
            <p className="text-[20px] leading-[1.45] font-black text-navy-900">お客様の声は準備中です</p>
            <p className="mt-3 max-w-3xl text-base leading-[1.9] text-ink-2">
              お客様ご本人の言葉をそのまま載せる「お客様の声」は、掲載の許可をいただいたものから掲載します。導入されたお客様の事例は、
              <Link href="/works" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">施工事例</Link>
              のページで紹介しています。
            </p>
            <Callout tone="note" title="掲載の基準" className="mt-6">
              <ul className="list-disc space-y-1 pl-5">
                <li>実際に SOLAR SHIFT で導入されたお客様の声であること</li>
                <li>ご本人から掲載の許可をいただいていること</li>
                <li>表示名は「葛飾区 K様」のように地域とイニシャルまでにとどめること</li>
                <li>金額や削減率など、本人確認できない数値は掲載しないこと</li>
                <li>構造化データ（Review・評価）は、掲載した声と一致する範囲でのみ出力すること</li>
              </ul>
            </Callout>
            <p className="mt-6 text-base text-ink-2">
              SOLAR SHIFT の考え方は<Link href="/reason" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">大切にしていること</Link>、進め方は<Link href="/flow" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4">導入までの流れ</Link>をご覧ください。
            </p>
          </div>
        )}
      </Container>
      <CtaSection title="最初の声を聞かせてくださる方を、お待ちしています。" body="新しいサービスだからこそ、1件ごとに丁寧に向き合います。現地調査・お見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "お客様の声", description: DESC }))} />
    </>
  );
}
