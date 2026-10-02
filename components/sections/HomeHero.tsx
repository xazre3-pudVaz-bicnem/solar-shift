import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { images } from "@/data/images";
import { siteConfig } from "@/lib/site";

export interface HeroFact {
  /** 例：太陽光発電 */
  label: string;
  /** 例：最大 */
  prefix?: string;
  value: number;
  /** 例：万円 */
  unit: string;
}

/**
 * TOP のヒーロー。クリーム地に、左に見出しと補助金の数字、右に写真のカードと家族のイラスト。
 *
 * - **ここにはリンクもボタンも置かない**（施主の指定。最初の導線はヘッダーと、ヒーロー直下の帯）。
 * - 数字は data/subsidies から渡されたものだけを出す。葛飾区の助成だけを載せる（都の助成と並べない・合算しない）。
 * - 動きは「最初に1回だけ」の登場（文字は位置だけを動かす。透明から始めると、最初の描画が遅く数えられる）と、
 *   画面内にあるあいだだけ動く飾り（回る太陽・ゆれるイラスト）。動き続けるものは置かない。
 * - 写真は最初の画面に入るので先読みする（preload）。枠の大きさは aspect で先に確保する（CLS を出さない）。
 */
function SunRays({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="44" fill="currentColor" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="95" y="4" width="10" height="34" rx="5" fill="currentColor" transform={`rotate(${i * 30} 100 100)`} />
      ))}
    </svg>
  );
}

function Wave({ className = "text-white" }: { className?: string }) {
  return (
    <svg className={`block h-8 w-full sm:h-14 ${className}`} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 42c200 34 440 34 720 8s520-30 720 2v28H0z" />
    </svg>
  );
}

