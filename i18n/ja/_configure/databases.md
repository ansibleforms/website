---
layout: default
title: データベース
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# データベース
{: .no_toc }

フォームが照会するデータベース。それぞれがデータベースの認証情報で接続します
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

管理者向けです。フォームが照会するデータベースに名前を付け、それぞれが接続に使う認証情報を選び、テストします。

---

## このセクションの内容

| ページ | 内容 |
|---|---|
| [データベースページ](databases/list.html) | データベースのリスト、その列、データベースを追加するダイアログ |
| [データベースのページ](databases/database-page.html) | データベースのタブ、それを照会するフォーム、接続テストと削除 |
| [フォームでのデータベース](databases/in-forms.html) | フィールドの `dbConfig` がデータベースを指定する方法と、7.5.0 より前に書かれたフォーム |

---

## 仕組み

7.5.0 からは、 **データベース** は独立した接続で、 **接続 > データベース** の **シークレットストア** と **ランナー** の間で追加します。
データベースは次の三つを持ちます。

| フィールド | 内容 |
|---|---|
| 名前 | フィールドの `dbConfig` がそれを照会するために指定する名前。たとえば `cmdb` |
| 説明 | 用途 |
| 認証情報 | 接続に使う、 [接続 > 認証情報](credentials.html) にある種類が **データベース** の認証情報 |

接続に関するすべては、これまでどおり認証情報が保持します。データベースの種類（MySQL、MSSQL、PostgreSQL、Oracle、MongoDB）、
ホストとポート、データベース名、TLS、ユーザーとパスワードで、これらは暗号化して保存するか、 [シークレットストア](secret-stores/) から読み込みます。
データベース自体はアドレスもシークレットも持たないので、データベースとランナーは同じ方法で認証情報を選びます。

フィールドは、 `dbConfig` でデータベースを指定して照会します。

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

データベースではない名前は、7.5.0 より前と同じく種類がデータベースの認証情報として検索されるので、古いフォームは変更なしで
動作し続けます（ [フォームでのデータベース](databases/in-forms.html) を参照）。

---

## 7.5.0 へのアップグレード

アップグレードは **接続 > データベース** を一度だけ埋めるので、既存のフォームは変更なしで動作し続けます。

種類がデータベースの認証情報ごとに、その認証情報の名前と説明を持ち、その認証情報で接続するデータベースを一つ作ります。
`dbConfig` で認証情報を指定しているフォームは、同じ名前のデータベースを見つけるようになり、そのデータベースは同じ認証情報で
接続します。結果は同じです。認証情報はすべてのフィールドをそのまま保持します。

アップグレードは一度だけ実行されます。その後に削除したデータベースが再び作られることはなく、後から追加したデータベースの認証情報には、
自分で追加するまでデータベースはありません。

---

## 使用中の認証情報

データベースが接続に使う認証情報は、ランナーがサインインに使う認証情報と同じく使用中になります。

データベースがそれを指定している間は、削除も名前の変更もできません。そのページの **使用元** タブにはデータベースが表示されます（
[使用中の認証情報](credentials.html#credentials-in-use) を参照）。データベースを削除しても、その認証情報はそのまま残ります。

---

## データベースを管理できるユーザー

データベースは、指定する認証情報のロールオプションに従います。

リスト、データベースのページ、その API には、認証情報と同じくロールオプション `showSettings` または `showConnectionsSettings` が必要です。
管理者だけが指定できる認証情報（パスワードをシークレットストアから読み込むものなど）でデータベースを接続させられるのは管理者だけです
（ [認証情報を変更できるユーザー](credentials.html#who-may-change-a-credential) を参照）。それを照会するフォームはその認証情報で接続し、
**接続テスト** はそのシークレットをサーバーに送るためです。ほかのユーザーも、すでに指定されている認証情報のままデータベースを保存し直すことはできます。

[構成シード](seed/) で宣言されたデータベースは、そのページでは読み取り専用です。代わりにシードファイルで変更してください。

---

## 構成シード

シードは、 `databases:` セクションでデータベースを宣言します。このセクションは、指定する認証情報の後に適用されます。

各項目には `name` 、種類がデータベースの `credential` 、任意で `description` があります。認証情報は同じシードの
`credentials` セクションのものでも、アプリで作成したものでもかまいません。

```yaml
credentials:
  items:
    - name: cmdb-login
      credential_type: database
      db_type: mysql
      host: cmdb.example.com
      port: 3306
      user: svc_forms
      password: ${SEED_CMDB_PW}

databases:
  items:
    - name: cmdb                 # the name a field's dbConfig gives
      description: The CMDB
      credential: cmdb-login     # a credential of type database
```

完全な [例](seed/example.html) と、シードが宣言したものをどう管理するかについては [管理対象オブジェクト](seed/managed-objects.html) を参照してください。

---

## REST API

スクリプトは、ページと同じロールオプションで、 `/api/v2/database` の下の [REST API](api/) を通じてデータベースを管理します。

| 呼び出し | 動作 |
|---|---|
| `GET /api/v2/database` | データベースを一覧表示します。それぞれに認証情報のデータベースの種類、データベース、ホスト、ポートと、それを照会するフォームの数（ `used_by_count` ）が付きます |
| `GET /api/v2/database?name=<name>` | その名前のデータベースを取得します |
| `GET /api/v2/database/<id>` | 一つのデータベースを取得します |
| `POST /api/v2/database` | データベースを追加します。 `name` 、 `credential` 、任意で `description` |
| `PUT /api/v2/database/<id>` | データベースを変更します |
| `DELETE /api/v2/database/<id>` | データベースを削除します。その認証情報は残ります |
| `POST /api/v2/database/<id>/check` | その認証情報で接続をテストします |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

存在しない `credential` 、または種類がデータベースではない `credential` は `400` で拒否されます。すべての変更は監査ログに記録されます。
