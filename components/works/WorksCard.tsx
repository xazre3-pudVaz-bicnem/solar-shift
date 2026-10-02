import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/data/works";
import { images } from "@/data/images";
import { ArrowIcon } from "@/components/ui/Button";

/**
 * 施工事例のカード（一覧・TOP・エリアページで使う）。
 *
 * - 写真は、その事例の実際の写真があるときだけ出す。無いときは、設備の種類を表すイラストにする
 *   （イメージ写真を、事例の写真のように見せない）。
 * - 電気代は、受け取った金額をそのまま並べる。差額や削減率は計算しない。
 * - level … 見出しの階層（置く場所に合わせる）
 */
export function WorksCard({ work, level = 3 }: { work: Work; level?: 2 | 3 }) {
  const Heading = level === 2 ? "h2" : "h3";
  const cover = work.images[0];
  const icon = workIcon(work);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-transform duration-200 hover:-translate-y-1">
      {cover ? (
        <Image src={cover.src} alt={cover.alt} width={640} height={480} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="relative flex h-32 items-center justify-center overflow-hidden bg-cream">
          <span className="absolute -right-6 -bottom-10 h-28 w-28 rounded-full bg-orange-200/70" aria-hidden="true" />
          <span className="absolute top-4 left-6 h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
          <Image src={icon.src} alt="" width={icon.width} height={icon.height} sizes="104px" className="relative h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-110" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p>
          <span className="inline-block rounded-full bg-green-600 px-3 py-[3px] text-[12px] leading-[1.5] font-bold text-white">{work.label}</span>
        </p>
        <Heading className="mt-3 text-[18px] leading-[1.55] font-black text-navy-900">
          <Link href={`/works/${work.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {/* リンクの文言に地域と設備を含める（見た目は上のラベルと重なるので、読み上げ・検索用だけ） */}
            <span className="sr-only">{work.label}の施工事例：</span>
            {work.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[14px] leading-[1.7] text-ink-2">
          {work.prefecture}
          {work.city}・{work.customer}
        </p>
        <div className="mt-4 text-center">
          <p className="rounded-2xl bg-beige px-3 py-2 text-[14px] leading-[1.6] font-bold text-navy-900">
            <span className="sr-only">導入した設備：</span>
            {work.equipment}
          </p>
          {work.billBefore && work.billAfter && (
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              <p className="rounded-2xl border-2 border-line bg-white px-2 py-2.5">
                <span className="block text-[12px] font-bold text-ink-2">導入前の電気代</span>
                <span className="mt-0.5 block text-[15px] leading-[1.4] font-bold text-ink">{work.billBefore}</span>
              </p>
              <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="rounded-2xl border-2 border-orange-300 bg-orange-50 px-2 py-2.5">
                <span className="block text-[12px] font-bold text-ink-2">導入後の電気代</span>
                <span className="mt-0.5 block text-[15px] leading-[1.4] font-black text-accent-text">{work.billAfter}</span>
              </p>
            </div>
          )}
        </div>
        <p className="mt-auto flex items-center justify-end gap-2 pt-4 text-[14px] font-bold text-navy-900" aria-hidden="true">
          事例を読む
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-navy-900">
            <ArrowIcon />
          </span>
        </p>
      </div>
    </article>
  );
}

/** 設備の種類を表すアイコン（写真が無い事例用） */
export function workIcon(work: Work) {
  if (work.evCharger || work.v2h) return images.iconHouseEv;
  if (work.hasBattery) return images.iconHouseBattery;
  return images.iconHouseSolar;
}
