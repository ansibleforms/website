---
layout: default
title: 配置种子
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
---

# 配置种子
{: .no_toc }

在文件中声明管理对象
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向通过 git 进行部署的管理员：在文件中声明管理对象，以便在空数据库上重建实例。

---

## 涵盖的内容

将 `CONFIG_SEED_PATH` 设为一个 YAML 文件，AnsibleForms 会在启动时应用它。该文件
声明以前只存在于数据库中的对象：

| 部分                    | 声明的内容                                                          |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | 作业的运行位置：RTE、AWX / AAP / Ascender、Semaphore、Rundeck、Jenkins |
| `secret_stores`         | 密钥库（HashiCorp Vault 等）                                        |
| `credentials`           | 凭据                                                                |
| `oauth2`                | SSO 提供商：Entra ID 和 OIDC                                        |
| `repositories`          | Git 仓库                                                            |
| `syslog_servers`        | 接收服务器日志和审计条目的 syslog 服务器                            |
| `notification_channels` | 用于通知的邮件服务器、Slack、Teams、Telegram 和 webhook             |
| `labels`                | 页眉徽标旁的标签，从 7.3.0 起                                       |
| `ldap`                  | LDAP 配置                                                           |
| `settings`              | 公共 URL，以及没有活动邮件通道时使用的邮件设置                      |
| `chat`                  | 聊天助手的模型提供商                                                |
| `awx`                   | 自 7 起已弃用，将在 8 中移除：请使用 `type: awx` 的 `runners`       |

7 之前编写的种子仍然有效：其 `awx` 部分的每一项都会作为类型为 `awx` 的运行器应用，日志
会在每次应用时发出警告。在升级到 8 之前，请将这些项移到 `runners` 下并设置 `type: awx`。

种子与 `config.yaml` **不同**，后者保存类别、角色和常量，
并有自己的 `CONFIG_PATH`。两者是有意分开的：
*保存* `config.yaml` 的仓库是种子所声明的对象之一，因此种子
不能放在该仓库中。

用户和组不在其中：它们来自 LDAP 或 SSO，第一个管理员则来自 `ADMIN_USERNAME` / `ADMIN_PASSWORD`。

---

## 本节内容

每个主题都有自己的页面：

| 页面 | 内容 |
|---|---|
| [示例](example.html) | 一个完整的种子文件，逐部分说明 |
| [托管对象](managed-objects.html) | 种子如何拥有它列出的对象，以及它如何避免包含密钥 |
| [重新加载与启动](reloading.html) | 无需重启即可修改文件，以及启动时会发生什么 |
| [Kubernetes](kubernetes.html) | 从 ConfigMap 和 Secret 部署 AnsibleForms |
| [编辑与审计](environment-and-audit.html) | 锁定设置页面，以及审计日志记录的内容 |
