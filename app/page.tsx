import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata, formatDateJa } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, getSubsidy } from "@/data/subsidies";
import { areas } from "@/data/areas";
import { faqsByIds } from "@/data/faq";
import { publishedWorks } from "@/data/works";
import { recommendedProducts } from "@/data/products";
import { manufacturers } from "@/data/manufacturers";
import { getLatestPosts } from "@/lib/blog";
import { simulate } from "@/lib/subsidy-calc";
import { images } from "@/data/images";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SubsidyTable } from "@/components/subsidy/SubsidyTable";
import { SubsidyDisclaimer } from "@/components/ui/Disclaimer";
import { Steps } from "@/components/ui/Steps";
import { AreaCard } from "@/components/area/AreaCard";
import { WorksCard } from "@/components/works/WorksCard";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqSection } from "@/components/sections/FaqSection";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "葛飾区の太陽光発電・蓄電池・補助金サポート｜SOLAR SHIFT（株式会社サイプレス）",
  description:
    "葛飾区の太陽光発電・蓄電池ならSOLAR SHIFT。かつしかエコ助成金・東京都の補助金の最新情報、補助金シミュレーター、太陽光＋蓄電池・V2H・HEMSの導入サポート。株式会社サイプレス運営。",
  path: "/",
  keywords: ["葛飾区 太陽光", "葛飾区 太陽光発電", "葛飾区 蓄電池", "葛飾区 太陽光 補助金", "葛飾区 蓄電池 補助金", "東京都 太陽光 補助金"],
  rawTitle: true,
});

const SERVICES = [
  {
    href: "/solar",
    title: "太陽光発電",
    en: "Solar",
    body: "屋根で発電した電気を自宅で使い、余った分を売電する。電気を「買う」割合を減らす最初の一歩です。屋根の向き・面積・影の影響を現地で確認し、載せられる容量と期待できる効果を整理します。",
    points: ["屋根条件の現地確認", "容量の候補を複数提案", "葛飾区・東京都の助成を整理"],
    image: images.houseRoofPanelsSky,
  },
  {
    href: "/battery",
    title: "家庭用蓄電池",
    en: "Battery",
    body: "昼に発電した電気を夜に使い、停電時には備えになる。容量（kWh）、全負荷か特定負荷か、設置場所で選び方が変わります。東京都の助成は10万円/kWhのため、容量と費用のバランスが大切です。",
    points: ["夜間使用量から容量を検討", "停電時の優先回路を設計", "SII登録機器の確認"],
    image: images.batteryOutdoorWall,
  },
  {
    href: "/solar-battery",
    title: "太陽光＋蓄電池",
    en: "Solar + Battery",
    body: "つくった電気をためて使う。工事を1回にまとめ、ハイブリッド型パワーコンディショナで機器を集約できます。葛飾区では太陽光と蓄電池の併設加算（一律5万円）の対象です。",
    points: ["ハイブリッド型で機器を集約", "併設加算の対象", "工事・申請を1回で"],
    image: images.houseBatteryOutdoor,
  },
] as const;

const MERITS = [
  {
    n: "01",
    icon: images.iconHouseYen,
    title: "区の助成と都の助成、両方が検討対象",
    body: "葛飾区の「かつしかエコ助成金」は太陽光6万円/kW（上限30万円）、蓄電池は対象経費の1/4（上限20万円）。東京都は既存住宅で3.75kW超が12万円/kW、蓄電池は10万円/kWhです。併用可否は各窓口で確認が必要ですが、どちらも葛飾区の住宅が対象になり得ます。",
  },
  {
    n: "02",
    icon: images.iconSunPanel,
    title: "2026年度のFITは最初の4年間が24円/kWh",
    body: "住宅用（10kW未満）の売電価格は、2026年度は最初の4年間が24円/kWh、5〜10年目が8.3円/kWhです。導入初期に回収を前倒しする仕組みで、補助金と合わせると初期負担の軽減につながります。",
  },
  {
    n: "03",
    icon: images.iconHouseBattery,
    title: "ゼロメートル地帯だから、停電への備えに",
    body: "葛飾区は荒川・中川・江戸川に囲まれ、区の半分近くが海抜ゼロメートル地帯です。太陽光と蓄電池があれば、停電時にも最低限の電力を自宅で確保でき、在宅避難の備えになります。設置場所は浸水想定を踏まえて検討します。",
  },
  {
    n: "04",
    icon: images.iconHouseSolar,
    title: "戸建の多い住宅地で、屋根を活かせる",
    body: "葛飾区は約26万世帯が暮らす住宅都市で、戸建住宅が多い地域です。隣家との距離が近い敷地も多いため、影の影響を現地で確認し、屋根の形に合わせた配置を設計することで、無理のない容量を載せられます。",
  },
] as const;

