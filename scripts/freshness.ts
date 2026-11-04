#!/usr/bin/env tsx
/**
 * 情報の鮮度の点検（lib/freshness.ts）。npm run dev の前に自動で動き、目安を過ぎた情報があれば一覧にする。
 *   npm run freshness
 * 終了コードは常に 0（開発の邪魔をしない）。CI では npm run seo:audit が同じものを「注意」として出す。
 */
import { freshnessIssues, describeFreshness, FRESHNESS_DAYS, todayJst } from "../lib/freshness";

const issues = freshnessIssues();
if (issues.length === 0) {
  console.log(`[freshness] 一次情報は目安の期間内に確かめてあります（${todayJst()}。補助金 ${FRESHNESS_DAYS.subsidy} 日・FIT ${FRESHNESS_DAYS.fit} 日・出典 ${FRESHNESS_DAYS.source} 日）`);
} else {
  console.warn(`[freshness] 見直しが必要な情報が ${issues.length} 件あります（${todayJst()}）`);
  for (const i of issues) console.warn(`  - ${describeFreshness(i)}`);
}
