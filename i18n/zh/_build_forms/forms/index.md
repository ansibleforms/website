---
layout: default
title: 表单
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# 表单
{: .no_toc }

定义用户要填写的表单
{: .fs-6 .fw-300 }

---

面向表单作者：表单如何用 YAML 编写、从哪里加载，以及每种表单类型的属性。

表单是 AnsibleForms 的核心。每个表单都是一个网页界面，用于收集用户输入，并利用这些数据运行
Ansible playbook、AWX、AAP 或 Ascender 模板、Semaphore 模板、Rundeck 或 Jenkins 作业，或者一个
[工作流](../workflows/)。

表单定义在 forms 文件夹中的 YAML 文件里。每个 YAML 文件包含一个表单或一个表单列表，并且可以用子文件夹来组织它们。

**视频**：[创建您的第一个表单](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## 了解表单结构

AnsibleForms 中的每个表单都通过一组属性来配置。**[通用属性](common.html)** 列出了适用于所有表单类型的属性；各类型专属页面介绍其余的属性。

---

## 表单的加载方式

AnsibleForms 从以下位置加载表单：

1. **从仓库加载**：所有开启了“用于表单”开关的仓库（支持多个仓库）
   - 所有已启用仓库中的表单会自动合并。
   - 每个仓库首先检查是否有 `forms/` 子文件夹。
   - 如果没有 `forms/` 子文件夹，则使用仓库根目录。
   - 在设计器中创建但尚未推送的表单保存在暂存文件夹中
     （ [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) ），并与它们一起加载。

2. **从本地文件夹加载**：当没有仓库开启“用于表单”时，使用本地 `forms/` 文件夹
   （ [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) ）

{: .warning }
> **注意：** 在多个仓库上开启“用于表单”时，它们的所有表单都会合并。表单名称在各仓库之间必须唯一，以避免冲突。

---

## 表单在哪里运行

表单的类型决定了其作业在哪类[运行器](../runners.html)上运行： `ansible` 使用 RTE， `awx` 、
`aap` 和 `ascender` 使用 AWX 运行器， `semaphore` 、 `rundeck` 和 `jenkins` 则使用各自类型的运行器。

- 在表单上设置 `runner: <name>` ，可按名称选择该类型的某个运行器；不设置时，作业在该类型的默认运行器上运行。
- 如果运行器在**连接 > 运行器**中被禁用，作业就会失败，无论是表单指定了它，还是它是默认运行器。作业
  永远不会退回到其他运行器。
- 当用户的某个角色在 `config.yaml` 中列出了 `runners` 时，作业只能在这类角色所列的运行器上运行，否则会被
  拒绝。没有该列表的角色不做限制，管理员也从不受限。

---

## 本节内容

以下页面详细介绍表单属性：

| 页面 | 涵盖内容 |
|---|---|
| [通用属性](common.html) | 适用于所有表单类型的属性（ `name` 、 `description` 、 `help` 、 `type` 、 `fields` ） |
| [Ansible 表单](ansible.html) | `type: ansible` 特有的属性 |
| [AWX 表单](awx.html) | `type: awx` 特有的属性 |
| [Semaphore 表单](semaphore.html) | `type: semaphore` 特有的属性，用于运行 Semaphore 模板 |
| [Rundeck 表单](rundeck.html) | `type: rundeck` 特有的属性，用于运行 Rundeck 作业 |
| [Jenkins 表单](jenkins.html) | `type: jenkins` 特有的属性，用于构建 Jenkins 作业 |
| [多步骤表单](multistep.html) | `type: multistep` 特有的属性，已弃用，建议改用 `workflow` |
| [工作流表单](workflow.html) | `type: workflow` 特有的属性，用于运行[工作流](../workflows/) |
| [向导](wizard.html) | 把表单的输入拆分到多个页面（适用于任何可执行的表单类型） |
| [子表单](subform.html) | 子表单只使用通用属性 |
| [审批点](approval.html) | 暂停作业，直到获得批准（ `approval` ） |
| [通知](notifications.html) | 在作业状态变化或发生事件时发送邮件和通道消息（ `notifications` ） |
| [作业状态动作](job-status-action.html) | 在作业状态变化时对表单执行操作（ `onSubmit` 、 `onSuccess` ……） |
