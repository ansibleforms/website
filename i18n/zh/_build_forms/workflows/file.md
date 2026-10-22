---
layout: default
title: 工作流文件
parent: 工作流
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# 工作流文件
{: .no_toc }

工作流语法、节点类型以及每个节点的运行设置
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 工作流文件存放在哪里

工作流文件是位于本地 workflows 文件夹以及每个用于工作流的仓库中的 YAML 文件。

- **本地文件夹**是 [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH) ，默认为持久化文件夹下的
  `workflows` 。
- 开启了**用于工作流?** 的**仓库**会被整体读取，因此其工作流文件可以放在任意文件夹中。
  设计器会把它们保存回该仓库，**推送**则把它们发送到远程仓库。

每个包含 `workflow_job_templates` 的 YAML 文件都会被读取，最深可达六层文件夹，并且一个文件可以包含多个
工作流。表单通过 `name` 引用工作流，因此请保持名称唯一：当两个工作流同名时，运行它的作业
会失败，并提示您重命名其中一个。

---

## 语法

工作流文件采用 AWX 导出的语法编写，节点位于 `related.workflow_nodes` 之下：

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

`awx.awx` 集合的格式同样可以读取：直接位于工作流之下的 `workflow_nodes` ，以及以普通字符串
（ `inventory: staging` ）而不是映射（ `inventory: {name: staging}` ）书写的名称。

### 工作流

除了节点之外，工作流条目还有几个自己的键：

| 键 | 含义 |
|---|---|
| `name` | 工作流的名称，即表单的 `workflow:` 所引用的名称 |
| `description` | 它的用途，在设计器中显示 |
| `extra_vars` | 每个节点都会收到的变量；表单的值优先于它们 |
| `related.workflow_nodes` | 节点 |

### 节点

每个节点都有一个标识符、它运行的内容以及它的连接：

| 键 | 含义 |
|---|---|
| `identifier` | 节点的 ID：字母、数字、点、短横线、冒号和下划线，在工作流中唯一 |
| `unified_job_template.type` | 节点运行的内容：参见[节点类型](#node-types) |
| `unified_job_template.name` | 它运行的 playbook、工作流、审批或仓库 |
| `related.success_nodes` | 当该节点成功时运行的节点 |
| `related.failure_nodes` | 当该节点失败时运行的节点 |
| `related.always_nodes` | 当该节点结束时运行的节点，无论成功与否 |
| `all_parents_must_converge` | `true` ：节点等待所有指向它的连接都触发，而不只是其中一个 |

连接必须向前：连接形成循环的工作流不会运行。

---

## 节点类型

节点运行以下四种内容之一，名称与 AWX 中的一致：

| 类型 | 节点运行的内容 |
|---|---|
| `job_template` | 设计器中的某个 playbook，作为 RTE 上的独立作业运行；或者在带有 `runner:` 时，运行该运行器的模板或作业 |
| `workflow_job_template` | 另一个工作流，作为子工作流作业运行；工作流最多可嵌套五层 |
| `workflow_approval_template` | 审批：工作流作业会等待，直到有人批准或拒绝 |
| `project` | 拉取它所指定的仓库（即 AWX 的项目更新） |

审批节点的 `unified_job_template.timeout` 以秒为单位。超时仍无人回应时，节点失败； `0` 或不设
超时则无论多久都会等待回应。被拒绝的审批会使节点失败，工作流随后沿着其
连接继续执行。

---

## 运行设置

`job_template` 节点直接在节点上接受 AWX 节点的设置：

| 键 | 作用 |
|---|---|
| `inventory` | playbook 针对其运行的清单，按名称指定，与表单的 `inventory:` 相同 |
| `related.credentials` | 凭据：每个凭据都以其自己的名称传给 playbook，第一个 *SSH* 凭据同时也是 ansible 连接时使用的登录凭据。vault 凭据只用于打开 vault |
| `limit` | 只在这些主机上运行（ `--limit` ） |
| `job_tags` | 只运行带有这些标签的任务（ `--tags` ） |
| `skip_tags` | 跳过带有这些标签的任务（ `--skip-tags` ） |
| `verbosity` | `0` 到 `5` ： `-v` 的个数 |
| `diff_mode` | `true` ：显示变更（ `--diff` ） |
| `job_type` | `check` ：试运行（ `--check` ）； `run` 或不设置：真实运行 |
| `extra_data` | 该节点收到的变量，优先级低于工作流的 `extra_vars` 和表单的值 |

节点的作业会把表单的值作为 extra vars 收到。表单的值优先于工作流的 `extra_vars` ，而后者又优先于
节点的 `extra_data` ，就像 AWX 中调查问卷的回答一样。

---

## AnsibleForms 专有的键

节点有三个键是 AnsibleForms 专有的，AWX 会忽略它们，因此工作流可以做到多步骤表单能做的事：

| 键 | 作用 |
|---|---|
| `runner` | 在 `job_template` 节点上，运行该运行器的模板或作业，而不是设计器中的 playbook：AWX、AAP、Ascender、Semaphore、Rundeck 或 Jenkins。RTE 运行器则在该处运行节点的 playbook。一个工作流可以混用它们。 |
| `if_extra_var` | 只有当此 extra var 为 `true` 时节点才运行，与多步骤表单步骤的 `ifExtraVar` 相同。条件不满足时，节点被跳过，其后的内容按成功后的情况运行。不适用于审批节点，审批节点始终运行。 |
| `extra_vars_key` | 节点只收到 extra vars 中的这个键，并复制进用户信息，与多步骤表单步骤的 `key` 相同 |

在模板运行器上， `unified_job_template.name` 是要运行的模板或作业，节点的 `limit` 、 `job_tags` 、检查
模式和差异模式会像该运行器类型的表单那样传递。大于 `0` 的 `verbosity` 会开启表单的
`verbose` ，而 `skip_tags` 不会传递。只有 AWX 运行器（AWX、AAP 或 Ascender）会收到节点的清单，并把
凭据作为其 AWX 凭据；Semaphore、Rundeck 和 Jenkins 则把凭据作为表单的 `credentials` 收到。
