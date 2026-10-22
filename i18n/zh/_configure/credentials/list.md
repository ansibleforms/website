---
layout: default
title: 凭据页面
parent: 凭据
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
---

# 凭据页面
{: .no_toc }

凭据列表，以及添加凭据的对话框
{: .fs-6 .fw-300 }

**连接 > 凭据** 下的页面列出所有凭据，包括其 **名称**、**类型**、**描述** 和 **使用者**，即
引用它的记录、表单和工作流的数量（参见 [正在使用的凭据](../credentials.html#credentials-in-use)）。

**添加凭据** 会打开一个分步对话框：

| 步骤 | 字段 |
|---|---|
| 凭据 | 名称和描述，均为必填。 |
| 类型 | 18 种类型之一，见下文。 |
| 登录 | 该类型用什么登录以及登录到哪里，见下文。 |
| 存储 | 用户和密码的保存位置：**数据库**（加密保存在 AnsibleForms 数据库中）或 **密钥库**，并指定密钥库及其中的 **引用**。不适用于 CyberArk 和 HashiCorp Vault，因为密钥库本身用它们登录。 |

**类型** 步骤按名称列出各种类型：AAP、API、Ascender、AWX、CyberArk、数据库、Git、HashiCorp Vault、Jenkins、LDAP、
Microsoft Entra ID、Open ID、RTE、Rundeck、Semaphore、SMTP、SSH，以及用户名和密码（参见 [凭据类型](types.html)）。

**登录** 步骤包含该类型的所有字段，包括地址；没有单独的连接步骤：

| 类型 | 登录步骤的字段 |
|---|---|
| 除 CyberArk 外的所有类型 | 密码，或代替密码的内容：LDAP 的绑定密码、Entra ID 和 Open ID 的客户端密钥、HashiCorp Vault 的令牌、RTE 令牌、Semaphore、Rundeck 和 Jenkins 的 API 令牌，以及 AWX、AAP 和 Ascender 的令牌或密码 |
| 除 HashiCorp Vault、RTE、Semaphore 和 Rundeck 外的所有类型 | 用户：CyberArk 的 AppID、LDAP 的绑定 DN、Entra ID 和 Open ID 的客户端 ID；对于 AWX、AAP 和 Ascender 为可选 |
| SSH、数据库 | **主机** 和 **端口**；数据库还包括 **数据库类型** 和 **数据库** |
| SMTP | **邮件服务器**（必填）、其 **端口** 和 **使用 TLS** |
| LDAP | 目录的 **服务器**（必填）、其 **端口** 和 **启用 TLS**；启用 TLS 时还有 **忽略证书**、**CA 证书包** 和 **客户端证书** |
| Microsoft Entra ID | **租户 ID**（必填）和 **重定向 URI** |
| Open ID | **颁发者**（必填）和 **重定向 URI** |
| HashiCorp Vault、CyberArk、RTE、AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins | **服务器**，即其登录的地址，必填，另有 **跳过证书验证** 和 **CA 证书包** |
| CyberArk | **客户端证书** 和 **客户端密钥** |

点击某一行会打开该凭据自己的页面。其菜单提供 **编辑**、**测试连接**（仅限数据库凭据）和 **删除**。
密码在凭据页面的 **登录** 选项卡中修改。
