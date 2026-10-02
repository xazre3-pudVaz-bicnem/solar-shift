import { OpenChatButton } from "@/components/chat/OpenChatButton";
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig, contactEmail, addressWithPostal } from "@/lib/site";
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
const DESC = `SOLAR SHIFTへのお問い合わせ・無料相談。葛飾区の太陽光発電・蓄電池・V2H・補助金のご相談、現地調査・お見積もりの依頼を、フォーム・メール${siteConfig.contact.telDisplay ? `・お電話（${siteConfig.contact.telDisplay}）` : ""}で受け付けています。訪問販売・電話営業はしていません。`;

export const metadata: Metadata = buildMetadata({
  title: "お問い合わせ・無料相談｜葛飾区の太陽光・蓄電池",
  description: DESC,
  path: PATH,
  keywords: ["太陽光 無料相談 葛飾区", "太陽光 見積もり 葛飾区", "蓄電池 相談"],
});

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
        title="太陽光・蓄電池・補助金について、お気軽にご相談ください"
        lead="現地調査・お見積もりは無料です。「補助金について聞きたい」「わが家が対象か知りたい」だけでも構いません。訪問販売や電話営業はしていません。お問い合わせをいただいた方にだけご連絡します。"
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
          <aside className="space-y-8">
            <div className="rounded-3xl bg-white p-5 text-[14px] leading-[1.8] shadow-card">
              <h2 className="text-[16px] font-bold text-navy-900">{siteConfig.contact.telDisplay ? "お電話・メールでのお問い合わせ" : "メールでのお問い合わせ"}</h2>
              {siteConfig.contact.telDisplay && (
                <a
                  href={`tel:${siteConfig.contact.tel}`}
                  className="mt-3 flex items-center gap-2.5 rounded-2xl border-2 border-navy-900 bg-cream px-3.5 py-3 text-navy-900 transition-colors duration-200 hover:bg-orange-50 min-[400px]:gap-3 min-[400px]:px-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-navy-900">
                    <PhoneIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 leading-none">
                    <span className="block text-[12px] font-bold text-ink-2">
                      お電話でのご相談
                      {siteConfig.contact.hours && <span className="ml-1 font-normal">（{siteConfig.contact.hours}）</span>}
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
                <p className="mt-3">
                  <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-navy-600 underline underline-offset-4">LINEで相談する</a>
                </p>
              )}
              <p className="mt-3 text-[13px] text-ink-3">運営：{siteConfig.company.name}（{addressWithPostal()}）</p>
            </div>
            <div className="rounded-3xl bg-beige p-5">
              <h2 className="text-[16px] font-bold text-navy-900">お問い合わせ後の流れ</h2>
              <div className="mt-4">
                <Steps
                  steps={[
                    { title: "担当者からご連絡", body: "通常2〜3営業日以内に、メールでご連絡します。" },
                    { title: "ヒアリング", body: "屋根の形状・築年数・電気の使い方・ご希望の設備を伺います。" },
                    { title: "現地調査（無料）", body: "ご都合のよい日程で屋根・分電盤・設置場所を確認します。" },
                    { title: "ご提案・お見積もり", body: "内訳を分けた見積もりと、制度ごとの想定助成額をお渡しします。" },
                  ]}
                />
              </div>
            </div>
            <div className="rounded-3xl border-2 border-green-200 bg-white p-5 text-[14px] leading-[1.8]">
              <h2 className="text-[16px] font-bold text-navy-900">まずチャットで聞いてみる</h2>
              <p className="mt-2 text-ink-2">補助金の金額や申請の順番など、よくある質問にはチャット（自動応答）でもお答えします。</p>
              <OpenChatButton className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-green-600 px-5 py-1.5 text-[14px] font-bold text-white hover:bg-green-700">
                チャットで質問する
              </OpenChatButton>
            </div>
            <div className="text-[14px] leading-[1.8] text-ink-2">
              <p className="font-bold text-navy-900">相談の前に見ておくと話が早いページ</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/simulation" className="inline-block py-0.5 text-navy-600 underline underline-offset-4">補助金シミュレーター</Link></li>
                <li><Link href="/subsidy/katsushika" className="inline-block py-0.5 text-navy-600 underline underline-offset-4">葛飾区の補助金</Link></li>
                <li><Link href="/flow" className="inline-block py-0.5 text-navy-600 underline underline-offset-4">導入までの流れ</Link></li>
                <li><Link href="/faq" className="inline-block py-0.5 text-navy-600 underline underline-offset-4">よくある質問</Link></li>
              </ul>
            </div>
          </aside>
        </div>
        <section className="cv-block mt-16" aria-labelledby="faq-h">
          <h2 id="faq-h" className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">お問い合わせについてよくある質問</h2>
          <FaqSection items={faqsByIds(["install-survey", "service-sales", "service-area"])} withSchema className="mt-5" />
        </section>
      </Container>
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "お問い合わせ", description: DESC, type: "ContactPage" }))} />
    </>
  );
}
