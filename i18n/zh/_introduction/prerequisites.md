---
layout: default
title: 前提条件
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# 前提条件
{: .no_toc }

安装 AnsibleForms 之前您需要准备什么
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 运行环境

AnsibleForms 以容器形式运行，或作为服务器本身上的 systemd 服务运行，对于自行构建的用户，也可以作为 Node.js 应用运行：

| 安装方式 | 您需要 |
|---|---|
| [安装程序](installation/installer.html) | amd64 或 arm64 上的 Linux、`curl` 或 `wget` 以及 `sha256sum`，以及它所安装到的引擎的要求（见下文） |
| [原生安装](installation/native.html) | Root、systemd 和受支持的 Linux（Ubuntu、Debian、RHEL 及其衍生版、SUSE）；其余由安装程序安装 |
| [Docker](installation/docker.html) | Docker 或 Podman，以及您自己的 MySQL 服务器 |
| [Docker Compose](installation/docker-compose.html) | Docker Compose 或 podman-compose；该项目也会启动 MySQL |
| [Kubernetes](installation/kubernetes.html) | 一个集群、Helm 3 和一个 StorageClass（或预先创建的 PersistentVolume） |
| [从源码安装](installation/from-source.html) | Node.js 26（至少 24）及 npm、Git，以及供运行 playbook 的 RTE 进程使用的 Ansible |

应用镜像 `ghcr.io/ansibleforms/ansibleforms` 包含 Node.js 以及服务器调用的工具（git、ssh、mariadb 客户端和
ytt），但不包含 Python 和 Ansible。playbook 在 RTE（运行环境）上运行，RTE 是第二个容器，使用
`ghcr.io/ansibleforms/ansibleforms-rte-full`，或使用您基于 `ansibleforms-rte-core` 构建的镜像（参见 [扩展](rte/)）。
只在 AWX、AAP、Ascender、Semaphore、Rundeck 或 Jenkins 上启动模板的表单不需要 RTE。

---

## 数据库

AnsibleForms 把作业、用户、凭据和连接存储在 MySQL 8 或更高版本，或 MariaDB 中。

首次启动时，它会自行创建 `AnsibleForms` schema。请为它创建一个专用的数据库用户，只授予该 schema 的权限，
不要使用 root：

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

它只需要这些：它会创建和修补 schema、进行备份，在有多个 worker 时还会结束已失效 worker 的会话。
如果该用户对所有数据库都有权限，**状态** 页面和日志会发出警告。应用节点和 worker 都使用这个
用户连接。socket 模式（出站或入站，参见 [模式](rte/modes.html)）的 RTE 不持有任何数据库凭据：只有
数据库模式（自 7.3.0 起已弃用）的 RTE 也会连接数据库。要自行创建 schema，请把 [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) 设为 `0`。
Docker Compose 项目和 Helm chart（使用 `mysql:8.4`）会为您启动一个数据库。

---

## 容量规划

没有经过测量的硬性要求：负载主要取决于同时运行的作业数量以及它们写入的输出量。
Helm chart 的默认资源设置是小团队的一个合理起点：

| 组件 | Requests | Limits | 卷 |
|---|---|---|---|
| AnsibleForms | 1 CPU，1 GiB 内存 | 4 CPU，4 GiB 内存 | 10 GiB |
| MySQL | 0.5 CPU，512 MiB 内存 | 2 CPU，2 GiB 内存 | 10 GiB |

应用容器不运行任何 playbook。每个 playbook 都是 RTE 上的一个 `ansible-playbook` 进程，带有其 forks：请根据每个 RTE 同时运行的 playbook
来规划其 CPU 和内存，最多 [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) 个（默认 `10`），要运行更多就运行更多
RTE。在 AWX、AAP、Ascender 或其他模板运行器上运行的作业对 AnsibleForms 的开销很小。

作业输出默认永久保存在数据库中。在繁忙的实例上请设置 [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)，
以免数据库无限增长。

---

## 网络

应用和每个 RTE 都监听各自的端口，并向您的表单和设置所使用的系统发起出站连接。

### 入站
{: .no_toc }

服务器监听端口 `8000`（[`PORT`](customization/server.html#env_PORT)），使用 HTTP；如果把
[`HTTPS`](customization/server.html#env_HTTPS) 设为 `1`，则使用 HTTPS。Docker Compose 项目把它发布在端口 443 上，
Helm chart 则通过 service 或 ingress 暴露它。RTE 也监听自己的 `PORT`，但只有应用会调用它：
请不要把它暴露在公共网络上。出站 RTE 完全不需要入站端口：它通过应用的端口主动连接应用。

### 出站
{: .no_toc }

开放从 AnsibleForms 到您所使用系统的连接：

| 目标 | 用途 |
|---|---|
| MySQL / MariaDB | AnsibleForms 数据库（`DB_HOST`、`DB_PORT`，默认 `3306`） |
| RTE | 通过一条 WebSocket 连接位于其运行器地址的入站 RTE，或者调用位于其 [`RTE_URL`](customization/server.html#env_RTE_URL) 的数据库模式 RTE，后者随后自行连接 MySQL；出站 RTE 则由它主动连接应用（参见 [模式](rte/modes.html)） |
| AWX、AAP、Ascender、Semaphore、Rundeck、Jenkins | 通过它们的 HTTP(S) API 在 [运行器](runners.html) 上启动并跟踪模板和作业 |
| 受管主机 | playbook 从 RTE 连接它们，例如通过 SSH 或 WinRM |
| LDAP、Entra ID、OIDC | 使用目录账户或单点登录账户登录 |
| Git 服务器 | 通过 HTTPS 或 SSH 克隆和拉取仓库 |
| REST API 和数据库 | 表单中表达式和查询的数据源 |
| HashiCorp Vault、CyberArk | 从 [密钥库](secret-stores/) 读取凭据 |
| 邮件服务器、Slack、Teams、Telegram、webhook | 通过 [通知通道](notification-channels.html) 发送作业通知和审批请求 |
| 模型提供方 | [聊天助手](chat/)，仅在开启时使用 |

要限制表达式的 REST 函数可以调用哪些主机，请参见
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) 和
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS)。

---

## 浏览器

Web 应用面向当前的浏览器构建：Chrome 或 Edge 111、Firefox 114、Safari 16.4 或更新版本。
不支持更旧的浏览器。

---

## 扩展

默认情况下，一个 AnsibleForms 容器同时运行 Web 应用和后台任务，旁边是一个 RTE。

要服务更多用户，请在负载均衡器后面运行多个应用节点（`AF_ROLE=app`），并配一个 worker（`AF_ROLE=worker`），由它运行
调度、备份和其他后台任务；同一时间只有一个 worker 在工作，第二个 worker 会等待接管。它们共享
数据库、持久化文件夹、`ACCESS_TOKEN_SECRET` 和 `ENCRYPTION_SECRET`。参见 [扩展](production/scaling.html)。要同时运行更多 playbook，
请运行更多 RTE：参见 [多个 RTE](rte/several.html)。
