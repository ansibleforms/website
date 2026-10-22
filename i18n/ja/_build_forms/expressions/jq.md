---
layout: default
title: jq クエリ
parent: 式
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# jq クエリ
{: .no_toc }

組み込み関数を含め、jq でデータを整形する
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## オブジェクトに JSON クエリ (jq) を実行する

オブジェクト (たとえばほかのフィールドの値) を jq 式で整形します。

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

7.3.0 以降、jq フィルターは最大 [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (既定は 30) 秒実行されると
停止され、出力は 64 MB までに制限されます。これは `fn.fnJq` と、REST、ファイル、認証情報、データベースクエリの各関数の
jq 式に適用されます。

---

## 組み込みの jq 関数

データを取得する関数はすべて、データオブジェクトや配列を操作するための言語である JSON クエリ (jq) を受け付けます。  
データを操作するときには、バイトを KB、MB、GB に変換したり、数値を丸めたりする必要がある場合があります。  
そのために、AnsibleForms にはいくつかのカスタム jq 関数が用意されています。

- **fn2KB**: バイトを KB に変換
- **fn2MB**: バイトを MB に変換
- **fn2GB**: バイトを GB に変換
- **fnRound0**: 小数点以下 0 桁に丸める
- **fnRound1**: 小数点以下 1 桁に丸める
- **fnRound2**: 小数点以下 2 桁に丸める
- **fnRound**: 小数点以下 2 桁に丸める

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
