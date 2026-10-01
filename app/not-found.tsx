import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "ページが見つかりません | SOLAR SHIFT",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/", label: "トップページ" },
  { href: "/subsidy/katsushika", label: "葛飾区の太陽光・蓄電池補助金" },
  { href: "/simulation", label: "補助金シミュレーター" },
  { href: "/solar", label: "太陽光発電について" },
  { href: "/battery", label: "家庭用蓄電池について" },
  { href: "/blog", label: "ブログ" },
  { href: "/contact", label: "お問い合わせ" },
];

export default function NotFound() {
  const img = images.peopleCoupleThink;
  return (
    <Container className="py-24 sm:py-32">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="font-en text-[13px] font-bold tracking-[0.2em] text-accent-text">404 NOT FOUND</p>
          <h1 className="mt-3 text-[28px] font-bold text-navy-900 sm:text-[36px]">お探しのページが見つかりません</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.9] text-ink-2">
            URLが変更されたか、ページが削除された可能性があります。以下のリンクから目的のページをお探しください。
          </p>
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-2xl border border-line bg-white px-4 py-3 text-[15px] font-bold text-navy-900 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-orange-400">
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Image src={img.src} alt="" width={img.width} height={img.height} sizes="320px" className="mx-auto h-auto w-56 lg:w-full" />
      </div>
    </Container>
  );
}
