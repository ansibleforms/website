---
layout: default
title: Docker
parent: 升级
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

升级不使用 docker-compose 的独立容器
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

独立安装通过替换其容器来升级：拉取新镜像，删除旧容器，并用相同的 `run` 命令
启动新容器。从版本 7 起有两个容器：AnsibleForms 和运行 playbook 的 RTE，二者始终使用同一个版本。
您的文件存储在所挂载的 `/app/dist/persistent` 文件夹中，数据存储在
MySQL 中，因此两者都会被保留。

---

## 升级之前

做好升级准备，以便出现问题时可以回退：

* 在 **设置 → 备份** 下 **进行备份**。新版本会在首次启动时升级数据库 schema。
* **阅读 [更新日志](../changelog)** 中从您的版本到新版本之间的各个版本。
* **要迁移到新的主版本？** 请先遵循 [升级到 v7](../upgrade-7.html)。
* **从 6.5 升级？** 7 的镜像以 uid 1000 而不是 root 运行：请把您挂载的文件夹交给该用户，执行一次即可，
  例如 `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`。
* **从 7.2 升级？** RTE 有了自己的文件，并由应用主动连接它：先参见 [从 7.2 到 7.3](#from-72-to-73)。

---

## 从 7.2 到 7.3

在 7.2.0 及之前，RTE 读取应用的环境文件（包含数据库设置），并根据 `RTE_URL` 把自己添加为运行器。这
就是数据库模式，在 7.3.0 中弃用，并在 8.0.0 中移除。从 7.3.0 起，应用主动连接 RTE 并保持一条 WebSocket 连接
（`RTE_MODE=inbound`，参见 [模式](../rte/modes.html)），RTE 不再持有任何数据库设置。在执行步骤 2 之前，做一次以下操作：

1. 像 [安装](../installation/docker.html#prepare-the-folders) 时那样创建 `/srv/apps/ansibleforms/rte.env`，内容为
   `RTE_MODE=inbound`、相同的 `RTE_TOKEN`、`RTE_FILES=local`、`PORT=8000` 和 `HTTPS=0`。不要 `DB_*`、`ENCRYPTION_SECRET` 和 `RTE_URL`
2. 以该模式声明运行器。可以添加安装时的 [配置种子](../seed/)，即包含 RTE 凭据
   （`url: http://rte:8000`、`password: ${RTE_TOKEN}`）和运行器 `rte`（`rte_mode: inbound`）的 `persistent/seed.yaml`，并在
   应用的环境文件中添加 `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml`。或者不使用种子，在
   **连接 → 运行器** 下打开该运行器，把其 **模式** 设为 **入站**，并选择一个包含 `http://rte:8000` 和该令牌的 RTE 凭据

使用种子时，应用的环境文件中也要有 `RTE_TOKEN`，即同一个令牌，因为种子从那里读取它。

---

## 1. 拉取新镜像

下载您所运行标签的最新 AnsibleForms 和 RTE 镜像：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. 替换容器

删除旧容器，并用 [安装](../installation/docker.html) 时的 `run` 命令启动新容器。应用
从其环境文件中读取数据库连接，使用 AnsibleForms 的数据库用户（而不是 root）。RTE 读取自己的
`rte.env`，其中不含数据库设置，应用通过两个容器共享的网络连接它：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

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

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

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

</div>
</div>

如果从 6.5 升级，此时还没有 RTE 容器：`stop` 和 `rm` 命令只会找到应用。请用
`docker network create ansibleforms`（或 `podman network create ansibleforms`）创建一次共享网络。像
[安装](../installation/docker.html#prepare-the-folders) 时那样，把数据库连接、`ENCRYPTION_SECRET`、至少 16 个字符的 `RTE_TOKEN`
和 `CONFIG_SEED_PATH` 写入应用的环境文件，并创建 `rte.env` 和配置种子。如果您的 6.5 安装挂载的是其他文件夹，
请使用您自己的文件夹。种子会把 RTE 作为默认运行器 `rte` 添加到 **连接 → 运行器** 下；
参见 [升级到 v7](../upgrade-7.html#playbooks-run-on-an-rte)。

---

## 3. 检查升级

在 AnsibleForms 启动时跟踪其日志。新版本首次启动时会升级数据库 schema：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

RTE 会写自己的日志，可用 `docker logs rte` 查看。在 AnsibleForms 中，**帮助 → 关于** 显示正在运行的版本，**设置 → 状态** 显示
数据库、schema 以及 AnsibleForms 所依赖的其他系统的健康状况。

---

## 回滚

要回到之前运行的版本，即升级前 **帮助 → 关于** 显示的版本，请再次执行步骤 2，并把
AnsibleForms 和 RTE 镜像的 `7` 都换成该版本的确切标签。如果该版本无法在升级后的
数据库上启动，请恢复您在 **设置 → 备份** 下创建的备份。
