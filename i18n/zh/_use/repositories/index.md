---
layout: default
title: Git 仓库
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 04bcefa07810f2c0318286071624cd4a6d05e7e3
---

# Git 仓库
{: .no_toc }

把表单、playbook、设置和连接保存在 git 中
{: .fs-6 .fw-300 }

---

面向把表单、playbook 和应用配置保存在 git 中的管理员：仓库可以包含什么，以及哪个来源优先。

---

## 仓库的用途

仓库是 AnsibleForms 克隆并保持更新的 git 远程仓库，它的用途类型说明应用从中获取什么。

从 7.8.0 起，仓库的**用途**步骤把用途类型列在六个标题下：**设计器**、**作业**、**系统**、
**外观**、**访问**和**连接**。**设计器**类型是应用按原样读取的文件：

| 用途类型 | AnsibleForms 从中读取的内容 | 在仓库中的位置 |
|---|---|---|
| **表单** | 表单文件（设计器也会把它们保存回该仓库）及其变量文件 | `forms` 或根目录；变量文件在 `vars` 中 |
| **Playbook** | 作业运行的 Ansible playbook | `playbooks` 或根目录 |
| **工作流** | [工作流](../workflows/)文件，设计器也会把它们保存回该仓库 | 任意文件夹 |
| **清单** | 一个以仓库命名的清单，表单通过 `inventory:` 引用它 | 根目录： `inventory.yaml` 、 `group_vars` 、 `host_vars` |
| **类别**、**常量** | 类别和常量，设计器也会把它们保存回其文件 | 给出 `controller_categories:` 或 `controller_constants:` 的文件 |

其他所有类型都把应用的设置、用户或连接保存在 YAML 文件中，双向读写：调度、
常规设置、外观页面、用户、组和角色、登录方式、凭据、运行器以及
其他连接。它们在 [git 中的配置](config-as-code.html) 中说明。

**表单**、**工作流**和**清单**可以在多个仓库上勾选；**Playbook** 来自第一个仓库，
其他每种类型最多来自一个仓库。每个仓库都会被克隆到
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH) 下以其名称命名的子文件夹中。

7.8.0 之前的**用于配置？**开关已被**角色**、**类别**和**常量**取代，每一项都从
给出其键的文件中读取；仓库的 `config.yaml` 仍会被读取，但已弃用（参见
[角色、类别和常量](config-as-code.html#roles-categories-and-constants)）。

### 一个仓库包含所有内容

单个仓库可以包含表单、变量文件、配置和 playbook，只需勾选相应的用途类型，每类内容使用一个子文件夹。

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### 每种用途一个仓库

使用独立的仓库可以让各个团队负责自己的部分，每个仓库有自己的用途类型，文件直接放在根目录中。

| 仓库 | 用途类型 | 根目录中的内容 |
|---|---|---|
| `af-platform` | **角色**、**类别**、**常量**、**凭据**、**运行器** | `roles.yaml` 、 `categories.yaml` 、 `constants.yaml` 、 `connections.yaml` |
| `af-forms-network` 、 `af-forms-storage` | **表单** | 各团队的表单文件，合并到一个列表中 |
| `af-playbooks` | **Playbook** | playbook 和角色 |

变量文件来自第一个包含 `vars` 文件夹的表单仓库中的该文件夹。

---

## 仓库如何与本地文件夹结合

仓库内容会替代对应的本地文件夹；下表总结了每类文件从哪里读取。

| 内容 | 读取来源，以第一个匹配的为准 |
|---|---|
| 角色、类别、常量 | 每个键单独读取：1. 具有该用途类型的仓库中给出 `controller_roles:` 、 `controller_categories:` 或 `controller_constants:` 的文件 <br> 2. 该仓库的 `config.yaml` （已弃用） <br> 3. 基础配置：配置保存在数据库中时为数据库（ [`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE) ），否则为 [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| 表单 | 所有**表单**仓库加上 `FORMS_STAGING_PATH` ；只有在没有这类仓库时才使用 [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| Playbook | **Playbook** 仓库，否则为 [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| 变量文件 | 第一个包含 `vars` 文件夹的**表单**仓库中的该文件夹，否则为 [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| 工作流 | 所有**工作流**仓库加上 [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH) ，一起使用 |

来自多个仓库的表单按仓库添加的顺序读取。当其中两个仓库包含同名表单时，使用先添加的仓库中的那份，
并有一条警告指出两份副本，因此请保持表单名称在各仓库之间唯一。

---

## 故障排除

大多数问题会显示在**拉取**列以及**显示上次拉取的输出**（或**显示上次推送的输出**）中，其中包含 git 自己的
错误消息。

- [仓库克隆或拉取失败](../troubleshooting.html#a-repository-clone-or-pull-failed)：认证、已知
  主机和本地更改。
- [表单仓库尚未克隆](../troubleshooting.html#the-forms-repository-is-not-cloned-yet)：在首次克隆之前，设计器
  无法保存。
- 卡在 `running` 的仓库会被重置为 `failed` ：重启后，在下一次启动时；运行其 git 操作的节点
  停止响应 2 分钟后，一分钟内；以及无论如何在 2 小时后。请再次运行**拉取**。

---

## 本节内容

每个主题都有单独的页面：

| 页面 | 涵盖内容 |
|---|---|
| [添加仓库](adding.html) | 仓库页面、仓库的每个字段，以及在配置种子中声明仓库 |
| [认证](authentication.html) | 使用令牌的 HTTPS、使用生成密钥的 SSH，以及自定义 git 命令 |
| [拉取更改](pulling.html) | 定时、手动和 API 拉取，以及本地更改 |
| [设计器与推送](designer.html) | 在设计器中编辑表单，并将其推送到仓库 |
| [git 中的配置](config-as-code.html) | 把所有设置保存在 git 仓库中，双向读写 |
