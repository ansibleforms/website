---
layout: default
title: 运行 RTE
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# 运行 RTE
{: .no_toc }

每种模式的设置，以及如何启动 RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 设置

RTE 需要什么取决于它的模式（参见 [模式](modes.html)）。每个 RTE 都会读取以下变量：

| 变量 | 含义 |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | 从 7.3.0 起：`outbound`（它主动连接应用）、`inbound`（应用主动连接它）或 `database`（已弃用，在整个 7.x 中为默认值） |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | 应用与 RTE 之间的令牌，至少 16 个字符；没有它，RTE 会拒绝启动 |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | 它同时运行多少个 playbook，默认为 `10`（`0` 表示不限制）。发给已满 RTE 的作业会等待，直到某个 playbook 结束 |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | 停止时，它等待正在运行的 playbook 的时长，默认为 `25`；届时仍在运行的会作为已放弃作业结束 |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | 由应用节点和 worker 读取，而不是 RTE：作业等待已满或正在停止的 RTE 的时长，默认为 `60` |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)、`PROCESS_MAX_BUFFER` | playbook 文件夹和输出上限：由 RTE 读取，因此请在其环境中设置 |
| `LISTEN_HOST` | 从 7.3.0 起：其监听器绑定的地址，默认为所有接口；当外部没有任何东西连接它时（出站 RTE）设为 `127.0.0.1` |

套接字模式（`outbound` 或 `inbound`）的 RTE 还会读取以下变量，并且不读取任何 `DB_*` 和 `ENCRYPTION_SECRET`：

| 变量 | 含义 |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | 用户打开应用时使用的地址，例如 `https://forms.example.com`。出站：它连接的地址。入站：它那一次注册调用的地址 |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1`（默认）：应用的证书必须有效。`0` 接受任何证书，仅限在一个受信任的网络内部使用 |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | 其运行器的名称，表单用 `runner:` 引用它。未设置时：使用其节点 ID `rte-<hostname>-<port>`，它会随容器变化：在生产环境中请设置它 |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | 可选，仅首次使用：通过 API 生成的加入令牌，可以立即批准其运行器，而无需等待管理员（参见 [加入令牌](../runners/registration.html#join-tokens)） |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | 入站，请求加入时：应用连接的地址，例如 `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer`（默认）：应用随作业发送 playbook 和清单。`local`：它从自己挂载的文件夹运行 |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | 每个作业的输出、事件和结束状态在应用保存之前的暂存位置，默认为 `<persistent>/rte-spool`：请放在卷上 |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | 使用 `transfer` 时：保存应用发来的文件夹的位置，默认为 `<persistent>/rte-files` |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | 使用 `transfer` 时：这些文件夹可以占用的空间，默认为 `1024`；最久未使用的先被清除，`0` 表示不保留 |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | 由应用读取，而不是 RTE：使用 `transfer` 时它发送的最大文件夹，默认为 `512` |

对于套接字模式的 RTE，`RTE_MAX_JOBS`、`RTE_DRAIN_SECONDS`、`RTE_FILES` 和 `RTE_CACHE_MB` 也可以在其运行器页面的
RTE 选项卡下设置：那里的值优先于变量，变量只用于填充留空的字段（参见
[RTE 的设置](../runners/runner-page.html#an-rtes-settings)）。超出范围的值会被调整到其上限或下限，RTE 会在启动时
说明这一点。

数据库模式（已弃用）的 RTE 则读取数据库设置，并自行注册：

| 变量 | 含义 |
|---|---|
| `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD` | 应用自己的值：RTE 从数据库读取其作业，并将输出写入数据库 |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | 应用调用 RTE 的地址，例如 `http://rte:8000`。运行器以其主机名（`rte`）命名，因此表单可以使用 `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | 在 7.3.0 中随数据库模式一起弃用：套接字模式的 RTE 改用加入令牌加入。`1`（默认）：RTE 在启动时将自己添加到 **连接 > 运行器** 下，第一个会成为默认运行器。`0`：请自己在那里添加，或在 [配置种子](../seed/) 中添加 |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | 应用自己的值，仅在自行注册时需要（运行器的令牌以加密形式保存）；使用 `RTE_REGISTER=0` 时不要设置 |

在数据库模式下，没有 `RTE_URL` 时，RTE 会以名称 `rte-<hostname>-<port>` 注册其 IP 地址和端口，它们会在
容器重新创建时改变：在生产环境中请设置 `RTE_URL`。对于 RTE 自行注册的运行器，worker 会在该
RTE 最后一次心跳 10 分钟后将其删除。

---

## 启动

RTE 运行 playbook，因此它需要 ssh 文件夹（包含 playbook 所用的私钥和 `known_hosts`），以及一个持久化
文件夹，用于存放其 spool 和应用发来的文件。选择模式：

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">出站</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">入站</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">数据库（已弃用）</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

在任何能访问应用的主机上启动 RTE，使用它自己的令牌及其运行器将获得的名称：

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

它会连接应用并请求加入：**连接 > 运行器** 会显示运行器 `rte-dmz` 正在等待批准，其日志会显示
其令牌的指纹。核对审核界面中显示的是同一个指纹，然后 **批准** 它（参见
[批准 RTE](../runners/registration.html#approving-an-rte)）：从此它开始接收作业，并使用自己的 `RTE_TOKEN` 登录。
如需无人值守启动，请添加 `-e RTE_JOIN_TOKEN=<a join token, afj_...>`，它会立即批准该 RTE。不需要有任何东西访问这台
主机：不要发布任何端口。其 `PORT` 上只有用于探针的 `/live`、`/ready` 和 `/metrics` 在监听。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

在应用能访问到的地方启动 RTE。这个 RTE 运行在应用旁边，并从其文件夹运行 playbook（`RTE_FILES=local`）：

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

然后为应用提供其运行器：在 [配置种子](../seed/) 中添加一个 RTE 凭据，以及一个使用该凭据登录的入站运行器：

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

也可以手动添加这两项：在 **连接 > 凭据** 下添加类型为 RTE 的凭据，在
**连接 > 运行器** 下添加类型为 RTE、模式为 **入站** 并使用该凭据的运行器。如果想让 RTE 自己请求加入，请使用
`APP_URL` 和 `RTE_URL` 启动它，并在 **连接 > 运行器** 下批准它（参见 [入站](modes.html#inbound)）。

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

自 7.3.0 起已弃用，并将在 8.0.0 中移除。RTE 从自己的磁盘运行 playbook，因此还要在其上挂载应用的持久化卷
（playbook、仓库、上传文件）和 ssh 文件夹。一个 Docker 示例，应用在同一网络中可通过
`ansibleforms` 访问：

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

请让入站 RTE 远离公共网络：任何持有令牌的调用方都能得到其套接字的应答。`docker stop` 在杀死容器之前只等待 10 秒，
因此请为 RTE 设置更长的停止超时（`--stop-timeout`，或 compose 中的 `stop_grace_period`），或者降低
`RTE_DRAIN_SECONDS`。Kubernetes 默认等待 30 秒。

[安装程序](../installation/installer.html) 可以在单独的服务器上使用 Docker、Podman 或
[不使用容器](../installation/native.html) 设置出站或入站 RTE，并打印用于批准它的指纹。要手动在另一个数据中心
运行 RTE，请按照 [另一个数据中心](another-datacenter.html) 操作。
