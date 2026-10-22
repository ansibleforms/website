---
layout: default
title: 评估常见问题
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# 评估常见问题
{: .no_toc }

对安全问卷中最常见问题的简短回答
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 数据和托管

数据存放在哪里，以及谁能访问它：

| 问题 | 回答 |
|---|---|
| 我们的数据存储在哪里？ | 存储在您运行的 MySQL 或 MariaDB 数据库中，以及您实例的持久化文件夹中。AnsibleForms 是自托管的，背后没有任何云服务。 |
| 它会把数据发送给开发者吗？ | 不会。没有遥测，没有使用情况上报，也没有更新检查。 |
| 它会连接到哪里？ | 只连接管理员配置的系统：参见[出站连接](measures.html#outbound-connections)。 |
| 它是否使用 AI，或者把数据发送给模型提供商？ | 只有在开启[聊天助手](../chat/)时才会，该功能默认关闭。开启后，它会把表单定义和正在填写的值发送给您配置的提供商。 |
| 它能在没有互联网连接的情况下运行吗？ | 能。应用程序不需要互联网连接；playbook 需要的是其任务所访问的资源。 |

---

## 加密

哪些内容会加密，以及使用哪些密钥：

| 问题 | 回答 |
|---|---|
| 数据在传输中是否加密？ | 通过 [HTTPS](../security/https.html) 加密，由应用程序或您的反向代理提供，应用程序与其运行时环境之间使用 `wss://` 。 |
| 数据在静态存储时是否加密？ | 应用程序用 AES-256 加密每一个存储的机密。作业及其输出按原样存储：请使用数据库自身的静态加密。参见[存储的机密](measures.html#stored-secrets)。 |
| 密钥由谁持有？ | 由您持有： [`ENCRYPTION_SECRET`](../security/secrets.html) 由您设置，不包含在备份中，并且可以轮换。 |
| 机密可以留在我们自己的 vault 中吗？ | 可以：作业需要时会读取 [HashiCorp Vault 和 CyberArk](../secret-stores/)。 |

---

## 访问和问责

谁可以登录、他们能做什么，以及记录了什么：

| 问题 | 回答 |
|---|---|
| 是否支持单点登录？ | 支持：LDAP / Active Directory、OpenID Connect 和 Entra ID。参见[认证](../authentication/)。 |
| 是否支持多因素认证？ | 通过单点登录支持：适用您的身份提供商的 MFA。本地账户本身没有 MFA。 |
| 权限如何管理？ | 通过映射到组的角色管理，服务器会在每个请求上检查。参见[权限](measures.html#permissions)。 |
| 是否有审计日志？ | 有：记录每项变更和每次被拒绝的尝试，默认保留 365 天，并可转发到 syslog。参见[审计跟踪](measures.html#audit-trail)。 |
| 是否有默认密码？ | 第一个管理员账户有一个公开的默认密码，必须在首次登录时修改。参见[管理员账户](../security/hardening.html#the-admin-account)。 |

---

## 漏洞和更新

问题如何发现、修复和公布：

| 问题 | 回答 |
|---|---|
| 是否发现过漏洞？ | 是的。每个已公布的漏洞都列在[安全公告](advisories.html)中，并附有修复它的版本。 |
| 我们如何报告漏洞？ | 通过 GitHub 私下报告：参见[报告漏洞](reporting.html)。 |
| 代码如何检查？ | 每个拉取请求都会经过 CodeQL 静态分析和依赖审查，此外还有自动化测试和 Dependabot 更新。参见[安全开发](development.html)。 |
| 哪些版本会获得安全修复？ | 7.x 和 6.5.x。参见[受支持的版本](development.html#supported-versions)。 |
| 我们如何得知新公告？ | 在 GitHub 上关注该仓库的安全警报。参见[获取新公告的通知](advisories.html#being-told-of-new-advisories)。 |
| 是否做过渗透测试？ | 没有公布第三方渗透测试报告。代码是公开的，因此您自己的团队或测试人员可以对其进行评估，发现的问题按上述方式报告。 |

---

## 镜像和供应链

镜像来自哪里，以及如何检查它们：

| 问题 | 回答 |
|---|---|
| 镜像发布在哪里？ | 发布在 GitHub Container Registry `ghcr.io/ansibleforms/ansibleforms` 上，由公开的 GitHub Actions 工作流构建。参见[版本发布和镜像](development.html#releases-and-images)。 |
| 容器是否以 root 运行？ | 不是：以非特权用户 `node` 运行。 |
| 镜像是否签名？ | 尚未签名。请按摘要（ `@sha256:...` ）拉取镜像，以确保运行的是您审查过的镜像。 |
| 是否有 SBOM？ | 目前尚未随镜像发布 SBOM。Trivy 或 Syft 之类的扫描工具可以根据镜像生成一份。 |
| 镜像是否经过漏洞扫描？ | 发布流水线中没有扫描。其基础镜像通过摘要固定，并由 Dependabot 保持更新；请在您自己的镜像仓库中扫描镜像，以执行您自己的策略。 |
| 它采用什么许可证？ | GPL-3.0，开源，不提供任何担保。 |
