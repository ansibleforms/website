---
layout: default
title: 免责声明
nav_order: 8
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: ad00bcbac9d3c64c103b15d26914eec84174f6b6
---

# 免责声明
{: .no_toc }

每位用户在使用应用前需接受一次的条款，并记录谁在何时接受了哪个版本
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：在 **设置 > 访问 > 免责声明** 中要求每位用户接受使用条款，需要 `showSettings` 角色选项。

从 7.3.0 起，该页面列出免责声明的所有版本，每个版本都在自己的页面中打开，并附带其接受记录。
在 7.2 及更早版本中，该页面改为三个选项卡（**常规**、**版本** 和 **接受记录**）；升级会保留所有版本。

---

## 本节内容

| 页面 | 内容 |
|---|---|
| [常规](disclaimer/general.html) | 版本列表、添加版本，以及启用用户需要接受的版本 |
| [版本](disclaimer/versions.html) | 版本的页面，以及作为更正或要求所有人重新接受而修改其正文 |
| [接受记录](disclaimer/acceptances.html) | 谁接受了哪个版本，以及请选定的用户再次接受 |


---

## 用户看到的内容

启用某个版本后，每位登录的用户（包括管理员）都会先在一个对话框中看到它，然后才能进行其他操作：

1. 他们阅读其标题和正文。
2. 他们勾选复选框，然后点击 **接受**。红色的 **拒绝** 则会让他们退出登录。

从 7.3.0 起，在用户作出回应之前，对话框后面的页面会被模糊处理。

用户对每个版本只需接受一次：下次登录时不会再被询问，只有在出现新版本、
管理员以 [再次请所有人接受](disclaimer/versions.html#changing-the-text) 保存修改后的正文，或者管理员对其接受记录使用
[再次请求](disclaimer/acceptances.html#asking-users-again) 时，才会再次询问。

在他们接受之前，API 对其会话的每个调用都返回状态 `403` 和代码 `disclaimer_required`，
但 `/api/v2/disclaimer` 和 `/api/v2/profile` 下的调用以及浏览器订阅的实时事件除外。
[API 令牌](profile/api-token.html) 永远不会被询问，因为脚本背后没有人可以点击。

