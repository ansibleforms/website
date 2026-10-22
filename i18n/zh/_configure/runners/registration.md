---
layout: default
title: 注册
parent: 运行器
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# 注册
{: .no_toc }

RTE 如何请求加入并获得批准、用于无人值守安装的加入令牌，以及数据库模式
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 请求加入

从 7.3.0 起，应用尚不认识的套接字模式（`outbound` 或 `inbound`）RTE 会请求加入，由管理员批准。
它使用自己的 `RTE_TOKEN` 和 `RTE_NAME` 发起联系：出站 RTE 在首次连接应用时，入站 RTE 在它那一次
注册调用中。没有加入令牌时，应用随后会：

1. 将 RTE 的 `RTE_TOKEN` 保存到一个名为 `<name>-rte` 的新 RTE 类型凭据中（名称已被占用时会加上数字），
   对于入站 RTE 还会保存其地址 `RTE_URL`
2. 添加一个以 `RTE_NAME` 命名、类型为 RTE、模式与该 RTE 相同、使用该凭据登录的运行器，标记为 **等待批准**
   并处于关闭状态。其描述中注明了它发起请求的主机

出站 RTE 在等待期间保持连接，但不接收作业。在获得批准之前，应用不会连接入站 RTE。两者都会在日志中
记录它们正在等待管理员在 **连接 > 运行器** 下批准，并附上其令牌的指纹。

`RTE_URL` 为 `https://` 的入站 RTE 在请求加入时还会发送其证书，应用会将其固定：此后，
只有当该 RTE 出示同一证书时，应用才会连接它，因此自签名证书无需 CA 也能使用（参见 [入站](../rte/modes.html#inbound)）。

同一时间最多有 20 个 RTE 等待批准：超出的会被拒绝，直到有一些被批准或拒绝。24 小时内无人处理的请求
会被 worker 连同其凭据一起删除。

以应用已知的运行器名称命名、但使用另一个令牌的 RTE 会被拒绝，并且不会请求加入。请将该运行器的
令牌提供给它，或删除该运行器，让它请求加入。只有在该运行器仍在等待批准时，[加入令牌](#join-tokens) 才有帮助。

---

## 批准 RTE

等待批准的运行器不在 **连接 > 运行器** 的列表中，而是显示在列表上方的一条橙色提示中，例如
**2 个运行器等待批准**，每个运行器一行：其名称、主机、IP 地址、模式、地址和指纹。
页眉的铃铛会为能看到运行器的用户统计它们的数量（参见 [铃铛](../jobs/#the-jobs-page)）。

点击该提示会依次为每个运行器打开 **审核审批** 对话框；点击某个名称则只打开该运行器。
其页面在一个黄色框 **此 RTE 请求加入** 中显示相同的信息。批准之前，请确认它是您启动的：

| 字段 | 显示的内容 |
|---|---|
| 指纹 | 其 `RTE_TOKEN` 的 SHA-256 的前 8 个十六进制数字，形如 `abcd-ef12`。RTE 在启动时记录它，[安装程序](../installation/installer.html#a-runner) 在结束时打印它。两者必须一致 |
| 证书指纹 | 在对话框中，对于通过 HTTPS 的入站 RTE：应用所固定证书（其 DER 字节）的 SHA-256 的前 8 个十六进制数字，形如 `abcd-ef12`。RTE 在启动时记录它，[安装程序](../installation/installer.html#a-runner) 在结束时打印它。两者必须一致 |
| 主机 | 它运行所在的主机 |
| IP 地址 | 它调用应用时的来源地址 |
| 模式 | 出站或入站 |
| URI | 入站 RTE 的地址，即应用连接它的地址 |
| 版本 | 它的版本 |
| 请求时间 | 它请求加入的时间 |

在对话框中或其页面的黄色框中，用 **批准** 和 **拒绝** 作出决定：

| 操作 | 结果 |
|---|---|
| 批准 | 运行器被启用，从此开始接收作业。如果其类型还没有默认运行器，它会成为默认运行器 |
| 拒绝 | 运行器连同其凭据被删除，其套接字被关闭。RTE 可以再次请求加入；届时它会再次等待批准 |

只有管理员可以批准或拒绝 RTE。

---

## 加入令牌

加入令牌可以立即批准 RTE，用于无人值守安装：以
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) 启动的 RTE，或使用安装程序的 `--join` 安装的运行器，会出示一次该令牌，
其运行器会以启用状态添加，无需等待。加入令牌在界面中没有页面：管理员通过
[REST API](../api/) 在 `/api/v2/runner` 下生成它们：

| 调用 | 作用 |
|---|---|
| `POST /api/v2/runner/jointoken` | 生成加入令牌。请求体包含其 `name`，以及可选的 `expiresInHours`（不设置：永不过期）和 `maxUses`（不设置：不限 RTE 数量） |
| `GET /api/v2/runner/jointoken` | 列出加入令牌，最新的在前，包括其使用次数以及是否仍可使用；从不列出令牌本身 |
| `POST /api/v2/runner/jointoken/<id>/revoke` | 撤销它：它不再添加任何运行器，但仍保留在列表中 |
| `DELETE /api/v2/runner/jointoken/<id>` | 删除它 |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

应答中包含以 `afj_` 开头的令牌，仅此一次：只保存其 SHA-256。出示它的 RTE 会获得与
[请求加入](#asking-to-join) 的 RTE 相同的凭据和运行器，并处于启用状态，其描述中注明了该加入令牌。此后
RTE 使用它自己的令牌登录，因此加入令牌过期或被撤销都不会影响它。撤销或删除加入令牌
会保留它所添加的运行器。

加入令牌永远不会为已批准的运行器提供新令牌。当已存在同名的 RTE 运行器时：

| 该运行器 | 结果 |
|---|---|
| 正在等待批准 | 其凭据中会写入新令牌，但仍需等待管理员批准 |
| 已批准 | 以 `409` 拒绝：*runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*。加入令牌不会被消耗 |
| 来自 [配置种子](../seed/) | 拒绝：*runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

因此，使用新令牌重新安装的 RTE 应使用其运行器凭据中的令牌登录；或者由管理员在
**连接 > 凭据** 下修改该令牌；或者删除该运行器，让 RTE 作为新的 RTE 加入。

---

## 数据库模式下的注册

数据库模式（自 7.3.0 起已弃用）的 RTE 默认会自行注册，使用其 `RTE_URL`，否则使用其自身的地址和端口。
一旦其 RTE 有 10 分钟没有写入心跳，worker 就会删除这样的运行器。手动添加的运行器、由配置种子添加的运行器或由
套接字模式 RTE 添加的运行器永远不会以这种方式被删除。

用于打开或关闭这种注册的 [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) 在 7.3.0 中随
数据库模式一起弃用：套接字模式的 RTE 会请求加入，或使用加入令牌加入。在此期间，如果要自己管理这类运行器，请以
`RTE_REGISTER=0` 启动 RTE，并在这里以类型 RTE、模式 **数据库（已弃用）** 添加它，同时提供一个包含其地址和
相同令牌的 RTE 凭据。要将其迁移到套接字模式，参见 [模式](../rte/modes.html#database-deprecated)。
