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

const H2 = "border-l-[5px] border-orange-500 pl-3 text-[24px] leading-[1.45] font-black text-navy-900 sm:text-[28px]";

/**
 * サービスページ共通レイアウト（太陽光／蓄電池／太陽光＋蓄電池／V2H／HEMS）。
 * 構成：見出し → 結論 → 目次 → 本文セクション → 補助金 → FAQ → 出典 → 関連ページ → CTA
 *
 * 本文セクションの画像の扱い
 *   - 写真 … 本文の右（スマホでは見出しの下）に、控えめな大きさで置く。色つきの飾り枠は付けない
 *   - イラスト・アイコン … 写真と並べると印象がばらつくので、小さく添えるだけにする（スマホでは出さない）
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
  sources = [],
  related,
  relatedCategories,
  cta,
  updatedAt = siteConfig.subsidyInfoDate,
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
  sources?: SourceItem[];
  related: { href: string; label: string; description: string }[];
  relatedCategories: string[];
  cta: { title: string; body: string };
  updatedAt?: string;
  pageName: string;
  description: string;
}) {
  const posts = getPostsForPillar(relatedCategories, 3);
  const headlineSubsidies = subsidies.filter((s) => s.rule && s.status === "open");
  const toc = [
    ...sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(subsidies.length > 0 ? [{ id: "subsidy", label: "関連する補助金" }] : []),
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
            <StaffTip className="mt-8" title={tip.title} image={tip.image ?? images.poseIdea}>
              {tip.body}
            </StaffTip>
          )}
          <Toc items={toc} className="mt-8" />
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-14 sm:mt-16 sm:space-y-20">
          {sections.map((s) => {
            const img = s.image;
            const site = isSiteImage(img) ? img : null;
            const contain = site ? Boolean(site.decorative) : img && "fit" in img && img.fit === "contain";
            const photo = img && !contain;
            return (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="cv-block scroll-mt-24">
                <h2 id={`${s.id}-h`} className={H2} {...reveal()}>
                  {s.heading}
                </h2>
                <div className={`mt-6 ${photo ? "grid items-start gap-7 lg:grid-cols-[1fr_22rem] lg:gap-12" : contain ? "grid items-start gap-7 lg:grid-cols-[1fr_9rem] lg:gap-10" : ""}`}>
                  <div className={`prose-ss ${photo ? "order-2 lg:order-1" : ""}`} {...reveal(60)}>
                    {s.body}
                  </div>
                  {photo && (
                    <div className="order-1 overflow-hidden rounded-xl lg:order-2" {...reveal(100)}>
                      {img.src ? (
                        <Image src={img.src} alt={img.alt} width={site?.width ?? 1600} height={site?.height ?? 900} sizes="(max-width: 1023px) 100vw, 352px" quality={60} className="aspect-[16/10] h-auto w-full object-cover lg:aspect-[4/3]" />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center bg-paper-3 text-[12px] font-bold text-ink-3" role="img" aria-label={img.alt}>
                          写真（差し替え）
                        </div>
                      )}
                    </div>
                  )}
                  {contain && img && (
                    <div className={`hidden lg:block ${site?.white ? "rounded-xl border border-line bg-white p-3" : ""}`}>
                      <Image src={img.src ?? ""} alt="" width={site?.width ?? 400} height={site?.height ?? 400} sizes="144px" className="h-auto w-full" />
                    </div>
                  )}
                </div>
                {s.figure && <div className="mt-8">{s.figure}</div>}
              </section>
            );
          })}
        </div>
      </Container>

      {subsidies.length > 0 && (
        <section id="subsidy" className="cv-auto scroll-mt-24 border-y border-line bg-paper-2 py-14 sm:py-20" aria-labelledby="subsidy-h">
          <Container>
            <div className="mx-auto max-w-5xl">
              <h2 id="subsidy-h" className={H2} {...reveal()}>
                関連する補助金
                <span className="mt-1 block text-[14px] font-bold text-ink-2">{siteConfig.subsidyInfoDate.replace(/-/g, "/")} 時点の公式情報</span>
              </h2>
              {subsidyNote && <div className="mt-4 max-w-3xl text-base leading-[1.9] text-ink-2">{subsidyNote}</div>}
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
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/simulation" variant="primary" size="lg">
                  わが家の想定助成額を試算する <ArrowIcon />
                </LinkButton>
                <LinkButton href="/subsidy" variant="secondary" size="lg">
                  補助金の総合ページ
                </LinkButton>
              </div>
              <SubsidyDisclaimer className="mt-8" />
            </div>
          </Container>
        </section>
      )}

      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          {faq.length > 0 && (
            <section id="faq" aria-labelledby="faq-h" className="cv-block scroll-mt-24">
              <h2 id="faq-h" className={H2} {...reveal()}>
                よくある質問
              </h2>
              <FaqSection items={faq} withSchema className="mt-6" />
            </section>
          )}

          {sources.length > 0 && <SourceList sources={sources} className="mt-12" />}

          <section className="cv-block mt-14" aria-label="関連ページ">
            <h2 className="text-[20px] leading-[1.4] font-black text-navy-900">あわせて読みたい</h2>
            <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3" {...reveal()}>
              {related.map((r) => (
                <li key={r.href} className="bg-white">
                  <Link href={r.href} className="group flex h-full min-h-14 items-center gap-3 px-4 py-3 hover:bg-paper-2">
                    <span className="flex-1">
                      <span className="block text-base font-bold text-navy-900">{r.label}</span>
                      <span className="mt-0.5 block text-[13px] leading-[1.6] text-ink-2">{r.description}</span>
                    </span>
                    <ArrowIcon className="h-4 w-4 text-accent-text" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>

      {posts.length > 0 && (
        <Container className="pb-14">
          <RelatedArticles posts={posts} title="このテーマの最新記事" />
        </Container>
      )}

      <CtaSection title={cta.title} body={cta.body} />
      <JsonLd
        data={graph(
          webPageSchema({ path, name: pageName, description, dateModified: updatedAt, sources: sources.map((s) => ({ name: s.name, url: s.url })) }),
          serviceSchema({ path, name: pageName, description, serviceType: pageName }),
        )}
      />
    </>
  );
}
