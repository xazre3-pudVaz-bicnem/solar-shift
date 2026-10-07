# Search Console の運用メモ

Google Search Console（以下 GSC）で、公開後に確かめること・定期的に見ることをまとめる。
コードからは GSC を操作できない。ここに書いた作業は、GSC の画面で人が行う。

本番 URL は `https://www.solarshift.jp/` だけ（`lib/site.ts` の `productionUrl`）。

## 1. はじめに行うこと

1. GSC にプロパティを追加する。おすすめは「ドメイン」プロパティ（`solarshift.jp`）。DNS の TXT レコードで確認する。
   - 「URL プレフィックス」で `https://www.solarshift.jp/` を追加する場合は、確認コードを Vercel の環境変数 `GOOGLE_SITE_VERIFICATION` に入れると、サイトの `<head>` に確認用のメタタグが出る。
2. サイトマップを送信する：`https://www.solarshift.jp/sitemap.xml`
3. Bing Webmaster Tools にも登録する（GSC から取り込める）。確認コードは環境変数 `BING_SITE_VERIFICATION`。
   - 変更したページの URL は、本番デプロイのたびに IndexNow で Bing へ送っている（`.github/workflows/indexnow.yml`）。

## 2. 公開後に「URL 検査」をかける順番

「URL 検査」に URL を入れ、「インデックス登録をリクエスト」を押す。1日に送れる数に上限があるので、上から順に。

| 順 | URL | 見ること |
| --- | --- | --- |
| 1 | `/` | Google が選んだ正規 URL が `https://www.solarshift.jp/` か |
| 2 | `/subsidy/katsushika` | インデックス登録の可否、よくある質問の構造化データの検出 |
| 3 | `/area/katsushika` | 同上 |
| 4 | `/simulation` | レンダリング後の HTML に、説明の文章が入っているか |
| 5 | `/solar` | 同上 |
| 6 | `/battery` | 同上 |
| 7 | `/guide/solar-cost` | 同上 |
| 8 | 新しく公開した重要な記事・ガイド | その都度 |

「テスト済みのページを表示」→「スクリーンショット」「HTML」で、本文が JavaScript の実行なしで入っていることを確かめる（このサイトの本文は、すべてサーバー側で HTML にしている）。

## 3. 定期的に見る項目（月に1回）

「ページ」（インデックス作成）の画面で、理由ごとの件数を見る。

| 項目 | 見方 | 対処 |
| --- | --- | --- |
| クロール済み - インデックス未登録 | 中身が薄い・ほかのページと似ている、と判断されたページ | そのページだけの内容があるかを見直す。似た記事があれば、強いほうへ統合して転送する（`next.config.ts` の `redirects`） |
| 検出 - インデックス未登録 | まだクロールされていないページ | 内部リンクが足りているかを `npm run seo:audit -- --table` の「被リンク」で見る。柱のページからリンクを張る |
| 重複しています（ユーザーにより、正規ページとして選択されていません） | canonical を付けていない重複 URL | どの URL かを確かめる。`?` 付きの URL なら問題なし（canonical が自分自身を指している） |
| Google が選択した正規 URL が、ユーザーの指定と異なる | Google が別の URL を正規と判断 | 指定した canonical と、内部リンクの URL がそろっているかを確かめる。`*.vercel.app` が出ていたら、転送が効いているかを確かめる |
| 見つかりませんでした（404） | リンク切れ・古い URL | 行き先があれば転送を足す。無ければそのまま（404 は正常な応答） |
| ページにリダイレクトがあります | 転送元の URL | 正常。統合した記事（下の一覧）と、旧 URL（`solar-shift-ten.vercel.app`）、`/recommend/*` がここに出る |
| noindex タグによって除外されました | 意図して外したページ | `/voice`（中身が入るまで）と、記事が3本未満のブログのカテゴリだけであること |

「ウェブに関する主な指標」（Core Web Vitals）で、モバイルの LCP・INP・CLS に「不良」「改善が必要」の URL が無いかを見る。

### 転送している URL（2026-10-07 時点）

| 転送元 | 転送先 | 理由 |
| --- | --- | --- |
| `https://solar-shift-ten.vercel.app/*` | `https://www.solarshift.jp/*` | 旧 URL。同じ内容が2つのドメインで見えるのを防ぐ |
| `/blog/katsushika-eco-subsidy-solar-procedure-2026` | `/subsidy/katsushika` | 内容が、柱のページの要約だった |
| `/blog/tokyo-solar-merit-2026` | `/subsidy/tokyo` | 同上 |
| `/recommend`・`/recommend/solar`・`/recommend/battery` | `/products` ほか | おすすめ商品のページを廃止 |

