---
layout: default
title: 局限
parent: MCP 服务器
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# 局限
{: .no_toc }

在服务器上运行的表达式，以及 MCP 服务器不做的事情
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## runLocal 表达式

`runLocal` 表达式、`local` / `credential` / `html` 字段以及 `evalDefault` 默认值
都在服务器上一个独立的 V8 上下文中求值：没有 `process`、`require`、网络和
定时器，不能把字符串编译为代码，有 2 秒的时间限制，并且只有浏览器提供的那些辅助
函数（`fnArray`、`fnGetNumberedName`、`fnToTable` 等）。

这可以防范有缺陷或失控的表达式。它不是针对恶意代码的沙箱，
也不需要是：代码来自表单定义，从不来自 MCP
调用方，调用方发送的每个值都会作为 JavaScript 字面量代入。

使用浏览器 API（`window`、`document`、`fetch`）的表达式无法在这里运行，
会返回 `status: error`。

服务器端表达式（不带 `runLocal`）与浏览器中一样，遵循相同的
[`EXPRESSION_SANITIZER`](../customization) 规则。

---

## 局限

有些表单和字段目前还不能通过 MCP 服务器使用：

- **向导表单** 目前还不能启动。它们的步骤可以用 `subform` 解析。
- **文件字段** 不能填写；文件字段有值的表单会被拒绝。
- **列表行**（以及带有子表单的 `yaml` 字段，它就是这样的一行）：您发送的每一行，
  除了带有列表 `deleteMarker` 的行，都会通过其子表单解析，以表单的值作为 `__parent__`，
  然后进行验证。这也包括嵌套列表，其中
  `__parent__.__parent__` 指向表单。请发送普通的行，即原始的子表单字段
  值。验证失败的行按列表字段列在 `rowErrors` 中
  （消息中为 `vms[1].disks[0].size (missing)`）。每次调用在所有层级中
  最多接受 500 行。
- 保留为 `__auto__` 的 enum 不会自动填入其第一个选项；调用方必须自行选择。
- 每个 MCP 请求都会在审计日志中创建一条记录（操作“MCP 请求（AI 代理）”）；
  作业本身与其他任何启动一样，记录在该用户名下。
