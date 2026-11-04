# SEO の運用手順（毎週・毎月・年度の切り替え）

このサイトの方針：**ページや記事を増やして強くするのではなく、既存のページを、一次情報と検索のデータで強くする。**
町名ページ・内容を変えていない更新日の書き換え・Review 系の構造化データは使わない。

最終確認：2026-11-04

## 1. 道具

| コマンド | 何をするか |
| --- | --- |
| `npm run seo:audit` | ビルド後の全 URL の監査（title・description・H1・canonical・重複・孤立・TOP からのクリック数・パンくず・FAQ の使い回し・誇大表現・情報の鮮度・構造化データ）。先に `VERCEL_ENV=production npm run build` |
| `npm run seo:audit -- --table` | URL ごとの一覧（主キーワード・優先度・まとまり・TOP からのクリック数・被リンク・更新日） |
| `npm run seo:opportunities` | Search Console の CSV から、伸びしろ・取り合い・クリック率・受け持ちの無いクエリを出す（`data/seo/search-console/README.md`） |
| `npm run blog:audit -- --prune` | ブログ記事の手入れの判定（KEEP／UPDATE／MERGE）。消す・止めるは人が決める |
| `npm run freshness` | 一次情報を確かめてからの日数（補助金30日・FIT と賦課金90日・そのほかの出典180日）と、補助金の掲載期限。`npm run dev` の前にも出る |
| `npm run facts:audit` | 固定ページの数字が、事実シート（`docs/VERIFIED_FACTS.md`）の出典つきの節にあるか |
| `npm run links:check` / `npm run links:external` | 内部リンク切れ／公式ページへのリンク切れ（外部は毎週月曜に自動） |

見直しの日数は `lib/freshness.ts` の `FRESHNESS_DAYS` で変えられる。

## 2. 毎週（30分）

1. `npm run freshness` を見る。期限を過ぎた制度があれば、公式ページを開いて確かめる
   - 変わっていない：`data/subsidies/*.ts` の `lastVerified`（または `data/fit.ts` などの確認日）だけを進め、`data/subsidies/changelog.ts` に「公式情報の再確認」を1行足す。**最終更新日（`updatedAt`）は進めない**
   - 変わった：数字を `docs/VERIFIED_FACTS.md` に出典つきで書いてから、`data/subsidies` を直す。ページの `updatedAt` を進め、更新履歴に「制度の変更」または「掲載の更新」を足す
2. 外部リンクの点検（GitHub Actions の「外部リンクの点検（出典の公式ページ）」、毎週月曜）が赤なら、行き先を公式の新しい URL に差し替える
3. ブログの自動投稿（GitHub Actions の「毎日のブログ記事を生成」）が落ちていたら、ログで理由を見る。品質ゲートで落ちたのなら、そのままでよい（記事が出ない日があってよい）

## 3. 毎月（2時間）

1. Search Console の「検索パフォーマンス」を過去3か月で CSV に出し、`data/seo/search-console/` に置いて `npm run seo:opportunities` を回す
2. 上から順に、**受け持ちのページ**を直す（新しいページは作らない）
   - 伸びしろ（4〜20位）：受け持ちのページの title・最初の答え・見出し・足りない一次情報
   - 取り合い：受け持ちではないページの title・見出しからその語を外し、受け持ちのページへ文脈のリンクを張る。統合（301）は最後の手段
   - クリック率：title と description が、そのクエリの答えを先に示しているか
   - 受け持ちの無いクエリ：既存のページで答えられるなら、そのページに足して `data/seo/keyword-map.ts` の関連キーワードに入れる
3. `npm run blog:audit -- --prune` で UPDATE の記事を直す。MERGE が出たら、2本を読み比べて、人が統合を決める
4. `docs/seo-search-console.md` の「ページ（インデックス作成）」の項目を見る

## 4. 新しいページを作る条件

次の5つを**すべて**満たすときだけ作る。1つでも欠けたら、既存のページを直す。

- A. はっきりした検索意図がある（Search Console のクエリ、または公式の制度の名前）
- B. 既存のページでは満たせない（受け持ちのページに足すと、そのページの主題がぼやける）
- C. 一次情報にもとづく、ほかでは読めない内容を出せる
- D. 本文からリンクを張れる親のページがある（TOP から3クリック以内）
- E. その検索意図に答えきれるだけの内容がある（文字数ではなく、答え・一次情報・構造・更新の管理で判断）

作ったら、`data/seo/keyword-map.ts` に受け持ちを足す（主キーワードが重なると `npm run seo:check` が落とす）。

## 5. 年度の切り替え（令和9年度＝2027年度の制度が出たとき）

URL は作り直さない。`/subsidy/katsushika`・`/subsidy/tokyo`・`/subsidy/national` を、新しい年度の柱として使い続ける。

1. 公式の新しい年度の案内・手引き・要綱を開いて確かめる（出ていないうちは、何も変えない。予想の数字は書かない）
2. `docs/VERIFIED_FACTS.md` に新しい年度の節を、出典つきで足す（前の年度の節は残す）
3. `data/subsidies/*.ts` を新しい年度の内容にする（`fiscalYear`・金額・`applicationStart`・`applicationEnd`・`preApplicationDays`・`officialPdfUrl`・`validUntil`・`lastVerified`）。`data/sources.ts` の出典も新しい資料にする
4. 本文の説明・FAQ・title・description を、新しい内容に合わせて読み直す。**title の年度だけを変えて、古い数字を残さない**
5. ページの `updatedAt`（`lib/routes.ts`）を進める
6. `data/subsidies/changelog.ts` に「制度の変更」（新しい年度の受付開始など）を足す。前の年度の行は消さない
7. `npm run facts:audit`・`npm run blog:audit -- --prune`（古い年度に触れている記事が UPDATE に出る）・`npm run seo:audit` を回す

## 6. 計測（KPI）

記事の本数は KPI にしない。

| KPI | どこで見るか | いま |
| --- | --- | --- |
| 指名ではない検索からのクリック | Search Console（クエリから SOLAR SHIFT・サイプレスを除く） | 見られる |
| 表示回数 | Search Console | 見られる |
| 10位以内・3位以内のキーワードの数 | Search Console の CSV（`seo:opportunities` の元データ） | 見られる |
| 問い合わせの件数 | Resend の送信記録、Vercel のログ（`[contact] Resend が受け付けた`） | 見られる |
| シミュレーターの利用・検索からの問い合わせ | アクセス解析 | **見られない**（サイトにアクセス解析を入れていない） |

アクセス解析（GA4 など）を入れるかは、運営者が決める。入れる場合は、プライバシーポリシーを直してから、運営者が発行した測定 ID を環境変数で渡す（架空の ID をコードに書かない）。

## 7. 使わない手法

- 町名・駅名だけを差し替えたページ、同じ構成の地域ページの量産
- 内容を変えていないのに、更新日・`lastmod` を進める
- 掲載許可の無い口コミ、Review・AggregateRating の構造化データ
- ページに無い内容の構造化データ（FAQ を大量に作るなど）
- 隠しテキスト、キーワードの詰め込み、リンクの購入
- 「絶対お得」「必ず元が取れる」「電気代0円」「必ず補助金」「地域No.1」「最安」「施工実績○件」など、根拠の無い言い切り（`npm run seo:audit` が本文を見ている）
- 区と都の補助金の合算額の表示
- llms.txt などを、順位の施策として扱う（置いてあるのは補助的なもの）
