---
layout: default
title: Slack 和 Microsoft Teams
parent: 通知通道
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack 和 Microsoft Teams
{: .no_toc }

Slack 或 Teams 的频道 webhook
{: .fs-6 .fw-300 }

Slack 和 Teams 通道只需要频道 webhook 的地址：

| 类型 | Webhook 地址 |
|---|---|
| Slack | 频道的传入 webhook（Slack app > Incoming Webhooks）。 |
| Microsoft Teams | 频道的 Workflows webhook（"post to a channel when a webhook request is received"）。 |

该地址就是让任何人都能向频道发帖的密钥：它以加密形式保存，保存后永远不会再显示。
