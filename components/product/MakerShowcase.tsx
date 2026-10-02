import Image from "next/image";
import Link from "next/link";
import { handlingManufacturers, manufacturerCategoryLabel, type Manufacturer, type ManufacturerCategory } from "@/data/manufacturers";

/**
 * 取扱メーカーの一覧。メーカー名のタイルを並べ、見出しに社数を大きく出す。
 *
 * - 出すのは、運営者に取扱いを確認できたメーカーだけ（data/manufacturers.ts の relationship）。
 * - ロゴは、メーカーから使用許諾を得たもの（logo）があればそれを、無ければ社名を文字で出す。
 *   他社の商標を、許諾なしに画像で使わない。
 * - 個別の商品は載せない方針なので、型番・仕様・価格は出さない。
 * - 流れ続けるアニメーション（ロゴのマーキー）にはしない。動き続けるものがあると、スマホの表示が重くなる。
 *
 * category … その種類を扱うメーカーに絞る（太陽光パネルの比べ方・蓄電池の比べ方のページ用）
 * detail   … 紹介文と公式サイトへのリンクも出す（商品ページ用）
 * level    … 見出しの階層（ページの中での位置に合わせる）
 */
export function MakerShowcase({
  category,
  detail = false,
  level = 2,
  headingId = "makers-h",
  className = "",
}: {
  category?: ManufacturerCategory;
  detail?: boolean;
  level?: 2 | 3;
  headingId?: string;
  className?: string;
}) {
  const list = handlingManufacturers(category);
  if (list.length === 0) return null;
  const Heading = level === 2 ? "h2" : "h3";
  const Sub = level === 2 ? "h3" : "h4";
  const lead = category === "solar" ? "太陽光パネルは、次の" : category === "battery" ? "蓄電池は、次の" : category ? "次の" : "国内外の主要メーカー";
  const tail = category ? "社を取り扱っています" : "社から、住まいに合う組み合わせをご提案します";

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="text-center">
        <p>
          <span className="inline-flex items-center rounded-full bg-navy-900 px-4 py-1 font-heading text-[13px] font-bold tracking-[0.08em] text-white">取扱メーカー</span>
        </p>
        <Heading id={headingId} className="mt-4 text-[21px] leading-[1.6] font-black text-navy-900 sm:text-[27px]">
          {lead}
          <span className="num-xl mx-1.5 align-[-0.08em] text-[42px] text-orange-700 sm:text-[52px]">{list.length}</span>
          {tail}
        </Heading>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-line bg-white p-4 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-4 sm:p-8">
        {list.map((m) => (
          <li key={m.id} className="flex min-h-[7.5rem] flex-col items-center justify-center px-1 py-3 text-center">
            <MakerMark maker={m} />
            <span className="mt-2.5 text-[14px] leading-[1.5] font-bold text-ink">{m.brand}</span>
            <span className="mt-0.5 text-[12px] leading-[1.5] text-ink-2">{categoryText(m)}</span>
          </li>
        ))}
        <li className="flex min-h-[7.5rem] flex-col items-center justify-center px-1 py-3 text-center">
          <span className="text-[14px] leading-[1.7] font-bold text-navy-900">
            このほかのメーカーも
            <br />
            ご相談ください
          </span>
        </li>
      </ul>

      <p className="mt-4 text-[13px] leading-[1.8] text-ink-2">
        ※ 個別の商品は掲載していません。機種は、屋根と電気の使い方を伺ったうえでご提案します。保証の年数と条件は、メーカー・製品によって異なります。取扱メーカー・機種は、変更になる場合があります。記載の会社名・ブランド名は、各社の商標または登録商標です。
      </p>

      {detail && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {list.map((m) => (
            <li key={m.id} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr_auto] sm:items-center sm:gap-6">
              <Sub className="text-base leading-[1.5] font-bold text-navy-900">
                {m.brand}
                {m.name !== m.brand && <span className="block text-[13px] font-normal text-ink-2">{m.name}</span>}
              </Sub>
              <p className="text-[15px] leading-[1.8] text-ink-2">{m.summary}</p>
              <a href={m.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[14px] font-bold whitespace-nowrap text-navy-700 underline underline-offset-4 hover:text-accent-text">
                公式サイト
                <span className="sr-only">（{m.brand}・別のタブで開きます）</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {!detail && (
        <p className="mt-5 text-center">
          <Link href="/products" className="inline-flex min-h-11 items-center font-bold text-navy-700 underline underline-offset-4 hover:text-accent-text">
            メーカーごとの紹介と、機器の比べ方を見る
          </Link>
        </p>
      )}
    </section>
  );
}

/** ロゴ（使用許諾を得たもの）があれば画像で、無ければ英字の社名を文字で出す */
function MakerMark({ maker }: { maker: Manufacturer }) {
  if (maker.logo) {
    return <Image src={maker.logo.src} alt="" width={maker.logo.width} height={maker.logo.height} sizes="160px" className="h-9 w-auto max-w-[9.5rem] object-contain" />;
  }
  return (
    <span className="font-en text-[19px] leading-[1.2] font-extrabold tracking-[0.01em] text-navy-900 sm:text-[21px]" aria-hidden="true">
      {maker.nameEn}
    </span>
  );
}

function categoryText(m: Manufacturer): string {
  return m.categories
    .map((c) => manufacturerCategoryLabel[c])
    .filter((x): x is string => Boolean(x))
    .join("・");
}
