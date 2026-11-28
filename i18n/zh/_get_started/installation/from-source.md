---
layout: default
title: 从源码安装
parent: 安装
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# 从源码安装
{: .no_toc }

从源码构建 AnsibleForms，并用 Node.js 运行
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 代码的组织方式

仓库包含两个 Node.js 应用，构建时会把它们合并为一个：

* **client**：Web 界面，用 Vue 3 编写，并用 Vite 构建为静态文件
* **server**：API，用 Express 编写。它把作业交给运行器、连接数据库，并提供构建好的 client。
  以 `AF_ROLE=rte` 启动时，同一个 server 就是运行 playbook 的 RTE（运行环境）

只有 client 需要构建；其输出放入 server 的 `views` 文件夹，与 [Docker 镜像](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile) 中的做法相同。

---

## 前提条件

从源码构建并运行需要扎实的 Linux 技能和一定的 Node.js 知识。每个组件都需要您自己安装。如果想
不用容器、也不用自己构建就运行 AnsibleForms，安装程序的 [原生安装](native.html) 会替您完成这一切：

* **Node.js 26**（`.nvmrc` 中的版本；至少 24），带 npm
* **Git**，用于获取代码和同步仓库
* **OpenSSH 客户端**，用于通过 SSH 使用 git；以及 **sshpass**，用于以 SSH 密码连接的 playbook
* **MariaDB 客户端**（`mariadb`、`mariadb-dump`），用于备份和恢复，搭配 MySQL 服务器时也需要
* **MySQL 8+ 或 MariaDB**，服务器可以访问到
* **Ansible**，供运行 playbook 的 RTE 进程使用（`ansible-playbook` 需在其 path 中）。应用进程本身不需要
  Ansible 和 Python；如果只使用模板表单（AWX、AAP、Ascender 和其他运行器），则完全不需要 RTE

按您的发行版安装它们：

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 来自 NodeSource 仓库，其他工具来自 Ubuntu 本身：

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 来自 NodeSource 仓库，其他工具来自 Debian 本身：

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js 来自 NodeSource，`sshpass` 来自 EPEL（在 RHEL 本身上，请按 Red Hat 文档的说明启用 EPEL）：

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

检查 `node --version`（26）和 `ansible-playbook --version`；数据库及其用户的设置，参见 [安装 MySQL](docker.html#install-mysql)。

---

## 获取代码

把仓库克隆到您选择的文件夹中，该文件夹归运行应用的用户所有。示例中使用 `/srv/apps/ansibleforms`：

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## 构建

在仓库文件夹中分三步构建。首先构建 client：

```bash
cd client
npm ci
npm run build
```

然后安装 server 的依赖：

```bash
cd ../server
npm ci --omit=dev
```

最后把构建好的 client 复制到 server 的 `views` 文件夹中：

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## 配置

server 从环境变量读取设置；在生产环境中，还会读取 `server/persistent/.env`，即
设置页面写入的文件。

从仓库根目录的示例文件开始，至少设置 MySQL 连接（`DB_HOST`、`DB_PORT`、`DB_USER`、
`DB_PASSWORD`）：

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

所有变量都在 [环境变量](../customization) 中说明。其余所有内容默认存储在 `server/persistent` 中：
`config.yaml`、`forms` 文件夹和自签名证书都会在首次启动时在那里创建，日志也在那里。
把您的 playbook 放到 `server/persistent/playbooks`，或者在 RTE 的环境中把 `ANSIBLE_PATH` 指向其他位置，因为由 RTE 读取它。

---

## 运行

以生产模式运行 AnsibleForms，或以开发模式运行以便修改代码本身：

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">生产</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">开发</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

在 `server` 文件夹中以生产模式启动 server：

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

从命令行启动的应用会在您注销时停止。[PM2](https://pm2.keymetrics.io/) 让它在
后台持续运行，崩溃后重启它，并在开机时再次启动它：

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

playbook 在 RTE 上运行：用 `AF_ROLE=rte` 在单独的端口上再启动一次同一个 server。应用会连接它并保持
一条 WebSocket 连接（`RTE_MODE=inbound`，参见 [模式](../rte/modes.html)），它从相同的文件夹运行 playbook
（`RTE_FILES=local`）。它也读取 `persistent/.env`，但不使用其中的任何数据库设置。把应用与 RTE 共享的令牌
（至少 16 个字符）以及声明 RTE 的配置种子添加到 `persistent/.env`：

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

[配置种子](../seed/) 声明一个包含 RTE 地址和令牌的 RTE 凭据，以及使用该凭据登录的
默认运行器 `rte`：

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

如果不使用种子，请在 **连接 > 凭据**（一个包含该地址和令牌的 RTE 凭据）和
**连接 > 运行器**（类型 RTE，**模式** 为 **入站**）下添加它们。然后启动 RTE，只监听 `127.0.0.1`：

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

RTE 的设置在 [运行 RTE](../rte/run.html) 页面中说明。检查 PM2 是否列出了这两个进程：

```bash
pm2 status
```

二者都是 `online`：

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

要修改代码本身，请在仓库根目录以实时重载方式启动所有组件：server 在端口 3001，RTE 在端口 8010，
client 在 `https://localhost:8443`。在此模式下，server 和 RTE 改为读取 `server/.env.development`：

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

RTE（`npm run dev:rte`）需要 path 中有 `ansible-playbook`，它会以数据库模式把自己添加为运行器，该模式已弃用，仅用于
开发；`npm run dev:local` 启动 client 和 server，但不启动 RTE。[贡献指南](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) 说明了需要运行的测试和检查。

</div>
</div>

---

## 首次运行

在浏览器中打开 server（使用示例 `.env` 时为 `https://your_ip:8443`）。如果数据库为空，会在
首次启动时创建 schema。

默认的管理员凭据为：

* 用户名：`admin`
* 密码：`AnsibleForms!123`
