---
layout: default
title: 角色
parent: config.yaml
nav_order: 2
translated_from: c23a8fb9203e85e81cd128d2c129228c0a207f6c
---

# 角色
{: .no_toc }

将用户和组映射到角色，并设定每个角色可以做什么。
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## roles 属性

config.yaml 的顶层 `roles` 列表：

{% include config_attribute.html name="roles" %}

---

## default 角色

每个已登录的用户都拥有 `default` 角色，因此 `roles: [default]` 的表单对所有能够登录的人开放。
不存在匿名访问：不登录就无法获得该角色。

该角色不包含任何组和用户，因为它已经适用于所有人。它的 `options` 是所有人的默认值，
详见下文的 [角色选项](#role-options)。`config.yaml` 必须包含 `admin` 和 `default` 角色，
角色页面会将两者都显示为 **必填**。

在 7.0.0 之前，`default` 叫作 `public`，旧名称仍然有效：

- **在表单中**，`roles: [public]` 仍然匹配所有用户，因此仓库中的表单无需修改。
- **在 `config.yaml` 中**，名为 `public` 的角色会在加载配置时在文件中被重命名为 `default`。只修改名称，
  修改前会先备份配置，保存在仓库中的配置随后会有一个待推送的更改。
- **在 ytt 模板中**，模板不会被改写：它生成的配置会被重命名，日志中的一条警告会提示
  您也在模板中重命名该角色。版本 8 将拒绝其中的 `public` 角色。

同时包含 `default` 和 `public` 角色的配置会被拒绝，因为它们是同一个角色。

---

## Role 对象

`roles` 列表中的每一项：

{% include config_object.html name="Role" %}

---

## 角色选项

角色的 `options` 为其成员打开或关闭各项功能。从 7.3.0 起，角色页面将它们分为四组显示，
每个选项都有一个 (i)，说明它提供什么，其文字与个人资料的 **权限** 视图中显示的相同：

| 选项 | 允许用户 | 默认值 |
|---|---|---|
| **设置** | | |
| `showSettings` | 查看和修改所有设置页面；服务器日志和备份有各自的选项 | 仅管理员 |
| `showAppearanceSettings` | 修改外观设置，但不能修改其他设置（从 7.3.0 起） | 关 |
| `showConnectionsSettings` | 管理连接设置（凭据、运行器等），但不能修改其他设置（从 7.3.0 起） | 关 |
| `showLogs` | 查看服务器日志 | 仅管理员 |
| `showAuditLog` | 查看审计日志，但不能查看其他设置（从 7.3.0 起） | 仅管理员 |
| `allowBackupOps` | 备份和恢复数据库 | 仅管理员 |
| **设计器** | | |
| `showDesigner` | 查看和使用设计器 | 仅管理员 |
| `allowFormDesign` | 在设计器中编辑表单配置：类别、常量和表单。没有它则为只读（从 7.3.0 起） | 开 |
| `allowPlaybookDesign` | 在设计器中编辑 playbook：保存、创建、删除和推送。没有它则为只读 | 开 |
| `allowWorkflowDesign` | 在设计器中编辑工作流：保存、创建、删除和推送。没有它则为只读 | 开 |
| `allowInventoryDesign` | 在设计器中编辑清单：保存、创建、删除和推送。没有它则为只读 | 开 |
| `allowVarsFileDesign` | 在设计器中编辑变量文件：保存、创建、删除和推送。没有它则为只读 | 开 |
| **作业** | | |
| `showJobs` | 查看作业页面 | 开 |
| `showAllJobLogs` | 查看所有用户的作业，而不仅是自己的 | 仅管理员 |
| `manageAllJobs` | 中止、删除和重新运行所有用户的作业；删除和重新运行还需要下面的两个选项（从 7.3.0 起） | 仅管理员 |
| `showExtravars` | 查看表单和作业的 extravars | 开 |
| `showDebugButtons` | 查看表单上的调试按钮 | 开 |
| `showArtifacts` | 查看作业的工件：AWX 作业返回的内容，或 playbook 用 `set_stats` 收集的内容 | 开 |
| `allowVerboseMode` | 以详细模式运行作业 | 开 |
| `allowJobRelaunch` | 使用之前某次运行的表单数据重新运行作业 | 仅管理员 |
| `allowJobDeletion` | 删除作业：自己的作业，或在拥有 `manageAllJobs` 时删除所有用户的作业。没有它，作业历史将完整保留（从 7.3.0 起） | 开 |
| `allowScheduledJobs` | 在 **调度** 页面创建和管理周期性及一次性调度（参见下方警告） | 仅管理员 |
| `allowPlannedJobs` | 计划作业在设定的时间运行一次（**稍后运行**） | 开 |
| `allowStoredJobs` | 保存表单的数据，之后再加载 | 开 |
| **访问和集成** | | |
| `allowLogin` | 登录 AnsibleForms | 开 |
| `allowChat` | 使用 [聊天助手](../chat/)（在其启用时） | 开 |
| `allowMcp` | 从 AI 代理使用 [MCP 服务器](../mcp/)（在其启用时） | 该角色的 `allowChat` |
| `allowFileUploads` | 通过表单的文件字段上传文件（从 7.3.0 起） | 开 |
| `allowApiTokens` | 为脚本创建 [API 令牌](../profile/api-token.html)，有效期最长为实例允许的上限（从 7.3.0 起） | 关 |
| `extendedTokenExpiration` | 还可以创建永不过期的 API 令牌；需要 `allowApiTokens` | 关 |

有些选项包含其他选项，角色页面会将被包含的选项显示为已打开并呈灰色：

- **`showSettings`** 同时提供 `showAppearanceSettings`、`showConnectionsSettings` 和 `showAuditLog`。
- **`manageAllJobs`** 同时提供 `showAllJobLogs`，因为要操作所有用户的作业就必须能看到它们。
- **设计相关选项** 只有在拥有 `showDesigner` 时才有意义，`extendedTokenExpiration` 只有在拥有 `allowApiTokens` 时才有意义。

在 7.2.0 及更早版本中，`showAllJobLogs` 还允许用户中止和删除其显示的作业；从 7.3.0 起，这需要 `manageAllJobs`。
7.3.0 之前设置了 `extendedTokenExpiration` 但没有 `allowApiTokens` 的角色会获得 `allowApiTokens`，以便保留其令牌。

**仅管理员** 表示对拥有 `admin` 角色的用户打开，对其他所有人关闭。当用户匹配多个角色时，
选项按如下方式合并：

- **在用户的各个角色之间**，只有当所有设置了该选项的角色意见一致时，选项才为打开：显式的 `false` 优先。
- **`default` 角色** 补充用户其他角色都没有设置的选项，因此可以用它为所有人保存默认值。
- **任何地方都没有设置的选项** 采用表中的默认值。

`showExtraVars`（V 大写）可作为 `showExtravars` 的另一种写法；只要任一写法为 `false`，
该选项就为关闭。

{: .warning }
> 请将 `allowScheduledJobs` 视为管理员级别的选项。调度不归创建它的用户所有：每个拥有
> 该选项的用户都能看到并修改所有调度。调度还会以管理员权限运行任意表单，而不论创建者
> 自身的访问权限如何。只将其授予您会像信任管理员一样信任的角色。

{: .warning }
> 在 `default` 角色上设置 `allowLogin: false`，会把其他角色没有设置 `allowLogin: true` 的所有用户都锁在外面，包括
> 管理员。保存之前，请先在必须能够登录的角色上重新授予它。
