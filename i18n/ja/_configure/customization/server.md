---
layout: default
title: サーバーとデータベース
parent: 環境変数
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# サーバーとデータベース
{: .no_toc }

Web サーバー、MySQL の接続、管理者アカウント、各プロセスが実行するもの（AF_ROLE と RTE_* 変数）
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

アプリケーションをリバースプロキシの背後で、別のポートで、または compose プロジェクト外のデータベースに対して実行する場合は、これらを変更します。

---

## 例

TLS を終端するリバースプロキシの背後で、 `/ansibleforms` の下に置き、外部の MySQL を使います。 `docker-compose.yml` では次のようにします。

```yaml
    environment:
      - BASE_URL=/ansibleforms        # the proxy forwards /ansibleforms/ unchanged
      - HTTPS=0                       # the proxy terminates TLS
      - PORT=8000
      - DB_HOST=mysql.example.com
      - DB_PORT=3306
      - DB_USER=ansibleforms
      - DB_PASSWORD=change-me
```

これらは、compose ファイルのその場所にすでにある `DB_*` と `PORT` の行を置き換えます。それらの行は `.env` の同じ名前より優先されます。
`mysqldb` サービスと、それを待つ `depends_on` を削除し、 `ports` でポート 8000 をマッピングしてください。プロキシ側の設定は
[リバースプロキシ](../production/reverse-proxy.html) のページで説明しています。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="server" %}
