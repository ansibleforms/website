---
layout: default
title: 概念
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# 概念
{: .no_toc }

本文档中使用的术语，每个都链接到其页面
{: .fs-6 .fw-300 }

---

## 术语表

本文档中使用的术语：

| 术语 | 含义 |
|---|---|
| **[表单](forms/)** | 一个 YAML 定义，用于收集输入并运行 playbook、模板或工作流 |
| **[表单字段](formfields/)** | 表单的一个输入项，例如 `text`、`enum` 或 `checkbox`；其值会成为一个 extravar |
| **[类别](config/categories.html)** | 表单页面上表单树中的一个分组，在 `config.yaml` 中定义 |
| **[角色](config/roles.html)** | 一组用户和组；表单列出可以查看和运行它的角色，`default` 表示所有人 |
| **[表达式](expressions/)** | 计算字段值的 JavaScript，在浏览器中（`runLocal: true`）或在服务器上运行 |
| **[Extravars](formfields/)** | 发送给 playbook 或模板的变量，由字段值构建 |
| **[凭据](expressions/credentials.html)** | 一份已存储的登录信息，用 `ENCRYPTION_SECRET` 加密：用户名和密码（以及主机、端口、数据库），或者从 7.3.0 起，LDAP 目录、SSO 提供方、运行器或 HashiCorp Vault 的地址和密钥 |
| **[密钥库](secret-stores/)** | 与 HashiCorp Vault 或 CyberArk 的连接，为凭据提供用户名和密码 |
| **[作业](gui/forms-and-jobs.html)** | 表单的一次运行，带有其状态、extravars 和输出，保存在作业历史中 |
| **[运行器](runners.html)** | 作业运行的地方，在 **连接 > 运行器** 下添加：`rte` 用于 playbook，`awx`（AWX，或其变体 `aap` 或 `ascender`）、`semaphore`、`rundeck` 或 `jenkins` 用于模板和作业。表单用 `runner:` 选择一个运行器，否则在默认的 `rte`（playbook）或 `awx`（模板）运行器上运行 |
| **[RTE](rte/)** | 运行环境：以 `AF_ROLE=rte` 在自己的容器中启动的 AnsibleForms 服务器，与 python 和 ansible 一起，运行 `rte` 类型运行器的 playbook |
| **[审批点](forms/approval.html)** | 作业中的一次暂停，直到拥有审批角色的用户批准或拒绝它 |
| **[工作流](workflows/)** | 由 playbook、审批和其他工作流组成的图，按成功、失败或始终相连，采用 AWX 的语法 |
| **[多步骤表单](forms/multistep.html)** | 自 7 起已弃用：按顺序运行多个 playbook 或模板的表单；由工作流取代 |
| **[通知通道](notification-channels.html)** | 通知和审批请求的发送目标：邮件服务器、Slack 或 Teams webhook、Telegram 聊天或 webhook |
| **[设计器](designer/)** | 用于编辑表单、playbook、清单和工作流的浏览器编辑器，同一时间只能一人使用 |
| **[子表单](forms/subform.html)** | 一组可复用的字段，描述 `list` 字段的行或 `yaml` 字段的对象 |
| **[config.yaml](config/)** | 包含类别、角色和常量的文件；表单存放在各自的文件中 |
| **[配置种子](seed/)** | 一个 YAML 文件（`CONFIG_SEED_PATH`），用于声明运行器和凭据等管理对象 |
| **[持久化文件夹](customization/paths.html)** | 存放 AnsibleForms 在重启和升级后必须保留的文件的文件夹 |
