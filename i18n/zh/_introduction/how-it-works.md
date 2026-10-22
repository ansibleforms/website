---
layout: default
title: 工作原理
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# 工作原理
{: .no_toc }

安装由哪些部分组成、启动时发生了什么，以及数据保存在哪里
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 架构

AnsibleForms 是一个 Node.js 服务器，提供 Web 应用和 REST API，后端为 MySQL 数据库。它从
YAML 文件读取表单，自身不运行任何东西：它把每个作业交给一个 [运行器](runners.html)。playbook 会交给您的某个 RTE
（运行环境）容器，由它运行 `ansible-playbook`；模板或作业则交给 AWX、AAP、Ascender、Semaphore、Rundeck 或 Jenkins：

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">AnsibleForms 架构</title>
<desc id="afd-desc">浏览器和可选的 MCP 客户端与 AnsibleForms 服务器通信。服务器把数据存储在 MySQL 和持久化文件夹中，并连接数据源、密钥库、git 仓库、登录提供方、通知通道、syslog 服务器以及可选的模型提供方。它的运行器把每个 playbook 交给一个或多个 RTE 容器之一，每个容器各通过一条 WebSocket 连接，RTE 运行 ansible-playbook 并把输出发回服务器；每个模板或作业则交给 AWX、AAP、Ascender、Semaphore、Rundeck 或 Jenkins。</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="99" text-anchor="middle">浏览器</text>
<text class="afd-s" x="105" y="118" text-anchor="middle">表单、设计器、作业、聊天</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">MCP 客户端</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">可选</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">AnsibleForms 服务器</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Web 应用和 REST API</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">表单引擎、表达式</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">工作流、调度</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">MCP 服务器（可选）</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">运行器</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">把每个作业交给其运行器</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">数据源</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">数据库、REST API、文件</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">密钥库</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Git 仓库</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">表单、playbook、配置</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">登录提供方</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">通知通道</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">邮件、Slack、Teams、webhook</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Syslog 服务器</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">日志、审计记录</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">模型提供方</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">可选，聊天助手</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">持久化文件夹</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">配置、表单、playbook</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="445" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="463" text-anchor="middle">作业、用户、凭据</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">RTE 容器</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">运行 ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbook，</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">模板、作业</text>
</svg>
</div>

图中的每个组件都有各自的作用：

