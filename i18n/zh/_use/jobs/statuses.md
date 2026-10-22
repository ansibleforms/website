---
layout: default
title: 状态和类型
parent: 作业
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# 状态和类型
{: .no_toc }

作业可能具有的每种状态，以及作业的种类
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 作业状态

AnsibleForms 会为作业设置以下状态。列表中每种状态都显示为一个彩色标签：

| 状态 | 含义 | 您可以做什么 |
|---|---|---|
| `running` | 作业正在运行，或者已批准的作业已恢复执行 | 跟踪其输出，中止它 |
| `approve` | 作业在运行之前（或多步骤作业的某个步骤运行之前）停在[审批点](../forms/approval.html)等待 | 如果您的某个角色是审批人，可以批准或拒绝它 |
| `success` | playbook、模板或每个步骤都已无错误地完成 | 查看输出、重新运行、删除 |
| `failed` | 作业以错误结束，或者运行本身失败 | 查看输出了解原因、重新运行、删除 |
| `warning` | 多步骤作业已完成，但某个设置了 `continue` 的步骤失败了 | 查看输出、重新运行、删除 |
| `aborted` | 作业在 AnsibleForms 中被中止，或者 AWX / AAP 作业被取消 | 查看输出、重新运行、删除 |
| `rejected` | 审批人拒绝了该作业；它从未运行 | 查看输出、重新运行、删除 |
| `abandoned` | AnsibleForms 停止跟踪该作业（参见[已放弃的作业](cleanup.html#abandoned-jobs)） | 检查受管主机、重新运行、删除 |

`running` 为蓝色， `success` 为绿色并显示为**成功**， `failed` 为红色。 `approve` 为橙色并显示为**等待审批**，
这样等待人工处理的作业就与已停止的作业区分开来； `warning` 、 `aborted` 和 `rejected` 为琥珀色。 `abandoned` 为
灰色：没有人停止它，只是运行它的东西已经不在了。

---

## 作业类型

作业类型取决于启动该作业的表单的 `type` ，与列表和作业页面上显示的一致：

| 显示的类型 | 运行的内容 |
|---|---|
| `ansible` | 在 RTE 上运行的 Ansible playbook |
| `awx` 、 `aap` 、 `ascender` | AWX、AAP 或 Ascender 上的作业模板或工作流模板 |
| `semaphore` | Semaphore UI 上的模板 |
| `rundeck` 、 `jenkins` | Rundeck 或 Jenkins 上的作业 |
| `workflow` | 一个[工作流](../workflows/)，其 playbook 节点作为其下的独立作业运行 |
| `multistep` | 已弃用，请使用 `workflow` ：一系列步骤，每个步骤都作为主作业下的独立作业记录 |

模板作业以 `awx` 作业的形式保存（在 REST API 中也是如此），并显示其所运行的运行器类型，无论
表单如何称呼它：在 AAP 运行器上运行的 `awx` 类型表单会显示 `aap` 。

表单方面的内容请参阅 [Ansible 表单](../forms/ansible.html)、[AWX 表单](../forms/awx.html)、[工作流表单](../forms/workflow.html)和
[多步骤表单](../forms/multistep.html)。
