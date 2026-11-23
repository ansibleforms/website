---
layout: default
title: Ansible 自己的布局
parent: Git 仓库
nav_order: 6
translated_from: ea915eac819df2b716a2a5bdb21e4884d44c6ca4
---

# 采用 Ansible 自己布局的仓库
{: .no_toc }

像 AWX 一样，从仓库的根目录运行表单的 playbook
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向把 playbook 放在按 Ansible 文档所述布局组织的仓库中的管理员和表单作者，自 7.8.0 起。

---

## 布局

Ansible 自己的布局把配置、清单、playbook 和角色并排放在仓库的根目录。

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

playbook 位于 `playbooks/`，角色位于 `roles/`，因此 Ansible 通过根目录的 `ansible.cfg` 找到角色，而只有当
`ansible-playbook` 在该文件夹中启动时，Ansible 才会读取它：

```ini
[defaults]
roles_path = ./roles
```

`ansible.cfg` 中的相对路径从包含它的文件夹读取，因此 `collections_path = ./collections` 也以同样方式生效。AWX 从项目的
根目录运行项目的 playbook，自 7.8.0 起表单也可以这样做。

---

## 在表单中指定仓库

`ansible` 表单用 `playbookRepository` 指定运行其 playbook 的仓库。

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

此时，无论 playbook 位于哪个文件夹，作业都从 `infra` 的根目录运行：

| 内容 | 读取位置 |
|---|---|
| `ansible.cfg` | 仓库的根目录，包括其 `roles_path`、 `collections_path` 及其他所有设置 |
| `playbook` | 根目录： `playbooks/site.yml`，而不是 `site.yml` |
| 相对路径的 `inventory` 或 `__inventory__` | 根目录： `inventories/production/hosts.yaml` |
| `playbookSubPath` | 仍然移动运行文件夹，现在从根目录算起 |

按名称指定的清单（`inventory: production`）仍然是设计器中的某个[清单](../designer/)，与以前相同。该仓库必须具有
**Playbook** 用途类型：如果名称不是用于 playbook 的仓库，作业会失败，并显示 `playbookRepository '<name>' is not a repository used for playbooks`。

[多步骤表单](../forms/multistep.html)的 `ansible` 步骤指定自己的 `playbookRepository`，
[工作流](../workflows/file.html#ansibleforms-own-keys)的 playbook 节点则以 `playbook_repository` 指定。

---

## 表单所在的仓库

自 7.8.0 起，与其 playbook 放在同一仓库中的表单用 `__self__` 指定该仓库，而不必重复其名称。

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` 是读取表单的仓库，与表单指定的任何仓库一样，它必须具有 **Playbook** 用途类型。在工作流的 playbook 节点上，
`playbook_repository: __self__` 是工作流文件所在的仓库。

本地表单文件夹中的表单不在任何仓库中，因此其 `__self__` 不指向任何仓库。此时该表单会出现一个指明它的加载错误
`Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none`，其运行会被拒绝，并说明原因。
本地工作流文件夹的文件中，节点的 `__self__` 会使该节点的作业失败。

---

## 多个 playbook 仓库

自 7.8.0 起，多个仓库可以具有 **Playbook** 用途类型；以前只使用第一个仓库，并给出警告。

| 表单 | 其 playbook 的运行位置 |
|---|---|
| 没有 `playbookRepository` | 按添加顺序的第一个用于 playbook 的仓库：其 `playbooks` 文件夹，否则为其根目录，与 7.8.0 之前完全相同 |
| 带有 `playbookRepository: <name>` | 该仓库的根目录，包括第一个仓库 |

因此，指定第一个仓库的表单会从其根目录运行，并从那里给出其 `playbook`（`playbooks/site.yml`）。
未指定仓库的表单照旧运行。

---

## 在设计器中

设计器在表单和工作流节点上提供仓库以及与之对应的 playbook。

| 位置 | 显示内容 |
|---|---|
| 表单的**可视化**选项卡 | **Playbook** 上方的**仓库**，在有多个 playbook 仓库或表单指定了仓库时显示。其第一个选项**第一个 playbook 仓库**会删除该键；第二个选项**此表单的仓库 (name)**会写入 `__self__` |
| **Playbook** | 所选仓库的 playbook，以从其根目录起的名称列出；选择**第一个 playbook 仓库**时，列出第一个仓库的 playbook，名称与运行时相同 |
| 工作流的 playbook 节点 | **如何运行**选项卡上同样的**仓库**字段（`__self__` 对应**此工作流的仓库 (name)**），以及**运行什么**上该仓库的 playbook |
| **Playbook** 部分 | 第一个仓库的 playbook，取自其 `playbooks` 文件夹（否则为根目录），然后是其他每个仓库的全部内容，位于以其命名的文件夹中 |

[**编辑所有 playbook**](../designer/#limited-designers) 角色选项按仓库和路径计算 playbook：运行 `infra` 的
`playbooks/site.yml` 的表单使用的是该文件，而不是第一个仓库的 `site.yml`。

---

## 在 RTE 运行器上

[RTE](../rte/) 在其任一[文件模式](../rte/modes.html)下都会收到作业指定的仓库。

- 在 `RTE_FILES=transfer`（默认）下，应用发送表单指定的整个仓库（打包），而不是第一个仓库的 `playbooks` 文件夹。
- 在 `RTE_FILES=local` 下，RTE 从它自己在 `REPO_PATH` 下的该仓库克隆运行。

要运行指定了仓库的表单，RTE 必须是 7.8.0 或更高版本。AWX、Semaphore、Rundeck 和 Jenkins 运行器运行它们自己的模板和作业：
`playbookRepository` 不是这些表单的键，这类运行器上的工作流节点也没有它。

---

## 示例：一个表单适用于所有环境

下面的表单针对用户所选环境的清单，运行 `infra` 的 `playbooks/site.yml`。

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

对于 **production**， `__inventory__` 字段给出清单 `inventories/production/hosts.yaml`，从 `infra` 的根目录读取，
连同其旁边的 `group_vars`。 `site.yml` 的角色通过 `ansible.cfg` 中的 `roles_path` 来自 `roles/`。

---

## 7.8.0 之前的同一示例

在 7.8.0 之前，表单只能用 `playbookSubPath: ../` 跳出唯一一个 playbook 仓库的 `playbooks` 文件夹。

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

它同样从根目录运行，但有以下限制，而 `playbookRepository` 消除了这些限制：

- 只能访问第一个用于 playbook 的仓库，因此 Ansible 布局必须是那个仓库。
- 设计器的 playbook 列表显示取自 `playbooks` 文件夹的 `site.yml`，因此 `playbooks/site.yml` 需要手动输入。
- 在 `RTE_FILES=transfer`（默认）下，RTE 只收到 `playbooks` 文件夹，因此 `../` 无法访问 `ansible.cfg`、角色和清单：
  它只在 `RTE_FILES=local` 下有效。

把这样的表单迁移到 7.8.0，只需把 `playbookSubPath: ../` 替换为 `playbookRepository: <name>`； `playbook` 和
`__inventory__` 保持不变。
