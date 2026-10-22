---
layout: default
title: 通知通道
nav_order: 9
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1488a67f6f281b0236e4bad3a8b3d0c3bb32326c
---

# 通知通道
{: .no_toc }

通过邮件、Slack、Microsoft Teams、Telegram 或任意 webhook 发送审批请求和作业通知
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：添加表单用于发送通知和审批的邮件服务器和聊天通道。

---

## 本节内容

| 页面 | 内容 |
|---|---|
| [邮件](notification-channels/mail.html) | SMTP 服务器、默认服务器及其登录信息 |
| [Slack 和 Microsoft Teams](notification-channels/slack-and-teams.html) | Slack 或 Teams 的频道 webhook |
| [Telegram](notification-channels/telegram.html) | 在 Telegram 聊天中发言的机器人 |
| [Webhook](notification-channels/webhook.html) | 发往任意 HTTP 端点的 JSON 请求 |
| [在表单中使用通道](notification-channels/in-a-form.html) | 在通知和审批中引用通道 |
| [测试通道](notification-channels/testing.html) | 发送测试，以及它能证明什么 |


---

## 工作原理

**通知通道** 是通知的去处，在 **连接 > 通知** 下添加。每个通道都属于
以下类型之一：

| 类型 | 发送的内容 |
|---|---|
| 邮件 | 通过 SMTP 服务器发送的邮件：审批请求和作业通知。 |
| Slack | 通过传入 webhook 发到 Slack 频道的消息，带有跳转到作业的按钮。 |
| Microsoft Teams | 通过 Workflows webhook 发到 Teams 频道的卡片，带有跳转到作业的按钮。 |
| Telegram | 机器人在 Telegram 聊天中发送的消息，带有作业的链接。 |
| Webhook | 根据模板构建、发往任意 HTTP 端点的 JSON 请求。 |

表单在其 [通知](forms/notifications.html) 和 [审批](forms/approval.html) 中
用 `channels:` 引用通道。无法发送的通知会写入日志；它永远不会导致作业或审批失败。

---

## 通知页面

**连接 > 通知** 下的页面列出所有通道，包含以下各列：

| 列 | 含义 |
|---|---|
| 已启用 | 是否向其发送通知，参见 [在表单中使用通道](notification-channels/in-a-form.html)。 |
| 名称 | 表单在 `channels:` 中引用它的名称。 |
| 类型 | 邮件、Slack、Microsoft Teams、Telegram 或 Webhook。默认邮件通道会在类型后显示一个 **默认** 标记。 |
| 描述 | 通道的用途。 |

**添加通知通道** 会打开一个对话框：**通道**（名称和描述）、**类型**，然后是所选类型的
各个步骤。类型在创建通道时设定，之后不可更改。点击某一行会打开通道自己的页面，在 **详情** 之后以选项卡形式显示相同的步骤，
右上角有 **发送测试**、**删除** 和 **保存**。行菜单提供
**编辑**、**启用** 或 **禁用**（视当前状态而定）、**设为默认**（邮件）、**发送测试** 和 **删除**。

通道页面的 **详情** 选项卡中有会立即保存的 **已启用** 开关，邮件通道还有 **默认**
开关，后者通过 **保存** 保存。

拥有 `showConnectionsSettings` 但没有管理员角色的用户打开这些页面时，无法选择只有
管理员才能引用的凭据，参见 [谁可以修改凭据](credentials.html#who-may-change-a-credential)。当这样的用户修改
通道的发送目标（webhook 的 url 或其证书检查、Telegram Bot API 地址）时，通道会失去
它所引用的凭据，除非他们在同一次修改中选择一个凭据。

在 [配置种子](seed/) 中声明的通道在此页面上为只读，但仍然可以测试。

