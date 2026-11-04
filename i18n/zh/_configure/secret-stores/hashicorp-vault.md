---
layout: default
title: HashiCorp Vault
parent: 密钥库
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

在 HashiCorp Vault KV 中读写凭据，读取动态密钥
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 密钥库字段

除了 [每个密钥库都有的字段](./#adding-a-store) 之外，HashiCorp Vault 密钥库还有以下字段：

| 字段 | 含义 |
|---|---|
| 凭据 | [连接 > 凭据](../credentials.html) 中的一个 **HashiCorp Vault** 凭据：Vault 的地址、其 TLS 设置，以及作为其密码的令牌，该令牌需要对您的凭据所用的路径有读取权限。**添加凭据** 会创建一个该类型的凭据。AnsibleForms 不会续订令牌。 |
| 命名空间 | Vault Enterprise 命名空间，以 `X-Vault-Namespace` 发送。在 **类型** 步骤中打开 **Vault Enterprise** 后才会显示。 |
| KV 版本 | `2`（默认）或 `1`。 |
| 默认挂载点 | 用于不带斜杠的引用，例如 `myapp` 会变为 `secret/data/myapp`。 |

密钥引用即路径，例如 `secret/myapp/prod`。对于 KV v2，如果您省略了 `/data/` 段，
会自动插入。

---

## 写入凭据

从 7.6.0 起，凭据的用户和密码可在 **保存** 时写入 Vault（参见 [写入凭据](./#writing-credentials)）。

在存储的 **选项** 中开启 **允许写入**，并设置它可以写入的位置：

| 字段 | 含义 |
|---|---|
| 允许写入 | 允许凭据在 **保存** 时将其用户和密码写入此存储。默认关闭。 |
| 写入前缀 | 凭据写入的路径或其下级路径，例如 `secret/ansibleforms`。只写挂载点（例如 `secret`）则允许整个挂载点。开启写入时必填。 |

密钥以 `username` 和 `password` 写入，按存储的 **KV 版本** 写入 KV v2 或 v1。令牌需要在前缀下具有
read、create 和 update 权限；read 用于检查是否已有密钥。对于 KV v2 和前缀 `secret/ansibleforms`：

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

动态密钥引擎的路径（例如 `database/creds/readonly`）永远不会被写入：这些凭据由 Vault 自己创建。

---

## 动态数据库凭据

形如 `<mount>/creds/<role>` 的引用（例如 `database/creds/readonly`）会从
动态密钥引擎（例如 Vault 的数据库引擎）读取。Vault 随后会在每次读取时创建一个新的数据库
账户，在租约期间内有效。

- 账户会在其租约的 80% 时间内被复用，而不是缓存时间；缓存为 `0` 时，每次查询都会读取一个新账户。
- Vault 只返回用户和密码：请将连接的其余信息放在凭据行中。
- 租约永远不会被提前撤销；当 Vault 结束租约时，账户随之过期。
