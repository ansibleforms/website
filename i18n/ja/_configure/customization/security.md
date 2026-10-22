---
layout: default
title: セキュリティの変数
parent: 環境変数
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# セキュリティの変数
{: .no_toc }

トークン、暗号化、外部への REST ホスト、マスキング、古い VAULT_* 設定
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

独自のトークンと暗号化のシークレットを設定し、フォームが呼び出せるものと表示できるものを制限するには、これらを変更します。

---

## 例

独自のシークレットを使い、REST の呼び出しを一つの API と内部ネットワークに制限し、マスクするキーを一つ追加します。compose プロジェクトの `.env` では次のようにします。

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

`ENCRYPTION_SECRET` は、最初の認証情報を保存する前に設定してください。7.3.0 からは、設定または変更すると、次回の起動時に保存されている
すべてのシークレットが再暗号化されます。古いキーが独自のものだった場合は `ENCRYPTION_SECRET_PREVIOUS` でそれを指定します。
[暗号化シークレットの変更](../security/secrets.html#changing-the-encryption-secret) を参照してください。

---

## REST の呼び出しと jq

7.3.0 からは、REST のヘルパー関数（ `fn.fnRestBasic` 、 `fn.fnRestAdvanced` 、 `fn.fnRestJwt` 、 `fn.fnRestJwtSecure` ）は、ほかのすべての接続と同じく、
呼び出すエンドポイントの証明書を検証します。7.2.0 までは検証していませんでした。これらには三つの設定が適用されます。

| 変数 | 既定値 | 効果 |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` にすると証明書の検証を省略します。自己署名証明書を持つエンドポイント専用です |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | REST の呼び出しがタイムアウトで失敗するまでに応答を待つ時間 |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | jq フィルターが停止されるまでに実行できる時間。jq の出力も 64 MB に制限されます |

三つとも、保存すると再起動なしで反映されます。プライベート CA が署名した証明書を持つエンドポイントでは、検証はオンのままにして、
代わりにその CA を Node.js に渡してください。アプリの環境で `NODE_EXTRA_CA_CERTS` にその CA を含む PEM ファイルを設定し、アプリを再起動します。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="security" %}
