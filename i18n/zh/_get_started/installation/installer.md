---
layout: default
title: 安装程序
parent: 安装
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# 安装程序
{: .no_toc }

用一条命令在 Linux 服务器上安装、升级和维护 AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向管理员：这是得到可用实例，或为安装在别处的 AnsibleForms 部署运行器的最快方式。从 7.3.0 开始提供。

---

## 它安装什么

安装程序在全屏向导中提出几个问题，把每个回答都列出来供您确认，然后才对服务器进行更改。
它可以在四种引擎之一上安装两种角色之一：

| 角色 | 说明 |
|---|---|
| 控制器 | 完整的应用：Web 界面、其数据库和它自己的运行器。首次安装请选择此项 |
| 运行器 | 为安装在别处的 AnsibleForms 运行 playbook 的 RTE，例如位于另一个网络、DMZ 或另一个数据中心。它通过单个 WebSocket 与 AnsibleForms 通信，且不持有任何数据库凭据 |

可安装到的引擎：

| 引擎 | 运行方式 |
|---|---|
| Docker | [Docker Compose 项目](docker-compose.html)，运行在带 compose 插件的 Docker Engine 上。容器随 Docker 一起重启 |
| Podman | 同一个项目运行在 Podman 上，可以是 rootless 或 root，使用 podman-compose。由一个 systemd 单元在开机时启动容器 |
| Kubernetes | [Helm chart](kubernetes.html)，部署在 `kubectl` 可访问的集群上。控制器通过 ingress 对外提供服务；运行器使用 chart 的 runner 模式 |
| 直接安装在此服务器上 | 不使用容器：服务器上运行 Node.js、MariaDB 和 Ansible，AnsibleForms 作为 systemd 服务运行。参见 [原生安装](native.html) |

