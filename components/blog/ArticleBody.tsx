import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

/** Markdown 本文の描画。内部リンクは next/link、外部リンクは別タブ＋noopener。 */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose-ss">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const h = href ?? "#";
            if (h.startsWith("/")) return <Link href={h}>{children}</Link>;
            if (h.startsWith("#")) return <a href={h}>{children}</a>;
            return (
              <a href={h} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          // 本文内の h1 は見出し階層を壊すので h2 に落とす
          h1: ({ children }) => <h2>{children}</h2>,
          img: ({ src, alt }) => (
            // 記事内画像は <img> のまま（サイズ不明のため next/image を使わない）。後から画像を整備したら差し替える。
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" decoding="async" />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
