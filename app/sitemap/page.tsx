import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { footerNav, legalNav } from "@/lib/nav";
import { guides } from "@/data/guides";
import { areasWithPage } from "@/data/areas";
import { publishedProducts } from "@/data/products";
import { publishedWorks } from "@/data/works";
import { getAllPosts, categoriesWithPosts } from "@/lib/blog";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

const PATH = "/sitemap";

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
      <ul className="mt-3 space-y-1.5 text-[14px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-navy-600 underline underline-offset-4 hover:text-accent-text">{l.label}</Link>
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
          <Group title="導入ガイド（全ページ）" links={guides.map((g) => ({ href: g.path, label: g.title }))} />
          <Group title="エリアページ" links={areasWithPage.map((a) => ({ href: `/area/${a.slug}`, label: `${a.name}の太陽光発電` }))} />
          <Group title="商品詳細" links={publishedProducts.map((p) => ({ href: `/products/${p.slug}`, label: `${p.manufacturer} ${p.name}` }))} />
          <Group title="施工事例" links={publishedWorks.map((w) => ({ href: `/works/${w.slug}`, label: w.title }))} />
          <Group title="ブログカテゴリ" links={categoriesWithPosts().map((c) => ({ href: `/blog/category/${c.slug}`, label: c.name }))} />
          <Group title="その他" links={legalNav} />
        </div>
        <section className="mt-12">
          <h2 className="text-[16px] font-bold text-navy-900">ブログ記事（{posts.length}件）</h2>
          <ul className="mt-3 grid gap-1.5 text-[14px] sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="text-navy-600 underline underline-offset-4 hover:text-accent-text">{p.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
