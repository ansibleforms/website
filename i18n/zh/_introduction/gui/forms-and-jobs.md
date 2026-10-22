---
layout: default
title: 表单和作业
parent: 界面导览
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# 表单和作业
{: .no_toc }

登录、仪表板、填写表单以及跟踪其作业
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 登录

用户身份验证页面，支持本地、LDAP、Entra ID 和 OIDC 身份验证。

![登录](../assets/screenshots/login.jpg)

---

## 仪表板

主仪表板按类别显示所有可用的表单。

![仪表板](../assets/screenshots/dashboard.jpg)

---

## 一个表单

一个带有外部数据源和动态字段的表单示例。

![表单示例](../assets/screenshots/form.jpg)

---

## 表单 JSON 预览

在运行作业之前，预览传给 Ansible 的 JSON payload 和额外变量。

![表单 JSON 预览](../assets/screenshots/form-json.jpg)

---

## 运行中的作业

实时执行 Ansible playbook，并显示实时输出。

![运行中的作业](../assets/screenshots/run.jpg)

---

## 作业输出

已执行的 Ansible playbook 的完整输出。

![作业输出](../assets/screenshots/job-output.jpg)

---

## 作业日志

所有作业及其状态和时间，可从左侧菜单按状态筛选。

![作业日志](../assets/screenshots/job-log.jpg)

---

## 多步骤

一个多步骤作业，每个步骤的输出都位于主作业之下。多步骤表单自 7 起已弃用：
改由 [工作流](../workflows/) 来串联 playbook、模板和审批。

![多步骤表单](../assets/screenshots/multistep.jpg)

---

## 调度

安排表单在特定时间或按特定间隔运行。[cron 示例](../faq.html#which-cron-expressions-can-i-use) 列出了常用的
表达式，并说明了调度在哪个时区运行。

![调度](../assets/screenshots/schedules.jpg)
