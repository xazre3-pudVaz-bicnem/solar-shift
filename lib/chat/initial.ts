/**
 * チャットを開いた直後に出す文と候補。
 * クライアントに「よくある質問」の全文を持ち込まないよう、ここには id と短い文言だけを書く
 * （id は data/faq.ts または lib/chat/scripted.ts の id。scripts/chat-selftest.ts が実在を確かめる）。
 */
export const CHAT_GREETING =
  "こんにちは。SOLAR SHIFT の自動応答チャットです。葛飾区・東京都の補助金や、太陽光発電・蓄電池の導入について、分かる範囲でお答えします。";

export const CHAT_INITIAL_SUGGESTIONS: { id: string; label: string }[] = [
  { id: "subsidy-katsushika-overview", label: "葛飾区の補助金はいくら？" },
  { id: "subsidy-tokyo-overview", label: "東京都の補助金はいくら？" },
  { id: "subsidy-combination", label: "区と都は併用できる？" },
  { id: "subsidy-pre-consultation", label: "工事の後から申請できる？" },
  { id: "battery-capacity", label: "蓄電池は何kWhが目安？" },
  { id: "simulate", label: "わが家の補助金を試算したい" },
];
