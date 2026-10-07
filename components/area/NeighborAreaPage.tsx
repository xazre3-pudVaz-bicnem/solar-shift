import Link from "next/link";
import type { Area } from "@/data/areas";
import { areas } from "@/data/areas";
import { wardPrograms, type WardProgram } from "@/data/ward-programs";
import { getSubsidy, subsidySources } from "@/data/subsidies";
import { KATSUSHIKA_PRE_CONSULTATION_WEEKS } from "@/data/subsidies/katsushika-details";
import { worksInCity } from "@/data/works";
import { images } from "@/data/images";
import { siteConfig } from "@/lib/site";
import { formatDateJa } from "@/lib/seo";
import { reveal } from "@/lib/reveal";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { Toc } from "@/components/ui/Toc";
import { TableScroll } from "@/components/ui/TableScroll";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { Callout } from "@/components/ui/Callout";
import { StaffTip } from "@/components/ui/StaffTip";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList } from "@/components/ui/SourceList";
import { SourceNote } from "@/components/ui/SourceNote";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { BigNumbers } from "@/components/subsidy/BigNumbers";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { WorksCard } from "@/components/works/WorksCard";
import { ApplyOrderFigure } from "@/components/area/ApplyOrderFigure";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, serviceSchema, webPageSchema, wardIncentiveSchema } from "@/lib/schema";

/**
 * 周辺の対応エリア（足立区・墨田区・江戸川区）のページ。
 * 検索意図：「足立区 太陽光 補助金」「墨田区 太陽光 補助金」「江戸川区 太陽光 補助金」
 * ＝ 自分の区に補助金があるか、いくらか、いつ申請するかを知りたい。
 *
 * - 区の制度は、区ごとにまったく違う（申請の時期・金額・対象）。内容は data/ward-programs.ts にあるものだけを出す。
 *   葛飾区の説明を、ほかの区に当てはめて書かない。
 * - 金額は合算しない。区の制度と東京都の制度は、別々に示す。
 * - SOLAR SHIFT について書くのは、確認できていること（拠点・対応エリア・相談と現地調査が無料）だけ。
 */
const H2 = "border-l-[8px] border-orange-500 pl-3 text-[24px] leading-[1.35] font-black text-navy-900 sm:text-[28px]";
const LEAD = "mt-4 max-w-3xl text-base leading-[1.9] text-ink-2";
const TEXT_LINK = "font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text";

export interface WardCompareRow {
  slug: string;
  name: string;
  timing: string;
  solar: string;
  battery: string;
  /** 太陽光・蓄電池そのものの補助が無い区は、3つの列をまとめて1文で示す */
  note?: string;
}

/** 4つの区の、申請の時期と金額の早見表（葛飾区はデータから、ほかの区は ward-programs から） */
export function wardCompareRows(): WardCompareRow[] {
  const ks = getSubsidy("katsushika-solar")!;
  const kb = getSubsidy("katsushika-battery")!;
  return [
    {
      slug: "katsushika",
      name: "葛飾区",
      timing: `工事着工の${KATSUSHIKA_PRE_CONSULTATION_WEEKS}週間前までに事前協議`,
      solar: `${ks.amount}・${ks.maxAmount}`,
      battery: `${kb.amount}・${kb.maxAmount}`,
    },
    ...wardPrograms.map((w) => {
      const area = areas.find((a) => a.slug === w.slug)!;
      const solar = w.items.find((i) => i.equipment.startsWith("太陽光"));
      const battery = w.items.find((i) => i.equipment.includes("蓄電") && !i.equipment.includes("ポータブル"));
      return {
        slug: w.slug,
        name: area.name,
        timing: w.timingLabel,
        solar: solar ? `${solar.amount.replace(/（.*?）/g, "")}・${solar.cap}` : "",
        battery: battery ? `${battery.amount.startsWith("区のページ") ? "" : `${battery.amount}・`}${battery.cap}` : "",
        note: w.hasSolarBatterySubsidy ? undefined : w.points.slice(0, 2).join("。"),
      };
    }),
  ];
}

