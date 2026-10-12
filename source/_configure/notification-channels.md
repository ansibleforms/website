---
layout: default
title: Notification channels
nav_order: 4.6
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
| Enabled | Whether notifications are sent to it. A channel that is turned off is skipped. |
| Name | How forms refer to it in `channels:`. |
| Type | Mail, Slack, Microsoft Teams, Telegram or Webhook. |
| Address | Where it sends: the mail server, the incoming webhook, the chat or the url. |
| Default | For mail: the server the app sends its mail with. |

**Add notification channel** opens a dialog: **Channel** (name and description), **Type**, then the steps of the type
chosen. The type is set when the channel is made and stays. A row opens the channel's own page, with the same steps as
tabs after **Details**, and **Send test**, **Delete** and **Save** top right. The row menu offers
**Edit notification channel**, **Enable** or **Disable**, **Make default** (mail), **Send test** and
**Delete notification channel**.

A channel declared in the [config seed](seed/) is read only on this page, and can still be tested.

---

## Mail

A mail channel is an SMTP server. You can keep several; the one marked **Default** is the server the app sends its
mail with when a form names no mail channel. The first mail channel becomes the default, and **Make default** moves it.

| Step | Field | Meaning |
|---|---|---|
| Connection | Mail server | Host name or IP address of the SMTP server. |
| Connection | Mail port | 587 by default; 25 is unencrypted, 465 is SSL. |
| Connection | Use TLS | Encrypt the connection (STARTTLS). On by default. |
| Sender | Mail from | The sender address recipients see. |
| Sender | Credential | An **smtp** credential of [Connections > Credentials](credentials.html) with the login. Empty for a relay without a login. |

The mail settings of the config seed are used while no mail channel is the default.

---

## Slack and Microsoft Teams

Slack and Teams channels need only the address of the channel's webhook:

| Type | Webhook address |
|---|---|
| Slack | The channel's incoming webhook (Slack app > Incoming Webhooks). |
| Microsoft Teams | The channel's Workflows webhook ("post to a channel when a webhook request is received"). |

The address is the secret that lets anyone post to the channel: it is stored encrypted and never shown again once saved.

---

## Telegram

A Telegram channel is a bot posting in a chat, set in its **Bot** step:

| Field | Meaning |
|---|---|
| Bot token | An **api** credential of [Connections > Credentials](credentials.html) whose password is the bot token from BotFather. |
| Chat id | The chat, group or channel the bot posts in; a negative number for a group or a channel. |
| Bot API address | A Bot API server of your own; empty for `api.telegram.org`. |

---

## Webhook

A webhook channel sends a JSON request to any HTTP endpoint. Its **Endpoint** step says where and how:

| Field | Meaning |
|---|---|
| Url | The address the request is sent to. |
| Method | `POST` (default) or `PUT`. |
| Bearer token | An **api** credential of [Connections > Credentials](credentials.html) whose password is sent as `Authorization: Bearer <password>`. Empty: no token. |
| Check the TLS certificate | On by default; turn it off only for an endpoint with a self-signed certificate. |

{% raw %}
Its **Payload** step holds **Headers**, extra headers as a JSON object such as `{ "X-Source": "ansibleforms" }`, and the
**Payload**, the JSON template of the body. These placeholders are filled in:

| Placeholder | Value |
|---|---|
| `{{title}}` | The notification's title |
| `{{text}}` | Its text |
| `{{status}}` | The job status |
| `{{event}}` | The job event |
| `{{jobId}}` | The job id |
| `{{form}}` | The form name |
| `{{user}}` | The user who started the job |
| `{{link}}` | The link to the job |

A placeholder that is a whole JSON string (`"{{text}}"`) is replaced by the value as JSON; inside a longer string, its
text is escaped for JSON. An unknown placeholder is left as written. An empty payload sends this template:

```json
{
  "title": "{{title}}",
  "text": "{{text}}",
  "status": "{{status}}",
  "event": "{{event}}",
  "job": { "id": "{{jobId}}", "form": "{{form}}", "user": "{{user}}" },
  "link": "{{link}}"
}
```
{% endraw %}

---

## Using channels in a form

Forms name channels by their name, in `notifications` for job status and job events, and in `approval`:

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-slack
    - ops-teams
  onStatus:
    - failed

approval:
  title: Remove host $(vm.name) ?
  roles:
    - approvers
  channels:
    - approvers-teams
```

- The chat and webhook channels get a short message (the form, the job, what happened) with a link to the job; for an
  approval, the job's page is where it is approved or rejected.
- A **mail** channel in the list sends the usual mail to `recipients` (an approval's `notifications` addresses) through
  that server instead of the default one.
- A name that does not exist, or a channel that is turned off, is skipped and said in the log.

---

## Testing a channel

**Send test** sends a test notification through the channel as saved, so save your changes first. For a mail channel
the dialog asks for the address to send to; the others post to their own channel. The dialog shows whether it worked,
and the reason when it did not.
