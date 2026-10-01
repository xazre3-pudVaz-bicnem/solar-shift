# SOLAR SHIFT 公式サイト

東京都葛飾区の太陽光発電・蓄電池サービス「SOLAR SHIFT」（運営：株式会社サイプレス）の公式サイト。
Next.js 16（App Router）+ TypeScript + Tailwind CSS v4。

🚨 **公開前チェック**：`NEXT_PUBLIC_SITE_URL` を本番ドメインで設定してからビルドすること。未設定のビルドは canonical / OG / sitemap を出さず、全ページ `noindex` になる（プレビューの誤インデックス防止）。デプロイ後は `/robots.txt` が `Allow: /` になっているか必ず確認する。

## コマンド

```bash
npm run dev          # 開発サーバー
npm run build        # 本番ビルド（型チェック込み）
npm run typecheck    # tsc --noEmit
node scripts/check-links.mjs   # 内部リンクの存在チェック
npm run blog:generate          # ブログ記事を1本生成して content/blog に保存
npm run blog:dry-run           # 保存せず内容だけ確認
```

## ディレクトリ

```text
app/                 ルート（固定ページ・動的ページ・API・sitemap/robots/RSS/OG画像）
components/
  layout/            Header / Footer / Breadcrumb / MobileNav
  ui/                Container / SectionHeading / Button / Callout / KeyPoints / Steps / ImagePlaceholder / ...
  sections/          CtaSection / FaqSection / ServiceLayout / GuideArticle / ContactForm
  subsidy/           SubsidyTable / SubsidyCard / SubsidyProgramSection / SubsidyCalculator
  product/           ProductCard / ProductComparison / ProductCatalog / ManufacturerList
  blog/              ArticleCard / ArticleBody / RelatedArticles / AuthorBox
data/
  subsidies/         補助金データ（katsushika.ts / tokyo.ts / national.ts）← 金額の唯一の正本
  products.ts        商品データ（status: published のみ公開）
  manufacturers.ts   メーカー一覧（relationship: candidate の間は「正規取扱」表記なし）
  works.ts           施工事例（空。架空事例は入れない）
  voices.ts          お客様の声（空）
  areas.ts           対応エリア（primary / secondary / planned）
  faq.ts             FAQ
  guides.ts          導入ガイドの登録簿（1ページ1検索意図）
  blog-categories.ts ブログカテゴリ
lib/
  site.ts            siteConfig（NAP・会社情報・連絡先。空欄は画面に出ない）
  seo.ts             buildMetadata / SITE_URL ゲート
  schema.ts          JSON-LD 生成
  subsidy-calc.ts    シミュレーターの計算（純関数）
  blog.ts            記事の読み込み・関連記事
  routes.ts          固定ページ一覧（sitemap・リンク検査・生成記事のリンク許可）
  blog-generator/    記事自動生成の共通コア（topics / facts / validate / generate）
content/blog/        記事（Markdown + frontmatter）
docs/VERIFIED_FACTS.md  検証済み事実シート（記事・生成記事で書いてよい数値の唯一の根拠）
scripts/             generate-blog-post.ts / check-links.mjs
```

## 画像の管理

- 配信する画像は `public/images/*.webp`、登録簿は `data/images.ts`（src / alt / width / height）。ページはこの登録簿のキーだけを参照する。
- 元画像（PNG）は `_photo-sources/`（Git管理外）に置き、`node scripts/prepare-images.mjs` で WebP に最適化して出力する。`icon-*` と `people-*` は白背景を透過にする。
- 追加・差し替え：元PNGを `_photo-sources/` に入れ、`scripts/prepare-images.mjs` の MAP に1行追加 → スクリプト実行 → `data/images.ts` に登録 → ページで `images.<key>` を指定。
- 写真の alt は「〜のイメージ」とし、実在の場所・人物・施工実績を断定しない。
- 未使用素材：複数画像を1枚にまとめたコラージュ・図解グリッド、緑系アイコン（`icon-g-*` は変換済みだが未使用）。

## 補助金データの更新

