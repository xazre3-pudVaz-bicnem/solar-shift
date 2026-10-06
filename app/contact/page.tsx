import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig, contactEmail, addressWithPostal } from "@/lib/site";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
import { PhoneIcon } from "@/components/ui/PhoneIcon";
import { faqsByIds } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/sections/ContactForm";
import { Steps } from "@/components/ui/Steps";
import { FaqSection } from "@/components/sections/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/contact";
const DESC = `SOLAR SHIFTへのお問い合わせ・無料相談。葛飾区の太陽光発電・蓄電池・V2H・補助金のご相談、現地調査・お見積もりの依頼を、フォーム・メール${siteConfig.contact.telDisplay ? `・お電話（${siteConfig.contact.telDisplay}）` : ""}で受け付けています。補助金のことだけのご相談もお受けしています。`;

export const metadata: Metadata = buildMetadata({
  title: "お問い合わせ・無料相談｜葛飾区の太陽光・蓄電池・補助金",
  description: DESC,
  path: PATH,
  keywords: ["葛飾区 太陽光 相談", "太陽光 見積もり 葛飾区", "蓄電池 相談"],
});

const BOX = "rounded-3xl bg-white p-5 shadow-card sm:p-6";
const H2 = "border-l-[6px] border-green-500 pl-3 text-[18px] leading-[1.4] font-black text-navy-900";
const TEXT_LINK = "inline-flex min-h-11 items-center font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text";

export default function ContactPage() {
  const email = contactEmail();
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "お問い合わせ", href: PATH },
        ]}
        eyebrow="お問い合わせ・無料相談"
        title="お問い合わせ・無料相談"
        lead="現地調査・お見積もりは無料です。「補助金について聞きたい」「わが家が対象か知りたい」だけでも構いません。お問い合わせいただいた内容に応じて、ご案内します。"
        image={images.peopleCoupleTalk}
      />
      <Container className="py-10 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <h2 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">お問い合わせフォーム</h2>
            <p className="mt-2 text-[14px] text-ink-2">{siteConfig.contact.formNote}</p>
            <div className="mt-6">
              <ContactForm fallbackEmail={email} tel={siteConfig.contact.tel} telDisplay={siteConfig.contact.telDisplay} />
            </div>
          </div>
          <aside className="space-y-6">
            <div className={BOX}>
              <h2 className={H2}>{siteConfig.contact.telDisplay ? "お電話・メールでのお問い合わせ" : "メールでのお問い合わせ"}</h2>
              {siteConfig.contact.telDisplay && (
                <a href={`tel:${siteConfig.contact.tel}`} className="mt-4 flex min-h-14 items-center gap-3 rounded-full border-2 border-navy-900 bg-white px-5 py-2 text-navy-900 transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-cream">
                  <PhoneIcon className="h-5 w-5 shrink-0 text-orange-600" />
                  <span className="min-w-0 leading-none">
                    <span className="block text-[12px] font-bold text-ink-2">
                      お電話でのご相談
                      {siteConfig.contact.hours && <span className="ml-1 font-normal">（営業時間 {siteConfig.contact.hours}{siteConfig.contact.businessDays ? `・${siteConfig.contact.businessDays}` : ""}）</span>}
                    </span>
                    <span className="mt-1.5 block font-en text-[20px] font-extrabold tracking-[0.02em] min-[400px]:text-[24px]">{siteConfig.contact.telDisplay}</span>
                  </span>
                </a>
              )}
              {email && (
                <p className="mt-3">
                  {siteConfig.contact.telDisplay && <span className="mr-1 text-ink-2">メール：</span>}
                  <a href={`mailto:${email}?subject=${encodeURIComponent("【SOLAR SHIFT】お問い合わせ")}`} className="inline-block py-0.5 font-bold break-all text-navy-600 underline underline-offset-4">{email}</a>
                </p>
              )}
              {siteConfig.contact.lineUrl && (
                <p className="mt-1">
                  <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
                    LINEで相談する
                  </a>
                </p>
              )}
              <p className="mt-3 border-t border-line pt-3 text-base leading-[1.8] text-ink-2">
                運営：{siteConfig.company.name}
                <br />
                {addressWithPostal()}
              </p>
            </div>

            <div className={BOX}>
              <h2 className={H2}>お問い合わせ後の流れ</h2>
              <div className="mt-5">
                <Steps
                  steps={[
                    { title: "担当者からご連絡", body: "内容を確認のうえ、担当者よりご連絡します。" },
                    { title: "ヒアリング", body: "屋根の形状・築年数・電気の使い方・ご希望の設備を伺います。" },
                    { title: "現地調査（無料）", body: "ご都合のよい日程で、屋根・分電盤・設置場所を確認します。" },
                    { title: "ご提案・お見積もり", body: "内訳を分けた見積もりと、制度ごとの想定助成額をお渡しします。" },
                  ]}
                />
              </div>
            </div>

            <div className={BOX}>
              <h2 className={H2}>まず補助金だけ確認したい方へ</h2>
              <p className="mt-2 text-base leading-[1.8] text-ink-2">容量を選ぶと、葛飾区と東京都の想定助成額を試算できます。よくある質問には、チャット（自動応答）でもお答えします。</p>
              <ul className="mt-2">
                <li>
                  <Link href="/simulation" className={TEXT_LINK}>
                    補助金シミュレーター →
                  </Link>
                </li>
                <li>
                  <Link href="/subsidy/katsushika" className={TEXT_LINK}>
                    葛飾区の補助金 →
                  </Link>
                </li>
                <li>
                  <Link href="/flow" className={TEXT_LINK}>
                    導入までの流れ →
                  </Link>
                </li>
              </ul>
              <OpenChatButton className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-green-600 bg-white px-5 py-1.5 text-[15px] font-bold text-green-700 hover:bg-green-50">
                チャットで質問する
              </OpenChatButton>
            </div>
          </aside>
        </div>

        <section className="cv-block mt-16 max-w-4xl" aria-labelledby="faq-h">
          <h2 id="faq-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">
            お問い合わせについてよくある質問
          </h2>
          <FaqSection items={faqsByIds(["install-survey", "service-area", "service-sales"])} withSchema className="mt-5" />
        </section>
      </Container>
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "お問い合わせ・無料相談", description: DESC, type: "ContactPage", mainEntity: "business" }))} />
    </>
  );
}
