---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

所有表单共用的类别、角色和常量
{: .fs-6 .fw-300 }

---

面向管理员：config.yaml 文件保存所有表单共用的类别、角色和常量。

AnsibleForms 使用 config.yaml 文件来配置类别、角色和常量。如果没有提供该文件，会生成一个包含最小配置的文件。也可以将配置导入数据库，这样就不再需要 config.yaml 文件。

---

## 概述

config.yaml 文件包含 AnsibleForms 使用的类别、角色和常量的配置。

**视频**：[创建您的第一个表单](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

下面这个最小的 config.yaml 可以作为起点。它只包含必需的 `Default` 类别，以及必需的 `admin` 和 `default` 角色。

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## 配置加载优先级

AnsibleForms 按以下顺序加载 config.yaml 文件（先匹配者优先）：

1. **来自数据库**：导入到数据库中的配置，仅当 `ENABLE_CONFIG_IN_DATABASE=1` 时，或该
   变量未设置且数据库中保存的配置来源为 `database` 时使用（空副本会回退到文件）
2. **来自仓库（use_for_config）**：启用了“用于配置”开关的仓库（6.1.0 新增）
3. **来自仓库（use_for_forms）**：启用了“用于表单”开关的仓库（为向后兼容而保留的回退）
4. **来自本地文件**：本地 `config.yaml` 文件（CONFIG_PATH 环境变量）

{: .warning }
> **注意：** 只在一个仓库上启用“用于配置”。如果有多个仓库启用了它，会记录一条警告，并使用第一个。

---

## 本节内容

该文件有三个顶层属性，每个属性都有自己的页面：

| 页面 | 内容 |
|---|---|
| [类别](categories.html) | 在仪表板上用带图标的类别树对表单进行分组 |
| [角色](roles.html) | 将用户和组映射到角色，并设定每个角色可以做什么 |
| [常量](constants.html) | 所有表单都可以复用的自由对象 |
