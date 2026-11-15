---
layout: default
title: 运行工作流
parent: 工作流
nav_order: 3
translated_from: 536c898264f954c5239764f9d4f7a2f61ea40f9d
---

# 运行工作流
{: .no_toc }

从表单运行工作流，并在作业页面上跟踪它
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 表单

[类型为 `workflow`](../forms/workflow.html) 的表单运行工作流，像指定 playbook 一样用 `workflow:` 指定：可以用
workflows 文件夹中的**文件**，包括其子文件夹（ `team/deploy-app.yml` ），也可以用文件中工作流的**名称**
（ `deploy-app` ）：

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

表单的字段会作为 extra vars 传给每个节点，其 [`credentials`](../forms/workflow.html#workflow_credentials) 也一样，使用表单
为它们指定的名称，就像多步骤表单的字段传给其各个步骤一样：

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

节点自己的凭据在工作流文件中设置，会以其自己的名称传给其 playbook，二者使用同一名称时以节点的为准。在表单的设计器可视化选项卡中，**工作流**是
设计器中工作流文件的列表。

只写文件名时，如果只有一个文件叫这个名字，也能在子文件夹中找到它。如果有两个同名的工作流，按名称引用它的表单
将无法运行，设计器会在您保存第二个时发出警告：请重命名其中一个，或者改用其文件名。找不到的工作流
会使作业以失败结束，原因写在其输出中。

---

## 作业

工作流作业在 AnsibleForms 服务器上运行，每个 playbook 节点作为一个独立的作业运行，是工作流
作业的子作业，就像多步骤表单的各个步骤一样：在 RTE 上运行设计器中的 playbook；对于带有 `runner:` 的节点，则运行该运行器在
AWX、AAP、Ascender、Semaphore、Rundeck 或 Jenkins 上的模板或作业（参见[节点在哪里运行](designer.html#where-a-node-runs)）。

作业页面会实时绘制工作流：每个节点按其状态着色，显示已触发的连接以及不会
运行的节点。顶部的信息会显示工作流名称，而不是 playbook。

- **点击已结束的节点**，可在对话框中打开其输出。
- **输出**包含每个节点的输出，每段都以 `WORKFLOW NODE [identifier] (status)` 横幅开头，按节点
  结束的顺序排列。
- 输出中每个节点的标题上，以及从图中打开的对话框中，都有**显示 Extravars** 和**显示工件**，
  用于以 JSON 或 YAML 显示该节点自己的 extravars 和工件（没有时显示 `{}` ），并带有“复制”按钮。

节点的 extravars 包含其之前的节点传下来的内容，其工件则是其 playbook 用
`set_stats` 收集的内容。这两个按钮遵循[角色选项](../config/roles.html#role-options) `showExtravars` 和
`showArtifacts` 。同样的数据也可以通过 `GET /api/v2/job/{id}/node/{nodeId}` 获取，任何有权查看该作业的人都可以。

按照 AWX 的规则，当某个节点失败且没有任何处理时，作业失败；否则作业成功。

---

## 审批

审批节点会让工作流作业暂停，直到有人回应。

当工作流到达审批节点时，作业的状态会变为**需要审批**：它会显示在铃铛图标中以及
作业页面上，与表单的[审批点](../forms/approval.html)相同。节点的名称就是审批的标题，其描述
就是消息；其余部分来自表单的 `approval` ：

- 其 `roles` 决定谁可以批准或拒绝它， `allowSelf` 决定运行者是否也可以批准它；
- 请求会发送到其 `notifications` 和 `channels` 。

没有 `approval` 的工作流表单仍会让作业在审批节点处暂停，但这时只有管理员才能批准。

- **批准**后，节点成功，工作流沿其*成功时*连接继续。
- **拒绝**后，节点失败，工作流沿其*失败时*连接继续。
- **超时**，即超过节点的超时时间仍无人回应时，节点同样失败。

---

## 中止

对正在运行的工作流作业点击**中止**会将其停止：正在运行的节点作业会被中止，不再启动任何内容，它
正在等待的审批也会被取消。正在等待审批的工作流作业同样可以中止。

---

## 从失败的节点重新运行

从 7.7.0 起，失败的工作流作业可以从失败的节点重新运行，并沿用成功的节点。

此时作业页面上的**重新运行作业**带有下拉箭头，提供**从第一个节点**（即完整的重新运行）和**从失败的节点**。新作业经过与任何
[重新运行](../jobs/actions.html#relaunch-a-job)相同的审批、启动验证和权限：

- **成功的节点**不运行任何内容。图中它们显示为灰色，标为*来自上一次运行*，输出中每个节点都有一个
  `WORKFLOW NODE [identifier] (successful) #n carried over` 横幅，没有可打开的节点输出。
- **它们传递的内容**仍会到达后续节点：它们的 `set_stats` 产物随作业保存，并照常传递下去。
- **运行**从失败的节点开始，并像第一次运行一样沿着工作流的连接继续。
- **作业页面**显示**重新运行自 #N**，旁边标有*失败的节点*，其输出以
  `ok: [Relaunch of job N from its failed node: 2 node(s) carried over]` 开头。

只有在以下条件全部满足时，AnsibleForms 工作流作业才提供**从失败的节点**；否则**重新运行作业**是普通按钮：

| 条件 | 原因 |
|---|---|
| 作业失败，且有一个节点失败、一个节点成功 | 没有可沿用的节点时，就等于完整的重新运行 |
| 作业在 7.7.0 或更高版本上运行 | 从 7.7.0 起，工作流作业会保存每个节点结束时的状态及其传递的内容 |
| 工作流与作业运行时相同 | 作业保存了工作流的哈希：节点、连接、extra var 或名称有变化时，只提供完整的重新运行 |

在 Ascender 上运行的工作流作业使用 Ascender 自身的失败节点重新运行，同样会沿用成功的节点。AWX 和 AAP 没有这样的重新运行，
因此它们的工作流作业与多步骤作业一样，只提供完整的重新运行。
