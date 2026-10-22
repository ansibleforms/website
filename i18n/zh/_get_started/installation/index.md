---
layout: default
title: 安装
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# 安装
{: .no_toc }

为 AnsibleForms 选择一种安装方式
{: .fs-6 .fw-300 }

---

面向搭建新实例的管理员：选择一种安装方式，然后按照对应页面操作。

---

## 本节内容

AnsibleForms 支持多种安装方式，每种方式都有单独的页面介绍：

| 页面 | 内容 |
|---|---|
| [安装程序](installer.html) | 一条命令即可在 Docker、Podman、Kubernetes 上或以原生方式安装控制器或运行器，之后还能升级和备份 |
| [原生安装](native.html) | 不使用容器的安装程序安装：服务器上运行 Node.js、MariaDB 和 Ansible，AnsibleForms 作为 systemd 服务运行 |
| [Docker](docker.html) | 安装 MySQL，并使用所需的环境变量运行预构建的 Docker 镜像 |
| [Docker Compose](docker-compose.html) | 下载 [docker-compose 项目](https://github.com/ansibleforms/docker)，用 docker-compose 同时启动 MySQL 和 AnsibleForms |
| [从源码安装](from-source.html) | 手动安装所有依赖，然后构建并启动代码 |
| [Kubernetes](kubernetes.html) | 安装 Helm chart，用 Kubernetes 启动 AnsibleForms 及其 MySQL 数据库 |

{: .note }
> **推荐** 从 7.3.0 起，安装程序是得到可用实例的最快方式：只需回答几个问题，它就会在
> Docker 或 Podman 上搭建 Docker Compose 项目，或采用其他某种方式。Docker 镜像已包含所有依赖。

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

要把现有安装迁移到更新的版本，请参见 [升级](../upgrading/)。

每种方式都会在应用旁运行一个 RTE，即运行 playbook 的容器（或服务）。要在另一台主机或另一个
数据中心再添加一个，请用 [安装程序](installer.html#a-runner) 安装一个运行器：它通过一条 WebSocket 连接 AnsibleForms（出站，参见
[模式](../rte/modes.html)），且不持有任何数据库凭据。另请参见 [运行环境](../rte/) 及其操作手册
[另一个数据中心中的 RTE](../rte/another-datacenter.html)。

---

## 镜像标签

镜像以 `ghcr.io/ansibleforms/ansibleforms` 发布在 GitHub Container Registry 上，该仓库归
项目所有，且不限制匿名拉取的速率。从 7.0.0 起的每个版本都只在那里发布，6.x 版本
也在那里。

从 7 开始，playbook 在 RTE 上运行，RTE 与应用并列发布，分为三层（参见 [RTE 镜像](../rte/images.html)）：

| 镜像 | 说明 |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | Web 应用和 API，不含 python 和 ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | 不含 python 和 ansible 的 RTE：用于构建您自己的镜像 |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | 在 base 的基础上加入 python、ansible-core 和少量库：用来添加您的 collection |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | 在 core 的基础上加入 `ansible` 包及其 collection 和库：默认的 RTE |

这四个镜像在同一次运行中构建，带有相同的标签，因此 RTE 的标签始终与应用的标签一致。

旧的 Docker Hub 仓库 `ansibleguy/ansibleforms` 已不再更新。它保留了已有的
版本，但两条版本线都不会再有新版本。如果您仍从那里拉取，请改用
带相同标签的 `ghcr.io/ansibleforms/ansibleforms`，以继续获得更新。

每个镜像都提供以下标签；RTE 镜像从 7.0.0 开始，因此没有 6.x 标签：

| 标签 | 指向 |
|---|---|
| `latest` | 最新主版本的最新发布 |
| `7`, `6` | 该主版本的最新发布 |
| `7.0`, `6.5` | 该次版本的最新发布 |
| `7.0.0`, `6.5.5` | 正好是该版本 |
| `latest-rc` | 最新的候选版本，若正式版本更新则指向正式版本；每个候选版本也有自己的标签 |

`latest` 只会向前移动：旧主版本的补丁（例如在 7.0.0 之后发布的 6.5.x）
会移动 `6` 和 `6.5`，但绝不会移动 `latest`。

要停留在某个主版本上，请使用其编号（`6`）而不是 `latest`。
