---
layout: default
title: 通知チャネル
nav_order: 10
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1756db6ff7b9197f88b34a0c089953a68493e008
---

# 通知チャネル
{: .no_toc }

承認依頼とジョブの通知を、メール、Slack、Microsoft Teams、Telegram、または任意の Webhook に送ります
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

管理者向けです。フォームが通知と承認を送るメールサーバーとチャットのチャネルを追加します。

---

## このセクションの内容

| ページ | 内容 |
|---|---|
| [メール](notification-channels/mail.html) | SMTP サーバー、既定のサーバー、そのログイン |
| [Slack と Microsoft Teams](notification-channels/slack-and-teams.html) | Slack または Teams のチャネルの Webhook |
| [Telegram](notification-channels/telegram.html) | Telegram のチャットに投稿するボット |
| [Webhook](notification-channels/webhook.html) | 任意の HTTP エンドポイントへの JSON リクエスト |
| [フォームでのチャネルの使用](notification-channels/in-a-form.html) | 通知と承認でのチャネルの指定 |
| [チャネルのテスト](notification-channels/testing.html) | テスト送信と、それで確認できること |


---

## 仕組み

**通知チャネル** は通知の送り先で、 **接続 > 通知** で追加します。各チャネルは次のいずれかの
種類を持ちます。

| 種類 | 送るもの |
|---|---|
| メール | SMTP サーバー経由のメール。承認依頼とジョブの通知。 |
| Slack | 受信 Webhook を経由した Slack チャネルへのメッセージ。ジョブへのボタン付き。 |
| Microsoft Teams | Workflows の Webhook を経由した Teams チャネルへのカード。ジョブへのボタン付き。 |
| Telegram | Telegram のチャットへのボットからのメッセージ。ジョブへのリンク付き。 |
| Webhook | テンプレートから組み立てた、任意の HTTP エンドポイントへの JSON リクエスト。 |

フォームは、その [通知](forms/notifications.html) と [承認](forms/approval.html) で、
`channels:` を使ってチャネルを指定します。送信できなかった通知はログに書き込まれ、ジョブや承認が失敗することはありません。

---

## 通知ページ

**接続 > 通知** のページには、すべてのチャネルが次の列とともに表示されます。

| 列 | 意味 |
|---|---|
| 有効 | 通知を送信するかどうか。 [フォームでのチャネルの使用](notification-channels/in-a-form.html) を参照。 |
| 名前 | フォームが `channels:` で参照する名前。 |
| 種類 | メール、Slack、Microsoft Teams、Telegram、Webhook のいずれか。既定のメールチャネルでは、種類の後に **既定** のピルが表示されます。 |
| 説明 | チャネルの用途。 |

**通知チャネルを追加** を押すとダイアログが開きます。 **チャネル** （名前と説明）、 **種類** 、そして選んだ種類の
ステップが続きます。種類はチャネルの作成時に設定され、変更できません。行をクリックするとチャネルのページが開き、 **詳細** の後に
同じステップがタブとして並び、右上に **テスト送信** 、 **削除** 、 **保存** があります。行メニューには
**編集** 、 **有効にする** または **無効にする** （状態に応じて）、 **既定にする** （メール）、 **テスト送信** 、 **削除** があります。

チャネルのページの **詳細** タブには、すぐに保存される **有効** スイッチがあり、メールの場合は **保存** で保存される
**既定** スイッチもあります。

`showConnectionsSettings` を持ち、管理者ロールを持たないユーザーがこれらのページを開いた場合、管理者だけが指定できる
認証情報は選べません。 [認証情報を変更できるユーザー](credentials.html#who-may-change-a-credential) を参照してください。このようなユーザーが
チャネルの送信先（Webhook の URL やその証明書の検証、Telegram の Bot API アドレス）を変更すると、同じ変更で認証情報を選ばない限り、
チャネルは指定していた認証情報を失います。

[構成シード](seed/) で宣言されたチャネルは、このページでは読み取り専用ですが、テストはできます。

