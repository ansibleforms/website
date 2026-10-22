---
layout: default
title: 模式
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# RTE 如何与应用通信
{: .no_toc }

出站、入站或数据库模式：谁打开连接，以及连接上传递什么
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：从 7.3.0 起，RTE 通过一个 WebSocket 与应用通信，不持有任何数据库凭据。请根据两者之间的网络选择
合适的模式：谁可以向谁发起连接，以及连接经过哪些代理和防火墙。

---

## 三种模式

RTE 上的 [`RTE_MODE`](../customization/server.html#env_RTE_MODE) 说明它如何访问应用；其运行器具有相同的 **模式**：

| 模式 | 谁打开连接 | RTE 持有什么 | 适用场景 |
|---|---|---|---|
| `outbound` | RTE 在 [`APP_URL`](../customization/server.html#env_APP_URL) 主动连接应用，并保持一个打开的 WebSocket | 它的 `RTE_TOKEN`，没有数据库凭据 | DMZ、NAT，或不允许任何入站连接的区域：外部的任何连接都到达不了 RTE |
| `inbound` | 应用按运行器的地址主动连接 RTE，并保持一个打开的 WebSocket | 它的 `RTE_TOKEN`，没有数据库凭据 | 由中心一侧发起所有连接的网络、compose 项目、pod |
| `database`（已弃用） | 应用通过 HTTP 调用 RTE 的 API，RTE 自己读写应用的数据库 | 数据库凭据（`DB_*`）和 `ENCRYPTION_SECRET` | 7.0 到 7.2 的行为，将在 8.0.0 中移除 |

没有 `RTE_MODE` 的 RTE 在整个 7.x 中都以数据库模式运行，并在启动时记录一条 `[DEPRECATED] This RTE runs in database mode` 警告。
7.3.0 之前添加的运行器的模式为 **数据库（已弃用）**；迁移时，请将其设为其 RTE 实际运行的模式。

---

## 出站

由 RTE 打开连接，因此它可以在完全不接受入站连接的网络中工作：

* **套接字**：RTE 连接加上 `/api/v2/rte/socket` 的 `APP_URL`，使用 `wss://`（`http://` 地址则使用 `ws://`），并携带其
  `RTE_TOKEN` 及其运行器名称 [`RTE_NAME`](../customization/server.html#env_RTE_NAME)。套接字断开时会重新连接
* **第一次**：它请求加入，其运行器会在 **连接 > 运行器** 下等待管理员批准，此时已连接
  但不接收作业（参见 [请求加入](../runners/registration.html#asking-to-join)）。加入令牌
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) 可以立即批准它。此后它使用自己的令牌登录
* **网络**：只需从 RTE 所在区域到应用的应用端口的连接，当 `HTTPS_PROXY` 指定时经过代理。应用前面的反向
  代理必须允许该路径上的 WebSocket 通过（参见 [运行器 WebSocket](../production/reverse-proxy.html#runner-websockets)）
* **证书**：会校验应用的证书。用 `NODE_EXTRA_CA_CERTS` 指定私有 CA，或者仅在一个受信任的网络内部，
  用 [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) 关闭校验
* **运行器**：它不需要地址，因此其 RTE 凭据只保存令牌
* **就绪**：在与应用的套接字打开之前，`/ready` 返回 `503`

当负载均衡器之后有多个应用节点时，由 RTE 连接到的节点持有其套接字。任何节点都可以启动作业：持有
套接字的节点会将作业发给 RTE；如果作业是在另一个节点上启动的，会在两秒内发送。

---

## 入站

RTE 在其 `PORT` 上监听，应用按其运行器的地址加上 `/rte/v1/socket` 并携带 RTE 的令牌来连接它。当有
多个应用节点时，同一时间由一个节点持有每个入站运行器的套接字；该节点停止时，另一个节点会接管并重新连接。

应用在连接 RTE 之前需要有该 RTE 的运行器：类型为 RTE，模式为 **入站**，以及一个包含 RTE 地址及其
`RTE_TOKEN` 的 RTE 凭据。有以下两种方式：

| 方式 | 需要设置的内容 |
|---|---|
| RTE 请求加入 | `APP_URL` 和 [`RTE_URL`](../customization/server.html#env_RTE_URL)（应用连接的地址）。RTE 发起一次调用 `POST /api/v2/rte/register`，其运行器等待管理员批准：批准后应用就会连接它（参见 [请求加入](../runners/registration.html#asking-to-join)）。使用 `RTE_JOIN_TOKEN` 时会立即批准。设置了 `APP_URL` 但没有 `RTE_URL` 的入站 RTE 会拒绝启动 |
| 您自己添加运行器 | 不设置 `APP_URL`：在 **连接 > 运行器** 下或在 [配置种子](../seed/) 中添加运行器，如 [运行 RTE](run.html#start-it) 所述 |

Docker Compose 项目、Helm chart 和安装程序的控制器都以这种方式运行自己的 RTE：入站模式，由种子声明。

**通过 HTTPS。** 当 [`HTTPS=1`](../customization/server.html#env_HTTPS) 时，RTE 通过 TLS 提供其套接字，使用
[`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) 和 [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) 的密钥和证书
（默认为其 `certificates` 文件夹中的 `key.pem` 和 `cert.pem`）。`RTE_URL` 为 `https://` 的 RTE 在请求加入时会发送该证书，
应用会将其固定：只有当 RTE 出示同一证书时，应用才会连接它，因此自签名证书无需 CA 也能使用。
RTE 在启动时记录证书的指纹（其 DER 字节的 SHA-256 的前 8 个十六进制数字，形如 `abcd-ef12`），
批准对话框显示应用收到的指纹：批准之前请核对两者是否一致。
[安装程序](../installation/installer.html#a-runner) 以这种方式设置其入站运行器，并使用其自身地址的证书。

---

## 数据库（已弃用）

7.0 到 7.2 的 RTE：应用通过 HTTP 调用其 API，RTE 在数据库中认领作业、将输出写入数据库，并通过
[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) 保持自己的运行器行为最新。[数据库模式](./#database-mode-deprecated)
说明了其步骤有何不同。它在 7.x 中仍然可用，每次启动时都会发出警告，并将在 8.0.0 中移除。

要将这样的 RTE 迁移到套接字模式，请保留其运行器和令牌：

1. 对于 [配置种子](../seed/) 中的运行器：先在种子中为它设置 `rte_mode: outbound` 或 `rte_mode: inbound`（入站：
   在其凭据的 `url` 中填写应用连接的地址）。RTE 无法自行迁移由种子管理的运行器
2. 在 RTE 上，设置 `RTE_MODE=outbound` 和 `APP_URL`，或设置 `RTE_MODE=inbound`（并设置 `APP_URL` 和 `RTE_URL` 以进行那一次
   注册调用），并将 [`RTE_NAME`](../customization/server.html#env_RTE_NAME) 设为其运行器在
   **连接 > 运行器** 下的名称。保留其 `RTE_TOKEN`
3. 从其环境中删除 `DB_*` 和 `ENCRYPTION_SECRET`，以及只有数据库模式才读取的 `RTE_REGISTER`，然后重启它

当升级后的 RTE 使用运行器的名称和运行器自己的令牌登录时，应用会立即将该运行器迁移到 RTE 的模式，
无需批准，并记录 *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*。该运行器不再是其 RTE 注册的行，因此当旧容器不再应答时，worker 永远不会删除它。
仍处于数据库模式的配置种子运行器则会被拒绝，并显示 *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*。不要为此使用加入令牌：已经批准的运行器
会拒绝加入令牌。没有 `APP_URL` 的入站 RTE 不会发起调用：请改为在 **连接 > 运行器** 下将其运行器的 **模式** 设为
**入站**，应用就会连接它。[安装程序](../installation/installer.html#a-72-runner)
以这种方式升级 7.2 的运行器。

---

## 套接字上传递什么

在两种套接字模式下，应用都会把每个作业连同 RTE 过去从数据库中读取的所有内容发给 RTE，并将返回的内容，
即输出、事件、作业日志和结束状态，恰好保存一次。应用还会发送结束通知。

**spool。** 每一批输出、每一批事件、日志、开始和结束都会被编号，并在发送之前写入作业的 spool 文件
（[`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)），一直保留到应用表示已保存为止。
重新连接（到同一个应用节点或另一个节点）后，RTE 会重新发送未被确认的内容，应用会跳过已经保存的
内容：不会丢失任何内容，也不会重复保存。请将 spool 放在卷上，这样重启后的 RTE 仍能发送尚未
送达的内容。RTE 重启时正在运行的 playbook 无法继续：其作业会作为已放弃作业结束。

**容量。** RTE 最多同时运行 [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) 个 playbook，或其
[运行器页面](../runners/runner-page.html#an-rtes-settings) 上设置的值，并每 20 秒告诉应用正在运行多少个。发给已满
RTE 的作业会等待，详见 [多个 RTE](several.html#several-jobs-on-one-rte)。

**作业的文件。** [`RTE_FILES`](../customization/server.html#env_RTE_FILES)，或其运行器页面上的 **作业文件** 设置，说明
RTE 从哪里获取 playbook 和清单：

| `RTE_FILES` | 文件的来源 |
|---|---|
| `transfer`（默认） | 应用随作业发送 playbook 文件夹和清单，每个都打包并以其内容的哈希命名。RTE 将它们以打包形式保存在 [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) 下，保留最近使用的，最多 [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB)（默认 1024 MB），并且只请求它没有的哈希：未改变的文件夹永远不会发送两次。RTE 不需要共享磁盘，也不需要访问仓库 |
| `local` | RTE 从自己的文件夹运行，与数据库模式的 RTE 一样：在其上挂载 playbook（[`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)）和仓库（[`REPO_PATH`](../customization/paths.html#env_REPO_PATH)） |

使用 `transfer` 时，每个作业都在自己的私有文件夹中解压文件，作业结束时删除：任何作业都看不到其他作业
写入的内容，RTE 的磁盘上也不会留下解压后的清单或 extravars 文件。多个 RTE 可以共用一个 `RTE_CACHE_PATH`；每个 RTE 都把自己的作业放在
自己的文件夹中，已停止的 RTE（在作业中途被杀死，或以另一个主机名重新创建）的文件夹会在 10 分钟后被其他 RTE
删除。大于 [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB)（默认 512，由
应用读取，无需重启即可生效）的文件夹不会被发送：作业会失败，并提示改为在 RTE 上挂载该文件夹。ssh 文件夹永远不会被发送：RTE 在
`/home/node/.ssh` 中保存自己的私钥和 `known_hosts`。

**主机和任务。** 从 7.3.0 起，任何模式的 RTE 都会在文本输出之外记录 playbook 的结构化事件：每个 play、任务和
主机结果，以及汇总，由其 `af_events` 回调插件写入。作业页面在 **主机和任务** 下显示它们（参见
[跟踪作业](../jobs/following.html#hosts-and-tasks)）。

---

## 网络

按模式列出需要在应用、RTE 和受管主机之间开放的连接：

| 模式 | 从 | 到 | 端口 |
|---|---|---|---|
| 出站 | RTE | 应用，位于 `APP_URL` | 应用的端口（大多数代理之后为 `443`） |
| 入站 | 应用节点 | RTE，位于其运行器的地址 | RTE 的 `PORT`（`8000`） |
| 数据库（已弃用） | RTE，以及应用节点和 worker | 数据库，以及 RTE | `3306`，以及 RTE 的 `PORT` |
| 所有模式 | RTE | 受管主机 | ssh（`22`）、WinRM、它们的 API |

在套接字模式下，RTE 从不连接数据库。其 API 只应答套接字和探针：`/live`、`/ready`、`/metrics`。
