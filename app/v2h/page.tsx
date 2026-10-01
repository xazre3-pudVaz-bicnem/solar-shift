import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { subsidiesByEquipment, getSubsidy } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { ServiceLayout } from "@/components/sections/ServiceLayout";
import { images } from "@/data/images";

const PATH = "/v2h";
const DESC =
  "V2H（Vehicle to Home）とは、電気自動車のバッテリーの電気を家庭で使う設備。仕組み、太陽光との組み合わせ、対応車種・機器の注意点、葛飾区の助成（本体価格の1/3・上限15万円）と国のCEV補助金の現状を整理。";

export const metadata: Metadata = buildMetadata({
  title: "V2Hとは｜電気自動車の電気を家で使う仕組みと葛飾区の補助金",
  description: DESC,
  path: PATH,
  keywords: ["V2H とは", "V2H 仕組み", "V2H 補助金 葛飾区", "V2H 太陽光", "電気自動車 家 給電"],
});

export default function V2hPage() {
  const subsidies = subsidiesByEquipment("v2h");
  const k = getSubsidy("katsushika-v2h")!;
  return (
    <ServiceLayout
      path={PATH}
      pageName="V2H（電気自動車の電気を家で使う）"
      description={DESC}
      crumbs={[
        { name: "ホーム", href: "/" },
        { name: "V2H", href: PATH },
      ]}
      eyebrow="V2H"
      heroImage={images.houseEvV2h}
      tip={{ title: "最初に確認すること", body: <>V2Hは<strong className="marker">対応車種と機器の組み合わせ</strong>に制限があります。お持ちの車（購入予定の車）で使えるかを先に確認しましょう。</>, image: images.poseIdea }}
      title={<>V2H<span className="block text-[0.7em] text-ink-2">電気自動車を、走る蓄電池として使う</span></>}
      lead="V2H（Vehicle to Home）は、電気自動車（EV・PHEV）のバッテリーにためた電気を家庭で使えるようにする設備です。太陽光で発電した電気をEVに充電し、夜間や停電時に家で使うことができます。"
      conclusion={`V2Hは、EVの大きなバッテリーを家庭用蓄電池のように使う設備です。太陽光と組み合わせると、昼に発電した電気でEVを充電し、夜や停電時に家へ給電できます。対応車種とV2H機器の組み合わせに制限があり、車を使っている時間は家に給電できない点が家庭用蓄電池との違いです。葛飾区の助成は${k.amount}（${k.maxAmount}）で、国のCEV補助金は2026年8月27日に受付終了しています（2026年10月1日時点）。`}
      points={[
        "EVのバッテリーは家庭用蓄電池より大容量のことが多く、停電時の備えとして心強い",
        "車が外出中は家に給電できない。日常的な平準化には家庭用蓄電池のほうが向く場合がある",
        "対応車種・V2H機器・工事条件の組み合わせを事前に確認する必要がある",
        "葛飾区の助成は本体価格の1/3（上限15万円）。着工4週間前までの事前協議が原則",
        "国のCEV補助金（V2H）は受付終了中。次回公募は未定",
      ]}
      sections={[
        {
          id: "how",
          heading: "V2Hの仕組み",
          image: images.batEv,
          body: (
            <>
              <p>V2H機器は、家の分電盤とEVの間に設置され、<strong>EVへの充電</strong>と<strong>EVから家への給電</strong>の両方向で電気を変換します。通常の充電設備（普通充電器）は一方向ですが、V2Hは双方向である点が違いです。</p>
              <p>太陽光がある家では、昼の余剰電力でEVを充電し、夕方以降はEVの電気を家で使う運用ができます。停電時はEVのバッテリーから家に給電し、太陽光で充電しながら使うことも可能です。</p>
              <p>家庭用蓄電池との違いや組み合わせは、<Link href="/battery">家庭用蓄電池のページ</Link>もあわせてご覧ください。</p>
            </>
          ),
        },
        {
          id: "merit",
          heading: "利点と注意点",
          image: images.iconHouseEv,
          body: (
            <>
              <h3>利点</h3>
              <ul>
                <li>EVのバッテリーは家庭用蓄電池より容量が大きいことが多く、停電時に長く使える</li>
                <li>太陽光の余剰電力をEVの走行に使えば、ガソリン代と電気代の両方を抑える方向に働く</li>
                <li>家庭用蓄電池を別に置くより、設置スペースを抑えられる場合がある</li>
              </ul>
              <h3>注意点</h3>
              <ul>
                <li>車が外出している時間は家に給電できない。日中に車を使う家庭では、平準化の効果は限定的</li>
                <li>対応車種とV2H機器の組み合わせに制限がある。購入予定の車種で使えるかを先に確認する</li>
                <li>設置には駐車スペースの近くに機器を置く場所と配線経路が必要</li>
                <li>バッテリーの充放電が増えることによる車側の保証条件は、メーカーの案内で確認する</li>
              </ul>
            </>
          ),
        },
        {
          id: "with-solar",
          heading: "太陽光・蓄電池との組み合わせ",
          image: images.iconGHouseEv,
          body: (
            <>
              <p>構成は大きく3通りです。</p>
              <ol>
                <li><strong>太陽光＋V2H</strong>：昼に発電した電気をEVへ。家庭用蓄電池を置かない分、設備を絞れる。車が外出中は家に蓄える先がない</li>
                <li><strong>太陽光＋蓄電池＋V2H</strong>：日常の平準化は家庭用蓄電池、停電時の長期備えはEVという役割分担。機器が増える分、設計の整合が必要</li>
                <li><strong>V2Hのみ（太陽光なし）</strong>：夜間の電気でEVを充電し、日中に家で使う運用。発電がないため、電気代の削減効果は料金プランに依存する</li>
              </ol>
              <p>どの構成が合うかは、車の使い方（平日の外出時間）と電気の使い方で変わります。全体像は<Link href="/solar-battery">太陽光＋蓄電池</Link>のページも参考にしてください。</p>
            </>
          ),
        },
        {
          id: "katsushika",
          heading: "葛飾区で導入するときの考え方",
          image: images.poseChart,
          body: (
            <>
              <p>葛飾区の「かつしかエコ助成金」では、V2Hは{k.amount}（{k.maxAmount}）が助成対象です（{k.lastVerified.replace(/-/g, "/")} 時点）。算定基礎は本体価格で、工事費は含まれません。工事着工4週間前までの事前協議が原則必要です。</p>
              <p>国のCEV補助金（V2H充放電設備）は2026年8月27日に受付終了しています。次回公募の時期・内容は未確定のため、国の制度を前提にせず、区の助成を軸に計画を組むことをおすすめします。最新の状況は<Link href="/subsidy/national">国の補助制度ページ</Link>で確認できます。</p>
              <p>水害リスクのある地域では、V2H機器の設置高さや駐車場の浸水想定も確認します。</p>
            </>
          ),
        },
      ]}
      subsidies={subsidies}
      subsidyNote={<p>国のCEV補助金は受付終了中です。葛飾区の助成は受付中ですが、着工4週間前までの事前協議が原則必要です。</p>}
      faq={faqsByIds(["v2h-what", "subsidy-national", "solar-blackout"])}
      related={[
        { href: "/subsidy/katsushika", label: "葛飾区の補助金", description: "V2Hを含む助成額と条件" },
        { href: "/subsidy/national", label: "国の補助制度", description: "CEV補助金の現状" },
        { href: "/battery", label: "家庭用蓄電池", description: "V2Hとの違いと役割分担" },
        { href: "/guide/post-fit", label: "卒FIT後の選択肢", description: "V2Hで自家消費に切り替える" },
        { href: "/guide/blackout", label: "停電時の備え", description: "EVから家へ給電する考え方" },
        { href: "/hems", label: "HEMS", description: "V2H・蓄電池の制御と見える化" },
      ]}
      relatedCategories={["v2h", "katsushika-subsidy"]}
      cta={{
        title: "お持ちの車種で使えるか。そこから一緒に確認します。",
        body: "対応車種・機器の組み合わせ、設置場所、葛飾区の助成の想定額を整理してご提案します。太陽光・蓄電池との構成比較もお出しします。相談は無料です。",
      }}
    />
  );
}
