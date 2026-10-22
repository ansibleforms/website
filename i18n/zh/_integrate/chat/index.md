---
layout: default
title: 聊天助手
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# 聊天助手
{: .no_toc }

通过对话填写和启动表单
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向开启它的管理员以及与它对话的用户：通过对话填写和启动表单。

每个页面上都有一个聊天按钮，点击后会打开一个
助手，它会找到合适的表单、询问缺少的信息、把表单本身的
选项以按钮形式提供，并显示一份带有 **运行** 按钮的摘要。只有用户点击该按钮时，作业才会启动。

---

## 工作原理

助手通过服务器与 AI 模型通信，服务器使用与浏览器相同的表单引擎来响应模型的请求：

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **模型调用来自服务器**，从不来自浏览器，因此 API 密钥始终留在服务器上
  （参见 [提供方](providers.html)）。
- **模型无法启动任何东西。** 它准备一份一次性摘要；点击运行时会在执行前重新检查它。
- **目标由用户选择。** 选项和必填的名称都来自用户，从不来自模型。
- **输入“是”或“运行”不会有任何作用。** 只有按钮才能启动作业。

---

## 本节内容

每个主题都有单独的页面：

| 页面 | 内容 |
|---|---|
| [开启助手](switching-it-on.html) | 启用助手，并在其中提供表单 |
| [提供方](providers.html) | 助手背后的语言模型，以及代理 |
| [隐私和限制](privacy-and-limits.html) | 哪些内容会离开网络，以及每个用户的限制 |
| [重新运行和审计](relaunching-and-audit.html) | 从聊天中重新运行、审计记录以及局限 |
