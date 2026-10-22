---
layout: default
title: 运行器页面
parent: 运行器
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# 运行器页面
{: .no_toc }

运行器列表、添加运行器、打开或关闭运行器，以及每种类型的默认运行器
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 列表

**连接 > 运行器** 下的页面列出所有运行器，包含以下各列：

| 列 | 含义 |
|---|---|
| 已启用 | 是否接收作业。关闭的运行器不会接收任何作业，即使它是该类型的默认运行器。 |
| 名称 | 表单用 `runner: <name>` 引用它的名称。 |
| 类型 | RTE、AWX、Ansible Automation Platform、Ascender、Semaphore UI、Rundeck 或 Jenkins。该类型的默认运行器会在类型后显示一个 **默认** 标记。 |
| 描述 | 它的用途。 |

**列** 可以再添加两列，默认关闭：**模式**，即 RTE 的模式（出站、入站或数据库（已弃用），参见
[模式](../rte/modes.html)）；以及 **连接**，即是否有应用节点持有到套接字模式 RTE 的套接字：**已连接** 或
**未连接**。

从 7.3.0 起，等待批准的运行器不在列表中，而是显示在列表上方的提示中，参见 [批准 RTE](registration.html#approving-an-rte)。
**添加运行器** 会打开一个分步对话框：**运行器**（名称和描述）、**类型** 和 **凭据**；对于 RTE，在 **类型** 之后还有一个 **模式** 步骤
（出站，新 RTE 的默认值；入站；或数据库（已弃用））：RTE 共四步，其他类型共
三步。在 **类型** 步骤中，每个产品都有一条提示：RTE 的提示给出了其全称 *Runtime Environment*。点击某一行会打开运行器
自己的页面，其菜单提供：

| 操作 | 作用 |
|---|---|
| 编辑 | 打开其页面 |
| 测试连接 | 检查它是否应答并接受其凭据，参见 [测试连接](runner-page.html#test-connection) |
| 启用、禁用 | 打开或关闭它，视其当前状态而定 |
| 更改凭据 | 打开其页面的凭据选项卡 |
| 删除 | 删除它 |

---

## 默认与已启用

每种类型的默认运行器是该类型的表单在未指定运行器时的运行位置：

| 默认用于 | 这些表单在未指定运行器时的运行位置 |
|---|---|
| Playbook 表单 | `ansible` 表单，在 RTE 上 |
| AWX、AAP 和 Ascender 表单 | `awx`、`aap` 和 `ascender` 表单，在 AWX 运行器上 |
| Semaphore 表单 | `semaphore` 表单 |
| Rundeck 表单 | `rundeck` 表单 |
| Jenkins 表单 | `jenkins` 表单 |

某种类型的第一个运行器会成为其默认运行器，因此每种类型只有一个运行器时无需额外操作。要让另一个运行器成为默认运行器，
请打开其页面上的 **默认** 开关（参见 [单个运行器的页面](runner-page.html)）。

关闭的运行器仍会连同其设置保留在列表中，但不会有任何作业发往它，即使它是该类型的默认运行器。发给它的作业会失败，并显示
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*。
可以通过其行菜单中的 **启用** 或 **禁用**，或其页面上的 **已启用** 开关来打开或关闭它。新运行器默认为打开，
7.3.0 之前已存在的运行器在升级后也为打开。[配置种子](../seed/example.html) 可以用
`enabled: false` 关闭运行器。
