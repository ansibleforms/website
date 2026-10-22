---
layout: default
title: 实时事件
parent: REST API
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# 实时事件
{: .no_toc }

在作业和设置发生变化时收到通知，而不必轮询
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

服务器会在变化发生时告诉其客户端发生了什么变化。脚本也可以监听，而不必每隔几秒读取一次作业。

---

## 事件流

`GET /api/v2/events` 是一个保持打开的 [服务器发送事件](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
流。任何已登录的用户都可以用通常的 bearer 令牌打开它：

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

当有内容发生变化时，它会发送一个 `changed` 事件，其中包含变化内容的名称：

```text
event: changed
data: {"name":"jobs"}
```

---

## 事件名称

事件只携带名称，从不携带数据，因此不会泄露用户无权查看的任何内容。会发送以下名称：

| 名称 | 变化内容 |
|---|---|
| `jobs` | 作业：被启动、其状态或输出变化、被删除 |
| `appearance` | 页眉显示的设置：主题、名称、公告、环境变量 |
| `designer` | 设计器的锁被获取或释放 |
| `runners` | 运行器（从 7.3.0 起）：RTE 连接或断开、请求加入、被批准或拒绝，或者改变了其模式或设置 |

收到某个名称后，请通过常规 API 以您自己的权限重新读取您显示的内容（例如 `GET /api/v2/job/42`）。
频繁变化的名称每秒最多发送一次。

---

## 保持连接

该事件流设计为能穿过代理和负载均衡器，客户端会自行重新连接：

* 连接时，服务器会发送一个 `hello` 事件，并要求客户端在重新连接前等待 3 秒。
* 每 15 秒它会发送一行注释（`: ping`），以免空闲连接被关闭。请忽略以 `:` 开头的行。
* 来自每个应用节点的事件都会到达每个事件流，无论客户端连接的是哪个节点。
* 重新连接后，请重新读取您显示的内容：事件流中断期间发送的事件不会重发。

---

## 健康检查和指标

存活和就绪探针（`/api/v2/live`、`/api/v2/ready`）以及 Prometheus 指标（`/api/v2/metrics`）
面向监控工具，而不是以用户身份执行操作的脚本。参见 [监控](../production/monitoring.html)。