`data/subsidies/*.ts` を直すと、TOP・補助金ページ・サービスページ・エリアページ・シミュレーター・FAQ の表示が全て連動する。

1. 制度の公式ページを確認し、`amount` / `maxAmount` / `rule` / `applicationPeriod` / `deadline` / `status` / `notes` を更新
2. `lastVerified` を確認日に更新
3. `lib/site.ts` の `subsidyInfoDate` を同じ日に更新（免責の基準日）
4. `docs/VERIFIED_FACTS.md` の数値も合わせて更新（自動生成記事の根拠）
5. `lib/blog-generator/facts.ts` の `allowedYenAmounts` に新しい単価・上限があれば追加

## 商品の追加

`data/products.ts` のテンプレートをコピーし、メーカー公式ページで確認した値を入れ、`status: "published"` にする。
`price` が未確定なら `null` のまま（「お問い合わせください」表示、Offer 構造化データなし）。
`recommended: true` + `recommendReason` を付けると /recommend/* に出る。

## 施工事例・お客様の声

`data/works.ts` / `data/voices.ts` に、掲載許可を得た実際の事例・声だけを追加する。0件の間は「準備中」表示で `noindex`。

## ブログ自動投稿

毎日1本、Claude API（既定 `claude-haiku-4-5`、`ANTHROPIC_MODEL` で変更可）で記事を生成する。

- トピックは `lib/blog-generator/topics.ts` から、既存記事・ガイドと検索意図が重ならないものを選ぶ（使い切ったらスキップ）
- 根拠は `docs/VERIFIED_FACTS.md` のみ。`validate.ts` の品質ゲートを通らない記事は公開しない
  - 既存記事とタイトル／検索意図／本文が似すぎる、分量不足、根拠のない金額・単価・割合、併用可能の断定、架空事例、キーワード詰め込み、存在しないリンク、許可外の出典
- 最大3回まで修正を依頼し、通らなければスキップ（失敗ではない）

### Vercel Cron で動かす（推奨）

`vercel.json` の cron が毎日 01:20 UTC（10:20 JST）に `/api/cron/generate-post` を叩く。
サーバーレス関数はファイルを書けないため、GitHub Contents API で `content/blog/` にコミットし、Vercel の自動デプロイで公開する。

必要な環境変数（Vercel）:

| 変数 | 用途 |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude API |
| `ANTHROPIC_MODEL` | 任意。既定 `claude-haiku-4-5` |
| `CRON_SECRET` | Cron の認証（Vercel が自動で `Authorization: Bearer` を付ける） |
| `GITHUB_TOKEN` | Fine-grained PAT（対象リポジトリ Contents: Read and write） |
| `GITHUB_REPO` | `owner/repo` |
| `GITHUB_BRANCH` | 任意。既定 `main` |
| `SITE_URL` / `NEXT_PUBLIC_SITE_URL` | 本番URL |

手動テスト: `curl -H "Authorization: Bearer $CRON_SECRET" "https://<domain>/api/cron/generate-post?dry=1"`

### GitHub Actions で動かす（代替）

`.github/workflows/daily-blog.yml`。Secrets に `ANTHROPIC_API_KEY` を登録。Vercel Cron と両方は有効にしない。

### ローカルで試す

```bash
DRY_RUN_FIXTURE=path/to/fixture.json npx tsx scripts/generate-blog-post.ts   # APIなしで品質ゲートだけ
ANTHROPIC_API_KEY=... npm run blog:dry-run
```

## お問い合わせフォーム

`RESEND_API_KEY` / `CONTACT_EMAIL_TO` / `CONTACT_EMAIL_FROM` を設定すると Resend でメール送信。未設定の間はフォーム送信時にメールアドレスを案内する（送信したふりはしない）。

## 未確定で空欄にしている情報（lib/site.ts）

- 電話番号・LINE・営業時間（`contact.*`）
- 郵便番号（`company.address.postalCode`）
- 法人番号（`company.corporateNumber`）
- Googleビジネスプロフィール（`gbp.*`）
- SNS（`social.*`）

空のままでも画面・構造化データには出ない。
