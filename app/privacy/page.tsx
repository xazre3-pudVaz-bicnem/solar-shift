import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig, contactEmail, addressWithPostal, companyMapEmbedUrl } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LastUpdated } from "@/components/ui/LastUpdated";

const PATH = "/privacy";

export const metadata: Metadata = buildMetadata({
  title: "プライバシーポリシー",
  description: `${siteConfig.name}（運営：${siteConfig.company.name}）における個人情報の取り扱いについて。取得する情報、利用目的、第三者提供、チャット（自動応答）での入力内容の扱い、安全管理、開示請求、お問い合わせ窓口。`,
  path: PATH,
});

export default function PrivacyPage() {
  const email = contactEmail();
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "プライバシーポリシー", href: PATH },
        ]}
        title="プライバシーポリシー"
        lead={`${siteConfig.company.name}（以下「当社」）は、当社が運営する「${siteConfig.name}」のWebサイト（以下「当サイト」）において取得する個人情報を、以下の方針に基づいて取り扱います。`}
      >
        <LastUpdated updatedAt="2026-10-02" showSupervisor={false} className="mt-5" />
      </PageHeader>
      <Container size="prose" className="prose-ss py-10 sm:py-14">
        <h2>1. 事業者の名称・所在地</h2>
        <p>{siteConfig.company.name}（{siteConfig.company.representativeTitle} {siteConfig.company.representative}）<br />{addressWithPostal()}</p>

        <h2>2. 取得する情報</h2>
        <p>当サイトでは、お問い合わせフォームの送信時に、お名前、メールアドレス、電話番号（任意）、ご住所のエリア、ご相談内容を取得します。チャット（自動応答）に入力された内容の扱いは、下記「8. チャット（自動応答）について」をご覧ください。また、サイトの利用状況を把握するため、アクセス解析ツールによりCookieや閲覧履歴等の情報を取得する場合があります。</p>

        <h2>3. 利用目的</h2>
        <ul>
          <li>お問い合わせへの回答、現地調査・お見積もりのご連絡</li>
          <li>サービスの提供、契約の履行、アフターサポート</li>
          <li>補助金の申請サポートに必要な書類の準備（お客様の同意のもと）</li>
          <li>当サイトの改善、利用状況の分析</li>
          <li>法令に基づく対応</li>
        </ul>

        <h2>4. 第三者への提供</h2>
        <p>当社は、次の場合を除き、取得した個人情報を第三者に提供しません。</p>
        <ul>
          <li>ご本人の同意がある場合</li>
          <li>補助金申請・工事の実施に必要な範囲で、お客様の同意のもと施工・申請の協力事業者へ提供する場合</li>
          <li>法令に基づく場合</li>
        </ul>

        <h2>5. 業務委託</h2>
        <p>当社は、利用目的の達成に必要な範囲で、個人情報の取り扱いを外部に委託することがあります。その場合、委託先に対して必要かつ適切な監督を行います。</p>

        <h2>6. 安全管理</h2>
        <p>当社は、個人情報の漏えい、滅失またはき損の防止のため、必要かつ適切な安全管理措置を講じます。</p>

        <h2>7. Cookie・アクセス解析</h2>
        <p>当サイトでは、利用状況の把握のためにアクセス解析ツールを使用する場合があります。これらのツールはCookieを利用して情報を収集しますが、個人を特定する情報は含まれません。ブラウザの設定によりCookieを無効にすることができます。</p>
        {companyMapEmbedUrl() && (
          <p>運営会社のページでは、所在地を示すために Google マップ（Google LLC が提供する地図サービス）を利用しています。地図を表示すると、Google が Cookie などを利用して閲覧に関する情報を取得する場合があります。取得された情報は、Google のプライバシーポリシーに基づいて取り扱われます。</p>
        )}

        <h2>8. チャット（自動応答）について</h2>
        <p>当サイトのチャットは、入力された質問に自動で回答する機能です。担当者が対応するものではありません。</p>
        <ul>
          <li>入力された質問と直前のやり取りは、回答を作成するために当サイトのサーバーへ送信されます。AIによる回答を行う場合は、回答の生成に利用している米国 Anthropic 社のAIサービス（Claude）へ送信され、同社の利用規約・プライバシーポリシーに基づいて取り扱われます。</li>
          <li>当社は、チャットに入力された内容を記録・保存していません。やり取りの表示は、お使いのブラウザの中（そのタブを閉じるまで）にのみ保持されます。</li>
          <li>短時間に大量の送信が行われることを防ぐため、接続元のIPアドレスを一時的に参照します。</li>
          <li>チャットには、氏名・住所・電話番号・メールアドレスなどの個人情報を入力しないでください。ご自宅の条件に関する個別のご相談は、お問い合わせフォームをご利用ください。</li>
          <li>チャットの回答は、公式情報にもとづく参考情報です。補助金の交付や金額を保証するものではありません。</li>
        </ul>

        <h2>9. 開示・訂正・削除</h2>
        <p>ご本人から個人情報の開示、訂正、追加、削除、利用停止のご請求があった場合は、ご本人であることを確認のうえ、法令に従い適切に対応します。</p>

        <h2>10. お問い合わせ窓口</h2>
        <p>
          {siteConfig.company.name} {siteConfig.name} 担当
          {email && (
            <>
              <br />メール：<a href={`mailto:${email}`}>{email}</a>
            </>
          )}
          {siteConfig.contact.telDisplay && (
            <>
              <br />電話：<a href={`tel:${siteConfig.contact.tel}`}>{siteConfig.contact.telDisplay}</a>
            </>
          )}
        </p>

        <h2>11. 本ポリシーの変更</h2>
        <p>本ポリシーの内容は、法令の改正やサービスの変更に応じて改定することがあります。改定後の内容は当サイトに掲載した時点から適用されます。</p>

        <p>制定日：2026年10月1日<br />最終改定日：2026年10月2日（所在地・連絡先の更新）</p>
      </Container>
    </>
  );
}
