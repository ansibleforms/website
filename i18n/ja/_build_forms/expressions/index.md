---
layout: default
title: 式
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# 式
{: .no_toc }

ブラウザーまたはサーバーで、JavaScript を使ってフィールドの値を計算する
{: .fs-6 .fw-300 }

---

フォーム作成者向け: ブラウザーで計算したり、サーバーで取得したりした値を JavaScript でフィールドに動的に入れる方法を説明します。

フォームフィールドの `expression` 属性を使うと、JavaScript の式で動的なフォームを作成できます。

---

## はじめに

`expression` 属性は、複数のフィールドの種類で使用できます。
- `enum` フィールド: ドロップダウンの選択肢を動的に設定する
- `expression` フィールド: あらゆる形式のデータを取得または生成する
- `html` フィールド: HTML コンテンツを作成する
- `yaml` フィールドと `list` フィールド: データを入れる

JavaScript の式は、フィールドのプロパティ `runLocal` の設定に応じて、 **サーバー側** (既定) または **クライアント側** で評価されます。
`html` フィールドと、フィールドの種類 `local`、 `local_out`、 `credential` は、 `runLocal` の設定にかかわらず、
常にブラウザーで式を実行します。

- **サーバー側** ( `runLocal: false`、既定): API、ファイル、データベースからデータを取得する定義済みの関数です。
- **クライアント側** ( `runLocal: true` ): ブラウザーのサンドボックス内の完全な JavaScript エンジンを使って、計算、変換、操作を行うコードです。

---

## セキュリティ上の懸念

式は JavaScript の `eval` 関数で評価されるため、コードインジェクションが懸念されます。

- **サーバー側の式** は、まずサニタイザーを通ります。すべての呼び出しは `fn.` または `fnc.` の関数である必要があり、複数行、
  `;`、テンプレートリテラル、 `process.env`、 `eval` から抜け出す手段 ( `import`、 `require`、 `constructor` など) は拒否されます。
- **クライアント側の式** はブラウザーのサンドボックスで評価されるため、安全とみなせます。

サニタイザーの厳しさは
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) で決まります。

| 値 | サーバー側の式 |
|---|---|
| `strict` (既定) | `fn.` と `fnc.` の呼び出しと、 `fn.fnTime().format('YYYY')` のようなその結果に対するメソッド |
| `paranoid` | `fn.` と `fnc.` の直接の呼び出しだけ。結果に対するメソッドは不可 |
| `off` | サーバー側の式はすべて拒否されます。 `runLocal` の式だけが動作します |
| `legacy` | 6.2.1 のルール。認証済みのユーザーなら誰でもサーバー上でコードを実行できます。アップグレード時専用で、実際の環境変数でのみ設定できます (設定ページからは不可) |

空の値や不明な値は `strict` とみなされます。変更は再起動なしで、次の式から適用されます。

---

## このセクションの内容

各トピックはそれぞれのページで説明しています。

| ページ | 内容 |
|---|---|
| [プレースホルダー](placeholders.html) | `$(...)` でほかのフィールド、定数、ユーザーを参照する |
| [ローカル式](local.html) | ブラウザーのサンドボックスで実行される JavaScript |
| [リモート式](remote.html) | 日付、ネットワーク、ファイル、SSH、連番の名前のためのサーバー側の関数 |
| [REST API](rest-apis.html) | Basic、トークン、カスタム認証で REST API を呼び出す |
| [認証情報](credentials.html) | 保存された認証情報を読み取る |
| [並べ替え](sorting.html) | 並べ替えオブジェクトで配列を並べ替える |
| [jq クエリ](jq.html) | jq でデータを整形する |
