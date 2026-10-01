import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, getSubsidy } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { simulate } from "@/lib/subsidy-calc";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { SubsidyProgramSection } from "@/components/subsidy/SubsidyProgramSection";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { Steps } from "@/components/ui/Steps";
import { Callout } from "@/components/ui/Callout";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, articleSchema } from "@/lib/schema";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getPostsForPillar } from "@/lib/blog";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { images } from "@/data/images";

const PATH = "/subsidy/katsushika";
const P = katsushikaProgram;

export const metadata: Metadata = buildMetadata({
  title: "葛飾区の太陽光・蓄電池補助金2026｜かつしかエコ助成金の金額・条件・申請",
  description:
    "葛飾区の太陽光発電・蓄電池の補助金（令和8年度かつしかエコ助成金）を解説。太陽光6万円/kW上限30万円、蓄電池1/4上限20万円、併設加算5万円、V2H・HEMSの助成額、着工4週間前の事前協議、申請の流れ。2026年10月1日時点の公式情報。",
  path: PATH,
  keywords: ["葛飾区 太陽光 補助金", "葛飾区 太陽光発電 補助金", "葛飾区 蓄電池 補助金", "かつしかエコ助成金", "V2H 補助金 葛飾区", "葛飾区 太陽光"],
  type: "article",
  modifiedTime: P.lastVerified,
});

