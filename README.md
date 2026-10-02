# SOLAR SHIFT 公式サイト

東京都葛飾区の太陽光発電・蓄電池サービス「SOLAR SHIFT」（運営：株式会社サイプレス）の公式サイト。
Next.js 16（App Router）+ TypeScript + Tailwind CSS v4。本番ドメインは `https://www.solarshift.jp`。

🚨 **公開の仕組み**：本番 URL は `lib/site.ts` の `siteConfig.productionUrl` の1か所で管理している。Vercel の本番デプロイ（`VERCEL_ENV=production`）のときだけ、この URL で canonical / OG / sitemap / robots / RSS / JSON-LD を出し、検索結果に載せる。プレビューとローカルのビルドは全ページ `noindex` になり、canonical も sitemap も出さない（プレビューの誤インデックス防止）。デプロイ後は `/robots.txt` が `Allow: /` になっているか、`npm run seo:check` が通るかを確認する。

## コマンド

```bash
npm run dev            # 開発サーバー
npm run build          # 本番ビルド（型チェック込み）
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run links:check    # 内部リンクの存在チェック
npm run seo:check      # ビルド結果の title / H1 / canonical / robots / sitemap を SEO マップと照合（-- --table で一覧）
npm run facts:audit    # 固定ページの数値が、事実シートの「出典つきの節」にあるかを点検
npm run chat:selftest  # チャット（自動応答）の自己診断。API は呼ばない
npm run blog:generate  # 記事の生成を1回試す。品質チェックに通ったときだけ content/blog に保存
npm run blog:dry-run   # 保存せず内容だけ確認
npm run blog:audit     # 公開済みの全記事を、生成時と同じ品質ゲートで点検（API は呼ばない）
npm run blog:selftest  # 品質ゲートそのものの自己診断（通すべき記事・落とすべき記事の見本で確認）
npm run fonts:fetch    # 見出し用の日本語フォント（public/fonts）を取り直す
```

`seo:check` を本番と同じ条件で試すときは `VERCEL_ENV=production npm run build` のあとに実行する。

## 環境変数

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | | 本番 URL の上書き。ふだんは不要（`lib/site.ts` の `productionUrl` を使う）。ドメインを一時的に変えて確かめたいときだけ設定する |
| `SITE_URL` | | 同じ値の別名（上が無いときに参照） |
| `ANTHROPIC_API_KEY` | △ | ブログ自動投稿と、チャットの AI 回答に使う。無くてもチャットは「よくある質問」で動く |
| `ANTHROPIC_MODEL` | | 記事を書くモデル。既定 `claude-haiku-4-5` |
| `ANTHROPIC_REVIEW_MODEL` | | 公開前の読み直しに使うモデル。未設定なら記事と同じモデル |
| `ANTHROPIC_CHAT_MODEL` | | チャットのモデル。既定 `claude-haiku-4-5` |
| `CHATBOT_AI` | | `off` にするとチャットの AI 回答を止める（よくある質問だけで答える） |
| `CHAT_AI_DAILY_LIMIT` | | チャットの AI 回答の1日あたり上限。既定 300 |
| `CRON_SECRET` | △ | Vercel Cron の認証 |
| `GITHUB_TOKEN` / `GITHUB_REPO` / `GITHUB_BRANCH` | △ | Cron で生成した記事をコミットする |
| `RESEND_API_KEY` / `CONTACT_EMAIL_TO` / `CONTACT_EMAIL_FROM` | △ | お問い合わせフォームのメール送信 |
| `GOOGLE_SITE_VERIFICATION` | | Search Console の所有権確認（meta タグの content 値） |
| `BING_SITE_VERIFICATION` | | Bing Webmaster Tools の所有権確認 |

## ディレクトリ

