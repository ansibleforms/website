---
layout: default
title: 作业操作
parent: 作业
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# 作业操作
{: .no_toc }

运行、中止、重新运行、批准或拒绝以及删除作业
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 运行作业

每个作业都从表单开始。在**表单**页面打开表单，填写字段，然后按**提交**：

1. 表单在浏览器中验证，字段值被提交到服务器。
2. 服务器创建作业并返回其编号；表单的 [`onSubmit`](../forms/job-status-action.html) 动作随即运行。
3. 作业的输出显示在表单下方，每两秒刷新一次，直到作业结束。

作业也会出现在**作业**页面上，您可以稍后在那里跟踪它。

### 谁可以运行表单

如果用户拥有表单 `roles` 列表中的某个[角色](../config/roles.html)，就能看到并运行该表单。
每个用户都拥有 `default` 角色，因此带有该角色的表单对所有能登录的人都可用。

### 提交之前

字段上方的工具栏提供了一些工具，每个工具只在您的角色允许时才显示：

| 按钮 | 作用 | 角色选项 |
|---|---|---|
| **显示 Extravars** | 在您填写字段时预览作业将收到的 extravars | `showExtraVars` |
| **verbose** | 以详细模式运行作业 | `allowVerboseMode` |
| **从已保存项加载** | 用[保存的作业](stored-jobs.html)填充字段 | `allowStoredJobs` |
| **重新加载此表单** | 重新加载表单，恢复其默认值 | 无 |

### 运行时的选择

表单可以通过声明一个使用保留名称的字段，让用户在运行时选择某些 Ansible 选项。
这时该字段的值会覆盖表单自身的设置：

| 字段名 | 覆盖的内容 | 常用字段类型 |
|---|---|---|
| `__check__` | 检查模式，即不做任何更改的试运行 | `checkbox` |
| `__diff__` | 差异模式，显示将会更改的内容 | `checkbox` |
| `__limit__` | playbook 运行所针对的主机 | `text` 或 `enum` |
| `__tags__` | 要运行的标签 | `text` 或 `enum` |
| `__inventory__` | 清单 | `enum` |
| `__playbook__` 、 `__template__` | playbook，或 AWX / AAP 模板 | `enum` |

例如，一个提供试运行和主机限制的表单：

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

服务器只接受把这些名称声明为字段的表单所提供的值，因此来自 API 的运行无法自行添加它们。
它们所覆盖的属性在 [Ansible 表单](../forms/ansible.html)和 [AWX 表单](../forms/awx.html)中介绍。

### 什么会阻止运行

运行并不总是会立即变成一个正在运行的作业：

* **无效字段**：表单不会提交，每个未通过验证的字段都会显示原因。
* **运行验证**：当[运行验证](../launch-validation/)设置为 `enforce` 时，服务器会再次检查这些值，
  并拒绝违反表单规则的运行。
