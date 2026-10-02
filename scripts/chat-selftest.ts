/**
 * チャット（自動応答）の自己診断。API を呼ばずに、照合・出力検査・応答の組み立てを確かめる。
 *   npx tsx scripts/chat-selftest.ts
 *
 * - よくある質問との照合：言い回しを変えた質問が、期待する回答に当たるか
 * - 出力検査：公開している回答はすべて合格し、断定・未確認の数字・未確定の連絡先は落ちるか
 * - 応答の組み立て：AI の出力が不正なときに、決まった回答へ切り替わるか
 */
import { faqs } from "../data/faq";
import { matchFaq, matchScripted, scriptedAnswers, FAQ_MATCH_THRESHOLD } from "../lib/chat/scripted";
import { checkReply } from "../lib/chat/guard";
import { respond, respondLocally, parseModelOutput, cleanAnswer } from "../lib/chat/respond";
import { buildChatSystemPrompt, chatLinkTargets } from "../lib/chat/prompt";
import { loadFacts } from "../lib/blog-generator/facts";
import { CHAT_INITIAL_SUGGESTIONS } from "../lib/chat/initial";
import { getFaq, getScripted } from "../lib/chat/scripted";
import { siteConfig } from "../lib/site";

const SITE_TEL: string = siteConfig.contact.tel;
const SITE_TEL_DISPLAY: string = siteConfig.contact.telDisplay;

let failed = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (!cond) {
    failed += 1;
    console.log(`  NG  ${label}${detail ? `  →  ${detail}` : ""}`);
  }
};

// ── 1. よくある質問との照合（期待する id。"-" は「該当なし」が正しい）
const QUERIES: [string, string][] = [
  ["葛飾区の補助金っていくらもらえるの？", "subsidy-katsushika-overview"],
  ["かつしかエコ助成金の金額を教えてください", "subsidy-katsushika-overview"],
  ["太陽光の補助金 葛飾区", "subsidy-katsushika-overview"],
  ["工事が終わってから申請しても大丈夫？", "subsidy-pre-consultation"],
  ["申請はいつまでにすればいいですか", "subsidy-pre-consultation"],
  ["事前協議って何ですか", "subsidy-pre-consultation"],
  ["区と都の補助金は両方もらえますか", "subsidy-combination"],
  ["葛飾区と東京都は併用できる？", "subsidy-combination"],
  ["東京都の補助金はいくらですか", "subsidy-tokyo-overview"],
  ["クールネット東京の太陽光助成", "subsidy-tokyo-overview"],
  ["SII登録機器ってなに", "subsidy-tokyo-battery-sii"],
  ["国の補助金はまだ使えますか", "subsidy-national"],
  ["DR補助金は終わった？", "subsidy-national"],
  ["補助金は絶対もらえますか", "subsidy-guarantee"],
  ["太陽光の設置費用はいくら", "cost-solar"],
  ["蓄電池っていくらするの", "cost-battery"],
  ["何年で元が取れますか", "cost-payback"],
  ["うちの屋根でも設置できますか", "solar-roof"],
  ["太陽光パネルは何年もちますか", "solar-lifespan"],
  ["停電のときに電気は使える？", "solar-blackout"],
  ["蓄電池は何kWhがいいですか", "battery-capacity"],
  ["蓄電池は後付けできますか", "battery-set"],
  ["V2Hって何", "v2h-what"],
  ["HEMSは必要ですか", "hems-what"],
  ["設置までどのくらいかかりますか", "install-period"],
  ["現地調査は無料ですか", "install-survey"],
  ["どんな会社がやっているの", "service-company"],
  ["足立区は対応していますか", "service-area"],
  ["訪問販売はしていますか", "service-sales"],
  ["今日の天気は？", "-"],
  ["おすすめのラーメン屋を教えて", "-"],
  ["Pythonでソートを書いて", "-"],
  ["株価の予想をして", "-"],
];

