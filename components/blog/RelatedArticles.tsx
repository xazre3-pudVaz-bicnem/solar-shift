import type { BlogPost } from "@/lib/blog";
import { ArticleCard } from "@/components/blog/ArticleCard";

export function RelatedArticles({ posts, title = "関連記事" }: { posts: BlogPost[]; title?: string }) {
  if (posts.length === 0) return null;
  return (
    <section aria-label={title} className="cv-block">
      <h2 className="border-l-[6px] border-green-500 pl-3 text-[20px] leading-[1.35] font-black text-navy-900">{title}</h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  );
}
