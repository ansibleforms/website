---
layout: default
title: 备份与保留
parent: 环境变量
nav_order: 3
translated_from: 1cac64b6467ce96bce3aac71718f07d7ecd10d89
---

# 备份与保留
{: .no_toc }

备份命令，以及备份、作业和审计记录的保留时长
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

修改这些变量，以控制数据库保留多少历史记录，以及磁盘上保留多少个备份。

---

## 示例

已完成的作业保留 90 天，审计记录保留两年。在 compose 项目的 `.env` 中：

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

每日任务会在凌晨 2:30 删除早于此期限的已完成作业，在凌晨 3:30 删除审计条目。正在运行的作业或等待
批准的作业永远不会被删除。从 7.7.0 起，`STORED_JOB_UNUSED_DAYS` 还会在凌晨 4:00 删除在该天数内没有启动过任何作业的[保存的作业](../jobs/stored-jobs.html#when-it-is-removed)。在设置页面上修改这些变量后，无需重启即可生效。

这些时间是默认值。自 7.8.0 起，每个清理以及夜间备份都是**作业 > 系统**下的一个[系统任务](../jobs/system-tasks.html)，
管理员可在那里修改其运行时间并查看其运行记录；这些时间的变量见[系统任务](system-tasks.html)。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="retention" %}
