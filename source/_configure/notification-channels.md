---
layout: default
title: Notification channels
nav_order: 9
has_children: true
has_toc: false
permalink: /notification-channels.html
---

# Notification channels
{: .no_toc }

Send approval requests and job notifications by mail, to Slack, Microsoft Teams, Telegram or any webhook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: add the mail servers and chat channels that forms send their notifications and approvals to.

---

## In this section

| Page | What it covers |
|---|---|
| [Mail](notification-channels/mail.html) | SMTP servers, the default one, and their login |
| [Slack and Microsoft Teams](notification-channels/slack-and-teams.html) | A channel webhook of Slack or Teams |
| [Telegram](notification-channels/telegram.html) | A bot posting in a Telegram chat |
| [Webhook](notification-channels/webhook.html) | A JSON request to any HTTP endpoint |
| [Using channels in a form](notification-channels/in-a-form.html) | Naming channels in notifications and approvals |
| [Testing a channel](notification-channels/testing.html) | Send test, and what it proves |


---

## How it works

A **notification channel** is a place notifications go, added under **Connections > Notifications**. Each channel has
one of these types:

| Type | What it sends |
|---|---|
| Mail | Mail through an SMTP server: approval requests and job notifications. |
| Slack | A message in a Slack channel, through its incoming webhook, with a button to the job. |
| Microsoft Teams | A card in a Teams channel, through a Workflows webhook, with a button to the job. |
| Telegram | A message from a bot in a Telegram chat, with a link to the job. |
| Webhook | A JSON request to any HTTP endpoint, built from a template. |

A form names its channels in its [notifications](forms/notifications.html) and its [approval](forms/approval.html),
with `channels:`. A notification that cannot be sent is written to the log; it never fails the job or the approval.

---

## The notifications page

The page under **Connections > Notifications** lists every channel with these columns:

| Column | Meaning |
|---|---|
| Enabled | Whether notifications are sent to it, see [Using channels in a form](notification-channels/in-a-form.html). |
| Name | How forms refer to it in `channels:`. |
| Type | Mail, Slack, Microsoft Teams, Telegram or Webhook. The default mail channel shows a **Default** pill after its type. |
| Description | What the channel is for. |

**Add notification channel** opens a dialog: **Channel** (name and description), **Type**, then the steps of the type
chosen. The type is set when the channel is made and stays. A row opens the channel's own page, with the same steps as
tabs after **Details**, and **Send test**, **Delete** and **Save** top right. The row menu offers
**Edit**, **Enable** or **Disable** (whichever applies), **Make default** (mail), **Send test** and **Delete**.

The **Details** tab of a channel's page holds the **Enabled** switch, which is saved at once, and for mail the **Default**
switch, which is saved with **Save**.

A user who opens these pages with `showConnectionsSettings` but without the admin role cannot choose a credential that only
an admin may name, see [Who may change a credential](credentials.html#who-may-change-a-credential). When such a user changes
where a channel sends (a webhook's url or its certificate check, a Telegram Bot API address), the channel loses the
credential it named, unless they choose one in the same change.

A channel declared in the [config seed](seed/) is read only on this page, and can still be tested.

