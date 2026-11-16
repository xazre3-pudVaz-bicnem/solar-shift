/**
 * GA4（Google アナリティクス）へイベントを送る（ブラウザ側）。
 *
 * - タグを読み込むかどうかは app/layout.tsx が決める（lib/seo.ts の gaMeasurementId）。
 *   タグが無いとき（プレビュー・手元）は window.gtag が無いので、何もしない。
 * - 送るのは、イベントの名前と、選択肢の値・押された場所だけ。
 *   お名前・電話番号・メールアドレス・住所・相談内容など、入力された内容は送らない。
 * - GA4 側のキーイベント（contact_tel・contact_line・generate_lead）は、管理画面で登録済み。
 *
 * このファイルはクライアントの部品からも読むので、ほかのモジュールを import しない（配信する JS を増やさない）。
 */
type Gtag = (...args: unknown[]) => void;

export function track(name: string, params: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", name, params);
}
