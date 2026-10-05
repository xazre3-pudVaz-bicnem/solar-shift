import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/data/guides";
import { sources as verified } from "@/data/sources";
import { reveal } from "@/lib/reveal";
import { GuideArticle } from "@/components/sections/GuideArticle";

/**
 * 売電収入と税金のガイド。
 * 検索意図：「太陽光 売電 確定申告」「売電収入 税金」「太陽光 補助金 確定申告」「太陽光 固定資産税」
 * ＝ 確定申告が必要か、何所得になるか、住民税・補助金・固定資産税はどうなるかを知りたい。
 *
 * - 国税庁・葛飾区・東京都主税局の公開情報にあることだけを書く。出どころは同じ文に書く。
 * - 税額の計算例は書かない。人によって違うので、税務署・区・都税事務所に確かめるよう添える。
 * - 住宅の太陽光が固定資産税（償却資産）の申告の対象になるかは、断定しない。
 */
const entry = getGuide("solar-tax")!;

export const metadata: Metadata = buildMetadata({
  title: entry.title,
  description:
    "会社員が自宅の太陽光で余った電気を売った収入は、国税庁によると雑所得です。確定申告が必要になる20万円の考え方、確定申告をしないときの住民税の申告、消費税、区や都の補助金、固定資産税の扱いを、国税庁・葛飾区・東京都主税局の資料で整理しました。",
  path: entry.path,
  keywords: ["太陽光 売電 確定申告", "売電収入 税金", "売電 雑所得", "太陽光 補助金 確定申告", "太陽光 固定資産税", "売電 住民税 申告"],
  type: "article",
  publishedTime: entry.publishedAt,
  modifiedTime: entry.updatedAt,
});

/** 所得の計算を、式で見せる図 */
function IncomeFigure() {
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">売電の所得の考え方</figcaption>
      <div className="mt-5 grid items-center gap-2.5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-3">
        <p className="rounded-2xl bg-white px-4 py-4 text-center shadow-card" {...reveal(0, "pop")}>
          <span className="block text-[15px] font-black text-navy-900">売電収入</span>
          <span className="mt-1 block text-[12px] leading-[1.6] text-ink-2">1年間に電力会社から受け取った売電の代金</span>
        </p>
        <span className="text-center font-en text-[26px] font-extrabold text-accent-text" aria-hidden="true">
          −
        </span>
        <p className="rounded-2xl bg-white px-4 py-4 text-center shadow-card" {...reveal(120, "pop")}>
          <span className="block text-[15px] font-black text-navy-900">必要経費</span>
          <span className="mt-1 block text-[12px] leading-[1.6] text-ink-2">設備の減価償却費のうち、売った電気の割合の分など</span>
        </p>
        <span className="text-center font-en text-[26px] font-extrabold text-accent-text" aria-hidden="true">
          ＝
        </span>
        <p className="rounded-2xl bg-orange-500 px-4 py-4 text-center text-navy-900 shadow-card" {...reveal(240, "pop")}>
          <span className="block text-[15px] font-black">雑所得</span>
          <span className="mt-1 block text-[12px] leading-[1.6] font-bold">確定申告が必要かどうかは、この「所得」で判断する</span>
        </p>
      </div>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">
        出典：国税庁 質疑応答事例「自宅に設置した太陽光発電設備による余剰電力の売却収入」、タックスアンサー No.1900。給与所得者が、家事用の設備で余った電気を売っている場合の考え方です。
      </p>
    </figure>
  );
}

