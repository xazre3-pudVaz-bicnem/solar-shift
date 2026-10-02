import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
import { images } from "@/data/images";
import { formatDateJa } from "@/lib/seo";

/**
 * 記事カード。カテゴリごとのアイコンをサムネイル代わりに出す（同じ写真の使い回しを避ける）。
 * 飾りの図形は置かない。カード全体がリンクになる。
 */
export function ArticleCard({ post, headingLevel = "h3" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const cat = getCategory(post.category);
  const icon = cat ? images[cat.icon] : images.iconSunPanel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors duration-200 hover:border-navy-300">
      <div className="flex h-32 items-center justify-center border-b border-line bg-paper-2">
        <Image src={icon.src} alt="" width={160} height={160} sizes="96px" className="h-24 w-24" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13px] font-bold tracking-[0.06em] text-accent-text">{post.categoryName}</p>
        <H className="mt-1.5 text-[17px] leading-[1.6] font-bold text-navy-900">
          {/* カード全体をクリックできるように、リンクを絶対配置で広げる */}
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-accent-text">
            {post.title}
          </Link>
        </H>
        <p className="mt-2 line-clamp-3 text-[15px] leading-[1.8] text-ink-2">{post.description}</p>
        <p className="mt-auto flex items-center justify-between pt-4 text-[13px] text-ink-3">
          <time dateTime={post.updatedAt}>{formatDateJa(post.updatedAt)} 更新</time>
          <span>約{post.readingMinutes}分</span>
        </p>
      </div>
    </article>
  );
}
