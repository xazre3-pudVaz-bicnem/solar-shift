/**
 * 自動生成記事の品質スコア（6項目・各1〜5点）。
 *
 * 文章の出来を「印象」で決めないために、数えられるものだけで点を付ける（同じ原稿なら、いつ測っても同じ点になる）。
 * 点の材料（signals）は validate.ts が集める。ここは、材料から点を出すだけの純関数。
 *
 *   originality          … 既存の記事と、本文・題名がどれだけ離れているか
 *   searchIntentMatch    … 検索意図の語が、題名・導入・見出しに入っているか
 *   sourceQuality        … 公的な一次情報（自治体・東京都・国・SII）を出典にしているか
 *   localRelevance       … 葛飾区・東京都の制度や地域の事情に結び付いているか
 *   internalLinkCoverage … 親の固定ページ・関連ページへ案内しているか
 *   cannibalizationRisk  … 固定ページ・既存記事と、検索意図を取り合わないか（5 が「取り合わない」）
 *
 * 公開の基準（QUALITY_THRESHOLD）：どの項目も 3 点以上（localRelevance だけは 2 点以上）、合計 22 点以上。
 * 基準に届かない原稿は、機械の検査の「不合格」として書き直しに回す（generate.ts）。
 */
export interface QualitySignals {
  /** 既存記事との本文の重なり（8文字シングルの重なり率の最大値。0〜1） */
  maxBodyOverlap: number;
  /** 既存記事との題名の近さ（バイグラム Dice の最大値。0〜1） */
  maxTitleSimilarity: number;
  /** 検索意図の語のうち、題名・導入・見出しに入っている割合（0〜1） */
  intentInTitle: number;
  intentInIntro: number;
  intentInHeadings: number;
  /** 出典の数と、そのうち公的な一次情報（自治体・東京都・国・SII）の数 */
  sourceCount: number;
  officialSourceCount: number;
  /** 葛飾区・かつしか という語の回数／東京都・周辺の区の語の回数 */
  katsushikaMentions: number;
  tokyoMentions: number;
  /** 自治体・東京都の資料を出典にしているか */
  hasLocalSource: boolean;
  /** 地域のページ（区・都の補助金、エリア）へリンクしているか */
  linksToLocalPage: boolean;
  /** 固定ページへのリンクの数（重複を除く） */
  fixedLinkCount: number;
  /** 題材が指定した親ページへのリンクが、すべてあるか */
  hasRequiredLinks: boolean;
  /** カテゴリの親ページ（pillarLinks）のどれかへリンクしているか */
  hasPillarLink: boolean;
  /** 既存記事・固定ページとの検索意図の近さ（バイグラム Dice の最大値。0〜1） */
  maxIntentSimilarity: number;
  /** 固定ページのキーワードと取り合いになっているか（lib/seo-map.ts の findCannibalPage） */
  cannibalHit: boolean;
}

export interface QualityScores {
  originality: number;
  searchIntentMatch: number;
  sourceQuality: number;
  localRelevance: number;
  internalLinkCoverage: number;
  cannibalizationRisk: number;
  total: number;
}

export const QUALITY_THRESHOLD = { each: 3, localRelevance: 2, total: 22 } as const;

const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