```text
app/                 ルート（固定ページ・動的ページ・API・sitemap/robots/RSS/llms.txt/OG画像）
  api/chat           チャット（自動応答）
  api/contact        お問い合わせフォーム
  api/cron           ブログ自動投稿
  og/[[...path]]     SNS 共有用の画像（ページごと・ビルド時に生成）
components/
  layout/            Header / Footer / Breadcrumb / MobileNav / FloatingDock / RevealObserver
  ui/                Container / SectionHeading / Button / Callout / KeyPoints / Steps / Checklist / Toc / TrustFacts / TableScroll / ProseTable / ...
  sections/          HomeHero / CtaSection / FaqSection / ServiceLayout / GuideArticle / ContactForm / 図解
  subsidy/           SubsidyTable / SubsidyCard / BigNumbers / SubsidyBars / SubsidyMatrix / SubsidyCalculator / ApplicationTimeline / ...
  product/           ProductCard / ProductComparison / ProductCatalog / ManufacturerList / CompareGuide
  blog/              BlogIndex / CategoryIndex / ArticleCard / ArticleBody / RelatedArticles / AuthorBox
  chat/              ChatPanel（開いたときに初めて読み込む）
data/
  subsidies/         補助金データ（katsushika.ts / tokyo.ts / national.ts）← 金額の唯一の正本
                     katsushika-details.ts（対象者の要件・必要書類・着工前チェック・期限）／combination.ts（併用の文言）
  sources.ts         出典の登録簿（ページの参考資料・記事の出典・品質ゲートが共有）
  products.ts        商品データ（status: published のみ公開）
  manufacturers.ts   メーカー一覧（relationship: candidate の間は名前を出さない）
  works.ts           施工事例（空。架空事例は入れない）
  voices.ts          お客様の声（空）
  areas.ts           対応エリア（primary / secondary / planned）
  faq.ts             FAQ（チャットの回答にも使う）
  guides.ts          導入ガイドの登録簿（1ページ1検索意図）
  blog-categories.ts ブログカテゴリ（紹介文 lead・親ページ pillarLinks つき）
  images.ts          画像の登録簿
lib/
  site.ts            siteConfig（本番 URL・NAP・会社情報・連絡先・信頼性の項目。空欄は画面に出ない）
  seo.ts             buildMetadata / SITE_URL ゲート / OG 画像のパス
  seo-map.ts         SEO マップ（ページごとの主キーワード・検索意図・役割・index）とカニバリの判定
  indexing.ts        中身がまだ無いページ（施工事例・お客様の声・おすすめ商品）を noindex にする判定
  schema.ts          JSON-LD 生成
  routes.ts          固定ページ一覧（sitemap・リンク検査・OG 画像の見出し）
  nav.ts             ヘッダー・フッター・サイトマップのメニュー（noindex のページは自動で外れる）
  og.tsx / og-pages.ts   OG 画像の描画と、対象ページの一覧
  page-labels.ts     パス → 表示名（リンクの文言に URL を出さないため）
  subsidy-calc.ts    シミュレーターの計算（純関数）
  blog.ts            記事の読み込み・関連記事・ページ送り
  blog-generator/    記事自動生成の共通コア（topics / facts / claims / validate / generate）
  chat/              チャットの共通コア（prompt / scripted / guard / respond）
content/blog/        記事（Markdown + frontmatter）
docs/VERIFIED_FACTS.md  検証済み事実シート（節ごとに出典つき。記事・チャット・固定ページで書いてよい数値の唯一の根拠）
assets/fonts/        OG 画像用のフォント（Zen Kaku Gothic New Black・SIL OFL）
scripts/             generate-blog-post.ts / blog-audit.ts / blog-selftest.ts / seo-check.ts / facts-audit.ts /
                     chat-selftest.ts / check-links.mjs / prepare-images.mjs / prepare-illustrations.mjs / fetch-fonts.mjs
```

## 絶対に守ること（文章・データ）

- 補助金の金額は `data/subsidies/*.ts` からだけ出す。ページに直書きしない
- 「必ずもらえる」「絶対」「確実に元が取れる」などの断定を書かない
- 葛飾区と東京都の助成を合算して見せない。併用はできる（区の案内に明記）が、補助金の合計は助成対象経費が上限で、見積もりの金額で変わるため。併用の文言は `data/subsidies/combination.ts` の範囲で書く
- 架空の施工事例・お客様の声・削減率・施工写真を作らない。0件の間は「順次掲載予定」
- 「創業○年」「施工○件」「地域No.1」「正規取扱店」「自社施工」「有資格者」など未確認の表現を使わない
- 営業の方法や返信の速さについての約束（「訪問販売はしません」「◯営業日以内に返信」など）を書かない。「お問い合わせいただいた内容に応じてご案内します」と書く
- 数値・制度・技術仕様は、`docs/VERIFIED_FACTS.md` の「出典つきの節」にあるものだけを書く。無ければ数値を書かないか、「製品によって異なる」と書く
- LINE・営業時間は `lib/site.ts` に値が入るまで出さない（電話番号・メール・所在地は 2026-10-02 に確定して記入済み）
- **TOP のヒーローには CTA ボタンを置かない**（固定バー・チャットの入口もスクロール後に出す）

