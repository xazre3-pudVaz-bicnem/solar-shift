import { notFound } from "next/navigation";
import { findOgPage, ogPages } from "@/lib/og-pages";
import { renderOgImage } from "@/lib/og";

/**
 * SNS 共有用の画像。ページのパスと 1 対 1（例：/og/subsidy/katsushika、トップは /og）。
 * 一覧（lib/og-pages.ts）にあるパスだけをビルド時に生成する。任意の文字列で画像を作らせない。
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ogPages().map((p) => ({ path: p.path === "/" ? [] : p.path.slice(1).split("/") }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const page = findOgPage(path && path.length > 0 ? `/${path.join("/")}` : "/");
  if (!page) notFound();
  return renderOgImage(page);
}
