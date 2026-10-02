import { handlingManufacturers } from "@/data/manufacturers";
import { publishedWorks, workArea } from "@/data/works";
import { SITE_URL, IS_PUBLIC, formatDateJa } from "@/lib/seo";
import { siteConfig, addressWithPostal, contactEmail } from "@/lib/site";
import { subsidyPrograms, statusLabel } from "@/data/subsidies";
import { guides } from "@/data/guides";
import { faqs } from "@/data/faq";
import { fit } from "@/data/fit";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

/**
 * /llms.txt … AI 検索（ChatGPT・Claude・Perplexity・Gemini など）向けの、サイトの要約と主要ページの一覧。
 * 補助金の数値は data/subsidies からそのまま出す（ここに直書きしない）。
 * 本番 URL が未設定のビルドでは、内容を出さない（プレビューの内容を配らない）。
 */
export function GET() {
  if (!IS_PUBLIC || !SITE_URL) {
    return new Response("# SOLAR SHIFT\n\nこのサイトは公開準備中です。\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });
  }
  const url = (p: string) => `${SITE_URL}${p === "/" ? "" : p}`;
  const date = formatDateJa(siteConfig.subsidyInfoDate);
  const c = siteConfig.company;

  const subsidyLines = subsidyPrograms.flatMap((p) => [
    ``,
    `### ${p.programName}（${p.issuer}・${p.fiscalYear}）`,
    `出典: ${p.menus[0]?.sourceUrl ?? ""}（${formatDateJa(p.menus[0]?.lastVerified ?? siteConfig.subsidyInfoDate)}確認）`,
    ...p.menus.map((m) => {
      const pre = m.preApplicationRequired ? `事前手続きが必要${m.preApplicationNote ? `（${m.preApplicationNote}）` : ""}。` : "";
      const conditions = m.conditions.length > 0 ? `主な条件: ${m.conditions.join("／")}。` : "";
      return `- ${m.name}: ${m.amount.replace(/\n/g, "／")}（${m.maxAmount}）。受付状況: ${statusLabel[m.status]}。${pre}${conditions}`;
    }),
  ]);

  const lines = [
    `# ${siteConfig.name}（${siteConfig.nameJa}）`,
    ``,
    `> ${siteConfig.description}`,
    ``,
    `このサイトの補助金・制度の情報は、葛飾区・東京都・国の公式情報を${date}時点で確認したものです。制度は変更・終了することがあります。引用するときは、確認日と各制度の公式サイトをあわせて示してください。`,
    ``,
    `## 運営`,
    `- 運営会社: ${c.name}（${c.representativeTitle} ${c.representative}、設立 ${c.founded}）`,
    `- 所在地: ${addressWithPostal()}`,
    `- 主要対応エリア: ${siteConfig.primaryArea.prefecture}${siteConfig.primaryArea.name}（周辺: 足立区・江戸川区・墨田区）`,
    `- 連絡先: お問い合わせフォーム ${url("/contact")}${siteConfig.contact.telDisplay ? `／電話 ${siteConfig.contact.telDisplay}` : ""}${contactEmail() ? `／メール ${contactEmail()}` : ""}`,
    `- 編集方針: ${url("/editorial-policy")}`,
    ``,
    `## 補助金（${date}時点の公式情報）`,
    `葛飾区と東京都の助成は別の制度です。葛飾区の案内には「国や都の補助制度との併用も可能」と明記されていますが、補助金の合計は助成対象経費が上限のため、当サイトでは金額を合算していません。`,
    ...subsidyLines,
    ``,
    `## FIT（固定価格買取制度）`,
    `- ${fit.fiscalYear}・住宅用（10kW未満）: ${fit.residential.steps.map((s) => `${s.label} ${s.yenPerKwh}円/kWh`).join("、")}（調達期間${fit.residential.termYears}年）。出典: ${fit.sourceUrl}`,
    ``,
    `## 主なページ`,
    `- [葛飾区の太陽光・蓄電池補助金](${url("/subsidy/katsushika")}): かつしかエコ助成金の金額・条件・事前協議・申請の流れ`,
    `- [東京都の太陽光・蓄電池補助金](${url("/subsidy/tokyo")}): クール・ネット東京の家庭向け助成の単価・上限・SII登録要件`,
    `- [国の補助制度](${url("/subsidy/national")}): DR補助金・CEV補助金・みらいエコ住宅の受付状況`,
    `- [補助金の総合ページ](${url("/subsidy")}): 区・都・国の3層の整理`,
    `- [補助金シミュレーター](${url("/simulation")}): 条件を選んで区・都それぞれの想定助成額を試算`,
    `- [葛飾区の太陽光・蓄電池業者](${url("/area/katsushika")}): 区内の対応エリア、業者を選ぶときの確認点、相談の進め方、住宅事情と水害リスク`,
    `- [太陽光発電](${url("/solar")}) / [家庭用蓄電池](${url("/battery")}) / [太陽光＋蓄電池](${url("/solar-battery")}) / [V2H](${url("/v2h")}) / [HEMS](${url("/hems")})`,
    `- [導入・施工の流れ](${url("/flow")}): 相談から申請・工事・運転開始まで`,
    `- [よくある質問](${url("/faq")}): ${faqs.length}問`,
    `- [運営会社](${url("/company")})`,
    ``,
    `## 導入ガイド`,
    `- [導入ガイド一覧](${url("/guide")})`,
    ...guides.map((g) => `- [${g.title}](${url(g.path)}): ${g.description}`),
    ``,
    `## ブログ（新しい順・最新20件）`,
    `- [ブログ一覧](${url("/blog")}) / RSS: ${url("/feed.xml")}`,
    ...getAllPosts()
      .slice(0, 20)
      .map((p) => `- [${p.title}](${url(`/blog/${p.slug}`)}): ${p.description}`),
    ``,
    ...(publishedWorks.length > 0
      ? [
          `## 施工事例（掲載の許可を得た事例）`,
          `- [施工事例の一覧](${url("/works")})`,
          ...publishedWorks.map((w) => `- [${w.label}](${url(`/works/${w.slug}`)}): ${workArea(w)}・${w.customer}。導入した設備は${w.equipment}`),
          ``,
        ]
      : []),
    `## 取扱メーカー`,
    `- ${handlingManufacturers().map((m) => m.brand).join("、")}（一覧: ${url("/products")}）。個別の商品・型番・価格は掲載していません。`,
    ``,
    `## このサイトの方針`,
    `- 補助金の交付可否・金額は自治体等の審査で決まります。当サイトの情報は交付を保証するものではありません。`,
    `- 施工事例は、掲載許可を得たものだけを掲載します。事例の電気代は、そのお客様のおおよその月額で、同じ結果を保証するものではありません。お客様の声（ご本人の言葉の引用）は掲載していません。`,
    `- 個別の商品（型番・仕様・価格）は掲載していません。`,
    ``,
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
