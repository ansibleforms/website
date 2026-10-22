---
layout: default
title: Docker Compose
parent: 安装
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

使用 docker-compose 或 podman-compose 一并安装 AnsibleForms、其 RTE 和 MySQL
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

[docker-compose 项目](https://github.com/ansibleforms/docker) 运行三个容器：MySQL、AnsibleForms 应用，以及运行 playbook 的 RTE
（运行环境）。该项目包含它们的设置、示例表单和 playbook，因此唯一的其他要求就是
Docker 或 Podman 及其 compose 工具。

[安装程序](installer.html) 用一条命令下载这个项目、填好设置和密钥并启动它。本页
介绍如何手动搭建。

---

## 前提条件

开始之前，您需要：

* **Linux 机器**：任意发行版，CPU 和内存要求不高
* **GitHub 访问**：用于从 GitHub 下载或克隆 docker-compose 项目
* **Docker 或 Podman**：容器引擎，安装方法见下文
* **compose 工具**：Docker Compose 或 podman-compose，用几个配置文件启动这三个容器

**视频**：[如何安装 AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## 选择安装位置

为项目创建一个文件夹；示例中使用 `/srv/apps`：

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## 克隆 docker-compose 项目

安装 Git：

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

然后把 docker-compose 项目克隆到该文件夹中：

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## 设置正确的权限

应用和 RTE 以用户 `node`（uid 1000）运行，因此请把 `data` 文件夹的所有权交给该用户：

```bash
sudo chown -R 1000:1000 ./data
```

如果您从 6 升级而来（6 的容器以 root 运行），请在启动 7 之前执行一次同样的 `chown`。MySQL 启动时会收回它自己的文件夹。

---

## 安装容器引擎

安装 Docker 或 Podman，以及各自的 compose 工具：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

从 Docker 的软件仓库安装 Docker Engine 及 Compose 插件
（参见 [Docker 安装手册](https://docs.docker.com/engine/install)）：

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

然后让容器内部能够解析名称，并将 Docker 作为服务启动：

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman 不需要服务。将它与 podman-compose 一起安装：

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## 自定义

检查 `.env` 和 `docker-compose.yml` 文件中的变量，并修改每一个密码：`MYSQLDB_ROOT_PASSWORD`、
`MYSQLDB_PASSWORD`、`ADMIN_PASSWORD` 和 `RTE_TOKEN`。[进一步了解环境变量](../customization)

应用以 `ansibleforms`（`MYSQLDB_USER`）身份连接 MySQL，对 `AnsibleForms` schema 拥有全部权限，对其他内容
没有任何权限；root 只供 MySQL 自身使用。MySQL 只在首次启动时创建该用户：此前一直以 root 连接的安装
需要手动创建一次，方法见项目的 [README](https://github.com/ansibleforms/docker#database)。

RTE 不会发布到主机上。从 7.3.0 起，应用使用 `RTE_TOKEN` 连接 `http://rte:8000`，并保持一条 WebSocket 连接
（`RTE_MODE=inbound`，参见 [模式](../rte/modes.html)）：RTE 不获取数据库设置，也不读取 `.env`，只在
`docker-compose.yml` 中拿到它的令牌和几个自己的设置。配置种子 `data/seed.yaml` 声明一个包含该令牌和
地址的 RTE 凭据，以及使用该凭据登录的默认运行器 `rte`（inbound 模式）。RTE 从同一个 `data` 文件夹运行 playbook
（`RTE_FILES=local`）。当您的 playbook 需要更多 collection 或 Python 库时，请构建您自己的 RTE，
并让 `rte` 服务指向它（参见 [构建您自己的 RTE](../rte/images.html#build-your-own-rte)）。

---

## 启动 docker-compose 项目

在后台启动这三个容器。应用会等待 MySQL 进入健康状态，然后连接 RTE：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## 测试应用

容器启动后，在浏览器中打开 AnsibleForms：

* 打开 `https://your_ip`（端口 443，参见 .env 文件中的 `WEBAPP_LOCAL_PORT`）
* 以 `admin` 和 `.env` 文件中的 `ADMIN_PASSWORD` 登录；如果它仍是默认的 `AnsibleForms!123`，请设置一个新密码
* 在 **连接 > 运行器** 下检查 RTE 是否以默认运行器 `rte` 列出，并且其页面上的
  **连接** 显示为 **已连接**
* 后续步骤：
  * 在 data/forms/ 文件夹中添加 YAML 文件，或使用内置的设计器来创建表单
  * 把您的 playbook 添加到 data/playbooks/ 文件夹中
  * 添加 LDAP 连接
  * 添加用户和组
  * 为模板表单添加运行器：AWX、AAP 或 Ascender、Semaphore、Rundeck 或 Jenkins
  * 为外部连接（例如其他 MySQL 服务器或 REST API）添加凭据，或添加要传给 Ansible playbook 的凭据
  * 连接 Git 仓库，并选择您的表单和/或 playbook 是否与某个仓库同步

---

## 文件结构

docker-compose 项目的文件夹结构如下：

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