const VALUES = [
  {
    title: "補助金を、分かりやすく。",
    body: "かつしかエコ助成金、東京都の助成、国の制度。金額・条件・申請時期を一次情報で確認し、確認日を明記してお伝えします。確認できていない併用を前提にした「お得な合計額」は出しません。",
  },
  {
    title: "住宅ごとに、必要な設備を。",
    body: "屋根の形、家族の電気の使い方、停電時にどこまで備えたいか。それによって太陽光だけで十分な家もあれば、蓄電池やV2Hまで検討したほうがよい家もあります。先に設備を決めず、住まいから考えます。",
  },
  {
    title: "太陽光だけで終わらせない。",
    body: "太陽光・蓄電池・V2H・HEMS・関連する省エネ設備まで、ひとつの計画として検討します。後から追加するより、はじめに全体像を描いたほうが、工事も申請も無駄がありません。",
  },
  {
    title: "葛飾区を中心に、地域密着で。",
    body: "拠点は葛飾区白鳥。区内の住宅事情や水害リスクを踏まえた提案を行い、足立区・江戸川区・墨田区など周辺にも対応します。導入前の相談から導入後の不具合まで、同じ窓口で相談できます。",
  },
] as const;

const FLOW = [
  { title: "お問い合わせ・ヒアリング", meta: "まずはフォームから", body: "屋根の形状、築年数、現在の電気代、気になっている設備を伺います。この段階で使える可能性のある補助金を整理します。" },
  { title: "現地調査（無料）", meta: "屋根・分電盤・設置スペースを確認", body: "屋根の状態、周囲の建物による影、蓄電池の設置場所、分電盤の状況を確認します。水害リスクのある地域では設置高さも検討します。" },
  { title: "ご提案・お見積もり", meta: "内訳を分けた見積もり", body: "容量の候補を複数お出しし、葛飾区・東京都それぞれの想定助成額を別紙で整理します。" },
  { title: "補助金の事前手続き", meta: "着工4週間前までに事前協議", body: "葛飾区の助成は工事着工の4週間前までに事前協議が必要です。区の回答書が届くまで工事には入りません。東京都の事前申込も並行して進めます。" },
  { title: "設置工事", meta: "回答書の到着後に着工", body: "足場の設置からパネル・機器の取り付け、電気工事、系統連系まで。工事中の疑問はその場でお答えします。" },
  { title: "完了報告・導入後サポート", meta: "交付申請から運転開始後まで", body: "完了報告と交付申請の書類を準備し、運転開始後の発電状況や機器の不具合についても、同じ窓口でご相談いただけます。" },
] as const;

