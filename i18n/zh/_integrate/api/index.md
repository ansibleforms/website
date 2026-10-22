---
layout: default
title: REST API
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# REST API
{: .no_toc }

通过脚本启动表单和管理 AnsibleForms
{: .fs-6 .fw-300 }

---

面向开发人员和自动化工程师：通过脚本启动表单和管理 AnsibleForms。

Web 界面所做的一切都经过 REST API，因此脚本和其他工具也可以做同样的事。

---

## 概述

API 由 AnsibleForms 服务器在 `/api/v2` 下提供：

* **完整参考**：这些页面介绍脚本最常用的内容。所有端点都在服务器内置的
  Swagger 页面 `https://<your server>/api/v2/docs` 上有说明，并可直接试用。
* **权限**：调用以其令牌所属用户的身份运行，使用该用户的角色，与浏览器中相同。
* **运行验证**：通过 API 启动的作业可以像浏览器中的启动一样接受检查
  （参见 [运行验证](../launch-validation/)）。
* **速率限制**：只有登录、注销、令牌刷新和单点登录端点、修改密码
  （`PUT /api/v2/profile`）以及 API 令牌端点（`POST` 和 `DELETE /api/v2/profile/tokens`）受到限制（参见
  [身份验证](authentication.html)）。其他调用没有速率限制（[聊天助手](../chat/) 有其自身的
  限制），因此脚本应自行控制节奏，例如在跟踪作业时。

---

## 本节内容

每个主题都有单独的页面：

| 页面 | 内容 |
|---|---|
| [身份验证](authentication.html) | 登录、刷新令牌或使用长期令牌 |
| [作业](jobs.html) | 启动表单、跟踪作业、中止、重新运行或批准作业 |
| [响应和错误](responses.html) | 响应的结构以及状态码 |
| [实时事件](events.html) | 在作业和设置发生变化时收到通知，而不必轮询 |
