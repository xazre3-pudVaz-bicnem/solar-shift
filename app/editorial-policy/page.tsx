import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig, contactEmail } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

const PATH = "/editorial-policy";
const DESC = "SOLAR SHIFTの記事・補助金情報の編集方針。一次情報の確認、確認日の明記、断定表現の禁止、架空事例の禁止、自動生成記事の品質基準、免責事項、訂正の手続き。株式会社サイプレス運営。";

export const metadata: Metadata = buildMetadata({
  title: "記事・補助金情報の編集方針",
  description: DESC,
  path: PATH,
});

export default function EditorialPolicyPage() {
  const email = contactEmail();
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "記事・補助金情報の編集方針", href: PATH },
        ]}
        eyebrow="編集方針"
        title="記事・補助金情報の編集方針"
        lead="当サイトは、補助金・費用・売電など金銭判断に関わる情報を多く扱います。読者が誤った判断をしないよう、情報の確認・表現・更新について次の方針を定めています。"
      >
        <LastUpdated updatedAt="2026-10-01" className="mt-5" />
      </PageHeader>
      <Container size="prose" className="py-10 sm:py-14">
        <KeyPoints
          title="編集方針の要点"
          conclusion="制度・金額は自治体・国の一次情報のみを根拠にし、確認日を明記する。確認できていないことは書かず、断定・保証の表現を使わない。架空の施工事例・口コミ・削減率は掲載しない。自動生成記事も同じ基準で機械的・人的に検証し、基準を満たさないものは公開しない。"
          points={[
            "根拠は一次情報（自治体・国・メーカー公式）のみ",
            "補助金には年度・最終確認日・公式リンク・注意事項を必ず表示",
            "「必ず」「絶対」「確実に元が取れる」は使わない",
            "併用可否は公式で確認できたものだけ記載",
            "誤りはお問い合わせから受け付け、確認のうえ訂正・更新日を明記",
          ]}
        />
        <div className="prose-ss mt-10">
          <h2>1. 運営・監修</h2>
          <p>当サイトの記事・ページは、{siteConfig.company.name}（{siteConfig.company.address.full}）が運営する {siteConfig.name} が作成・監修しています。各ページ・記事には「監修・運営：{siteConfig.editorial.supervisor}」と最終更新日を表示します。</p>

          <h2>2. 情報源の基準</h2>
          <ul>
            <li>補助金・助成金：葛飾区、東京都（クール・ネット東京）、国（経済産業省・環境省・国土交通省・SII・NeV など）の公式サイト・公募要領のみを根拠にします。</li>
            <li>FIT・売電価格：経済産業省・資源エネルギー庁の公表資料を根拠にします。</li>
            <li>商品仕様：メーカー公式サイト・カタログのみを根拠にし、出典URLを商品データに記録します。</li>
            <li>地域情報：葛飾区公式サイト（統計・ハザードマップ）を根拠にします。</li>
            <li>他社サイト・まとめサイト・口コミサイトは根拠にしません。</li>
          </ul>

          <h2>3. 補助金情報の表示ルール</h2>
          <ul>
            <li>制度ごとに「年度・対象者・助成額・上限・申請期間・締切・事前手続きの要否・注意事項・出典・最終確認日」を表示します。</li>
            <li>金額は <code>data/subsidies</code> で一元管理し、各ページはそこから参照します。制度が変わったときは1か所の修正で全ページに反映します。</li>
            <li>「必ず補助金がもらえる」「絶対にこの金額になる」といった断定は使いません。</li>
            <li>複数制度の併用可否は、公式情報で確認できたものだけを記載し、確認できないものを「併用可能」とは書きません。シミュレーターでも確認できていない併用は合算しません。</li>
            <li>すべての補助金ページに「最新情報は各公式サイトでご確認ください」という注意書きと免責事項を表示します。</li>
          </ul>

          <h2>4. 実績・事例・口コミ</h2>
          <ul>
            <li>施工事例は、実際に施工し、お客様の掲載許可を得たものだけを掲載します。</li>
            <li>お客様の声は、ご本人の掲載許可を得たものだけを掲載します。</li>
            <li>架空の顧客名、架空の電気代削減率、架空の施工写真、架空の口コミは作成しません。</li>
            <li>「創業○年」「施工○件」「地域No.1」「メーカー認定」「自社施工」「有資格者」など、事実として確認できていない表現は使いません。</li>
            <li>構造化データ（Review・AggregateRating 等）は、ページに掲載している内容と一致する範囲でのみ出力します。</li>
          </ul>

          <h2>5. 商品情報</h2>
          <ul>
            <li>価格が未確定の商品は「お問い合わせください」と表示し、架空の価格・Offer構造化データを出しません。</li>
            <li>取扱契約が確認できていないメーカーについて「正規取扱店」などの表現は使いません。</li>
            <li>「おすすめ」は、人が理由を書いたものだけを掲載し、仕様からの自動判定は行いません。</li>
          </ul>

          <h2>6. 自動生成記事について</h2>
          <p>当サイトのブログには、AI（Claude）を用いて下書きを生成し、機械的な検証を経て公開する記事が含まれます。該当する記事には「自動生成」の表示を付けています。自動生成記事は次の基準をすべて満たさない限り公開されません。</p>
          <ul>
            <li>既存記事と検索意図・タイトルが重複していない</li>
            <li>内容が十分な分量と構成を持ち、焼き直しではない</li>
            <li>根拠のない数字、補助金額の推測、架空の施工事例を含まない</li>
            <li>キーワードを過剰に繰り返していない</li>
            <li>存在しないページへのリンクを含まない</li>
            <li>制度・金額の記述が、当サイトの検証済み事実シートの範囲内である</li>
          </ul>
          <p>生成に失敗した場合や基準を満たさない場合は、無理に公開せずスキップします。</p>

          <h2>7. 更新・訂正</h2>
          <ul>
            <li>補助金情報は、年度の切り替わりや制度変更の公表に合わせて確認し、確認日を更新します。</li>
            <li>誤りのご指摘は<Link href="/contact">お問い合わせ</Link>から受け付けます。確認のうえ訂正し、更新日を明記します。</li>
          </ul>

          <h2>8. 免責事項</h2>
          <ul>
            <li>当サイトの情報は、掲載時点で確認できた内容に基づくものであり、制度・価格・仕様は予告なく変更される場合があります。</li>
            <li>補助金の交付可否・金額は自治体等の審査により決まり、当サイトの情報は交付を保証するものではありません。</li>
            <li>当サイトの情報を利用して行われた判断・行動について、当社は責任を負いかねます。重要な判断は必ず公式情報と専門家の確認を経て行ってください。</li>
          </ul>

          <h2>9. お問い合わせ先</h2>
          <p>
            {siteConfig.company.name} {siteConfig.name} 担当
            {email && (
              <>
                <br />メール：<a href={`mailto:${email}`}>{email}</a>
              </>
            )}
            <br />
            <Link href="/contact">お問い合わせフォーム</Link>
          </p>
        </div>
      </Container>
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "記事・補助金情報の編集方針", description: DESC, dateModified: "2026-10-01" }))} />
    </>
  );
}
