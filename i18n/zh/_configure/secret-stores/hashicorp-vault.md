---
layout: default
title: HashiCorp Vault
parent: 密钥库
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

从 HashiCorp Vault 的 KV v1 或 v2 或动态密钥引擎读取凭据
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

## 动态数据库凭据

形如 `<mount>/creds/<role>` 的引用（例如 `database/creds/readonly`）会从
动态密钥引擎（例如 Vault 的数据库引擎）读取。Vault 随后会在每次读取时创建一个新的数据库
账户，在租约期间内有效。

- 账户会在其租约的 80% 时间内被复用，而不是缓存时间；缓存为 `0` 时，每次查询都会读取一个新账户。
- Vault 只返回用户和密码：请将连接的其余信息放在凭据行中。
- 租约永远不会被提前撤销；当 Vault 结束租约时，账户随之过期。
