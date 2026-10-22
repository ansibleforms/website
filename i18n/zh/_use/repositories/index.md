---
layout: default
title: Git 仓库
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Git 仓库
{: .no_toc }

把表单、变量文件、配置和 playbook 保存在 git 中
{: .fs-6 .fw-300 }

---

面向把表单、配置和 playbook 保存在 git 中的管理员：仓库可以包含什么，以及哪个来源优先。

---

## 仓库的用途

仓库是 AnsibleForms 克隆并保持更新的 git 远程仓库，每个仓库都有一些开关，用于说明它包含什么：

| 开关 | AnsibleForms 从中读取的内容 | 仓库中的文件夹 |
|---|---|---|
| **用于配置？** | 包含类别、角色和常量的 `config.yaml` | 根目录 |
| **用于表单？** | 表单文件（设计器也会把它们保存回该仓库）及其变量文件 | `forms` 或根目录；变量文件在 `vars` 中 |
| **用于 playbook？** | 作业运行的 Ansible playbook | `playbooks` 或根目录 |
| **用于工作流?** | [工作流](../workflows/)文件，设计器也会把它们保存回该仓库 | 任意文件夹 |
| **用于清单?** | 一个以仓库命名的清单，表单通过 `inventory:` 引用它 | 根目录： `inventory.yaml` 、 `group_vars` 、 `host_vars` |

没有子文件夹时，使用仓库根目录。一个仓库可以包含所有内容；如果拆分成多个仓库，只有**用于
表单**、**用于工作流**和**用于清单**可以在多个仓库上开启：其他开关只取第一个仓库，
并记录一条警告。

每个仓库都会被克隆到 [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) 下以其名称命名的子文件夹中。

### 一个仓库包含所有内容

单个仓库可以包含表单、变量文件、配置和 playbook，只需开启相应的开关，每类内容使用一个子文件夹。

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### 每种用途一个仓库

使用独立的仓库可以让各个团队负责自己的部分，每个仓库开启一个开关，文件直接放在根目录中。

| 仓库 | 开关 | 根目录中的内容 |
|---|---|---|
| `af-config` | **用于配置？** | `config.yaml` |
| `af-forms-network` 、 `af-forms-storage` | **用于表单？** | 各团队的表单文件，合并到一个列表中 |
| `af-playbooks` | **用于 playbook？** | playbook 和角色 |

只有表单可以来自多个仓库；配置和 playbook 各自只能来自一个仓库。变量文件来自第一个包含 `vars`
文件夹的表单仓库中的该文件夹。

---

## 仓库如何与本地文件夹结合

仓库内容会替代对应的本地文件夹；下表总结了每类文件从哪里读取。

| 内容 | 读取来源，以第一个匹配的为准 |
|---|---|
| 配置 | 1. 数据库，当配置保存在数据库中时（ [`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE) ） <br> 2. **用于配置**仓库中的 `config.yaml` <br> 3. 没有仓库用于配置时，**用于表单**仓库中的 `config.yaml` <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| 表单 | 所有**用于表单**的仓库加上 `FORMS_STAGING_PATH` ；只有在没有这类仓库时才使用 [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| Playbook | **用于 playbook** 的仓库，否则为 [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| 变量文件 | 第一个包含 `vars` 文件夹的**用于表单**仓库中的该文件夹，否则为 [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| 工作流 | 所有**用于工作流**的仓库加上 [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH) ，一起使用 |

来自多个仓库的表单会合并到一个列表中。当其中两个仓库包含同名表单时，保留先加载的那个，
并记录警告 `skipping duplicate form <name>` ，因此请保持表单名称在各仓库之间唯一。

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
