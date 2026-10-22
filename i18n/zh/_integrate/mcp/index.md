---
layout: default
title: MCP 服务器
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# MCP 服务器
{: .no_toc }

让 AI 代理通过 Model Context Protocol 使用您的表单
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员和集成人员：让 MCP 客户端以其所持令牌对应的用户身份列出、填写和启动表单。

AnsibleForms 可以提供一个
[Model Context Protocol](https://modelcontextprotocol.io) 服务器，使 MCP 客户端（例如
聊天后端或 IDE 助手）能够列出用户可以使用的表单、确定其字段、
启动作业并跟踪其进度。

---

## 它是什么，不是什么

MCP 服务器是一个技术接口，通向浏览器所用的同一套表单流程。它
**以所收到令牌对应的用户身份** 运行：与浏览器提交相同的表单角色、相同的作业可见性、
相同的保留 extravars 检查。

它没有添加任何自己的 AI 策略。代理在启动前是否必须请求确认、
可以使用哪些表单、可以发出多少请求，都由 MCP 客户端决定。
启动工具被标记为破坏性操作，因此行为规范的客户端会先请求确认，
但服务器并不强制这一点。

---

## 本节内容

每个主题都有单独的页面：

| 页面 | 内容 |
|---|---|
| [设置](setup.html) | 开启服务器并对客户端进行身份验证 |
| [工具](tools.html) | 代理用来填写、批准和重新运行表单的工具 |
| [局限](limitations.html) | 在服务器上运行的表达式，以及 MCP 服务器不做的事情 |
