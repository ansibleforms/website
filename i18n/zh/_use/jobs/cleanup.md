---
layout: default
title: 清理
parent: 作业
nav_order: 6
translated_from: 48c1ec6d3d2ac80c86dd71d6799fbb1b59c5cb2f
---

# 清理
{: .no_toc }

因重启而中断的作业，以及已结束作业的保留时长
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 已放弃的作业

正在运行的作业由启动它的 AnsibleForms 进程跟踪。当这种跟踪停止时，作业会被标记为
`abandoned` ：

* **启动时**，该进程在重启前跟踪的作业，以及 7 之前没有任何进程
  跟踪的作业，如果仍处于 `running` 或正在中止，就会被标记为已放弃；日志会显示 `Abandoned <n> jobs` 。在 RTE 上
  运行的作业不受影响：即使没有启动它的进程，它也会继续运行。
* **每分钟**，由另一个已停止响应 2 分钟的 AnsibleForms 进程（或 RTE）跟踪的作业会被
  标记为已放弃；日志会显示 `Abandoned <n> jobs followed by a node that stopped answering` 。
* **每小时**，开始于一天多以前、仍处于 `running` 且一天内没有写入任何输出的作业会被标记为已放弃。
  在 RTE 上运行的作业在这里同样不受影响：RTE 重启时会自行清理其作业。

从 7.3.0 起，因重启或节点停止而被放弃的 AWX、AAP 或 Ascender 模板作业，如果是在过去 24 小时内
开始的，会被重新接管：由一个 AnsibleForms 进程接手，再次在运行器上跟踪它，作业最终以
运行器上实际发生的结果结束。其他运行器上的作业、playbook、工作流和多步骤作业仍保持已放弃状态。

已放弃的 playbook 可能已部分运行。在重新运行之前，请检查受管主机；参见
[作业显示状态 abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned)。

---

## 作业保留

作业会一直保留，直到被删除，除非管理员设置了保留期限。

设置了 [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) 后，每晚的一个任务（在 2:30）会删除
结束时间早于该天数的已结束作业，连同其输出和步骤一起删除。它只删除状态为
`success` 、 `failed` 、 `warning` 、 `aborted` 、 `rejected` 或 `abandoned` 的作业，因此正在运行的作业和等待
审批的作业无论多旧都会保留。默认值 `0` 会保留所有作业。
