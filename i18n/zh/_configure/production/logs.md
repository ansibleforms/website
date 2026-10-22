---
layout: default
title: 日志
parent: 生产环境运行
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# 日志
{: .no_toc }

日志文件、syslog、审计记录，以及作业和审计条目的保留时长
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 日志文件

AnsibleForms 向 [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
（`%PERSISTENT_FOLDER%/logs`）写入两个按天轮转的日志，压缩较早的日志，并保留 [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS) 天
（默认 30 天，`0` 表示保留所有文件；在设置页面上的修改会立即生效）：

* `ansibleforms.<date>.log`：[`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) 及以上级别的所有内容
* `ansibleforms.errors.<date>.log`：仅错误

控制台（用 `docker logs` 或 `kubectl logs` 读取）有自己的级别，
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL)。两者默认均为 `notice`，适合
生产环境；只在排查问题时使用 `info` 或 `debug`，并保持
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) 关闭。级别可以在
设置页面上修改，无需重启；**服务器日志** 页面会向拥有 `showLogs` 选项的用户显示日志。

---

## JSON 行

对于 Loki、ELK 或 Splunk 等日志收集器，请将 [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) 设为 `json`。这样，
控制台和文件中的每一行都是一个 JSON 对象，而不是 `<time> <level>: <message>`：

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| 字段 | 内容 |
|-------|---------|
| `time` | 时间，ISO 8601 UTC 格式 |
| `level` | 日志级别 |
| `message` | 消息 |
| `requestId` | 该行所属的请求（在处理请求期间写入时） |
| `role` | 进程的角色 [`AF_ROLE`](scaling.html)，未设置时为 `all` |
| `host` | 进程所在机器或容器的主机名 |

每个请求都有一个 ID：反向代理发送的 `X-Request-Id` 请求头，或者新生成的 ID。它会在响应的
`X-Request-Id` 头中返回，并由处理该请求期间写入的每一行携带（在文本行中为 `[req <id>]`），
因此可以在日志中跟踪一个请求，并与代理的日志对应。在设置页面上的修改会立即生效。

---

## Syslog

Syslog 服务器在 **设置 > 连接 > Syslog** 下管理，这样 syslog 服务器或 SIEM 就能在日志写入时收到日志。
您可以添加多台服务器，每台都有自己的设置：

| 设置 | 作用 |
|---------|--------------|
| 已启用 | 只有已启用的服务器才会收到内容，因此可以暂停服务器而不删除它；其行菜单中的 **启用** 和 **停用** 也可以切换它 |
| 协议 | `udp4`（默认）、`udp6`、`tcp4`、`tcp6`、`tls4`、`tls6`、`unix` 或 `unix-connect` |
| 主机和端口 | 发送目标服务器，默认端口为 `514`；`unix` 协议则使用套接字路径 |
| 接收内容 | 服务器日志、审计条目，或两者都接收（新服务器的默认值） |
| 级别 | 接收的服务器日志的最低级别，默认为 `info`；审计条目总是会发送 |
| 类型 | `BSD`（RFC 3164，默认）或 `RFC 5424` |

修改无需重启即可在每个节点上生效，服务器页面上有一个按钮可以向其发送测试消息。
无法访问的服务器永远不会导致应用停止：错误会写入控制台。

从 7.3.0 起，syslog 服务器需要完整的设置权限，即 [`showSettings`](../config/roles.html#role-options) 角色选项：
仅能访问连接设置是不够的，因为 syslog 服务器会接收服务器日志和审计条目。

早期版本的 `LOG_SYSLOG_*` 变量自 7 起已弃用。首次启动时如果发现设置了
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST)，会将它们一次性导入为服务器 `syslog`，
像以前一样接收服务器日志，此后便忽略这些变量。请在首次启动之后将它们从环境中删除，
并在设置页面上管理该服务器。

---

## 审计记录

**审计日志** 页面（在 **设置 > 日志** 下）记录谁修改了什么，这是日志文件难以回答的问题。
它记录：

* 通过 API 进行的每一次修改（`POST`、`PUT`、`PATCH`、`DELETE`），包括被 401 或 403 拒绝的尝试
* 登录，包括尝试使用的用户名
* 应用自身的事件，例如每晚备份、删除的备份、清理的作业以及配置种子的应用

每个条目都包含时间、操作者（某个用户，或执行自身任务的应用本身）、客户端 IP 地址、
操作、操作对象及其结果：`success`、`failure` 或 `denied`。页面可以按操作者、操作和
结果进行筛选，拥有 `showSettings` 角色选项的用户可以打开它。

IP 地址是 AnsibleForms 看到的地址，在代理之后运行时就是代理的地址。请将
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) 设为代理的数量或地址，AnsibleForms
就会改为记录代理在 `X-Forwarded-For` 中报告的客户端地址；参见 [反向代理](reverse-proxy.html)。

要将审计记录保存在实例之外以供 SIEM 使用，请添加一台接收审计条目的 syslog 服务器（参见
[Syslog](#syslog)）。每个条目在发生时即被发送，形式为一行 `audit {...}`，其中条目为 JSON，与
服务器的级别无关。syslog 中的副本不会被下面的保留策略删除，也不会被数据库恢复所替换。

---

## 保留

有两个带设置的每日任务，防止数据库无限增长：

| 变量 | 默认值 | 运行时间 | 删除内容 |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | 早于此期限的审计条目 |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0`（全部保留） | 2:30 | 早于此期限的已完成作业及其输出 |

对两者而言，`0` 都表示全部保留。另有两个每日任务没有设置：3:00 删除超过 30 天的已保存刷新令牌和
已过期的令牌撤销记录，4:00 删除已过期的 [保存的作业](../jobs/stored-jobs.html)。
时间以 [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) 的时区为准，由 worker 执行。

作业输出通常是增长最快的表：**状态** 页面会报告其大小，
并在其超过 1 GB 且未设置保留时发出警告。正在运行的作业和等待批准的作业永远不会被删除。
请确定一个符合您审计要求的作业保留期限，并让审计记录至少保留同样长的时间。
