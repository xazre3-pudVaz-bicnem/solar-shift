import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getSubsidy } from "@/data/subsidies";
import { faqsByIds } from "@/data/faq";
import { ServiceLayout } from "@/components/sections/ServiceLayout";
import { images } from "@/data/images";

const PATH = "/hems";
const DESC =
  "HEMS（ホームエネルギーマネジメントシステム）とは、家庭の発電・蓄電・消費を見える化し機器を制御する仕組み。太陽光・蓄電池との関係、葛飾区の助成（2万円/台・太陽光との併設加算1万円）、東京都DR加算との関係を整理。";

export const metadata: Metadata = buildMetadata({
  title: "HEMSとは｜エネルギーの見える化と葛飾区の助成",
  description: DESC,
  path: PATH,
  keywords: ["HEMS とは", "HEMS 太陽光", "HEMS 補助金 葛飾区", "ホームエネルギーマネジメントシステム"],
});

export default function HemsPage() {
  const hems = getSubsidy("katsushika-hems")!;
  const addon = getSubsidy("katsushika-solar-hems-addon")!;
  const subsidies = [hems, addon];
  return (
    <ServiceLayout
      path={PATH}
      pageName="HEMS（ホームエネルギーマネジメントシステム）"
      description={DESC}
      crumbs={[
        { name: "ホーム", href: "/" },
        { name: "HEMS", href: PATH },
      ]}
      eyebrow="HEMS"
      heroImage={images.batApp}
      tip={{ title: "入れる意味があるか", body: <>HEMSは必須ではありません。<strong className="marker">制御したい機器が対応しているか</strong>を確認し、意味があるときだけご提案します。</>, image: images.poseTrust }}
      title={<>HEMS<span className="block text-[0.7em] text-ink-2">つくる・ためる・使うを、見える化して制御する</span></>}
      lead="HEMS（Home Energy Management System）は、太陽光の発電量、蓄電池の残量、家の消費電力をひとつの画面で確認し、機器を制御する仕組みです。太陽光・蓄電池を導入した効果を「見える」ようにすることで、使い方の改善につながります。"
      conclusion={`HEMSは必須の設備ではありませんが、太陽光・蓄電池の効果を確認し、使い方を調整するための「計器盤」として役立ちます。葛飾区では${hems.name}が${hems.amount}、太陽光との併設加算が${addon.amount}の助成対象です（${hems.lastVerified.replace(/-/g, "/")} 時点）。東京都の蓄電池助成では、DR実証参加時にエネルギーマネジメント機器の有無で加算が変わります。`}
      points={[
        "発電・蓄電・消費をひとつの画面で確認でき、異常や無駄に気づける",
        "蓄電池・エコキュート・エアコンなど対応機器の制御ができる機種がある",
        "葛飾区の助成：HEMS 2万円/台、太陽光との併設加算 一律1万円（一方が既設の場合も対象）",
        "東京都の蓄電池助成はDR実証参加時にエネルギーマネジメント機器の有無で加算が変わる（詳細は公式で確認）",
      ]}
      sections={[
        {
          id: "what",
          heading: "HEMSでできること",
          image: images.consultationDesk,
          body: (
            <>
              <ul>
                <li><strong>見える化</strong>：発電量、売電量、買電量、蓄電池の残量、回路ごとの消費電力をリアルタイムと履歴で確認</li>
                <li><strong>制御</strong>：対応する蓄電池・エコキュート・エアコン・照明などを、時間帯や発電状況に応じて動かす</li>
                <li><strong>異常の検知</strong>：発電量が急に落ちた、蓄電池が充電されない、といった異常に早く気づける</li>
              </ul>
              <p>太陽光や蓄電池のモニターでも発電量は確認できますが、HEMSは家全体の消費まで含めて把握できる点が違いです。</p>
            </>
          ),
        },
        {
          id: "with",
          heading: "太陽光・蓄電池・V2Hとの関係",
          image: images.batHomeAppliances,
          body: (
            <>
              <p>HEMSの価値は、組み合わせる設備が多いほど大きくなります。太陽光だけの家では「発電量と消費のバランスを見る」用途が中心ですが、蓄電池やV2H、エコキュートがある家では「いつ、どこに電気を回すか」を制御する役割が加わります。</p>
              <p>東京都の蓄電池助成では、DR（デマンドレスポンス）実証に参加する場合、エネルギーマネジメント機器の設置有無で加算が変わります。DRは電力の需給に応じて蓄電池の充放電を調整する仕組みで、HEMSのような制御機器が関わります。詳細は<Link href="/subsidy/tokyo">東京都の補助金ページ</Link>と公式案内をご確認ください。</p>
              <p>機器の組み合わせ全体は<Link href="/solar-battery">太陽光＋蓄電池</Link>・<Link href="/v2h">V2H</Link>のページで解説しています。</p>
            </>
          ),
        },
        {
          id: "katsushika",
          heading: "葛飾区の助成",
          image: images.iconGHouseYenLeaf,
          body: (
            <>
              <p>葛飾区の「かつしかエコ助成金」では、HEMSが{hems.amount}、太陽光発電システムとHEMSを併せて導入する場合の併設加算が{addon.amount}です。併設加算は、一方が既設の機器に併設する場合も、両方を同時に設置する場合も対象です。対象になるHEMSは、ECHONET Lite を標準的なインターフェースとして搭載しているものです（区の案内）。</p>
              <p>他の機器と同様、工事着工4週間前までの事前協議が原則必要です。太陽光と一緒に導入する場合は、ひとつの申請にまとめて計画します。詳細は<Link href="/subsidy/katsushika">葛飾区の補助金ページ</Link>へ。</p>
            </>
          ),
        },
        {
          id: "choose",
          heading: "導入を検討するときのポイント",
          image: images.iconGClipboardHouse,
          body: (
            <>
              <ol>
                <li><strong>制御したい機器がHEMSに対応しているか</strong>：蓄電池・エコキュート・エアコンは機種により対応が異なる</li>
                <li><strong>通信規格</strong>：家庭内の機器連携に使われる規格に対応しているか</li>
                <li><strong>画面の使いやすさ</strong>：家族が日常的に見るかどうかで、効果は変わる</li>
                <li><strong>太陽光・蓄電池と同じタイミングで入れるか</strong>：併設加算の条件と工事の回数に関わる</li>
              </ol>
              <p>SOLAR SHIFT では、太陽光・蓄電池の計画と合わせて、HEMSを入れる意味があるかどうかを率直にお伝えします。</p>
            </>
          ),
        },
      ]}
      subsidies={subsidies}
      faq={faqsByIds(["hems-what", "subsidy-pre-consultation"])}
      related={[
        { href: "/subsidy/katsushika", label: "葛飾区の補助金", description: "HEMSと併設加算の条件" },
        { href: "/solar", label: "太陽光発電", description: "HEMSで効果を見える化" },
        { href: "/battery", label: "家庭用蓄電池", description: "制御の対象になる設備" },
        { href: "/guide/all-electric", label: "オール電化との相性", description: "エコキュートの制御と相性" },
        { href: "/simulation", label: "補助金シミュレーター", description: "HEMS込みで試算" },
        { href: "/flow", label: "導入までの流れ", description: "申請と工事の順番" },
      ]}
      relatedCategories={["energy-saving", "katsushika-subsidy"]}
      cta={{
        title: "HEMSを入れる意味があるかどうかも、率直にお伝えします。",
        body: "太陽光・蓄電池の計画と合わせて、制御したい機器と対応状況を確認し、必要な場合だけご提案します。相談・見積もりは無料です。",
      }}
    />
  );
}
