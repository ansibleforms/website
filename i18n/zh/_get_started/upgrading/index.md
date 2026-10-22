---
layout: default
title: 升级
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# 升级
{: .no_toc }

把 AnsibleForms 迁移到更新的版本
{: .fs-6 .fw-300 }

---

面向正在运行实例的管理员：使用您安装时所用的方式，迁移到更新的版本。

---

## 本节内容

升级步骤取决于您安装 AnsibleForms 的方式。每种方式都有单独的页面介绍：

| 页面 | 内容 |
|---|---|
| [升级到 v7](../upgrade-7.html) | 迁移到 7 之前，仍在 6.5 上时需要修改的内容 |
| [使用安装程序](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`，适用于由安装程序完成的安装：备份、发行说明和回滚 |
| [Docker](docker.html) | 拉取新镜像，并用相同的设置重新创建容器 |
| [Docker Compose](docker-compose.html) | 拉取新镜像，并重启 docker-compose 项目 |
| [从源码安装](from-source.html) | 拉取新代码，重新构建并重启应用 |
| [Kubernetes](kubernetes.html) | 刷新 chart 仓库，并使用您的 values 运行 `helm upgrade` |

{: .note }
> **先备份** 升级前请先进行备份（**设置 → 备份**）。数据库 schema 会在新版本首次启动时升级，
> 因此一旦出现问题，备份就是您的回滚点。从 7.3.0 起，worker 在从旧版本升级之前也会自行创建一个
> 以版本命名的备份，除非 [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) 为 `0`。

您获得的版本取决于所运行的镜像标签：`latest` 跟随最新的主版本，而 `7` 之类的标签
则停留在该主版本上。所有标签都列在 [镜像标签](../installation/#image-tags) 中。
