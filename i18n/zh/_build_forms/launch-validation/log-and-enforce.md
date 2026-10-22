---
layout: default
title: 记录与强制
parent: 运行验证
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# 记录与强制
{: .no_toc }

每种模式如何处理违反规则的运行
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## `log` 的作用

每次运行都会被检查，但对用户来说没有任何变化。在以下情况下会向日志写入警告：

- 该运行**本应被拒绝**时，附带原因（只有字段名和规则类型，从不包含
  值）：

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- 客户端发送的 extravars 与服务器构建的**不同**时，附带
  不同的顶层键：

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

先在真实实例上运行一段时间的 `log` 。它会在影响任何人之前，显示哪些表单会被拒绝，
以及哪些表单在服务器上计算出的值不同。

---

## `enforce` 的作用

在 `enforce` 模式下，无效的运行会被拒绝，有效的运行则使用服务器
构建的 extravars。

### 违反规则的运行会被拒绝

`POST /api/v2/job` 返回 `422` 以及失败的字段：

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing` ：没有值的必填字段；
- `invalid` ：违反规则的字段、不属于可选项的选择，以及包含失败行的
  list 字段；
- `waiting` ：无法求值的字段（它们所需的某个字段始终没有得到值）；
- `validationErrors` ：按字段列出每条失败的规则，以及浏览器显示的消息；
- `rowErrors` ：按 list 字段列出失败的行（参见[列表行](list-rows-and-subforms.html)）；
- `uploads` ：无法核实其上传的文件字段。

**没有 `rawFormData`** 的运行同样会被拒绝：它的值无法检查。

### 有效的运行使用服务器的 extravars

作业不会使用客户端发送的 extravars。服务器根据经过检查的
值，使用与浏览器相同的代码构建 extravars，并使用这些 extravars 运行。如果调用方发送了有效的
`rawFormData` ，同时附带不一样的 `extravars` ，得到的是与这些值相符的 extravars，而不是
它发送的那些。

服务器会保留请求中的 `__verbose__` （仅限允许使用详细模式的用户）。
保留键（ `__playbook__` 、 `__inventory__` ……）照常来自表单，
`ansibleforms_user` 则是运行该作业的用户。

### 用户看到的并不总是实际运行的

构建 extravars 意味着再次对表单求值：每个表达式和查询都会在服务器上
再运行一次，比浏览器运行时晚一会儿，并以运行作业的用户身份执行。依赖于求值**时间**或**位置**的值
可能会不同，这种情况下使用
服务器的值：

| 内容 | 为什么可能不同 | 影响程度 |
|---|---|---|
| `fn.fnTime()` 、时间戳、基于时间生成的名称 | 再次求值，晚了几秒 | 只在跨秒或跨日期时才有影响。在浏览器流程中 `fnTime` 本来就在服务器上运行，使用相同的时区（容器的 `TZ` ） |
| 查询、 `fnRestAdvanced` 、 `fnSsh` 、 `fnDnsResolve` 、文件读取 | 期间外部数据发生了变化 | 只在数据变化时 |
| 使用 `new Date()` 、 `toLocaleString` 、 `Intl` 的 `runLocal` 表达式 | 浏览器使用用户的时区和语言区域，服务器使用自己的 | 仅限这类表达式 |

**验证**也是如此：读取这类字段的规则（针对查询结果的 `notIn` ，
针对计算标志的 `validIf` ）会根据服务器的值进行检查。extravars
不同的表单会出现在上面介绍的 `log` 警告中；在启用强制之前请先审查它们。
