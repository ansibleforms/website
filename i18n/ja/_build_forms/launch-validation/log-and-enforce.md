---
layout: default
title: log と enforce
parent: 起動時の検証
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# log と enforce
{: .no_toc }

ルールに反する起動を各モードがどう扱うか
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## `log` の動作

すべての起動がチェックされますが、ユーザーにとっては何も変わりません。次の場合に警告がログに書き込まれます。

- 起動が **拒否されるはず** の場合。理由 (フィールド名とルールの種類だけで、値は含まれません) とともに
  記録されます。

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- クライアントが送信した extravars が、サーバーが作成するものと **異なる** 場合。異なる
  最上位のキーとともに記録されます。

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

まず実際のインスタンスでしばらく `log` を実行してください。誰かに影響が出る前に、どのフォームが拒否されるか、
どのフォームがサーバーで異なる値を計算するかがわかります。

---

## `enforce` の動作

`enforce` では、無効な起動は拒否され、有効な起動はサーバーが作成した extravars で
実行されます。

### ルールに反する起動は拒否される

`POST /api/v2/job` は、失敗したフィールドとともに `422` を返します。

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing`: 値のない必須フィールド
- `invalid`: ルールに反するフィールド、選択肢のいずれでもない選択、失敗した行を持つ list
  フィールド
- `waiting`: 評価できなかったフィールド (必要とするフィールドに値が設定されなかった)
- `validationErrors`: フィールドごとの、失敗したすべてのルールと、ブラウザーが表示するメッセージ
- `rowErrors`: list フィールドごとの、失敗した行 ( [リストの行](list-rows-and-subforms.html) を参照)
- `uploads`: アップロードを検証できなかった file フィールド

**`rawFormData` のない** 起動も拒否されます。その値をチェックできないためです。

### 有効な起動はサーバーの extravars で実行される

ジョブは、クライアントが送信した extravars では実行されません。サーバーは、ブラウザーと同じコードを使って、チェック済みの
値から extravars を作成し、それで実行します。有効な `rawFormData` と異なる `extravars` を一緒に送信した呼び出し元は、
送信したものではなく、値に一致する extravars を受け取ります。

リクエストからサーバーが保持するのは `__verbose__` (詳細モードの使用を許可されたユーザーのみ) です。
予約済みのキー ( `__playbook__`、 `__inventory__` など) は、これまでどおりフォームから取得され、
`ansibleforms_user` は起動したユーザーです。

### ユーザーが見たものがそのまま実行されるとは限らない

extravars を作成するということは、フォームを再度評価するということです。すべての式とクエリが、ブラウザーでの実行から少し後に、
起動したユーザーとしてサーバー上でもう一度実行されます。 **いつ** または **どこで** 評価されるかに依存する値は
異なることがあり、その場合はサーバーの値が使われます。

| 対象 | 異なる理由 | 影響の大きさ |
|---|---|---|
| `fn.fnTime()`、タイムスタンプ、時刻から作られた名前 | 数秒後に再度評価される | 秒や日付の境界でのみ問題になります。 `fnTime` はブラウザーでの流れでもすでにサーバーで、同じタイムゾーン (コンテナーの `TZ` ) で実行されています |
| クエリ、 `fnRestAdvanced`、 `fnSsh`、 `fnDnsResolve`、ファイルの読み取り | その間に外部のデータが変わった | 変わった場合のみ |
| `new Date()`、 `toLocaleString`、 `Intl` を使う `runLocal` 式 | ブラウザーはユーザーのタイムゾーンとロケールを、サーバーは自身のものを使う | そのような式のみ |

**検証** にも同じことが当てはまります。そのようなフィールドを読み取るルール (クエリの結果に対する `notIn`、
計算されたフラグに対する `validIf` ) は、サーバーの値に照らしてチェックされます。extravars が異なるフォームは、
上記の `log` の警告に表示されます。強制する前に確認してください。
