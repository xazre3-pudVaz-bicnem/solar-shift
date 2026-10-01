# SOLAR SHIFT 公式サイト

東京都葛飾区の太陽光発電・蓄電池サービス「SOLAR SHIFT」（運営：株式会社サイプレス）の公式サイト。
Next.js 16（App Router）+ TypeScript + Tailwind CSS v4。

🚨 **公開前チェック**：`NEXT_PUBLIC_SITE_URL` を本番ドメインで設定してからビルドすること。未設定のビルドは canonical / OG / sitemap を出さず、全ページ `noindex` になる（プレビューの誤インデックス防止）。デプロイ後は `/robots.txt` が `Allow: /` になっているか必ず確認する。

## コマンド

```bash
npm run dev            # 開発サーバー
npm run build          # 本番ビルド（型チェック込み）
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run links:check    # 内部リンクの存在チェック
npm run chat:selftest  # チャット（自動応答）の自己診断。API は呼ばない
npm run blog:generate  # ブログ記事を1本生成して content/blog に保存
npm run blog:dry-run   # 保存せず内容だけ確認
npm run fonts:fetch    # 見出し用の日本語フォント（public/fonts）を取り直す
```

## 環境変数

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ◎ | 本番URL。未設定なら全ページ noindex |
| `SITE_URL` | | API ルート用の同じ値（上が無いときに参照） |
| `ANTHROPIC_API_KEY` | △ | ブログ自動投稿と、チャットの AI 回答に使う。無くてもチャットは「よくある質問」で動く |
| `ANTHROPIC_MODEL` | | ブログ生成のモデル。既定 `claude-haiku-4-5` |
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
  ui/                Container / SectionHeading / Button / Callout / KeyPoints / Steps / TableScroll / ProseTable / Pagination / ...
  sections/          CtaSection / FaqSection / ServiceLayout / GuideArticle / ContactForm / 図解
  subsidy/           SubsidyTable / BigNumbers / SubsidyBars / SubsidyMatrix / SubsidyCalculator / ...
  product/           ProductCard / ProductComparison / ProductCatalog / ManufacturerList
  blog/              BlogIndex / CategoryIndex / ArticleCard / ArticleBody / RelatedArticles / AuthorBox
  chat/              ChatPanel（開いたときに初めて読み込む）
data/
  subsidies/         補助金データ（katsushika.ts / tokyo.ts / national.ts）← 金額の唯一の正本
  products.ts        商品データ（status: published のみ公開）
  manufacturers.ts   メーカー一覧（relationship: candidate の間は「正規取扱」表記なし）
  works.ts           施工事例（空。架空事例は入れない）
  voices.ts          お客様の声（空）
  areas.ts           対応エリア（primary / secondary / planned）
  faq.ts             FAQ（チャットの回答にも使う）
  guides.ts          導入ガイドの登録簿（1ページ1検索意図）
  blog-categories.ts ブログカテゴリ（紹介文 lead つき）
  images.ts          画像の登録簿
lib/
  site.ts            siteConfig（NAP・会社情報・連絡先。空欄は画面に出ない）
  seo.ts             buildMetadata / SITE_URL ゲート / OG 画像のパス
  schema.ts          JSON-LD 生成
  routes.ts          固定ページ一覧（sitemap・リンク検査・OG 画像の見出し）
  og.tsx / og-pages.ts   OG 画像の描画と、対象ページの一覧
  page-labels.ts     パス → 表示名（リンクの文言に URL を出さないため）
  subsidy-calc.ts    シミュレーターの計算（純関数）
  blog.ts            記事の読み込み・関連記事・ページ送り
  blog-generator/    記事自動生成の共通コア（topics / facts / validate / generate）
  chat/              チャットの共通コア（prompt / scripted / guard / respond）
