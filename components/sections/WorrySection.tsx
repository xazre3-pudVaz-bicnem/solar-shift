import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { images, type SiteImage } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * 「でも…」お悩みチェックリスト → 「ご安心ください」緑の帯 → POINT 01〜。
 * 実績件数・資格・承認率など、確認できないことは書かない。
 */
export interface WorryPoint {
  title: string;
  tag: string;
  body: string;
  image: SiteImage;
  href: string;
  label: string;
}

export interface Worry {
  pre?: string;
  /** 緑で強調する部分 */
  em: string;
  post?: string;
}

export function WorrySection({ worries, points, id = "worry" }: { worries: Worry[]; points: WorryPoint[]; id?: string }) {
  const couple = images.peopleCoupleThink;
  return (
    <section className="cv-auto bg-paper-2 py-16 sm:py-24" aria-labelledby={`${id}-h`}>
      <Container>
        <h2 id={`${id}-h`} className="text-center text-[34px] font-black text-navy-900 sm:text-[44px]" {...reveal()}>
          <span className="border-b-[5px] border-navy-900 px-2 pb-1">でも…</span>
        </h2>

        <div className="relative mx-auto mt-12 max-w-4xl rounded-[2rem] bg-white px-5 pt-6 pb-6 shadow-pop sm:px-10 sm:pt-8" {...reveal(80)}>
          <div className="grid items-end gap-4 sm:grid-cols-[15rem_1fr] sm:gap-8">
            <Image src={couple.src} alt="" width={couple.width} height={couple.height} sizes="240px" className="mx-auto -mb-6 h-auto w-48 sm:w-full" />
            <ul className="divide-y-2 divide-dotted divide-line-2 pb-2">
              {worries.map((w, i) => (
                <li key={i} className="flex items-center gap-3 py-3 font-heading text-[16px] font-bold text-navy-900 sm:text-[18px]" {...reveal(150 + i * 90, "right")}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[2.5px] border-orange-500 text-orange-600" aria-hidden="true">
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                      <path d="m3 8.5 3.2 3.2L13 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    {w.pre}
                    <span className="text-green-700">{w.em}</span>
                    {w.post}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-4xl justify-center" aria-hidden="true">
          <svg className="h-12 w-12 animate-bob-y text-orange-500" viewBox="0 0 24 24" fill="none">
            <path d="m6 6 6 6 6-6M6 12l6 6 6-6" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="relative mx-auto mt-1 max-w-4xl rounded-[2rem] bg-green-600 px-6 py-9 text-center text-white shadow-pop sm:px-10" {...reveal(0, "zoom")}>
          <p className="flex justify-center">
            <span className="relative inline-block rounded-full bg-white px-5 py-1.5 font-heading text-[15px] font-bold text-green-700 after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-[7px] after:border-t-[8px] after:border-x-transparent after:border-t-white after:content-['']">
              ご安心ください！
            </span>
          </p>
          <p className="mt-5 font-heading text-[23px] leading-[1.5] font-black text-white sm:text-[32px]">
            補助金の整理から申請・工事・導入後まで
            <br />
            <span className="text-marker">SOLAR SHIFT</span> が同じ窓口で進めます
          </p>
          <p className="mt-3 font-heading text-[19px] font-bold text-white">訪問販売・電話営業はしていません</p>
          <Image src={images.poseTrust.src} alt="" width={images.poseTrust.width} height={images.poseTrust.height} sizes="120px" className="absolute right-4 -bottom-0 hidden h-auto w-24 lg:block" />
        </div>

        <div className="mt-16 space-y-14 sm:space-y-20">
          {points.map((p, i) => (
            <article key={p.title} className={`grid items-center gap-7 lg:grid-cols-2 lg:gap-14 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="relative" {...reveal(0, i % 2 === 1 ? "right" : "left")}>
                <span className={`absolute -top-3 h-full w-full rounded-[2rem] ${i % 2 === 1 ? "-right-3 bg-orange-200" : "-left-3 bg-green-200"}`} aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[2rem] shadow-card">
                  <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 1023px) 100vw, 50vw" quality={60} className="aspect-[3/2] h-auto w-full object-cover" />
                </div>
              </div>
              <div {...reveal(120)}>
                <p className="flex items-end gap-1 font-en font-bold text-green-700">
                  <svg className="h-9 w-12" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 22 24 5l21 17" />
                  </svg>
                </p>
                <p className="-mt-3 flex items-baseline gap-1 font-en font-bold text-green-700">
                  <span className="text-[15px] tracking-[0.12em]">POINT</span>
                  <span className="text-[34px] leading-none">{String(i + 1).padStart(2, "0")}</span>
                </p>
                <h3 className="mt-3 text-[23px] leading-[1.45] font-black text-navy-900 sm:text-[28px]">{p.title}</h3>
                <p className="mt-3">
                  <span className="inline-block bg-green-600 px-3 py-1 font-heading text-[15px] font-bold text-white">{p.tag}</span>
                </p>
                <p className="mt-4 text-[15px] leading-[1.95] text-ink-2">{p.body}</p>
                <p className="mt-4">
                  <Link href={p.href} className="font-heading text-[15px] font-bold text-navy-600 underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-accent-text">
                    {p.label} →
                  </Link>
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
