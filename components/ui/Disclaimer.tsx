import { siteConfig } from "@/lib/site";
import { formatDateJa } from "@/lib/seo";

/**
 * 補助金・費用情報の免責。補助金に触れる全ページで使う。
 * 基準日は siteConfig.subsidyInfoDate（制度更新時に data/subsidies と一緒に更新する）。
 */
export function SubsidyDisclaimer({ className = "", dateOverride }: { className?: string; dateOverride?: string }) {
  const date = dateOverride ?? siteConfig.subsidyInfoDate;
  return (
    <div className={`border border-line bg-paper-2 px-5 py-4 text-[13px] leading-[1.8] text-ink-2 ${className}`}>
      <p className="font-bold text-ink">補助金情報についてのご注意（{formatDateJa(date)}時点）</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>当ページの補助金・助成金の情報は {formatDateJa(date)} 時点で各自治体・団体の公式情報を確認して掲載しています。制度は予告なく変更・終了される場合があります。</li>
        <li>実際の対象可否・助成額は、住宅の条件、導入する機器、申請時期、予算の状況などにより異なります。必ず補助金が交付されることを保証するものではありません。</li>
        <li>複数の制度の併用可否は、公式情報で確認できたもの以外は断定していません。申請前に各制度の窓口へご確認ください。</li>
        <li>最新情報は必ず葛飾区・東京都（クール・ネット東京）・国の公式サイトをご確認ください。</li>
      </ul>
    </div>
  );
}
