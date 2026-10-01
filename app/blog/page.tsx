import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getAllPosts, categoriesWithPosts } from "@/lib/blog";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

const PATH = "/blog";
const DESC = "葛飾区の太陽光・蓄電池・補助金に関するブログ。かつしかエコ助成金、東京都の助成、太陽光発電・蓄電池・V2Hの選び方、電気代、停電・防災、FIT・売電などを、一次情報を確認して解説。SOLAR SHIFT（株式会社サイプレス）運営。";

export const metadata: Metadata = buildMetadata({
  title: "ブログ｜葛飾区の太陽光・蓄電池・補助金の最新情報",
  description: DESC,
  path: PATH,
  keywords: ["葛飾区 太陽光 ブログ", "太陽光 補助金 最新", "蓄電池 補助金 情報"],
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = categoriesWithPosts();
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "ブログ", href: PATH },
        ]}
        eyebrow="ブログ"
        title="葛飾区の太陽光・蓄電池・補助金の最新情報"
        lead="補助金の制度、太陽光・蓄電池の選び方、電気代や停電への備えについて、一次情報を確認したうえで解説しています。各記事に参考資料と最終更新日を明記しています。"
      />
      <Container className="py-10 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_16rem]">
          <div>
            {posts.length === 0 ? (
              <p className="text-[15px] text-ink-2">記事は準備中です。</p>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2">
                {posts.map((p) => (
                  <ArticleCard key={p.slug} post={p} headingLevel="h2" />
                ))}
              </div>
            )}
          </div>
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-[14px] font-bold tracking-wide text-ink-3">カテゴリ</h2>
              <ul className="mt-3 space-y-1.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/blog/category/${c.slug}`} className="flex items-center justify-between text-[14px] text-navy-900 hover:text-accent-text">
                      {c.name}
                      <span className="text-[12px] text-ink-3">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[14px] font-bold tracking-wide text-ink-3">まず読むページ</h2>
              <ul className="mt-3 space-y-1.5 text-[14px]">
                <li><Link href="/subsidy/katsushika" className="text-navy-600 underline underline-offset-4">葛飾区の補助金</Link></li>
                <li><Link href="/subsidy/tokyo" className="text-navy-600 underline underline-offset-4">東京都の補助金</Link></li>
                <li><Link href="/simulation" className="text-navy-600 underline underline-offset-4">補助金シミュレーター</Link></li>
                <li><Link href="/editorial-policy" className="text-navy-600 underline underline-offset-4">記事の編集方針</Link></li>
              </ul>
            </div>
            <p className="text-[12px] text-ink-3">
              <a href="/feed.xml" className="underline underline-offset-4">RSS</a>
            </p>
          </aside>
        </div>
      </Container>
      <CtaSection title="記事で分からないことは、住まいの条件で答えます。" body="制度や設備の一般論は記事に、ご自宅での具体的な答えは現地調査で。相談・見積もりは無料です。" />
      <JsonLd data={graph(webPageSchema({ path: PATH, name: "ブログ", description: DESC }))} />
    </>
  );
}
