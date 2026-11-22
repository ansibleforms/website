---
layout: default
title: 系统任务
parent: 环境变量
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# 系统任务
{: .no_toc }

清理、夜间备份和运行器中心循环的运行时间
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

修改这些变量，可以把[系统任务](../jobs/system-tasks.html)移到其他时间，或让运行器中心的循环运行得更频繁或更少。

---

## 示例

在凌晨 1:00 备份，在凌晨 1:30 清理作业，并每 5 秒把作业分派给运行器。在 compose 项目的 `.env` 中：

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

`_CRON` 变量接受一个 5 字段的 cron（分钟、小时、日、月和星期），时区为服务器的时区
[`LOG_TZ`](logging.html#env_LOG_TZ)。**作业 > 系统**下每个任务的**计划**标签页会写入其变量，并立即在所有节点上应用，
无需重启。配置种子重新加载有自己的变量 [`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON)，与配置种子的变量放在一起。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="system-tasks" %}
