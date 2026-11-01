---
layout: default
title: 密钥库
nav_order: 14
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: c7e5d9fb5e640896bd51e3fa20d76be092857ce2
---

# 密钥库
{: .no_toc }

从密钥管理器读取凭据，而不是将其保存在 AnsibleForms 中
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：连接密钥管理器，并让凭据从中读取其用户和密码。

---

## 工作原理

**密钥库** 是到某个密钥管理器的连接，在
**连接 > 密钥库** 下添加。随后，**凭据** 可以指定一个密钥库及其中的某个位置
（即 *密钥引用*）。当表单、playbook 或表达式使用该凭据时：

- **用户** 和 **密码** 每次都从密钥库读取（在密钥库的缓存时间内复用）；
- **主机**、**端口** 和 **数据库** 仍然使用凭据行中的值。当凭据行中
  其中某项为空而密钥中包含它时，使用密钥中的值。

表单仍按名称引用凭据，因此把密码移入密钥库不会改变
表单中的任何内容。

| 密钥库类型 | 状态 |
|---|---|
| HashiCorp Vault（KV v1 和 v2，令牌认证） | 可用 |
| HashiCorp Vault 动态凭据（`<mount>/creds/<role>`） | 实验性 |
| CyberArk Central Credential Provider（CCP） | 实验性 |

---

## 添加密钥库

从 7.3.0 起，只有管理员才能添加、修改或删除密钥库，因为其令牌或密钥会被发送到其地址。每个密钥库都有以下字段：

| 字段 | 含义 |
|---|---|
| 名称 | 凭据引用该密钥库时使用的名称。 |
| 类型 | 密钥管理器。 |
| 凭据 | 密钥库如何以及在哪里登录：[连接 > 凭据](../credentials.html) 中的一个凭据，在 **凭据** 步骤中选择，类型为 **HashiCorp Vault**（其令牌和地址）或 **CyberArk**。它保存基础 URL，例如 `https://vault.example.com:8200`，以及 TLS 设置：跳过证书验证，或用于私有 CA 的 PEM 格式 CA 证书包。它本身不能从密钥库读取。 |
| 缓存（秒） | 已读取的密钥被复用的时长。`0` 表示每次使用时都读取。默认为 60。 |
| 附加选项（JSON） | 特定于类型的选项，以 JSON 对象形式提供。 |

在 7.2.0 及更早版本中，地址、令牌和 TLS 设置是密钥库的字段。升级到 7.3.0 时会将它们移入其
凭据，名为 `<store>-token`（CyberArk 为 `<store>-appid`），参见 [凭据中的地址](../credentials/types.html#addresses-in-credentials)。

**测试连接** 在不读取密钥的情况下检查访问权限。**状态** 页面会检查每个密钥库，并在 Vault 令牌过期前 7 天
发出警告。

每种密钥管理器都有自己的页面：

| 页面 | 内容 |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | 使用令牌认证的 KV v1 和 v2，以及动态数据库凭据 |
| [CyberArk](cyberark.html) | CyberArk Application Access Manager 的 Central Credential Provider（CCP） |

---

## 使用密钥库

### 在凭据中

在 **连接 > 凭据** 下，在凭据的 **存储** 步骤中选择 **密钥库**，然后选择
**密钥库** 并填写 **引用**。这样用户和密码就从密钥库读取，而不是手动输入。

### 内联方式，无需凭据行

在任何接受凭据名称的地方，都可以改为直接引用密钥库（`fnCredentials`、`fnRestBasic`、
表单的 `credentials:`、查询的 `dbConfig`）。

```javascript
fn.fnCredentials('secret:vault:secret/myapp/prod')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/myapp/prod')          // the store named `vault`
```

```yaml
- name: servers
  type: enum
  query: SELECT name FROM servers
  dbConfig: secret:vault:secret/cmdb/db
```

从 7.5.0 起，`dbConfig` 首先指定 [数据库](../databases.html)；像这样的引用不是数据库，因此仍从密钥库
读取。数据库也可以通过使用密钥库的、类型为数据库的凭据，从密钥库读取其登录信息。

没有凭据行时，数据库密钥至少需要 `db_type` 和主机，例如：

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

没有 `db_type` 时，该密钥是一个普通凭据（用户、密码以及其他任何键），对其进行的查询默认为 `mysql`。

### 键名

密钥通过以下别名映射到凭据。其他键会原样传递。

| 凭据字段 | 密钥中可接受的键 |
|---|---|
| `user` | `user`、`username`、`login` |
| `password` | `password`、`token`、`api_key`、`apikey`、`secret` |
| `host` | `host`、`address` |
| `port` | `port` |
| `db_name` | `db_name`、`database` |
| `db_type`、`secure` | 同名（仅限内联密钥） |

对于凭据行，只有在凭据行中留空的地方，才会使用密钥中的主机、端口和
数据库名称。

结构不同的密钥可以用 `jq` 表达式重新整理，作为 `fnCredentials` 的第三个参数
传入：

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## 在配置种子中

与其他管理对象一样，密钥库也可以在配置种子中声明：

```yaml
secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login        # its address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}  # the Vault token
    - name: production-db
      secret_store: vault
      secret_ref: secret/forms/production-db
      host: db.example.com
      port: 3306
      db_type: mysql
      is_database: true
```

密钥库使用其凭据登录：`vault` 凭据在 `url` 中保存 Vault 的地址，并以令牌作为其密码；`cyberark`
凭据保存 AppID 和 CCP 地址。没有凭据时，使用密钥库自身的 `url` 和 `token`。
详情参见 [配置种子](../seed)。

---

## 从 VAULT_* 变量升级

在 7 之前，唯一的密钥库是用 `VAULT_*` 环境变量配置的 HashiCorp Vault，
凭据通过 **Vault path** 指向它。

- **这些变量会被导入一次**，成为名为 `vault` 的密钥库；之后请将它们删除。
- **带有 `vault_path` 的凭据** 现在使用该密钥库；`vault_path` 将在 8 中移除。