/** 区ごとの補助金の早見表。current を渡すと、その区の行を目立たせ、ほかの区の名前をリンクにする */
export function WardCompareTable({ current, className = "" }: { current?: string; className?: string }) {
  const rows = wardCompareRows();
  return (
    <TableScroll className={className} label="区ごとの補助金の違い" hintBelow="md">
      <table className="w-full min-w-[40rem] border-collapse text-[14px] sm:text-[15px]">
        <caption className="sr-only">葛飾区・足立区・墨田区・江戸川区の、太陽光発電と蓄電池の補助金の違い</caption>
        <thead>
          <tr className="bg-green-600 text-left text-white">
            <th scope="col" className="border border-green-700 px-3 py-2.5">区</th>
            <th scope="col" className="w-[30%] border border-green-700 px-3 py-2.5">申請の時期</th>
            <th scope="col" className="border border-green-700 px-3 py-2.5">太陽光発電</th>
            <th scope="col" className="w-[24%] border border-green-700 px-3 py-2.5">蓄電池</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isCurrent = r.slug === current;
            return (
              <tr key={r.slug} className={isCurrent ? "bg-orange-50" : "bg-white"}>
                <th scope="row" className={`border border-line px-3 py-2.5 text-left font-bold whitespace-nowrap text-navy-900 ${isCurrent ? "bg-orange-100" : "bg-cream/70"}`}>
                  {isCurrent ? (
                    r.name
                  ) : (
                    <Link href={r.slug === "katsushika" ? "/subsidy/katsushika" : `/area/${r.slug}`} className="inline-flex min-h-11 items-center underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text">
                      {r.name}
                    </Link>
                  )}
                </th>
                {r.note ? (
                  <td colSpan={3} className="border border-line px-3 py-2.5">
                    {r.note}
                  </td>
                ) : (
                  <>
                    <td className="border border-line px-3 py-2.5">{r.timing}</td>
                    <td className="border border-line px-3 py-2.5">{r.solar}</td>
                    <td className="border border-line px-3 py-2.5">{r.battery}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}

export function NeighborAreaPage({ area, program: w }: { area: Area; program: WardProgram }) {
  const path = `/area/${area.slug}`;
  const c = siteConfig.company;
  const verifiedAt = w.sources[0].verifiedAt;
  const cityWorks = worksInCity(area.name);
  const tokyoSolarExisting = getSubsidy("tokyo-solar-existing")!;
  const tokyoSolarNew = getSubsidy("tokyo-solar-new")!;
  const tokyoBattery = getSubsidy("tokyo-battery")!;
  const others = wardPrograms.filter((x) => x.slug !== w.slug).map((x) => areas.find((a) => a.slug === x.slug)!);

  const toc = [
    { id: "program", label: `${area.name}の補助金の要点` },
    { id: "compare", label: "葛飾区・周辺の区との違い" },
    { id: "tokyo", label: "東京都の助成" },
    { id: "caution", label: `${area.name}が知らせている注意` },
    { id: "solarshift", label: "SOLAR SHIFT に相談する場合" },
    ...(cityWorks.length > 0 ? [{ id: "works", label: `${area.name}の施工事例` }] : []),
    { id: "faq", label: "よくある質問" },
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "対応エリア", href: "/area" },
          { name: `${area.name}の太陽光・蓄電池の補助金`, href: path },
        ]}
        eyebrow={`${area.prefecture}${area.name}｜周辺対応エリア`}
        title={
          <>
            {area.name}の太陽光発電・蓄電池の補助金
            <span className="mt-1 block text-[0.62em] leading-[1.5] text-ink-2">
              {w.fiscalYear}の区の制度と、申請の時期。SOLAR SHIFT の対応
            </span>
          </>
        }
        lead={`${area.name}の住宅で、太陽光発電・蓄電池を検討している方へ。区の補助金は、葛飾区とは金額も申請の時期も違います。${area.name}の公式ページで確かめた内容を、確認した日付とともにまとめました。`}
        image={images.peopleCoupleClipboard}
      >
        <LastUpdated updatedAt={verifiedAt} verifiedAt={verifiedAt} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <KeyPoints conclusion={w.conclusion} points={w.points} />
          <StaffTip
            className="mt-8"
            title={w.hasSolarBatterySubsidy ? `${area.name}は、${w.timingLabel}します` : `${area.name}の、${w.timingLabel}しています`}
            image={images.poseIdea}
            tone="orange"
          >
            {w.timing}
          </StaffTip>
          <Toc items={toc} className="mt-8" />
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-16 sm:mt-16 sm:space-y-20">
          {/* ───────── 区の補助金 */}
          <section id="program" aria-labelledby="program-h" className="scroll-mt-24">
            <h2 id="program-h" className={H2}>
              {area.name}の補助金の要点（{w.fiscalYear}）
            </h2>
            <p className={LEAD}>
              制度の名前は「{w.programName}」です。{formatDateJa(verifiedAt)}に、{area.name}の公式ページで確認しました（区のページの更新日は{formatDateJa(w.pageUpdatedAt)}）。
            </p>
            <TableScroll className="mt-6" label={`${area.name}の補助金の一覧`} hintBelow="md">
              <table className="w-full min-w-[40rem] border-collapse text-[14px] sm:text-[15px]">
                <caption className="sr-only">
                  {area.name}の補助金（{w.fiscalYear}）の対象・金額・上限
                </caption>
                <thead>
                  <tr className="bg-green-600 text-left text-white">
                    <th scope="col" className="w-[10.5rem] border border-green-700 px-3 py-2.5">対象</th>
                    <th scope="col" className="border border-green-700 px-3 py-2.5">金額の決まり方</th>
                    <th scope="col" className="border border-green-700 px-3 py-2.5 whitespace-nowrap">上限など</th>
                    <th scope="col" className="border border-green-700 px-3 py-2.5">対象になる機器の条件</th>
                  </tr>
                </thead>
                <tbody>
                  {w.items.map((it, i) => (
                    <tr key={it.equipment} className={i % 2 ? "bg-green-50/60" : "bg-white"}>
                      <th scope="row" className="border border-line bg-cream/70 px-3 py-2.5 text-left font-bold text-navy-900">{it.equipment}</th>
                      <td className="border border-line px-3 py-2.5">{it.amount}</td>
                      <td className={`border border-line px-3 py-2.5 font-bold text-accent-text ${it.cap.length <= 12 ? "whitespace-nowrap" : "min-w-[14rem]"}`}>{it.cap}</td>
                      <td className="border border-line px-3 py-2.5 text-[13px] text-ink-2">{it.requirement ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">受付の期間</h3>
                <DefinitionList className="mt-4" rows={w.schedule.map((s) => ({ term: s.label, description: s.value }))} />
              </div>
              <div>
                <h3 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">主な条件</h3>
                <ul className="mt-4 space-y-2 text-base leading-[1.8] text-ink">
                  {w.conditions.map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-[7px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white" aria-hidden="true">
                        <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
                          <path d="m3 6 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Callout tone="important" title="国・東京都の制度との関係" className="mt-8">
              <p>{w.combination}</p>
            </Callout>
            <p className="mt-4 text-[13px] leading-[1.8] text-ink-3">
              出典：
              <a href={w.sources[0].url} target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-4 hover:text-accent-text">
                {w.sources[0].name}
              </a>
              （{formatDateJa(verifiedAt)} 確認）。受付の状況や予算の残りは変わります。申請の前に、{area.name}の公式ページで最新の内容をご確認ください。窓口は{w.contact.name}
              {w.contact.tel ? `（${w.contact.tel}）` : ""}です。
            </p>
          </section>

          {/* ───────── 区ごとの違い */}
          <section id="compare" aria-labelledby="compare-h" className="cv-block scroll-mt-24">
            <h2 id="compare-h" className={H2} {...reveal()}>
              葛飾区・周辺の区との違い
            </h2>
            <p className={LEAD}>区の補助金は、区ごとに申請の時期と金額が違います。SOLAR SHIFT が対応している4つの区を並べました。金額は合算せず、区ごとに見てください。</p>
            {w.order && <ApplyOrderFigure only={w.slug} className="mt-6" />}
            <WardCompareTable current={w.slug} className="mt-6" />
            <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">
              ※ {formatDateJa(verifiedAt)}に、各区の公式ページで確認した内容です。条件の詳細と最新の受付状況は、各区の公式ページでご確認ください。葛飾区の制度は
              <Link href="/subsidy/katsushika" className="mx-1 inline-block py-1 text-navy-600 underline underline-offset-4">
                葛飾区の補助金のページ
              </Link>
              にまとめています。
            </p>
          </section>

          {/* ───────── 東京都の助成 */}
          <section id="tokyo" aria-labelledby="tokyo-h" className="cv-block scroll-mt-24">
            <h2 id="tokyo-h" className={H2} {...reveal()}>
              {area.name}の住宅でも検討できる、東京都の助成
            </h2>
            <p className={LEAD}>
              東京都（クール・ネット東京）の家庭向けの助成は、都内の住宅が対象です。区の制度とは別の制度で、金額は合算しません。条件と申請の順番は、東京都の補助金のページにまとめています。
            </p>
            <BigNumbers
              className="mt-8"
              tone="green"
              items={[
                { subsidy: tokyoSolarExisting, label: "太陽光（既存住宅）", icon: images.iconGSunPanelLeaf },
                { subsidy: tokyoSolarNew, label: "太陽光（新築住宅）", icon: images.iconGHouseYenLeaf },
                { subsidy: tokyoBattery, label: "蓄電池", icon: images.iconGHouseBattery2 },
              ]}
            />
            <SourceNote sources={subsidySources([tokyoSolarExisting, tokyoSolarNew, tokyoBattery])} className="mt-3" />
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/subsidy/tokyo" variant="primary">
                東京都の補助金を詳しく見る <ArrowIcon />
              </LinkButton>
              <LinkButton href="/subsidy" variant="ghost">
                区・都・国の制度の整理
              </LinkButton>
            </div>
            <SubsidyDisclaimer className="mt-8" />
          </section>

          {/* ───────── 区が知らせている注意 */}
          <section id="caution" aria-labelledby="caution-h" className="cv-block scroll-mt-24">
            <h2 id="caution-h" className={H2} {...reveal()}>
              {area.name}が知らせている注意
            </h2>
            <Callout tone="warn" title={`${area.name}の公式ページにある内容`} className="mt-6 max-w-3xl">
              <ul className="list-disc space-y-2 pl-5 marker:text-orange-600">
                {w.cautions.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Callout>
            <p className="mt-4 max-w-3xl text-base leading-[1.9] text-ink-2">
              業者を選ぶときに確かめる点は、
              <Link href="/area/katsushika#checkpoints" className={`mx-1 inline-block py-1 ${TEXT_LINK}`}>
                業者を選ぶときに確かめること
              </Link>
              にまとめています。
            </p>
          </section>

          {/* ───────── SOLAR SHIFT の対応 */}
          <section id="solarshift" aria-labelledby="solarshift-h" className="cv-block scroll-mt-24">
            <h2 id="solarshift-h" className={H2} {...reveal()}>
              {area.name}で、SOLAR SHIFT に相談する場合
            </h2>
            <p className={LEAD}>
              {area.name}は、SOLAR SHIFT の周辺対応エリアです。拠点は{c.address.city}
              {c.address.town}にあります。現地調査とお見積もりは無料です。
            </p>
            <ul className="mt-6 max-w-3xl space-y-3">
              {w.notes.map((x, i) => (
                <li key={x} className="flex gap-3 rounded-2xl bg-beige px-4 py-3 text-base leading-[1.85] text-ink" {...reveal(i * 70)}>
                  <span className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 font-en text-[13px] font-extrabold text-navy-900" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <DefinitionList
              className="mt-8 max-w-3xl"
              rows={[
                { term: "運営会社", description: c.name },
                { term: "拠点", description: c.address.locality },
                { term: "対応内容", description: "住宅用太陽光発電・家庭用蓄電池・V2H・HEMSの導入と、補助金のご相談" },
                { term: "現地調査・お見積もり", description: "無料" },
              ]}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/contact" variant="accent">
                無料相談・お見積もりを依頼する <ArrowIcon />
              </LinkButton>
              <LinkButton href="/flow" variant="secondary">
                導入の流れを見る
              </LinkButton>
            </div>
          </section>

          {/* ───────── この区の施工事例 */}
          {cityWorks.length > 0 && (
            <section id="works" aria-labelledby="works-h" className="cv-block scroll-mt-24">
              <h2 id="works-h" className={H2} {...reveal()}>
                {area.name}の施工事例
              </h2>
              <p className={LEAD}>掲載の許可をいただいた事例です。お名前はイニシャル、地域は市区までの掲載です。</p>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cityWorks.map((x, i) => (
                  <li key={x.slug} {...reveal(i * 90)}>
                    <WorksCard work={x} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ───────── FAQ */}
          <section id="faq" aria-labelledby="faq-h" className="cv-block scroll-mt-24">
            <h2 id="faq-h" className={H2} {...reveal()}>
              {area.name}の補助金について、よくある質問
            </h2>
            <FaqSection items={w.faq} withSchema className="mt-6" />
          </section>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <SourceList sources={w.sources} />
          <div className="mt-8">
            <AuthorBox />
          </div>
          <nav className="mt-10" aria-label="関連ページ">
            <h2 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">あわせて読みたい</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ...others.map((a) => ({ href: `/area/${a.slug}`, label: `${a.name}の補助金`, description: "区の制度と、申請の時期" })),
                { href: "/area/katsushika", label: "葛飾区の太陽光・蓄電池業者", description: "拠点のある区の、対応エリアと相談の進め方" },
                { href: "/simulation", label: "補助金シミュレーション", description: "葛飾区と東京都の助成額を試算する" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group flex h-full min-h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-orange-400">
                    <span className="flex-1">
                      <span className="block text-base font-bold text-navy-900">{l.label}</span>
                      <span className="mt-0.5 block text-[13px] leading-[1.6] text-ink-2">{l.description}</span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-navy-900">
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>

      <CtaSection
        title={`${area.name}の補助金と、東京都の助成。申請の順番から整理します。`}
        body={`${area.name}の制度は、葛飾区とは申請の時期が違います。住宅の条件と導入する設備を伺い、使える制度と手続きの順番を整理してお伝えします。現地調査・お見積もりは無料です。`}
      />

      <JsonLd
        data={graph(
          webPageSchema({
            path,
            mainEntity: "service",
            name: w.title,
            description: w.description,
            dateModified: verifiedAt,
            lastReviewed: verifiedAt,
            sources: w.sources.map((s) => ({ name: s.name, url: s.url })),
          }),
          serviceSchema({ path, areaNames: [area.name], name: `${area.name}の太陽光発電・蓄電池の導入`, description: w.description, serviceType: "住宅用太陽光発電・家庭用蓄電池の導入" }),
          // 区の制度のメニュー（区の公式ページで確かめた内容だけ）
          ...w.items.map((it, i) =>
            wardIncentiveSchema({
              pagePath: path,
              key: `incentive-${i + 1}`,
              programName: w.programName,
              itemName: it.equipment,
              description: `${it.amount}（${it.cap}）`,
              wardName: area.name,
              wikidata: area.wikidata,
              sourceUrl: w.sources[0].url,
            }),
          ),
        )}
      />
    </>
  );
}
