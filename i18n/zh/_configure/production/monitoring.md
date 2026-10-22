---
layout: default
title: 监控
parent: 生产环境运行
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# 监控
{: .no_toc }

用于负载均衡器或 Kubernetes 的健康探针、Prometheus 指标和状态页面
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 健康探针

有两个端点可以告诉负载均衡器、容器健康检查或 Kubernetes，某个进程是否可以接收流量。
两者都不需要登录，也都不返回任何关于部署配置的信息：

| 端点 | 应答 | 用途 |
|----------|---------|------------|
| `/api/v2/live` | 只要进程在运行，就返回 `200` 和 `{"status":"live"}` | 存活探针：进程不再应答时重启它 |
| `/api/v2/ready` | 返回 `200` 和 `{"status":"ready"}`，或 `503` 和 `{"status":"not ready","reason":"..."}` | 就绪探针：只向就绪的进程发送流量 |

当以下条件全部满足时，进程即为就绪：

* 它没有在关闭（`stopping`）
* 数据库有应答（`database unreachable`）
* schema 存在（`schema not provisioned`）且完整，包含此版本的所有表、列和索引
  （`schema not upgraded`）；最后这项检查会缓存 30 秒，因此每隔几秒探测一次的开销也很小

在 [`BASE_URL`](../customization/server.html#env_BASE_URL) 下时，路径以它开头，例如
`/ansibleforms/api/v2/ready`。运行时环境（RTE）在 `/live` 和 `/ready` 上应答相同的探针，但不做
schema 完整性检查；它在关闭时排空作业期间处于未就绪状态，因此不会再有新作业发给它。出站 RTE
在与应用的套接字建立之前也处于未就绪状态（`not connected to the app`）。
以 `AF_ROLE=worker` 启动的进程没有 Web 界面：它只应答 `/api/v2/version` 和用于容器健康检查的 `/health`。
各种角色参见 [扩展](scaling.html)。

---

## Prometheus 指标

将 [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) 设为一个较长的随机字符串，即可提供 Prometheus 指标。
提供 Web 应用的进程在 `/api/v2/metrics` 上应答，RTE 在 `/metrics` 上应答：

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

没有 `METRICS_TOKEN` 时，这些端点返回 `404`，就像它们不存在一样；没有正确的
`Authorization: Bearer <token>` 请求头的请求会得到 `401`。每个进程都报告自己的数据，因此请分别抓取每个进程：

| 指标 | 测量内容 |
|--------|------------------|
| `af_process_*`、`af_nodejs_*` | 进程：CPU、内存、事件循环延迟、垃圾回收 |
| `af_http_requests_total{route,method,status}` | 已处理的请求 |
| `af_http_request_duration_seconds{route}` | 请求耗时 |
| `af_jobs{status}` | 当前正在运行（`running`）或等待批准（`approve`）的作业 |
| `af_jobs_ended_24h{status}` | 过去 24 小时内结束的作业，按状态统计 |
| `af_nodes{role,alive}` | 在数据库中注册的进程，按角色以及是否存活统计 |
| `af_login_failures_total`、`af_login_lockouts_total` | 登录失败次数和账户锁定次数 |
| `af_rte_running_jobs`、`af_rte_max_jobs` | 在 RTE 上：当前运行的 playbook 数量，以及最多可同时运行的数量 |
| `af_rte_socket_connected` | 在套接字模式的 RTE 上：与应用的套接字打开时为 `1`，否则为 `0` |

作业和节点的数据在每次抓取时从数据库读取。数据库没有应答时会省略这些数据，
抓取仍会成功，并返回其他指标。

---

## 状态页面

**设置 > 系统** 下的 **状态** 页面向拥有 `showSettings` 角色选项的用户展示实例的运行状况。
它只读取数据，因此刷新它永远不会发送邮件或启动作业。它有两个选项卡，问题数量显示在 **检查项** 选项卡的标签上。

### 检查项

每个检查项为绿色（正常）、琥珀色（需要关注）或红色（有问题），展开该行即可查看详情：

| 检查项 | 检查的内容 |
|-------|------------------|
| 数据库连接 | 数据库有应答 |
| 数据库用户 | 当用户像 `root` 一样对所有数据库都有权限，而不是仅对 `AnsibleForms.*` 有权限时，显示琥珀色 |
| 数据库架构 | 此版本的所有表、列和索引都存在；不存在时显示是哪个补丁失败了 |
| 调度器 | 有一个 worker 在运行系统任务，并且没有任何任务停止调度 |
| 节点 | 数据库中的进程，当它们运行不同版本时显示琥珀色 |
| 作业 | 正在运行的作业和等待批准的作业，当某个作业运行超过 24 小时时显示琥珀色 |
| 备份工具 | [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) 的导出命令存在，以及其版本 |
| 上次备份 | 没有备份或最新备份已超过两天时显示琥珀色，没有可用导出文件时显示红色 |
| 设计器锁 | 谁持有设计器锁，持有超过 8 小时时显示琥珀色 |
| 仓库 | 某个仓库失败或磁盘上没有工作树时显示红色 |
| 配置种子 | [配置种子](../seed/) 文件可读且可解析，并且上次重新加载成功 |
| 密钥库 | 每个密钥库都有应答，HashiCorp Vault 的令牌即将过期时显示琥珀色 |
| 运行器 | 每个运行器都有应答，没有运行器或没有默认 RTE 时显示琥珀色 |
| 服务器表达式 | 当 [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) 为 `legacy` 时显示琥珀色 |
| 密钥 | 当 `ENCRYPTION_SECRET` 为公开的默认值或未设置 `ACCESS_TOKEN_SECRET` 时显示琥珀色 |
| LDAP | LDAP 服务器可以访问且其 TLS 证书有效，不会登录到该服务器 |
| 作业存储 | 作业表的大小，未设置作业保留且超过 1 GB 时显示琥珀色 |
| 可写文件夹 | 每个已配置的文件夹都可以写入 |
| 磁盘空间 | 保存备份的磁盘，使用率达到 85% 时显示琥珀色，达到 95% 时显示红色 |

### 信息

关于实例的、无需判定的事实，也是寻求支持时最先被问到的信息：AnsibleForms
版本、基础 URL、数据库版本和主机、配置来源、配置种子、保留
设置、身份验证方式、当前 [邮件通道](../notification-channels.html) 的服务器、日志
级别和路径、运行时间、时区、Node.js 版本以及平台。

该页面读取 `/api/v2/health`，需要拥有 `showSettings` 的已登录用户。对于监控系统，请改用
上面的探针和指标。
