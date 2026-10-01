import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { faqs, faqCategoryLabel, type FaqCategory } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqSection } from "@/components/sections/FaqSection";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { CtaSection } from "@/components/sections/CtaSection";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, faqSchema, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/faq";
const DESC =
  "葛飾区の太陽光発電・蓄電池・補助金についてよくある質問。補助金はいくら？工事後に申請できる？区と都は併用できる？費用は？何年で元が取れる？蓄電池は何kWh？停電時は使える？など、SOLAR SHIFTが公式情報をもとに回答。";

export const metadata: Metadata = buildMetadata({
  title: "よくある質問｜葛飾区の太陽光・蓄電池・補助金",
  description: DESC,
  path: PATH,
  keywords: ["太陽光 よくある質問", "葛飾区 太陽光 補助金 質問", "蓄電池 質問", "太陽光 疑問"],
});

const ORDER: FaqCategory[] = ["subsidy", "cost", "solar", "battery", "v2h", "install", "service"];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "よくある質問", href: PATH },
        ]}
        eyebrow="よくある質問"
        title="太陽光・蓄電池・補助金について、よくいただく質問"
        lead="補助金・費用・設備・工事・サービスについて、確認できる事実の範囲でお答えします。制度に関する回答は公式情報の確認日を基準にしています。"
        image={images.peopleStaffPoint3}
      >
        <LastUpdated updatedAt={siteConfig.subsidyInfoDate} verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <nav aria-label="カテゴリ" className="flex flex-wrap gap-2">
          {ORDER.map((c) => (
            <a key={c} href={`#${c}`} className="border border-line bg-white px-3 py-1.5 text-[13px] font-bold text-navy-900 hover:border-navy-900">
              {faqCategoryLabel[c]}
            </a>
          ))}
        </nav>
        <div className="mt-10 space-y-14">
          {ORDER.map((c) => {
            const items = faqs.filter((f) => f.category === c);
            if (items.length === 0) return null;
            return (
              <section key={c} id={c} aria-labelledby={`${c}-h`} className="scroll-mt-24">
                <h2 id={`${c}-h`} className="text-[22px] font-bold text-navy-900 sm:text-[26px]">{faqCategoryLabel[c]}</h2>
                <FaqSection items={items} className="mt-5" />
              </section>
            );
          })}
        </div>
        <SubsidyDisclaimer className="mt-14" />
      </Container>
      <CtaSection title="ここにない疑問は、直接お聞かせください。" body="住まいの条件によって答えが変わる質問は、現地調査のうえでお答えします。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "よくある質問", description: DESC, dateModified: siteConfig.subsidyInfoDate }), faqSchema(faqs.map((f) => ({ q: f.q, a: f.a }))))} />
    </>
  );
}