## 補助金データの更新

`data/subsidies/*.ts` を直すと、TOP・補助金ページ・サービスページ・エリアページ・シミュレーター・FAQ・llms.txt の表示が連動する。

1. 制度の公式ページと、手引き・案内の PDF を確認し、`amount` / `maxAmount` / `rule` / `applicationPeriod` / `deadline` / `status` / `notes` を更新
2. `lastVerified` を確認日に更新
3. `lib/site.ts` の `subsidyInfoDate` を同じ日に更新（免責の基準日）
4. 葛飾区の必要書類・要件・期限が変わったら `data/subsidies/katsushika-details.ts` を更新
5. `docs/VERIFIED_FACTS.md` の数値も、出典の URL と一緒に更新（自動生成記事とチャットの根拠）
6. `lib/blog-generator/facts.ts` の `allowedYenAmounts` に新しい単価・上限があれば追加。単価（◯万円/kW など）は `lib/blog-generator/validate.ts` の `allowedUnit` にも追加
7. 上限額・単価が変わったら `lib/chat/guard.ts` の `ALLOWED_CAPS` / `ALLOWED_UNIT` も更新
8. `npm run facts:audit` / `npm run blog:audit` / `npm run chat:selftest` を回して、既存のページ・記事・チャットに影響が無いかを確かめる

## 商品

- `/products`・`/products/solar`・`/products/battery` は「選び方・比べ方のガイド」。商品が1つも無くても中身があるので、検索結果に出す
- 個別の商品は `data/products.ts` のテンプレートをコピーし、メーカー公式ページで確認した値を入れ、`status: "published"` にしたものだけページになる（未確認の商品ページは作られない）
- `price` が未確定なら `null` のまま（「お問い合わせください」表示、Offer 構造化データなし）
- `recommended: true` + `recommendReason` を付けると `/recommend/*` に出る。おすすめが0件の間、`/recommend/*` は `noindex`・メニュー非表示・sitemap 対象外
- メーカーは、取扱契約が確認できたもの（`relationship: handling / authorized`）だけ名前を出す

## 施工事例・お客様の声

`data/works.ts` / `data/voices.ts` に、掲載許可を得た実際の事例・声だけを追加する。0件の間は「準備中」表示で `noindex`・メニュー非表示・sitemap 対象外（1件入れると自動で公開に切り替わる。判定は `lib/indexing.ts`）。
施工事例には、地域・住宅タイプ・築年数・屋根形状・容量・メーカー・補助金・施工前後の写真・工事期間・設置した理由・お客様の声の項目がある。

## 信頼性の項目（施工体制・保証など）

`lib/site.ts` の `siteConfig.trust`（施工体制／施工会社／許認可／有資格者／メーカーの施工ID／保証／工事保険／導入後のサポート）は、すべて `null`。書面で確認できた項目に文言を入れると、運営会社ページと葛飾区のエリアページに、その項目だけが出る（`components/ui/TrustFacts.tsx`）。推測で埋めない。

## チャット（自動応答）

右下（スマホは下の固定バー）の「チャット」から開く。回答は `/api/chat` が作る。

- **候補ボタン**：`data/faq.ts` の回答、または `lib/chat/scripted.ts` の決まった案内文をそのまま返す（AI を呼ばない）
- **自由入力**：`ANTHROPIC_API_KEY` があれば Claude が答える。答えてよい範囲は `docs/VERIFIED_FACTS.md` と `data/faq.ts` だけ
- **出力検査**（`lib/chat/guard.ts`）：断定表現、事実シートにない金額・単価・割合、実績や資格の表現、未確定の連絡先、URL が含まれる回答は表示せず、よくある質問の回答か案内文に切り替える
- **キーが無い／AI を止めた／上限に達した**：よくある質問との照合だけで答える。チャット自体は止まらない
- **費用の歯止め**：1接続元あたり毎分10回、AI 回答は1接続元1日40回・全体1日 `CHAT_AI_DAILY_LIMIT` 回（サーバーのインスタンスごとの概算）。他サイトからの呼び出しは拒否
- **保存しない**：会話はサーバーに保存せず、ログにも本文を出さない。表示はブラウザの sessionStorage にだけ残る
- 回答の文言を直すときは `data/faq.ts` か `lib/chat/scripted.ts` を直し、`npm run chat:selftest` を通す

## ブログ自動投稿

