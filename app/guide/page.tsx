import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { guides, getGuide, type GuideEntry } from "@/data/guides";
import { images } from "@/data/images";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaffTip } from "@/components/ui/StaffTip";
import { ArrowIcon, LinkButton } from "@/components/ui/Button";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, itemListSchema, webPageSchema } from "@/lib/schema";
import { reveal } from "@/lib/reveal";

const PATH = "/guide";
const DESC =
  "太陽光発電・蓄電池の導入ガイド一覧。費用の内訳、メリット・デメリット、屋根の条件、蓄電池の選び方、停電時の備え、売電とFIT価格、卒FIT後の選択肢、メンテナンスまで、テーマごとに1ページで解説します。";

export const metadata: Metadata = buildMetadata({
  title: "太陽光発電・蓄電池の導入ガイド｜費用・選び方・停電・売電",
  description: DESC,
  path: PATH,
  keywords: ["太陽光発電 ガイド", "蓄電池 選び方", "太陽光発電 費用", "太陽光 停電時", "太陽光 売電"],
});

/** 目的別の読む順番（slug は data/guides.ts と一致させる） */
const ROUTES: { title: string; lead: string; image: keyof typeof images; tone: "orange" | "green" | "navy"; steps: string[] }[] = [
  {
    title: "太陽光発電を考えはじめた",
    lead: "向いている家かどうか、費用は何で決まるか、何年で元が取れるか、屋根は条件を満たすか。この順に読むと判断材料がそろいます。",
    image: "peopleCoupleThink",
    tone: "orange",
    steps: ["solar-merit-demerit", "solar-cost", "solar-payback", "roof-conditions"],
  },
  {
    title: "蓄電池を検討している",
    lead: "先に「何のために入れるか」を決めると、容量と種類が絞れます。停電時にどこまで使えるかも確認しておきましょう。",
    image: "peopleWomanThink",
    tone: "green",
    steps: ["battery-how-to-choose", "battery-cost", "blackout"],
  },
  {
    title: "すでに太陽光がある",
    lead: "売電の仕組みと、FIT期間が終わったあとの選択肢、設置後の点検と交換時期をまとめています。",
    image: "peopleCoupleClipboard",
    tone: "navy",
    steps: ["selling-electricity", "post-fit", "maintenance"],
  },
];

const GROUPS: { id: string; heading: string; lead: string; slugs: string[] }[] = [
  {
    id: "solar",
    heading: "太陽光発電を検討する",
    lead: "導入するかどうかを決めるための5本です。",
    slugs: ["solar-merit-demerit", "solar-cost", "solar-payback", "roof-conditions", "zero-yen-solar"],
  },
  {
    id: "battery",
    heading: "蓄電池と停電への備え",
    lead: "付けるかどうかの判断、容量・種類の決め方、停電時に使える範囲を整理しています。",
    slugs: ["battery-merit-demerit", "battery-how-to-choose", "battery-cost", "blackout"],
  },
  {
    id: "selling",
    heading: "売電と電気の使い方",
    lead: "FITの価格、再エネ賦課金、売電収入の税金と、売るより使うほうが合う場面の考え方です。",
    slugs: ["selling-electricity", "renewable-energy-surcharge", "solar-tax", "post-fit", "all-electric"],
  },
  {
    id: "after",
    heading: "設置したあとのこと",
    lead: "寿命・保証・点検。長く使うために知っておきたい内容です。",
    slugs: ["solar-lifespan", "maintenance"],
  },
  {
    id: "tokyo",
    heading: "東京都の義務化と、安全性",
    lead: "東京都の資料にもとづいて、制度と、災害への備えを整理しています。",
    slugs: ["tokyo-solar-mandate", "solar-safety"],
  },
];

const TONE = {
  orange: { ring: "border-orange-300", pill: "bg-orange-500 text-navy-900", num: "text-orange-600" },
  green: { ring: "border-navy-200", pill: "bg-navy-900 text-white", num: "text-navy-700" },
  navy: { ring: "border-navy-100", pill: "bg-navy-900 text-white", num: "text-navy-700" },
} as const;

