---
layout: default
title: Telegram
parent: 通知通道
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

在 Telegram 聊天中发言的机器人
{: .fs-6 .fw-300 }

Telegram 通道是一个在聊天中发言的机器人。其 **凭据** 步骤保存 **机器人令牌**，**机器人** 步骤保存其余内容：

| 字段 | 含义 |
|---|---|
| 机器人令牌 | [连接 > 凭据](../credentials.html) 中的一个 **api** 凭据，其密码是从 BotFather 获得的机器人令牌。 |
| 聊天 ID | 机器人发言的聊天、群组或频道；群组或频道为负数。 |
| Bot API 地址 | 自建的 Bot API 服务器；留空则为 `api.telegram.org`。 |
