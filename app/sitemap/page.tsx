import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { footerNav, legalNav } from "@/lib/nav";
import { guides } from "@/data/guides";
import { areasWithPage, areaPageLabel } from "@/data/areas";
import { publishedProducts } from "@/data/products";
import { publishedWorks } from "@/data/works";
import { getAllPosts, categoriesWithPosts } from "@/lib/blog";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

const PATH = "/sitemap";
/** ブログ記事はここまで表示する（記事は毎日増えるので、全件は並べない） */
const RECENT_POSTS = 60;

export const metadata: Metadata = buildMetadata({
  title: "サイトマップ",
  description: "SOLAR SHIFTのサイトマップ。サービス・補助金・商品・導入ガイド・対応エリア・施工事例・ブログ・会社情報などの全ページ一覧。",
  path: PATH,
});

function Group({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  if (links.length === 0) return null;
  return (
    <section>
      <h2 className="text-[16px] font-bold text-navy-900">{title}</h2>
      <ul className="mt-3 space-y-0.5 text-[14px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex text-navy-600 underline underline-offset-4 hover:text-accent-text items-center min-h-11 min-w-11">{l.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HtmlSitemapPage() {
  const posts = getAllPosts();
  return (
    <>
      <PageHeader crumbs={[{ name: "ホーム", href: "/" }, { name: "サイトマップ", href: PATH }]} title="サイトマップ" lead="当サイトの全ページの一覧です。" />
      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <Group title="トップ" links={[{ href: "/", label: "ホーム" }]} />
          {footerNav.map((g) => (
            <Group key={g.label} title={g.label} links={g.links} />
          ))}
          <Group title="導入ガイド（全ページ）" links={[{ href: "/guide", label: "導入ガイド一覧" }, ...guides.map((g) => ({ href: g.path, label: g.title }))]} />
          <Group title="エリアページ" links={areasWithPage.map((a) => ({ href: `/area/${a.slug}`, label: areaPageLabel(a) }))} />
          <Group title="商品詳細" links={publishedProducts.map((p) => ({ href: `/products/${p.slug}`, label: `${p.manufacturer} ${p.name}` }))} />
          <Group title="施工事例" links={publishedWorks.map((w) => ({ href: `/works/${w.slug}`, label: w.title }))} />
          <Group title="ブログカテゴリ" links={categoriesWithPosts().map((c) => ({ href: `/blog/category/${c.slug}`, label: c.name }))} />
          <Group title="その他" links={legalNav} />
        </div>
        <section className="mt-12">
          <h2 className="text-[16px] font-bold text-navy-900">ブログ記事（{posts.length}件）</h2>
          <ul className="mt-3 grid gap-x-6 gap-y-0.5 text-[14px] sm:grid-cols-2">
            {posts.slice(0, RECENT_POSTS).map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="inline-flex text-navy-600 underline underline-offset-4 hover:text-accent-text items-center min-h-11 min-w-11">{p.title}</Link>
              </li>
            ))}
          </ul>
          {posts.length > RECENT_POSTS && (
            <p className="mt-4 text-[14px] text-ink-2">
              新しい順に{RECENT_POSTS}件を表示しています。それ以前の記事は
              <Link href="/blog" className="mx-1 text-navy-600 underline underline-offset-4">ブログ一覧</Link>
              からご覧いただけます。
            </p>
          )}
        </section>
      </Container>
    </>
  );
}
