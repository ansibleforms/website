---
layout: default
title: 凭据类型
parent: 凭据
nav_order: 1
translated_from: eb4f5cce55db979ca4f0d1304d797decc01192ee
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
| 用户名和密码 | 用于任何登录的用户和密码：使用基本认证的 REST API、某个服务等，可带有可选的主机和端口。默认类型 | Playbook，通过表单的 `credentials` 或凭据字段；[REST 表达式](../expressions/credentials.html) |
| SSH | 用于 SSH 连接服务器的用户，以及密码或私钥，还有主机和端口 | Playbook，通过表单的 `credentials`、`ansibleCredentials` 或凭据字段，以及工作流节点的登录 |
| Git | 用于 git 仓库的令牌，或用户名和密码 | [仓库](../repositories/authentication.html) |
| API | 用于 REST API 的用户名和密码或令牌，可带有可选的主机和端口 | [REST 表达式](../expressions/credentials.html)、Telegram 机器人令牌、webhook 的 bearer 令牌、聊天助手的 API 密钥 |
| 数据库 | 数据库登录，包括其类型、主机、端口和数据库名称 | 表单查询的 [数据库](../databases.html)（`dbConfig`，从 7.5.0 起），或直接由表单的 `dbConfig` 引用；`fnCredentials`；可以测试 |
| CyberArk | CyberArk Central Credential Provider（CCP）的地址及其 TLS，以及 CyberArk 密钥库登录所用的 AppID、客户端证书和密钥 | [CyberArk](../secret-stores/cyberark.html) 密钥库 |
| SMTP | 邮件服务器、其端口和 TLS，以及可选的登录信息（中继无需） | 邮件 [通知通道](../notification-channels.html) |
| LDAP | 目录的服务器、端口、TLS 和证书，以及绑定 DN 和密码 | [LDAP 目录](../authentication/ldap.html) |
| Microsoft Entra ID | 应用注册：租户 ID、客户端 ID、客户端密钥或证书，以及重定向 URI | [Entra ID 提供商](../authentication/entra-id.html)；通过 [Microsoft 365](../notification-channels/microsoft-365.html) 发送的邮件通道 |
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

## 凭据如何登录

从 7.6.0 起，这些类型的 **登录** 步骤会先询问凭据如何登录，然后只显示该选择所需的字段：

| 类型 | 选择 | 字段 |
|---|---|---|
| SSH | **登录方式**：**密码** 或 **私钥** | 密码：用户名及其密码。私钥：用户名、PEM 或 OpenSSH **私钥** 以及可选的 **密码短语** |
| AWX、AAP、Ascender | **登录方式**：**令牌** 或 **密码** | 令牌：**令牌**，无需用户名。密码：用户名及其密码 |
| Git | **登录方式**：**令牌** 或 **密码** | 令牌：**令牌**，无需用户名（git 会随之发送用户名 `oauth2`）。密码：用户名及其密码 |
| SMTP | **登录方式**：**无需登录** 或 **登录** | 无需登录，用于中继：只有 **邮件服务器**、**邮件端口** 和 **使用 TLS**。登录：这些字段，再加上用户名及其密码 |
| Microsoft Entra ID | **登录方式**：**密钥** 或 **证书** | 密钥：**客户端密钥**。证书：PEM **证书** 及其私钥，仅用于通过 Microsoft 365 发送邮件 |

凭据只保存其选择所需的内容：SSH 凭据绝不会同时保存密码和私钥，另一个会在保存时删除。在 **存储** 步骤中选择
**写入键** 时，只提供带密码的选择，不提供 **私钥**、**无需登录** 和 **证书**。

其他类型只有一种登录方式。用户名和密码凭据或 API 凭据在密码之后有 **添加主机和端口** 开关，参见
[登录的主机和端口](#host-and-port-of-a-login)。对话框将 LDAP 绑定密码称为 **密码**，RTE 令牌称为 **Token**，
数据库类型称为 **引擎**。

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

---

## 登录的主机和端口

从 7.6.0 起，用户名和密码凭据或 API 凭据也可以保存 **主机** 和 **端口**，两者均为可选：在其 **登录** 步骤中，
密码之后的 **添加主机和端口** 开关会显示它们。

它们随凭据一起以 `host` 和 `port` 的形式，与 `user` 和 `password` 并列，传给 playbook 和表达式：通过表单的
`credentials` 和 [`fn.fnCredentials`](../expressions/credentials.html)。从密钥库读取的凭据保留其自身的主机和端口，
只在它们为空时才采用密钥中的值。SSH 和数据库凭据一直都有这两个字段。

---

## SSH 凭据的私钥

从 7.6.0 起，SSH 凭据可以使用私钥代替密码登录：将 **登录方式** 设为 **私钥** 时会询问以下字段：

| 字段 | 含义 |
|---|---|
| 私钥 | playbook 登录所用的 PEM 或 OpenSSH 私钥。加密存储，永不再显示：留空则保留已保存的私钥。 |
| 密码短语 | 私钥的密码短语（如果有）。加密存储。 |

它只用其中一种登录，绝不同时使用两者：保存时，私钥会删除已存储的密码，**密码** 会删除已存储的私钥及其密码短语，
凭据页面上也会这样说明。私钥及其密码短语永远不会由 API 返回，并且在作业输出中会被屏蔽。

当表单在 `ansibleCredentials` 中引用该凭据时，RTE 会将私钥写入一个私有临时文件（位于专属文件夹中，
仅其用户可读），并以 `ansible_ssh_private_key_file` 的形式传给 playbook。带密码短语的私钥会被加载到
仅为该作业启动的 `ssh-agent` 中，加载后即删除该文件。作业结束时（包括失败或中止的作业），文件和 agent
都会被清除，因此 RTE 上不会留下任何私钥。

RTE 镜像包含 `ssh-agent` 和 `ssh-add`；自建的 RTE 如果缺少它们，私钥带密码短语的作业会失败，并说明原因。

表单的 `credentials` 引用 SSH 凭据时，会将私钥以 `private_key` 、其密码短语以 `private_key_passphrase` 的形式交给 playbook。
在 [配置种子](../seed/) 中，私钥是凭据的 `client_key` ，其密码短语是 `key_passphrase` 。
