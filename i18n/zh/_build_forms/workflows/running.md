---
layout: default
title: 运行工作流
parent: 工作流
nav_order: 3
translated_from: 1883c268cde716170bdb84c7f2df49e9122dc55d
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
