import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig, contactEmail, companyMapUrl, companyMapEmbedUrl } from "@/lib/site";
import { servedAreaNames } from "@/data/areas";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";
import { images } from "@/data/images";

const PATH = "/company";
const DESC = `SOLAR SHIFT（ソーラーシフト）の運営会社情報。${siteConfig.company.name}（${siteConfig.company.address.full}、${siteConfig.company.representativeTitle} ${siteConfig.company.representative}、設立${siteConfig.company.founded}）。葛飾区の太陽光発電・蓄電池事業。`;

export const metadata: Metadata = buildMetadata({
  title: "運営会社｜株式会社サイプレス",
  description: DESC,
  path: PATH,
  keywords: ["株式会社サイプレス", "SOLAR SHIFT 運営会社", "葛飾区 太陽光 会社"],
});

export default function CompanyPage() {
  const c = siteConfig.company;
  const email = contactEmail();
  // 地図は Googleビジネスプロフィールの埋め込み用 URL が入っているときだけ出す（lib/site.ts の gbp.embedUrl）
  const mapEmbedUrl = companyMapEmbedUrl();
  const rows = [
    { term: "サービス名", description: `${siteConfig.name}（${siteConfig.nameJa}）` },
    { term: "運営会社", description: `${c.name}（${c.nameEn}）` },
    { term: c.representativeTitle, description: c.representative },
    { term: "設立", description: c.founded },
    {
      term: "所在地",
      description: (
        <>
          {c.address.postalCode && <>〒{c.address.postalCode}<br /></>}
          {c.address.full}
          <a href={companyMapUrl()} target="_blank" rel="noopener noreferrer" className="ml-3 inline-block py-0.5 text-[13px] font-bold text-navy-600 underline underline-offset-4">
            Googleマップで見る
          </a>
        </>
      ),
    },
    { term: "事業内容", description: c.businessDescription },
    ...(email ? [{ term: "メールアドレス", description: <a href={`mailto:${email}`} className="text-navy-600 underline underline-offset-4">{email}</a> }] : []),
    ...(siteConfig.contact.telDisplay
      ? [
          {
            term: "電話番号",
            description: (
              <>
                <a href={`tel:${siteConfig.contact.tel}`} className="inline-block py-0.5 font-en text-[17px] font-extrabold tracking-[0.02em] text-navy-900 underline decoration-orange-400 decoration-2 underline-offset-4">
                  {siteConfig.contact.telDisplay}
                </a>
                {siteConfig.contact.hours && <span className="ml-2 text-[13px] text-ink-2">（{siteConfig.contact.hours}）</span>}
              </>
            ),
          },
        ]
      : []),
    { term: "SOLAR SHIFT の対応エリア", description: servedAreaNames().join("、") },
    { term: "コーポレートサイト", description: <a href={c.corporateUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4">{c.corporateUrl.replace(/^https?:\/\//, "")}</a> },
    ...(c.corporateNumber ? [{ term: "法人番号", description: c.corporateNumber }] : []),
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "運営会社", href: PATH },
        ]}
        eyebrow="運営会社"
        title={`${siteConfig.name} は、${c.name}が運営しています`}
        lead={`${siteConfig.name}（${siteConfig.nameJa}）は、${c.address.full}の${c.name}が運営する太陽光発電・蓄電池事業です。葛飾区を中心に、住宅用太陽光発電・家庭用蓄電池・V2H・HEMSの導入と補助金活用をサポートします。`}
      />
      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="space-y-6">
            <ImagePlaceholder src={images.consultationDesk.src} alt={images.consultationDesk.alt} ratio="4/3" label="会社・拠点の写真（差し替え）" priority />
            <div className="rounded-3xl bg-beige p-5 text-[14px] leading-[1.8] text-ink-2">
              <p className="font-bold text-navy-900">SOLAR SHIFT の位置づけ</p>
              <p className="mt-2">{c.name}は、Webマーケティング支援を中心に事業を行ってきた会社です。SOLAR SHIFT は、拠点のある葛飾区で、住宅の太陽光発電・蓄電池の導入を補助金の整理からサポートする事業として2026年に開始しました。</p>
              <p className="mt-2">新規事業のため、施工実績やお客様の声は掲載許可をいただいたものから順次公開します。確認できていない実績を掲載することはありません。</p>
            </div>
          </div>
          <div>
            <h2 className="border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">会社概要</h2>
            <DefinitionList rows={rows} className="mt-5" />
            {mapEmbedUrl && (
              <>
                <h2 className="mt-12 border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">
                  所在地の地図（{c.address.city}{c.address.town}）
                </h2>
                <p className="mt-4 text-[15px] leading-[1.9] text-ink-2">
                  {c.address.postalCode && <>〒{c.address.postalCode} </>}
                  {c.address.full}
                </p>
                <MapEmbed src={mapEmbedUrl} address={c.address.full} title={`${siteConfig.name}（${c.name}）の所在地の地図`} mapUrl={companyMapUrl()} className="mt-4" />
              </>
            )}
            <h2 className="mt-12 border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">SOLAR SHIFT の事業内容</h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                "住宅用太陽光発電の提案・設置",
                "家庭用蓄電池の提案・設置",
                "太陽光＋蓄電池の同時導入",
                "V2H（電気自動車の充放電設備）",
                "HEMS（エネルギー管理システム）",
                "関連する省エネ設備",
                "補助金活用サポート（葛飾区・東京都・国）",
                "現地調査・見積もり（無料）",
                "導入後サポート",
              ].map((s) => (
                <li key={s} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[14px] font-bold text-navy-900 shadow-card">
                  <span className="h-[6px] w-[6px] shrink-0 bg-orange-500" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
            <h2 className="mt-12 border-l-[8px] border-orange-500 pl-3 text-[22px] leading-[1.35] font-black text-navy-900">情報の取り扱い</h2>
            <p className="mt-4 text-[15px] leading-[1.9] text-ink-2">
              補助金・費用・売電など金銭判断に関わる情報は、自治体・国の一次情報を確認し、確認日を明記して掲載しています。記事の作成・更新の基準は
              <Link href="/editorial-policy" className="mx-1 text-navy-600 underline underline-offset-4">記事・補助金情報の編集方針</Link>
              を、個人情報の取り扱いは
              <Link href="/privacy" className="mx-1 text-navy-600 underline underline-offset-4">プライバシーポリシー</Link>
              をご覧ください。
            </p>
          </div>
        </div>
      </Container>
      <CtaSection title="葛飾区の会社として、葛飾区の住まいに向き合います。" body="現地調査・お見積もりは無料です。訪問販売や電話営業はしていません。お問い合わせをいただいた方にだけご連絡します。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "運営会社", description: DESC, type: "AboutPage" }))} />
    </>
  );
}