export default function KatsushikaSubsidyPage() {
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "補助金", href: "/subsidy" },
    { name: "葛飾区の太陽光・蓄電池補助金", href: PATH },
  ];
  const solar = getSubsidy("katsushika-solar")!;
  const battery = getSubsidy("katsushika-battery")!;
  const addon = getSubsidy("katsushika-solar-battery-addon")!;
  const v2h = getSubsidy("katsushika-v2h")!;
  const hems = getSubsidy("katsushika-hems")!;
  const examples = [
    { label: "太陽光4kWのみ", input: { solarKw: 4, batteryKwh: 0, v2h: false, hems: false } },
    { label: "太陽光5kW＋蓄電池7kWh", input: { solarKw: 5, batteryKwh: 7, v2h: false, hems: false } },
    { label: "太陽光6kW＋蓄電池10kWh＋HEMS", input: { solarKw: 6, batteryKwh: 10, v2h: false, hems: true } },
  ].map((e) => ({
    ...e,
    result: simulate({ area: "katsushika", housing: "existing", ...e.input }).areas.find((a) => a.area === "katsushika")!,
  }));
  const faqItems = faqsByIds(["subsidy-katsushika-overview", "subsidy-pre-consultation", "subsidy-combination", "subsidy-guarantee"]);
  const posts = getPostsForPillar(["katsushika-subsidy"], 3);

  return (
    <>
      <PageHeader
        crumbs={crumbs}
        eyebrow={`葛飾区｜${P.fiscalYear}`}
        title={<>葛飾区の太陽光・蓄電池補助金<span className="block text-[0.7em] text-ink-2">かつしかエコ助成金（個人住宅用）の金額・条件・申請の流れ</span></>}
        lead="葛飾区にお住まいの方が太陽光発電・蓄電池・V2H・HEMSを導入するときに使える、区の助成制度をまとめました。金額は区の公式情報を確認したもので、確認日を明記しています。"
        image={images.peopleStaffPoint}
      >
        <LastUpdated updatedAt={P.lastVerified} verifiedAt={P.lastVerified} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <KeyPoints
          conclusion={`葛飾区の「かつしかエコ助成金（個人住宅用）」では、${formatDateJa(P.lastVerified)}時点の公式情報で、太陽光発電が${solar.amount}（${solar.maxAmount}）、蓄電池が${battery.amount}（${battery.maxAmount}）、太陽光と蓄電池の併設加算が${addon.amount}です。申込期間は${solar.applicationPeriod}で、原則として工事着工の4週間前までに事前協議が必要です。`}
          points={[
            `対象者：区内の自ら居住する住宅に設置する方（過去10年間に同じ建物・同じ種類の機器で区の助成を受けていないこと）`,
            `金額：太陽光${solar.amount}・${solar.maxAmount}／蓄電池${battery.amount}・${battery.maxAmount}／併設加算${addon.amount}／HEMS${hems.amount}／V2H${v2h.amount}・${v2h.maxAmount}`,
            `申請時期：${solar.applicationPeriod}。事前協議は着工4週間前まで`,
            "注意点：区の事前協議回答書が届く前に着工すると対象外。国・都との併用可否は区の案内に明記がなく、窓口に確認が必要",
          ]}
        />

        <section className="mt-14" aria-labelledby="table">
          <h2 id="table" className="text-[24px] font-bold text-navy-900">助成額の一覧（{P.fiscalYear}）</h2>
          <p className="mt-2 text-[14px] text-ink-2">出典：<a href={P.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4">{P.sourceName}</a>（{formatDateJa(P.lastVerified)} 確認）</p>
          <div className="mt-6">
            <SubsidyTable menus={P.menus} />
          </div>
          <Callout tone="important" title="申込期間と事前協議" className="mt-6">
            <p>申込期間は<strong>{solar.applicationPeriod}</strong>。予算の状況により早期終了の可能性があります。</p>
            <p className="mt-1"><strong>原則、工事着工の4週間前までに事前協議が必要</strong>です。区から郵送される事前協議回答書の到着後に設置工事を行います。新築住宅に設置する場合は引渡しの4週間前までに申し込みます。</p>
          </Callout>
        </section>

        <section className="mt-16" aria-labelledby="examples">
          <h2 id="examples" className="text-[24px] font-bold text-navy-900">想定助成額の計算例（葛飾区分のみ）</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-[1.9] text-ink-2">
            区の制度だけで計算した例です。蓄電池は「対象経費の1/4」のため、経費が未確定のときは上限額（{battery.maxAmount}）で示しています。東京都の助成は別制度のため、ここには含めていません。
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-[14px]">
              <thead>
                <tr className="bg-navy-900 text-left text-white">
                  <th className="border border-navy-800 px-3 py-2.5">導入内容（既存住宅）</th>
                  <th className="border border-navy-800 px-3 py-2.5">内訳</th>
                  <th className="border border-navy-800 px-3 py-2.5">区の想定助成額（小計）</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((e, i) => (
                  <tr key={e.label} className={i % 2 ? "bg-paper-2" : "bg-white"}>
                    <th scope="row" className="border border-line px-3 py-2.5 text-left font-bold text-navy-900">{e.label}</th>
                    <td className="border border-line px-3 py-2.5">
                      <ul className="space-y-0.5">
                        {e.result.lines.map((l) => (
                          <li key={l.subsidy.id} className="text-[13px]">
                            {l.subsidy.name}：{l.formula} → {l.amount === null ? "—" : `${l.amount.toLocaleString("ja-JP")}円`}
                            {l.isCapOnly && <span className="text-accent-text">（上限額）</span>}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="border border-line px-3 py-2.5 font-bold text-navy-900">{e.result.subtotal.toLocaleString("ja-JP")}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-ink-2">
            ご自宅の条件で東京都分も含めて確認するには<Link href="/simulation" className="mx-1 text-navy-600 underline underline-offset-4">補助金シミュレーター</Link>をご利用ください（区と都は分けて表示します）。
          </p>
        </section>

        <section className="mt-16" aria-labelledby="flow">
          <h2 id="flow" className="text-[24px] font-bold text-navy-900">申請の流れ（事前協議から交付まで）</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-[1.9] text-ink-2">区の公式案内に示されている流れをもとに整理しています。書類の様式や提出方法は区の手引きをご確認ください。</p>
          <div className="mt-8">
            <Steps
              steps={[
                { title: "事前協議の申し込み", meta: "工事着工の4週間前まで（必着）", body: "環境課環境計画係（410番窓口）へ窓口または郵送で申し込みます。見積書や機器の仕様が分かる書類が必要になるため、業者の見積もりが出てから準備します。" },
                { title: "区の審査・事前協議回答書の郵送", meta: "審査後、区から郵送", body: "書類の審査後、区から事前協議回答書が郵送されます。申請が集中する時期は時間がかかることがあります。" },
                { title: "設置工事", meta: "回答書の到着後", body: "回答書が届いてから工事に入ります。回答書前に着工すると助成対象外です。" },
                { title: "完了報告・交付申請", meta: "工事完了後", body: "完了報告の書類（共通書類と機器ごとの書類）を揃えて提出します。審査後、交付額確定通知書が送付され、助成金が交付されます。" },
              ]}
            />
          </div>
          <Callout tone="warn" title="よくある落とし穴" className="mt-8">
            <ul className="list-disc space-y-1 pl-5">
              <li>契約を急かされて、事前協議の前に着工してしまう</li>
              <li>過去10年以内に同じ建物・同じ種類の機器で区の助成を受けていた</li>
              <li>年度末に申請が集中し、回答書の到着が遅れて工事日程がずれる</li>
              <li>「区の委託業者」を名乗る訪問販売（葛飾区は特定の業者に営業・販売を委託していません）</li>
            </ul>
          </Callout>
        </section>

        <section className="mt-16" aria-labelledby="detail">
          <h2 id="detail" className="text-[24px] font-bold text-navy-900">メニュー別の詳細</h2>
          <div className="mt-6">
            <SubsidyProgramSection program={P} headingLevel="h3" />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="tokyo">
          <h2 id="tokyo" className="text-[24px] font-bold text-navy-900">東京都の助成も検討対象になります</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-[1.9] text-ink-2">
            葛飾区の住宅は、東京都（クール・ネット東京）の家庭向け助成の対象にもなり得ます。区と都の併用可否は公式情報で明記が確認できていないため、両方を検討する場合は申請前に各窓口へ確認してください。
          </p>
          <div className="mt-6">
            <SubsidyTable menus={[...tokyoSolarProgram.menus, ...tokyoBatteryProgram.menus]} />
          </div>
          <div className="mt-5">
            <LinkButton href="/subsidy/tokyo" variant="secondary">東京都の補助金を詳しく見る <ArrowIcon /></LinkButton>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="faq">
          <h2 id="faq" className="text-[24px] font-bold text-navy-900">葛飾区の補助金についてよくある質問</h2>
          <FaqSection items={faqItems} withSchema className="mt-6" />
        </section>

        <SubsidyDisclaimer className="mt-12" dateOverride={P.lastVerified} />
        <SourceList
          sources={[
            { name: P.sourceName, url: P.sourceUrl, verifiedAt: P.lastVerified },
            { name: "かつしかエコ助成金（葛飾区公式サイト・制度トップ）", url: "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1035385/index.html", verifiedAt: P.lastVerified },
            { name: tokyoSolarProgram.sourceName, url: tokyoSolarProgram.sourceUrl, verifiedAt: tokyoSolarProgram.lastVerified },
            { name: tokyoBatteryProgram.sourceName, url: tokyoBatteryProgram.sourceUrl, verifiedAt: tokyoBatteryProgram.lastVerified },
          ]}
          className="mt-10"
        />
        <div className="mt-10">
          <AuthorBox />
        </div>
        <nav className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="関連ページ">
          {[
            { href: "/area/katsushika", label: "葛飾区の太陽光発電" },
            { href: "/solar-battery", label: "太陽光＋蓄電池について" },
            { href: "/flow", label: "導入までの流れ" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="border border-line bg-white px-4 py-3 text-[14px] font-bold text-navy-900 hover:border-navy-900">
              {l.label} →
            </Link>
          ))}
        </nav>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="葛飾区の補助金に関する記事" />
        </Container>
      )}

      <CtaSection
        title="葛飾区の助成は、着工4週間前の事前協議から。申請の逆算を一緒に。"
        body="見積もりの段階で、区と都の制度を整理し、事前協議の提出時期と工事日程を組み立てます。現地調査・お見積もりは無料です。"
      />

      <JsonLd
        data={graph(
          articleSchema({
            path: PATH,
            title: "葛飾区の太陽光・蓄電池補助金（かつしかエコ助成金）2026年度の金額・条件・申請の流れ",
            description: metadata.description as string,
            datePublished: "2026-10-01",
            dateModified: P.lastVerified,
            keywords: ["葛飾区 太陽光 補助金", "かつしかエコ助成金"],
          }),
        )}
      />
    </>
  );
}
