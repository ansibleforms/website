---
layout: default
title: 配置
parent: 环境变量
nav_order: 5
translated_from: c15df1be69f79cf42094233023cb5766d2f56452
---

# 配置
{: .no_toc }

配置种子、配置的保存位置、git 和 ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

修改这些变量，以决定配置的来源：配置种子、数据库、git 或 ytt 模板。

---

## 示例

应用一个挂载的配置种子，每五分钟检查一次，并将 `config.yaml` 保存在数据库中。在 `docker-compose.yml` 中：

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - "CONFIG_SEED_RELOAD_CRON=*/5 * * * *"
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

无效的种子会导致服务器无法启动。文件格式参见 [配置种子](../seed/)。

---

## config.yaml 的读取位置

类别、角色和常量来自磁盘上的 `config.yaml` 或其在数据库中的副本，按以下顺序决定：

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE)，当它在环境中或在设置页面的
   **配置** 选项卡中设置时：`1` 读取数据库，`0` 读取文件。
2. 否则，使用数据库中保存的配置来源（`file` 或 `database`），即 6.3.0 之前搭建的实例
   在设置页面上所作的选择。
3. 否则，使用 [`CONFIG_PATH`](paths.html#env_CONFIG_PATH) 处的文件。

从 7.8.0 起，仓库所包含的键会覆盖在这一基础配置之上：具有 **角色**、**类别** 或 **常量** 用途类型的仓库
从给出 `controller_roles:`、`controller_categories:` 或 `controller_constants:` 的文件中提供该键，
否则从其 `config.yaml`（已弃用）中提供。参见 [git 中的配置](../repositories/config-as-code.html#roles-categories-and-constants)。

显式设置的 `ENABLE_CONFIG_IN_DATABASE` 始终优先，即使是 `0` 也优先于保存的 `database`。每次加载
配置时都会读取它，因此更改无需重启即可生效。**状态** 页面的 **信息** 选项卡显示正在使用的来源。

数据库中的副本是 `settings` 表的 `config_yaml` 列，7.6.0 之前名为 `forms_yaml`：升级时会将其改名并保留其内容。
`GET /api/v2/settings/config` 以 `config_yaml` 返回它，同时也以已弃用的 `forms_yaml` 返回。

---

## 变量

本组的所有变量，包括其类型、默认值和描述：

{% include env_vars_table.html group="configuration" %}
