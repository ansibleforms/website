---
layout: default
title: git 中的配置
parent: Git 仓库
nav_order: 5
translated_from: 7d0beda8f50fb1602dd685827ccbf20eb3679501
---

# git 中的配置
{: .no_toc }

把所有设置保存在 git 仓库中，双向读写
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

面向希望在 git 中审查 AnsibleForms 的设置、用户和连接并对其进行版本控制的管理员，从 7.8.0 起可用。

---

## 用途类型

仓库的**用途**步骤（在其向导中，以及在其页面的**用途**选项卡上）说明应用从中获取什么。

这些类型分组在六个标题下，每个标题带有其包含的类型数量，例如**设计器 (6)**。每种类型都有
自己的复选框和一行简短说明，说明仓库为它包含什么；标题上的复选框会勾选或取消勾选该标题下
所有可勾选的类型。

| 标题 | 用途类型（标志） |
|---|---|
| **设计器** | **类别**（`use_for_categories`）、**常量**（`use_for_constants`）、**表单**（`use_for_forms`）、**清单**（`use_for_inventories`）、**Playbook**（`use_for_playbooks`）、**工作流**（`use_for_workflows`） |
| **作业** | **调度**（`use_for_schedules`） |
| **系统** | **常规**（`use_for_general`） |
| **外观** | **默认值**（`use_for_defaults`）、**徽标**（`use_for_logo`）、**图标**（`use_for_icon`）、**名称**（`use_for_name`）、**链接**（`use_for_links`）、**标签**（`use_for_labels`）、**公告**（`use_for_announcements`） |
| **访问** | **免责声明**（`use_for_disclaimer`）、**用户**（`use_for_users`）、**组**（`use_for_groups`）、**角色**（`use_for_roles`）、**LDAP**（`use_for_ldap`）、**SSO**（`use_for_sso`） |
| **连接** | **仓库**（`use_for_repositories`）、**凭据**（`use_for_credentials`）、**密钥库**（`use_for_secret_stores`）、**数据库**（`use_for_databases`）、**运行器**（`use_for_runners`）、**SSH**（`use_for_ssh`）、**通知**（`use_for_notifications`）、**聊天助手**（`use_for_chat_assistant`）、**MCP**（`use_for_mcp`）、**Syslog**（`use_for_syslog`） |

**表单**、**清单**和**工作流**可以在多个仓库上勾选。**Playbook** 只来自一个仓库：用途步骤
在其他仓库上将其置灰，服务器取第一个仓库并给出警告。其他每种类型最多属于一个仓库，
第二个仓库会被 API 和配置种子拒绝。由另一个仓库持有的类型显示为灰色的已勾选状态且不可用，
其工具提示会指出该仓库：`已由仓库“platform”管理`。

开启或关闭用途类型只能由管理员进行，与**URI**和**分支**一样（参见
[谁可以修改仓库](adding.html#who-may-change-a-repository)）。

---

## 仓库把它们保存在哪里

仓库可以把一种类型保存在任意名称、任意文件夹中的 YAML 文件里：文件的顶层键说明它包含哪种类型。

该键总是 `controller_` 加上类型的键：`controller_credentials:`、`controller_roles:`、`controller_defaults:`。
仓库中每个 `.yaml` 或 `.yml` 文件都会被查看，不论其深度，隐藏文件和文件夹除外。一个文件可以包含
多种类型，一种类型也可以分散在多个文件中。

| 键 | 包含 |
|---|---|
| `controller_general:`、`controller_mcp:`、`controller_ssh:`、`controller_chat_assistant:`、`controller_defaults:`、`controller_logo:`、`controller_icon:`、`controller_name:`、`controller_links:` | 一个映射，用于应用只有一份的内容；最多只有一个文件给出它 |
| `controller_users:` | 用户列表，每个用户由其 `type`（省略时为本地）和 `username` 确定 |
| `controller_disclaimer:` | 版本列表，每个版本由其 `version` 确定 |
| `controller_roles:`、`controller_categories:`、`controller_constants:` | 角色、类别和常量，采用其常用格式 |
| 其他所有 `controller_` 键 | 条目列表，每个条目由其 `name` 确定 |

对象在其类型内由名称确定，从不由文件确定：移到另一个文件的条目仍是原来的对象。普通键
（`credentials:`、Galaxy requirements 文件的 `roles:`、变量文件的 `labels:`）不属于任何类型，应用从不读取也不写入
它。表单从不是类型的文件；仓库未用于的类型的键保持不变，并在拉取输出中给出
提示。

### 角色、类别和常量

这三项保留 `config.yaml` 的格式，现在各自位于自己的键下，各自成为一种用途类型（每种一个仓库）。

每一项都从其仓库中在顶层给出其键的文件中读取，名称和文件夹任意；一个文件可以给出
全部三项。没有文件给出它时，仍会读取仓库的 `config.yaml` 及其普通的 `roles:`、`categories:` 和
`constants:` 键：这自 7.8.0 起已弃用，8.0 中将不再读取；服务器日志、拉取输出和
仓库页面都会说明这一点。请把每个键移到单独的文件中，例如由 `roles.yaml` 包含 `controller_roles:`。

没有任何仓库包含的键仍像以前一样来自基础配置：数据库中的副本，或
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) 处的文件。以前的**用于配置？**开关已不复存在：升级后的
实例会把**角色**、**类别**和**常量**交给原先启用它的仓库。配置种子、仓库的
`controller_repositories:` 条目和 API 仍接受 `use_for_config` 作为这三项的已弃用别名，并给出警告。

