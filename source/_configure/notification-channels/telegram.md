---
layout: default
title: Telegram
parent: Notification channels
nav_order: 3
---

# Telegram
{: .no_toc }

A bot posting in a Telegram chat
{: .fs-6 .fw-300 }

A Telegram channel is a bot posting in a chat, set in its **Bot** step:

| Field | Meaning |
|---|---|
| Bot token | An **api** credential of [Connections > Credentials](../credentials.html) whose password is the bot token from BotFather. |
| Chat id | The chat, group or channel the bot posts in; a negative number for a group or a channel. |
| Bot API address | A Bot API server of your own; empty for `api.telegram.org`. |
