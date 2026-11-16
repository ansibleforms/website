---
layout: default
title: バックアップと保持期間
parent: 環境変数
nav_order: 3
translated_from: ce6a769abd4e2fa8cb270d1280019cb15953de25
---

# バックアップと保持期間
{: .no_toc }

バックアップのコマンドと、バックアップ、ジョブ、監査レコードの保持期間
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

データベースに残す履歴の量と、ディスクに残すバックアップの数を制御するには、これらを変更します。

---

## 例

終了したジョブを 90 日間、監査証跡を 2 年間保持します。compose プロジェクトの `.env` では次のようにします。

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

毎日のタスクが、午前 2 時 30 分にこれより古い終了済みのジョブを、午前 3 時 30 分に監査エントリを削除します。実行中のジョブや
承認待ちのジョブは削除されません。7.7.0 からは `STORED_JOB_UNUSED_DAYS` も、午前 4 時に、その日数のあいだジョブが起動されなかった [保存済みジョブ](../jobs/stored-jobs.html#when-it-is-removed) を削除します。これらの変数は、設定ページで変更すると再起動なしで反映されます。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="retention" %}
