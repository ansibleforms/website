---
layout: default
title: 設定
parent: 環境変数
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
---

# 設定
{: .no_toc }

構成シード、設定の保存場所、git と ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

設定の取得元（構成シード、データベース、git、ytt テンプレート）を決めるには、これらを変更します。

---

## 例

マウントした構成シードを適用して 5 分ごとに確認し、 `config.yaml` をデータベースに保持します。 `docker-compose.yml` では次のようにします。

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

シードが無効な場合、サーバーは起動しません。ファイル形式については [構成シード](../seed/) を参照してください。

---

## config.yaml の読み込み元

カテゴリ、ロール、定数は、ディスク上の `config.yaml` またはデータベース内のそのコピーから取得され、次の順で決まります。

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE) が環境または設定ページの **設定** タブで
   設定されている場合はそれに従います。 `1` はデータベースを、 `0` はファイルを読み込みます。
2. そうでない場合は、データベースに保存されている設定の取得元（ `file` または `database` ）。6.3.0 より前に構築したインスタンスが
   設定ページで選んだものです。
3. そうでない場合はファイルです。 **設定に使用しますか?** が有効なリポジトリの `config.yaml` 、なければ
   **フォームに使用しますか?** が有効なリポジトリのもの、それもなければ [`CONFIG_PATH`](paths.html#env_CONFIG_PATH) にあるものです。

明示的に設定された `ENABLE_CONFIG_IN_DATABASE` は常に優先され、保存されている `database` よりも `0` が優先されます。設定を
読み込むたびに読まれるので、変更は再起動なしで反映されます。 **ステータス** ページの **情報** タブに、使われている取得元が表示されます。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="configuration" %}
