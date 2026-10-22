---
layout: default
title: 用户和组
nav_order: 15
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 8ed4dc089c64e091636c29884af1cd1002eb40aa
---

# 用户和组
{: .no_toc }

本地用户和组、与之并列的 LDAP 和单点登录用户和组，以及阻止登录
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：在 **设置 > 访问 > 用户** 和 **组** 下管理谁可以登录，需要 `showSettings` 角色选项。

内置管理员、登录顺序以及本地账户的角色映射见 [本地账户](authentication/local.html)。

---

## 本节内容

| 页面 | 内容 |
|---|---|
| [本地用户](users-and-groups/local-user.html) | 添加本地用户，以及其页面的各个选项卡 |
| [多个组](users-and-groups/several-groups.html) | 属于多个组的本地用户及其角色 |
| [本地组](users-and-groups/local-group.html) | 本地组的页面及其选项卡 |
| [目录用户和组](users-and-groups/directory.html) | LDAP、Entra ID 和 OIDC 的用户和组，按最近一次所见记录 |
| [阻止登录](users-and-groups/blocking-a-sign-in.html) | 允许登录：在不删除任何内容的情况下阻止用户 |


---

## 列表

**用户** 和 **组** 列表显示本地用户和组，以及与之并列的 LDAP 和单点登录用户和组。

LDAP、Entra ID 或 OIDC 的用户或组在登录过（或在某次登录中出现过）之后，或者被某个角色引用之后，就会出现在列表中。
**来源** 列说明每一项来自哪里：本地、LDAP、Microsoft Entra ID 或 OIDC。从 7.3.0 起，**用户** 列表还
有一个 **上次登录** 列，说明每个用户上次登录的时间。

点击某一行会打开对应用户或组的页面。**添加用户** 和 **添加组** 创建本地用户或组。

---

## 授予管理员权限的账户

config.yaml 中的 admin 角色引用本地组和用户，因此只有管理员才能修改它所引用的账户和组。

拥有 `showSettings` 但没有 admin 角色的用户，不能修改、阻止、重新分组、设置密码或删除
admin 角色所引用的本地账户（无论是直接引用还是通过其所属的某个组引用）。他们也不能创建、重命名或删除
admin 角色所引用的组，或将用户加入这样的组。映射到 admin 角色的 LDAP 或 SSO 用户也是如此：阻止
该用户、结束其会话、忘记该用户以及撤销其 API 令牌都只能由管理员进行。服务器会对这类请求返回 `403`。

