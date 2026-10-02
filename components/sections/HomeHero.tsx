import { getImageProps } from "next/image";
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
 * TOP のヒーロー。写真をセクションの背景いっぱいに敷き、その上に濃紺のオーバーレイと白い文字を載せる。
 *
 * - **ここにはリンクもボタンも置かない**（施主の指定。最初の導線はヘッダーと、ヒーロー直下の帯）。
 * - 写真は next/image の最適化（AVIF / WebP・幅ごとの srcset）を通す。
 *   スマホは横長の写真をそのまま切り抜くと住宅が画面から外れるので、<picture> で縦長の切り出しに差し替える
 *   （getImageProps を2回呼ぶ。Image を2つ並べると両方とも先読みされてしまう）。
 * - 先読み（preload）は画面幅ごとに1枚だけ。高さは min-height で固定し、画像は絶対配置なので CLS は起きない。
 * - 文字の下には必ず濃紺のグラデーションを敷く（スマホは上と下、PC は左）。
 *   文字が載らない範囲（スマホは中央、PC は右）は薄くして、屋根の太陽光パネルを見せる。
 * - 画像の中に文字は入れない。数字は data/subsidies から渡されたものだけを出す。
 */
const SIZES_WIDE = "(max-width: 1023px) 1210px, 100vw";
const SIZES_TALL = "100vw";

export function HomeHero({ facts, infoDate }: { facts: HeroFact[]; infoDate: string }) {
  const wide = images.heroSolarHomeBlueSky;
  const tall = images.heroSolarHomeBlueSkyPortrait;
  const { props: wideProps } = getImageProps({ src: wide.src, alt: wide.alt, fill: true, sizes: SIZES_WIDE, quality: 75 });
  const { props: tallProps } = getImageProps({ src: tall.src, alt: tall.alt, fill: true, sizes: SIZES_TALL, quality: 75 });

  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      <link rel="preload" as="image" imageSrcSet={tallProps.srcSet} imageSizes={SIZES_TALL} media="(max-width: 639px)" fetchPriority="high" />
      <link rel="preload" as="image" imageSrcSet={wideProps.srcSet} imageSizes={SIZES_WIDE} media="(min-width: 640px)" fetchPriority="high" />
      <picture>
        <source media="(max-width: 639px)" srcSet={tallProps.srcSet} sizes={SIZES_TALL} />
        <source media="(min-width: 640px)" srcSet={wideProps.srcSet} sizes={SIZES_WIDE} />
        <img
          src={wideProps.src}
          alt={wide.alt}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center sm:object-[64%_50%] lg:object-[50%_62%]"
        />
      </picture>
      {/* スマホ・タブレット：上（見出し）と下（補助金の数字）を濃く、中央の屋根は見せる。PC：左を濃く、右の住宅は見せる */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,40,0.92)_0%,rgba(7,20,40,0.78)_30%,rgba(7,20,40,0.16)_46%,rgba(7,20,40,0.16)_60%,rgba(7,20,40,0.84)_76%,rgba(7,20,40,0.94)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,20,40,0.94)_0%,rgba(7,20,40,0.86)_38%,rgba(7,20,40,0.4)_60%,rgba(7,20,40,0)_82%)]"
        aria-hidden="true"
      />

      <Container size="wide" className="relative z-10 flex min-h-[640px] flex-col justify-between pt-8 pb-7 sm:min-h-[680px] sm:pt-12 sm:pb-10 lg:min-h-[720px] lg:justify-center lg:gap-10 lg:py-20">
        <div className="max-w-2xl">
          {/*
            h1 は「検索語のラベル」＋「ブランドの一言」。
            ラベルを h1 の外に出すと、ページの主見出しに地域名もサービス名も入らなくなる。
          */}
          <h1 className="text-white">
            <span className="flex items-center gap-3 font-heading text-[13px] leading-[1.6] font-bold tracking-[0.04em] text-orange-300 min-[360px]:text-[14px] sm:text-[16px]">
              <span className="hidden h-px w-8 bg-current sm:block" aria-hidden="true" />
              葛飾区の太陽光発電・蓄電池・補助金サポート
            </span>
            <span className="mt-3 block text-[7.2vw] leading-[1.42] font-black tracking-[0.01em] sm:mt-4 sm:text-[44px] lg:text-[48px] xl:text-[54px]">
              <span className="block whitespace-nowrap">電気を買う暮らしから、</span>
              <span className="block whitespace-nowrap">
                <span className="text-orange-300">つくって、ためる</span>暮らしへ。
              </span>
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-[1.85] text-white/90 sm:mt-6 sm:text-[17px] sm:leading-[1.95]">
            {siteConfig.primaryArea.name}の太陽光発電・蓄電池なら SOLAR SHIFT。補助金の整理から現地調査、設置、導入後の相談まで、住まいに合わせてひとつずつ。
          </p>
        </div>

        <div className="max-w-xl">
          <p className="text-[13px] font-bold tracking-[0.04em] text-white">2026年度 葛飾区の補助金（かつしかエコ助成金）</p>
          <ul className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/30 bg-white/30">
            {facts.map((f) => (
              <li key={f.label} className="bg-navy-950/80 px-3 py-2.5 sm:px-5 sm:py-3">
                <span className="block text-[12px] leading-[1.5] font-bold text-white/85 sm:text-[13px]">{f.label}</span>
                <span className="mt-0.5 flex items-baseline gap-1 text-white">
                  {f.prefix && <span className="text-[12px] font-bold sm:text-[13px]">{f.prefix}</span>}
                  <span className="num-xl text-[32px] text-orange-300 sm:text-[40px]">{f.value}</span>
                  <span className="font-heading text-[14px] font-black sm:text-[16px]">{f.unit}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] leading-[1.7] text-white/80">
            {infoDate}時点の葛飾区公式情報。対象可否・助成額は住宅条件・機器・申請時期で異なります。
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] font-bold text-white">
            <span>{siteConfig.company.name} 運営</span>
            <span>
              {siteConfig.primaryArea.prefecture}
              {siteConfig.primaryArea.name}対応
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
