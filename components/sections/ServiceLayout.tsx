import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Subsidy } from "@/data/subsidies";
import type { SiteImage } from "@/data/images";
import { images } from "@/data/images";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeyPoints } from "@/components/ui/KeyPoints";
import { StaffTip } from "@/components/ui/StaffTip";
import { Toc } from "@/components/ui/Toc";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { BigNumbers } from "@/components/subsidy/BigNumbers";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { SourceList, type SourceItem } from "@/components/ui/SourceList";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { WorksCard } from "@/components/works/WorksCard";
import { WORK_BILL_NOTE, type Work } from "@/data/works";
import { getPostsForPillar } from "@/lib/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, serviceSchema, webPageSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";
import { reveal } from "@/lib/reveal";
import type { Crumb } from "@/lib/schema";

export interface ServiceSection {
  id: string;
  heading: string;
  body: ReactNode;
  /** 写真（cover）またはイラスト（contain）。SiteImage を渡してもよい */
  image?: { alt: string; label?: string; src?: string | null; fit?: "cover" | "contain" } | SiteImage;
  /** 画像の代わりに図解コンポーネントを置く（本文の下に全幅で出す） */
  figure?: ReactNode;
}

function isSiteImage(x: ServiceSection["image"]): x is SiteImage {
  return Boolean(x && "width" in x);
}

/**
 * サービスページ共通レイアウト（太陽光／蓄電池／太陽光＋蓄電池／V2H／HEMS）。
 * 構成：見出し → 結論 → 目次 → 本文セクション（写真・イラスト・図解つき） → 補助金 → FAQ → 出典 → 関連ページ → CTA
 */