**毎日1本を必ず出す仕組みではない。** 毎日、生成を試み、品質基準を満たしたときだけ公開する。満たさない日は何も保存せずに終わる（失敗ではない）。
モデルは Claude API（既定 `claude-haiku-4-5`、`ANTHROPIC_MODEL` で変更可）。

### 流れ

1. **題材を選ぶ**（`lib/blog-generator/topics.ts`）：葛飾区に固有の題材を優先。既存の記事・ガイド・固定ページ（`lib/seo-map.ts`）と検索意図が重なる題材は選ばない
2. **書く**：`docs/VERIFIED_FACTS.md`（節ごとに出典 URL つき）だけを根拠に書かせる
3. **機械の検査**（`validate.ts` / `claims.ts`）：次のどれかに当たれば不合格
   - 数値・日付・割合が、事実シートの「出典つきの節」に無い。または、その出典が記事の参考資料に入っていない
   - 固定ページとカニバリする（主キーワードがほぼ同じ）、既存記事とタイトル・検索意図が近い、本文や見出しの構成が既存記事の焼き直し
   - 本文が 1,800 字未満、または見出しだけで中身が薄い
   - 架空の経験・事例・費用、根拠を示さない「一般的に」「多くの場合」、根拠のない No.1・最上級、メーカー資料で確認していない仕様
   - 併用や交付の断定、実績・資格の表現、存在しないページへのリンク、許可外の外部リンク、親になる固定ページへのリンクが無い
4. **読み直し**（`reviewArticle`）：数値以外の主張（制度の条件・手続きの順番・機器の説明）が事実シートにあるかを、別の呼び出しで1つずつ確かめる。1つでも確認できなければ不合格
5. **公開**：3と4の両方に通ったときだけ保存する。記事の frontmatter に `claims`（主張・出典・出典の種類・確認済み）、`sources[].sourceType`、`pillar`（親ページ）、`quality`（検査の版・検査日・字数・読み直したモデル）が残る

不合格のときは、理由を伝えて最大3回まで書き直させる。それでも通らなければ、その回は公開しない。

出典の種類（`sourceType`）は、国・自治体／執行団体（SII など）／メーカー公式／業界団体（太陽光発電協会など）。まとめサイト・他社サイト・口コミは根拠にしない。

### 記事の表示

記事ページに出すのは「最終更新日」「編集・運営：SOLAR SHIFT / 株式会社サイプレス」と、末尾の「参考資料」。AI を使った作り方と公開前の確認の手順は、記事ごとには出さず `/editorial-policy` で説明している。

### GitHub Actions で動かす（推奨）

`.github/workflows/daily-blog.yml`。毎日 01:20 UTC（10:20 JST）。Secrets に `ANTHROPIC_API_KEY` を登録する（任意で `ANTHROPIC_MODEL` / `ANTHROPIC_REVIEW_MODEL`）。
保存の前に `npm run blog:audit` で全記事を点検し、問題が1本でもあれば push しない。執筆と読み直しで複数回モデルを呼ぶため、実行時間に余裕のあるこちらを勧める。

### Vercel Cron で動かす（代替）

`vercel.json` の cron が同じ時刻に `/api/cron/generate-post` を叩く。
サーバーレス関数はファイルを書けないため、GitHub Contents API で `content/blog/` にコミットし、Vercel の自動デプロイで公開する。
必要な環境変数は `ANTHROPIC_API_KEY` / `CRON_SECRET` / `GITHUB_TOKEN`（Fine-grained PAT・Contents: Read and write）/ `GITHUB_REPO`（`owner/repo`）。
関数の実行時間はプロジェクトの既定に従う（Fluid compute が有効なら 300 秒。`maxDuration` は、プランの上限を超えるとデプロイが失敗するので書いていない）。300 秒の手前で自分から終え、「時間内に終わらなかったので公開しない」と返す。上限がそれより短い設定なら GitHub Actions を使う。

GitHub Actions と Vercel Cron の両方は有効にしない（二重投稿になる）。`CRON_SECRET` が未設定なら Cron 側は 401 で何もしない。

手動テスト: `curl -H "Authorization: Bearer $CRON_SECRET" "https://www.solarshift.jp/api/cron/generate-post?dry=1"`

### ローカルで試す

```bash
npm run blog:selftest                                                        # 品質ゲートの自己診断（API なし）
npm run blog:audit                                                           # 公開済みの記事の点検（API なし）
DRY_RUN_FIXTURE=scripts/fixtures/blog-good.json npx tsx scripts/generate-blog-post.ts   # 見本の記事で機械の検査だけ
ANTHROPIC_API_KEY=... npm run blog:dry-run                                   # 実際に生成して、保存せず内容だけ確認
```

