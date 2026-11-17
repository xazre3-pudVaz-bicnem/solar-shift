/**
 * GA4 のタグ（app/layout.tsx に inline で入れる）。
 *
 * - 受け口（window.dataLayer と gtag 関数）は、すぐに用意する。page_view・contact_tel・generate_lead の命令は、
 *   外部の gtag.js が読み込まれるまで dataLayer に溜まり、読み込まれたときに順に送られる（失われない）。
 * - 外部の gtag.js は、最初の操作（タップ・クリック・キー入力・スクロール）か、読み込みの完了から4秒後の、早いほうで読む。
 *   理由：@next/third-parties の GoogleAnalytics（読み込みの直後に gtag.js を実行）では、本番の TOP の Lighthouse
 *   （スマホ・3回の中央値）が 83 → 78 に下がった（TBT 約430ms → 約770ms。2026-11-16 に計測）。
 *   5サイト共通の受け入れ条件「Performance が導入前から5点以上下がらない」を満たすため、実行を最初の表示の後ろへ回す。
 * - 最初の page_view は、読み込んだときの URL とタイトルを付けて、イベントとして送る（send_page_view は使わない）。
 *   gtag.js より先にページの中を移動しても、最初のページの記録がずれない。2ページ目からは、GA4 の拡張計測（履歴の変化）が送る。
 */
export function gaSnippet(measurementId: string): string {
  const id = measurementId.replace(/[^A-Za-z0-9-]/g, "");
  return [
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}",
    "gtag('js',new Date());",
    `gtag('config','${id}',{send_page_view:false});`,
    "gtag('event','page_view',{page_location:location.href,page_title:document.title});",
    "(function(){var done=false;function load(){if(done)return;done=true;var s=document.createElement('script');s.async=true;",
    `s.src='https://www.googletagmanager.com/gtag/js?id=${id}';document.head.appendChild(s);}`,
    "['pointerdown','keydown','touchstart','scroll'].forEach(function(t){addEventListener(t,load,{once:true,passive:true,capture:true});});",
    "function arm(){setTimeout(load,4000);}",
    "if(document.readyState==='complete')arm();else addEventListener('load',arm,{once:true});})();",
  ].join("");
}