* **审批**：带有[审批点](../forms/approval.html)的表单会创建作业，作业随后以
  `approve` 状态等待；参见[批准或拒绝作业](#approve-or-reject-a-job)。

作业结束时，表单的[通知](../forms/notifications.html)会发送邮件和通道消息，其作业
状态动作也会运行。

### 启动作业的其他方式

表单也可以在没有人按**提交**的情况下启动作业：

| 启动方 | 方式 | 页面 |
|---|---|---|
| 稍后运行或 cron 调度 | **提交**旁边的**稍后运行（一次性）** 或**调度（周期性）** | [调度](schedules.html) |
| 脚本或流水线 | 使用 API 令牌调用 `POST /api/v2/job` | [REST API 作业](../api/jobs.html) |
| AI 代理 | MCP 服务器的 `launch_job` 工具 | [MCP 工具](../mcp/tools.html) |
| 对话 | 聊天助手填写表单并运行它 | [聊天助手](../chat/) |
| 之前的作业 | 下文介绍的**重新运行** | [重新运行作业](#relaunch-a-job) |

---

## 中止作业

在列表的行菜单（⋮）中点击**中止**，或在作业页面上点击**中止作业**，可以停止状态为 `running` 的作业。确认后，
AnsibleForms 会把该作业标记为中止：

* **`ansible`**：RTE 会停止 playbook 进程（连同其所有 worker），作业以 `aborted` 结束，并显示
  `... was aborted by the operator` 。仍在等待空闲 RTE 的作业会在开始前被中止。
* **模板作业**（AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins）：AnsibleForms 请求运行器取消或停止
  该作业，作业以 `aborted` 结束。当运行器拒绝时，输出会显示 `Abort request denied` ，随后是
  `reverting abort request` ，作业继续运行。仍在队列中的 Jenkins 构建会被移出队列。
* **`workflow`**：正在运行的节点作业会被中止，不再启动任何内容（参见
  [运行工作流](../workflows/running.html#abort)）。
* **`multistep`**：尚未开始的步骤会被跳过（ `skipping: [Abort is requested]` ），主作业
  以 `aborted` 结束。已经在运行的步骤是一个独立的作业：打开它并将其中止，才能同样停止它。

您可以中止自己的作业；管理员，或者从 7.3.0 起角色设置了 `manageAllJobs` 的用户，可以中止任何作业。 `showAllJobLogs` 只让
用户能看到其他用户的作业，而不能中止它们。

---

## 重新运行作业

在列表的行菜单（⋮）中点击**重新运行**，或在作业页面上点击**重新运行作业**，可以从已结束的作业启动一个新作业。对于任何
既不是 `running` 也不在等待审批的作业，只要用户的角色设置了 `allowJobRelaunch` 角色选项，就会提供此操作。

对话框提供：

* **重新运行**：用作业运行时的值再次运行，以您的名义作为一个新作业。
* **详细模式**：以详细模式重新运行；拥有 `allowVerboseMode` 角色选项时显示。
* **重新运行前编辑值**，然后点击**编辑并重新运行**：打开预填了作业值的表单，这样您
  可以在提交前修改它们。

重新运行还要求表单允许重新运行（ `allowRelaunch` ，默认为 true），并且作业是**您自己的**，除非
您是管理员，或者从 7.3.0 起拥有 `manageAllJobs` ；在 7.2 及之前可以重新运行任何作业的 `showAllJobLogs` ，现在已不再可以。重新运行如何根据表单规则进行检查，以及为什么带有
密码字段的表单可能会拒绝重新运行，请参阅[重新运行](../launch-validation/relaunching.html)。

### 使用预填数据重新运行

**编辑并重新运行**会用 `prefillJobId` URL 参数打开表单，您也可以在自己的链接中使用该参数：

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

表单会加载作业 `61` 保存的字段值，并显示 `Form pre-filled with data from previous job #61` 。
提交后会启动一个新作业，和其他运行一样经过检查。预填遵循与重新运行相同的规则：

* **密码字段从不保存**，因此从不会被预填：请重新输入。常量也不会保存。
* 需要 `allowJobRelaunch` 角色选项，并且作业必须是您自己的（或者您是管理员，或拥有 `manageAllJobs` ）。
* 设置了 `allowRelaunch: false` 的表单不能重新运行，也不能预填：

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

在开始保存字段值之前的作业无法预填，表单会改为显示错误：

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## 批准或拒绝作业

带有[审批点](../forms/approval.html)的作业会停在 `approve` 状态并等待。它会列在其
审批人（拥有该审批某个角色的用户）的作业页面上，以便他们找到它；从 7.3.0 起，其他用户不再能看到它。

**审核审批**会提供给管理员以及拥有该审批某个角色的用户：点击作业所在的行、
行菜单中的**审核审批**，或作业页面上的**审核审批**按钮。对话框会显示审批的
消息，并填入作业的值（没有消息时显示一行通用文字），以及表单、作业 ID、运行者和
运行时间，并附带指向该作业的链接；用**拒绝**和**批准**作出回应：

* **批准**：作业继续执行，其状态恢复为 `running` 。
* **拒绝**：作业以 `rejected` 结束，其输出记录 `rejected by <username>` 。

等待审批的作业不能在作业页面上重新运行或删除；请先批准或拒绝它。

从 7.3.0 起，运行作业的用户不能批准该作业，因此总会有第二个人来审查，不过运行者仍然可以拒绝它以
撤回作业。管理员始终可以批准，包括自己的作业。如果表单的审批点设置了
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) ，其运行者也可以批准自己的作业。

---

## 删除作业

在列表的行菜单（⋮）中点击**删除**，或在作业页面上点击**删除作业**，确认后会删除作业及其输出。
删除多步骤作业时也会删除其各个步骤。要一次删除多个作业，请在列表第一列勾选它们，然后
点击上方的**删除 (n)**。

您可以删除自己的作业。管理员以及从 7.3.0 起拥有 `manageAllJobs` 角色选项的用户可以删除任何作业； `showAllJobLogs`
不再可以。设置了 `allowJobDeletion: false` 的角色不能删除任何作业，连自己的也不行，这样作业历史就能保持完整。在作业
页面上，作业正在运行或正在中止时（管理员和 `manageAllJobs` 除外）以及等待审批时，该按钮会被隐藏；在列表中，对于您不能删除的作业，
菜单项和复选框会显示为灰色。
