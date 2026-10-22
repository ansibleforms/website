---
layout: default
title: 个人资料
nav_order: 4
description: 您的账户、偏好设置、密码、权限和 API 令牌
has_children: true
has_toc: false
permalink: /profile/
translated_from: f2ec61e6df09174e802478963ba70ff7dee51098
---

# 个人资料
{: .no_toc }

您的账户、偏好设置、密码、权限和 API 令牌
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向所有用户：您自己的账户、偏好设置、密码、权限和 API 令牌。

从右上角的头像打开您的个人资料：**个人资料**。

---

## 打开视图

左侧菜单按字母顺序列出个人资料的各个视图。每个视图都有自己的地址，
因此您可以直接链接到它：

| 视图 | 地址 |
|---|---|
| 账户 | `/profile/account` |
| API 令牌 | `/profile/token` |
| 密码 | `/profile/password` |
| 权限 | `/profile/permissions` |
| 偏好设置 | `/profile/preferences` |

只写 `/profile` 会打开菜单中的第一个视图。您的角色不允许的视图会被隐藏；其地址会改为打开第一个
视图。只有当您的某个角色拥有 `allowApiTokens` 角色选项时，才会显示 **API 令牌**。

---

## 本节内容

每个主题都在单独的页面中介绍：

| 页面 | 涵盖内容 |
|---|---|
| [账户](account.html) | 您当前以谁的身份登录 |
| [偏好设置](preferences.html) | 语言、主题、时区、日期格式和桌面通知 |
| [密码](password.html) | 修改本地账户的密码 |
| [权限](permissions.html) | 您的角色允许您做什么 |
| [API 令牌](api-token.html) | 为脚本和 AI 代理创建令牌 |
