---
layout: default
title: 什么是 AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# 什么是 AnsibleForms
{: .no_toc }

位于 Ansible 和 AWX 之前的自助服务表单，以及何时需要它们
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 它做什么

AnsibleForms 在 playbook、工作流，或 AWX、AAP、Ascender、Semaphore、Rundeck
或 Jenkins 上的模板或作业之前放置一个 Web 表单，让人们无需命令行即可运行自动化。

表单收集输入、检查输入、将其整理为 extravars 并启动作业。表单中的数据可以来自数据库、
REST API、文件和其他字段，每次启动及其输出都会记录在作业历史中。

---

## 典型用途

团队使用 AnsibleForms 把日常自动化交给提出请求的人：

* **自助服务请求**：虚拟机、存储卷、共享或用户账户，由请求者自行填写
* **受保护的操作**：带有审批点的操作，作业运行前需要第二个人签字确认
* **数据驱动的选择**：从 CMDB、数据库或 REST API 填充的下拉框，并从一个字段级联到下一个字段
* **周期性作业**：稍后运行或按 cron 调度运行的表单，每次都使用同样经过验证的输入
* **面向工具和代理的自动化**：REST API、MCP 服务器和聊天助手启动的都是同样的表单

---

## AnsibleForms 还是 AWX survey？

AWX、AAP 和 Ascender 有它们自己的 survey。选择哪一个，取决于启动作业的人需要什么。

在以下情况下，**survey** 就足够了：

* 问题是固定的：文本、数字、密码以及来自静态列表的选项
* 用户已经在使用 AWX、AAP 或 Ascender，其权限模型适合他们
* 您不想再运行和维护另一个应用和数据库

在以下情况下，**AnsibleForms** 会有所帮助：

* 选项来自其他地方：数据库、REST API、文件或另一个字段（级联下拉框）
* 输入在到达 playbook 之前需要验证、结构化（列表、嵌套对象）或计算值
* 作业需要审批点、调度，或者需要从一个表单串联 playbook、模板和审批的工作流
* 用户完全不应该看到 AWX，或者您还要在没有 AWX 的情况下运行 playbook

AnsibleForms 可以启动 AWX、AAP 和 Ascender 模板，因此二者可以协同工作：表单收集并整理输入，
AWX 继续负责运行作业。

---

## 下一步去哪里

本节其余部分会在您安装之前解释各个组成部分：

| 页面 | 内容 |
|---|---|
| [工作原理](how-it-works.html) | 架构、一次启动的各个步骤，以及数据保存在哪里 |
| [界面导览](gui/) | 每个页面的截图，从登录到管理页面 |
| [概念](concepts.html) | 本文档中使用的术语 |
| [前提条件](prerequisites.html) | 安装之前您需要准备什么 |
