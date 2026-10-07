import { getPostsForPillar } from "@/lib/blog";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
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
import { routeUpdatedAt } from "@/lib/routes";

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
  const posts = getPostsForPillar(["katsushika-subsidy", "battery", "solar"], 3, { path: PATH });
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "よくある質問", href: PATH },
        ]}
        eyebrow="よくある質問"
        title={<>よくある質問<span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">太陽光・蓄電池・補助金について</span></>}
        lead="補助金・費用・設備・工事・サービスについて、確認できる事実の範囲でお答えします。制度に関する回答は公式情報の確認日を基準にしています。"
        image={images.peopleStaffPoint3}
      >
        <LastUpdated updatedAt={routeUpdatedAt(PATH)} verifiedAt={siteConfig.subsidyInfoDate} className="mt-5" />
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <nav aria-label="カテゴリ" className="flex flex-wrap gap-2">
          {ORDER.map((c) => (
            <a key={c} href={`#${c}`} className="inline-flex rounded-full border border-line bg-white px-4 py-1.5 text-[13px] font-bold text-navy-900 hover:border-orange-400 hover:bg-cream items-center min-h-11">
              {faqCategoryLabel[c]}
            </a>
          ))}
        </nav>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-green-50 px-4 py-3 text-[14px] leading-[1.7] text-ink">
          <span>探している質問が見つからないときは、チャットでも質問できます（自動応答）。</span>
          <OpenChatButton className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-green-600 px-4 text-[13px] font-bold text-white hover:bg-green-700 min-h-11">
            チャットで質問する
          </OpenChatButton>
        </p>
        <div className="mt-10 space-y-14">
          {ORDER.map((c) => {
            const items = faqs.filter((f) => f.category === c);
            if (items.length === 0) return null;
            return (
              <section key={c} id={c} aria-labelledby={`${c}-h`} className="cv-block scroll-mt-24">
                <h2 id={`${c}-h`} className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900 sm:text-[26px]">{faqCategoryLabel[c]}</h2>
                <FaqSection items={items} className="mt-5" moreLink={false} />
              </section>
            );
          })}
        </div>
        <SubsidyDisclaimer className="mt-14" />
      </Container>
      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="くわしく書いた記事" />
        </Container>
      )}

      <CtaSection title="ここにない疑問は、直接お聞かせください。" body="住まいの条件によって答えが変わる質問は、現地調査のうえでお答えします。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "よくある質問", description: DESC, dateModified: routeUpdatedAt(PATH) }), faqSchema(faqs.map((f) => ({ q: f.q, a: f.a }))))} />
    </>
  );
}