---

## 双向：git 与应用

用于某种类型的仓库会在两个方向上与应用保持同步，实际运行的仍是应用的数据库。

| 方向 | 发生什么 |
|---|---|
| 从 git 到应用 | 每次拉取、克隆或重置仓库后，以及服务器启动时，都会读入其文件：新名称创建对象，更改的条目更改对象，删除的条目删除对象 |
| 从应用到 git | 在应用中保存会写回该条目的文件：只写入更改的字段，保留文件的注释、其他键和其他条目。新对象添加到第一个给出该类型键的文件末尾，否则写入根目录下新建的 `<key>.yaml`（`credentials.yaml`）；删除会移除其条目。这些都等待仓库的**推送** |

无效的条目会被单独拒绝，并给出其位置和原因，同名对象保持原样。引用尚不存在的对象的
条目（运行器及其凭据）会等待，并在下次拉取该类型时再次读取。git 中的重命名
在一个名称离开某个文件、同一文件中出现一个新名称且其余不变时会被跟随。

### 开启或关闭用途

保存开启或关闭了某种类型的仓库时，会先询问如何处理，并显示该更改将执行的操作。

| 更改 | 询问 | 执行的操作 |
|---|---|---|
| 开启 | **开启 凭据**：`将 platform 用于 凭据？` | 拉取仓库并读入其条目；两边都有的名称以 git 为准；应用的其他对象写入仓库，不含其密钥，等待**推送** |
| 关闭 | **关闭 凭据**：`不再将 platform 用于 凭据？` | 再拉取一次仓库，然后解除其对象的关联：它们保持原样留在应用中，git 中的文件保持不变 |
| 多项 | **更改用途**：`更改 platform 的用途？` | 一个询问，每种类型一个部分，通过**保存用途**确认 |

询问中还会列出保留在应用中的内容：配置种子的对象、RTE 自行注册的运行器，以及
等待批准的对象。随后会有一条消息说明每种类型获取了什么，例如
`凭据：2 个从其文件读入，3 个已写入仓库（等待 Push），1 个被 git 替换，0 个保留在本应用中。`

### 拉取输出的内容

仓库的**显示上次拉取的输出**在 git 自己的输出之后，每种类型显示一行。

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

保存在仓库中的对象会在其页面上显示**仓库:platform**（其仓库的名称），工具提示中显示其条目所在的文件。保存
该对象会写入该文件，仓库的**推送**会把它发送到 git。

---

## 密钥

git 从不保存明文密钥：条目的密钥字段只能是从环境中解析的 `${ENV}` 引用。

密码、令牌、客户端密钥和私钥写成 `${SEED_RTE_TOKEN}` 的形式，与[配置种子](../seed/)中一样。包含
明文密钥或引用未设置变量的条目会被拒绝，并在拉取输出中指出；引用服务器自身变量
（`DB_*`、`ACCESS_TOKEN_*`、`ENCRYPTION_*`、`ADMIN_*` …）的条目也是如此。条目中省略的密钥会保留应用
数据库中的那个，应用把自己的对象写入 git 时不含其密钥。

