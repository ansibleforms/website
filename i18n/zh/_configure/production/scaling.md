---
layout: default
title: 扩展
parent: 生产环境运行
nav_order: 4
translated_from: 5b76f1bfb7520ff2b072919d714d2ab72b1e5d5e
---

# 扩展
{: .no_toc }

将 AnsibleForms 拆分到多个应用节点和一个 worker 上，并搭配一个或多个 RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 角色

每个 AnsibleForms 容器都运行相同的服务器代码，由 [`AF_ROLE`](../customization/server.html#env_AF_ROLE) 决定它做什么：

| `AF_ROLE` | 镜像 | 运行内容 | 数量 |
|---|---|---|---|
| `all`（未设置） | `ansibleforms` | 在一个进程中运行 Web 应用和 worker：默认值 | 1 |
| `app` | `ansibleforms` | Web 界面和 API | 任意多个，放在负载均衡器之后 |
| `worker` | `ansibleforms` | 后台工作：数据库 schema 及其升级、配置种子、调度、每晚备份、仓库同步和清理 | 同一时间一个在工作；更多的则等待接管 |
| `rte` | `ansibleforms-rte-full`（或 `-rte-core`、`-rte-base`） | playbook | 任意多个 |

最小的安装是一个不设置 `AF_ROLE` 的容器加一个 RTE：这就是 [Docker Compose 项目](../installation/docker-compose.html)
和 [Helm chart](../installation/kubernetes.html) 所运行的方式。`AF_ROLE` 的任何其他值都会使进程在启动时停止。

---

## RTE

RTE，即运行 playbook 的运行时环境，有单独的章节：[运行时环境](../rte/)。其中介绍了 RTE
如何运行作业、[其镜像](../rte/images.html)、[如何运行 RTE](../rte/run.html)、作为运行器或
副本的 [多个 RTE](../rte/several.html)，以及 [位于另一个数据中心的 RTE](../rte/another-datacenter.html)。

---

## 多个应用节点

为了服务更多用户，或在失去一个节点时继续运行，请将应用拆分为放在负载均衡器之后的 `app` 节点和一个 `worker`。

### 节点共享的内容
{: .no_toc }

各节点通过数据库和一个共享卷彼此协调：

* **数据库**：作业、worker 锁、设计器锁、节点列表、运行器租约（哪个应用节点持有
  每个 RTE 的套接字），以及让每个节点的缓存保持最新的变更通知。在一个节点上编辑的凭据、运行器或调度
  会在 5 秒内在所有节点上生效
* **持久化卷**（`/app/dist/persistent`）：表单、配置、仓库、上传文件、备份和托管的 `.env`。
  每个应用节点和 worker 都以读写方式挂载同一个卷
* **ssh 文件夹**（`/home/node/.ssh`）：通过 ssh 访问 git 所用的密钥和已知主机；worker 在首次启动时创建密钥
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)**：在每个应用节点上都必须相同，否则由一个节点签发的
  令牌会被下一个节点拒绝。没有它，应用节点会拒绝启动
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)**：在每个应用节点和 worker 上都必须相同，否则
  由一个节点保存的凭据无法被另一个节点读取。套接字模式的 RTE 从不读取它；只有自行注册的、已弃用的数据库模式 RTE
  才需要它

还要让每个容器使用同一个数据库用户：只有当会话属于同一用户时，等待中的 worker 才能结束已失效 worker 的会话。

### worker 锁
{: .no_toc }

同一时间只有一个 worker 在工作。它持有数据库锁 `ansibleforms_worker`；当它停止时，数据库会释放该锁，
等待中的 worker 会在 10 秒内获取它。当 worker 的主机未经告别就宕机时，数据库可能会将该锁保持数小时，
因此一旦两分钟内没有任何 worker 写入心跳，等待中的 worker 就会结束那个会话并接管。

被另一个 worker 夺走锁的 worker 会停止，其容器会以等待者的身份重启。启动失败的 worker 也会
停止，因此它永远不会占着锁却什么都不做。Galera 和组复制不会在数据库节点之间共享该锁：请让每个
worker 都指向同一个数据库节点。

### 作业与节点
{: .no_toc }

每个容器都以 `<role>-<hostname>-<port>` 为自己命名，无需任何设置，**状态** 页面会列出所有容器及其角色
和版本、哪一个是 worker，并在它们运行不同版本时发出警告。

在 RTE 上运行的作业属于该 RTE，即使启动它的应用节点离开也会继续运行。其他任何作业（AWX 或其他运行器上的模板作业、
工作流作业，或已弃用的多步骤表单的各个步骤）都属于启动它的应用节点。重启的容器会结束自己未完成的作业，
worker 则会结束已有两分钟没有应答的容器的作业，例如被替换的 pod。

向任意节点发送 `SIGHUP` 都会重新应用 [配置种子](../seed/)：应用节点会请 worker 来执行。

### 升级
{: .no_toc }

**先升级 worker**，然后再升级应用节点。worker 负责修补 schema，新版本的应用节点会等待
schema 修补完成，并记录它在等待什么。先升级的应用节点在 worker 跟上之前一直处于未就绪状态，而旧节点会继续
提供服务。RTE 可以在任何时候跟进，只要它们使用相同的协议约定。

### 限制
{: .no_toc }

有几项功能只能留在一个节点上：

* **聊天助手** 将其对话保存在单个应用节点的内存中：请在负载均衡器上使用会话保持（nginx
  `ip_hash`），或只使用一个应用节点
* **日志** 保留在每个容器中。请将 [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) 设在共享卷之外，因为多个
  进程轮转同一个文件会丢失日志行。日志查看器显示的是应答请求的那个节点的日志，因此请集中收集日志
* **设置** 在设置页面上修改后会写入共享卷上的托管 `.env`，并在每个节点上生效；需要重启的设置
  则需要在每个节点上重启

---

## 示例布局

应用仓库在 [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale) 中提供了一个完整的起点：

| 服务 | 镜像 | 角色 |
|---|---|---|
| `db` | `mariadb:11` | 数据库，其用户只对 `AnsibleForms` schema 有权限 |
| `app1`、`app2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=app`，位于负载均衡器之后 |
| `worker1`、`worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`：第二个等待并接管 |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | 以 `RTE_MODE=inbound` 和 `RTE_FILES=local` 运行 playbook：由应用连接它 |
| `lb` | `nginx:stable` | 在 8443 端口上终止 HTTPS，并用 `ip_hash` 将浏览器分配到各应用节点 |

RTE 的运行器 `rte` 及其登录所用的凭据（其地址 `http://rte:8000` 和 `RTE_TOKEN`）在
[配置种子](../seed/) `seed.yaml` 中声明，worker 每次启动时都会应用它；RTE 不设置 `RTE_URL`，也不在主机上发布。

应用节点和 worker 共用一个 `.env`，其中包含数据库用户、`ENCRYPTION_SECRET`、`ACCESS_TOKEN_SECRET`、`RTE_TOKEN`、
`CONFIG_SEED_PATH`、负载均衡器之后的 `HTTPS=0`，以及设在共享卷之外的 `LOG_PATH`。RTE 没有 `env_file`：它只从
`compose.yaml` 获得 `RTE_TOKEN`，因此不持有数据库密码。应用节点、worker 和 RTE 挂载相同的
持久化卷和 ssh 卷：

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