console.log(`\n[1] よくある質問との照合（しきい値 ${FAQ_MATCH_THRESHOLD}）`);
for (const [q, expected] of QUERIES) {
  const m = matchFaq(q);
  const got = m ? m.faq.id : "-";
  ok(got === expected, q, `期待 ${expected} / 実際 ${got}${m ? ` (${m.score.toFixed(2)})` : ""}`);
}
if (process.argv.includes("--scores")) {
  for (const [q] of QUERIES) {
    const scored = faqs
      .map((f) => ({ id: f.id, m: matchFaq(q) }))
      .slice(0, 1)
      .map((x) => (x.m ? `${x.m.faq.id} ${x.m.score.toFixed(2)}` : "none"));
    console.log(`     ${q}  →  ${scored.join(", ")}`);
  }
}

// ── 2. 決まった案内文の条件
console.log("\n[2] 決まった案内文");
const SCRIPTED: [string, string][] = [
  ["電話番号を教えてください", "tel"],
  ["LINEで相談できますか", "tel"],
  ["営業時間は？", "tel"],
  ["見積もりをお願いしたい", "contact"],
  ["相談したいです", "contact"],
  ["うちだといくらになるか試算したい", "simulate"],
  ["シミュレーションはできますか", "simulate"],
  ["施工事例を見たい", "works"],
  ["口コミはありますか", "works"],
  ["取り扱いメーカーは？", "products"],
  ["会社の住所を教えてください", "address"],
  ["SOLAR SHIFTはどこにありますか", "address"],
  ["所在地は？", "address"],
];
for (const [q, expected] of SCRIPTED) {
  const s = matchScripted(q);
  ok(s?.id === expected, q, `期待 ${expected} / 実際 ${s?.id ?? "-"}`);
}
for (const q of ["蓄電池の設置場所を教えて", "申請窓口はどこにありますか", "住所は葛飾区ですが対象になりますか"]) {
  ok(matchScripted(q)?.id !== "address", `所在地の案内に当てない：${q}`, matchScripted(q)?.id ?? "-");
}
{
  const r = respondLocally("現地調査は無料ですか");
  ok(r.mode === "faq", "「現地調査は無料ですか」はよくある質問を優先", r.mode);
  const r2 = respondLocally("今日の天気は？");
  ok(r2.mode === "fallback", "無関係な質問は案内文", r2.mode);
}

