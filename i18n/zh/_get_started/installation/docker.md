---
layout: default
title: Docker
parent: 安装
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

使用 Docker 或 Podman 运行 AnsibleForms 应用镜像和 RTE 镜像，并连接您自己的 MySQL 服务器
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

您可以用 Docker 或 Podman 以两个容器的形式运行 AnsibleForms：应用本身，以及运行 playbook 的 RTE，二者连接到一个 MySQL 数据库。

---

## 前提条件

开始之前，您需要：

* **Docker 或 Podman**：安装其中之一并保持运行
* **MySQL**：已安装并正在运行

---

## 安装 MySQL

在容器可以访问到的 Linux 服务器上安装 MySQL 8+ 或 MariaDB：

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu 自带 MySQL 8：

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian 自带的是 MariaDB 而不是 MySQL，AnsibleForms 同样支持：

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 及更高版本及其衍生发行版在 AppStream 中提供 MySQL 8：

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms 通过网络连接数据库，使用 `DB_USER` 和 `DB_PASSWORD`。请为它创建一个专用用户，只授予
`AnsibleForms` schema 的权限，不要使用 root：

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

AnsibleForms 只需要这些：有了它，就能创建和修补自己的 schema 并进行备份。如果该用户对所有数据库都有权限，**状态** 页面和日志
会发出警告。在 Ubuntu 和 Debian 上，数据库服务器只监听 localhost：请在其配置中设置 `bind-address`，
以便容器能够访问它。

---

## 准备文件夹

AnsibleForms 7 运行在两个容器中：应用，以及运行 playbook 的 RTE（运行环境）。二者都挂载一个文件夹，用于存放
您的 `config.yaml`、表单、playbook、日志和证书，以及一个存放 SSH 密钥的文件夹。镜像以用户 `node`（uid 1000）运行，
因此请把这两个文件夹的所有权交给该用户：

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

把应用的设置写入一个环境文件：数据库连接、在存储任何凭据之前就要设置的
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)、应用与
RTE 共享的令牌（[`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN)，至少 16 个字符），以及声明 RTE 的配置种子：

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

RTE 有自己的文件，不含数据库设置：从 7.3.0 起由应用主动连接它，并保持一条 WebSocket 连接
（`RTE_MODE=inbound`，参见 [模式](../rte/modes.html)），它从相同的文件夹运行 playbook（`RTE_FILES=local`）：

```bash
sudo tee /srv/apps/ansibleforms/rte.env > /dev/null <<'END'
RTE_MODE=inbound
RTE_TOKEN=<the same token>
RTE_FILES=local
PORT=8000
HTTPS=0
END
sudo chmod 600 /srv/apps/ansibleforms/rte.env
```

[配置种子](../seed/) 声明一个包含 RTE 地址和令牌的 RTE 凭据，以及使用该凭据登录的
默认运行器 `rte`：

```bash
sudo tee /srv/apps/ansibleforms/persistent/seed.yaml > /dev/null <<'END'
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
END
sudo chown 1000:1000 /srv/apps/ansibleforms/persistent/seed.yaml
```

---

## 启动容器

运行 GitHub Container Registry 上发布的镜像（参见 [镜像标签](./#image-tags)）：
应用使用 [`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms)，
RTE 使用 [`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full)。

种子会把 RTE 作为默认运行器 `rte` 添加到 **连接 > 运行器** 下，因此 playbook 表单无需进一步设置即可在其上运行。
应用在首次启动时创建 schema，并在两个容器都运行后连接 RTE（示例 `config.yaml` 位于
[docker-compose 项目](https://github.com/ansibleforms/docker/blob/main/data/config.yaml) 中）：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

启动后会列出这两个容器：

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman 接受相同的选项，且不需要服务：

```bash
podman network create ansibleforms

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

启动后会列出这两个容器：

```bash
podman ps
```

</div>
</div>

应用监听端口 `8000`，除非设置 `HTTPS=1`，否则使用 HTTP。RTE 不会发布到主机上：只有应用在
网络内部连接它。`--stop-timeout 30` 让 RTE 在停止时有时间等待正在运行的 playbook 结束（RTE 的设置以及如何构建
您自己的 RTE，参见 [运行 RTE](../rte/run.html)）。

---

## 测试应用

容器启动后，在浏览器中打开 AnsibleForms：

* 打开 `http://your_ip:8000`（如果设置了 `HTTPS=1`，则使用 HTTPS）
* 以 `admin` / `AnsibleForms!123`（或您通过 `ADMIN_PASSWORD` 设置的密码）登录，并设置一个新密码
* 在 **连接 > 运行器** 下检查 RTE 是否以默认运行器 `rte` 列出，并且其页面上的
  **连接** 显示为 **已连接**
* 后续步骤：
  * 在 `forms` 文件夹中添加 YAML 文件，或使用内置的设计器来创建表单
  * 把您的 playbook 添加到所挂载持久化文件夹的 `playbooks` 文件夹中
  * 添加 LDAP 连接
  * 添加用户和组
  * 为模板表单添加运行器：AWX、AAP 或 Ascender、Semaphore、Rundeck 或 Jenkins
  * 为外部连接（例如其他 MySQL 服务器或 REST API）添加凭据，或添加要传给 Ansible playbook 的凭据