事実シートや SEO マップを直したら、`npm run blog:audit` で既存の記事に影響が無いかを確かめる。

## SEO・AIO の仕組み

- **SEO マップ**（`lib/seo-map.ts`）：ページごとに、主キーワード・関連キーワード・検索意図・役割・title や H1 に必ず入れる語・index するかを1か所で決めている。主キーワードが2ページで重ならないこと、title / H1 に必要な語が入っていること、canonical / robots / sitemap が設定どおりであることを `npm run seo:check` がビルド結果から確かめる
- **役割分担**：`/` ＝ 葛飾区 太陽光／蓄電池、`/subsidy/katsushika` ＝ 葛飾区 太陽光 補助金・かつしかエコ助成金、`/area/katsushika` ＝ 葛飾区 太陽光 業者・施工・会社、`/solar` ＝ 住宅用 太陽光発電、`/battery` ＝ 家庭用 蓄電池 選び方。ブログは固定ページで扱いきれない細かい疑問（ロングテール）を受け持ち、記事の末尾から親の固定ページへ案内する
- **メタデータ**：全ページ `buildMetadata()`（title / description / canonical / OG / Twitter / RSS）。タイトルの末尾は `｜SOLAR SHIFT`
- **OG 画像**：ページごとに日本語の見出し入りで生成（`/og/…`）。対象は `lib/og-pages.ts`、固定ページの見出しは `lib/routes.ts` の `ogTitle`
- **構造化データ**：Organization / LocalBusiness / WebSite（全ページ）、BreadcrumbList、FAQPage、Article / BlogPosting（出典を citation に）、Service、HowTo、Blog、ItemList、CollectionPage / AboutPage / ContactPage、WebApplication、Product（価格未確定なら Offer なし）。口コミ・評価は出さない
- **noindex にするページ**：施工事例・お客様の声・おすすめ商品（中身が入るまで）、記事が3本未満のカテゴリ、404。どれも sitemap に載せない
- **canonical**：全ページが自分自身の URL を指す。ブログ一覧の2ページ目以降（`/blog/page/2` …）も自分自身を指し、index のまま（sitemap には載せない）
- **sitemap.xml**：検索結果に出すページだけ。`lastmod` は記事の更新日、固定ページは `siteConfig.contentUpdatedAt` と補助金情報の基準日の新しいほう
- **robots.txt**：AI 検索のクローラー（GPTBot・ClaudeBot・PerplexityBot・Google-Extended など）も許可
- **/llms.txt**：AI 検索向けの要約（運営・補助金の数値と確認日・主要ページ）。補助金の数値は `data/subsidies` から自動で出る
- **ブログ一覧**：1ページ12件でページを分ける（`/blog/page/2` …）
- **導入ガイド**：一覧ページ `/guide` がハブ。ガイドを足したら `data/guides.ts` に登録し、`app/guide/page.tsx` の `GROUPS` に入れる
- **ページを足すとき**：`lib/routes.ts` に追加（sitemap・リンク検査・OG 画像が連動）、`lib/nav.ts` に表示名、`lib/seo-map.ts` にキーワードと役割を入れる
- **地域名**：亀有・金町・新小岩・青戸・柴又・高砂・水元・立石・四つ木・堀切 は `/area/katsushika` の中で「区内の対応エリア」として扱う。町名ごとの薄いページは作らない

## デザインと動き

- 配色はディープネイビー × ソーラーオレンジ。地の色は白とライトグレー（`paper-2`）。緑は「受付中」などの状態表示とチェックマークだけに使う。色は `app/globals.css` の `@theme`
- 主ボタンは `orange-500` の地にネイビーの文字（白文字はコントラストが足りない）。オレンジ色の「文字」は `accent-text`
- 角丸は小さめ（`rounded-md` / `rounded-lg`）、影は使わず枠線で区切る。装飾のアニメーションは置かない
- 画像は役割で使い分ける。実写＝ヒーロー・住宅・設備、人物イラスト＝よくある質問・相談・流れ、設備アイコン＝サービス・記事カード。1つの区画で混ぜない
- 登場アニメーションは `{...reveal()}`（`lib/reveal.ts`）の控えめなフェードだけ。表示の切り替えは `RevealObserver` が行う。JS が動かなければ全部表示されたまま
- 横に長い表は `TableScroll`、本文（`.prose-ss`）の中の表は `ProseTable` を使う（スクロールの案内とキーボード操作）
- スマホ：押す場所は 44px 以上、入力欄の文字は 16px。下の固定バーは高さ 52px で「チャット・試算・電話・相談」。TOP ではヒーローを過ぎてから出す。メニューは `details` のアコーディオン。長いページには目次（`Toc`）

