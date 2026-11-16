import Link from "next/link";
import { zehPrograms } from "@/data/subsidies/zeh";
import { formatDateJa } from "@/lib/seo";
import { reveal } from "@/lib/reveal";
import { SourceNote } from "@/components/ui/SourceNote";

const H2 = "border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900 sm:text-[28px]";
const LEVEL_STYLE: Record<string, string> = {
  葛飾区: "bg-orange-500 text-navy-900",
  東京都: "bg-green-600 text-white",
  国: "bg-navy-900 text-white",
};

/**
 * 葛飾区で家を新築して ZEH・高断熱にするときの補助金（区・都・国）。中身は data/subsidies/zeh.ts。
 * 検索：「zeh 補助金 葛飾区」「zeh 補助金申請 葛飾区」。区の制度は建てたあとに申請し、都と国は設計の段階から建築会社と進める、を先に答える。
 * 金額は制度ごとに示し、合算しない。
 */
export function ZehSection({ className = "" }: { className?: string }) {
  const verifiedAt = zehPrograms.map((z) => z.lastVerified).sort()[0];
  const allSources = Array.from(new Map(zehPrograms.flatMap((z) => z.sources).map((s) => [s.url, s])).values());
  return (
    <section id="zeh" aria-labelledby="zeh-h" className={`cv-block scroll-mt-24 ${className}`}>
      <h2 id="zeh-h" className={H2} {...reveal()}>
        ZEHの補助金：葛飾区で家を新築する場合
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-[1.9] text-ink">
        葛飾区で家を新築して ZEH（ネット・ゼロ・エネルギー・ハウス）や高断熱の家にする場合、区・東京都・国にそれぞれ補助金があります。
        <strong className="marker">区の「高断熱住宅」は、建物の引き渡しのあとに申請</strong>します（ZEHなら30万円の加算）。東京都と国の制度は、設計の段階から建築会社と進める必要があります。
      </p>
      <ul className="mt-6 grid gap-4 lg:grid-cols-2">
        {zehPrograms.map((z, i) => (
          <li key={z.id} className="flex flex-col rounded-3xl border-2 border-line bg-white p-5 shadow-card sm:p-6" {...reveal(i * 70)}>
            <p className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-[3px] text-[13px] font-bold ${LEVEL_STYLE[z.level]}`}>{z.level}</span>
              <span className="text-[17px] leading-[1.5] font-black text-navy-900">{z.name}</span>
            </p>
            <p className="mt-3 text-[14px] leading-[1.8] text-ink-2">
              <span className="font-bold text-navy-900">対象：</span>
              {z.target}
            </p>
            <ul className="mt-3 space-y-1 rounded-2xl bg-cream/70 px-4 py-3 text-[15px] leading-[1.7] font-bold text-navy-900">
              {z.amounts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="mt-3 text-[14px] font-bold text-navy-900">申請のしかた・時期</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[14px] leading-[1.8] text-ink marker:text-orange-600">
              {z.howToApply.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {z.notes.length > 0 && (
              <ul className="mt-3 space-y-1 text-[13px] leading-[1.8] text-ink-2">
                {z.notes.map((n) => (
                  <li key={n}>※ {n}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-3xl text-base leading-[1.9] text-ink-2">
        太陽光・蓄電池が付いた建売住宅を買う場合は、上の「高断熱住宅」とは別に、太陽光・蓄電池などの区の助成で、建物の引き渡しの4週間前までに事前協議の申し込みが必要です。詳しくは
        <Link href="/blog/katsushika-subsidy-new-build-with-solar" className="mx-1 inline-block py-1 font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
          太陽光付きの建売住宅と、区の助成
        </Link>
        で説明しています。
      </p>
      <SourceNote sources={allSources} className="mt-4" />
      <p className="mt-2 text-[13px] leading-[1.8] text-ink-3">
        {formatDateJa(verifiedAt)}に、各制度の公式ページ・公式資料で確認しました。受付の状況・予算の残りは変わります。申請の前に、公式の情報で最新の内容をご確認ください。
      </p>
    </section>
  );
}
