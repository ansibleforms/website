---
layout: default
title: Slack と Microsoft Teams
parent: 通知チャネル
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack と Microsoft Teams
{: .no_toc }

Slack または Teams のチャネルの Webhook
{: .fs-6 .fw-300 }

Slack と Teams のチャネルに必要なのは、チャネルの Webhook のアドレスだけです。

| 種類 | Webhook アドレス |
|---|---|
| Slack | チャネルの受信 Webhook（Slack app > Incoming Webhooks）。 |
| Microsoft Teams | チャネルの Workflows の Webhook（「Webhook 要求を受信したらチャネルに投稿する」）。 |

このアドレスは、誰でもチャネルに投稿できるようにするシークレットです。暗号化して保存され、一度保存すると二度と表示されません。