content/blog/        記事（Markdown + frontmatter）
docs/VERIFIED_FACTS.md  検証済み事実シート（記事・生成記事・チャットで書いてよい数値の唯一の根拠）
assets/fonts/        OG 画像用のフォント（Zen Kaku Gothic New Black・SIL OFL）
scripts/             generate-blog-post.ts / chat-selftest.ts / check-links.mjs / prepare-images.mjs / fetch-fonts.mjs
```

## 絶対に守ること（文章・データ）

- 補助金の金額は `data/subsidies/*.ts` からだけ出す。ページに直書きしない
- 「必ずもらえる」「絶対」「確実に元が取れる」などの断定を書かない
- 葛飾区と東京都の助成を合算しない（併用可否が公式情報で確認できていないため）
- 架空の施工事例・お客様の声・削減率・施工写真を作らない。0件の間は「順次掲載予定」
- 「創業○年」「施工○件」「地域No.1」「正規取扱店」「自社施工」「有資格者」など未確認の表現を使わない
- 電話番号・LINE・営業時間は `lib/site.ts` に値が入るまで出さない
- **TOP のヒーローには CTA ボタンを置かない**（固定バー・チャットの入口もスクロール後に出す）

## 補助金データの更新

`data/subsidies/*.ts` を直すと、TOP・補助金ページ・サービスページ・エリアページ・シミュレーター・FAQ・llms.txt の表示が連動する。

1. 制度の公式ページを確認し、`amount` / `maxAmount` / `rule` / `applicationPeriod` / `deadline` / `status` / `notes` を更新
2. `lastVerified` を確認日に更新
3. `lib/site.ts` の `subsidyInfoDate` を同じ日に更新（免責の基準日）
4. `docs/VERIFIED_FACTS.md` の数値も合わせて更新（自動生成記事とチャットの根拠）
5. `lib/blog-generator/facts.ts` の `allowedYenAmounts` に新しい単価・上限があれば追加
6. 上限額が変わったら `lib/chat/guard.ts` の `ALLOWED_CAPS` も更新

## 商品の追加

`data/products.ts` のテンプレートをコピーし、メーカー公式ページで確認した値を入れ、`status: "published"` にする。
`price` が未確定なら `null` のまま（「お問い合わせください」表示、Offer 構造化データなし）。
`recommended: true` + `recommendReason` を付けると /recommend/* に出る。

## 施工事例・お客様の声

`data/works.ts` / `data/voices.ts` に、掲載許可を得た実際の事例・声だけを追加する。0件の間は「準備中」表示で `noindex`。

## チャット（自動応答）

右下（スマホは下の固定バー）の「チャット」から開く。回答は `/api/chat` が作る。

- **候補ボタン**：`data/faq.ts` の回答、または `lib/chat/scripted.ts` の決まった案内文をそのまま返す（AI を呼ばない）
- **自由入力**：`ANTHROPIC_API_KEY` があれば Claude が答える。答えてよい範囲は `docs/VERIFIED_FACTS.md` と `data/faq.ts` だけ
- **出力検査**（`lib/chat/guard.ts`）：断定表現、併用可能の断定、事実シートにない金額・単価・割合、実績や資格の表現、未確定の連絡先、URL が含まれる回答は表示せず、よくある質問の回答か案内文に切り替える
- **キーが無い／AI を止めた／上限に達した**：よくある質問との照合だけで答える。チャット自体は止まらない
- **費用の歯止め**：1接続元あたり毎分10回、AI 回答は1接続元1日40回・全体1日 `CHAT_AI_DAILY_LIMIT` 回（サーバーのインスタンスごとの概算）。他サイトからの呼び出しは拒否
- **保存しない**：会話はサーバーに保存せず、ログにも本文を出さない。表示はブラウザの sessionStorage にだけ残る
- 回答の文言を直すときは `data/faq.ts` か `lib/chat/scripted.ts` を直し、`npm run chat:selftest` を通す

## ブログ自動投稿

毎日1本、Claude API（既定 `claude-haiku-4-5`、`ANTHROPIC_MODEL` で変更可）で記事を生成する。

- トピックは `lib/blog-generator/topics.ts` から、既存記事・ガイドと検索意図が重ならないものを選ぶ（使い切ったらスキップ）
- 根拠は `docs/VERIFIED_FACTS.md` のみ。`validate.ts` の品質ゲートを通らない記事は公開しない
  - 既存記事とタイトル／検索意図／本文が似すぎる、分量不足、根拠のない金額・単価・割合、併用可能の断定、架空事例、キーワード詰め込み、存在しないリンク、許可外の出典
- 最大3回まで修正を依頼し、通らなければスキップ（失敗ではない）

### Vercel Cron で動かす（推奨）

`vercel.json` の cron が毎日 01:20 UTC（10:20 JST）に `/api/cron/generate-post` を叩く。
サーバーレス関数はファイルを書けないため、GitHub Contents API で `content/blog/` にコミットし、Vercel の自動デプロイで公開する。
必要な環境変数は `ANTHROPIC_API_KEY` / `CRON_SECRET` / `GITHUB_TOKEN`（Fine-grained PAT・Contents: Read and write）/ `GITHUB_REPO`（`owner/repo`）。

手動テスト: `curl -H "Authorization: Bearer $CRON_SECRET" "https://<domain>/api/cron/generate-post?dry=1"`

### GitHub Actions で動かす（代替）

`.github/workflows/daily-blog.yml`。Secrets に `ANTHROPIC_API_KEY` を登録。Vercel Cron と両方は有効にしない。

### ローカルで試す

```bash
DRY_RUN_FIXTURE=path/to/fixture.json npx tsx scripts/generate-blog-post.ts   # APIなしで品質ゲートだけ
ANTHROPIC_API_KEY=... npm run blog:dry-run
```

## SEO・AIO の仕組み

- **メタデータ**：全ページ `buildMetadata()`（title / description / canonical / OG / Twitter / RSS）。タイトルの末尾は `｜SOLAR SHIFT`
- **OG 画像**：ページごとに日本語の見出し入りで生成（`/og/…`）。対象は `lib/og-pages.ts`、固定ページの見出しは `lib/routes.ts` の `ogTitle`
- **構造化データ**：Organization / LocalBusiness / WebSite（全ページ）、BreadcrumbList、FAQPage、Article / BlogPosting（出典を citation に）、Service、HowTo、Blog、ItemList、CollectionPage / AboutPage / ContactPage、WebApplication、Product（価格未確定なら Offer なし）。口コミ・評価は出さない
- **sitemap.xml**：検索結果に出すページだけ。準備中の施工事例・お客様の声、記事が3本未満のカテゴリ、一覧の2ページ目以降は載せない
- **robots.txt**：AI 検索のクローラー（GPTBot・ClaudeBot・PerplexityBot・Google-Extended など）も許可
- **/llms.txt**：AI 検索向けの要約（運営・補助金の数値と確認日・主要ページ）。補助金の数値は `data/subsidies` から自動で出る
- **ブログ一覧**：1ページ12件でページを分ける（`/blog/page/2` …）。カテゴリは記事が3本たまるまで `noindex`
- **導入ガイド**：一覧ページ `/guide` がハブ。ガイドを足したら `data/guides.ts` に登録し、`app/guide/page.tsx` の `GROUPS` に入れる
- **ページを足すとき**：`lib/routes.ts` に追加（sitemap・リンク検査・OG 画像が連動）し、`lib/nav.ts` に表示名を入れる

