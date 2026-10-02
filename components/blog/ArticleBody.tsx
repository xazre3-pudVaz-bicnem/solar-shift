import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { Element, ElementContent, Root, RootContent } from "hast";

/**
 * 記事の ## 見出しの一覧（目次用）。id は本文側（rehypeSections）が付ける番号と同じ並びになる。
 * 本文の # は h2 に落として描画するので、# と ## の両方を数える。
 */
export function articleHeadings(markdown: string): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  let inCode = false;
  for (const line of String(markdown).split(/\r?\n/)) {
    if (/^```/.test(line)) inCode = !inCode;
    if (inCode) continue;
    const m = line.match(/^#{1,2}\s+(.+?)\s*$/);
    if (m) out.push({ id: `sec-${out.length + 1}`, label: m[1].replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") });
  }
  return out;
}

/**
 * 本文を h2 ごとの <section> に分ける（rehype プラグイン）。
 * 区画に分けておくと、画面外の区画の描画を後回しにできる（.cv-block）。
 * 記事は 2,000〜3,000 字あり、分けないと最初の描画で全文の文字組みをすることになる。
 * 最初の h2 より前（導入文）は、そのまま残す。
 * 見出しには sec-1, sec-2 … の id を付ける（目次からのページ内リンク用）。
 */
function rehypeSections() {
  return (tree: Root) => {
    const out: RootContent[] = [];
    let current: Element | null = null;
    let n = 0;
    for (const node of tree.children) {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h1")) {
        n += 1;
        node.properties = { ...(node.properties ?? {}), id: `sec-${n}` };
        current = { type: "element", tagName: "section", properties: { className: ["cv-block"] }, children: [node] };
        out.push(current);
      } else if (current) {
        current.children.push(node as ElementContent);
      } else {
        out.push(node);
      }
    }
    tree.children = out;
  };
}

/** Markdown 本文の描画。内部リンクは next/link、外部リンクは別タブ＋noopener。 */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose-ss">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSections]}
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
          // 表は横スクロールできる枠で包む（キーボードでもスクロールできるようにフォーカス可能にする）
          table: ({ children }) => (
            <div className="table-scroll" role="group" aria-label="表" tabIndex={0}>
              <table>{children}</table>
            </div>
          ),
          // チェックリスト（- [ ]）のチェックボックスは操作できない飾りなので、名前だけ付けておく
          input: ({ type, checked, disabled }) => <input type={type} checked={checked} disabled={disabled} readOnly aria-label={checked ? "チェック済み" : "未チェック"} />,
          // 本文内の h1 は見出し階層を壊すので h2 に落とす（id は rehypeSections が付けたものを引き継ぐ）
          h1: ({ children, id }) => (
            <h2 id={id} className="scroll-mt-24">
              {children}
            </h2>
          ),
          h2: ({ children, id }) => (
            <h2 id={id} className="scroll-mt-24">
              {children}
            </h2>
          ),
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
