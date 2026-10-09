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
npm run seo:audit      # seo:check ＋ 全 URL の監査（description の重複・孤立ページ・主要ページへのリンク数・sitemap・見出しの順番・alt・構造化データ）
npm run facts:audit    # 固定ページの数値が、事実シートの「出典つきの節」にあるかを点検
npm run chat:selftest  # チャット（自動応答）の自己診断。API は呼ばない
npm run contact:selftest  # お問い合わせフォームの送信の自己診断。メールは送らない
npm run blog:generate  # 記事の生成を1回試す。品質チェックに通ったときだけ content/blog に保存
npm run blog:dry-run   # 保存せず内容だけ確認
npm run blog:audit     # 公開済みの全記事を、生成時と同じ品質ゲートで点検（API は呼ばない）
npm run blog:selftest  # 品質ゲートそのものの自己診断（通すべき記事・落とすべき記事の見本で確認）
npm run fonts:fetch    # 見出し用の日本語フォント（public/fonts）を取り直す
npm run indexnow -- --all --dry-run  # IndexNow で送る URL を表示するだけ（実際に送るのは本番デプロイ後のワークフロー）
```

`seo:check` を本番と同じ条件で試すときは `VERCEL_ENV=production npm run build` のあとに実行する。

## 環境変数

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | | 本番 URL の上書き。ふだんは不要（`lib/site.ts` の `productionUrl` を使う）。ドメインを一時的に変えて確かめたいときだけ設定する |
| `SITE_URL` | | 同じ値の別名（上が無いときに参照） |
| `ANTHROPIC_API_KEY` | △ | ブログ自動投稿と、チャットの AI 回答に使う。無くてもチャットは「よくある質問」で動く |
| `ANTHROPIC_MODEL` | | 記事を書くモデル。既定 `claude-sonnet-5-5`（Haiku では、公開前の読み直しに通る記事を書けなかった） |
| `ANTHROPIC_REVIEW_MODEL` | | 公開前の読み直しに使うモデル。既定 `claude-opus-5-5`（書くモデルより上のモデルで点検する。呼べなかったときは、書くモデルで読み直す） |
| `ANTHROPIC_CHAT_MODEL` | | チャットのモデル。既定 `claude-haiku-4-5` |
| `CHATBOT_AI` | | `off` にするとチャットの AI 回答を止める（よくある質問だけで答える） |
| `CHAT_AI_DAILY_LIMIT` | | チャットの AI 回答の1日あたり上限。既定 300 |
| `CRON_SECRET` | △ | Vercel Cron の認証 |
| `GITHUB_TOKEN` / `GITHUB_REPO` / `GITHUB_BRANCH` | △ | Cron で生成した記事をコミットする |
| `RESEND_API_KEY` | △ | お問い合わせフォームのメール送信（Resend）。これだけ入れれば送れる |
| `CONTACT_EMAIL_TO` / `CONTACT_EMAIL_FROM` | | 送信先と送信元を変えたいときだけ。既定は、送信先が `lib/site.ts` の連絡先メール、送信元が `SOLAR SHIFT <noreply@solarshift.jp>` |
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
  product/           MakerShowcase（取扱メーカーの一覧）/ ProductCatalog / ProductCard / ProductComparison / CompareGuide
  works/             WorksCard（施工事例のカード）
  area/              AreaCard / NeighborAreaPage（周辺の区のページ）/ ApplyOrderFigure / AreaMapFigure / PublicSolarFigure
  guide/             PaybackCalculator（回収年数の試算）/ PaybackFormulaFigure
  glossary/          GlossaryList（用語集の一覧と絞り込み）
  blog/              BlogIndex / CategoryIndex / ArticleCard / ArticleBody / RelatedArticles / AuthorBox
  chat/              ChatPanel（開いたときに初めて読み込む）
data/
  subsidies/         補助金データ（katsushika.ts / tokyo.ts / national.ts）← 金額の唯一の正本
                     katsushika-details.ts（対象者の要件・必要書類・着工前チェック・期限）／combination.ts（併用の文言）
  sources.ts         出典の登録簿（ページの参考資料・記事の出典・品質ゲートが共有）
  products.ts        商品データ（status: published のみ公開）
  manufacturers.ts   メーカー一覧（relationship: candidate の間は名前を出さない）
  works.ts           施工事例（運営者から受け取った、掲載の許可のある事例だけ。架空事例は入れない）
  voices.ts          お客様の声（空）
  areas.ts           対応エリア（primary / secondary / planned）
  ward-programs.ts   周辺の区（足立区・墨田区・江戸川区）の補助金の要点。区の公式ページで確かめた内容だけ
  katsushika-public-solar.ts  葛飾区が公表している、区の公共施設の太陽光発電と想定発電量
  solar-assumptions.ts  国の委員会が買取価格を決めるときの想定値（回収年数の試算の初期値）
  glossary.ts        用語集（説明は事実シートで確かめられる内容だけ）
  faq.ts             FAQ（チャットの回答にも使う）
  guides.ts          導入ガイドの登録簿（1ページ1検索意図）
  blog-categories.ts ブログカテゴリ（紹介文 lead・親ページ pillarLinks つき）
  images.ts          画像の登録簿
lib/
  site.ts            siteConfig（本番 URL・NAP・会社情報・連絡先・信頼性の項目。空欄は画面に出ない）
  seo.ts             buildMetadata / SITE_URL ゲート / OG 画像のパス
  seo-map.ts         SEO マップ（ページごとの主キーワード・検索意図・役割・index）とカニバリの判定
  indexing.ts        中身がまだ無いページ（施工事例・お客様の声）を noindex にする判定
  schema.ts          JSON-LD 生成
  routes.ts          固定ページ一覧（sitemap・リンク検査・OG 画像の見出し）
  nav.ts             ヘッダー・フッター・サイトマップのメニュー（noindex のページは自動で外れる）
  og.tsx / og-pages.ts   OG 画像の描画と、対象ページの一覧
  page-labels.ts     パス → 表示名（リンクの文言に URL を出さないため）
  subsidy-calc.ts    シミュレーターの計算（純関数）
  payback.ts         回収年数の計算（純関数。単価などは呼び出し側から渡す）
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
- 金額や単価の表・大きな数字のすぐ下には、出典への短いリンクを置く（`components/ui/SourceNote.tsx`）。ページ末尾の「参考資料」だけにしない。補助金の一覧表（`SubsidyTable`）は、載せた制度の出典を自動で出す
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

### 周辺の区（足立区・墨田区・江戸川区）の制度の更新

1. 各区の公式ページ（とパンフレット）を開いて、金額・受付期間・条件を確かめる
2. `data/ward-programs.ts` を直す（`pageUpdatedAt` に区のページの更新日、`sources[].verifiedAt` に確認日）
3. `docs/VERIFIED_FACTS.md` の、その区の節を同じ内容に直す
4. `npm run build && npm run facts:audit && npm run seo:check` で確かめる

葛飾区の「交付額確定通知書の発送までの目安」（`data/subsidies/katsushika-details.ts` の `katsushikaNoticeEstimate`）は、区が随時書き換える値。ページには「いつの時点の案内か」が出るので、区のページを見て、日付と一緒に直す。

国の委員会の想定値（`data/solar-assumptions.ts`）は、年度が変わったら、新しい年度の「調達価格等に関する意見」を読み直して直す。

## 商品

方針（2026-10-02・運営者の指示）：メーカー・商品は数が多いので、**個別の商品（型番・仕様・価格）は掲載しない**。代わりに、取り扱っているメーカーを一覧で見せる。

- `/products`・`/products/solar`・`/products/battery` は「選び方・比べ方のガイド」＋「取扱メーカーの一覧」
- 取扱メーカーは `data/manufacturers.ts`。画面に出るのは `relationship` が `handling` / `authorized` のものだけ。足すときは、運営者に取扱いを確認してから（推測で足さない）
- 一覧の表示は `components/product/MakerShowcase.tsx`（TOP と商品ページ）。見出しの社数は、データの件数から自動で出る
- **ロゴ**：2026-10-05 に運営者から「使ってよい」と連絡があり、各社の公式サイトに載っているロゴを `public/images/makers/` に置いている（取得元は `data/manufacturers.ts` の `logo.source`）。形・色は変えず、余白だけ切り詰めている。並べたときの見た目の大きさは、面積をそろえて決めている（`MakerShowcase.tsx` の `LOGO_AREA`）
  - メーカーを足すときは、ロゴを使ってよいかを運営者に確かめてから。使えないときは `logo` を入れなければ、社名の文字で出る
  - ロゴを並べても、正規取扱店・認定店であることを示すものではない（その表記は下の条件のときだけ）
- 「正規取扱店」「認定店」「メーカー認定」の表記は、証憑を確認できたとき（`authorized`）だけ
- 社数を変えたら `docs/VERIFIED_FACTS.md` の取扱メーカーの行も直す（`npm run facts:audit` が食い違いを見つける）
- `/recommend/*`（おすすめ商品）は廃止し、`/products/*` へ転送している（`next.config.ts` の `redirects`）
- `data/products.ts` と `/products/[slug]` の仕組みは残してある（いまは0件。方針が変わって商品を載せる場合は、メーカー公式ページで確認した値を入れて `status: "published"` にする）

## 施工事例・お客様の声

`data/works.ts` / `data/voices.ts` に、掲載許可を得た実際の事例・声だけを追加する。0件の間は「準備中」表示で `noindex`・メニュー非表示・sitemap 対象外（1件入れると自動で公開に切り替わる。判定は `lib/indexing.ts`）。

- 施工事例は、2026-10-02 に運営者から「実際のお客様の事例」として受け取った5件を掲載している。2026-10-05 に運営者から「載せてよい」と連絡があった。見出し・本文・電気代・設備は、受け取った表記のまま
- 受け取っていない項目（築年数・屋根形状・メーカー・施工した年月・工事期間・写真）は `null` / 空。空の項目は画面に出ない
- **写真は、その事例の実際の写真だけ**。イメージ写真や生成画像を、事例の写真として使わない（写真が無い事例は、設備の種類のアイコンで表示する）
- **電気代は、受け取った金額をそのまま出す**。差額・削減率・年間の金額を、こちらで計算して書かない。注記（`WORK_BILL_NOTE`）を必ず添える
- 事例の金額は、`docs/VERIFIED_FACTS.md` の「施工事例」の節（出典 URL なし）にも書く。固定ページの点検（`facts:audit`）では既知の数値として扱うが、記事・チャットの根拠には使えない
- 事例は TOP（葛飾区の事例を3件まで）、`/works`、エリアページ（その区の事例）、太陽光・蓄電池・太陽光＋蓄電池のページ（設備の種類が合う事例を3件まで。`worksWithEquipment`）に出る
- お客様の声（`/voice`）は、ご本人の言葉をそのまま掲載できる場合だけ追加する。いまは0件で `noindex`
- Review / AggregateRating の構造化データは出さない

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
モデルは Claude API。書くモデルは既定 `claude-sonnet-5-5`（`ANTHROPIC_MODEL` で変更可）、読み直すモデルは既定 `claude-opus-5-5`（`ANTHROPIC_REVIEW_MODEL` で変更可）。

### 流れ

1. **題材を選ぶ**（`lib/blog-generator/topics.ts`）：葛飾区に固有の題材を優先。既存の記事・ガイド・固定ページ（`lib/seo-map.ts`）と検索意図が重なる題材は選ばない。既存の記事と近い題材は、新しく書かずに「既存記事の更新候補」としてログに出す（`updateCandidates`）
2. **書く**：`docs/VERIFIED_FACTS.md`（節ごとに出典 URL つき）だけを根拠に書かせる
3. **機械の検査**（`validate.ts` / `claims.ts`）：次のどれかに当たれば不合格
   - 数値・日付・割合が、事実シートの「出典つきの節」に無い。または、その出典が記事の参考資料に入っていない
   - 固定ページとカニバリする（主キーワードがほぼ同じ）、既存記事とタイトル・検索意図が近い、本文や見出しの構成が既存記事の焼き直し
   - 本文が 1,800 字未満、または見出しだけで中身が薄い
   - 架空の経験・事例・費用、根拠を示さない「一般的に」「多くの場合」、根拠のない No.1・最上級、メーカー資料で確認していない仕様
   - 併用や交付の断定、実績・資格の表現、存在しないページへのリンク、許可外の外部リンク、親になる固定ページへのリンクが無い
   - **品質スコア**（`score.ts`）が基準に届かない。独自性・検索意図との一致・出典の質・地域との結び付き・内部リンク・取り合いの少なさの6項目を、数えられるものだけで各1〜5点に採点する。どの項目も3点以上（地域との結び付きだけは2点以上）、合計22点以上で合格。点数はログと、記事の frontmatter の `quality.scores` に残る。公開済みの記事の点は `npm run blog:audit` で見られる
4. **読み直し**（`reviewArticle`）：数値以外の主張（制度の条件・手続きの順番・機器の説明）が事実シートにあるかを、別の呼び出しで1つずつ確かめる。事実シートに無い理由づけ・推測、対応エリアの広げすぎ、誤字、リンクの文言とリンク先の食い違いも挙げさせる。1つでもあれば不合格。読み直しは、書くモデルより上のモデルで行う（同じモデルで読み直すと、根拠のない理由づけを見逃した）。読み直しを最後まで終えられなかったとき（出力が上限に達した・返答を解析できなかった）は、記事の書き直しは求めずに、読み直しだけを1回やり直す。それでも終えられなければ、その回は公開しない
5. **公開**：3と4の両方に通ったときだけ保存する。記事の frontmatter に `claims`（主張・出典・出典の種類・確認済み）、`sources[].sourceType`、`pillar`（親ページ）、`quality`（検査の版・検査日・字数・品質スコア・読み直したモデル）が残る

不合格のときは、理由を伝えて書き直させる（最大5回まで試す）。読み直しで落ちたときは、指摘された文だけを直させる（全体を書き直させると、直した分だけ新しい説明が足されて、また落ちる）。それでも通らなければ、その回は公開しない。

**モデルの選び方と費用の目安**（2026-10-02 に、同じ題材で実際に試した結果）

| 書くモデル | 読み直すモデル | 結果 |
|---|---|---|
| `claude-haiku-4-5` | `claude-haiku-4-5` | 合格するが、読むと粗が残る（言い換えた引用・誤字・根拠のない理由づけ・対応エリアの広げすぎ） |
| `claude-haiku-4-5` | `claude-opus-5-5` | 5回書き直しても通らない（3回試して3回とも）。誤字と、事実シートに無い補足が毎回入る |
| `claude-sonnet-5-5`（既定） | `claude-opus-5-5`（既定） | 読み直しの指摘は毎回1件で、4回目に合格。読んでも粗が無い |

既定の組み合わせで合格した回の実測は、書く側が入力 計10.3万・出力 計2.3万トークン（4回）、読み直しが入力 計5.6万・出力 計1.1万トークン（3回）。料金表の単価（Sonnet 5.5：入力 $2・出力 $10、Opus 5.5：入力 $4・出力 $20。いずれも100万トークンあたり）で計算すると、1回の実行で 0.3〜0.7 ドルほど（1回目で合格すれば 0.3 ドル前後）。使ったトークン数は、実行のたびにログに出る（`試行N（モデル）: 入力 … / 出力 …`、`読み直し（モデル）: …`）。費用を下げたいときは Secrets の `ANTHROPIC_MODEL` / `ANTHROPIC_REVIEW_MODEL` で変えられるが、上の表のとおり、品質か合格率のどちらかが落ちる。

**ゲートを変えたら、実際のモデルで試して、合格した記事を読む**：`gh workflow run daily-blog.yml --ref main -f dry_run=true` で、保存せずに1回動かせる。試行ごとの不合格の理由と、合格した記事の全文がログに出る（`gh run view <id> --log`）。機械の検査と読み直しを通っても、読むと粗が見つかることがある。見つけたら、検査を1つ足す。

出典の種類（`sourceType`）は、国・自治体／執行団体（SII など）／メーカー公式／業界団体（太陽光発電協会など）。まとめサイト・他社サイト・口コミは根拠にしない。

### 記事の表示

記事ページに出すのは「最終更新日」「編集・運営：SOLAR SHIFT / 株式会社サイプレス」と、末尾の「参考資料」。AI を使った作り方と公開前の確認の手順は、記事ごとには出さず `/editorial-policy` で説明している。

### GitHub Actions で動かす（推奨）

`.github/workflows/daily-blog.yml`。毎日 01:20 UTC（10:20 JST）。Secrets に `ANTHROPIC_API_KEY` を登録する（任意で `ANTHROPIC_MODEL` / `ANTHROPIC_REVIEW_MODEL`）。
保存の前に `npm run blog:audit` で全記事を点検し、問題が1本でもあれば push しない。執筆と読み直しで複数回モデルを呼ぶため、実行時間に余裕のあるこちらを勧める（1回の執筆は20〜70秒、読み直しは30〜50秒。生成は持ち時間の11分で自分から終える。ジョブの上限は15分）。
手動実行（Run workflow）では、`dry_run`（保存しない）のほか、`model` / `review_model` でモデルを指定して試せる。

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

運用の手順は別の文書にある：Search Console で見る項目と、検索クエリから既存ページを直す手順は `docs/seo-search-console.md`、サイトの外で行う作業（Google ビジネス プロフィール・会社サイトからのリンクなど）は `docs/offsite-seo.md`。

### 検索クエリから直す順番（新しい記事を作る前に）

Search Console の「検索パフォーマンス」で、**表示回数があり、平均掲載順位が 8〜30 位のクエリ**を先に直す。

1. そのクエリを受け持つページを `lib/seo-map.ts` で決める（無ければ、いちばん近い既存ページの `secondary` に足す。同じ語を2ページに入れると `seo:check` が落とす）
2. そのページの title・冒頭の結論・見出し・足りない内容・内部リンクを直す
3. 内容を変えたら、そのページの `updatedAt`（固定ページは `lib/routes.ts`、ガイドは `data/guides.ts`、記事は frontmatter）を、その日の日付にする

例：「葛飾区 太陽光 費用」が14位なら、受け持ちの `/guide/solar-cost` の title と冒頭を見直し、`/subsidy/katsushika`・`/solar`・`/simulation` からのリンクを確かめる。新しい記事は作らない。

### 仕組みの一覧

- **SEO マップ**（`lib/seo-map.ts`）：ページごとに、主キーワード・関連キーワード・検索意図・役割・title や H1 に必ず入れる語・index するかを1か所で決めている。主キーワードが2ページで重ならないこと、title / H1 に必要な語が入っていること、canonical / robots / sitemap が設定どおりであることを `npm run seo:check` がビルド結果から確かめる
- **役割分担**：`/` ＝ 葛飾区 太陽光／蓄電池、`/subsidy/katsushika` ＝ 葛飾区 太陽光 補助金・かつしかエコ助成金、`/area/katsushika` ＝ 葛飾区 太陽光 業者・施工・会社、`/solar` ＝ 住宅用 太陽光発電、`/battery` ＝ 家庭用 蓄電池 選び方。ブログは固定ページで扱いきれない細かい疑問（ロングテール）を受け持ち、記事の末尾から親の固定ページへ案内する
- **メタデータ**：全ページ `buildMetadata()`（title / description / canonical / OG / Twitter / RSS）。タイトルの末尾は `｜SOLAR SHIFT`。ただし本体の幅が 50（全角25字）を超えるタイトルには付けない（`lib/seo.ts` の `fullTitle`）
- **OG 画像**：ページごとに日本語の見出し入りで生成（`/og/…`）。対象は `lib/og-pages.ts`、固定ページの見出しは `lib/routes.ts` の `ogTitle`
- **構造化データ**：Organization / LocalBusiness / WebSite（全ページ）、BreadcrumbList、FAQPage、Article / BlogPosting（出典を citation に）、Service、HowTo、Blog、ItemList、CollectionPage / AboutPage / ContactPage、WebApplication、Product（価格未確定なら Offer なし）。口コミ・評価は出さない
- **全 URL の監査**（`npm run seo:audit`・`scripts/seo-audit.ts`）：ビルド後の HTML から、title・description・H1 の重複、canonical、孤立ページ、主要ページ（`KEY_PAGES`）へ本文からリンクしているページの数、sitemap.xml との食い違い、見出しの順番、「こちら」だけのリンク、alt、構造化データを見る。`--table` で URL ごとの一覧、`--live` で本番のステータス・転送・canonical の実測
- **ページごとの更新日**（`lib/routes.ts` の `updatedAt`・`routeUpdatedAt`）：sitemap.xml の lastmod、画面の「最終更新」、構造化データの dateModified が同じ日付を使う。**内容を変えたときだけ進める**（ビルドした日を入れない。日付だけを進めない）
- **旧 URL の転送**（`lib/site.ts` の `legacyHosts`）：`solar-shift-ten.vercel.app` へのアクセスは、同じパスの本番ドメインへ 308 で転送する。プレビューのデプロイ（別のホスト名）は対象外で、`*.vercel.app` には `X-Robots-Tag: noindex` が付く
- **統合した記事**（`next.config.ts` の `redirects`）：柱のページの要約になっていた記事は、柱のページへ 308 で転送している。記事を消すときは、必ず転送を足し、その記事へのリンク（本文・`prefer`）を直す
- **関連記事**（`lib/blog.ts` の `relatedScore`）：同じ親ページ・検索意図の語・カテゴリ・タグ・題名の近さで採点し、3点以上の上位3本だけを出す
- **noindex にするページ**：お客様の声（中身が入るまで）、記事が3本未満のカテゴリ、404。どれも sitemap に載せない
- **canonical**：全ページが自分自身の URL を指す。ブログ一覧の2ページ目以降（`/blog/page/2` …）も自分自身を指し、index のまま（sitemap には載せない）
- **sitemap.xml**：検索結果に出すページだけ。`lastmod` は記事の更新日、固定ページは `siteConfig.contentUpdatedAt` と補助金情報の基準日の新しいほう
- **robots.txt**：AI 検索のクローラー（GPTBot・ClaudeBot・PerplexityBot・Google-Extended など）も許可
- **IndexNow**：本番のデプロイが終わると、`.github/workflows/indexnow.yml` が変わったページの URL を Bing などに知らせる（`scripts/indexnow.mjs`）。ブログの記事だけが増えた日は、その記事と `/blog`・カテゴリ・ピラーのページだけ。共通の部品やデータが変わった日は sitemap.xml の全 URL。ChatGPT の検索は Bing の索引を使うので、AI 検索に載るまでの時間も縮む。Google は参加していない（sitemap.xml と Search Console で知らせる）
  - 鍵は `public/19065891757ebf0ce0ff4633cc0c34b7.txt`（公開してよい文字列）。作り直すときは、ファイル名と中身を同じ32文字にして、古いファイルは消す
  - Actions の画面から手動で動かすと、sitemap.xml の全 URL を送る（Bing Webmaster Tools を登録した直後などに使う）
- **/llms.txt**：AI 検索向けの要約（運営・補助金の数値と確認日・主要ページ）。補助金の数値は `data/subsidies` から自動で出る
- **ブログ一覧**：1ページ12件でページを分ける（`/blog/page/2` …）
- **導入ガイド**：一覧ページ `/guide` がハブ。ガイドを足したら `data/guides.ts` に登録し、`app/guide/page.tsx` の `GROUPS` に入れる
- **周辺の区のページ**（`/area/adachi` `/area/sumida` `/area/edogawa`）：主キーワードは「◯◯区 太陽光 補助金」。内容は `data/ward-programs.ts` だけから出す（`components/area/NeighborAreaPage.tsx`）。区ごとに制度が違うので、葛飾区の説明を流用しない
- **TOP の「知りたいことから読む」**：検索の多いテーマのガイド6本への入口（`app/page.tsx` の `homeGuides`）。いちばん強いページからガイドへリンクを渡すための区画
- **ブログのカテゴリの親ページ**（`data/blog-categories.ts` の `pillarLinks`）：記事の末尾に出る「このテーマの固定ページ」。新しいガイドを足したら、合うカテゴリに入れる
- **蓄電池のメリット・デメリットのガイド**（`/guide/battery-merit-demerit`）：付けるかどうかの判断材料に絞る。寿命・保証は SII の登録基準として書けることだけ
- **再エネ賦課金のガイド**（`/guide/renewable-energy-surcharge`）：単価・目安・推移は `data/surcharge.ts` だけから出す。毎年3月ごろに経済産業省が翌年度の単価を公表するので、そのときに `data/surcharge.ts` と事実シートを直す（タイトルも自動で変わる）
- **売電収入と税金のガイド**（`/guide/solar-tax`）：国税庁・葛飾区・東京都主税局の公開情報だけで書く。税額の計算例は書かない。住宅の太陽光が償却資産の申告の対象になるかは断定しない
- **東京都の資料にもとづくガイド**（`/guide/tokyo-solar-mandate` `/guide/solar-safety` `/guide/zero-yen-solar`）：主な出典は東京都環境局「太陽光パネル設置に関するQ&A」（`data/sources.ts` の `tokyoSolarQa`）。文中では「東京都のQ&Aによると」と主語を付ける。都の試算（4kW・117万円など）は、時点（令和7年10月）と条件を必ず添え、SOLAR SHIFT の試算と混ぜない
- **用語集**（`/glossary`）：`data/glossary.ts`。説明は事実シートで確かめられる内容だけ。構造化データは DefinedTermSet
- **回収年数のガイド**（`/guide/solar-payback`）：式と前提を示し、見積書の数字を入れて試算する道具（`components/guide/PaybackCalculator.tsx`、計算は `lib/payback.ts`）。初期値は、国の委員会の想定値（`data/solar-assumptions.ts`）と FIT の単価だけ。相場の金額は初期値にしない
- **よくある質問の構造化データ**：共通の質問（`data/faq.ts`）は `/faq` だけでマークアップする。ほかのページは、そのページにしか無い質問だけを出す（`FaqSection`）。重複は `seo:check` が落とす
- **ページを足すとき**：`lib/routes.ts` に追加（sitemap・リンク検査・OG 画像が連動）、`lib/nav.ts` に表示名、`lib/seo-map.ts` にキーワードと役割を入れる
- **地域名**：亀有・金町・新小岩・青戸・柴又・高砂・水元・立石・四つ木・堀切 は `/area/katsushika` の中で「区内の対応エリア」として扱う。町名ごとの薄いページは作らない

