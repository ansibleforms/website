---
layout: default
title: Kubernetes
parent: 升级
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

升级使用 Helm chart 完成的安装
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

每个 chart 版本部署一个 AnsibleForms 版本。升级会用您现有的 values 安装更新的 chart 版本；
持久卷上的数据会被保留。没有任何变化的升级不会触碰 pod。

---

## 升级之前

做好升级准备，以便出现问题时可以回退：

* 在 **设置 → 备份** 下 **进行备份**。新版本会在首次启动时升级数据库 schema。
* **阅读 [更新日志](../changelog)** 中从您的版本到新版本之间的各个版本。
* **要迁移到新的主版本？** 请先遵循 [升级到 v7](../upgrade-7.html)。
* **阅读 chart 的 [更新日志](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md)**，了解 values 的变化。
* **使用生成的凭据时**（`secrets.generate`），请备份 `<release>-secrets` Secret：`ENCRYPTION_SECRET` 无法找回。
* **从 7.2 升级？** server pod 中的 RTE 会改变模式：参见 [从 7.2 到 7.3](#from-72-to-73)。

---

## 从 7.2 到 7.3

chart 7.3.0 让应用旁边的 RTE 脱离数据库模式，该模式在 7.3.0 中弃用，并在 8.0.0 中移除。应用通过
`127.0.0.1` 连接它并保持一条 WebSocket 连接（`RTE_MODE=inbound`，参见 [模式](../rte/modes.html)）：

* RTE 容器不再获得 `DB_HOST`、`DB_USER`、`DB_PASSWORD`、`ENCRYPTION_SECRET` 或 `RTE_URL`，并从
  共享卷获取作业的文件（`RTE_FILES=local`）
* chart 的配置种子声明一个包含令牌和地址的 RTE 凭据，以及使用该凭据登录的运行器（`rte_mode: inbound`）。
  使用 chart 的种子时，无需做任何事
* 设置了 `containers.rte.seedRunner: false`，或使用您自己的配置种子（`CONFIG_SEED_PATH`）时，RTE 不再把自己添加为运行器。
  请自行声明它，在您的种子中或在 **连接 → 运行器** 下：一个包含 `http://127.0.0.1:<port>` 和令牌的 RTE 凭据，
  以及一个引用它、带有 `rte_mode: inbound` 的 RTE 类型运行器。Helm 在升级后打印的说明会告诉您如何操作

从 7.3.0 起，chart 还可以通过 `runner.enabled` 单独安装一个运行器（参见
[Kubernetes 上的运行器](../installation/kubernetes.html#a-runner-on-kubernetes)）。

---

## 1. 查找新的 chart 版本

刷新 chart 仓库并列出可用的 chart 版本：

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. 升级 release

使用您的 values 文件和新的 chart 版本，运行与安装时相同的 `helm upgrade` 命令：

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

使用 OCI registry 时，chart 请写为 `oci://ghcr.io/ansibleforms/charts/ansibleforms`。

---

## 3. 检查升级

等待新的 pod 启动，然后运行 chart 的测试，它会同时检查 Web 服务器和数据库连接：

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

在 AnsibleForms 中，**帮助 → 关于** 显示正在运行的版本，**设置 → 状态** 显示
数据库、schema 以及 AnsibleForms 所依赖的其他系统的健康状况。

---

## 回滚

Helm 会保留 release 的历史记录。要回到上一个修订版本：

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

如果它无法在升级后的数据库上启动，请恢复您的备份（参见 chart 的 [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms)）。
