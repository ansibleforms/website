---
layout: default
title: 表达式
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# 表达式
{: .no_toc }

用 JavaScript 计算字段值，可在浏览器中，也可在服务器上
{: .fs-6 .fw-300 }

---

面向表单作者：用 JavaScript 动态填充字段，可在浏览器中计算，也可在服务器上获取。

表单字段的 `expression` 属性让您可以用 JavaScript 表达式构建动态表单。

---

## 简介

`expression` 属性可用于多种字段类型：
- `enum` 字段：动态填充下拉选项
- `expression` 字段：获取或生成任意形式的数据
- `html` 字段：构建其 HTML 内容
- `yaml` 和 `list` 字段：填充其数据

JavaScript 表达式要么在**服务器端**（默认）求值，要么在**客户端**求值，由字段属性 `runLocal` 决定。
`html` 字段，以及 `local` 、 `local_out` 和 `credential` 字段类型，无论
`runLocal` 如何设置，始终在浏览器中运行其表达式。

- **服务器端**（ `runLocal: false` ，默认值）：预定义函数，从 API、文件和数据库获取数据。
- **客户端**（ `runLocal: true` ）：代码可以在浏览器沙箱中使用完整的 JavaScript 引擎进行计算、转换和处理。

---

## 安全注意事项

由于表达式通过 JavaScript 的 `eval` 函数求值，代码注入是一个潜在风险：

- **服务器端表达式**会先经过清理器：每个调用都必须是 `fn.` 或 `fnc.` 函数，多行代码、
  `;` 、模板字符串、 `process.env` 以及逃出 `eval` 的方式（ `import` 、 `require` 、 `constructor` ……）都会被拒绝。
- **客户端表达式**在浏览器沙箱中求值，可以认为是安全的。

清理器的严格程度取决于
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER)：

| 值 | 服务器端表达式 |
|---|---|
| `strict` （默认） | `fn.` 和 `fnc.` 调用，以及对其结果调用的方法，例如 `fn.fnTime().format('YYYY')` |
| `paranoid` | 只允许直接的 `fn.` 和 `fnc.` 调用，不允许对其结果调用方法 |
| `off` | 拒绝所有服务器端表达式，只有 `runLocal` 表达式可用 |
| `legacy` | 6.2.1 的规则，允许任何已认证用户在服务器上运行代码；仅用于升级过渡，且只能在真实环境中设置（不能在设置页面中设置） |

值为空或无法识别时视为 `strict` 。修改会在下一个表达式生效，无需重启。

---

## 本节内容

每个主题都有单独的页面：

| 页面 | 涵盖内容 |
|---|---|
| [占位符](placeholders.html) | 用 `$(...)` 引用其他字段、常量或用户 |
| [本地表达式](local.html) | 在浏览器沙箱中运行的 JavaScript |
| [远程表达式](remote.html) | 用于日期、网络、文件、SSH 和编号名称的服务器端函数 |
| [REST API](rest-apis.html) | 通过基本认证、令牌或自定义认证调用 REST API |
| [凭据](credentials.html) | 读取已保存的凭据 |
| [排序](sorting.html) | 用排序对象对数组排序 |
| [jq 查询](jq.html) | 用 jq 重新整形数据 |