## デザインと動き

- 配色は、クリーム（`cream`）の地に、ソーラーオレンジと緑。文字はネイビー。色と影は `app/globals.css` の `@theme`（`cream` / `beige` / `marker` / `shadow-card` / `shadow-pop`）
- 主ボタンは `orange-500` の地にネイビーの文字（白文字はコントラストが足りない）。オレンジ色の「文字」は `accent-text`
- 白い角丸カード（`rounded-2xl` / `rounded-3xl`）と、やわらかい影。見出しには、オレンジの吹き出しラベルと、蛍光ペン（`.marker`）を使う
- 人物イラスト・スタッフのイラスト・設備アイコン・写真を、区画ごとに添える（`data/images.ts`）。本文の途中の「ここが大事」は `StaffTip`（スタッフのイラスト＋吹き出し）
- **TOP のヒーローには、ボタンもリンクも置かない**（最初の導線は、ヒーロー直下の文字リンク）
- 図解は部品にしてある：電気の流れ（`EnergyFlowFigure`）、FIT の単価（`FitStepChart`）、区ごとの申請の順番（`components/area/ApplyOrderFigure`）、対応エリアの位置関係（`AreaMapFigure`）、区の公共施設の発電量（`PublicSolarFigure`）、回収年数の式（`components/guide/PaybackFormulaFigure`）
- 登場の動きは `{...reveal()}`（`lib/reveal.ts`）。下から・左右から・ポンと出る、を選べる。表示の切り替えは `RevealObserver` が行い、JS が動かなければ全部表示されたまま
- 飾りの動き（`animate-float` / `twinkle` / `bob-x` / `flow-x` など）は、**回数を決めて**あり、画面に入っているあいだだけ動く（`RevealObserver` が `data-inview` を付ける）。無限に回る動きは足さない
- ヒーローの登場は `.enter-rise` / `.enter-slide` / `.enter-pop`（1回だけ）。蛍光ペンは `.marker-draw` で左から引く。h1 と写真は、透明から始めない（最初の描画を遅らせないため）
- 横に長い表は `TableScroll`、本文（`.prose-ss`）の中の表は `ProseTable` を使う（スクロールの案内とキーボード操作）
- スマホ：押す場所は 44px 以上、入力欄の文字は 16px。下の固定バーは「チャット・試算・電話・無料相談」。TOP ではヒーローを過ぎてから出す。メニューは `details` のアコーディオン

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
`RESEND_API_KEY` を Vercel の環境変数（Production）に入れて再デプロイすると、Resend でメールを送る。未設定の間は、入力した内容を本文に入れたメールと電話番号を案内する（送信したふりはしない）。