// ── 3. 出力検査
console.log("\n[3] 出力検査");
for (const f of faqs) ok(checkReply(f.a).length === 0, `FAQ ${f.id} は合格するはず`, checkReply(f.a).join(" / "));
for (const s of scriptedAnswers) ok(checkReply(s.answer).length === 0, `案内文 ${s.id} は合格するはず`, checkReply(s.answer).join(" / "));
const BAD: [string, string][] = [
  ["SOLAR SHIFT に頼めば補助金は必ずもらえます。", "断定"],
  ["葛飾区と東京都を合わせて85万円になります。", "区と都の合計額"],
  ["区と都の補助金は両方とも全額もらえます。", "上限なしに受け取れるかのような表現"],
  ["5kWの場合、交付額は30万円となります。", "交付の言い切り"],
  ["区の助成で30万円もらえます。", "交付の言い切り（もらえます）"],
  ["太陽光の相場は5kWで約150万円です。", "相場"],
  ["5kWなら年間 5,500kWh 発電します。", "発電量"],
  ["電気代を40%削減できます。", "削減率"],
  ["葛飾区の助成は太陽光で最大35万円です。", "事実シートにない金額"],
  ["FITの買取価格は16円/kWhです。", "事実シートにない単価"],
  ["お電話は 03-1234-5678 までどうぞ。", "未確認の電話番号"],
  ["LINEでご相談ください。", "未確定の連絡手段"],
  ["お電話は 090-1234-5678 までどうぞ。", "未確認の携帯番号"],
  ["お電話は09012345678まで。", "ハイフンなしの未確認番号"],
  ["お電話は 03（1234）5678 です。", "かっこ書きの未確認番号"],
  ["電話の受付時間は9時から18時です。", "未確定の受付時間"],
  ["お電話は平日10:00〜17:00に承ります。", "未確定の受付時間（時刻の範囲）"],
  ["年中無休で対応しています。", "未確定の営業日"],
  ["当社は施工実績 1,200件の正規取扱店です。", "実績・資格"],
  ["詳しくは https://example.com をご覧ください。", "URL"],
  ["8年で元が取れます。", "投資回収の断定"],
  ["私はスタッフの山田です。", "人間を名乗る"],
];
for (const [text, label] of BAD) ok(checkReply(text).length > 0, `落とすべき回答：${label}`, text);
ok(checkReply("蓄電池の経費が150万円の場合でも、区の助成は上限20万円です。", "うちは蓄電池が150万円です").length === 0, "利用者が書いた金額の復唱は許す");
ok(checkReply("葛飾区の窓口は葛飾区役所 環境部環境課 環境計画係（TEL 03-5654-8228）です。").length === 0, "公的窓口の電話番号は許す");
ok(checkReply("併用できます。葛飾区の案内に、国や都の補助制度との併用も可能と明記されています。ただし、補助金の合計が助成対象経費を上回る場合は、上回る額が減額されます。").length === 0, "併用できる旨の案内（上限つき）は許す");
ok(checkReply("葛飾区の太陽光は6万円/kW（上限30万円）です。5kWの場合、計算上の目安は上限の30万円です。").length === 0, "目安・上限としての金額は許す");
ok(checkReply("所在地は 〒125-0061 東京都葛飾区亀有3丁目16-14 です。2026年10月1日時点の情報です。").length === 0, "郵便番号・番地・日付を電話番号と取り違えない");
if (SITE_TEL) {
  ok(checkReply(`お電話（${SITE_TEL_DISPLAY}）またはお問い合わせフォームでご相談ください。`).length === 0, "サイトの電話番号は許す", checkReply(`お電話（${SITE_TEL_DISPLAY}）またはお問い合わせフォームでご相談ください。`).join(" / "));
  ok(checkReply(`お電話は ${SITE_TEL} です。`).length === 0, "サイトの電話番号（ハイフンなし）も許す");
} else {
  ok(checkReply("お電話でご相談ください。").length > 0, "電話番号が未設定なら、電話の案内は落とす");
}