export function ServiceLayout({
  path,
  crumbs,
  eyebrow,
  title,
  lead,
  heroImage,
  conclusion,
  points,
  tip,
  sections,
  subsidies,
  subsidyNote,
  faq,
  works,
  sources = [],
  related,
  relatedCategories,
  cta,
  updatedAt = siteConfig.contentUpdatedAt,
  pageName,
  description,
}: {
  path: string;
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  lead: string;
  heroImage?: SiteImage;
  conclusion: ReactNode;
  points: ReactNode[];
  /** 結論の下に出すスタッフの一言 */
  tip?: { title?: string; body: ReactNode; image?: SiteImage };
  sections: ServiceSection[];
  subsidies: Subsidy[];
  subsidyNote?: ReactNode;
  faq: { q: string; a: string; link?: { href: string; label: string } }[];
  /** 設備の種類が合う施工事例（label は「太陽光発電」のような設備の名前。見出しは「◯◯の施工事例」になる） */
  works?: { label: string; items: Work[] };
  sources?: SourceItem[];
  related: { href: string; label: string; description: string }[];
  relatedCategories: string[];
  cta: { title: string; body: string };
  updatedAt?: string;
  pageName: string;
  description: string;
}) {
  const posts = getPostsForPillar(relatedCategories, 3, { path });
  const headlineSubsidies = subsidies.filter((s) => s.rule && s.status === "open");
  const toc = [
    ...sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(subsidies.length > 0 ? [{ id: "subsidy", label: "関連する補助金" }] : []),
    ...(works && works.items.length > 0 ? [{ id: "works", label: `${works.label}の施工事例` }] : []),
    ...(faq.length > 0 ? [{ id: "faq", label: "よくある質問" }] : []),
  ];
  return (
    <>
      <PageHeader crumbs={crumbs} eyebrow={eyebrow} title={title} lead={lead} image={heroImage}>
        <LastUpdated updatedAt={updatedAt} className="mt-5" />
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <KeyPoints conclusion={conclusion} points={points} />
          {tip && (
            <StaffTip className="mt-8" title={tip.title} image={tip.image ?? images.poseIdea} tone="orange">
              {tip.body}
            </StaffTip>
          )}
          <Toc items={toc} className="mt-8" />
        </div>

        <div className="mt-16 space-y-16 sm:space-y-24">
          {sections.map((s, i) => {
            const img = s.image;
            const site = isSiteImage(img) ? img : null;
            const contain = site ? Boolean(site.decorative) : img && "fit" in img && img.fit === "contain";
            const flip = i % 2 === 1;
            return (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="cv-block scroll-mt-24">
                <div className={img ? `grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${flip ? "lg:[&>*:first-child]:order-2" : ""}` : "mx-auto max-w-4xl"}>
                  {img && (
                    <div className="relative" {...reveal(0, flip ? "right" : "left")}>
                      {contain ? (
                        <div className={`mx-auto flex max-w-sm items-center justify-center rounded-[2rem] p-6 ${site?.white ? "bg-white shadow-card" : flip ? "bg-green-50" : "bg-cream"}`}>
                          <Image
                            src={img.src ?? ""}
                            alt=""
                            width={site?.width ?? 400}
                            height={site?.height ?? 400}
                            sizes="320px"
                            className="h-auto animate-float-slow"
                            style={{ width: `min(100%, ${((18 * (site?.width ?? 400)) / (site?.height ?? 400)).toFixed(2)}rem)` }}
                          />
                        </div>
                      ) : (
                        <>
                          <span className={`absolute -bottom-3 h-full w-full rounded-[2rem] ${flip ? "-right-3 bg-green-200" : "-left-3 bg-orange-200"}`} aria-hidden="true" />
                          <div className="relative overflow-hidden rounded-[2rem] shadow-card">
                            {img.src ? (
                              <Image src={img.src} alt={img.alt} width={site?.width ?? 1600} height={site?.height ?? 900} sizes="(max-width: 1023px) 100vw, 50vw" quality={60} className="aspect-[4/3] h-auto w-full object-cover" />
                            ) : (
                              <div className="flex aspect-[4/3] items-center justify-center bg-paper-3 text-[12px] font-bold text-ink-3" role="img" aria-label={img.alt}>
                                写真（差し替え）
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div {...reveal(img ? 120 : 0)}>
                    <p className="flex items-baseline gap-1 font-en font-bold text-green-700">
                      <span className="text-[13px] tracking-[0.14em]">POINT</span>
                      <span className="text-[30px] leading-none">{String(i + 1).padStart(2, "0")}</span>
                    </p>
                    <h2 id={`${s.id}-h`} className="mt-2 text-[24px] leading-[1.45] font-black text-navy-900 sm:text-[30px]">
                      {s.heading}
                    </h2>
                    <div className="prose-ss mt-5">{s.body}</div>
                  </div>
                </div>
                {s.figure && <div className="mx-auto mt-8 max-w-4xl">{s.figure}</div>}
              </section>
            );
          })}
        </div>
      </Container>

      {subsidies.length > 0 && (
        <section id="subsidy" className="cv-auto scroll-mt-24 bg-cream py-14 sm:py-20" aria-labelledby="subsidy-h">
          <Container>
            <h2 id="subsidy-h" className="text-center text-[24px] font-black text-navy-900 sm:text-[30px]" {...reveal()}>
              関連する<span className="marker">補助金</span>
              <span className="mt-1 block text-[14px] font-bold text-ink-2">{siteConfig.subsidyInfoDate.replace(/-/g, "/")} 時点の公式情報</span>
            </h2>
            {subsidyNote && <div className="mx-auto mt-4 max-w-3xl text-center text-base leading-[1.9] text-ink-2">{subsidyNote}</div>}
            {headlineSubsidies.length > 0 && (
              <BigNumbers
                className="mt-8"
                columns={headlineSubsidies.length % 3 === 0 || headlineSubsidies.length > 4 ? 3 : 2}
                items={headlineSubsidies.map((s) => ({ subsidy: s, label: `${s.areaLabel}｜${s.name}` }))}
              />
            )}
            <div className="mt-8">
              <SubsidyTable menus={subsidies} showArea />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="/simulation" variant="green" size="lg">
                わが家の想定助成額を試算する <ArrowIcon />
              </LinkButton>
              <LinkButton href="/subsidy" variant="secondary" size="lg">
                補助金の総合ページ
              </LinkButton>
            </div>
            <SubsidyDisclaimer className="mt-8" />
          </Container>
        </section>
      )}

      <Container className="py-14 sm:py-20">
        {works && works.items.length > 0 && (
          <section id="works" aria-labelledby="works-h" className="cv-block mb-16 scroll-mt-24">
            <h2 id="works-h" className="text-center text-[24px] font-black text-navy-900 sm:text-[30px]" {...reveal()}>
              {works.label}の<span className="marker">施工事例</span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-[1.9] text-ink-2">掲載の許可をいただいたお客様の事例です。お名前はイニシャル、地域は市区までの掲載です。</p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {works.items.map((w, i) => (
                <li key={w.slug} {...reveal(i * 90)}>
                  <WorksCard work={w} />
                </li>
              ))}
            </ul>
            <p className="mx-auto mt-4 max-w-4xl text-[13px] leading-[1.8] text-ink-2">※ {WORK_BILL_NOTE}</p>
            <div className="mt-6 flex justify-center">
              <LinkButton href="/works" variant="secondary">
                施工事例をすべて見る <ArrowIcon />
              </LinkButton>
            </div>
          </section>
        )}

        {faq.length > 0 && (
          <section id="faq" aria-labelledby="faq-h" className="cv-block mx-auto max-w-4xl scroll-mt-24">
            <h2 id="faq-h" className="text-center text-[24px] font-black text-navy-900 sm:text-[30px]" {...reveal()}>
              よくある<span className="marker">質問</span>
            </h2>
            <FaqSection items={faq} withSchema className="mt-8" />
          </section>
        )}

        {sources.length > 0 && <SourceList sources={sources} className="mx-auto mt-12 max-w-4xl" />}

        <section className="cv-block mt-14" aria-label="関連ページ">
          <h2 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">あわせて読みたい</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <li key={r.href} {...reveal((i % 3) * 70)}>
                <Link href={r.href} className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-card hover:border-orange-400">
                  <span className="flex-1">
                    <span className="block text-[15px] font-bold text-navy-900">{r.label}</span>
                    <span className="mt-0.5 block text-[13px] leading-[1.6] text-ink-2">{r.description}</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-navy-900">
                    <ArrowIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="このテーマの最新記事" />
        </Container>
      )}

      <CtaSection title={cta.title} body={cta.body} />
      <JsonLd
        data={graph(
          webPageSchema({ path, mainEntity: "service", name: pageName, description, dateModified: updatedAt, sources: sources.map((s) => ({ name: s.name, url: s.url })) }),
          serviceSchema({ path, name: pageName, description, serviceType: pageName }),
        )}
      />
    </>
  );
}
