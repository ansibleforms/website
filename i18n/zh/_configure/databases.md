---
layout: default
title: 数据库
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# 数据库
{: .no_toc }

表单查询的数据库，每个数据库都通过一个数据库凭据连接
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：为表单查询的数据库命名，选择每个数据库用于连接的凭据，并测试它们。

---

## 本节内容

| 页面 | 内容 |
|---|---|
| [数据库页面](databases/list.html) | 数据库列表、其各列，以及添加数据库的对话框 |
| [单个数据库的页面](databases/database-page.html) | 数据库的各个选项卡、查询它的表单、测试连接和删除 |
| [表单中的数据库](databases/in-forms.html) | 字段的 `dbConfig` 如何指定数据库，以及 7.5.0 之前编写的表单 |

---

## 工作原理

从 7.5.0 起，**数据库** 是一个独立的连接，在 **连接 > 数据库** 下添加，位于 **密钥库** 和 **运行器** 之间。
它包含三项：

| 字段 | 含义 |
|---|---|
| 名称 | 字段的 `dbConfig` 用来查询它的名称，例如 `cmdb` |
| 描述 | 它的用途 |
| 凭据 | 它用于连接的 [连接 > 凭据](credentials.html) 中类型为 **数据库** 的凭据 |

与连接有关的一切仍和以前一样保存在凭据中：数据库类型（MySQL、MSSQL、PostgreSQL、Oracle 或 MongoDB）、
主机和端口、数据库名称、TLS，以及用户和密码，它们以加密形式保存，或从 [密钥库](secret-stores/) 读取。
数据库本身不保存地址，也不保存密钥，因此数据库和运行器以同样的方式选择凭据。

字段通过在 `dbConfig` 中指定数据库来查询它：

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

不是数据库的名称会像 7.5.0 之前一样，作为类型为数据库的凭据来查找，因此旧表单无需修改即可继续
工作（参见 [表单中的数据库](databases/in-forms.html)）。

---

## 升级到 7.5.0

升级会一次性填充 **连接 > 数据库**，因此现有表单无需修改即可继续工作。

它为每个类型为数据库的凭据创建一个数据库，使用该凭据的名称和描述，并通过该凭据连接。`dbConfig` 中指定该凭据的
表单现在会找到同名的数据库，而该数据库通过同一个凭据连接：结果相同。凭据保留其所有字段。

升级只运行一次：之后删除的数据库不会再次创建，之后添加的数据库凭据在你自己添加数据库之前
没有对应的数据库。

---

## 正在使用的凭据

数据库用于连接的凭据处于使用中，就像运行器用于登录的凭据一样。

只要有数据库引用它，就不能删除或重命名，其页面的 **使用者** 选项卡会列出这些数据库（参见
[正在使用的凭据](credentials.html#credentials-in-use)）。删除数据库时，其凭据保持不变。

---

## 谁可以管理数据库

数据库遵循其所引用凭据的角色选项。

列表、数据库的页面及其 API 需要 `showSettings` 或 `showConnectionsSettings` 角色选项，与凭据相同。
只有管理员才能让数据库使用只有管理员可以引用的凭据连接，例如从密钥库读取密码的凭据（参见
[谁可以修改凭据](credentials.html#who-may-change-a-credential)）：查询它的表单会使用该凭据连接，而
**测试连接** 会把它的密钥发送到其服务器。其他用户仍可以使用它已引用的凭据再次保存数据库。

在 [配置种子](seed/) 中声明的数据库在其页面上为只读：请改为在种子文件中修改。

---

## 配置种子

种子在 `databases:` 部分中声明其数据库，位于它们所引用的凭据之后。

每一项有一个 `name`、一个类型为数据库的 `credential`，以及可选的 `description`。凭据可以来自同一种子的
`credentials` 部分，也可以是在应用中创建的凭据：

```yaml
credentials:
  items:
    - name: cmdb-login
      credential_type: database
      db_type: mysql
      host: cmdb.example.com
      port: 3306
      user: svc_forms
      password: ${SEED_CMDB_PW}

databases:
  items:
    - name: cmdb                 # the name a field's dbConfig gives
      description: The CMDB
      credential: cmdb-login     # a credential of type database
```

完整内容参见 [示例](seed/example.html)，种子如何管理其声明的对象参见 [托管对象](seed/managed-objects.html)。

---

## REST API

脚本通过 [REST API](api/) 在 `/api/v2/database` 下管理数据库，所需角色选项与页面相同。

| 调用 | 作用 |
|---|---|
| `GET /api/v2/database` | 列出数据库，每个都带有其凭据的数据库类型、数据库、主机和端口，以及查询它的表单数量（`used_by_count`） |
| `GET /api/v2/database?name=<name>` | 获取该名称的数据库 |
| `GET /api/v2/database/<id>` | 获取一个数据库 |
| `POST /api/v2/database` | 添加数据库：其 `name`、`credential` 以及可选的 `description` |
| `PUT /api/v2/database/<id>` | 修改数据库 |
| `DELETE /api/v2/database/<id>` | 删除数据库；其凭据保留 |
| `POST /api/v2/database/<id>/check` | 使用其凭据测试连接 |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

不存在或类型不是数据库的 `credential` 会以 `400` 被拒绝。每次修改都会写入审计日志。
