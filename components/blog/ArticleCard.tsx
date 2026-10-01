import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { formatDateJa } from "@/lib/seo";

export function ArticleCard({ post, headingLevel = "h3" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="group flex flex-col border-t border-navy-900 pt-4">
      <div className="flex items-center gap-3 text-[12px] text-ink-3">
        <Link href={`/blog/category/${post.category}`} className="font-bold text-accent-text hover:underline">
          {post.categoryName}
        </Link>
        <time dateTime={post.updatedAt}>{formatDateJa(post.updatedAt)} 更新</time>
      </div>
      <H className="mt-2 text-[16px] leading-[1.6] font-bold text-navy-900">
        <Link href={`/blog/${post.slug}`} className="hover:text-accent-text">
          {post.title}
        </Link>
      </H>
      <p className="mt-2 line-clamp-3 text-[14px] leading-[1.8] text-ink-2">{post.description}</p>
      <p className="mt-3 text-[12px] text-ink-3">約{post.readingMinutes}分で読めます</p>
    </article>
  );
}
