---
layout: default
title: フォームとジョブ
parent: インターフェースの紹介
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# フォームとジョブ
{: .no_toc }

サインイン、ダッシュボード、フォームの入力、そのジョブの追跡
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## ログイン

ユーザー認証のページです。ローカル、LDAP、Entra ID、OIDC の認証に対応しています。

![ログイン](../assets/screenshots/login.jpg)

---

## ダッシュボード

メインのダッシュボードには、利用できるすべてのフォームがカテゴリ別に表示されます。

![ダッシュボード](../assets/screenshots/dashboard.jpg)

---

## フォーム

外部のデータソースと動的なフィールドを持つフォームの例です。

![フォームの例](../assets/screenshots/form.jpg)

---

## フォームの JSON プレビュー

ジョブを実行する前に、JSON のペイロードと Ansible に渡される追加変数をプレビューします。

![フォームの JSON プレビュー](../assets/screenshots/form-json.jpg)

---

## 実行中のジョブ

Ansible プレイブックをリアルタイムで実行し、出力をその場で表示します。

![実行中のジョブ](../assets/screenshots/run.jpg)

---

## ジョブの出力

実行した Ansible プレイブックの出力全体です。

![ジョブの出力](../assets/screenshots/job-output.jpg)

---

## ジョブのログ

すべてのジョブをステータスと時刻とともに表示します。左メニューでステータスごとに絞り込めます。

![ジョブのログ](../assets/screenshots/job-log.jpg)

---

## マルチステップ

マルチステップのジョブで、各ステップの出力がメインのジョブの下に表示されます。マルチステップフォームは 7 以降非推奨です。代わりに
[ワークフロー](../workflows/) でプレイブック、テンプレート、承認をつなげます。

![マルチステップフォーム](../assets/screenshots/multistep.jpg)

---

## スケジュール

フォームを特定の時刻や間隔で実行するようにスケジュールします。 [cron の例](../faq.html#which-cron-expressions-can-i-use) では、よく使う
式と、スケジュールがどのタイムゾーンで実行されるかを説明しています。

![スケジュール](../assets/screenshots/schedules.jpg)
