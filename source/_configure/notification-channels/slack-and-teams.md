---
layout: default
title: Slack and Microsoft Teams
parent: Notification channels
nav_order: 2
---

# Slack and Microsoft Teams
{: .no_toc }

A channel webhook of Slack or Teams
{: .fs-6 .fw-300 }

Slack and Teams channels need only the address of the channel's webhook:

| Type | Webhook address |
|---|---|
| Slack | The channel's incoming webhook (Slack app > Incoming Webhooks). |
| Microsoft Teams | The channel's Workflows webhook ("post to a channel when a webhook request is received"). |

The address is the secret that lets anyone post to the channel: it is stored encrypted and never shown again once saved.
