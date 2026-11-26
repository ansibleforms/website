---
layout: default
title: 配置种子
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
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
声明那些否则只存在于数据库中的对象和设置：

| 部分               | 声明的内容                                                                        |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | 作业的运行位置：RTE、AWX / AAP / Ascender、Semaphore、Rundeck、Jenkins            |
| `secret_stores`    | 密钥库（HashiCorp Vault 等）                                                      |
| `credentials`      | 凭据                                                                              |
| `databases`        | 表单查询的数据库及其凭据，从 7.5.0 起                                               |
| `sso`              | SSO 提供商：Entra ID 和 OIDC（7.8.0 之前为 `oauth2`）                              |
| `repositories`     | Git 仓库，以及应用从每个仓库读取的内容                                              |
| `syslog`           | 接收服务器日志和审计条目的 syslog 服务器（7.8.0 之前为 `syslog_servers`）           |
| `notifications`    | 邮件服务器、Slack、Teams、Telegram 和 webhook（7.8.0 之前为 `notification_channels`） |
| `labels`           | 页眉徽标旁的标签，从 7.3.0 起                                                      |
| `ldap`             | LDAP 配置                                                                         |
| `settings`         | 公共 URL；其邮件键自 7.6.0 起弃用，改用邮件通道                                     |
| `chat_assistant`   | 聊天助手的模型提供商（7.8.0 之前为 `chat`）                                         |
| `users`            | 本地用户和目录用户，自 7.8.0 起                                                    |
| `groups`           | 本地组及其成员，自 7.8.0 起                                                        |
| `defaults`         | **设置 > 外观 > 默认值**：主题、语言、时区，自 7.8.0 起                              |
| `logo`、`icon`     | 徽标和网站图标，种子旁边的图像文件，自 7.8.0 起                                      |
| `name`             | 应用的名称，自 7.8.0 起                                                            |
| `links`            | 页眉的链接，以及是否显示设计器的链接，自 7.8.0 起                                    |
| `announcements`    | 页眉下方的公告，自 7.8.0 起                                                        |
| `disclaimer`       | 用户接受的免责声明的各个版本，自 7.8.0 起                                           |
| `mcp`              | MCP 服务器的开关，自 7.8.0 起                                                      |
| `ssh`              | 应用的 SSH 私钥及其已知主机，自 7.8.0 起                                            |
| `awx`              | 自 7 起已弃用，将在 8 中移除：请使用 `type: awx` 的 `runners`                      |

[示例](example.html) 展示了每个部分，[托管对象](managed-objects.html) 说明种子在多大程度上拥有每个部分所声明的内容：
大多数部分会使其对象在应用中变为只读，少数部分只创建或修改它们。

7 之前编写的种子仍然有效：其 `awx` 部分的每一项都会作为类型为 `awx` 的运行器应用，日志
会在每次应用时发出警告。在升级到 8 之前，请将这些项移到 `runners` 下并设置 `type: awx`。

种子与 `config.yaml`（`CONFIG_PATH`）**不同**，后者是类别、角色和常量的基础配置。仓库也可以改为保存这些内容，
而该仓库是种子所声明的对象之一，因此种子不能放在该仓库中。

第一个管理员仍然来自 `ADMIN_USERNAME` / `ADMIN_PASSWORD`，LDAP 或 SSO 的用户则在登录时来自其目录。
自 7.8.0 起，`users` 和 `groups` 部分可以添加本地用户和组，并在目录用户登录之前就将其阻止。

---

## 已重命名的部分

自 7.8.0 起，有四个部分以 [git 仓库](../repositories/) 保存相同对象时所用的键命名，只是去掉了
`controller_`（`controller_sso:` 对应 `sso:`）：

| 7.8.0 之前                | 自 7.8.0 起        |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

它们的项保持不变。旧名称仍然可以读取，但自 7.8.0 起弃用，并将在 8 中移除：每次以旧名称应用时，都会在服务器日志中
记录一条警告，并给出新名称。以两个名称同时给出同一部分的种子会被拒绝。请在升级到 8 之前，在文件中改用新名称。

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
