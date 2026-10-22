---
layout: default
title: パス
parent: 環境変数
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# パス
{: .no_toc }

設定、フォーム、プレイブック、アップロード、バックアップの保存場所
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

データの一部を別のボリュームに置くには、これらを変更します。たとえば、バックアップとアップロードを大容量または安価なストレージに置く場合です。

---

## 例

バックアップとアップロードしたファイルを別のボリュームに置き、残りのデータは通常の永続フォルダーに置きます。 `docker-compose.yml` では次のようにします。

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

新しいパスは新しいファイルにだけ適用されます。古いフォルダーにすでにあるものは移動されないので、自分でコピーしてください。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="paths" %}
