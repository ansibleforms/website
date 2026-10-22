---
layout: default
title: ログ
parent: 環境変数
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# ログ
{: .no_toc }

ログレベル、ファイル、syslog、コンソールの色
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

ログに記録する量やログファイルの保存先を調整したり、タイムスタンプを独自のタイムゾーンで表示したりするには、これらを変更します。

---

## 例

コンソールよりファイルに多くのログを記録し、ログとジョブのタイムスタンプをアムステルダム時間で表示します。
compose プロジェクトの `.env` では次のようにします。

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Syslog サーバーはここでは設定しなくなりました。 **設定 > 接続 > Syslog** で追加してください。 [ログ](../production/logs.html#syslog) を参照してください。
下の `LOG_SYSLOG_*` 変数はバージョン 7 から非推奨です。 `LOG_SYSLOG_HOST` が設定されていることを検出した最初の起動で、それらは一度だけ
サーバーログを受け取る syslog サーバー `syslog` としてインポートされ、以降は無視されます。

---

## 変数

このグループのすべての変数と、その型、既定値、説明：

{% include env_vars_table.html group="logging" %}
