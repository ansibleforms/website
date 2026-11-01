---
layout: default
title: 运行器
nav_order: 12
has_children: true
has_toc: false
permalink: /runners.html
translated_from: e6663cf2e7dc14a1559383c7f49fd968a4cbf635
---

# 运行器
{: .no_toc }

作业的运行位置：用于 playbook 的运行时环境容器，以及用于模板的 AWX、AAP、Ascender、Semaphore、Rundeck 或 Jenkins
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：添加运行作业的运行器，为每种类型选择默认运行器，批准请求加入的 RTE，并对它们进行测试。

---

## 本节内容

| 页面 | 内容 |
|---|---|
| [运行器页面](runners/list.html) | 运行器列表、添加运行器、打开或关闭运行器，以及每种类型的默认运行器 |
| [运行器类型](runners/types.html) | 运行器可以是哪些产品，以及它们的地址和登录方式 |
| [注册](runners/registration.html) | RTE 如何请求加入并获得批准、用于无人值守安装的加入令牌，以及数据库模式 |
| [单个运行器的页面](runners/runner-page.html) | 运行器的各个选项卡、RTE 的模式和连接，以及测试连接 |
| [谁管理运行器](runners/permissions.html) | 谁可以添加、修改和测试运行器 |


---

## 工作原理

从版本 7 起，应用本身不运行任何东西：每个作业都在 **运行器** 上运行，运行器在 **连接 > 运行器** 下添加。
表单的类型决定它需要哪种类型的运行器：

| 表单类型 | 运行在以下类型的运行器上 | 运行的内容 |
|---|---|---|
| `ansible` | RTE | 在运行时环境容器中运行的 playbook |
| `awx`、`aap`、`ascender` | AWX（包括 AWX、AAP 和 Ascender 几种产品） | 作业模板或工作流模板 |
| `semaphore` | Semaphore | Semaphore UI 模板 |
| `rundeck` | Rundeck | Rundeck 作业 |
| `jenkins` | Jenkins | Jenkins 作业 |

`workflow` 或 `subform` 表单没有自己的运行器：[工作流](workflows/) 的每个节点各自选择运行器。带有
`runner:` 的节点在该运行器上运行（RTE，或 AWX、Semaphore、Rundeck 或 Jenkins 上的模板或作业），其他节点则在
默认 RTE 上运行，因此同一个作业的各个节点可以在不同的运行器上运行。自 7 起已弃用、由工作流取代的
`multistep` 表单也是如此：它的每个步骤都在其自身类型所需的运行器上运行。

表单通过以下两种方式之一选择运行器：

- **按名称**：在表单、工作流节点或已弃用的多步骤表单的某个步骤上使用 `runner: <name>`（也可以在
  设计器的表单设置中设置）。运行器必须是表单所需的类型，否则作业会失败。旧的 `awx: <name>`
  仍然有效，会记录一条弃用警告，并将在 8 中移除。
- **作为默认值**：未指定运行器的表单在其类型的默认运行器上运行。没有默认运行器时，作业会失败，
  并显示一条说明需要添加哪种类型运行器的消息。

在 **连接 > 运行器** 下关闭的运行器不会接收任何作业，无论是按名称还是作为默认值：作业会失败，并提示启用它
或指定另一个运行器（参见 [默认与已启用](runners/list.html#default-and-enabled)）。