function GuideCard({ g, delay }: { g: GuideEntry; delay: number }) {
  const img = images[g.image];
  return (
    <li {...reveal(delay)}>
      <Link href={g.path} className="group flex h-full gap-4 rounded-3xl border border-line bg-white p-4 shadow-card transition-transform duration-200 hover:-translate-y-1 hover:border-orange-300 sm:p-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cream sm:h-24 sm:w-24">
          <Image src={img.src} alt="" width={img.width} height={img.height} sizes="96px" className="max-h-[4.25rem] w-auto max-w-[4.25rem] object-contain sm:max-h-20 sm:max-w-20" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[16px] leading-[1.5] font-black text-navy-900 group-hover:text-accent-text sm:text-[17px]">{g.title}</span>
          <span className="mt-1.5 block text-[13px] leading-[1.75] text-ink-2">{g.description}</span>
          <span className="mt-2 flex items-center justify-between text-[12px] text-ink-3">
            <time dateTime={g.updatedAt}>{formatDateJa(g.updatedAt)} 更新</time>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-navy-900">
              <ArrowIcon className="h-3.5 w-3.5" />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export default function GuideIndexPage() {
  const listed = GROUPS.flatMap((grp) => grp.slugs.map((s) => getGuide(s))).filter((g): g is GuideEntry => Boolean(g));
  // 登録簿にあるのに、どの見出しにも入れていないガイド（追加したときの入れ忘れ防止）
  const others = guides.filter((g) => !listed.some((l) => l.slug === g.slug));

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "導入ガイド", href: PATH },
        ]}
        eyebrow="導入ガイド"
        title="太陽光発電・蓄電池の導入ガイド"
        lead="費用、屋根の条件、蓄電池の選び方、停電への備え、売電と卒FIT。導入を考えはじめたときに出てくる疑問を、テーマごとに1ページずつまとめました。制度の数値は、公式情報の確認日とあわせて記載しています。"
        image={images.poseChart}
      />

      <Container className="py-12 sm:py-16">
        <SectionHeading eyebrow="目的別" title="どこから読めばいい？" lead="いまの状況に近いものから、番号の順に読んでみてください。" align="center" />
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {ROUTES.map((r, i) => {
            const t = TONE[r.tone];
            const img = images[r.image];
            return (
              <li key={r.title} className={`flex flex-col rounded-3xl border-[3px] bg-white p-5 shadow-card sm:p-6 ${t.ring}`} {...reveal(i * 90, "zoom")}>
                <div className="flex items-end justify-between gap-3">
                  <h3 className={`rounded-full px-4 py-1.5 font-heading text-[15px] font-black ${t.pill}`}>{r.title}</h3>
                  <Image src={img.src} alt="" width={img.width} height={img.height} sizes="96px" className="h-auto w-20 shrink-0" />
                </div>
                <p className="mt-4 text-[14px] leading-[1.85] text-ink-2">{r.lead}</p>
                <ol className="mt-4 space-y-2">
                  {r.steps.map((slug, n) => {
                    const g = getGuide(slug);
                    if (!g) return null;
                    return (
                      <li key={slug}>
                        <Link href={g.path} className="group flex items-center gap-3 rounded-2xl bg-beige px-3 py-2.5 hover:bg-cream min-h-11">
                          <span className={`font-en text-[22px] leading-none font-extrabold ${t.num}`}>{n + 1}</span>
                          <span className="flex-1 text-[14px] leading-[1.5] font-bold text-navy-900 group-hover:text-accent-text">{g.title.split("｜")[0]}</span>
                          <ArrowIcon className="h-3.5 w-3.5 text-navy-900" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ul>
      </Container>

      <section className="cv-auto bg-beige py-12 sm:py-16" aria-labelledby="all-guides">
        <Container>
          <SectionHeading id="all-guides" eyebrow="テーマ別" title="ガイドの一覧" lead={`全${guides.length}本。1ページで1つの疑問に答える構成です。`} align="center" color="green" />
          <div className="mt-10 space-y-12">
            {GROUPS.map((grp) => (
              <section key={grp.id} aria-labelledby={`g-${grp.id}`}>
                <h3 id={`g-${grp.id}`} className="border-l-[8px] border-orange-500 pl-3 text-[20px] leading-[1.4] font-black text-navy-900 sm:text-[22px]">
                  {grp.heading}
                </h3>
                <p className="mt-1.5 pl-5 text-[14px] text-ink-2">{grp.lead}</p>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {grp.slugs.map((slug, i) => {
                    const g = getGuide(slug);
                    return g ? <GuideCard key={slug} g={g} delay={(i % 2) * 70} /> : null;
                  })}
                </ul>
              </section>
            ))}
            {others.length > 0 && (
              <section aria-labelledby="g-others">
                <h3 id="g-others" className="border-l-[8px] border-orange-500 pl-3 text-[20px] leading-[1.4] font-black text-navy-900 sm:text-[22px]">
                  そのほかのガイド
                </h3>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {others.map((g, i) => (
                    <GuideCard key={g.slug} g={g} delay={(i % 2) * 70} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <StaffTip title="補助金は別のページにまとめています" image={images.poseIdea} tone="green" className="mx-auto max-w-3xl">
          ガイドでは考え方を中心に解説しています。葛飾区・東京都の助成額や申請の順番は、制度ごとのページと補助金シミュレーターでご確認ください。
        </StaffTip>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/subsidy/katsushika" variant="green">
            葛飾区の補助金 <ArrowIcon />
          </LinkButton>
          <LinkButton href="/subsidy/tokyo" variant="secondary">
            東京都の補助金 <ArrowIcon />
          </LinkButton>
          <LinkButton href="/simulation" variant="secondary">
            補助金シミュレーター <ArrowIcon />
          </LinkButton>
          <LinkButton href="/glossary" variant="secondary">
            用語集 <ArrowIcon />
          </LinkButton>
          <LinkButton href="/faq" variant="ghost">
            よくある質問
          </LinkButton>
        </div>
      </Container>

      <CtaSection title="読んで分からなかったことは、わが家の条件で確かめましょう。" body="屋根に載る容量、必要な蓄電池の容量、使える補助金。現地調査のうえで、内訳を分けた見積もりをお出しします。相談・見積もりは無料です。" />

      <JsonLd
        data={graph(
          webPageSchema({ path: PATH, name: "太陽光発電・蓄電池の導入ガイド", description: DESC, type: "CollectionPage" }),
          itemListSchema({ name: "太陽光発電・蓄電池の導入ガイド", items: [...listed, ...others].map((g) => ({ name: g.title, path: g.path })) }),
        )}
      />
    </>
  );
}
