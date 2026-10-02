import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/data/works";
import { images } from "@/data/images";
import { ArrowIcon } from "@/components/ui/Button";

/**
 * 施工事例のカード（一覧・TOP・エリアページで使う）。
 *
 * - 写真は、その事例の実際の写真があるときだけ出す。無いときは、設備の種類を表すアイコンにする
 *   （イメージ写真を、事例の写真のように見せない）。
 * - 電気代は、受け取った金額をそのまま並べる。差額や削減率は計算しない。
 * - level … 見出しの階層（置く場所に合わせる）
 */
export function WorksCard({ work, level = 3 }: { work: Work; level?: 2 | 3 }) {
  const Heading = level === 2 ? "h2" : "h3";
  const cover = work.images[0];
  const icon = workIcon(work);
  return (
    <article className="relative flex h-full flex-col rounded-lg border border-line bg-white transition-colors duration-200 hover:border-navy-300 hover:bg-paper-2">
      {cover ? (
        <Image src={cover.src} alt={cover.alt} width={640} height={480} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="aspect-[4/3] w-full rounded-t-lg object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          {!cover && <Image src={icon.src} alt="" width={icon.width} height={icon.height} sizes="56px" className="h-14 w-14 shrink-0 object-contain" />}
          <p className="min-w-0 text-[13px] leading-[1.6] font-bold text-accent-text">{work.label}</p>
        </div>
        <Heading className="mt-3 text-[18px] leading-[1.55] font-black text-navy-900">
          <Link href={`/works/${work.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {work.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[14px] leading-[1.7] text-ink-2">
          {work.prefecture}
          {work.city}・{work.customer}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line text-center">
          <div className="col-span-2 bg-paper-2 px-3 py-2">
            <dt className="sr-only">導入した設備</dt>
            <dd className="text-[14px] leading-[1.6] font-bold text-navy-900">{work.equipment}</dd>
          </div>
          {work.billBefore && work.billAfter && (
            <>
              <div className="bg-white px-2 py-2.5">
                <dt className="text-[12px] font-bold text-ink-2">導入前の電気代</dt>
                <dd className="mt-0.5 text-[15px] leading-[1.4] font-bold text-ink">{work.billBefore}</dd>
              </div>
              <div className="bg-white px-2 py-2.5">
                <dt className="text-[12px] font-bold text-ink-2">導入後の電気代</dt>
                <dd className="mt-0.5 text-[15px] leading-[1.4] font-black text-accent-text">{work.billAfter}</dd>
              </div>
            </>
          )}
        </dl>
        <p className="mt-4 flex items-center gap-1.5 text-[14px] font-bold text-navy-700" aria-hidden="true">
          事例を読む
          <ArrowIcon className="h-4 w-4 text-accent-text" />
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