## 4. 検索クエリから、既存のページを強くする

「検索パフォーマンス」→「クエリ」で、次の条件のクエリを探す。

- 表示回数がある
- 平均掲載順位が 8〜30 位（もう少しで1ページ目、または1ページ目の下のほう）

そのクエリを受け持つページを決めて、**新しい記事を作る前に、そのページを直す**。

1. `lib/seo-map.ts` で、そのクエリに近いキーワードを持つページを探す（`npm run seo:check -- --table` で一覧が出る）
2. 受け持ちのページが決まっていなければ、いちばん内容が近い既存のページの `secondary` に足す（同じ語を2ページに入れると、`seo:check` が落とす）
3. そのページを直す
   - title：クエリの語が入っているか。前のほうにあるか
   - 冒頭の結論：クエリへの答えが、最初の段落にあるか
   - 見出し：クエリの語を含む h2 があるか（不自然に詰め込まない）
   - 足りない内容：検索結果の上位にあって、このページに無い説明は何か。事実シート（`docs/VERIFIED_FACTS.md`）に出典つきで足してから書く
   - 内部リンク：柱のページ・関連するガイド・記事から、そのページへリンクがあるか
4. 内容を変えたら、`lib/routes.ts`（固定ページ）や `data/guides.ts`（ガイド）の `updatedAt` を、その日の日付にする。**内容を変えていないのに日付だけを進めない**

例：クエリ「葛飾区 太陽光 費用」が 14 位

- 受け持ちは `/guide/solar-cost`（`secondary` に「葛飾区 太陽光 費用」がある）
- title に「葛飾区」「費用」が入っているかを確かめる
- 冒頭で「費用は何で決まるか」「葛飾区で使える補助金」に答えているかを確かめる
- `/subsidy/katsushika`・`/solar`・`/simulation` から、費用のガイドへのリンクがあるかを確かめる

### 受け持ちページ（最優先のキーワード）

| キーワード | 受け持ちページ |
| --- | --- |
| 葛飾区 太陽光／葛飾区 太陽光発電／葛飾区 蓄電池／葛飾区 ソーラーパネル | `/` |
| 葛飾区 太陽光 補助金／葛飾区 太陽光発電 補助金／葛飾区 蓄電池 補助金／かつしかエコ助成金 | `/subsidy/katsushika` |
| 葛飾区 太陽光 業者／葛飾区 太陽光 施工／葛飾区 太陽光 会社／葛飾区 蓄電池 業者／葛飾区 太陽光 おすすめ | `/area/katsushika` |
| 葛飾区 太陽光 費用／太陽光発電 費用 | `/guide/solar-cost` |
| 葛飾区 蓄電池 費用／蓄電池 費用 | `/guide/battery-cost` |
| 葛飾区 太陽光 見積もり | `/contact` |
| 葛飾区 太陽光 補助金 計算／太陽光 補助金 シミュレーション | `/simulation` |
| 太陽光 何年で元が取れる／太陽光 回収年数 | `/guide/solar-payback` |
| 葛飾区 太陽光 停電／葛飾区 太陽光 水害 | `/guide/blackout` |
| 葛飾区 太陽光 メンテナンス | `/guide/maintenance` |
| 葛飾区 V2H／葛飾区 V2H 補助金 | `/v2h` |
| 東京都 太陽光 補助金／東京都 蓄電池 補助金 | `/subsidy/tokyo` |

正本は `lib/seo-map.ts`。この表と食い違ったら、`lib/seo-map.ts` を正とする。

## 5. コードの側で確かめられること

```bash
VERCEL_ENV=production npm run build
npm run seo:audit                 # SEO マップとの突き合わせ ＋ 全 URL の監査
npm run seo:audit -- --table      # URL ごとの一覧（title・H1・canonical・主キーワード・被リンク・sitemap・更新日・schema）
npx tsx scripts/seo-audit.ts --live   # 本番の URL を取りに行き、ステータス・転送・canonical を確かめる
```

`seo:audit` が見ているもの：title・description・H1 の有無と重複、canonical、主キーワードの重複、孤立ページ、主要ページへの本文からのリンク数、sitemap.xml との食い違い、見出しの順番、行き先が分からないリンクの文言、画像の alt、構造化データ。
