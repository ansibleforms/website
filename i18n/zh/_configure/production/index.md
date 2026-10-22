---
layout: default
title: 生产环境运行
nav_order: 12
has_children: true
has_toc: false
permalink: /production/
translated_from: 2d7f4be84a76837fae34c1b414a229448bfae4ea
---

# 生产环境运行
{: .no_toc }

发布、备份和监控大家所依赖的实例
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 上线之前

默认设置可以让实例快速运行起来，但其中有几项只适合初步试用。当未设置 `ENCRYPTION_SECRET` 或 `ACCESS_TOKEN_SECRET` 时，
AnsibleForms 会在启动时记录一条 `[SECURITY]` 警告，**状态** 页面也会报告备份、保留设置和表达式净化器的情况。

---

## 生产环境检查清单

在用户开始依赖该实例之前逐项检查一遍，并在每次重大升级后再检查一遍：

| 项目 | 要做的事 | 详情 |
|------|------------|---------|
| 管理员密码 | 修改本地管理员账户的密码 | [加固](../security/hardening.html#the-admin-account) |
| 加密密钥 | 在保存任何凭据之前设置 [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | [密钥与加密](../security/secrets.html#the-two-master-secrets) |
| 令牌密钥 | 设置 [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)，使会话在重启后仍然有效 | [密钥与加密](../security/secrets.html#the-two-master-secrets) |
| HTTPS | 使用您自己的证书（而非示例证书）终止 TLS | [HTTPS](../security/https.html) |
| 反向代理 | 在代理之后发布实例，可选择放在 [`BASE_URL`](../customization/server.html#env_BASE_URL) 下 | [反向代理](reverse-proxy.html) |
| Schema 端点 | Schema 创建后，将 [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) 设为 `0` | [加固](../security/hardening.html#the-database) |
| 出站调用 | 用 [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) 限制 REST 表达式 | [加固](../security/hardening.html#expressions-and-outbound-calls) |
| 可选功能 | 除非使用，否则保持 MCP 和聊天助手关闭 | [加固](../security/hardening.html#optional-features) |
| 备份 | 检查每晚备份是否正常，并将其复制到主机之外 | [备份](backups.html) |
| 保留 | 决定作业和审计条目的保留时长 | [日志](logs.html#retention) |

---

## 本节内容

每个主题都有自己的页面；实例的安全加固在 [安全](../security/) 中介绍：

| 页面 | 内容 |
|---|---|
| [反向代理](reverse-proxy.html) | 在 Nginx、Traefik 或 Apache 之后发布 AnsibleForms，放在根路径或子路径下 |
| [备份](backups.html) | 每晚备份、备份的内容、恢复，以及还需要保存什么 |
| [日志](logs.html) | 日志文件、syslog、审计记录，以及作业和审计条目的保留 |
| [扩展](scaling.html) | 多个应用节点加一个 worker；RTE 有单独的章节，见 [运行时环境](../rte/) |
| [监控](monitoring.html) | 健康探针、Prometheus 指标和状态页面 |
