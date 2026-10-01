import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { faqsByIds } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Callout } from "@/components/ui/Callout";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/reason";
const DESC =
  "SOLAR SHIFTが大切にしていること。補助金を一次情報で分かりやすく案内する、住宅ごとに必要な設備を検討する、太陽光から蓄電池・V2Hまで総合的に考える、葛飾区を中心とした地域密着、導入前から導入後まで同じ窓口。株式会社サイプレス運営。";

export const metadata: Metadata = buildMetadata({
  title: "SOLAR SHIFTが選ばれる理由・大切にしていること",
  description: DESC,
  path: PATH,
  keywords: ["葛飾区 太陽光 業者", "太陽光 業者 選び方", "SOLAR SHIFT 特徴"],
});

const REASON_ICONS = [images.iconHouseYen, images.iconHouseSolar, images.iconHouseBattery, images.iconPanelLeaf, images.iconPanelWrench, images.iconHandPanel];

const REASONS = [
  {
    n: "01",
    title: "補助金を、一次情報で分かりやすく案内します",
    body: "葛飾区・東京都・国の制度は、金額も条件も申請の順番も違います。SOLAR SHIFT は各制度の公式情報を確認し、確認日を明記したうえで、金額・上限・申請時期・注意点を整理してお伝えします。確認できていない併用を前提にした「お得な合計額」や、「必ずもらえる」という説明はしません。",
    link: { href: "/subsidy", label: "補助金の総合ページ" },
  },
  {
    n: "02",
    title: "住宅ごとに、必要な設備を検討します",
    body: "屋根の形・向き・築年数、家族の電気の使い方、停電時にどこまで備えたいか。それによって太陽光だけで十分な家もあれば、蓄電池やV2Hまで検討したほうがよい家もあります。先に売る設備を決めるのではなく、住まいから逆算して提案します。入れる意味が薄い設備は、そうお伝えします。",
    link: { href: "/flow", label: "導入までの流れ" },
  },
  {
    n: "03",
    title: "太陽光だけでなく、蓄電池・V2H・HEMSまで総合的に",
    body: "太陽光・蓄電池・V2H・HEMS・関連する省エネ設備を、ひとつの計画として検討します。後から追加すると工事も申請も二度手間になりがちです。将来の後付けも含めて、はじめに全体像を描いてから、今やることを決めます。",
    link: { href: "/solar-battery", label: "太陽光＋蓄電池について" },
  },
  {
    n: "04",
    title: "葛飾区を中心とした地域密着",
    body: "SOLAR SHIFT の拠点は葛飾区白鳥です。隣家との距離が近い住宅地の影の影響、海抜ゼロメートル地帯の水害リスクと機器の設置場所など、区内の住宅事情を踏まえた提案を行います。足立区・江戸川区・墨田区など周辺エリアにも対応します。",
    link: { href: "/area/katsushika", label: "葛飾区の太陽光発電" },
  },
  {
    n: "05",
    title: "導入前から導入後まで、相談しやすい体制",
    body: "最初の相談、現地調査、見積もり、補助金の申請、工事、完了報告、運転開始後の不具合まで、同じ窓口でご相談いただけます。訪問販売や電話営業はしていません。お問い合わせをいただいた方にだけご連絡します。",
    link: { href: "/contact", label: "お問い合わせ" },
  },
  {
    n: "06",
    title: "株式会社サイプレスが運営しています",
    body: "SOLAR SHIFT は、東京都葛飾区白鳥に本社を置く株式会社サイプレス（代表取締役 織田春樹）の太陽光発電・蓄電池事業です。運営会社・所在地・代表者を明記し、記事や補助金情報の編集方針も公開しています。",
    link: { href: "/company", label: "運営会社" },
  },
] as const;

export default function ReasonPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "選ばれる理由", href: PATH },
        ]}
        eyebrow="SOLAR SHIFT が大切にしていること"
        title="売るための提案ではなく、住まいのための計画を。"
        lead="SOLAR SHIFT は2026年に始まった新しいサービスです。施工件数や創業年数で語ることはまだできません。その代わり、何を大切にして、どう進めるかを、ここに書きます。"
        image={images.peopleCoupleHappy}
      />
      <Container className="py-10 sm:py-14">
        <KeyPoints
          title="SOLAR SHIFT の約束"
          conclusion="補助金は一次情報で確認して確認日を明記する。住宅ごとに必要な設備を検討し、意味の薄い設備は勧めない。太陽光・蓄電池・V2H・HEMSを総合的に計画する。葛飾区を中心に地域の住宅事情を踏まえる。導入前から導入後まで同じ窓口で対応する。株式会社サイプレスが運営する。この6つです。"
          points={[
            "「必ずもらえる」「絶対に得」とは言わない",
            "架空の施工事例・口コミ・削減率は掲載しない",
            "確認できていない併用を前提にした合計額は出さない",
            "訪問販売・電話営業はしない",
          ]}
        />

        <Callout tone="note" title="実績について、正直にお伝えします" className="mt-10">
          SOLAR SHIFT は新規事業のため、現時点で公開できる施工事例やお客様の声はありません。「創業○年」「施工○件」「地域No.1」「メーカー認定」といった表現は、事実として確認できるまで使いません。施工事例とお客様の声は、掲載許可をいただいたものから順次公開します。
        </Callout>

        <div className="mt-14 space-y-14">
          {REASONS.map((r, i) => (
            <section key={r.n} aria-labelledby={`r-${r.n}`} className={`grid items-center gap-8 lg:gap-14 ${i % 2 === 1 ? "lg:grid-cols-[1fr_18rem] lg:[&>*:first-child]:order-2" : "lg:grid-cols-[18rem_1fr]"}`}>
              <ImagePlaceholder src={REASON_ICONS[i].src} alt="" ratio="1/1" fit="contain" frame={false} sizes="288px" className="mx-auto w-48 lg:w-full" />
              <div>
                <p className="font-en text-[13px] font-bold tracking-[0.2em] text-orange-500">{r.n}</p>
                <h2 id={`r-${r.n}`} className="mt-2 text-[22px] leading-[1.45] font-bold text-navy-900 sm:text-[26px]">{r.title}</h2>
                <p className="mt-4 text-[15px] leading-[1.95] text-ink">{r.body}</p>
                <p className="mt-5">
                  <Link href={r.link.href} className="text-[14px] font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                    {r.link.label} →
                  </Link>
                </p>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-16" aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-[24px] font-bold text-navy-900">よくある質問</h2>
          <FaqSection items={faqsByIds(["service-company", "service-sales", "subsidy-guarantee", "install-survey"])} withSchema className="mt-6" />
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <LinkButton href="/flow" variant="secondary">導入までの流れを見る <ArrowIcon /></LinkButton>
          <LinkButton href="/editorial-policy" variant="ghost">記事・補助金情報の編集方針 <ArrowIcon /></LinkButton>
        </div>
      </Container>
      <CtaSection
        title="まず、わが家で何ができるかを一緒に整理しませんか。"
        body={`現地調査・お見積もりは無料です。${siteConfig.primaryArea.name}を中心に、周辺エリアにも対応しています。訪問販売や電話営業はしていません。`}
      />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "SOLAR SHIFTが選ばれる理由", description: DESC }))} />
    </>
  );
}
