---
layout: default
title: HashiCorp Vault
parent: シークレットストア
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

HashiCorp Vault の KV v1、v2、または動的シークレットエンジンから認証情報を読み込みます
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## ストアのフィールド

[すべてのストアにあるフィールド](./#adding-a-store) に加えて、HashiCorp Vault ストアには次のフィールドがあります。

| フィールド | 意味 |
|---|---|
| 認証情報 | [接続 > 認証情報](../credentials.html) の **HashiCorp Vault** 認証情報。Vault のアドレス、その TLS の設定、そして認証情報が使うパスへの読み取りアクセスを持つトークンをパスワードとして保持します。 **認証情報を追加** でその種類の認証情報を作成できます。AnsibleForms はトークンを更新しません。 |
| ネームスペース | Vault Enterprise のネームスペース。 `X-Vault-Namespace` として送られます。 **種類** ステップで **Vault Enterprise** をオンにすると表示されます。 |
| KV バージョン | `2` （既定）または `1` 。 |
| 既定のマウント | スラッシュのない参照に使われます。たとえば `myapp` は `secret/data/myapp` になります。 |

シークレットの参照はパスで、たとえば `secret/myapp/prod` です。KV v2 では、 `/data/` の部分を省くと
自動的に挿入されます。

---

## 動的なデータベースの認証情報

`database/creds/readonly` のような `<mount>/creds/<role>` 形式の参照は、Vault のデータベースエンジンなどの
動的シークレットエンジンから読み込みます。その場合、Vault は読み込みのたびに、リースの期間有効な新しいデータベース
アカウントを作成します。

- アカウントは、キャッシュ時間ではなくリースの 80% の間再利用されます。キャッシュが `0` の場合は、クエリのたびに新しいものを読み込みます。
- Vault が返すのはユーザーとパスワードだけです。接続のそれ以外の情報は認証情報の行に入れてください。
- リースが早期に失効されることはありません。アカウントは、Vault がリースを終了したときに期限切れになります。
