# 走り継ぐ

1982年のフォード・レインジャー4×4から最新のマシンまで、いま走らせたいミニ四駆をシリーズ・シャーシ・年代で横断するキュレーションサイト。

公開URL: https://mini4wd.napoblog.com

[EmDash](https://github.com/emdash-cms/emdash)(Astro製CMS)で作り、Cloudflare Workers + D1 + R2 で動かしています。姉妹サイト「遊び継ぐ」(game-curation)「組み継ぐ」(gunpla-curation)と同じ作りです。コード上のコレクション名・タクソノミー名は組み継ぐと共通で、`kits` がマシン、`grade` がシリーズ、`series` がシャーシです。

## ページ

| ページ | パス |
|---|---|
| トップ | `/` |
| マシン一覧(年代・シリーズ・シャーシ・推し度で絞り込み) | `/kits` |
| マシンページ | `/kits/:slug` |
| 年表 | `/timeline` |
| シャーシガイド | `/chassis` |
| パーツ名簿(分類別・発売年別) | `/parts`, `/parts/:分類` |
| 全車種名簿(シリーズ別・初出年別) | `/catalog`, `/catalog/:シリーズ`, `/catalog/:シリーズ/:年`(年不明は `/0`) |
| 特集 | `/posts`, `/posts/:slug` |
| 検索 | `/search` |
| このサイトについて | `/pages/about` |
| プライバシーポリシー | `/privacy` |

## データ

- 厳選マシンは `data/kits-*.mjs` に `data/entry.mjs` の `k()` で書く。本文は「どんなマシン/走らせどころ/ミニ四駆史の中で/こんな人におすすめ」の4見出し
- 初出年月は `node scripts/check-years.mjs data/kits-*.mjs` で全車種名簿と照合する。名簿にない車種は `data/catalog/additions.json` に足す
- 名簿から車種名を探す: `node scripts/find-kit.mjs <正規表現> [シリーズ]`
- `node scripts/build-seed.mjs` で `seed/seed.json` を生成(seed は空のデータベースにだけ適用される)
- 公開中のサイトへの反映は `node scripts/sync-remote.mjs --url https://mini4wd.napoblog.com`(先に `npx emdash login`)

## 全車種名簿

- 車種の一覧: 日本語版ウィキペディア「ミニ四駆一覧」(シリーズ・品番・シャーシ)、「フルカウルミニ四駆」「エアロミニ四駆」(発売年月)(CC BY-SA 4.0)
- 初出年月: タミヤ公式サイト「発売月製品一覧」(ミニ四駆)。同じ品番が何度も載る場合は、いちばん古い月を初出とする。再販の月は使わない
- 年月が確かめられない車種は「年不明」にまとめる
- 作り方: `scripts/catalog/` の `fetch.mjs`(ウィキペディア)と月別一覧の取得 → `extract.py` → `data/catalog/raw.json` → `node scripts/build-catalog.mjs`
- 月別一覧の生データは `data/catalog/tamiya-monthly.json`(`scripts/catalog/monthly.mjs` で取得)。`node scripts/catalog/monthly-split.mjs` で、名簿にない限定車・派生シリーズ(`extra-cars.json`)、年月の補いと表記違いの重複のまとめ(`date-fixes.json`)、パーツなど(`parts.json`)に分ける。名簿の組み立ては `data/catalog/roster.mjs`
- 年月は、発売日が書かれた商品・限定品(94000番台〜)・PRO/REV/派生シリーズの品番だけ一覧の月を使う。旧品番は一覧の月が再販の月のことがあるので使わない

## パーツ名簿

- `/parts`(分類一覧)と `/parts/:分類`。グレードアップパーツ・コース・グッズなどを、タミヤ公式の月別一覧と商品ページ(`scripts/catalog/items.mjs`、`data/catalog/tamiya-items.json`)から作る
- 分類は `monthly-split.mjs` の `CATS`(商品名のキーワードで振り分け)。`build-catalog.mjs` が `public/catalog-data/parts/` に書き出す

## 開発とデプロイ

```bash
npm install
npm run dev      # http://localhost:4321
npm run deploy   # astro build && wrangler deploy(手動デプロイ)
```

`main` ブランチに push すると、Cloudflare Workers Builds が自動でビルド・デプロイします(ビルド `npm run build`、デプロイ `npx wrangler deploy`)。ブランチごとのプレビュー版は本番と同じデータベースにつながるため、無効にしています。

`src/layouts/Base.astro` の `google-site-verification` は Search Console の所有権確認用なので消さないでください。

当サイトはファンによる非公式のサイトで、株式会社タミヤとは関係ありません。「ミニ四駆」は株式会社タミヤの登録商標です。