/** 会社員の場合の、申告の分かれ目 */
function FilingFigure() {
  return (
    <figure className="rounded-3xl bg-cream px-4 py-6 sm:px-7 sm:py-8">
      <figcaption className="text-[17px] leading-[1.5] font-black text-navy-900 sm:text-[19px]">会社員の場合の、申告の分かれ目</figcaption>
      <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-[14px] leading-[1.7] font-bold text-navy-900 shadow-card" {...reveal()}>
        給与を1か所から受けていて、その全部が源泉徴収の対象。給与と退職金以外の所得の合計は、20万円を超える？
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card" {...reveal(120, "left")}>
          <p className="inline-block rounded-full bg-orange-500 px-3 py-1 text-[13px] font-black text-navy-900">超える</p>
          <p className="mt-3 text-[15px] leading-[1.75] text-ink">所得税の確定申告が必要です（国税庁 No.1900）。確定申告をすると、区への住民税の申告はいりません（葛飾区）。</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card" {...reveal(240, "right")}>
          <p className="inline-block rounded-full bg-green-600 px-3 py-1 text-[13px] font-black text-white">超えない</p>
          <p className="mt-3 text-[15px] leading-[1.75] text-ink">この条件では、所得税の確定申告はいりません。ただし、売電の所得があれば、区への住民税の申告が必要です（葛飾区）。医療費控除などで確定申告をするときは、売電の所得もあわせて申告します（国税庁）。</p>
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-2">
        確定申告が必要な人の条件は、ほかにもあります（給与の年間収入金額が2,000万円を超える人など）。確定申告をすれば税金が還付される人は、この条件から除かれます。くわしくは国税庁のタックスアンサー No.1900 をご覧ください。
      </p>
    </figure>
  );
}

