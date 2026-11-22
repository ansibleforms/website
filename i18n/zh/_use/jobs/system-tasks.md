---
layout: default
title: 系统任务
parent: 作业
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# 系统任务
{: .no_toc }

AnsibleForms 自动运行的维护任务，以及它们的运行时间
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：清理、夜间备份以及服务器的其他后台工作，从 7.8.0 起列在**作业**下。

---

## 任务

服务器自动运行这些任务，每个任务按一个 cron 运行，时区为服务器的时区，由 [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) 设置：

| 任务 | 默认运行时间 | 作用 |
|---|---|---|
| **被放弃的作业** | 每小时 | 结束运行了一天却没有输出、且没有运行器接手的作业（参见[被放弃的作业](cleanup.html#abandoned-jobs)） |
| **已停止的节点** | 每分钟 | 释放已停止响应的 AnsibleForms 节点和 RTE 所持有的作业、认领和运行器 |
| **计划结束** | 每分钟 | 关闭或删除已到达结束条件的[计划](schedules.html) |
| **计划重新同步** | 每 5 分钟 | 从数据库重新读取计划和仓库拉取，以防漏掉某个变更通知 |
| **过期令牌** | 每天 03:00 | 删除过期的登录令牌、令牌撤销记录和 API 令牌 |
| **审计日志清理** | 每天 03:30 | 删除早于 `AUDIT_RETENTION_DAYS` 的审计条目 |
| **作业清理** | 每天 02:30 | 删除早于 `JOB_RETENTION_DAYS` 的已结束作业及其输出 |
| **夜间备份** | 每天午夜 | 备份数据库，并删除超出 `NIGHTLY_BACKUP_RETENTION` 的最旧的夜间备份 |
| **已保存作业清理** | 每天 04:00 | 删除已过期或在 `STORED_JOB_UNUSED_DAYS` 天内未使用的保存的作业，并遗忘已消失一天的节点 |
| **配置种子重新加载** | 每分钟 | 当[配置种子](../seed/reloading.html)文件发生变化时重新应用它 |

保留设置见[备份与保留](../customization/retention.html)，备份见[备份](../production/backups.html)。
没有 [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH) 时，**配置种子重新加载**处于关闭状态。

这些任务在执行后台工作的节点上运行：没有 `AF_ROLE` 的进程，或在应用拆分到多个节点时持有 worker 锁的 `worker`
（参见[扩展](../production/scaling.html#roles)）。

---

## 运行器中心的循环

运行器中心把作业交给 RTE，它自己的三个循环每隔几秒运行一次，而不是按 cron 运行：

| 循环 | 默认运行时间 | 作用 |
|---|---|---|
| **运行器分派** | 每 2 秒 | 把等待中的作业和取消操作交给对应的运行器；在另一个节点上发起的作业会在下一轮到达其运行器 |
| **入站运行器连接** | 每 10 秒 | 连接本节点可以持有的[入站](../rte/modes.html#inbound)运行器，也会重新连接丢失了套接字的运行器 |
| **已结束作业清理** | 每 60 秒 | 释放本节点为在其他节点上结束的作业所保留的内容 |

这些循环在每个运行 Web 应用的节点上运行，因此有多个应用节点时，每个节点都有自己的循环。cron 的最小步长是一分钟，
对它们来说太粗了：每个循环每隔若干秒运行一次。

---

## 系统列表

[作业](./)页面在**未来**下以**系统**列出这些任务，并显示任务数量，仅对管理员（角色选项 `showSettings`）可见。

列表中每个任务和每个循环占一行，每分钟重新读取一次：

| 列 | 显示 |
|---|---|
| **名称** | 任务的名称 |
| **计划** | 运行时间的文字描述（*每小时*、*每 2 秒*），悬停时显示其 cron；不运行的任务显示**关闭** |
| **上次运行** | 上次运行开始的时间，从未运行过则显示破折线 |
| **下次运行** | 下次运行的时间 |
| **状态** | 上次运行的结果：`success` 或 `failed` |

**列**中还提供**描述**，即每个任务的作用。点击某一行会打开该任务的页面。这些任务属于应用本身：
无法添加或删除。

---

## 任务页面

任务页面有三个标签页，上方有**立即运行**和**保存**，以及一个可同时筛选所有标签页的搜索框。

| 标签页 | 显示内容 |
|---|---|
| **详情** | 它的**名称**和**描述**、**上次启动**（失败时悬停显示错误）、上次运行的**结果**、**上次运行**、**下次运行**、循环所应答的**节点**，以及**应用的设置** |
| **计划** | 运行时间：任务为 cron，循环为以秒计的**间隔** |
| **运行记录** | 记录的每次运行，最新的在前 |

**应用的设置**显示变量及其值，例如 `JOB_RETENTION_DAYS` 90，并带有**在设置中更改**，用于打开修改它的设置标签页。
没有此类设置的任务显示破折线。

### 计划标签页
{: .no_toc }

任务的 cron 在与计划相同的编辑器中编辑：预设、表达式的文字描述以及接下来三次运行，均使用服务器的时区。
它接受 5 个字段（分钟、小时、日、月和星期），并且必须会再次运行。循环接受一个整数秒数，须在其范围内，
范围显示在字段下方的那一行。

**保存**会像设置页面一样把值写入受管理的设置文件，并立即在所有节点上应用，无需重启。在进程环境中设置的值，
或在 [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` 时的任何值，
都以只读方式显示，并带有*由环境变量设置*这一行及其名称。

### 运行记录标签页
{: .no_toc }

任务的每次运行占一行，包含以下列：

| 列 | 显示 |
|---|---|
| **启动者** | 选择**立即运行**的用户，例如 `admin (local)`；按 cron 运行时显示**计划** |
| **开始时间**、**结束时间**和**耗时** | 运行开始和结束的时间，以及所用时长 |
| **状态** | `success` 或 `failed` |
| **结果** | 本次运行做了什么，例如 *Removed 120 jobs*，或其错误 |
| **节点** | 执行它的节点 |

保留最近 30 天的运行，每个任务最多 1000 条：对于每分钟运行一次的任务，大约是最近 16 小时。

循环运行得太频繁，无法每轮一行。它的**运行记录**标签页改为按节点显示：

* 每小时的汇总，例如 *1,800 passes, 0 failed*，该小时内有一轮失败时为 `failed`；
* 每次**立即运行**一行，显示 *Run now: done* 或错误；
* 定时器触发的一轮失败时的一行 `failed`，同一错误每分钟最多一次。

### 立即运行
{: .no_toc }

**立即运行**会立即在运行这些任务的节点上运行该任务，并以您的名字记录这次运行。任务正在运行时，以及对于**关闭**的任务，
该按钮不可用。较长的运行（例如夜间备份）在页面应答之后仍会继续。

循环的**立即运行**会在提供该页面的节点上运行一轮，在运行器中心未运行的节点上会被拒绝。每次**立即运行**
都会以 `system.task.run` 写入审计日志。

---

## 更改任务的运行时间

每个任务和循环都有一个决定其运行时间的环境变量，由其**计划**标签页写入。所有这些变量都无需重启即可生效。

| 变量 | 默认值 | 任务 |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | 被放弃的作业 |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | 已停止的节点 |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | 计划结束 |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | 计划重新同步 |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | 过期令牌 |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | 审计日志清理 |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | 作业清理 |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | 夜间备份 |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | 已保存作业清理 |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | 配置种子重新加载 |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2`（1 到 60） | 运行器分派 |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10`（2 到 300） | 入站运行器连接 |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60`（10 到 3600） | 已结束作业清理 |

在环境中手动设置的无效 cron 或超出范围的秒数会被忽略，改用默认值。

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

在 7.8.0 之前，配置种子每隔 [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS) 检查一次。
该变量自 7.8.0 起已弃用，由 `CONFIG_SEED_RELOAD_CRON` 取代，并将在 8.0 中删除。在未设置
`CONFIG_SEED_RELOAD_CRON` 时，它仍会被读取为一个 cron，并在启动时在日志中给出警告：

| `CONFIG_SEED_RELOAD_SECONDS` | 读取为 |
|---|---|
| `60` | `* * * * *`，每分钟 |
| 不超过 `3600` 的 60 的倍数 | 每若干分钟，例如 `300` 为 `*/5 * * * *`（`3600` 读取为 `0 * * * *`） |
| 小于 60 且能整除 60 的数 | 每若干秒 |
| `0` | 关闭重新加载 |
| 其他任何数 | 上述中最接近的一种，日志会说明 |

任务的**计划**标签页会显示该 cron，并带有*来自已弃用的变量 CONFIG_SEED_RELOAD_SECONDS；在此保存的 cron 将替换它。*这一行。
**保存**会写入 `CONFIG_SEED_RELOAD_CRON`，此后它优先于旧变量。