如果某个对象的条目以 `${ENV}` 引用给出密钥，在应用中为它输入密钥会被拒绝：请修改该变量，或修改 git 中的
条目。

---

## 设计器与这些文件

设计器不会触碰用途类型所拥有的文件，因此编辑表单从不会更改设置。

对于给出其仓库所包含类型的键的文件，以及此类文件引用的图片，设计器从不列出、读取、写入或删除。
它还拒绝写入内容会给出某个类型键的文件，加载表单时也从不把此类文件当作表单读取。

---

## 每种类型及示例

每种类型的条目采用配置种子的格式，因此种子项和仓库条目可以互换。

下面的文件名只是示例：任何名称和任何文件夹都可以。

### 类别、常量和角色

类别和角色是列表，常量是一个映射，各自位于自己的键下。

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

每个角色单独检查：无效的角色会被单独拒绝，其他角色照常提供。角色可以分散在
多个文件中，按文件的顺序提供。参见[角色](../config/roles.html)。

### 调度

调度是一个 `controller_schedules:` 列表，每个条目指定它运行的表单，并且只用 `cron`、
`rrule` 或 `one_time_run` 中的一个来定时。

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

用户计划的“稍后运行”作业保留在应用中。定时方式和提示参见[调度](../jobs/schedules.html)。

### 常规

**常规**设置是一个映射，键为其环境变量名的小写形式。

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

只接受常规页面可以更改的变量；大写的键，或在真实环境中已设置的变量，会被
拒绝。名称以 `_PASSWORD`、`_SECRET` 或 `_TOKEN` 结尾的变量只能是 `${ENV}` 引用。

### 默认值、徽标、图标、名称和链接

外观页面各是一个映射，包含该页面保存的内容。

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

徽标和图标是仓库中的图片，以相对于引用它们的文件的路径指定。配置种子声明的字段
保持为种子中的值。

### 标签和公告

标签和公告是条目列表，每个条目由其名称确定。

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

结束时间已过的公告不会被导入，这会在拉取输出的 `Not imported` 行中说明。

### 免责声明

免责声明是一个版本列表，每个版本由其 `version` 确定，最多启用其中一个。

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

来自 git 的文本更改会修正该版本；`ask_again: true` 会让所有已接受它的人重新确认。谁接受了什么从不保存在 git 中。

### 用户和组

组的条目列出其本地成员；用户的条目不涉及其所属的组。

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

本地用户的 `password` 只能是 `${ENV}` 引用，读取时进行哈希。目录中的用户（`ldap`、`entraid`、`oidc`）只给出
其 `description` 和 `blocked`。内置的 admin 从不从 git 读取，也从不写入 git。

### LDAP 和 SSO

LDAP 目录和 SSO 提供方是列表，每个条目指定其登录所用的凭据。

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

名为 `main` 的条目是主目录，从不重命名也不删除。`position` 保持查找顺序。

### 仓库

一个仓库可以包含其他仓库，格式与配置种子的 `repositories:` 项相同。

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

包含它们的仓库从不出现在它自己的文件中，条目从不设置 `use_for_repositories`，`uri` 中的用户或令牌
会被拒绝：请改为指定凭据。删除的条目会删除其仓库，除非该仓库有尚未推送的更改。

### 凭据、密钥库和数据库

先读取凭据，再读取引用它们的所有内容。

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

在凭据仍被使用时删除其条目会被拒绝，这会在拉取输出中说明。

### 运行器

运行器指定其凭据（运行器类型的凭据），凭据缺失时会等待。

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

RTE 自行注册的运行器，或等待批准的运行器，保留在应用中。

### SSH

应用的 SSH 密钥及其信任的主机是一个映射，紧接在仓库之后、克隆仓库之前读取。

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` 只能是 `${ENV}` 引用，从不写入 git：省略时，应用保留自己的密钥。`known_hosts` 每台服务器包含一行
known_hosts 行，空列表会清除它们。

### 通知和 Syslog

通知渠道和 syslog 服务器是条目列表。

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### 聊天助手和 MCP

聊天助手和 MCP 设置各是一个映射。

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` 和 MCP 的键是环境变量名的小写形式。在真实环境中已设置的变量从不
写入，给出它的映射会被拒绝。`api_key` 只能是 `${ENV}` 引用，或者省略。
