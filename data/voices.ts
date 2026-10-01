/**
 * お客様の声。
 * 実際のお客様から掲載許可を得たものだけを追加する。架空の口コミは作らない。
 * 配列が空の間、/voice ページは「準備中」の案内と、声の集め方・掲載基準を表示する。
 * Review / AggregateRating の構造化データは、掲載された声がある場合も本文と一致する範囲でのみ出す。
 */

export interface Voice {
  id: string;
  published: boolean;
  /** 表示名（例：葛飾区 K様） */
  displayName: string;
  area: string;
  /** 導入した設備 */
  equipment: string[];
  /** 本文（原文） */
  body: string;
  /** 掲載日 */
  date: string;
  /** 関連する施工事例の slug */
  workSlug?: string;
}

export const voices: Voice[] = [];

export const publishedVoices = voices.filter((v) => v.published);
