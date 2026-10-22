---
layout: default
title: 占位符
parent: 表达式
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# 占位符
{: .no_toc }

用 `$(...)` 引用其他字段、常量或当前用户
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 什么是占位符

占位符是写成 `$(reference)` 形式的引用。在使用包含它的文本之前，它会被替换成一个值。

占位符可用于字段的 `expression` 、 `query` 和 `default` （通过 `evalDefault` 求值），也可用于其 `label` 、
`help` 和 `placeholder` 。包含占位符的字段依赖于它所引用的字段：它会等到那个字段有了
值才求值，并且每次那个值变化时都会重新求值。级联下拉框就是这样构建的。

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## 占位符可以引用什么

占位符可以引用表单中的某个字段，或者以下每个表单都有的引用之一：

| 引用 | 内容 |
|---|---|
| `$(field)` | 表单中另一个字段的值 |
| `$(name)` ，常量 | `config.yaml` 中的[常量](../config/constants.html)，或表单 `varsFiles` 中的值 |
| `$(__user__)` | 已登录用户： `username` 、 `type` 、 `groups` 、 `roles` |
| `$(__parent__.field)` | 在[子表单](../forms/subform.html)中（列表行、向导步骤），父表单的某个值 |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## 深入读取值的一部分

只要路径中只包含字母、数字、 `_` 、 `-` 、 `.` 和 `[n]` ，就可以用点号和下标表示法读取值的一部分：

| 占位符 | 用于 | 得到 |
|---|---|---|
| `$(field)` | 文本、数字或密码字段 | 该值 |
| `$(field)` | 记录型 enum | 所选记录的 `placeholderColumn` ，否则为其第一列 |
| `$(field.col)` | 记录型 enum | 所选记录的该列 |
| `$(field)` | 带 `multiple: true` 的 enum | 每条所选记录的选定列，以数组形式给出 |
| `$(field)` | 表达式、列表或常量 | 整个值（列表给出其所有行） |
| `$(field.a.b)` 、 `$(f[0].x)` | 表达式、列表或常量 | 对象或数组的那一部分 |

在 enum 上设置 `placeholderColumn: "*"` ，会让 `$(field)` 给出整条所选记录，而不是某一列。

```yaml
- name: city
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select id, name from cmdb.city
  valueColumn: name
  placeholderColumn: id        # $(city) gives the id; $(city.name) still gives the name
- name: servers
  type: expression
  expression: "[{name: 'web1'}, {name: 'web2'}]"
  runLocal: true
- name: first_server
  type: expression
  expression: $(servers[0].name)   # 'web1'
  runLocal: true
```

---

## 值如何写入

值如何写入文本，取决于占位符所在的位置。

| 位置 | 示例 | 变为 |
|---|---|---|
| 表达式中，引号之外 | `$(count) + 1` | JavaScript 字面量：数字仍是数字，文本变成带引号的字符串，对象或数组变成字面量 |
| 表达式中，构成整个带引号的字符串 | `fn.fnLs('$(dir)')` | 同样的字面量，连同引号一起，因此值中含有引号也无法逃逸 |
| 表达式中，位于更长的字符串内 | `'$(dir)/vars'` | 文本，并按该字符串进行转义 |
| 查询、标签、帮助文本 | `where city='$(city)'` | 文本 |

如果字段中的占位符尚未全部解析，该字段不会被求值；设置 `ignoreIncomplete: true` 后，缺失的值会
以 `undefined` 写入。

### 值中的反引号和 `${`

从 7.3.0 起，服务器把字段值写入表达式时（远程表达式、运行
验证、MCP 和聊天），该值不能作为代码执行。值中的反引号或 `${` 会写成 unicode 转义（ `\u0060` 、 `\u0024{` ），因此即使在模板字符串中也仍然是
文本。服务器端表达式完全拒绝模板字符串；需要时请使用 `runLocal` 。

在浏览器中求值的 `runLocal` 表达式按上表写入值，不做这种转义，所以在那里不要把
占位符放进模板字符串中。

---

## 另请参阅

相关页面和常见问题条目：

- [本地表达式](local.html)和[远程表达式](remote.html)：大多数占位符的使用场景
- [常见问题：级联下拉框](../faq.html#cascaded-dropdowns)和[字段占位符](../faq.html#field-placeholders)：更多示例
- [常见问题：如何在子表单中访问父表单的数据？](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)
