# Search Console の CSV の置き場所

`npm run seo:opportunities` が、このフォルダの `*.csv` を読んで「どのページの何を直すか」を出します（`scripts/seo-opportunities.ts`）。

**CSV はリポジトリに入れません。** このリポジトリは公開されているため、`.gitignore` で `*.csv` を除いています。手元のパソコンに置いて実行してください。

## 出し方

### 1. 画面からのエクスポート（いちばん簡単）

1. Search Console で `solarshift.jp` のプロパティを開く
2. 「検索パフォーマンス」→ 期間を「過去 3 か月」にする（検索タイプは「ウェブ」）
3. 右上の「エクスポート」→「CSV をダウンロード」
4. ZIP を展開し、クエリの表とページの表の CSV（日本語の画面では「クエリ」「ページ」という名前のファイル）を、このフォルダに置く

列名は日本語（上位のクエリ・クリック数・表示回数・CTR・掲載順位）でも英語でも読めます。

この出し方では、クエリとページの組み合わせが出ないため、「取り合い（同じクエリで2ページ以上）」は判定できません。

### 2. クエリとページの組み合わせ（取り合いまで見るとき）

次のどちらかで、`query, page, clicks, impressions, ctr, position` の列を持つ CSV を作って置きます。

- Looker Studio の Search Console コネクタ（「URL のインプレッション」の表で、クエリとランディングページを並べてダウンロード）
- Search Console API の `searchanalytics.query`（dimensions に `query` と `page`）

## 実行

```bash
npm run seo:opportunities                          # 一覧を出す
npm run seo:opportunities -- --min-impressions 50  # 表示回数の下限を変える（既定 30）
npm run seo:opportunities -- --out docs/seo-opportunities.md  # Markdown にも書き出す（中身は公開されるので、出す前に確かめる）
```

結果は「候補」です。新しいページを作る前に、受け持ちのページ（`data/seo/keyword-map.ts`）の title・見出し・冒頭の答え・内部リンクを直します。進め方は `docs/seo-playbook.md`。
