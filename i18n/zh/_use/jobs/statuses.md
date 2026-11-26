---
layout: default
title: 状态和类型
parent: 作业
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | playbook 已完成，但[需要关注](#a-job-that-needs-attention)：需要有人跟进处理。或者多步骤作业已完成，但某个设置了 `continue` 的步骤失败了 | 在作业页面查看原因、跟进处理、重新运行、删除 |
| `aborted` | 作业在 AnsibleForms 中被中止，或者 AWX / AAP 作业被取消 | 查看输出、重新运行、删除 |
| `rejected` | 审批人拒绝了该作业；它从未运行 | 查看输出、重新运行、删除 |
| `abandoned` | AnsibleForms 停止跟踪该作业（参见[已放弃的作业](cleanup.html#abandoned-jobs)） | 检查受管主机、重新运行、删除 |

`running` 为蓝色， `success` 为绿色并显示为**成功**， `failed` 为红色。 `approve` 为橙色并显示为**等待审批**，
这样等待人工处理的作业就与已停止的作业区分开来； `warning` 显示为**需要关注**，它与 `aborted` 和 `rejected` 一样为琥珀色。 `abandoned` 为
灰色：没有人停止它，只是运行它的东西已经不在了。

---

## 需要关注的作业

从 7.8.0 起，如果 playbook 按设计完成，但给操作员留下了工作（在别处审批、一个手动步骤、部分应用），它可以让作业以**需要关注**
（ `warning` ）结束并附带一条消息，而不是以看起来像自动化出错的 `failed` 结束，或以掩盖剩余工作的 `success` 结束。playbook 可以通过
以下两种方式之一表明这一点：

* 在 RTE 上，playbook 旁边的**状态文件** `<playbook_dir>/.joblogs/job_status_<jobid>.yml` （或 `.yaml` ）。RTE 在 playbook
  结束后读取它，然后将其删除
* 在 RTE 以及 AWX、AAP 或 Ascender 上，使用键为 `af_job_status` 的 **`set_stats`**

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms 会在 extravars 中传递 `__jobid__` ，因此 playbook 可以构建该文件的路径。如果 playbook 两种方式都用了，以文件为准。

* 只有**成功**的 playbook 才能以需要关注结束：失败的作业仍为 `failed` ，已中止的作业仍为 `aborted` ，无论文件中写了什么
* 无效的文件（没有消息、其他状态、损坏的 YAML）会被忽略：作业仍为成功，其输出会在一行 `[WARNING]` 中说明原因
* 消息显示在作业页面的琥珀色框中（详细信息以 YAML 形式折叠在其下方），显示为列表中状态的工具提示，并显示在作业的最后一行输出中。
  作业菜单中**过去**下的**需要关注**会列出这些作业
* 带有 `onStatus: [warning]` 的[通知](../forms/notifications.html)会针对这些作业发送；邮件和通道会携带该消息，webhook 则通过
  [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html) 携带
* 在多步骤作业中，需要关注的步骤视为通过，下一个步骤会运行；随后整个多步骤作业也需要关注。在[工作流](../workflows/)中，该作业对
  下一个节点而言视为成功

Semaphore、Rundeck 和 Jenkins 的作业不能以需要关注结束。

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
