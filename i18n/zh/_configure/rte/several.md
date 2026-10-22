---
layout: default
title: 多个 RTE
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# 多个 RTE
{: .no_toc }

一个 RTE 运行多少个 playbook、作为运行器或副本的更多 RTE，以及 RTE 停止或宕机时会发生什么
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 一个 RTE 上的多个作业

一个 RTE 最多可以并行运行 [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) 个 playbook，默认为
10 个（`0` 表示不限制）。发给已满 RTE 的作业不会被认领。在套接字模式下，只要 RTE 最近一次
健康报告显示没有空闲槽位，应用就不会发送作业；已满或正在停止的 RTE 会以繁忙为由回复 `refused`；在数据库模式下，RTE 回复
`503`。无论哪种情况，应用都会在输出中写入一次 `Waiting for a free slot on RTE <name>`，并每 10 秒重新提供一次作业，
最长持续 [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)（默认 60）。之后作业会失败，并显示
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*。在等待期间被中止的作业会以 `aborted` 结束，
永远不会到达 RTE。

---

## 多个 RTE

应用不会自行在运行器之间分配作业：每个作业都发往一个运行器，即表单指定的运行器或
默认运行器。更多的 RTE 容器有两种用处：

* **作为独立的运行器**：每个 RTE 都有自己的 `RTE_NAME`，并作为独立的运行器加入：它请求加入并由管理员
  批准，或者出示加入令牌（参见 [注册](../runners/registration.html)）。表单用 `runner: <name>` 选择其中一个，
  例如带有 VMware 集合的 RTE，或位于另一个网络区域的 RTE；其他表单在默认 RTE 上运行
* **作为同一地址后的副本**（仅限数据库模式）：多个具有相同 `RTE_URL` 和相同 `RTE_TOKEN` 的 RTE 容器，
  例如 Kubernetes Service 后面的 pod，共用一个运行器，由该地址在它们之间分配调用。已满的副本回复
  `503`，下一次尝试可能会落到另一个副本上。应用通过数据库跟踪作业，因此由哪个副本
  应答其状态调用都无关紧要

在套接字模式下（参见 [模式](modes.html)），一个运行器持有到一个 RTE 的一个套接字，第二个使用相同
`RTE_NAME` 登录的 RTE 会从第一个 RTE 那里接管该套接字。请为每个 RTE 指定独立的名称和运行器，并让表单用
`runner:` 在它们之间选择。

数据库模式的每个 RTE 每 10 秒在数据库中写入一次心跳，自行注册的 RTE 每 30 秒检查一次其运行器行。
对于套接字模式的 RTE，持有其套接字的应用节点会在套接字打开期间每 20 秒为其写入一次心跳。
**状态** 页面列出每个 RTE 及其版本。对于数据库模式的 RTE 自行注册的运行器，一旦该 RTE 有 10 分钟没有写入心跳，
worker 就会将其删除；当默认运行器是这样一行且其 RTE 已停止时，下一个执行检查的 RTE
会成为默认运行器。来自配置种子的运行器、手动添加的运行器或通过套接字加入的运行器永远不会以这种方式被删除。

---

## RTE 停止或宕机时

**RTE 停止时。** 收到 `SIGTERM`（`docker stop`、滚动更新、缩容）时，RTE 停止接收作业：`/ready` 返回 `503`，
新作业会以繁忙为由被拒绝（数据库模式下为 `503`），因此应用会等待，或者在数据库模式下由该地址将其发往另一个
副本。正在运行的 playbook 有 [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS)（默认 25）的时间来完成，
然后 RTE 退出。

**RTE 宕机时。** 被杀死的容器（内存不足、节点丢失、停止超时到期）会带走其 playbook：不会有任何机制
将它们移到另一个 RTE，也不会重新运行它们。它们的作业会以 `abandoned` 结束：由 RTE 自己结束，或由应用在
RTE 以相同 ID 回来时结束（重启后的容器会保留该 ID，即 `rte-<hostname>-<port>`），或由 worker 在 RTE 的心跳
已过去两分钟后结束。重新启动之前，请先在受管主机上检查该 playbook 做了什么。

**RTE 停机期间。** 在套接字模式下，发给它的新作业会等待其套接字，最长为 `RTE_QUEUE_MINUTES` 再加一分钟，然后
失败并显示 *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*。
在数据库模式下，除非另一个副本在其地址上应答，否则它会立即失败，并显示 *the RTE at ... is unreachable*。
