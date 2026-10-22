---
layout: default
title: 备份
parent: 生产环境运行
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# 备份
{: .no_toc }

每晚备份、备份的内容、恢复，以及还需要保存什么
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 每晚备份

AnsibleForms 每晚午夜自动备份，时区为 [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) 所设
（默认为 UTC）。以下设置控制备份：

| 变量 | 默认值 | 含义 |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | 备份写入的位置，每个备份一个带时间戳的文件夹 |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | 保留多少个每晚备份，`0` 表示全部保留 |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | 导出数据库的命令 |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | 恢复时重放导出文件的命令 |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | 导出和恢复可以运行的时长 |

拥有 `allowBackupOps` 角色选项的用户也可以随时在 **备份** 页面上创建备份。保留策略只删除
每晚备份，并且只有包含可用导出文件的备份才计入其中，因此连续几晚失败也绝不会把最后一个正常的备份挤掉。

在升级修改数据库之前，worker 会先创建一个常规备份，每个版本一次，名为 *Before the upgrade to
&lt;version&gt;*。它会显示在 **备份** 页面上，永远不会被每晚备份的保留策略删除。如果它失败（没有导出工具、
`BACKUP_PATH` 不可写），升级会停止并说明原因，因此应用永远不会在升级了一半的数据库上启动。
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` 表示升级时不做备份。

这些命令可以是包装命令，例如 `docker exec <container> mysqldump`，只要其第一个词在本地存在。从 7.3.0 起，它们不经过
shell 运行：引号和命令环境中的 `$NAME` 可以使用，但 `;`、`|`、`&&`、`>` 和 `<` 会被拒绝。

---

## 数据库权限

导出以 [`DB_USER`](../customization/server.html#env_DB_USER) 身份运行，所需权限不超过应用本身所需的权限：

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

导出使用 `--no-tablespaces`，因此不需要服务器级别的 `PROCESS` 权限，并且会跳过
描述正在运行进程的表（`nodes`、`cache_epochs`、`designer_lock`、`runner_leases`）。恢复时以同一用户身份重放。
当该用户对所有数据库都有权限（如 `root`）时，**状态** 页面会在其 **数据库用户** 检查项上显示警告。

---

## 备份的内容

每个备份是 `BACKUP_PATH` 下的一个文件夹，以其 UTC 时间戳（`YYYYMMDDHHmmss`）命名，包含：

| 文件 | 内容 |
|------|---------|
| `ansibleforms.sql` | `AnsibleForms` 数据库的导出：用户、组、凭据、作业、设置、审计记录 |
| `config.yaml` | [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) 处的文件 |
| `forms/` | [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) 处的文件夹 |
| `managed.env` | 设置页面写入的环境文件，不包括 `ENCRYPTION_SECRET`、`ENCRYPTION_SECRET_PREVIOUS` 和 `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | 备份的描述 |

导出失败的备份会被再次删除，并记录为错误。当没有备份、最新备份已超过两天，
或最新备份没有可用的导出文件时，**状态** 页面会发出警告，它还会检查导出工具是否存在。

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) 则用于保留设计器的还原点（默认 60 天）。

---

## 恢复备份

在 [**备份** 页面](../gui/administration.html#restore) 进行恢复，并勾选 **恢复前先创建新备份**。恢复会：

* 重放 `ansibleforms.sql`，替换整个数据库；从 7.3.0 起，旧版本的备份随后会像新版本启动时一样
  再次升级，失败的补丁会被报告
* 复制回 `config.yaml`，并用备份中的 `forms/` 文件夹替换现有文件夹：从 7.3.0 起，不在备份中的表单会被
  删除而不是保留，文件夹的链接和权限模式保持不变，复制失败时文件夹会回滚
* **不会** 恢复 `managed.env`，因为它描述的是备份来源的主机。**恢复环境**
  按钮可按需将其放回，并将当前文件保存为 `.env.bak`，之后需要重启。

没有可用导出文件的备份会被拒绝；恢复中断后，请修复原因并重新恢复。

在新主机上，请在恢复之前设置相同的 `ENCRYPTION_SECRET`，否则保存的凭据无法解密。

---

## 还需要备份什么

每晚备份涵盖数据库、配置和表单，但不包括持久化文件夹中的其他任何内容：

* **`ENCRYPTION_SECRET` 和 `ACCESS_TOKEN_SECRET`**：按设计永远不会出现在备份中。请将它们保存在您的密钥管理器中；
  没有加密密钥，数据库导出中的凭据就毫无用处。
* **备份本身**：它们与实例位于同一个卷上。请将 `BACKUP_PATH` 复制到另一台主机。
* **持久化文件夹的其余部分**：playbook、上传文件、变量文件、克隆的仓库、证书和日志。
  使用 docker-compose 项目时，请备份整个 `data/` 文件夹，其中还包含 SSH 密钥、自定义
  函数以及 Ansible 角色和集合。

来自 git 的内容（仓库、仓库中的表单）可以重新克隆，因此其备份不那么重要。
