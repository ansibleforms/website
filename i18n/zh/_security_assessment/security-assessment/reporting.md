---
layout: default
title: 报告漏洞
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# 报告漏洞
{: .no_toc }

如何私下报告安全问题，以及之后会发生什么
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 私下报告

AnsibleForms 保管着凭据和 vault 令牌，因此切勿在公开 issue 中报告安全问题：

1. 打开 **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**：这是只有维护者能看到的私密公告。
2. 如果您无法使用该页面，请打开一个普通 issue，只说明您有一份安全报告，并请求
   一个私密渠道：不要写细节、复现步骤或版本号。维护者会打开一个私密公告并
   邀请您加入。

完整的政策见仓库的 [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md)。

---

## 应包含哪些内容

报告提供的以下信息越多，修复就越快：

* 攻击者能获得什么：其他用户的数据、本无权运行的 playbook、主机，或管理员权限。
* 版本，以及部署方式：Docker、Kubernetes 或原生安装。
* 复现步骤，或者触发问题的请求。
* 是否需要已登录的用户，以及需要哪些[角色选项](../config/roles.html)。

---

## 之后会发生什么

从第一条消息到公开发布，报告都在同一个私密公告中处理：

| 步骤 | 您会得到什么 |
|---|---|
| 确认收到 | 确认报告已收到，以及问题能否复现 |
| 接受 | 在每个[受支持版本](development.html#supported-versions)的下一个版本中修复，并发布一条署名致谢您的公告，除非您不希望被署名 |
| 拒绝 | 说明理由，通常是该行为需要报告者本来就拥有的权限 |

修复发布后，公告也会公开，并出现在[安全公告](advisories.html)中。

---

## 范围

该政策的界线与角色模型的界线一致：

| 范围内 | 范围外 |
|---|---|
| 已登录用户能访问到超出其角色授权范围的任何内容 | 需要管理员账户已经被攻破的发现：管理员能运行任意 playbook 正是产品本身的功能 |
| 无需登录即可访问的任何内容 | 没有证明实际影响的扫描器报告 |
| 存储的凭据变得可读，或被写入日志 | |
| 对 shell、数据库或浏览器的注入 | |
