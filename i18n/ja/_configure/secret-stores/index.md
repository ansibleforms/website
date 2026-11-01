---
layout: default
title: シークレットストア
nav_order: 14
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: c7e5d9fb5e640896bd51e3fa20d76be092857ce2
---

# シークレットストア
{: .no_toc }

認証情報を AnsibleForms に保存する代わりに、シークレットマネージャーから読み込みます
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

管理者向けです。シークレットマネージャーに接続し、認証情報がユーザーとパスワードをそこから読み込めるようにします。

---

## 仕組み

**シークレットストア** はシークレットマネージャーへの接続で、
**接続 > シークレットストア** で追加します。その後、 **認証情報** でストアとその中の場所
（ *シークレットの参照* ）を指定できます。フォーム、プレイブック、式がその認証情報を使うと、次のようになります。

- **ユーザー** と **パスワード** は、毎回（ストアのキャッシュ時間内であればキャッシュから）ストアから読み込まれます。
- **ホスト** 、 **ポート** 、 **データベース** は、認証情報の行のものがそのまま使われます。行でそのいずれかが空で、
  シークレットにその値がある場合は、シークレットの値が使われます。

フォームは引き続き名前で認証情報を参照するので、パスワードをストアに移してもフォームは何も
変わりません。

| ストアの種類 | 状態 |
|---|---|
| HashiCorp Vault（KV v1 と v2、トークン認証） | 利用可能 |
| HashiCorp Vault の動的認証情報（ `<mount>/creds/<role>` ） | 試験的 |
| CyberArk Central Credential Provider（CCP） | 試験的 |

---

## ストアの追加

7.3.0 からは、ストアのトークンやキーがそのアドレスに送られるため、ストアの追加、変更、削除は管理者だけが行えます。すべてのストアには次のフィールドがあります。

| フィールド | 意味 |
|---|---|
| 名前 | 認証情報がストアを参照する名前。 |
| 種類 | シークレットマネージャー。 |
| 認証情報 | ストアがどのように、どこにログインするか。 **認証情報** ステップで指定する、 [接続 > 認証情報](../credentials.html) の種類 **HashiCorp Vault** （トークンとアドレス）または **CyberArk** の認証情報です。ベース URL（例： `https://vault.example.com:8200` ）と TLS の設定（証明書の検証のスキップ、またはプライベート CA 用の PEM の CA バンドル）を保持します。それ自体をシークレットストアから読み込むことはできません。 |
| キャッシュ (秒) | 読み込んだシークレットを再利用する期間。 `0` では使用のたびに読み込みます。既定は 60 です。 |
| 追加オプション (JSON) | 種類に固有のオプション。JSON オブジェクトで指定します。 |

7.2.0 までは、アドレス、トークン、TLS の設定はストアのフィールドでした。7.3.0 へのアップグレードでこれらは
`<store>-token` （CyberArk の場合は `<store>-appid` ）という名前の認証情報に移されます。 [認証情報内のアドレス](../credentials/types.html#addresses-in-credentials) を参照してください。

**接続テスト** は、シークレットを読まずにアクセスを確認します。 **ステータス** ページはすべてのストアを確認し、Vault のトークンが
期限切れになる 7 日前に警告します。

シークレットマネージャーごとに専用のページがあります。

| ページ | 内容 |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | トークン認証による KV v1 と v2、および動的なデータベースの認証情報 |
| [CyberArk](cyberark.html) | CyberArk の Application Access Manager の Central Credential Provider（CCP） |

---

## ストアの使用

### 認証情報で

**接続 > 認証情報** で、認証情報の **保存先** ステップで **シークレットストア** を選び、
**シークレットストア** を選択して **参照** を入力します。すると、ユーザーとパスワードは入力したものではなく、ストアから読み込まれます。

### 認証情報の行を使わずに直接

認証情報の名前を受け付ける場所ならどこでも、代わりにストアを直接参照できます（ `fnCredentials` 、 `fnRestBasic` 、
フォームの `credentials:` 、クエリの `dbConfig` ）。

```javascript
fn.fnCredentials('secret:vault:secret/myapp/prod')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/myapp/prod')          // the store named `vault`
```

```yaml
- name: servers
  type: enum
  query: SELECT name FROM servers
  dbConfig: secret:vault:secret/cmdb/db
```

7.5.0 からは、 `dbConfig` はまず [データベース](../databases.html) を指定します。このような参照はデータベースではないので、これまでどおり
ストアから読み込まれます。データベースも、ストアを使う種類がデータベースの認証情報を通じて、ログインをストアから読み込めます。

認証情報の行がない場合、データベースのシークレットには少なくとも `db_type` とホストが必要です。たとえば次のとおりです。

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

`db_type` がない場合、シークレットは通常の認証情報（ユーザー、パスワード、その他のキー）として扱われ、それに対するクエリは `mysql` を前提とします。

### キーの名前

シークレットは、次の別名で認証情報に対応付けられます。そのほかのキーはそのまま渡されます。

| 認証情報のフィールド | シークレットで受け付けるキー |
|---|---|
| `user` | `user` 、 `username` 、 `login` |
| `password` | `password` 、 `token` 、 `api_key` 、 `apikey` 、 `secret` |
| `host` | `host` 、 `address` |
| `port` | `port` |
| `db_name` | `db_name` 、 `database` |
| `db_type` 、 `secure` | 同じ名前（直接参照するシークレットのみ） |

認証情報の行の場合、シークレットのホスト、ポート、データベース名は、行でそれらが空の場合にだけ
使われます。

構造の異なるシークレットは、 `fnCredentials` の第 3 引数として渡す `jq` 式で
形を変えられます。

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## 構成シードで

ストアは、ほかの管理オブジェクトと同じく、構成シードで宣言することもできます。

```yaml
secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login        # its address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}  # the Vault token
    - name: production-db
      secret_store: vault
      secret_ref: secret/forms/production-db
      host: db.example.com
      port: 3306
      db_type: mysql
      is_database: true
```

ストアはその認証情報でログインします。 `vault` の認証情報は Vault のアドレスを `url` に、トークンをパスワードとして保持し、 `cyberark`
の認証情報は AppID と CCP のアドレスを保持します。認証情報がない場合は、ストア自身の `url` と `token` が使われます。
詳しくは [構成シード](../seed) を参照してください。

---

## VAULT_* 変数からのアップグレード

バージョン 7 より前は、ストアは `VAULT_*` 環境変数で設定する HashiCorp Vault だけで、
認証情報は **Vault パス** でそれを指していました。

- **変数は一度だけ** `vault` という名前のストアとして **インポートされます** 。その後は削除してください。
- **`vault_path` を持つ認証情報** は、そのストアを使うようになりました。 `vault_path` は 8 で削除されます。
