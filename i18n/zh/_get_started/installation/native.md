---
layout: default
title: 原生安装
parent: 安装
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# 原生安装
{: .no_toc }

不使用容器，直接在服务器上运行 AnsibleForms，由安装程序设置为 systemd 服务
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向不允许使用容器的服务器的管理员：[安装程序](installer.html) 会在服务器本身上安装 AnsibleForms 所需的一切，
之后还能升级和删除它。它安装的是 AnsibleForms 7.3.0 或更高版本。

---

## 所需条件

在安装程序的 **引擎** 步骤中选择 **直接安装在此服务器上，不使用容器**，或传入 `--mode native`。它需要：

* **Root**：用 `sudo` 运行安装程序（`curl -fsSL https://ansibleforms.com/install | sudo sh`）
* **systemd**：服务以 systemd 单元运行
* **受支持的 Linux**：Ubuntu、Debian、RHEL 及其衍生版（如 Rocky Linux 和 AlmaLinux）、SUSE Linux Enterprise 或 openSUSE
* **amd64 或 arm64**
* **互联网访问**：能访问发行版的软件仓库、GitHub、nodejs.org 以及 Python 和 Ansible 的包索引（发行包可以替代哪些下载，参见
  [离线环境](#air-gapped)）

在不满足这些条件的服务器上，该引擎会显示为 *直接安装在此服务器上（需要 root：请用 sudo 运行安装程序）* 或
*直接安装在此服务器上（此 Linux 不受支持）*。两种角色都可以这样安装：控制器和 [运行器](installer.html#a-runner)。

---

## 它安装什么

对于两种角色，安装程序都会从发行版的软件包安装以下内容：

| 软件包 | 用途 |
|---|---|
| `git` | 仓库 |
| ssh 客户端 | playbook 的连接 |
| MariaDB 客户端 | 应用的备份：`app.env` 会把 [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) 和 [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) 设为找到的客户端，即 `mariadb-dump` 和 `mariadb`，或较旧的 `mysqldump` 和 `mysql` |
| `ca-certificates`、`curl`、`tar`、`gzip` | 下载 |
| `libatomic` | Node.js 链接它，而最小化安装的服务器缺少它 |
| `sshpass` | 使用 ssh 密码登录的 playbook。在 RHEL 及其衍生版上，它来自 EPEL，安装程序会尝试用 `epel-release` 启用 EPEL；如果无法安装，安装会继续并给出提示 |
| MariaDB 服务器 | 仅限控制器：它的数据库 |

然后安装到安装文件夹中，每个下载都会对照其公布的校验和进行检查：

* **AnsibleForms**：应用 GitHub release 中的发行包 `ansibleforms-<version>-linux-<arch>.tar.gz`，即为
  Node.js 构建的应用。没有发行包的版本会提示 *不使用容器安装需要 AnsibleForms 7.3.0 或更高版本。*
* **Node.js**：发行包指定的主版本的最新版本，来自 nodejs.org
* **Python 和 Ansible**：先安装 uv，再用它安装 RTE 镜像所用的 Python，以及一个包含 Ansible 和
  full RTE 镜像所含库的虚拟环境，然后安装其 Ansible collection（参见 [RTE 镜像](../rte/images.html)）。这需要几分钟
* **初始文件**：[docker-compose 项目](https://github.com/ansibleforms/docker) 的
  `data` 文件夹中的表单、playbook 和设置，与全新的 Docker Compose 安装得到的相同。运行器只保留其 Ansible 配置、ssh 和 git 设置

对于控制器，它随后会在 MariaDB 中创建 `AnsibleForms` schema，以及一个以实例命名的数据库用户，该用户对该
schema 拥有全部权限，对其他内容没有任何权限，并且只能从此服务器登录。

---

## 文件夹

所有内容都位于安装文件夹中，默认为 `/opt/ansibleforms`（运行器为 `/opt/ansibleforms-runner`）：

| 路径 | 内容 |
|---|---|
| `releases/<version>/` | 一个版本：发行包、指向 Node.js 的链接、其 Python 虚拟环境和 collection |
| `current` | 指向正在运行的版本的链接；升级和回滚都会移动它 |
| `runtime/` | Node.js、uv 和 Python，各版本共用 |
| `data/` | 容器中挂载为 `/app/dist/persistent` 的内容：表单、playbook、`config.yaml`、配置种子、证书和日志 |
| `home/` | 系统用户的主目录：`.ssh` 和 `.gitconfig`，分别链接到 `data/ssh` 和 `data/git` |
| `app.env`、`rte.env` | 服务的设置和密钥，只有 root 和系统用户可读。RTE 的文件不含任何数据库设置 |
| `installer-backups/` | 安装程序在升级前或执行 `backup` 时创建的数据库备份 |

各版本和运行时归 root 所有，因此服务无法修改自己的代码；`data/` 和 `home/` 归系统用户所有。
数据库文件本身由 MariaDB 保存，位于该文件夹之外。

---

## 服务

控制器运行两个 systemd 服务，运行器运行一个。每个服务都以一个以实例命名的系统用户（默认为 `ansibleforms`）运行，
从 `current/server` 启动，并使用各自的设置文件：

| 服务 | 运行内容 | 设置 |
|---|---|---|
| `<name>` | 应用：Web 界面、API 和 worker。仅限控制器 | `app.env` |
| `<name>-rte` | 运行 playbook 的 RTE | `rte.env` |

控制器的 RTE 为 `inbound`，在 `127.0.0.1` 上使用单独的端口（`8001` 或下一个空闲端口，并设置
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`），从应用的文件夹运行 playbook（`RTE_FILES=local`），
并由配置种子 `data/seed.yaml` 声明为默认运行器。

运行器的 RTE 会获得模式、`APP_URL`、`RTE_NAME`，使用 `--join` 时还有加入令牌，并随每个作业接收 playbook（参见
[模式](../rte/modes.html)）。出站的 RTE 不接受来自应用的连接，因此只监听 `127.0.0.1`（`LISTEN_HOST=127.0.0.1`）。
入站的 RTE 使用 `data/certificates` 中为其自身地址签发的自签名证书提供 HTTPS，AnsibleForms 会固定该证书。
没有加入令牌时，它会请求加入，由管理员在 **连接 > 运行器** 下批准。

服务在开机时启动，失败后会重启。用 systemd 自带的工具管理它们并查看日志：

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

应用无需 root 即可监听 1024 以下的端口，例如 `443`。RTE 保留使用 `sudo` 的权限，在此服务器上带
`become` 的 playbook 需要它，因此 playbook 可以管理 RTE 所在的服务器。

---

## 升级和回滚

`sudo /usr/local/bin/ansibleforms-installer upgrade` 升级原生安装的方式与其他安装相同（参见 [升级](installer.html#upgrade)），
顺序如下：

1. 在正在运行的版本旁边放置新版本：其发行包、Node.js、Python、Ansible 和 collection。此时尚不触碰
   正在运行的服务
2. 添加该版本带来的新初始文件，保留所有已存在的文件
3. 把数据库（控制器）备份到 `installer-backups/`，并附上 `app.env` 和 `rte.env` 的副本
4. 停止服务，把 `current` 指向新版本，然后重新启动服务
5. 等待应用以新版本响应（运行器：等待其 RTE 重新开始监听）

如果新版本没有响应，安装程序会提议回滚：`current` 重新指向之前的版本，
数据库从备份中恢复，然后启动服务。只保留正在运行的版本及其前一个版本。

如果符合安装程序布局的原生服务旁边没有 `installer.json`（例如该文件被删除了），`install`
和 `upgrade` 会发现它们并提议接管（参见 [已有的安装](installer.html#an-existing-installation)）。

---

## 卸载

`sudo /usr/local/bin/ansibleforms-installer uninstall` 会停止并删除服务。它会保留文件夹和数据库，除非您选择删除
数据（或传入 `--purge`）并输入实例名称进行确认。这种情况下，它还会删除数据库及其用户（控制器）、
删除文件夹并移除系统用户。

软件包仍保持安装状态，包括 MariaDB：其他软件可能在使用它们。

---

## 离线环境

`--bundle` 从您复制到服务器上的发行包进行安装，而不是从 GitHub 下载。请从应用的 [Releases](https://github.com/ansibleforms/ansibleforms/releases)
中获取对应架构的文件 `ansibleforms-<version>-linux-amd64.tar.gz` 或 `-arm64`：

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` 对初始文件起同样的作用，使用 [ansibleforms/docker](https://github.com/ansibleforms/docker)
仓库的本地副本。Node.js、Python 及其软件包以及 Ansible collection 仍会在安装过程中下载。
