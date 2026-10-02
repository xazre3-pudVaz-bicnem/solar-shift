import { siteConfig } from "@/lib/site";
import { formatDateJa } from "@/lib/seo";

/**
 * 補助金・費用情報の免責。補助金に触れる全ページで使う。
 * 基準日は siteConfig.subsidyInfoDate（制度更新時に data/subsidies と一緒に更新する）。
 */
export function SubsidyDisclaimer({ className = "", dateOverride }: { className?: string; dateOverride?: string }) {
  const date = dateOverride ?? siteConfig.subsidyInfoDate;
  return (
    <div className={`rounded-md border border-l-4 border-line border-l-navy-900 bg-white px-5 py-4 text-left text-[13px] leading-[1.8] text-ink-2 ${className}`}>
      <p className="text-[14px] font-bold text-navy-900">補助金情報についてのご注意（{formatDateJa(date)}時点）</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-orange-600">
        <li>当ページの補助金・助成金の情報は {formatDateJa(date)} 時点で各自治体・団体の公式情報を確認して掲載しています。制度は予告なく変更・終了される場合があります。</li>
        <li>実際の対象可否・助成額は、住宅の条件、導入する機器、申請時期、予算の状況などにより異なります。必ず補助金が交付されることを保証するものではありません。</li>
        <li>複数の制度の併用は、公式資料で確認できた範囲で記載しています。併用できる場合も、補助金の合計は助成対象経費が上限です。</li>
        <li>最新情報は必ず葛飾区・東京都（クール・ネット東京）・国の公式サイトをご確認ください。</li>
      </ul>
    </div>
  );
}
