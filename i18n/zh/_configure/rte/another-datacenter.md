---
layout: default
title: 另一个数据中心
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# 位于另一个数据中心的 RTE
{: .no_toc }

从第二个数据中心的一台裸主机，到运行第一个 playbook 的出站 RTE
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

面向管理员：当第二个数据中心的受管主机应由该数据中心内的 RTE 访问，而不是由第一个数据中心访问时。

{: .note }
> **简便的方法。** [安装程序](../installation/installer.html#a-runner) 只需在 RTE 主机上运行一条命令，就能完成下面的所有步骤：
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`，加上 `--join afj_...` 即可立即获得批准。
> 本操作手册使用 Docker 或 Podman 手动完成同样的事情，便于您了解并调整每个部分。

---

## 最终结果

应用、其 worker 和数据库保持原位，位于数据中心 1。数据中心 2 新增一台主机，运行一个
出站模式的 RTE 容器（[`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE)，参见 [模式](modes.html#outbound)）：它通过
HTTPS 连接应用并保持一个打开的 WebSocket，作为独立的运行器加入，并针对数据中心 2 的受管主机运行
指定它的表单的 playbook。

| 位置 | 在那里运行的内容 | 与谁通信 |
|---|---|---|
| 数据中心 1 | 应用节点、worker、数据库（与现在相同） | 没有新的通信：它在通常的 HTTPS 地址上接收 RTE 的套接字 |
| 数据中心 2，RTE 主机 | Docker 或 Podman，以及 RTE 容器 | 通过 HTTPS 访问位于 `APP_URL` 的应用，以及数据中心 2 的受管主机 |

RTE 不持有数据库凭据，也没有 `ENCRYPTION_SECRET`，只有它自己的令牌。没有任何东西连接它，因此它不需要开放
端口、DNS 名称或证书。应用随每个作业发送 playbook 和清单（`RTE_FILES=transfer`，
默认值），因此 RTE 不需要它们的副本，也不需要共享磁盘。

除非另有说明，下面的每条命令都在 RTE 主机的终端中以具有 `sudo` 权限的用户运行。整个过程大约需要 20 分钟，
大部分时间都在等待镜像。

---

## 0. 开始之前

收集以下信息：

| 内容 | 来源 |
|---|---|
| 应用的地址 | `APP_URL`：用户在浏览器中打开的地址，例如 `https://forms.example.com`，如有基础路径也要包括 |
| 应用的证书 | 由公共 CA 签发、由私有 CA 签发（您需要其证书，见第 6 步）或自签名 |
| 代理 | 此数据中心访问数据中心 1 所用的 `HTTPS_PROXY`（如果有） |
| RTE 的名称 | 其运行器在 **连接 > 运行器** 下的名称，表单用 `runner:` 引用它，例如 `rte-dc2`：字母、数字和 `_ . : @ -` |
| 加入令牌 | 可选：[加入令牌](../runners/registration.html#join-tokens)（`afj_...`）可以立即批准 RTE。没有它时，由管理员批准（第 8 步） |
| ssh 密钥 | playbook 用于访问受管主机的私钥，或创建私钥的权限 |

应用必须运行 7.3.0 或更高版本。要为这一个 RTE 生成加入令牌，管理员需调用一次 API（参见
[加入令牌](../runners/registration.html#join-tokens)）：

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. 准备主机

RTE 是一个容器，因此主机只需要容器引擎：Node.js、python 和 ansible 都在镜像中。

| 需求 | 原因 |
|---|---|
| **x86_64**（amd64）上的 Linux | RTE 镜像只发布了 amd64 版本 |
| 2 个 CPU 和 4 GB 内存，或更多 | 一个 RTE 最多同时运行 [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) 个 playbook（10 个），每个都有自己的分支进程：请按此确定规格 |
| 20 GB 可用磁盘 | `-rte-full` 镜像约 3.3 GB，更新期间还要再加一个镜像，另外还有应用发来的作业文件和作业的临时文件 |
| Docker，或 Podman 加 podman-compose | 用于拉取和运行镜像 |
| 由 NTP 同步的时间 | 作业的时间会与应用的时间进行比较 |

**Docker**，在 Ubuntu 或 Debian 上（其他发行版：[docs.docker.com/engine/install](https://docs.docker.com/engine/install/)）：

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**，在 RHEL、Rocky 或 Alma Linux 上：

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

使用 Podman 时，请在下面的每条命令中将 `docker` 换成 `podman`，将 `docker compose` 换成 `podman-compose`。

---

## 2. 网络和防火墙

RTE 自己打开每一个连接。外部没有任何东西会访问它：

| 从 | 到 | 端口 | 原因 |
|---|---|---|---|
| RTE 主机 | 应用，位于 `APP_URL`（如设置了 `HTTPS_PROXY` 则经过它） | 应用的端口，大多数代理之后为 `443` | 作业、作业文件及其输出所经过的套接字 |
| RTE 主机 | 数据中心 2 的受管主机 | ssh（`22`）、WinRM、它们的 API | playbook 从这里运行 |
| RTE 主机 | `ghcr.io` | `443` | 用于拉取镜像，除非镜像来自您自己的镜像仓库或文件（第 4 步） |

不要为 RTE 开放任何入站端口。其 `PORT`（`8000`）只提供 `/live`、`/ready` 和 `/metrics`，供本机上的探针使用。

RTE 以 WebSocket 方式连接加上 `/api/v2/rte/socket` 的 `APP_URL`。应用前面的反向代理必须为该路径转发
协议升级（参见 [运行器 WebSocket](../production/reverse-proxy.html#runner-websockets)）。在这里检查应用是否应答：

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. 文件夹

所有内容都放在 `/opt/af-rte` 下。RTE 以用户 `node`（uid 1000）运行，因此其数据归该 uid 所有：

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| 文件夹 | 在容器中 | 保存的内容 |
|---|---|---|
| `data/` | `/app/dist/persistent` | spool（`rte-spool`：每个作业的输出和结束状态，直到应用保存它们）、应用发来的作业文件（`rte-files`）、私有 CA、playbook 安装的 python 库 |
| `data/ssh/` | `/home/node/.ssh` | playbook 的 ssh 密钥和 `known_hosts` |
| `data/ansible/` | `/etc/ansible/...` | 您自己的 `ansible.cfg`、角色和集合，以挂载而非打包进镜像的方式提供 |

请将 `data/` 保留在主机上：重启后的 RTE 仍会发送应用尚未保存的内容，并保留其作业文件缓存。

**ssh 密钥。** 复制 playbook 在数据中心 1 使用的密钥，或者为此数据中心生成一个，并将其公钥部分提供给受管主机：

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

然后将所有内容交给 uid 1000，并使密钥只有其所有者可读：

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. 镜像

二选一。

### 选项 A：官方镜像
{: .no_toc }

已发布的镜像位于 GitHub Container Registry 上，公开可用，无需登录（三个层级参见 [镜像](images.html)）。
请使用与数据中心 1 相同的层级。`:7` 跟随最新的 7 版本，与应用的 `:7` 一致：

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

无法访问互联网的主机可以从能访问的主机获取镜像：

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

或者将其推送一次到您自己的镜像仓库（`docker tag` 和 `docker push`），并在后续步骤中使用该名称。

### 选项 B：您自己的镜像
{: .no_toc }

当数据中心 2 的 playbook 需要官方镜像中没有的集合或 python 库时（例如用于此数据中心
vCenter 的 VMware 相关内容），请基于 `ansibleforms-rte-core` 构建：

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build --pull -t af-rte-dc2 /opt/af-rte/build
```

应用每发布一个新版本，都要重新构建它（参见 [构建您自己的 RTE](images.html#build-your-own-rte)）。有多台 RTE 主机时，构建
一次并推送到您自己的镜像仓库。离线时，像选项 A 一样对构建好的镜像使用 `docker save` 和 `docker load`。

---

## 5. 设置

为它生成一个新的 [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN)，至少 16 个字符。它就是这个 RTE 的密码：应用
将其保存在运行器的 RTE 凭据中，并用它密封每个作业的密钥。

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
RTE_MODE=outbound
APP_URL=https://forms.example.com
RTE_NAME=rte-dc2
RTE_TOKEN=<the new token>
# optional, the first time only : approved at once instead of waiting for an admin
RTE_JOIN_TOKEN=<afj_..., or remove this line>
PORT=8000
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

| 变量 | 含义 |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`：RTE 主动连接应用。没有它时，RTE 以已弃用的数据库模式启动 |
| [`APP_URL`](../customization/server.html#env_APP_URL) | 应用的地址，`http://` 或 `https://`，如有基础路径也要包括 |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | 其运行器的名称。未设置时：使用其节点 ID `rte-<hostname>-<port>`，它会随容器变化 |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | 它自己的令牌，至少 16 个字符。请妥善保存：此后运行器都用它登录 |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | 可选：加入令牌，仅在其运行器尚不存在或正在等待批准时使用 |

当网络需要时，添加以下变量：

| 变量 | 何时需要 |
|---|---|
| `HTTPS_PROXY`、`NO_PROXY` | RTE 通过代理访问应用：`HTTPS_PROXY=http://proxy.dc2.example.com:3128`。列在 `NO_PROXY` 中的主机（以逗号分隔，域名写作 `.example.com`）会直接连接 |
| `NODE_EXTRA_CA_CERTS` | 应用的证书来自私有 CA：将 CA 的证书放到 `/opt/af-rte/data/certificates/ca.pem`，并设置 `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` 接受应用的任何证书，包括自签名证书。仅限在一个受信任的网络内部使用：优先使用 `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer`（默认）随每个作业获取 playbook 和清单。保持不变，除非您自己在 RTE 上挂载它们（`local`） |

RTE 读取的其他设置见 [运行 RTE](run.html#settings)。`RTE_MAX_JOBS`、`RTE_CACHE_MB`、`RTE_FILES` 和
`RTE_DRAIN_SECONDS` 也可以稍后在其运行器页面上设置，那里的值优先于变量（参见
[RTE 的设置](../runners/runner-page.html#an-rtes-settings)）。

---

## 6. 启动

compose 文件将整个定义与设置放在同一个地方。将第 4 步的镜像填入 `image:`：

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7   # or af-rte-dc2, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    # the probes, on this host only : nothing connects to an outbound RTE
    ports:
      - "127.0.0.1:8000:8000"
    healthcheck:
      test: ["CMD", "node", "./healthcheck.js"]
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 30s
    volumes:
      - ./data:/app/dist/persistent
      - ./data/ssh:/home/node/.ssh
      - ./data/git/.gitconfig:/home/node/.gitconfig
      - ./data/ansible/ansible.cfg:/etc/ansible/ansible.cfg
      - ./data/ansible/roles:/etc/ansible/roles
      - ./data/ansible/collections:/etc/ansible/collections
EOF
cd /opt/af-rte && docker compose up -d
```

重启后 Docker 会再次启动它（`unless-stopped`）。Podman 没有守护进程来做这件事：请启用 `podman-restart.service`
（`sudo systemctl enable --now podman-restart`），或者使用 Quadlet 文件将容器作为 systemd 服务运行。在 SELinux
处于强制模式的主机上，请为每个卷加上 `:Z`（`./data:/app/dist/persistent:Z`）。

不使用 compose 时，用一条命令运行同样的容器：

```bash
docker run -d --name af_rte_dc2 --restart unless-stopped --stop-timeout 40 \
  --env-file /opt/af-rte/rte.env -p 127.0.0.1:8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

---

## 7. 在主机上检查

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

日志显示 RTE 启动、连接应用并建立连接：

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

没有加入令牌时，还会多一行说明它正在等待：
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`。请记下该指纹。

在套接字打开之前，`/ready` 返回 `503` 和 `not connected to the app`。健康检查只能说明进程在监听。

---

## 8. 批准

没有加入令牌时，RTE 会请求加入：**连接 > 运行器** 会在列表上方显示一条橙色提示，
**1 个运行器等待批准**。打开它，核对 **指纹** 与 RTE 日志中的指纹一致，并且 **模式** 显示为
出站，然后点击 **批准**（参见 [批准 RTE](../runners/registration.html#approving-an-rte)）。只有管理员才能批准。24 小时内
无人处理的请求会被删除，RTE 下次连接应用时会再次请求。

使用加入令牌时，运行器会立即获得批准，其描述中会注明该加入令牌。无论哪种方式，应用都会将 RTE 的令牌
保存在一个新的 RTE 凭据 `rte-dc2-rte` 中，此后 RTE 都使用自己的 `RTE_TOKEN` 登录：`RTE_JOIN_TOKEN` 不再
使用，您可以将其从 `rte.env` 中删除。

---

## 9. 在 AnsibleForms 中检查

1. **连接 > 运行器** 列出运行器 `rte-dc2`，类型为 RTE。打开 **列 > 连接**，即可在列表中看到 **已连接**
2. 打开它。其 **RTE** 选项卡显示 **模式** 为出站，**连接** 标记为 **已连接**；悬停时会显示持有该套接字的应用节点、
   RTE 的版本以及其正在运行的作业数量
3. 点击 **测试连接**：显示 **运行器连接正常**。它不调用任何东西：它读取哪个应用节点持有 RTE 的套接字
   （`runner_leases`），并检查 RTE 连接时使用的协议约定
4. 为它添加描述，例如 *Datacenter 2*
5. 将 **默认** 保留在数据中心 1 的运行器上，除非所有没有 `runner:` 的 playbook 表单都应该在数据中心 2 运行

**状态** 页面会在其他 RTE 旁边列出新的 RTE 及其版本。

---

## 10. 第一个作业

用一个不做任何更改的 playbook 验证整个链路。在应用的 playbook 中（其 playbook 文件夹或仓库，与
数据中心 1 相同），添加 `ping-dc2.yaml`：

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

然后在设计器中添加一个指定新运行器的表单：

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

启动它。应用随作业发送 playbook 文件夹和清单，RTE 按哈希保存它们，因此未改变的
文件夹永远不会发送两次。输出以 `Running on RTE rte-dc2 (outbound)` 开头，每台主机都显示 `pong`，作业
以成功结束。大于 [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB)（默认 512）的文件夹不会被
发送：作业会失败并说明原因。

---

## 11. 将表单发给它

表单在其指定的 RTE 上运行，因此请在数据中心 2 的每个表单中添加同样的一行：

```yaml
runner: rte-dc2
```

默认运行器和其他运行器类型参见 [运行器](../runners.html)。

---

## 出现故障时

RTE 将 `notice` 及以上级别的内容写入 `docker logs`。在套接字打开之前失败的连接（DNS 名称、端口被拒绝、
证书）只会以 `info` 级别显示为 `RTE: dialing the app again in <n> seconds`：请在 `rte.env` 中设置
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) 并重启它，即可看到
`RTE: socket to wss://...: <the error>`。

| 您看到的内容 | 位置 | 处理方法 |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `rte.env` 中缺少 `RTE_TOKEN` 或其太短 |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | 在 `rte.env` 中设置 `APP_URL` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` 必须以 `https://`（或 `http://`）开头 |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | `rte.env` 中缺少 `RTE_MODE=outbound` |
| 没有 `connected to the app` 这一行，`/ready` 一直为 `503` | `docker logs`、`/ready` | 检查第 2 步的网络：从这台主机 `curl` 应用、代理（`HTTPS_PROXY`、`NO_PROXY`）、应用的证书（`NODE_EXTRA_CA_CERTS`，第 5 步）。设置 `LOG_CONSOLE_LEVEL=debug` 查看错误 |
| `the app refused the socket (404)` 或 401、403 和 409 之外的其他状态 | `docker logs` | 反向代理没有转发 `/api/v2/rte/socket` 上的 WebSocket，或者 `APP_URL` 缺少应用的基础路径 |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | 已存在使用另一个令牌的运行器 `rte-dc2`。请将该令牌（运行器凭据的密码）提供给 RTE，或删除该运行器，让它请求加入 |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | 生成新的加入令牌，或删除 `RTE_JOIN_TOKEN` 并批准该 RTE（第 8 步） |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | RTE 使用新令牌重新安装了：请使用其运行器凭据的令牌，或请管理员修改它 |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | 出现在拒绝之后。修复原因后，执行 `docker restart af_rte_dc2`，而不必等待 |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | 批准它（第 8 步）。它已连接，但在此之前不接收作业 |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | 应用和 RTE 运行的版本使用不同的 [协议约定](images.html#the-contract)：将 RTE 更新到应用的版本（参见“更新”） |
| **未连接**，或 **测试连接** 显示 *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | 应用 | 没有任何应用节点持有其套接字：RTE 已停止，或无法访问应用。请查看其 `docker logs` |
| 作业等待后失败，显示 *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | 作业的输出 | 作业等待期间 RTE 没有连接 |
| ssh 密钥上出现 `Permission denied` | 作业的输出 | `data/` 中的文件必须归 uid 1000 所有（第 3 步） |
| 受管主机显示 `UNREACHABLE` | 作业的输出 | 从这台主机检查 ssh：密钥、`known_hosts`，以及通往主机的防火墙 |

在应用一侧，被拒绝的 RTE 会在应用日志中显示为 `Refused an RTE socket from <address>: <why>`。

---

## 更新

当应用升级到新版本时，也要在这台主机上跟进。在此期间，使用相同协议约定的 RTE 会继续工作；当某个版本
修改了协议约定时，其发行说明会指出这一点（参见 [协议约定](images.html#the-contract)）。在 `compose.yml` 或
Dockerfile 的 `FROM` 中使用 `:7` 时：

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

请在其上没有 playbook 运行时更新：停止时会等待 `RTE_DRAIN_SECONDS`（25）让正在运行的 playbook 结束，届时仍在运行的
会作为已放弃作业结束。它们在停止之前输出的内容会保留在 spool 中，并在 RTE 恢复后发送。离线时，在 `docker compose up -d` 之前
先 `docker load` 新镜像（第 4 步）。

---

## 回退

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

套接字关闭后，运行器会立即显示 **未连接**：不再有任何应用节点持有其套接字（`runner_leases`）。没有关闭套接字就消失的
主机，会在应用节点在套接字上收不到任何消息后约一分钟内显示 **未连接**。运行器会保留：
通过套接字加入的运行器永远不会被自动删除。请在 **连接 > 运行器** 下删除它，并在 **连接 > 凭据** 下删除其
凭据 `rte-dc2-rte`。请先从引用它的表单中删除 `runner:` 行：在此之前，这些表单的作业会等待该 RTE，最长为
`RTE_QUEUE_MINUTES`，然后失败。

---

## 扩充数据中心 2 的容量

在数据中心 2 的更多主机上重复第 1 到第 9 步，每台主机都使用自己的 `RTE_NAME` 和 `RTE_TOKEN`，例如 `rte-dc2-b`：每个都作为
独立的运行器加入，最多接收 [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) 个 playbook。表单用
`runner:` 选择其中一个。两个使用相同 `RTE_NAME` 的 RTE 不会分担工作：第二个会从第一个那里接管套接字（参见
[多个 RTE](several.html#several-rtes)）。

---

## 数据库模式的 RTE

在 7.3.0 之前，本操作手册设置的是数据库模式的 RTE：它持有数据库凭据（`DB_*`、`ENCRYPTION_SECRET`），通过 `3306` 端口
连接数据中心 1 的数据库，应用则通过其 `8000` 端口调用它。该模式自 7.3.0 起已弃用，并将在 8.0.0 中
移除。要在不新建运行器的情况下将这样的 RTE 迁移到出站模式，请在其上设置 `RTE_MODE=outbound`、`APP_URL` 和 `RTE_NAME`（其
运行器的名称），保留其 `RTE_TOKEN`，并删除 `DB_*`、`ENCRYPTION_SECRET` 和 `RTE_REGISTER`：参见
[数据库（已弃用）](modes.html#database-deprecated)。然后关闭它不再需要的 `8000` 端口和数据库端口。