export default function Page() {
  return (
    <GuideArticle
      entry={entry}
      conclusion="国税庁の質疑応答事例によると、会社員が自宅の太陽光発電で余った電気を売った収入は、設備を家事用に使っている場合、雑所得に当たります。給与を1か所から受けていて全部が源泉徴収の対象になっている人は、給与と退職金以外の所得の合計が20万円を超えると、確定申告が必要です（国税庁 No.1900）。確定申告をしない場合でも、売電の所得があれば、葛飾区への住民税の申告が必要です（区の案内）。"
      points={[
        "家庭の太陽光で余った電気を売った収入は、雑所得（国税庁の質疑応答事例）",
        "所得 ＝ 売電収入 − 必要経費。設備の減価償却費は、発電量のうち売った電気の割合で計算（国税庁）",
        "給与1か所・全部が源泉徴収の会社員は、給与と退職金以外の所得の合計が20万円を超えると確定申告（国税庁 No.1900）",
        "確定申告をしなくても、売電の所得があれば、区への住民税の申告が必要（葛飾区）",
        "家庭用の余剰売電に、消費税はかからない（国税庁の質疑応答事例）",
      ]}
      tip={{
        title: "税額は、人によって違います",
        body: (
          <>
            所得の合計や控除によって、税額は一人ひとり違います。このページは、<strong className="marker">国税庁・葛飾区・東京都主税局の公開情報</strong>をまとめたものです。わが家の場合は、税務署や区の税務課に確かめてください。
          </>
        ),
      }}
      sections={[
        {
          id: "income",
          heading: "売電収入は「雑所得」",
          body: (
            <>
              <p>
                国税庁の質疑応答事例は、給与所得者が自宅に太陽光発電設備を設置し、固定価格買取制度に基づいて余った電気を電力会社に売っている場合を取り上げています。設備を家事用資産として使い、余った電気を売っているような場合、売った収入は雑所得に当たります。
              </p>
              <p>同じ質疑応答事例によると、売電を事業として行っている場合や、ほかに事業所得があり、その付随業務として行っているような場合は、事業所得に当たると考えられます。給与所得者が全量売電を行っている場合の収入も、事業として行われている場合を除き、雑所得に当たると考えられます。</p>
              <p>国税庁によると、質疑応答事例は一般的な回答で、具体的な取引に当てはめると、回答と異なる課税関係が生ずることがあります。</p>
              <h3>消費税はかからない</h3>
              <p>
                国税庁の質疑応答事例（消費税）によると、事業者ではない人が、生活のために設置した太陽光発電設備から出た余剰電力を売ることは、消費税の課税の対象になりません。一方で、会社員が行う全量売電は、反復・継続・独立して行う取引に当たり、課税の対象になります。
              </p>
            </>
          ),
        },
        {
          id: "calc",
          heading: "所得の計算：売電収入から必要経費を引く",
          body: (
            <>
              <p>雑所得は、売電収入から必要経費を引いた金額です。確定申告が必要かどうかの「20万円」は、収入ではなく、この所得の金額で考えます（国税庁 No.1900）。</p>
              <p>
                国税庁の質疑応答事例によると、太陽光発電設備は、一般に「機械及び装置」に分類されると考えられ、照会の場合の耐用年数は17年です。必要経費に入れる減価償却費は、発電量のうちに売った電気の量が占める割合を、業務用の割合として計算した金額です。
              </p>
              <p>
                確定申告書等作成コーナーで入力するときは、「申告する所得の選択等」の画面で「雑（業務・その他）」を選び、「雑所得（業務・その他）」から入力します（国税庁の確定申告書等作成コーナー よくある質問）。
              </p>
            </>
          ),
          figure: <IncomeFigure />,
        },
        {
          id: "filing",
          heading: "確定申告が必要になるのは、どんなとき？",
          body: (
            <>
              <p>国税庁のタックスアンサー No.1900 によると、大部分の給与所得者は、年末調整で所得税が確定するため、確定申告の必要はありません。ただし、次のような人は確定申告が必要です。</p>
              <ul>
                <li>給与の年間収入金額が2,000万円を超える人</li>
                <li>給与を1か所から受けていて、その全部が源泉徴収の対象となる場合に、給与所得・退職所得以外の所得金額の合計が20万円を超える人</li>
              </ul>
              <p>確定申告をすれば税金が還付される人は、この条件から除かれます。給与を2か所以上から受けている人などの条件も、No.1900 にあります。</p>
              <h3>20万円以下でも、確定申告をするなら売電の所得も書く</h3>
              <p>
                国税庁の Q&A「確定申告を要しない場合の意義」によると、20万円以下の決まりは、確定申告をしなくてよい場合を定めたものです。たとえば医療費控除を受けるために還付申告をするときは、給与所得だけでなく、20万円以下の所得もあわせて申告する必要があります。
              </p>
            </>
          ),
          figure: <FilingFigure />,
        },
        {
          id: "resident",
          heading: "確定申告をしないときの、住民税の申告（葛飾区）",
          body: (
            <>
              <p>葛飾区の案内によると、住民税の申告が必要なのは、1月1日現在、区内に住んでいて、前年中に所得があった方です。次のような方は、申告が必要ありません。</p>
              <ul>
                <li>税務署に、所得税の確定申告をした方</li>
                <li>前年中の収入が給与のみで、勤務先から給与支払報告書が区に提出されている方（源泉徴収票に含まれていない控除を追加する方を除く）</li>
              </ul>
              <p>
                売電の収入は給与ではないので、売電の所得がある方で、所得税の確定申告をしない場合は、区への住民税の申告が必要です。問い合わせ先は、葛飾区 税務課（課税第一係・課税第二係・課税第三係）03-5654-8550 です。
              </p>
              <p>葛飾区以外にお住まいの方は、お住まいの区や市の案内をご確認ください。</p>
            </>
          ),
        },
        {
          id: "subsidy",
          heading: "区や都の補助金を受けたときの扱い",
          body: (
            <>
              <p>
                国税庁のタックスアンサー No.2202 によると、固定資産の取得や改良に充てるために、国や地方公共団体の補助金の交付を受け、交付の目的に合った固定資産の取得や改良をしたときは、確定申告書に一定の事項を記載することを条件に、充てた部分の金額を総収入金額に入れない取扱いがあります。申告には「国庫補助金等の総収入金額不算入に関する明細書」を添付します。
              </p>
              <p>No.2202 によると、この取扱いを受けた場合、設備の取得費は、実際にかかった金額から補助金の額を引いた残りになり、減価償却費もこれをもとに計算します。</p>
              <p>
                国税庁の所得税基本通達（34-1）は、この取扱いを受けない補助金を、一時所得の例に挙げています。国税庁のタックスアンサー No.1490 によると、一時所得は、総収入金額から、収入を得るために支出した金額と特別控除額（最高50万円）を引いて計算し、その2分の1をほかの所得と合計して税額を計算します。
              </p>
              <p>補助金の扱いは、申告のしかたで変わります。区や都の補助金を受けた年の申告は、税務署に確かめてください。補助金の金額と申請の流れは、<Link href="/subsidy/katsushika">葛飾区の補助金</Link>と<Link href="/subsidy/tokyo">東京都の補助金</Link>のページにまとめています。</p>
            </>
          ),
        },
        {
          id: "property",
          heading: "固定資産税（償却資産）のこと",
          body: (
            <>
              <p>
                東京都主税局によると、固定資産税の償却資産は、土地と家屋以外の、事業の用に供することができる資産で、その減価償却費が、所得の計算で必要な経費に入るものです。償却資産を持っている方は、毎年1月1日現在の内容を、1月31日までに、資産のある区の都税事務所に申告します。
              </p>
              <p>
                東京都（23区）の「償却資産と家屋の区分表」は、家屋と設備の持ち主が同じ場合の例として、屋根材一体型のソーラーパネルを「家屋に含める主なもの」に、それ以外の太陽電池パネル・パワーコンディショナー・架台などの発電設備一式を「償却資産とする主なもの」に分けています。
              </p>
              <p>住宅の太陽光発電設備が、償却資産の申告の対象になるかどうかは、このページでは判断できません。資産のある区の都税事務所に確かめてください。</p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "売電収入が20万円以下なら、確定申告はいりませんか？",
          a: "国税庁のタックスアンサー No.1900 によると、給与を1か所から受けていて全部が源泉徴収の対象になる人は、給与所得・退職所得以外の所得の合計が20万円を超えるときに、確定申告が必要です。20万円は、売電収入から必要経費を引いた所得の金額で考えます。確定申告をしない場合も、売電の所得があれば、葛飾区への住民税の申告が必要です（区の案内）。",
        },
        {
          q: "医療費控除で確定申告をします。20万円以下の売電の所得も書きますか？",
          a: "書きます。国税庁の Q&A「確定申告を要しない場合の意義」によると、20万円以下で確定申告を要しない場合でも、医療費控除を受けるための還付申告などをするときは、給与所得だけでなく、20万円以下の所得もあわせて申告する必要があります。",
        },
        {
          q: "売電収入の必要経費には、何を入れられますか？",
          a: "国税庁の質疑応答事例によると、太陽光発電設備の減価償却費は、発電量のうち売った電気の割合を業務用の割合として計算した金額を、必要経費に入れます。耐用年数は17年とされています。",
        },
        {
          q: "売電収入に消費税はかかりますか？",
          a: "国税庁の質疑応答事例によると、事業者ではない人が、生活のために設置した太陽光発電設備から出た余剰電力を売ることは、消費税の課税の対象になりません。会社員が行う全量売電は、課税の対象になります。",
        },
        {
          q: "区や都の補助金に、税金はかかりますか？",
          a: "国税庁のタックスアンサー No.2202 によると、固定資産の取得に充てるための補助金を受けて、目的どおりに取得したときは、確定申告書に一定の事項を書くことを条件に、充てた部分を総収入金額に入れない取扱いがあります。この取扱いを受けない補助金は一時所得に当たり、一時所得には最高50万円の特別控除があります（国税庁）。わが家の場合は、税務署に確かめてください。",
        },
        {
          q: "太陽光パネルに、固定資産税はかかりますか？",
          a: "東京都（23区）の区分表では、屋根材一体型のソーラーパネルは「家屋に含める主なもの」に入っています。架台で載せるパネルやパワーコンディショナーなどの扱いは、資産のある区の都税事務所に確かめてください。",
        },
      ]}
      sources={[
        verified.ntaSellingIncome,
        verified.ntaSalaryEarnerFiling,
        verified.ntaFilingNotRequiredQa,
        verified.ntaKeisanSelling,
        verified.ntaSellingConsumptionTax,
        verified.ntaSubsidyIncome,
        verified.ntaTemporaryIncomeCircular,
        verified.ntaTemporaryIncome,
        verified.katsushikaResidentTax,
        verified.katsushikaResidentTaxFaq,
        verified.tokyoTaxDepreciable,
        verified.tokyoTaxAssetTable,
      ]}
      relatedCategories={["fit", "solar"]}
      cta={{
        title: "売電と、家で使う電気の見込みを整理します。",
        body: "税金のご相談は税務署や区の税務課へお願いします。SOLAR SHIFT では、屋根の条件と電気の使い方から、売る電気と家で使う電気の見込み、補助金の金額を整理してお伝えします。相談・見積もりは無料です。",
      }}
    />
  );
}
