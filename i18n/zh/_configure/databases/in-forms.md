---
layout: default
title: 表单中的数据库
parent: 数据库
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# 表单中的数据库
{: .no_toc }

字段的 dbConfig 如何指定数据库，以及旧表单如何继续工作
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 指定数据库

带有 `query` 的字段会在其 `dbConfig` 指定的数据库上运行该查询。

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

从 7.5.0 起，名称按以下顺序查找：

| 顺序 | 该名称是 | 查询使用的连接 |
|---|---|---|
| 1 | **连接 > 数据库** 中的数据库 | 该数据库引用的凭据 |
| 2 | 否则为 **连接 > 凭据** 中类型为 **数据库** 的凭据 | 该凭据，与 7.5.0 之前相同 |

数据库类型（MySQL、MSSQL、PostgreSQL、Oracle 或 MongoDB）来自凭据，因此表单从不指定它。没有类型的凭据
按 MySQL 读取。

---

## 7.5.0 之前编写的表单

所有在 `dbConfig` 中指定凭据的表单都无需修改即可继续工作。

[升级到 7.5.0](../databases.html#upgrading-to-750) 会为每个数据库凭据创建一个同名、并通过该凭据连接的数据库，
因此表单给出的名称现在会先找到该数据库，最终使用同一个登录信息。没有同名数据库的、类型为数据库的凭据
仍会在第 2 步中找到。

数据库和凭据可以同名，升级就是这样做的。此时数据库优先：将它指向另一个凭据，所有给出该名称的
表单都会随之改变，这样无需编辑表单就能把它迁移到另一台服务器。

---

## dbConfig 的写法

`dbConfig` 一直接受的三种写法仍然有效，每个名称都按上述方式查找。

| `dbConfig` | 示例 | 作用 |
|---|---|---|
| 一个名称 | `dbConfig: cmdb` | 查询该数据库 |
| 名称列表 | `dbConfig: [cmdb-eu, cmdb-us]` | 在每个数据库上运行查询并合并结果；不会去除重复项 |
| 对象（旧写法） | `dbConfig: { name: cmdb, type: mysql }` | 查询数据库或凭据 `name`；已弃用，请只使用名称 |

[密钥库](../secret-stores/#inline-without-a-credential-row) 引用，例如 `dbConfig: secret:vault:secret/cmdb/db`，既不是
数据库名称也不是凭据名称，仍和以前一样从密钥库读取。

---

## 哪些表单查询某个数据库

应用会读取表单，以确定哪些表单查询每个数据库。

[数据库页面](list.html) 的 **使用者** 列统计它们，[单个数据库的页面](database-page.html#used-by) 的 **使用者** 选项卡
列出它们及其字段。指定该数据库凭据而非数据库本身的字段也会计入。请先修改给出旧名称的表单，再重命名数据库。