## デザインと動き

- 色・影・アニメーションは `app/globals.css` の `@theme`。白文字を載せてよいのは `cta` / `green-600` / `navy`。白・クリーム・ベージュ地のオレンジの文字は `accent-text`
- 登場アニメーションは `{...reveal()}`（`lib/reveal.ts`）。表示の切り替えは `RevealObserver` が行う。JS が動かなければ全部表示されたまま
- 横に長い表は `TableScroll`、本文（`.prose-ss`）の中の表は `ProseTable` を使う（スクロールの案内とキーボード操作）

### 表示速度のために決めていること

実測の結果、次の3つを外すとスマホの Lighthouse が 90 点前後から 60 点台に落ちる。

1. **日本語の Web フォントは PC 幅（1024px 以上）だけ**、しかも最初の描画のあとに読み込む（`app/layout.tsx`）。スマホで読むと1ページで約 450KB のフォントを取りに行く。欧文・数字は `public/fonts/montserrat-latin.woff2`（基本ラテンのみ・約24KB）
2. **長いページの区画に `cv-block`（全幅の帯は `cv-auto`）** を付ける。画面に近づくまで中身を描画しない
3. **装飾アニメーションは無限に回さない**。数回で止まり、画面内にあるときだけ動く。動き続けるものが1つでもあると、Chrome は毎フレームのスタイル計算をメインスレッドで回し続ける

やってはいけないこと：**`app/layout.tsx` で `{children}` を `<Suspense>` で囲まない**。ハイドレーションは軽くなるが、静的生成した HTML で本文が `<main>` の外（`<div hidden>`）に回され、JS を実行しないクローラーから本文が見えなくなる。

## 画像の管理

- 配信する画像は `public/images/*.webp`、登録簿は `data/images.ts`（src / alt / width / height）。ページはこの登録簿のキーだけを参照する。
- 元画像（PNG）は `_photo-sources/`（Git管理外）に置き、`node scripts/prepare-images.mjs` で WebP に最適化して出力する。`icon-*` と `people-*` は白背景を透過にする。スタッフのポーズと蓄電池のイラストは `scripts/prepare-illustrations.mjs`
- 追加・差し替え：元PNGを `_photo-sources/` に入れ、`scripts/prepare-images.mjs` の MAP に1行追加 → スクリプト実行 → `data/images.ts` に登録 → ページで `images.<key>` を指定。
- 写真の alt は「〜のイメージ」とし、実在の場所・人物・施工実績を断定しない。
- 横に並べるイラストは `w-auto` にしない（読み込み前の大きさが 0 になり、下の内容が動く）。幅を決めて縦横比は width/height 属性に任せる

## お問い合わせフォーム

`RESEND_API_KEY` / `CONTACT_EMAIL_TO` / `CONTACT_EMAIL_FROM` を設定すると Resend でメール送信。未設定の間はフォーム送信時にメールアドレスを案内する（送信したふりはしない）。

## 未確定で空欄にしている情報（lib/site.ts）

- 電話番号・LINE・営業時間（`contact.*`）
- 郵便番号（`company.address.postalCode`）
- 法人番号（`company.corporateNumber`）
- Googleビジネスプロフィール（`gbp.*`）
- SNS（`social.*`）

空のままでも画面・構造化データには出ない。
