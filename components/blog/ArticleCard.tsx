import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog";
import { getCategory } from "@/data/blog-categories";
import { images } from "@/data/images";
import { formatDateJa } from "@/lib/seo";

/** 記事カード。カテゴリごとのイラストをサムネイル代わりに出す（写真の使い回しを避ける）。 */
export function ArticleCard({ post, headingLevel = "h3" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const cat = getCategory(post.category);
  const icon = cat ? images[cat.icon] : images.iconSunPanel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-transform duration-200 hover:-translate-y-1">
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-cream">
        <span className="absolute -right-6 -bottom-10 h-28 w-28 rounded-full bg-orange-200/70" aria-hidden="true" />
        <span className="absolute top-4 left-6 h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
        <Image src={icon.src} alt="" width={160} height={160} sizes="112px" className="relative h-28 w-28 transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute top-3 right-3 rounded-full bg-green-600 px-3 py-[3px] text-[12px] font-bold text-white">{post.categoryName}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <H className="text-[16px] leading-[1.6] font-bold text-navy-900">
          {/* カード全体をクリックできるように、リンクを絶対配置で広げる */}
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-accent-text">
            {post.title}
          </Link>
        </H>
        <p className="mt-2 line-clamp-3 text-[14px] leading-[1.8] text-ink-2">{post.description}</p>
        <p className="mt-auto flex items-center justify-between pt-4 text-[12px] text-ink-3">
          <time dateTime={post.updatedAt}>{formatDateJa(post.updatedAt)} 更新</time>
          <span>約{post.readingMinutes}分</span>
        </p>
      </div>
    </article>
  );
}
