---
layout: default
title: 安全
nav_order: 14
has_children: true
has_toc: false
permalink: /security/
translated_from: f2b18fd1638cb4ccb2401652eafb82e6ce0e82eb
---

# 安全
{: .no_toc }

加固实例：管理员账户、其密钥、HTTPS，以及用户和表单可以做什么
{: .fs-6 .fw-300 }

---

面向为生产环境准备实例的管理员，以及对现有实例进行安全审查的人员。

---

## 本节内容

每个主题都有自己的页面：

| 页面 | 内容 |
|---|---|
| [加固](hardening.html) | 管理员账户、登录限制、数据库、表达式、作业数据、浏览器策略、可选功能和角色选项 |
| [HTTPS](https.html) | TLS 在哪里终止、由应用提供 HTTPS，以及替换示例证书 |
| [密钥与加密](secrets.html) | `ENCRYPTION_SECRET`、`ACCESS_TOKEN_SECRET` 以及令牌有效期 |

相关页面：登录方式参见 [身份验证](../authentication/)，每次启动时的服务器端检查参见 [启动验证](../launch-validation/)，
以及 [安全变量](../customization/security.html)。