| 组件 | 作用 |
|---|---|
| **浏览器** | Vue Web 应用：表单、[设计器](gui/designer-and-git.html)、作业历史和设置 |
| **AnsibleForms 服务器** | 对表单求值、记录作业、运行工作流和调度、把每个作业交给其运行器并跟踪它，并提供 [REST API](api/) |
| **运行器** | 作业运行的地方，在 **连接 > 运行器** 下添加：表单用 `runner: <name>` 指定一个，或使用其类型的默认运行器（参见 [运行器](runners.html)） |
| **RTE 容器** | 一个或多个运行环境容器，即以 `AF_ROLE=rte` 启动的同一个服务器：每个容器为 [ansible 表单](forms/ansible.html) 运行 `ansible-playbook`，使用其镜像中的 python 库和 collection，并通过一条 WebSocket 把输出和最终状态发回服务器，不持有数据库凭据（参见 [RTE 如何运行](rte/#how-the-rte-runs)） |
| **AWX / AAP / Ascender、Semaphore、Rundeck、Jenkins** | 用于模板和作业的运行器：[AWX 表单](forms/awx.html) 启动作业模板或工作流模板，[Semaphore](forms/semaphore.html)、[Rundeck](forms/rundeck.html) 和 [Jenkins](forms/jenkins.html) 表单启动它们的某个作业，服务器跟踪其输出 |
| **MySQL / MariaDB** | 保存作业及其输出、用户、凭据和连接；只有服务器读写它 |
| **持久化文件夹** | 保存 `config.yaml`、表单文件、playbook、日志和备份 |
| **数据源** | 填充字段：[数据库查询](formfields/enum.html)、[REST API](expressions/rest-apis.html)、文件和 [其他函数](expressions/remote.html) |
| **密钥库** | 在使用时提供凭据的用户名和密码，参见 [密钥库](secret-stores/) |
| **Git 仓库** | 对表单、playbook 和 `config.yaml` 进行版本控制 |
| **登录提供方** | 让用户登录：[LDAP、Entra ID 和 OIDC](authentication/)，以及本地用户 |
| **通知通道** | 传递 [通知](forms/notifications.html) 和审批请求：[邮件、Slack、Microsoft Teams、Telegram 或 webhook](notification-channels.html) |
| **Syslog 服务器** | 在日志和审计记录写入时接收它们，参见 [Syslog](production/logs.html#syslog) |
| **MCP 客户端、聊天** | 可选，默认都关闭：[MCP 服务器](mcp/) 和 [聊天助手](chat/)，后者需要模型提供方 |

默认情况下，一个容器同时运行服务器、Web 应用和后台任务，旁边是一个 RTE。如需在
负载均衡器后面运行多个应用节点、由一个 worker 运行后台任务，以及运行更多 RTE，请参见 [扩展](production/scaling.html)。

### 构建技术

服务器和 Web 界面基于以下组件构建：

| 部分 | 技术 |
|---|---|
| **服务器** | Node.js 和 Express |
| **数据库** | MySQL 或 MariaDB |
| **Web 界面** | Vue 3，搭配 Bootstrap 5 和 Font Awesome |

---

## 启动表单时发生了什么

无论来自浏览器还是来自 [REST API](api/jobs.html)，一次启动都会经过相同的步骤：

1. **加载**：服务器只发送用户的 [角色](config/roles.html) 所允许的表单，并对服务器端表达式求值
2. **提交**：浏览器把字段值转换为 extravars，并发送到 `POST /api/v2/job`
3. **检查**：服务器按用户的角色重新加载表单，在开启 [运行验证](launch-validation/) 时检查这些值
4. **记录**：作业以 `running` 状态存储，其 ID 以 `__jobid__` 添加到 extravars 中
5. **审批**：带有 [`approval`](forms/approval.html) 点的表单会等待审批人接受该作业
6. **凭据**：对于 playbook，由应用（而不是 RTE）从数据库或 [密钥库](secret-stores/) 读取表单的凭据
7. **运行**：作业交给其运行器，即表单用 `runner:` 指定的运行器或其类型的默认运行器。对于 playbook，应用通过 RTE 的 WebSocket
   把作业发送给其 RTE，凭据以只有该 RTE 能打开的方式密封，由 RTE 运行 `ansible-playbook`（参见 [RTE 如何运行](rte/#how-the-rte-runs)）；
   模板或作业则由 AWX、AAP、Ascender、Semaphore、Rundeck 或 Jenkins 运行。[工作流](workflows/) 会运行其节点，每个节点都作为
   一个独立的作业在其自己的运行器上运行
8. **跟踪**：服务器在输出到达时把它保存到数据库中，对于 playbook 由 RTE 通过其 socket 发送，对于
   其他运行器则从它们那里读取。表单页面每两秒重新读取一次作业，作业页面则在服务器
   通知每次变化时实时跟踪
9. **结束**：作业获得最终状态，如果表单有要求，其 [`notifications`](forms/notifications.html) 会通过邮件以及
   [通知通道](notification-channels.html) 发出

---

## 数据存储在哪里

AnsibleForms 把其状态保存在两个地方：MySQL 数据库和持久化文件夹。请同时备份两者。

### 在数据库中
{: .no_toc }

数据库 `AnsibleForms` 在首次启动时创建（除非 `ALLOW_SCHEMA_CREATION` 为 `0`），其中保存：

* 作业、其 extravars 和输出、调度以及保存的作业
* 本地用户、组和 API 令牌
* 用 `ENCRYPTION_SECRET` 加密的凭据，以及密钥库连接
* 运行器、通知通道（包括邮件）、syslog 服务器，以及 LDAP、SSO、仓库和聊天助手的设置
* 审计日志

### 在持久化文件夹中
{: .no_toc }

它在镜像中为 `/app/dist/persistent`，从源码运行时为 `server/persistent`；每个路径都有自己的 [变量](customization/paths.html)：

| 默认路径 | 变量 | 内容 |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | 类别、角色和常量 |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | 表单文件，`.yaml` 或 `.yml`，可以放在子文件夹中 |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | `ansible` 表单的 playbook 及其工作目录 |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | git 仓库的克隆 |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | 设计器在保存前创建的副本 |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | 数据库备份 |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | 通过 `file` 字段上传的文件 |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` 和 `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | `HTTPS` 为 `1` 时使用的证书和密钥 |
| `.env` | | 从设置页面保存的环境变量（除非 `ALLOW_ENV_EDIT` 为 `0`） |

生成的 SSH 密钥位于 [`HOME_PATH`](customization/paths.html#env_HOME_PATH) 中，默认在持久化文件夹之外。