// ── 4. 応答の組み立て
console.log("\n[4] 応答の組み立て");
(async () => {
  const quick = await respond({ quick: "subsidy-combination" });
  ok(quick.mode === "faq" && quick.reply.includes("併用"), "候補ボタンは決まった回答", quick.mode);
  ok(quick.links.length > 0 && quick.links.every((l) => l.href.startsWith("/")), "リンクは内部パスのみ");
  ok(quick.suggestions.length >= 2, "次の候補が出る");

  const telQuick = await respond({ quick: "tel" });
  if (SITE_TEL) {
    ok(telQuick.reply.includes(SITE_TEL_DISPLAY), "連絡先の案内に電話番号が入る", telQuick.reply.slice(0, 60));
    ok(telQuick.links[0]?.href === `tel:${SITE_TEL}`, "電話番号を案内したら発信リンクが先頭に付く", JSON.stringify(telQuick.links));
    ok(telQuick.links.slice(1).every((l) => l.href.startsWith("/")), "発信リンク以外は内部パスのみ");
    const aiTel = await respond({ message: "電話で相談できますか" }, { callModel: async () => `{"answer": "はい。お電話（${SITE_TEL_DISPLAY}）で承っています。", "links": ["/contact"]}` });
    ok(aiTel.mode === "ai" && aiTel.links[0]?.href === `tel:${SITE_TEL}`, "AI が正しい電話番号を案内したら採用し、発信リンクを付ける", `${aiTel.mode} ${JSON.stringify(aiTel.links)}`);
    const aiWrongTel = await respond({ message: "電話番号は？" }, { callModel: async () => '{"answer": "お電話は 090-9999-0000 です。", "links": []}' });
    ok(aiWrongTel.mode !== "ai" && aiWrongTel.reply.includes(SITE_TEL_DISPLAY), "AI が違う番号を出したら捨てて、決まった案内文に切り替える", `${aiWrongTel.mode}: ${aiWrongTel.reply.slice(0, 40)}`);
  } else {
    ok(telQuick.links.every((l) => l.href.startsWith("/")), "電話番号が未設定なら発信リンクは付かない");
  }

  const unknownQuick = await respond({ quick: "no-such-id" });
  ok(unknownQuick.mode === "fallback", "存在しない候補は案内文");

  const good = await respond(
    { message: "葛飾区で太陽光を5kW載せたら区の助成はいくら？" },
    { callModel: async () => '{"answer": "葛飾区のかつしかエコ助成金では、太陽光発電システムは6万円/kWで上限30万円です。5kWなら上限の30万円が目安になります。", "links": ["/subsidy/katsushika", "/simulation", "/not-exist"]}' },
  );
  ok(good.mode === "ai", "正常な AI 回答は採用", good.mode);
  ok(good.reply.includes("時点"), "金額に触れた回答には時点の一言が付く", good.reply);
  ok(good.links.length === 2 && good.links[0].label !== good.links[0].href, "リンクは許可リストだけ・表示名つき", JSON.stringify(good.links));

  const bad = await respond({ message: "補助金は必ずもらえますか" }, { callModel: async () => '{"answer": "はい、SOLAR SHIFTなら必ずもらえます。", "links": []}' });
  ok(bad.mode === "faq" && !bad.reply.includes("必ずもらえます。"), "断定を含む AI 回答は捨てて、よくある質問に切り替える", `${bad.mode}: ${bad.reply.slice(0, 40)}`);

  const invented = await respond({ message: "蓄電池の相場は？" }, { callModel: async () => "蓄電池の相場は10kWhで約180万円です。" });
  ok(invented.mode !== "ai", "未確認の金額を含む AI 回答は出さない", invented.mode);

  const thrown = await respond(
    { message: "東京都の補助金はいくらですか" },
    {
      callModel: async () => {
        throw new Error("network");
      },
    },
  );
  ok(thrown.mode === "faq", "AI がエラーでも、よくある質問で答える", thrown.mode);

  const refused = await respond({ message: "おすすめのラーメン屋を教えて" }, { callModel: async () => null });
  ok(refused.mode === "fallback", "AI が答えなかったら案内文", refused.mode);

  const greet = await respond({ message: "こんにちは" });
  ok(greet.mode === "scripted", "あいさつには決まった文で返す", greet.mode);

  const longInput = await respond({ message: "あ".repeat(5000) });
  ok(longInput.mode === "fallback", "長すぎる入力でも落ちない", longInput.mode);

  const p = parseModelOutput('```json\n{"answer": "**太字**と[リンク](/solar)", "links": ["/solar"]}\n```');
  ok(cleanAnswer(p.answer) === "太字とリンク" && p.links[0] === "/solar", "Markdown 記法は落とす", cleanAnswer(p.answer));

  for (const s of CHAT_INITIAL_SUGGESTIONS) ok(Boolean(getFaq(s.id) || getScripted(s.id)), `最初の候補「${s.label}」の id が実在する`, s.id);

  // ── 5. システムプロンプト
  console.log("\n[5] システムプロンプト");
  const facts = loadFacts();
  const a = buildChatSystemPrompt(facts);
  const b = buildChatSystemPrompt(facts);
  ok(a === b, "毎回同じ文字列（プロンプトキャッシュが効く）");
  ok(a.includes("かつしかエコ助成金") && a.includes("Q: "), "事実シートとよくある質問を含む");
  if (SITE_TEL) ok(a.includes(`SOLAR SHIFT の電話番号は ${SITE_TEL_DISPLAY} です`), "AI への指示に確定した電話番号が入っている");
  ok(!a.includes("白鳥"), "旧所在地が指示文に残っていない");
  ok(chatLinkTargets().every((t) => t.href.startsWith("/") && t.label && t.label !== t.href), "案内できるページには表示名がある");
  console.log(`     文字数: ${[...a].length}  案内できるページ: ${chatLinkTargets().length}`);

  console.log(failed === 0 ? "\nALL PASSED" : `\nFAILED: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
})();
