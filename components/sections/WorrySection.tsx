import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { images, type SiteImage } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * 「でも…」お悩みチェックリスト → 緑の帯（SOLAR SHIFT の考え方）→ POINT 01〜。
 *
 * 書いてよいのは、運営者から確認できていることだけ（docs/VERIFIED_FACTS.md の「サービス」の節）。
 * 実績件数・資格・承認率・営業方法の約束（「訪問販売はしません」など）は書かない。
 */
export interface WorryPoint {
  title: string;
  body: string;
  image: SiteImage;
  /** 写真の角に置く小さなイラスト（アイコン） */
  badge?: SiteImage;
}

export interface Worry {
  pre?: string;
  /** 緑で強調する部分 */
  em: string;
  post?: string;
}

export function WorrySection({
  worries,
  points,
  heading,
  note,
  action,
  id = "worry",
}: {
  worries: Worry[];
  points: WorryPoint[];
  /** 緑の帯の見出し（このセクションの h2） */
  heading: ReactNode;
  /** 緑の帯の、見出しの下の一言 */
  note?: string;
  /** POINT の下に置くリンク（ボタン） */
  action?: ReactNode;
  id?: string;
}) {
  const couple = images.peopleCoupleThink;
  const staff = images.poseTrust;
  return (
    <section className="cv-auto bg-paper-2 py-16 sm:py-24" aria-labelledby={id}>
      <Container>
        <p className="text-center font-heading text-[34px] leading-[1.4] font-black text-navy-900 sm:text-[44px]" {...reveal()}>
          <span className="border-b-[5px] border-navy-900 px-2 pb-1">でも…</span>
        </p>

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
              SOLAR SHIFT の考え方
            </span>
          </p>
          <h2 id={id} className="mt-5 text-[23px] leading-[1.5] font-black text-white sm:text-[32px]">
            {heading}
          </h2>
          {note && <p className="mt-3 font-heading text-[17px] font-bold text-white sm:text-[19px]">{note}</p>}
          <Image src={staff.src} alt="" width={staff.width} height={staff.height} sizes="120px" className="absolute right-4 bottom-0 hidden h-auto w-24 lg:block" />
        </div>

        <div className="mt-16 space-y-14 sm:space-y-20">
          {points.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={p.title} className={`grid items-center gap-7 lg:grid-cols-2 lg:gap-14 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative" {...reveal(0, flip ? "right" : "left")}>
                  <span className={`parallax-soft absolute -top-3 h-full w-full rounded-[2rem] ${flip ? "-right-3 bg-orange-200" : "-left-3 bg-green-200"}`} aria-hidden="true" />
                  <div className="relative overflow-hidden rounded-[2rem] shadow-card">
                    <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 1023px) 100vw, 50vw" quality={60} className="aspect-[3/2] h-auto w-full object-cover" />
                  </div>
                  {p.badge && (
                    <Image
                      src={p.badge.src}
                      alt=""
                      width={112}
                      height={112}
                      className={`absolute -bottom-6 h-20 w-20 animate-float rounded-full bg-white p-1.5 shadow-card sm:h-24 sm:w-24 ${flip ? "-left-3 sm:-left-6" : "-right-3 sm:-right-6"}`}
                    />
                  )}
                </div>
                <div {...reveal(120)}>
                  <p className="flex items-end gap-1 font-en font-bold text-green-700" aria-hidden="true">
                    <svg className="h-9 w-12" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 22 24 5l21 17" />
                    </svg>
                  </p>
                  <p className="-mt-3 flex items-baseline gap-1 font-en font-bold text-green-700">
                    <span className="text-[15px] tracking-[0.12em]">POINT</span>
                    <span className="text-[34px] leading-none">{String(i + 1).padStart(2, "0")}</span>
                  </p>
                  <h3 className="mt-3 text-[23px] leading-[1.45] font-black text-navy-900 sm:text-[28px]">
                    <span className="marker">{p.title}</span>
                  </h3>
                  <p className="mt-4 text-base leading-[1.95] text-ink-2">{p.body}</p>
                </div>
              </article>
            );
          })}
        </div>
        {action && (
          <p className="mt-12 text-center" {...reveal()}>
            {action}
          </p>
        )}
      </Container>
    </section>
  );
}
