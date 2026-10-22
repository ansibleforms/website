---
layout: default
title: Docker Compose
parent: 升级
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

升级使用 docker-compose 项目完成的安装
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

docker-compose 项目运行三个容器：MySQL（`mysqldb`）、AnsibleForms（`app`）以及运行
playbook 的 RTE（`rte`）。AnsibleForms 和 RTE 使用镜像标签 `7`，它始终指向最新的 7.x 版本。
升级会重新拉取镜像，并重新创建镜像发生变化的容器。所有需要持久保存的内容都存储在
`data` 文件夹中，并会被保留。

---

## 升级之前

做好升级准备，以便出现问题时可以回退：

* 在 **设置 → 备份** 下 **进行备份**。新版本会在首次启动时升级数据库 schema。
* **阅读 [更新日志](../changelog)** 中从您的版本到新版本之间的各个版本。
* **要迁移到新的主版本？** 请先遵循 [升级到 v7](../upgrade-7.html)。
* **从 6.5 升级？** 6.x 项目（位于其 `v6` 分支）没有 `rte` 容器。请把您的项目副本更新到
  其 `main` 分支，保留您的 `.env` 设置和 `data` 文件夹，使 `docker-compose.yml` 包含 `rte`
  服务。该 compose 文件设置了 `CONFIG_SEED_PATH`，而 6.x 的 `data` 文件夹中没有 `seed.yaml`：请从
  仓库复制 `data/seed.yaml`，并像仓库的 `.env` 那样在您的 `.env` 中添加 `RTE_TOKEN`（至少 16 个字符）。缺少它们时，
  应用会拒绝启动。7 的镜像以 uid 1000 而不是 root 运行：请执行一次
  `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`，把 `data` 文件夹交给该用户，MySQL 的文件则留给 MySQL。
  `data/ssh` 文件夹现在挂载到 `/home/node/.ssh`，而不是 `/root/.ssh`。
* **从 7.2 升级？** 请同时更新 `docker-compose.yml` 和 `data/seed.yaml`：先参见 [从 7.2 到 7.3](#from-72-to-73)。

---

## 从 7.2 到 7.3

在 7.2.0 及之前，`rte` 服务会获得数据库的设置，而它在 `data/seed.yaml` 中声明的运行器以数据库模式运行，
该模式在 7.3.0 中弃用，并在 8.0.0 中移除。从 7.3.0 起，应用通过 `http://rte:8000` 连接 RTE 并保持一条 WebSocket 连接
（`RTE_MODE=inbound`，参见 [模式](../rte/modes.html)），RTE 不再持有任何数据库设置。请从仓库的
`main` 分支获取这两个文件，并保留您的 `.env`：

| 文件 | 变化 |
|---|---|
| `docker-compose.yml` | `rte` 服务不再读取 `.env`：它获得 `RTE_MODE=inbound`、`RTE_TOKEN` 和 `RTE_FILES=local`，不再有 `DB_*` |
| `data/seed.yaml` | 一个 RTE 凭据 `rte`，带有 `url: http://rte:8000` 和 `password: ${RTE_TOKEN}`，以及带有 `rte_mode: inbound` 和 `credential: rte` 的运行器 `rte` |

两个文件都要修改。如果只换了新的 compose 文件，种子会让运行器 `rte` 保持数据库模式：应用会把 RTE 当作 7.2 的 RTE 来调用，
而新的 RTE 不会响应，于是没有任何 playbook 能运行。您自己修改过的种子也需要加上同样的凭据和 `rte_mode`。

由种子创建的运行器始终处于受管理状态，在 **连接 → 运行器** 下为只读，即使您删除了 `CONFIG_SEED_PATH` 也是如此：只有
被应用的种子才会释放它不再声明的运行器。因此请保留种子并在其中设置 `rte_mode`，而不是删除
`CONFIG_SEED_PATH` 后再手动修改运行器。

[安装程序](../installation/installer.html#upgrade) 会自行完成这些：它的升级会替换 `docker-compose.yml`；如果 `data/seed.yaml`
是仓库附带且未修改的种子，也会替换它。手动修改过的会保留，新的种子保存在它旁边。

---

## 1. 拉取新镜像

下载 `docker-compose.yml` 中各标签对应的最新镜像：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. 重新创建容器

再次启动项目；镜像发生变化的容器会被重新创建：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. 检查升级

在 AnsibleForms 启动时跟踪其日志。新版本首次启动时会升级数据库 schema，RTE
会在 AnsibleForms 进入健康状态后启动：

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

在 AnsibleForms 中，**帮助 → 关于** 显示正在运行的版本，**设置 → 状态** 显示
数据库、schema 以及 AnsibleForms 所依赖的其他系统的健康状况。

---

## 回滚

要回到之前运行的版本，即升级前 **帮助 → 关于** 显示的版本，请在
`docker-compose.yml` 中把 AnsibleForms 和 RTE 镜像的标签都从 `7` 改为该版本的确切标签，然后再次执行步骤 2。如果该版本
无法在升级后的数据库上启动，请恢复您在 **设置 → 备份** 下创建的备份。把标签改回
`7` 即可再次获得更新。

**视频**：[如何升级 AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
