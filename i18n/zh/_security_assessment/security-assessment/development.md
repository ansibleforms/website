---
layout: default
title: 安全开发
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# 安全开发
{: .no_toc }

变更如何检查和发布，以及哪些版本受支持
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 源代码

AnsibleForms 是开源软件，因此本页的所有内容都可以在仓库中自行核实：

* 代码、其历史和构建流水线都公开在 [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms) 上。
* [许可证](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE)为 GPL-3.0。
* [更新日志](../changelog.html)列出了每个版本的每项变更，包括安全修复。

---

## 变更如何合并

每项变更都通过拉取请求进入 `main` ，并受一套任何人都无法绕过的规则集约束：

| 规则 | 含义 |
|---|---|
| 必须使用拉取请求 | 任何内容都不会直接推送到 `main` |
| 必需的检查 | 只有下面的每项检查都通过，拉取请求才会合并 |
| 禁止强制推送，禁止删除 | `main` 的历史不能被改写或删除 |
| 线性历史 | 每个拉取请求都会变成一个提交，因此每项变更都可以单独追溯和回退 |

拉取请求必须通过的检查：

| 检查 | 作用 |
|---|---|
| Client、Server | 网页界面和服务器的单元测试 |
| CodeQL | GitHub 对 JavaScript 和 TypeScript 代码的静态分析，用于发现注入、跨站脚本和其他弱点 |
| Public schema is up to date | 代码所期望的数据库架构与其附带的架构一致 |
| Title、Branch | 拉取请求遵循命名规则，以保证更新日志准确 |

另外还有两项会在每个拉取请求上运行并报告结果：

* **Database** 在 MySQL 和 MariaDB 上测试服务器， **Browser** 在浏览器中操作界面。
* **Dependency review** 会阻止引入存在已知高危或严重漏洞的新依赖。

---

## 代码分析和依赖

代码及其依赖在合并之后还会再次检查：

* **CodeQL** 还会分析每次推送到 `main` 和发布分支的内容，并每周分析整个代码库：
  这样新的 CodeQL 规则也会检查在它之前合并的代码。
* **Dependabot** 会为依赖的每个新版本打开一个拉取请求：服务器和
  界面的 npm 包、运行时环境的 Python 包以及流水线的 GitHub Actions 每周一次，
  容器的基础镜像每天一次。
* 基础镜像通过摘要固定（ `node:26-trixie-slim@sha256:...` ），因此构建使用的正是经过审查的镜像。
  当上游重新构建镜像时，Dependabot 会更新摘要。

---

## 版本发布和镜像

版本只由 GitHub Actions 构建和发布，从不在开发者的机器上进行：

* 版本从 `main` （或 `release/6.x` ）切出，附带根据其拉取请求生成的更新日志。
* 镜像由 [Publish 工作流](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)构建，
  并推送到 GitHub Container Registry `ghcr.io/ansibleforms/ansibleforms` ，运行时环境镜像
  也在旁边。该工作流及其日志都是公开的，因此任何人都可以看到镜像中包含了什么。
* 应用程序和运行时环境镜像以非特权用户 `node` （uid 1000）运行，从不以 root 运行。

---

## 受支持的版本

安全修复会进入每条受支持版本线的最新版本：

| 版本 | 是否接收安全修复 |
|---|---|
| 7.x | 是 |
| 6.5.x | 是 |
| 早于 6.5 | 否：升级就是修复办法 |

[升级指南](../upgrading/)介绍如何迁移到更新的版本，[升级到 v7](../upgrade-7.html) 介绍如何从 6.5 迁移。