安装完成后，同一个程序还可以升级安装、进行备份、显示状态以及删除安装。它也能接管
不是由它安装的 AnsibleForms，例如根据 Docker Compose 项目手动搭建的实例（参见 [已有的安装](#an-existing-installation)）。

---

## 运行它

安装脚本会为此服务器下载安装程序并启动它：

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

常见的变体：以 root 身份运行，用于安装 Docker 或 Podman、直接安装在服务器上或安装到 `/opt` 下；带上命令或
参数（参见 [参数](#flags)）；以及使用指定版本的安装程序而不是最新版：

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

该脚本会：

1. 检查服务器运行的是 amd64 或 arm64 上的 Linux，并找到 `curl` 或 `wget` 以及 `sha256sum`
2. 从 [ansibleforms/installer](https://github.com/ansibleforms/installer/releases) 的最新版本，或 `AF_INSTALLER_VERSION` 指定的版本中
   下载 `ansibleforms-installer_linux_<arch>`
3. 对照该版本的 `checksums.txt` 进行校验，校验和不一致的下载一律不用
4. 将其保存为 `ansibleforms-installer`，root 用户保存在 `/usr/local/bin`，其他用户保存在 `~/.local/bin`，供以后升级和备份使用。
   通过 sudo 运行时，请使用完整路径：sudo 的 `secure_path`（例如在 Red Hat 系统上）经常不包含 `/usr/local/bin`
5. 用给定的参数启动它，即使脚本是通过管道传入的，也会从终端读取键盘输入

如果没有终端，例如在 CI 作业中，安装程序会以无人值守方式运行（参见 [无人值守](#unattended)）。

---

## 向导

向导一次问一个问题，步骤列在左侧。按 **Esc** 返回上一步，已填的回答会保留：

| 步骤 | 询问内容 |
|---|---|
| 语言 | 安装程序的语言，默认取自此服务器的 locale：加泰罗尼亚语、德语、英语、西班牙语、法语、意大利语、日语、荷兰语、波兰语、葡萄牙语或中文。最先询问，在安装程序报告它发现的任何安装之前 |
| 发行说明 | 所安装版本的新内容，破坏性变更、移除和弃用排在最前 |
| 角色 | 控制器或运行器 |
| 引擎 | Docker、Podman、Kubernetes，或直接安装在此服务器上 |
| 文件夹 | 安装文件夹和实例名称 |
| 加入、应用、模式 | 仅限运行器：参见 [运行器](#a-runner)。在 Kubernetes 上不询问模式 |
| 网络 | Web 界面或运行器的端口。Kubernetes 上不询问 |
| HTTPS | 浏览器如何连接控制器 |
| 管理员 | 第一个管理员的密码，输入两次 |
| 集群、Ingress、存储 | 仅限 Kubernetes：namespace 和 release、ingress（控制器）、存储类 |
| 确认 | 所有回答：**安装** 或 **修改回答** |

**引擎。** 列表显示此服务器已有的引擎。缺少的引擎会显示为 *Docker（未安装：安装程序会安装它）*，
Podman 也是如此：确认后，安装程序会用 Docker 官方脚本（`get.docker.com`，包含 compose 插件）安装 Docker，
或从发行版的软件包安装 Podman 和 podman-compose。这需要 root 权限。当 `kubectl` 和
`helm` 已安装并能访问集群时，会提供 Kubernetes 选项。*直接安装在此服务器上* 需要 root 权限和受支持的 Linux，选项变灰时会说明原因。

**文件夹。** 默认值：

| | 控制器 | 运行器 |
|---|---|---|
| 文件夹，以 root 身份 | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| 文件夹，以其他用户身份 | `~/ansibleforms` | `~/ansibleforms-runner` |
| 实例名称，Docker 或 Podman | `af` | `runner` |
| 实例名称，原生 | `ansibleforms` | `ansibleforms-runner` |

使用 Docker 或 Podman 时，该文件夹存放 compose 文件和包含密钥的 `.env`，以及所有数据：数据库、表单、playbook
和日志。它必须为空。实例名称由小写字母、数字和 `-` 组成，用作容器名的前缀（`af_app`、`af_db`、`af_rte`），因此多个
实例可以共用一台服务器。运行器的实例名称也是它在 **连接 > 运行器** 下的运行器名称（`RTE_NAME`）。

**网络。** 控制器的 Web 界面监听 `443`，或下一个空闲端口。随后 **HTTPS** 提供以下选项：

| 选项 | 作用 |
|---|---|
| HTTPS，使用为此服务器创建的自签名证书 | 为此服务器的名称签发的证书，有效期十年。浏览器会要求您接受一次 |
| HTTPS，使用我自己的证书和密钥 | 您自己的 PEM 格式证书和密钥，来自您的 CA 或 Let's Encrypt |
| HTTP，由前端的反向代理处理 HTTPS | 在该端口上使用纯 HTTP，供处理 HTTPS 的 nginx、Traefik 或负载均衡器使用 |

**管理员。** `admin` 用户的密码，输入两次，以免因输错而无法登录。留空时，安装程序会生成一个
强密码。

**结束。** 安装程序生成数据库密码和各项密钥，启动 AnsibleForms 并等待它响应。然后它会
显示要打开的地址、用户名和密码以及文件夹。为它安装的运行器会请求加入，由管理员在
**连接 > 运行器** 下批准（参见 [运行器](#a-runner)）。

---

## 运行器

运行器是为运行在别处的 AnsibleForms（7.3.0 或更高版本）服务的 RTE。它不持有任何数据库凭据：它使用自己的令牌
登录，AnsibleForms 把该令牌保存在一个 RTE 凭据中（参见 [模式](../rte/modes.html)）。在文件夹之后，向导
还会再问三件事：

| 步骤 | 询问内容 |
|---|---|
| 应用 | 此运行器为之工作的 AnsibleForms 的地址，即用户在浏览器中打开的地址 |
| 模式 | **出站：运行器连接到 AnsibleForms**（默认），或 **入站：AnsibleForms 连接到运行器** |
| 网络 | 运行器的端口，默认 `8000`。出站时，只有健康检查监听该端口，且只能从此服务器访问。入站时，还要询问 AnsibleForms 访问此服务器所用的地址 |

`--role runner` 会跳过角色问题，因此在运行器的服务器上执行以下命令，会直接从运行器的问题开始：

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

随后安装程序会连接 AnsibleForms。如果是自签名证书或私有 CA 签发的证书，会询问 **信任此证书？**：
选择是会在运行器上设置 [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)。它会读取 AnsibleForms 运行的版本，
拒绝低于 7.3.0 的版本，并以相同的版本安装运行器，无论安装程序本身默认会安装哪个版本。

对于 DMZ、NAT 或不允许任何入站连接的区域，请选择出站：只有从此服务器到 AnsibleForms 端口的
流量。对于由中心端发起所有连接的网络，请选择入站。

确认页面会显示 **注册方式：请求批准**，如果 `--join` 提供了令牌，则显示 **自行注册，使用加入令牌**。最后安装程序会
显示运行器的名称、模式、应用地址，入站时还有它自己的地址，然后说明它已请求加入 AnsibleForms：请在
**连接 > 运行器** 下批准它，批准前先确认那里显示的指纹与安装程序打印的一致：

```
Fingerprint: abcd-ef12
```

指纹是运行器令牌 `RTE_TOKEN` 的 SHA-256 的前 8 个十六进制数字，该令牌保存在文件夹的
`.env` 文件中（[原生安装](native.html) 时为 `rte.env`）。参见 [批准 RTE](../runners/registration.html#approving-an-rte)。使用 `--join` 时，运行器会立即获得批准：
它已自行注册，并在 **连接 > 运行器** 下显示为已连接。

入站运行器通过 HTTPS 提供其 socket。安装程序会为 AnsibleForms 访问它所用的地址创建一个自签名证书，
有效期十年，存放在文件夹的 `data/certificates` 中，并把 `RTE_URL` 设为 `https://<address>:<port>`。
运行器在请求加入时发送该证书，AnsibleForms 会固定（pin）它：只有当该运行器出示
同一张证书时才会连接它，因此不需要 CA。安装程序会在令牌指纹下方打印证书指纹：

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

它是证书 DER 字节的 SHA-256 的前 8 个十六进制数字，格式为 `xxxx-xxxx`。批准运行器之前，
请确认批准对话框显示的证书指纹与之相同。使用 `--join` 注册的运行器也会打印它。

在 Kubernetes 上，运行器就是 Helm chart 的 runner 模式，并且始终是出站的：向导不询问模式和网络，因为外部无法
连入它（参见 [Kubernetes](#kubernetes)）。

---

## Kubernetes

对于 Kubernetes 上的控制器，安装程序会把 [Helm chart](kubernetes.html) 安装到 `kubectl` 可访问的集群上：

| 问题 | 默认值 |
|---|---|
| Namespace | `ansibleforms` |
| Helm release 名称 | `ansibleforms` |
| Ingress 提供的主机名 | 无：必填，例如 `ansibleforms.example.com` |
| Ingress 类 | 集群中的某一个，默认 `nginx` |
| 通过 HTTPS 提供服务（使用 Ingress 证书）？ | 是 |
| 卷的存储类 | 集群默认值 |

管理员密码位于该 namespace 的 Secret `<release>-secrets` 中，键为 `ADMIN_PASSWORD`。安装程序把
chart 的 values 保存在其状态文件旁边的 `<release>-values.yaml` 文件中，并在升级时再次应用；`--values` 可添加您自己的文件。每个版本的 chart 会在该版本发布后不久发布。

对于运行器，安装程序以 [runner 模式](kubernetes.html#a-runner-on-kubernetes)（`runner.enabled`）安装同一个 chart：只有一个 RTE，
没有应用、没有数据库、也没有 ingress，由它主动连接 AnsibleForms（出站）。在询问应用地址之后，向导还会询问：

| 问题 | 默认值 |
|---|---|
| Namespace | `ansibleforms` |
| Helm release 名称 | `ansibleforms-runner`，也是它在 **连接 > 运行器** 下的运行器名称 |
| 卷的存储类 | 集群默认值 |

安装程序会生成运行器的令牌，并设置应用地址、运行器名称；如果您信任应用的证书，还会设置
`runner.appTlsVerify: false`。使用 `--join` 时，加入令牌会立即批准运行器；否则运行器会请求加入，
安装程序会打印其指纹，供您在 **连接 > 运行器** 下批准前核对。

---

## 命令

安装程序接受一个命令，放在参数之前或之后均可。不带命令时，它执行安装：

| 命令 | 作用 |
|---|---|
| `install` | 安装 AnsibleForms，作为控制器或运行器（默认）。如果服务器上已有安装，无论是它自己的还是它发现的，都会提议升级 |
| `upgrade` | 升级到更新的版本，先显示其发行说明（参见 [升级](#upgrade)） |
| `status` | 显示安装情况（角色、引擎和版本）及其容器、pod 或服务，以及它是否响应。然后列出它在服务器上发现的其他 AnsibleForms |
| `backup` | 立即备份数据库，保存到安装文件夹中的 `installer-backups`（在 Kubernetes 上为安装程序状态文件旁的 `backups`）。运行器没有需要备份的数据 |
| `release-notes` | 显示某个版本（`--version` 指定的或此安装程序的版本）的发行说明，破坏性变更在前 |
| `uninstall` | 删除安装，加上 `--purge` 时还会删除其数据 |
| `version` | 打印安装程序的版本 |

安装程序把安装信息记录在 `/etc/ansibleforms/installer.json`（root）或 `~/.config/ansibleforms/installer.json`
（其他用户）中，因此 `install` 之后的命令无需参数即可自行找到安装。该文件夹不包含二进制文件，
并且只有在安装程序安装或接管了一个 AnsibleForms 之后才会存在：

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` 会询问 **同时删除其数据（数据库、表单、playbook、日志）？**。要删除，请输入实例名称（在 Kubernetes 上为 Helm
release）；否则它只删除容器、pod 或服务，并保留数据。

---

## 参数

每个参数回答一个问题，向导随后会跳过该问题。`ansibleforms-installer --help` 会列出它们：

| 参数 | 回答的内容 |
|---|---|
| `--lang <code>` | 语言：`ca`、`de`、`en`、`es`、`fr`、`it`、`ja`、`nl`、`pl`、`pt` 或 `zh` |
| `--version <version>` | 要安装或升级到的 AnsibleForms 版本；默认为此安装程序的版本 |
| `--role <role>` | `controller` 或 `runner` |
| `--mode <mode>` | `compose`、`kubernetes` 或 `native` |
| `--runtime <runtime>` | `docker` 或 `podman`（compose） |
| `--install-runtime` | 缺少 Docker 或 Podman 时直接安装，不再询问 |
| `--dir <folder>` | 安装文件夹（compose） |
| `--name <name>` | 实例名称，即其容器的前缀（compose，默认 `af`） |
| `--port <port>` | 主机上的端口：控制器为 Web 界面端口，运行器为 RTE 端口 |
| `--tls <choice>` | `self`、`own` 或 `off`（compose 控制器） |
| `--cert <file>`, `--key <file>` | 证书和密钥文件，配合 `--tls own` 使用 |
| `--admin-password <password>` | 第一个管理员的密码；默认自动生成 |
| `--join <token>` | 通过 API 生成的加入令牌（`afj_...`），可立即批准运行器（运行器，无人值守；参见 [加入令牌](../runners/registration.html#join-tokens)） |
| `--app-url <address>` | 应用的地址，例如 `https://forms.example.com`（运行器） |
| `--runner-mode <mode>` | `outbound`（RTE 连接应用）或 `inbound`（应用连接 RTE）（运行器） |
| `--host <address>` | 此服务器的地址，由应用来连接（入站运行器） |
| `--namespace <namespace>` | Kubernetes namespace，默认 `ansibleforms` |
| `--release <release>` | Helm release，默认 `ansibleforms` |
| `--hostname <name>` | ingress 主机名（kubernetes） |
| `--ingress-class <class>` | ingress 类（kubernetes） |
| `--storage-class <class>` | 存储类（kubernetes） |
| `--values <file>` | 额外的 Helm values 文件（kubernetes） |
| `--purge` | 配合 `uninstall`：同时删除数据 |
| `--source <folder>` | 用于安装的 [ansibleforms/docker](https://github.com/ansibleforms/docker) 仓库本地副本（离线环境） |
| `--bundle <file>` | 用于原生安装的发行包 `ansibleforms-<version>-linux-<arch>.tar.gz`（参见 [原生安装](native.html#air-gapped)） |
| `--yes` | 所有问题都使用默认值回答（无人值守） |
| `--verbose` | 显示它运行的每条命令 |

---

## 无人值守

使用 `--yes` 或没有终端时，安装程序不会提出任何问题：参数回答各自的问题，其余问题使用默认值。它
会跳过语言、发行说明、管理员密码（自动生成，除非 `--admin-password` 提供了一个）和确认步骤，改为打印
发行说明的链接。只有在使用 `--install-runtime` 或 `--yes` 时，它才会安装缺少的 Docker 或 Podman；运行器
需要 `--app-url`。不带 `--join` 时，运行器会请求加入并等待管理员批准；带上它时，运行器会立即获得批准。

在 Docker 上安装控制器，缺少 Docker 时一并安装：

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

在 Podman 上安装入站运行器，应用通过 `rte-dmz.example.com:8000` 连接它：

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## 已有的安装

安装程序把它安装的内容记录在 `installer.json` 中。没有该文件时，`install`、`upgrade` 和 `status` 会先查找
服务器上已有的 AnsibleForms，无论它是如何安装的：

| 发现的类型 | 如何发现 | 何时接管 |
|---|---|---|
| Docker 或 Podman | 应用或 RTE 镜像的容器，按 compose 项目分组 | 文件夹中有 [ansibleforms/docker](https://github.com/ansibleforms/docker) 仓库的 compose 文件和 `.env`：服务 `mysqldb`、`app` 和 `rte`，容器为 `<name>_db`、`<name>_app` 和 `<name>_rte` |
| 7.2 运行器 | 在自己的 compose 项目中单独运行的 RTE，带有应用的 `DB_*` 且没有 `RTE_MODE`（数据库模式） | 其 compose 文件可读。升级会把它迁移到 socket 模式（参见 [7.2 运行器](#a-72-runner)） |
| Kubernetes | `ansibleforms` chart 的 Helm release，以及使用其镜像的 Deployment 和 StatefulSet | 它是该 chart 的一个 release：其当前 values 会成为它的 values 文件 |
| 原生 | 用 Node.js 运行 AnsibleForms 的 systemd 服务 | 它们符合安装程序的目录布局：`releases/`、`current`、`app.env` 和 `rte.env`（参见 [原生安装](native.html#the-folder)） |
| 无引擎 | 在常用端口上响应的应用或 RTE：443、3000、3001、8000、8001、8010 或 8443 | 从不：它是从源码或手动运行的。安装程序只会报告它 |

只计算应用和 RTE 的镜像：以 AnsibleForms 命名的 MySQL 容器不算一个安装。安装程序会列出它
发现的内容，每项一行，附上原因；对于无法接管的安装，还会说明需要手动做什么：其 compose 文件不是该仓库的、
其数据库在 compose 项目之外、它在 Kubernetes 上运行但未使用 Helm chart、它由 Argo CD 管理（请在那里升级，
即修改 Application 中的 chart 版本），或者无法读取其版本。

对于可以接管的安装，`install` 提供三个选项：

| 选项 | 作用 |
|---|---|
| 接管并升级 | 显示它将记录的内容，确认后写入 `installer.json`，然后继续 [升级](#upgrade) |
| 仍然在旁边安装一个新的 AnsibleForms | 第二套安装，拥有自己的文件夹、端口和数据库，需要单独确认 |
| 停止 | 不做任何更改 |

如果某个安装运行的版本已经是安装程序要安装的版本，第一个选项会改为 **接管**：安装程序
记录它的位置和运行方式，供今后备份、查看状态和升级使用，此时不做任何更改。

`upgrade` 提供相同的选项，但没有第二个，并且在没有可接管的安装时停止。无人值守时，`install` 会显示一条消息后停止，
而 `upgrade --yes` 只有在恰好发现一个可接管的安装时才会接管。Kubernetes release 的当前 values 会
保存在 `installer.json` 旁边，升级时会与新版本的 chart 一起再次应用。

---

## 升级

`ansibleforms-installer upgrade` 把安装迁移到同一主版本中更新的版本。它列出更新的版本，
最新的在前（无人值守时选择最新版本），并显示它所跨越的每个版本的发行说明，破坏性变更
和移除排在最前。如果其中包含破坏性变更，它会要求您确认已阅读；无人值守时，只有 `--yes` 才会继续。

安装程序会在任何更改之前备份数据库。如果新版本没有响应，它会提议回滚：恢复到之前的
版本，并从该备份恢复其数据库。它不会降级，也不会跨越主版本：跨主版本（例如从 6.x 到 7.x）
请遵循 [升级指南](../upgrade-7.html)，其中说明了升级前要在 6.5 上做的事情。

在 Docker 或 Podman 上，控制器的升级还会把它的文件更新到 docker 仓库的新版本：

| 文件 | 升级时的处理 |
|---|---|
| `docker-compose.yml` | 先在 `installer-backups` 中保存一份副本，然后替换为新版本的文件 |
| `.env` | 保留所有现有行，并添加新版本需要的键，其中的密钥按全新安装的方式生成。会先保存一份副本 |
| `data/seed.yaml` | 如果它是 docker 仓库附带且未修改的种子，则替换。手动修改过的会保留，新的种子保存在它旁边 |
| `data/` | 添加新版本带来的新文件，例如新的 playbook。已存在的文件全部保留 |

对于已存在的数据库，缺失的数据库设置（`MYSQLDB_USER` 或某个密码）无法凭空补上，因此升级会在
任何更改之前停止。回滚会把 compose 文件、`.env` 和种子恢复原样。

运行器与其 AnsibleForms 运行相同的版本：请先升级 AnsibleForms，再升级它的运行器。运行器的升级会为新的 RTE 镜像
重写其 compose 文件，并原样保留其 `.env` 和数据。

---

## 7.2 运行器

7.2 的运行器以数据库模式运行，该模式自 7.3.0 起已弃用：其 RTE 持有 AnsibleForms 的数据库设置。安装程序会发现
它（参见 [已有的安装](#an-existing-installation)），升级时会在同一个运行器下把它迁移到 socket 模式：

1. 从旧的 RTE 容器中读取运行器的名称（`RTE_NAME`）和令牌（`RTE_TOKEN`）。如果该 RTE 没有自行注册
   （`RTE_REGISTER=0`），则需要您输入其运行器在 **连接 > 运行器** 下的名称
2. 询问应用地址和模式，默认为 **出站**，也可选入站；入站时还要询问端口和此服务器的地址
3. 显示计划，然后把旧的 compose 文件和 `.env` 备份到 `installer-backups`
4. 写入安装程序的运行器布局，不含 `DB_*` 设置。保留 `RTE_MAX_JOBS`、`RTE_DRAIN_SECONDS`、
   `PROCESS_MAX_BUFFER` 和 `METRICS_TOKEN`，socket 模式的 RTE 仍会读取它们
5. 在旧 RTE 旁边启动新 RTE。新 RTE 使用该运行器自己的令牌登录，AnsibleForms 会自行把运行器迁移到
   新模式，**无需批准**：其作业以及引用它的表单都保持不变
6. 新 RTE 连接后，旧容器会被停止并删除

入站运行器与新安装的一样，通过带固定证书的 HTTPS 提供服务（参见 [运行器](#a-runner)），安装程序会打印其
证书指纹。如果旧 RTE 占用了新 RTE 需要的端口，会先停止旧 RTE，因此在新 RTE 连接之前
运行器处于离线状态。出站运行器的新 RTE 会使用 `127.0.0.1` 上的一个空闲端口，与旧 RTE 并行运行，不会中断。

如果安装程序无法从旧 RTE 读取令牌，您需要选择新 RTE 的登录方式：

| 选项 | 后续情况 |
|---|---|
| 输入运行器的令牌 | 即 **连接 > 凭据** 下该运行器的 RTE 凭据的密码。运行器保留其名称和作业 |
| 使用加入令牌作为新运行器加入 | [加入令牌](../runners/registration.html#join-tokens) 会以另一个名称添加一个新运行器。请手动停用旧运行器 |

如果新 RTE 没有连接上，安装程序会提议恢复旧文件并重新启动旧容器；如果 AnsibleForms
已经迁移了该运行器，请在 **连接 > 运行器** 下把它的模式改回数据库模式。新 RTE 连接后就
无法回退了：旧文件保留在 `installer-backups` 中。

如果 AnsibleForms 不知道具有该名称的运行器，新 RTE 会改为请求加入并等待批准。请在
**连接 > 运行器** 下拒绝该请求，然后使用运行器在那里的名称再次运行升级。

---

## 版本

安装程序的版本跟随应用：每个 AnsibleForms 版本都附带一个相同版本的安装程序，二者一同发布，
该安装程序默认安装该版本。`--version` 可安装其他版本。
[安装程序的 Releases 页面](https://github.com/ansibleforms/installer/releases) 上的每个版本都提供 amd64 和 arm64 上的 Linux 二进制文件，以及它们的
校验和。
