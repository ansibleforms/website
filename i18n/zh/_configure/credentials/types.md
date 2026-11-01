---
layout: default
title: 凭据类型
parent: 凭据
nav_order: 1
translated_from: 2782b0144b1442eceb8684fb1407827cef5fde8f
---

# 凭据类型
{: .no_toc }

每种类型保存什么，以及可以在哪里选择
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 类型

类型表示凭据的用途。它决定对话框要求填写哪些字段，以及可以在哪里选择该凭据：

| 类型 | 保存的内容 | 使用者 |
|---|---|---|
| 用户名和密码 | 用于任何登录的用户和密码：使用基本认证的 REST API、某个服务等。默认类型 | Playbook，通过表单的 `credentials` 或凭据字段；[REST 表达式](../expressions/credentials.html) |
| SSH | 用于 SSH 连接服务器的用户和密码，以及主机和端口 | Playbook，通过表单的 `credentials`、`ansibleCredentials` 或凭据字段，以及工作流节点的登录 |
| Git | 用于 git 仓库的用户名和密码或令牌 | [仓库](../repositories/authentication.html) |
| API | 用于 REST API 的用户名和密码或令牌 | [REST 表达式](../expressions/credentials.html)、Telegram 机器人令牌、webhook 的 bearer 令牌、聊天助手的 API 密钥 |
| 数据库 | 数据库登录，包括其类型、主机、端口和数据库名称 | 表单查询的 [数据库](../databases.html)（`dbConfig`，从 7.5.0 起），或直接由表单的 `dbConfig` 引用；`fnCredentials`；可以测试 |
| CyberArk | CyberArk Central Credential Provider（CCP）的地址及其 TLS，以及 CyberArk 密钥库登录所用的 AppID、客户端证书和密钥 | [CyberArk](../secret-stores/cyberark.html) 密钥库 |
| SMTP | 邮件服务器、其端口和 TLS，以及登录信息（中继无需） | 邮件 [通知通道](../notification-channels.html) |
| LDAP | 目录的服务器、端口、TLS 和证书，以及绑定 DN 和密码 | [LDAP 目录](../authentication/ldap.html) |
| Microsoft Entra ID | 提供商的应用注册：租户 ID、客户端 ID、客户端密钥和重定向 URI | [Entra ID 提供商](../authentication/entra-id.html) |
| Open ID | 提供商的客户端：颁发者、客户端 ID、客户端密钥和重定向 URI | [OIDC 提供商](../authentication/oidc.html) |
| RTE | RTE 的令牌（`RTE_TOKEN`）和地址 | RTE [运行器](../runners.html) |
| AWX、AAP、Ascender | 该平台的令牌或登录信息，以及地址 | 该类型的运行器 |
| Semaphore、Rundeck | 该产品的 API 令牌和地址 | 该类型的运行器 |
| Jenkins | Jenkins 的用户、其 API 令牌和地址 | Jenkins 运行器 |
| HashiCorp Vault | Vault 密钥库登录所用的令牌和地址 | [HashiCorp Vault](../secret-stores/hashicorp-vault.html) 密钥库 |

数据库凭据的类型可以是 MySQL、MSSQL、PostgreSQL、Oracle 或 MongoDB。从 7.5.0 起，它由
[连接 > 数据库](../databases.html) 中的数据库选择，升级到 7.5.0 时会为每个这样的凭据创建一个同名的数据库。

在 API 和 [配置种子](../seed/) 中，类型为 `userpass`、`ssh`、`git`、`api`、`database`、`cyberark`、`smtp`、
`ldap`、`entraid`、`oidc`、`rte`、`awx`、`aap`、`ascender`、`semaphore`、`rundeck`、`jenkins` 和 `vault`。从 6 升级时，
每个凭据都会获得类型 `userpass`，数据库凭据则为 `database`：表单会像在 6 中一样使用它。对于工作流节点的 playbook
用于连接的登录，请将其改为 SSH；对于 REST API，请改为 API。

---

## 凭据中的地址

从 7.3.0 起，只在一台服务器上有效的登录会携带该服务器，因此使用它的记录只需引用凭据：

| 记录 | 移入其凭据的内容 |
|---|---|
| LDAP 目录 | 其服务器、端口、TLS、证书和绑定账户，移入名为 `<directory>-ldap` 的 `ldap` 凭据 |
| SSO 提供商 | 其客户端 ID 和密钥、租户或颁发者，以及重定向 URI，移入名为 `<provider>-sso` 的 `entraid` 或 `oidc` 凭据 |
| 运行器 | 其地址和 TLS，以及令牌或登录信息，移入其类型的凭据，名为 `<runner>-token` 或 `<runner>-login` |
| 密钥库 | 其地址和 TLS，以及令牌（`<store>-token`）或 CyberArk AppID 和证书（`<store>-appid`） |
| 邮件通道 | 其服务器、端口和 TLS，移入其 `smtp` 凭据，或名为 `<channel>-smtp` 的新凭据 |

升级到 7.3.0 时只执行一次这些迁移。已经引用凭据的记录会保留该凭据；如果另一条记录以另一台服务器
使用了相同的登录，则会获得该凭据的一个副本。在 [配置种子](../seed/) 中声明的记录保持种子中的原样。
连接和登录所用的凭据只能由管理员修改，参见 [谁可以修改凭据](../credentials.html#who-may-change-a-credential)。