### 表示速度のために決めていること

実測の結果、次の3つを外すとスマホの Lighthouse が 90 点前後から 60 点台に落ちる。

1. **日本語の Web フォントは PC 幅（1024px 以上）だけ**、しかも最初の描画のあとに読み込む（`app/layout.tsx`）。スマホで読むと1ページで約 450KB のフォントを取りに行く。欧文・数字は `public/fonts/montserrat-latin.woff2`（基本ラテンのみ・約24KB）
2. **長いページの区画に `cv-block`（全幅の帯は `cv-auto`）** を付ける。画面に近づくまで中身を描画しない
3. **装飾アニメーションは無限に回さない**。動き続けるものが1つでもあると、Chrome は毎フレームのスタイル計算をメインスレッドで回し続ける

やってはいけないこと：**`app/layout.tsx` で `{children}` を `<Suspense>` で囲まない**。ハイドレーションは軽くなるが、静的生成した HTML で本文が `<main>` の外（`<div hidden>`）に回され、JS を実行しないクローラーから本文が見えなくなる。

## 画像の管理

- 配信する画像は `public/images/<用途>/*.webp`（hero / solar / battery / scene / icons / illustrations）、登録簿は `data/images.ts`（src / alt / width / height）。ページはこの登録簿のキーだけを参照する。
- TOP のヒーローは `components/sections/HomeHero.tsx`。全面の背景写真（`public/images/hero/`）にネイビーの幕を重ね、左に H1 と説明を置く。PC とスマホで切り抜きを変え、この1枚だけを先読みする。CTA は置かない
- 元画像（PNG）は `_photo-sources/`（Git管理外）に置き、`node scripts/prepare-images.mjs` で WebP に最適化して出力する。`icon-*` と `people-*` は白背景を透過にする。スタッフのポーズと蓄電池のイラストは `scripts/prepare-illustrations.mjs`
- 追加・差し替え：元PNGを `_photo-sources/` に入れ、`scripts/prepare-images.mjs` の MAP に1行追加 → スクリプト実行 → `data/images.ts` に登録 → ページで `images.<key>` を指定。
- 写真の alt は「〜のイメージ」とし、実在の場所・人物・施工実績を断定しない。
- 横に並べるイラストは `w-auto` にしない（読み込み前の大きさが 0 になり、下の内容が動く）。幅を決めて縦横比は width/height 属性に任せる

## お問い合わせフォーム

必須は「お名前」「ご相談内容」と、連絡先（メールアドレスか電話番号のどちらか）。ご住所のエリアとご相談の種類は選ぶだけ。町名・月の電気代・太陽光の有無・蓄電池の有無は、折りたたみの中の任意項目。
`RESEND_API_KEY` / `CONTACT_EMAIL_TO` / `CONTACT_EMAIL_FROM` を設定すると Resend でメール送信。未設定の間は、入力した内容を本文に入れたメールと電話番号を案内する（送信したふりはしない）。

## 未確定で空欄にしている情報（lib/site.ts）

- 施工体制・施工会社・許認可・有資格者・メーカーの施工ID・保証・工事保険・導入後のサポート（`trust.*`）
- LINE・営業時間（`contact.lineUrl` / `contact.hours`。電話の受付時間が決まったら `hours` に入れると電話番号の横に出る）
- 法人番号（`company.corporateNumber`）
- Googleビジネスプロフィール（`gbp.*`）。`gbp.embedUrl` にプロフィールの埋め込み用 URL を入れると、運営会社ページと葛飾区のエリアページに地図が出る（住所だけで埋め込むと建物名のカードが出るため、プロフィール登録までは地図を出さない）
- SNS（`social.*`）

空のままでも画面・構造化データには出ない。

電話番号（`contact.tel` / `contact.telDisplay`）・メール・所在地は記入済み。変えるときは `lib/site.ts` と `docs/VERIFIED_FACTS.md` の両方を直す。画面（CTA・固定バーの「電話」・メニュー・フッター・運営会社の地図）、構造化データ（`telephone` / `PostalAddress`）、チャットの案内、`/llms.txt` は `lib/site.ts` から自動で変わる。
