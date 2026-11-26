---
layout: default
title: システム処理
parent: 環境変数
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# システム処理
{: .no_toc }

クリーンアップ、夜間バックアップ、ランナーハブのループの実行タイミング
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

[システム処理](../jobs/system-tasks.html) を別の時刻に移したり、ランナーハブのループの実行頻度を変えたりするには、これらを変更します。

---

## 例

午前 1 時にバックアップし、午前 1 時 30 分にジョブを整理し、5 秒ごとにジョブをランナーへ配布します。compose プロジェクトの `.env` では次のようにします。

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

`_CRON` 変数は、サーバーのタイムゾーン（ [`LOG_TZ`](logging.html#env_LOG_TZ) ）での 5 つのフィールド（分、時、日、月、曜日）の cron を取ります。
**ジョブ > システム** にある各処理の **スケジュール** タブがその変数を書き込み、再起動なしで直ちにすべてのノードに適用します。構成シードの
再読み込みには独自の [`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON) があり、構成シードの変数と一緒にあります。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="system-tasks" %}