export function HomeHero({ facts, infoDate }: { facts: HeroFact[]; infoDate: string }) {
  const photo = images.heroHouseSunset;
  const family = images.peopleFamily;
  return (
    <section className="relative overflow-hidden bg-cream">
      <SunRays className="absolute -top-20 -left-20 h-64 w-64 animate-spin-slow text-orange-200 sm:h-80 sm:w-80" />
      <span className="absolute top-[18%] right-[46%] hidden h-3 w-3 animate-twinkle rounded-full bg-green-400 lg:block" aria-hidden="true" />
      <span className="absolute right-[4%] bottom-[22%] hidden h-4 w-4 animate-twinkle rounded-full bg-orange-400 [animation-delay:1.3s] lg:block" aria-hidden="true" />
      <span className="absolute top-[9%] right-[30%] hidden h-2 w-2 animate-twinkle rounded-full bg-orange-300 [animation-delay:0.6s] lg:block" aria-hidden="true" />

      <Container size="wide" className="relative grid items-center gap-12 pt-10 pb-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-12">
        <div>
          {/*
            h1 は「検索語のラベル」＋「ブランドの一言」。
            ラベルを h1 の外に出すと、ページの主見出しに地域名もサービス名も入らなくなる。
          */}
          <h1 className="text-navy-900">
            <span className="enter-rise flex">
              <span className="relative inline-block rounded-full bg-orange-500 px-5 py-1.5 font-heading text-[14px] leading-[1.9] font-bold tracking-normal text-navy-900 shadow-sm after:absolute after:top-full after:left-7 after:border-x-[7px] after:border-t-[8px] after:border-x-transparent after:border-t-orange-500 after:content-[''] min-[400px]:text-[15px]">
                葛飾区の太陽光発電・蓄電池・補助金サポート
              </span>
            </span>
            <span className="enter-rise mt-6 block text-[6.6vw] leading-[1.4] font-black tracking-[0.01em] [--enter-delay:90ms] sm:text-[42px] lg:text-[34px] xl:text-[44px]">
              電気を買う暮らしから、
              <br />
              <span className="marker marker-draw">つくって、ためる</span>暮らしへ。
            </span>
          </h1>
          <p className="enter-rise mt-6 max-w-xl text-base leading-[2] text-ink-2 [--enter-delay:180ms] sm:text-[17px]">
            {siteConfig.primaryArea.name}の太陽光発電・蓄電池なら <strong className="font-en font-extrabold tracking-wide text-navy-900">SOLAR SHIFT</strong>。補助金の整理から現地調査、設置、導入後の相談まで、住まいに合わせてひとつずつ。
          </p>

          <p className="enter-rise mt-7 flex items-center gap-2 font-heading text-[14px] font-bold text-navy-900 [--enter-delay:260ms] sm:text-[15px]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
            2026年度 葛飾区の補助金（かつしかエコ助成金）
          </p>
          <ul className="mt-2.5 grid max-w-md grid-cols-2 gap-2 sm:gap-3">
            {facts.map((f, i) => (
              <li key={f.label} className="enter-rise rounded-2xl border-2 border-orange-200 bg-white px-2 py-3 text-center shadow-card" style={{ ["--enter-delay" as string]: `${330 + i * 90}ms` }}>
                <span className="block font-heading text-[13px] leading-[1.4] font-bold text-navy-900 sm:text-[15px]">{f.label}</span>
                <span className="mt-1 flex items-baseline justify-center gap-0.5 text-navy-900">
                  {f.prefix && <span className="self-center rounded-md bg-navy-900 px-1.5 py-[1px] text-[11px] font-bold text-white sm:text-[12px]">{f.prefix}</span>}
                  <span className="num-xl text-[38px] text-orange-600 sm:text-[48px]">{f.value}</span>
                  <span className="font-heading text-[13px] font-black sm:text-[15px]">{f.unit}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-xl text-[12px] leading-[1.7] text-ink-3">※ {infoDate}時点の葛飾区公式情報。対象可否・助成額は住宅条件・機器・申請時期で異なります。</p>

          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
            <span className="rounded-full bg-navy-900 px-3 py-1 font-bold text-white">{siteConfig.company.name} 運営</span>
            <span className="font-bold">
              {siteConfig.primaryArea.prefecture}
              {siteConfig.primaryArea.name}対応
            </span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl pb-10 lg:max-w-none">
          <span className="parallax-soft absolute -top-3 -right-3 h-[calc(100%-2.5rem)] w-full rounded-[2.5rem] bg-orange-200" aria-hidden="true" />
          <div className="enter-slide relative overflow-hidden rounded-[2.5rem] border-[6px] border-white shadow-pop">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 1023px) 100vw, 46vw"
              preload
              quality={60}
              className="aspect-[16/10] h-auto w-full object-cover"
            />
          </div>
          <div className="enter-pop absolute bottom-0 -left-1 w-36 [--enter-delay:500ms] sm:w-48">
            <div className="animate-float-slow rounded-3xl bg-white p-2 shadow-pop">
              <Image src={family.src} alt="" width={family.width} height={family.height} sizes="192px" className="h-auto w-full" />
            </div>
          </div>
          <p className="enter-pop absolute bottom-[4.5rem] left-36 origin-left rounded-2xl bg-white px-3 py-2 font-heading text-[12px] leading-[1.5] font-bold text-navy-900 shadow-card [--enter-delay:850ms] sm:bottom-24 sm:left-52 sm:text-[14px]">
            {/* 吹き出しの中身は、3つの疑問が順番に入れ替わる（2巡して、最初の文で止まる） */}
            <span className="grid">
              <span className="col-start-1 row-start-1 animate-bubble-a">
                うちの屋根でも、
                <br />
                補助金つかえる？
              </span>
              <span className="col-start-1 row-start-1 animate-bubble-b opacity-0" aria-hidden="true">
                蓄電池も、
                <br />
                いっしょがいい？
              </span>
              <span className="col-start-1 row-start-1 animate-bubble-c opacity-0" aria-hidden="true">
                申請は、
                <br />
                いつまでに？
              </span>
            </span>
            <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 bg-white" aria-hidden="true" />
          </p>
          <div className="enter-pop absolute -top-6 -left-4 [--enter-delay:650ms]">
            <Image src={images.iconSunPanel.src} alt="" width={96} height={96} className="h-16 w-16 animate-float sm:h-24 sm:w-24" />
          </div>
        </div>
      </Container>
      <Wave />
    </section>
  );
}