- Resend のドメインは `solarshift.jp` を確認済み（2026-10-09）。送信元は、このドメインのアドレスでなければ送れない
- 送信先は `lib/site.ts` の連絡先メール。お客様がメールアドレスを書いたときは、返信先（Reply-To）にそのアドレスが入るので、届いたメールにそのまま返信できる
- キーは Resend の「API keys」で作る。権限は「Sending access」、ドメインは `solarshift.jp` に絞る
- 送信に失敗したときは、Vercel のログに `[contact] Resend での送信に失敗` と理由が出る

## 未確定で空欄にしている情報（lib/site.ts）

- 施工体制・施工会社・許認可・有資格者・メーカーの施工ID・保証・工事保険・導入後のサポート（`trust.*`）
- LINE（`contact.lineUrl`）
- 年末年始の休み。営業時間（`contact.hours` ＝ 9:00〜20:00）と定休日なし（`contact.businessDays`・`contact.openDays`）は記入済み（2026-10-05・06 に運営者から連絡）。電話番号の横に「（営業時間 9:00〜20:00・定休日なし）」と出て、LocalBusiness の `openingHoursSpecification` に毎日 9:00〜20:00 が出る。年末年始の休みは未確認なので、チャットに「年中無休」とは書かせない（`lib/chat/guard.ts`）
- 法人番号（`company.corporateNumber`）
- Googleビジネスプロフィール（`gbp.*`）。`gbp.embedUrl` にプロフィールの埋め込み用 URL を入れると、運営会社ページと葛飾区のエリアページに地図が出る（住所だけで埋め込むと建物名のカードが出るため、プロフィール登録までは地図を出さない）
- SNS（`social.*`）

空のままでも画面・構造化データには出ない。

電話番号（`contact.tel` / `contact.telDisplay`）・メール・所在地は記入済み。変えるときは `lib/site.ts` と `docs/VERIFIED_FACTS.md` の両方を直す。画面（CTA・固定バーの「電話」・メニュー・フッター・運営会社の地図）、構造化データ（`telephone` / `PostalAddress`）、チャットの案内、`/llms.txt` は `lib/site.ts` から自動で変わる。