export default function HomePage() {
  const example = simulate({ area: "katsushika", housing: "existing", solarKw: 5, batteryKwh: 7, v2h: false, hems: false });
  const kBattery = getSubsidy("katsushika-battery")!;
  const faqItems = faqsByIds([
    "subsidy-katsushika-overview",
    "subsidy-pre-consultation",
    "subsidy-combination",
    "cost-solar",
    "battery-set",
    "service-area",
  ]);
  const posts = getLatestPosts(3);
  const recSolar = recommendedProducts("solar").slice(0, 2);
  const recBattery = recommendedProducts("battery").slice(0, 2);
  const recommended = [...recSolar, ...recBattery];
  const works = publishedWorks.slice(0, 3);

  return (
    <>
      {/* 1. ヒーロー（CTAは置かない・ブランド訴求のみ） */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <Container size="wide" className="relative grid items-center gap-10 py-16 sm:py-20 lg:min-h-[640px] lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <p className="flex items-center gap-3 font-en text-[12px] font-bold tracking-[0.28em] text-accent-text">
              <span className="inline-block h-px w-10 bg-orange-500" aria-hidden="true" />
              SOLAR SHIFT
            </p>
            <h1 className="mt-6 text-[34px] leading-[1.3] font-bold tracking-[0.01em] text-navy-900 sm:text-[46px] lg:text-[54px]">
              電気を買う暮らしから、
              <br />
              つくって、ためる暮らしへ。
            </h1>
            <p className="mt-7 max-w-xl text-[16px] leading-[2] text-ink-2 sm:text-[17px]">
              {siteConfig.primaryArea.name}の太陽光発電・蓄電池なら SOLAR SHIFT。
              <br className="hidden sm:block" />
              補助金の整理から現地調査、設置、導入後の相談まで、住まいに合わせてひとつずつ。
            </p>
            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-3">
              <span className="font-bold text-navy-900">{siteConfig.company.name} 運営</span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-line-2 sm:block" />
              <span>主要対応エリア：{siteConfig.primaryArea.prefecture}{siteConfig.primaryArea.name}</span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-line-2 sm:block" />
              <span>太陽光発電・蓄電池・V2H・HEMS・補助金活用サポート</span>
            </p>
          </div>
          <div className="relative">
            <ImagePlaceholder
              src={images.heroHouseSunset.src}
              alt={images.heroHouseSunset.alt}
              ratio="16/9"
              sizes="(max-width: 1024px) 100vw, 46vw"
              label="メインビジュアル（写真差し替え）"
              priority
              frame={false}
            />
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 border border-line bg-white px-4 py-3 shadow-[0_12px_32px_-16px_rgba(11,31,58,0.35)] lg:flex">
              <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
              <span className="text-[12px] leading-[1.5] text-ink-2">
                <span className="block font-bold text-navy-900">葛飾区白鳥から</span>
                住まいに合わせた太陽光・蓄電池の計画を
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. SOLAR SHIFT について */}
      <section className="py-16 sm:py-24" aria-labelledby="about">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <SectionHeading eyebrow="SOLAR SHIFT について" title={<span id="about">葛飾区の太陽光発電・蓄電池・補助金のことなら、ひとつの窓口で。</span>} />
            <div className="space-y-5 text-[15px] leading-[2] text-ink sm:text-base">
              <p>
                SOLAR SHIFT（ソーラーシフト）は、東京都葛飾区に本社を置く株式会社サイプレスが運営する、住宅用太陽光発電・家庭用蓄電池の導入サポートサービスです。
              </p>
              <p>
                太陽光発電を検討すると、最初にぶつかるのが「補助金はいくら出るのか」「自分の家は対象なのか」「申請はいつまでに何をすればいいのか」という疑問です。葛飾区の助成、東京都の助成、国の制度は、それぞれ金額も条件も申請の順番も違います。
              </p>
              <p>
                SOLAR SHIFT は、こうした制度の情報を一次情報で確認して整理し、住まいごとに必要な設備を一緒に検討します。太陽光だけでなく、蓄電池・V2H・HEMSまで含めた全体像を描き、導入前の相談から導入後のサポートまで、同じ窓口で対応します。
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <LinkButton href="/reason" variant="secondary">SOLAR SHIFT が選ばれる理由</LinkButton>
                <LinkButton href="/company" variant="ghost">運営会社について <ArrowIcon /></LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. 葛飾区で太陽光を導入するメリット */}
      <section className="cv-auto border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="merit">
        <Container>
          <SectionHeading
            eyebrow="葛飾区で導入するメリット"
            title={<span id="merit">葛飾区は、太陽光・蓄電池を「補助金を使って」入れやすい地域です。</span>}
            lead="区と都の両方に家庭向けの助成制度があり、2026年度のFIT制度は導入初期に手厚い設定です。水害リスクのある地域だからこそ、停電への備えとしての価値もあります。"
          />
          <div className="mt-12 grid gap-px bg-line sm:grid-cols-2">
            {MERITS.map((m) => (
              <div key={m.n} className="bg-white p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="font-en text-[13px] font-bold tracking-[0.2em] text-orange-500">{m.n}</p>
                  <Image src={m.icon.src} alt="" width={64} height={64} className="h-16 w-16" />
                </div>
                <h3 className="mt-3 text-[18px] leading-[1.5] font-bold text-navy-900">{m.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.9] text-ink-2">{m.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[12px] text-ink-3">
            助成額・FIT価格は{formatDateJa(siteConfig.subsidyInfoDate)}時点の公式情報です。詳しくは
            <Link href="/area/katsushika" className="mx-1 text-navy-600 underline underline-offset-4">葛飾区の太陽光発電ページ</Link>
            をご覧ください。
          </p>
        </Container>
      </section>

      {/* 4. 2026年度 葛飾区・東京都の補助金 */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="subsidy">
        <Container>
          <SectionHeading
            eyebrow="2026年度（令和8年度）の補助金"
            title={<span id="subsidy">葛飾区・東京都の太陽光・蓄電池補助金</span>}
            lead={`${formatDateJa(siteConfig.subsidyInfoDate)}時点で公式情報を確認した内容です。葛飾区の助成は工事着工4週間前までの事前協議が原則必要です。制度は変更される場合があるため、最新情報は各公式サイトをご確認ください。`}
          />
          <div className="mt-12 space-y-12">
            <div>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[20px] font-bold text-navy-900">葛飾区｜{katsushikaProgram.programName}</h3>
                <Link href="/subsidy/katsushika" className="text-[14px] font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                  葛飾区の補助金を詳しく見る
                </Link>
              </div>
              <SubsidyTable menus={katsushikaProgram.menus} caption={`申込期間：${katsushikaProgram.menus[0].applicationPeriod}／出典：${katsushikaProgram.sourceName}`} />
            </div>
            <div>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[20px] font-bold text-navy-900">東京都｜クール・ネット東京の家庭向け助成</h3>
                <Link href="/subsidy/tokyo" className="text-[14px] font-bold text-navy-600 underline underline-offset-4 hover:text-accent-text">
                  東京都の補助金を詳しく見る
                </Link>
              </div>
              <SubsidyTable menus={[...tokyoSolarProgram.menus, ...tokyoBatteryProgram.menus]} caption={`出典：${tokyoSolarProgram.sourceName}／${tokyoBatteryProgram.sourceName}`} />
            </div>
          </div>
          <SubsidyDisclaimer className="mt-8" />
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/subsidy" variant="secondary">補助金の総合ページへ</LinkButton>
            <LinkButton href="/subsidy/national" variant="ghost">国の補助制度の現状 <ArrowIcon /></LinkButton>
          </div>
        </Container>
      </section>

      {/* 5. 簡易シミュレーションへの導線 */}
      <section className="cv-auto bg-navy-900 py-16 text-white sm:py-20" aria-labelledby="sim">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <SectionHeading
                tone="dark"
                eyebrow="いくら補助される？"
                title={<span id="sim">住所・住宅区分・容量を選ぶだけ。わが家の想定助成額を試算できます。</span>}
                lead="葛飾区と東京都、それぞれの制度名・計算式・想定額・上限・注意点を分けて表示します。確認できていない併用を前提にした合算はしません。"
              />
              <div className="mt-8">
                <LinkButton href="/simulation" variant="accent" size="lg">
                  補助金シミュレーターを使う
                  <ArrowIcon />
                </LinkButton>
              </div>
            </div>
            <div className="border border-white/15 bg-navy-800 p-6">
              <p className="text-[12px] font-bold tracking-wide text-orange-400">試算例｜既存住宅・太陽光5kW・蓄電池7kWh</p>
              <dl className="mt-4 divide-y divide-white/10">
                {example.areas.map((a) => (
                  <div key={a.area} className="flex items-baseline justify-between py-3">
                    <dt className="text-[14px] text-navy-100/85">{a.label}の想定助成額（小計）</dt>
                    <dd className="text-[22px] font-bold text-white">
                      {a.subtotal.toLocaleString("ja-JP")}円
                      {a.hasCapOnly && <span className="ml-1 text-[11px] font-normal text-orange-400">※</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12px] leading-[1.7] text-navy-100/70">
                ※ 蓄電池の区の助成は対象経費の1/4（{kBattery.maxAmount}）のため、経費未入力時は上限額で表示。区と都は合算していません。{formatDateJa(siteConfig.subsidyInfoDate)}時点の公式情報による概算です。
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 6〜8. 太陽光／蓄電池／太陽光＋蓄電池 */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="services">
        <Container>
          <SectionHeading eyebrow="サービス" title={<span id="services">太陽光発電、蓄電池、そしてその組み合わせ。</span>} lead="住まいによって、最適な組み合わせは違います。それぞれの役割と、選ぶときに見るべきポイントを整理しました。" />
          <div className="mt-12 space-y-10">
            {SERVICES.map((s, i) => (
              <article key={s.href} className={`grid items-center gap-8 border-t border-line pt-10 lg:grid-cols-2 lg:gap-14 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <ImagePlaceholder src={s.image.src} alt={s.image.alt} ratio="3/2" label={`${s.title}の写真（差し替え）`} />
                <div>
                  <p className="font-en text-[12px] font-bold tracking-[0.22em] text-accent-text">{s.en}</p>
                  <h3 className="mt-2 text-[24px] font-bold text-navy-900 sm:text-[28px]">{s.title}</h3>
                  <p className="mt-4 text-[15px] leading-[1.95] text-ink">{s.body}</p>
                  <ul className="mt-5 space-y-1.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-[14px] text-ink-2">
                        <span className="h-[6px] w-[6px] bg-orange-500" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <LinkButton href={s.href} variant="secondary">{s.title}について詳しく <ArrowIcon /></LinkButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link href="/v2h" className="flex items-center justify-between border border-line bg-white px-5 py-4 hover:border-navy-900">
              <span>
                <span className="block text-[15px] font-bold text-navy-900">V2H（電気自動車の電気を家で使う）</span>
                <span className="block text-[13px] text-ink-3">葛飾区は本体価格の1/3（上限15万円）が助成対象</span>
              </span>
              <ArrowIcon className="h-4 w-4 shrink-0 text-navy-900" />
            </Link>
            <Link href="/hems" className="flex items-center justify-between border border-line bg-white px-5 py-4 hover:border-navy-900">
              <span>
                <span className="block text-[15px] font-bold text-navy-900">HEMS（エネルギーの見える化・制御）</span>
                <span className="block text-[13px] text-ink-3">葛飾区は2万円/台、太陽光との併設加算1万円</span>
              </span>
              <ArrowIcon className="h-4 w-4 shrink-0 text-navy-900" />
            </Link>
          </div>
        </Container>
      </section>

      {/* 9. おすすめ商品 */}
      <section className="cv-auto border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="products">
        <Container>
          <SectionHeading eyebrow="取扱商品" title={<span id="products">おすすめの太陽光パネル・蓄電池</span>} lead="メーカー公式情報で仕様を確認した商品だけを掲載します。価格が未確定の商品は「お問い合わせください」と表示し、架空の価格は出しません。" />
          {recommended.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-line bg-white p-6 sm:p-8">
              <p className="text-[16px] font-bold text-navy-900">商品ページは順次掲載予定です</p>
              <p className="mt-2 text-[14px] leading-[1.9] text-ink-2">
                現在、取扱メーカー・商品の情報を整理しています。候補として検討しているメーカーは以下のとおりです（取扱契約の有無を確認中のため、「正規取扱店」などの表記は行っていません）。
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {manufacturers.map((m) => (
                  <li key={m.id} className="border border-line bg-paper-2 px-3 py-1 text-[13px] text-ink-2">{m.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/recommend/solar" variant="secondary">おすすめ太陽光パネル</LinkButton>
            <LinkButton href="/recommend/battery" variant="secondary">おすすめ蓄電池</LinkButton>
            <LinkButton href="/products" variant="ghost">取扱商品一覧 <ArrowIcon /></LinkButton>
          </div>
        </Container>
      </section>

      {/* 10. 補助金を活用した導入イメージ */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="example">
        <Container>
          <SectionHeading eyebrow="補助金を活用した導入イメージ" title={<span id="example">たとえば、既存住宅に太陽光5kW＋蓄電池7kWhを導入する場合</span>} lead="制度ごとに計算式と想定額を分けて示します。金額は概算で、実際の対象可否・助成額は住宅条件・機器・申請時期で異なります。" />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {example.areas.map((a) => (
              <div key={a.area} className="border border-line bg-white">
                <div className="flex items-center justify-between border-b border-line bg-paper-2 px-5 py-3">
                  <h3 className="text-[16px] font-bold text-navy-900">{a.label}</h3>
                  <span className="text-[13px] text-ink-3">小計 <strong className="text-navy-900">{a.subtotal.toLocaleString("ja-JP")}円</strong></span>
                </div>
                <ul className="divide-y divide-line px-5">
                  {a.lines.map((l) => (
                    <li key={l.subsidy.id} className="flex items-start justify-between gap-4 py-3 text-[14px]">
                      <span>
                        <span className="block font-bold text-navy-900">{l.subsidy.name}</span>
                        <span className="block text-[12px] text-ink-3">{l.formula}</span>
                      </span>
                      <span className="shrink-0 font-bold text-navy-900">
                        {l.amount === null ? "—" : `${l.amount.toLocaleString("ja-JP")}円`}
                        {l.isCapOnly && <span className="ml-1 text-[11px] font-normal text-accent-text">（上限額）</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="list-disc space-y-1 bg-paper-2 px-5 py-3 pl-9 text-[12px] leading-[1.7] text-ink-2">
                  {a.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] leading-[1.8] text-ink-2">
            区と都の助成は<strong>合算していません</strong>。併用の可否と併用時の扱いは公式情報で明記が確認できていないため、申請前に各窓口への確認が必要です。ご自宅の条件での試算は<Link href="/simulation" className="mx-1 text-navy-600 underline underline-offset-4">補助金シミュレーター</Link>をご利用ください。
          </p>
        </Container>
      </section>

      {/* 11. 大切にすること */}
      <section className="cv-auto bg-navy-950 py-16 text-white sm:py-24" aria-labelledby="values">
        <Container>
          <SectionHeading tone="dark" eyebrow="SOLAR SHIFT が大切にすること" title={<span id="values">売るための提案ではなく、住まいのための計画を。</span>} />
          <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <div key={v.title} className="bg-navy-950 p-7 sm:p-9">
                <p className="font-en text-[13px] font-bold tracking-[0.2em] text-orange-400">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-[20px] font-bold text-white">{v.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.95] text-navy-100/80">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 12. 導入までの流れ */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="flow">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeading eyebrow="導入までの流れ" title={<span id="flow">相談から運転開始まで、申請の順番を間違えないように。</span>} lead="葛飾区の助成は「着工の4週間前までの事前協議」が原則です。契約日ではなく着工日から逆算して、申請と工事を組み立てます。" />
              <div className="mt-6">
                <LinkButton href="/flow" variant="secondary">流れを詳しく見る <ArrowIcon /></LinkButton>
              </div>
            </div>
            <Steps steps={FLOW.map((f) => ({ title: f.title, meta: f.meta, body: f.body }))} />
          </div>
        </Container>
      </section>

      {/* 13. 対応エリア */}
      <section className="cv-auto border-y border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="area">
        <Container>
          <SectionHeading eyebrow="対応エリア" title={<span id="area">葛飾区を中心に、周辺エリアへ。</span>} lead="主要対応エリアは東京都葛飾区です。足立区・江戸川区・墨田区など葛飾区周辺にも対応しています。その他の地域は個別にご相談ください。" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <AreaCard key={a.slug} area={a} />
            ))}
          </div>
        </Container>
      </section>

      {/* 14. 施工事例 */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="works">
        <Container>
          <SectionHeading eyebrow="施工事例" title={<span id="works">施工事例</span>} lead="実際に施工し、お客様の掲載許可をいただいた事例のみを掲載します。" />
          {works.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {works.map((w) => (
                <WorksCard key={w.slug} work={w} />
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-line-2 bg-white p-8 text-center">
              <p className="text-[16px] font-bold text-navy-900">施工事例は順次掲載予定です</p>
              <p className="mt-2 text-[14px] leading-[1.8] text-ink-2">掲載できる事例ができ次第、地域・住宅タイプ・設備構成・活用した補助金とともにご紹介します。架空の事例は掲載しません。</p>
            </div>
          )}
          <div className="mt-8">
            <LinkButton href="/works" variant="ghost">施工事例一覧 <ArrowIcon /></LinkButton>
          </div>
        </Container>
      </section>

      {/* 15. よくある質問 */}
      <section className="cv-auto border-t border-line py-16 sm:py-24" aria-labelledby="faq">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeading eyebrow="よくある質問" title={<span id="faq">補助金・費用・工事について、よくいただく質問</span>} />
              <div className="mt-6">
                <LinkButton href="/faq" variant="secondary">質問をすべて見る <ArrowIcon /></LinkButton>
              </div>
            </div>
            <FaqSection items={faqItems} withSchema />
          </div>
        </Container>
      </section>

      {/* 16. 最新ブログ */}
      {posts.length > 0 && (
        <section className="cv-auto border-t border-line bg-paper-2 py-16 sm:py-24" aria-labelledby="blog">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="ブログ" title={<span id="blog">葛飾区の補助金・太陽光・蓄電池の最新情報</span>} />
              <LinkButton href="/blog" variant="ghost">記事一覧 <ArrowIcon /></LinkButton>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 17. 運営会社 */}
      <section className="cv-auto py-16 sm:py-24" aria-labelledby="company">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <SectionHeading eyebrow="運営会社" title={<span id="company">株式会社サイプレスが運営しています</span>} lead="SOLAR SHIFT は、東京都葛飾区白鳥に本社を置く株式会社サイプレスの太陽光発電・蓄電池事業です。" />
            <div>
              <DefinitionList
                rows={[
                  { term: "サービス名", description: `${siteConfig.name}（${siteConfig.nameJa}）` },
                  { term: "運営会社", description: siteConfig.company.name },
                  { term: "代表者", description: `${siteConfig.company.representativeTitle} ${siteConfig.company.representative}` },
                  { term: "所在地", description: siteConfig.company.address.full },
                  { term: "設立", description: siteConfig.company.founded },
                  { term: "事業内容", description: siteConfig.company.businessDescription },
                ]}
              />
              <div className="mt-6">
                <LinkButton href="/company" variant="ghost">会社情報を見る <ArrowIcon /></LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 18. お問い合わせCTA */}
      <CtaSection
        title="わが家で使える補助金と、必要な設備。まず整理するところから。"
        body="現地調査・お見積もりは無料です。葛飾区・東京都の制度を踏まえ、申請の順番とスケジュールまで一緒に組み立てます。訪問販売や電話営業はしていません。"
      />

      <JsonLd
        data={graph(
          webPageSchema({
            path: "/",
            name: `${siteConfig.name}｜葛飾区の太陽光発電・蓄電池・補助金サポート`,
            description: siteConfig.description,
            dateModified: siteConfig.subsidyInfoDate,
          }),
        )}
      />
    </>
  );
}
