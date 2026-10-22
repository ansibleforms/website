---
layout: default
title: 管理
parent: 界面导览
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# 管理
{: .no_toc }

设置菜单：系统、外观、访问、连接和日志
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 设置菜单

页眉中的 **设置** 会打开管理页面，这些页面在左侧菜单中分组为 **系统**、**外观**、
**访问**、**连接** 和 **日志**。每个条目只对拥有其页面所需角色选项的用户显示：
**备份** 需要 `allowBackupOps`，**服务器日志** 需要 `showLogs`，其他所有页面需要 `showSettings`。
从 7.3.0 起，有三个选项可以只打开其中一部分页面：

| 角色选项 | 打开的页面 |
|---|---|
| `showAppearanceSettings` | **外观** 页面 |
| `showConnectionsSettings` | **连接** 页面，**Syslog** 除外；仓库、密钥库和受保护的凭据仍只能由管理员修改 |
| `showAuditLog` | **审计日志** |

关于角色选项，参见 [角色](../config/roles.html#role-options)。

---

## 列表和记录页面

从 7.3.0 起，设置中的列表和记录页面采用统一的布局，其控件位于标题下方单独的一行中：

| 部分 | 工作方式 |
|---|---|
| 搜索框 | 在每个设置页面和记录页面上，它都位于该行的最前面。输入一个词会同时筛选所有选项卡：匹配的字段、行或行内容显示在各自选项卡的名称下 |
| 每页条数 | 在选择每页条数之前，表格显示屏幕能容纳的行数：可选 10、20、50 或 100 |
| 列 | 每个有名称的列都可以排序，空单元格显示 `–` |
| 复选框 | 只有在勾选行后可以执行某些操作时，行才带有复选框，行菜单（⋮）也提供相同的操作 |
| 行菜单 | 简短的标签，例如 **编辑** 和 **删除**。带有 **已启用** 列的列表会把它放在第一列，并在每个行菜单中根据情况提供 **启用** 或 **禁用** |

带有 **已启用** 列的列表包括 SSO 提供方、LDAP 目录、运行器、调度、通知
通道、syslog 服务器、公告、标签以及免责声明的版本。

---

## 系统

实例本身：其设置、健康状况和备份。

| 页面 | 用途 |
|---|---|
| **常规** | 环境变量，分布在从配置到日志的各个选项卡中。参见 [环境变量](../customization/)。 |
| **状态** | 实例及其所依赖系统的健康状况，分为检查项和信息两个选项卡。参见 [监控](../production/monitoring.html)。 |
| **备份** | 创建、还原和删除数据库、config.yaml 和表单的备份。参见 [备份](../production/backups.html)。 |

![设置 > 常规，配置选项卡](../assets/screenshots/settings.jpg)

### 备份

备份列表，包括每晚备份和手动备份：**添加备份** 立即创建一个备份，行菜单中有 **查看备份**、**还原** 和 **删除**。

![设置 > 备份](../assets/screenshots/backups.jpg)

### 还原

**还原** 会显示备份包含的内容，然后进行还原；**恢复前先创建新备份（推荐）** 默认处于勾选状态。

![还原备份](../assets/screenshots/restore.jpg)

---

## 外观

实例对所有人呈现的样子，以及它显示的消息。

| 页面 | 用途 |
|---|---|
| **默认值** | 未自行选择的用户所使用的主题、语言、表单视图、时区和日期格式。参见 [默认值](../appearance/defaults.html)。 |
| **名称** | 浏览器选项卡和登录页面上显示的名称。参见 [名称](../appearance/name.html)。 |
| **徽标** | 页眉中您自己的徽标。参见 [徽标](../appearance/logo.html)。 |
| **图标** | 浏览器选项卡中您自己的图标。参见 [图标](../appearance/icon.html)。 |
| **链接** | 设计器链接，以及页眉中您自己的链接和菜单。参见 [链接](../appearance/links.html)。 |
| **标签** | 徽标旁边的标签，例如 PRODUCTION 和 EU。参见 [标签](../appearance/labels.html)。 |
| **公告** | 页眉下方的消息，每条从其开始时间显示到结束时间。参见 [公告](../announcements.html)。 |

---

## 访问

谁可以登录，以及登录后可以做什么。

| 页面 | 用途 |
|---|---|
| **免责声明** | 每个用户需接受一次的条款，以及谁接受了哪个版本。参见 [免责声明](../disclaimer.html)。 |
| **用户** | 本地用户，以及 LDAP 和单点登录用户。参见 [用户和组](../users-and-groups.html)。 |
| **组** | 本地组，以及 LDAP 和单点登录组。参见 [用户和组](../users-and-groups/local-group.html)。 |
| **角色** | config.yaml 中的角色：谁拥有它们以及它们允许做什么。参见 [角色](../config/roles.html)。 |
| **LDAP** | 使用 LDAP 目录或 Active Directory 登录。参见 [LDAP](../authentication/ldap.html)。 |
| **SSO** | 使用 Entra ID 或 OpenID Connect 提供方进行单点登录。参见 [身份验证](../authentication/)。 |

![访问 > LDAP，主目录](../assets/screenshots/ldap.jpg)

---

## 连接

AnsibleForms 访问的系统，以及登录这些系统所用的凭据。

| 页面 | 用途 |
|---|---|
| **仓库** | 表单和 playbook 所来自的 git 仓库。参见 [Git 仓库](../repositories/)。 |
| **凭据** | 表单、playbook 和连接所使用的账户和密钥。参见 [凭据](../credentials.html)。 |
| **密钥库** | 可以从中读取凭据的 HashiCorp Vault 和 CyberArk。参见 [密钥库](../secret-stores/)。 |
| **运行器** | 作业运行的地方：用于 playbook 的 RTE 容器，以及用于模板的 AWX 等。参见 [运行器](../runners.html)。 |
| **SSH** | 应用连接 git 时所用的密钥对，以及已知主机。参见 [SSH](../repositories/authentication.html#ssh-with-the-generated-key)。 |
| **通知** | SMTP 服务器、Slack、Microsoft Teams、Telegram 和 webhook。参见 [通知通道](../notification-channels.html)。 |
| **聊天助手** | 聊天助手的 AI 提供方。参见 [聊天助手](../chat/)。 |
| **MCP** | 供 AI 代理使用的 MCP 服务器。参见 [MCP](../mcp/)。 |
| **Syslog** | 接收服务器日志、审计日志或两者的 syslog 服务器。参见 [Syslog](../production/logs.html#syslog)。 |

![连接 > 凭据，凭据的连接选项卡](../assets/screenshots/credentials.jpg)

---

## 日志

实例上发生了什么。

| 页面 | 用途 |
|---|---|
| **审计日志** | 谁修改了什么，以及是否被允许，可按用户、操作和结果筛选。参见 [审计记录](../production/logs.html#audit-trail)。 |
| **服务器日志** | 服务器自身的日志，用于故障排查。参见 [日志](../production/logs.html)。 |

### 服务器日志

日志的最后几行，最新的在底部，并随写入实时跟踪。搜索框可以筛选它们（正则
表达式），**清空** 清空的是视图而不是日志，**下载** 保存完整的日志。

![日志 > 服务器日志](../assets/screenshots/logs.jpg)

---

## API 文档

帮助菜单（页眉中的问号）中的 **API 文档** 链接到 REST API 的 Swagger UI，地址为 `/api/v2/docs`。
参见 [API](../api/)。

![Swagger 界面](../assets/screenshots/swagger.jpg)
