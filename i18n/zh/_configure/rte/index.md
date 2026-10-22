---
layout: default
title: RTE
nav_order: 10
has_children: true
has_toc: false
permalink: /rte/
translated_from: 2c3f3f81ad8faaf18eac56f18782ef5f78111b04
---

# 运行时环境（RTE）
{: .no_toc }

RTE 是什么、它如何运行 playbook，以及它可以接触哪些内容
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：在运行 RTE、确定其规格或将其迁移到另一个网络之前，先了解 RTE。

| 页面 | 内容 |
|---|---|
| [镜像](images.html) | 三种 RTE 镜像，以及构建包含您的 playbook 所用集合的自定义镜像 |
| [模式](modes.html) | 出站、入站或数据库模式：谁打开连接、spool、作业的文件 |
| [运行 RTE](run.html) | 每种模式的设置，以及每种模式的 `docker run` 示例 |
| [多个 RTE](several.html) | 容量、同一地址后的副本，以及 RTE 停止或宕机时会发生什么 |
| [另一个数据中心](another-datacenter.html) | 操作手册：在第二个数据中心添加 RTE，从一台裸主机到运行第一个作业 |

---

## RTE 是什么

AnsibleForms 7 不在应用容器中运行任何 playbook。`ansible` 表单的作业会交给类型为 `rte` 的
[运行器](../runners.html)，即运行时环境：以 `AF_ROLE=rte` 启动的 AnsibleForms 服务器，搭配 python 和 ansible，没有 Web
界面。它通过一个 WebSocket 与应用通信，不持有任何数据库凭据
（[`RTE_MODE`](../customization/server.html#env_RTE_MODE) 为 `outbound` 或 `inbound`，参见 [模式](modes.html)）：应用将作业发给它，
RTE 运行 `ansible-playbook`，应用保存它发回的输出和最终状态，浏览器再从应用读取这些内容。

应用解析作业的凭据，并以仅供该 RTE 和该作业使用的密封形式交给 RTE。RTE 从不读取
凭据表或密钥库，playbook 也不会继承 AnsibleForms 自身的环境变量
（`ENCRYPTION_SECRET`、`DB_*`、`RTE_TOKEN` 等）：请将这类值作为 extravar 或凭据传入。7.0 到 7.2 的 RTE
会自己读写数据库，它在 7.x 中仍以已弃用的数据库模式运行（参见 [数据库模式](#database-mode-deprecated)）。

---

## RTE 如何运行

RTE 是您自己运行的容器，可以位于应用旁边，也可以位于另一个网络中：AnsibleForms 从不创建 RTE。下面依次介绍
它在哪里运行、与应用共享什么，以及从表单启动到 playbook 进程结束的整个过程中，
其内部发生了什么：

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">RTE 如何运行 playbook</title>
<desc id="afr-desc">在由运维人员管理的容器主机或 Kubernetes 集群中，应用容器与一个或多个 RTE 容器之间各保持一个 WebSocket，由应用（入站）或由 RTE（出站）打开。只有应用与数据库通信。1：浏览器在应用上启动表单。2：应用将作业保存到数据库，选择运行器，并为其密封作业的密钥。3：应用通过套接字发送作业。4：RTE 认领作业，并从其缓存或从应用获取作业的文件。5：RTE 以子进程方式启动 ansible-playbook，每个作业一个，最多 RTE_MAX_JOBS 个。6：playbook 访问受管主机。7：RTE 将输出、事件和结束状态写入其 spool，并通过套接字发送；应用将它们保存到数据库并确认收到。8：浏览器通过应用跟踪作业。只有在 RTE_FILES=local 时，应用的卷才会挂载到 RTE 中。</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">容器主机或 Kubernetes 集群</text>
<text class="afr-s" x="181" y="61">由您运行；出站 RTE 可以位于另一个网络</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">浏览器</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">表单、作业页面</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">应用容器</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">Web 应用、API、worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">运行器</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">密封密钥</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">RTE 中枢</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">保存后确认</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">RTE 容器</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="469" y="160" text-anchor="middle">作业文件</text>
<text class="afr-s" x="469" y="174" text-anchor="middle">按哈希缓存</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">最多 RTE_MAX_JOBS 个</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">保留至确认</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">一个</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">受管主机</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">应用的卷</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbook、清单</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">仅 RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">仅供应用使用</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="532" cy="161" r="9"/><text class="afr-nt" x="532" y="165" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

无论哪一方打开连接，图中每个 RTE 都只有一个套接字：应用主动连接入站 RTE，出站 RTE 主动连接应用（参见
[模式](modes.html)）。连接打开后，相同的消息在两个方向上传递，并且只有应用读写数据库。

**谁来启动它。** RTE 是一个长期运行的容器，由运行您其他容器的系统启动。它等待作业，
在作业之间保持运行：

| AnsibleForms 的运行方式 | 谁启动 RTE |
|---|---|
| `docker run` 或 `podman run` | 您自己，使用类似 [运行 RTE](run.html) 中的命令，在任何能访问应用或应用能访问的主机上运行 |
| [Docker Compose](../installation/docker-compose.html) | `docker-compose.yml` 中的 `rte` 服务，与 `app` 和 `mysqldb` 并列。其配置种子将它声明为默认运行器 `rte`，入站模式，地址为 `http://rte:8000` |
| [Helm chart](../installation/kubernetes.html) | Kubernetes，作为应用 pod 中名为 `rte` 的第二个容器（`containers.rte`）。应用在 `127.0.0.1` 上以入站模式连接它，chart 的种子将它声明为默认运行器 |
| [安装程序](../installation/installer.html) | 如上所述的 Docker Compose 或 Helm chart，或 [不使用容器](../installation/native.html) 的 systemd 服务；它自己的运行器会请求加入，并等待管理员批准 |

容器引擎由您负责：主机上的 Docker 或 Podman，或 Kubernetes 集群的容器运行时，由您安装并保持
更新。AnsibleForms 从不与它通信。应用和 RTE 都不会调用 Docker 或 Podman、挂载它们的套接字或启动
容器：应用只通过套接字与 RTE 通信。

**里面有什么。** 一个容器，只包含运行 playbook 所需的内容：

* **服务器**：与应用相同的 Node.js 服务器，在 `tini` 下以 `AF_ROLE=rte`（在镜像中设置）启动
* **省略的部分**：Web 界面、登录、调度器、worker 以及所有数据库模块，此角色不会加载它们
* **监听的内容**：其 `PORT`（`8000`）：用于探针的 `/live` 和 `/ready`、用于 Prometheus 的 `/metrics`，入站模式下还有应用
  连接的套接字 `/rte/v1/socket`。出站 RTE 不接受来自应用的连接
* **Python 和 ansible**：由您选择的镜像层提供（参见 [RTE 镜像](images.html)）
* **用户**：服务器和每个 playbook 都以 `node`（uid 1000）运行，从不以 root 运行

**与应用共享什么。** 它的令牌；使用 `RTE_FILES=local` 时还有应用的文件。使用默认的 `RTE_FILES=transfer` 时，
playbook 和清单随每个作业一起传送，RTE 不需要共享磁盘：

| 与应用共享 | RTE 用它做什么 |
|---|---|
| `RTE_TOKEN` | 在连接应用时出示它（出站），或在应用连接它时检查它（入站）。应用在运行器的 RTE 凭据中保存相同的值，作业的密钥也用它密封 |
| 持久化卷 `/app/dist/persistent`，仅在 `RTE_FILES=local` 时 | playbook 文件夹（[`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)），或 worker 克隆到 [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) 下的 playbook 仓库、清单（[`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) 和清单仓库）以及上传文件。RTE 会将作业的 extravars 文件写入 playbook 文件夹，因此请以读写方式挂载 |
| ssh 文件夹 `/home/node/.ssh` | playbook 的 ssh 连接所用的私钥和 `known_hosts`：挂载应用的（在其设置页面上管理），或为 RTE 提供它自己的 |

RTE 不克隆任何内容：仓库通过作业的文件到达它，或位于它与应用共享的卷上。集合、角色和
`ansible.cfg` 来自镜像，或者来自您挂载到 `/etc/ansible/collections`、`/etc/ansible/roles` 和 `/etc/ansible/ansible.cfg`
的文件夹（Docker Compose 项目就是这样做的），或者来自 playbook 旁边的 `ansible.cfg`。

**作业的生命周期。** 下面的编号与图中的编号对应，适用于从浏览器或 API 启动的 playbook 表单：

1. **启动**：应用检查表单及其值，构建 extravars，并以状态 `running` 保存作业。带有
   [审批](../forms/approval.html) 的表单会在这里停住，直到审批人接受，在此之前不会到达任何 RTE
2. **选择运行器**：应用使用表单以 `runner: <name>` 指定的 RTE，否则使用类型为 RTE 的默认运行器，并将其
   名称保存在作业上。它从数据库或 [密钥库](../secret-stores/) 解析作业的凭据、ansible 登录信息和
   vault 密码，并用 AES-256-GCM 以从该运行器令牌和作业 ID 派生的密钥将其密封
3. **交接**：持有该 RTE 套接字的应用节点将作业发给它：extravars、表单的选项、密封的密钥以及
   作业文件的哈希。任何应用节点都可以启动作业；持有套接字的节点会在两秒内发送。RTE 已满
   或未连接时，作业会等待，最长为 [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **认领**：RTE 回复 `claimed`；当它已满、正在停止、无法打开密钥，或作业带有与其自身不同的
   [协议约定](images.html#the-contract) 时，回复 `refused`。使用 `RTE_FILES=transfer` 时，它按哈希从缓存中获取 playbook 和清单，
   向应用请求它没有的哈希，并将它们解压到作业专属的文件夹中
5. **开始**：在 playbook 文件夹（加上表单的 `playbookSubPath`，该路径必须存在）中写入两个文件：包含表单值和凭据的
   `extravars_<id>.json`，以及一个包含 ansible 登录信息的隐藏文件。然后它以自己的子进程启动 `ansible-playbook`，
   不经过 shell，位于独立的进程组中，使用 `-e @` 指向这些文件，每个清单一个 `-i`，并带上表单的 tags、limit、check、
   diff 和详细级别。vault 密码通过 stdin 传入，从不写入文件或命令行，进程以
   `node` 身份在经过过滤的环境中运行（见下文）
6. **运行**：playbook 从 RTE 容器连接受管主机，通过 ssh 使用 `/home/node/.ssh` 中的密钥和 `known_hosts`，
   密码登录时使用 `sshpass`，或者通过其模块调用的 API。需要能访问这些主机的是 RTE，而不是应用
7. **输出与结束**：RTE 每半秒或每 64 KB 将 stdout 和 stderr 打包一次，掩码凭据，并为每批
   编号。它在发送之前会把每一项写入其磁盘上作业的 spool：输出、事件、
   `.joblogs/job_log_<id>.log` 中的作业日志（每 2 秒）、开始以及带有最终状态（`success`、`failed` 或 `aborted`）的结束。应用
   每一项只保存一次并确认收到，结束状态保存后，RTE 会丢弃该 spool。某个流超过
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) 字节（默认 50 MB）后，它不再发送更多内容，
   playbook 继续运行。然后应用发送表单的 [通知](../forms/notifications.html)
8. **跟踪**：浏览器从不与 RTE 通信：表单页面每 2 秒通过应用重新读取作业，作业页面
   则在应用保存每一项时实时跟踪

**套接字断开。** playbook 继续运行。RTE 重新连接（出站），或某个应用节点再次连接它（入站），并重新发送
应用尚未确认的内容：应用会跳过已经保存的内容，因此不会丢失任何一行，也不会重复保存。前提是套接字
在两分钟内恢复：应用只在套接字打开时写入 RTE 的心跳，一旦该心跳已过去两分钟，
worker 就会将该 RTE 正在运行的作业作为已放弃作业结束，即使其 playbook 仍在运行。请将 spool
（[`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)）放在卷上，这样重启后的 RTE 仍能发送它保留的内容。
RTE 重启时正在运行的 playbook 无法继续：当 RTE 回来时没有它，应用会将其作业作为已放弃作业结束。

**中止。** 中止会设置作业的中止标志，持有该 RTE 套接字的应用节点会在两秒内发送 `cancel`。RTE
向 playbook 的进程组发送 `SIGTERM`，因此 `ansible-playbook` 及其启动的每个分支进程会一起停止，作业以
`aborted` 结束。早于作业到达的取消请求会保留一分钟，作业随后以中止状态开始。

**清理。** 进程一旦退出，无论结果如何，RTE 都会删除两个 extravars 文件（设置了 `keepExtravars` 的表单
会保留可见的那个，但从不保留隐藏的那个）、`/tmp` 中的工件文件、作业日志文件以及作业专属的文件文件夹。
结束状态只保存一次：第二个写入者（例如应用让 RTE 已经结束的作业失败）不会改变任何内容。

**每个作业一个进程，而不是每个作业一个容器。** AWX 和 AAP 会为每个作业从执行环境镜像启动一个新的 pod 或容器。
AnsibleForms 不启动任何东西：RTE 容器已经在运行，每个作业都是其中的一个子进程。作业启动时
无需拉取镜像或调度 pod，AnsibleForms 也不需要您的容器引擎或集群的任何权限。相应地，
在同一个 RTE 上运行的 playbook 共享其 CPU、内存、`/tmp`、主目录和 python：请为容器分配足够的资源，以运行
`RTE_MAX_JOBS` 个 playbook 及其分支进程。要改变 playbook 可以使用的内容，请修改镜像，而不是作业。

---

## 安全边界

RTE 运行的是表单作者编写的代码，因此它被设计为持有尽可能少的东西：

* **只有它的令牌**：RTE 不持有数据库凭据，也没有 `ENCRYPTION_SECRET`。除了应用通过套接字使用其令牌发起的调用外，
  它不接受任何调用，没有用户、没有登录，也没有网页。通过套接字，它只能运行应用发给它的作业、报告这些作业并
  请求它们的文件：它不能创建作业、读取其他作业或分发凭据
* **密封的密钥**：运行作业时，RTE 从不读取凭据表或密钥库。它获得的是自己运行的作业的密钥，
  并且仅为其令牌和该作业 ID 密封，因此发给另一个 RTE 或另一个作业的数据包无法打开，被改动过一个字节的数据
  也会被拒绝
* **经过校验的连接**：出站时，RTE 校验应用的证书。通过 HTTPS 入站时，应用在 RTE 加入时固定其证书，
  之后只有在 RTE 出示该证书时才会连接它（参见 [模式](modes.html#inbound)）。通过纯 HTTP 的入站 RTE 应位于
  私有网络中，例如 Docker Compose 项目的网络
* **不继承环境**：`ansible-playbook` 获得的 RTE 环境中去掉了 AnsibleForms 自己读取的所有变量
  （`ENCRYPTION_SECRET`、`DB_PASSWORD`、`RTE_TOKEN`、`VAULT_TOKEN`、`ACCESS_TOKEN_SECRET`、`MYSQL_*` 等），因此
  `lookup('env', ...)` 无法获取它们。您为 playbook 设置的变量（`PATH`、代理、`ANSIBLE_*`）会原样传递
* **不使用来自用户的模板**：{% raw %}包含 `{{`、`{%` 或 `{#` 的表单值会以 unsafe 字符串的形式到达 playbook，{% endraw %}
  ansible 从不对其进行模板渲染，除非表单设置了 `allowJinjaInExtravars`，并且命令行从不经过 shell 运行
* **不是 root**：RTE 及其 playbook 以 `node`（uid 1000）运行，因此 playbook 能做的就是该用户在容器中能做的事，例如
  读取其文件和 ssh 密钥，仅此而已

请像对待应用一样谨慎对待它的容器、镜像和环境。

---

## 数据库模式（已弃用）

7.0 到 7.2 的 RTE（没有 `RTE_MODE`）在整个 7.x 中都可以运行，并将在 8.0.0 中移除。它与上述步骤有四点不同：

* **它持有数据库**：其 `DB_*` 设置，以及在自行注册时的 `ENCRYPTION_SECRET`
  （[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER)）
* **交接是一次 HTTP 调用**：应用携带令牌和密封的密钥调用 `POST <address>/rte/v1/jobs`，RTE 通过
  在数据库中把自己的名称写到作业上来认领该作业（第 3 和第 4 步）
* **它自己写入输出**：分批写入数据库，没有 spool（第 7 步）。中止通过作业的中止标志到达它，
  它每 2 秒读取一次该标志，另外还有 `/cancel` 调用
* **它从应用的卷读取文件**：它需要与应用相同的磁盘，与 `RTE_FILES=local` 相同

其运行器页面上没有任何 [RTE 设置](../runners/runner-page.html#an-rtes-settings)：它读取自己的变量。要将其迁移到
套接字模式，参见 [模式](modes.html#database-deprecated)。
