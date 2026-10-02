import { siteConfig } from "@/lib/site";
import { DefinitionList } from "@/components/ui/DefinitionList";

/**
 * 施工体制・保証・保険・資格など、信頼性に関わる情報の一覧。
 * lib/site.ts の trust に記入された項目だけを出す（証憑を確認できたものだけを記入する決まり）。
 * 何も記入されていない間は、主張を一切せず、「確認できた内容から掲載する」ことだけを伝える。
 */
const LABELS: { key: keyof typeof siteConfig.trust; label: string }[] = [
  { key: "construction", label: "施工体制" },
  { key: "contractor", label: "施工会社" },
  { key: "licenses", label: "許認可・登録" },
  { key: "qualifications", label: "有資格者" },
  { key: "manufacturerCertifications", label: "メーカーの施工ID・認定" },
  { key: "warranty", label: "保証" },
  { key: "insurance", label: "工事保険" },
  { key: "afterSupport", label: "導入後のサポート" },
];

export function trustRows(): { term: string; description: string }[] {
  return LABELS.map(({ key, label }) => ({ term: label, description: siteConfig.trust[key] })).filter((r): r is { term: string; description: string } => Boolean(r.description));
}

export function TrustFacts({ className = "", showEmptyNote = false }: { className?: string; showEmptyNote?: boolean }) {
  const rows = trustRows();
  if (rows.length === 0) {
    if (!showEmptyNote) return null;
    return (
      <p className={`text-base leading-[1.9] text-ink-2 ${className}`}>
        施工体制、保証、工事保険、資格などの情報は、書面で確認できた内容から、このページに掲載します。現時点で掲載できる内容はありません。ご検討の際は、お見積もりのときに、保証書や契約書の内容を書面でご確認ください。
      </p>
    );
  }
  return <DefinitionList rows={rows} className={className} />;
}
