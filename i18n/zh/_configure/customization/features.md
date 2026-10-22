---
layout: default
title: 功能
parent: 环境变量
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# 功能
{: .no_toc }

设计器、MCP、聊天、启动验证、作业列表、指标、AWX API 和查询日志
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

修改这些变量，以打开或关闭应用的可选部分。

---

## 示例

为 AI 代理提供 MCP 服务器，并在每次启动时强制执行表单验证规则。在 compose 项目的 `.env` 中：

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` 和 `ENABLE_CHAT` 无需重启即可生效：每次请求时都会读取它们，因此可以在
设置页面上打开它们。其中一个关闭时，其端点（`/api/v2/mcp` 或 `/api/v2/chat`）会返回 `404`。

请先以 `LAUNCH_VALIDATION=log` 运行一段时间：它会记录 `enforce` 将会拒绝的内容，但不会真正拒绝。参见 [MCP](../mcp/)
和 [记录与强制](../launch-validation/log-and-enforce.html)。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="features" %}