export function scoreQuality(s: QualitySignals): QualityScores {
  // 同じ制度を扱う記事どうしは、制度名や公式の文言で 0.10〜0.19 の重なりが出る（2026-10-07 に公開済みの19本で実測。別の題材でも最大 0.189）。
  // 0.20 以上と題名 0.55 以上は、validate.ts が「焼き直し」「題名が似すぎ」として先に落とす
  const originality = s.maxBodyOverlap < 0.08 && s.maxTitleSimilarity < 0.35 ? 5 : s.maxBodyOverlap < 0.13 && s.maxTitleSimilarity < 0.45 ? 4 : s.maxBodyOverlap < 0.2 && s.maxTitleSimilarity < 0.55 ? 3 : s.maxBodyOverlap < 0.25 ? 2 : 1;

  const searchIntentMatch = clamp(1 + 4 * (0.5 * s.intentInTitle + 0.25 * s.intentInIntro + 0.25 * s.intentInHeadings));

  const officialShare = s.sourceCount > 0 ? s.officialSourceCount / s.sourceCount : 0;
  const sourceQuality = s.sourceCount === 0 ? 1 : s.officialSourceCount === 0 ? 2 : clamp(3 + (officialShare >= 0.6 ? 1 : 0) + (s.sourceCount >= 2 ? 1 : 0));

  const localRelevance =
    s.katsushikaMentions >= 3 && s.hasLocalSource ? 5 : s.katsushikaMentions + s.tokyoMentions >= 3 && s.hasLocalSource ? 4 : s.katsushikaMentions + s.tokyoMentions >= 1 && s.linksToLocalPage ? 3 : s.katsushikaMentions + s.tokyoMentions >= 1 || s.linksToLocalPage ? 2 : 1;

  const internalLinkCoverage = clamp(1 + (s.fixedLinkCount >= 2 ? 1 : 0) + (s.hasRequiredLinks ? 1 : 0) + (s.hasPillarLink ? 1 : 0) + (s.fixedLinkCount >= 3 ? 1 : 0));

  const cannibalizationRisk = s.cannibalHit ? 1 : s.maxIntentSimilarity < 0.4 ? 5 : s.maxIntentSimilarity < 0.5 ? 4 : s.maxIntentSimilarity < 0.6 ? 3 : s.maxIntentSimilarity < 0.75 ? 2 : 1;

  const total = originality + searchIntentMatch + sourceQuality + localRelevance + internalLinkCoverage + cannibalizationRisk;
  return { originality, searchIntentMatch, sourceQuality, localRelevance, internalLinkCoverage, cannibalizationRisk, total };
}

const LABEL: Record<Exclude<keyof QualityScores, "total">, string> = {
  originality: "独自性",
  searchIntentMatch: "検索意図との一致",
  sourceQuality: "出典の質",
  localRelevance: "地域との結び付き",
  internalLinkCoverage: "内部リンク",
  cannibalizationRisk: "取り合いの少なさ",
};

/** 基準に届かなかったときに、書き直しで何を直すか（書くモデルへの指示にもなる） */
const HINT: Record<keyof typeof LABEL, string> = {
  originality: "既存の記事と本文・題名が近すぎます。切り口と例を変えてください",
  searchIntentMatch: "題名・導入・見出しに、検索意図の語を入れてください",
  sourceQuality: "葛飾区・東京都・国・SII の公式資料を出典にしてください",
  localRelevance: "葛飾区・東京都の制度や、地域の事情と結び付けて書いてください",
  internalLinkCoverage: "親の固定ページと、関連する固定ページへのリンクを本文に入れてください",
  cannibalizationRisk: "固定ページ・既存の記事と検索意図が近すぎます。より細かい疑問に絞ってください",
};

/** 基準に届かない項目（空なら合格） */
export function qualityErrors(q: QualityScores): string[] {
  const out: string[] = [];
  for (const k of Object.keys(LABEL) as (keyof typeof LABEL)[]) {
    const min = k === "localRelevance" ? QUALITY_THRESHOLD.localRelevance : QUALITY_THRESHOLD.each;
    if (q[k] < min) out.push(`品質スコアが基準に届きません：${LABEL[k]} ${q[k]}点（${min}点以上）。${HINT[k]}`);
  }
  if (out.length === 0 && q.total < QUALITY_THRESHOLD.total) out.push(`品質スコアの合計が基準に届きません：${q.total}点（${QUALITY_THRESHOLD.total}点以上）`);
  return out;
}

/** ログ・frontmatter 用の1行（例：独自性5 意図4 出典5 地域5 リンク4 取り合い5＝28） */
export function formatQuality(q: QualityScores): string {
  return `独自性${q.originality} 意図${q.searchIntentMatch} 出典${q.sourceQuality} 地域${q.localRelevance} リンク${q.internalLinkCoverage} 取り合い${q.cannibalizationRisk}＝${q.total}`;
}
