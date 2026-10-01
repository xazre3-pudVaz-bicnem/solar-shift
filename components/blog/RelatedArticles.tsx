import type { BlogPost } from "@/lib/blog";
import { ArticleCard } from "@/components/blog/ArticleCard";

export function RelatedArticles({ posts, title = "関連記事" }: { posts: BlogPost[]; title?: string }) {
  if (posts.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="text-[20px] font-bold text-navy-900">{title}</h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  );
}
