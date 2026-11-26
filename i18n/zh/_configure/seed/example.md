---
layout: default
title: 示例
parent: 配置种子
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# 示例
{: .no_toc }

一个完整的种子文件，逐部分说明
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## 文件

下面的种子文件声明了除已弃用的 `awx` 之外的所有部分。密钥来自 `${SEED_AWX_TOKEN}` 这样的环境变量，
各部分使用 7.8.0 的名称（参见 [已重命名的部分](./#renamed-sections)）：

```yaml
version: 1

runners:
  items:
    - name: rte01
      type: rte                  # rte, awx, semaphore, rundeck or jenkins
      rte_mode: inbound          # an RTE's RTE_MODE: outbound, inbound or database (deprecated, the default)
      credential: rte01          # a credential of the credentials section, of the runner's type
      is_default: true           # playbook forms that name no runner run here
    - name: tower
      type: awx
      credential: tower
      is_default: true           # one default per type
      enabled: true              # false: no job goes to it; left as it is when not declared

secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login    # a vault credential of the credentials section: the store's address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault     # how the secret store vault logs in, and where
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}   # the Vault token
    - name: rte01
      credential_type: rte       # an RTE's token, and its address unless it is outbound
      url: http://rte01.example.com:8000
      password: ${SEED_RTE_TOKEN}   # the RTE_TOKEN of that RTE
    - name: tower
      credential_type: awx       # also aap, ascender, semaphore, rundeck, jenkins
      url: https://tower.example.com
      password: ${SEED_AWX_TOKEN}
    - name: production-db
      user: svc_forms
      password: ${SEED_DB_PW}
      host: db.example.com
      port: 3306
      db_type: mysql
      credential_type: database
    - name: ontap-rest
      credential_type: userpass   # a user and password for a REST API, the default
      user: svc_forms
      password: ${SEED_ONTAP_PW}
    - name: smtp-login
      credential_type: smtp      # a mail server and its login: host is required
      host: smtp.example.com
      port: 587
      secure: false              # true: Use TLS to the mail server
      user: svc_forms            # leave user and password out for a relay
      password: ${SEED_SMTP_PW}
    - name: m365-mail
      credential_type: entraid   # an app registration, to send through Microsoft 365 (from 7.6.0)
      tenant_id: ${SEED_M365_TENANT}
      user: ${SEED_M365_CLIENT_ID}    # the client ID
      password: ${SEED_M365_SECRET}   # the client secret ; or client_cert and client_key

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

sso:                             # oauth2 before 7.8.0
  items:
    - name: corp
      provider: entraid          # entraid (Microsoft Entra ID, azuread before 7.8.0) or oidc
      tenant_id: ${SEED_ENTRA_TENANT}
      client_id: ${SEED_ENTRA_CLIENT_ID}
      client_secret: ${SEED_ENTRA_SECRET}   # or credential: an entraid credential
      enable: true

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_roles: true        # since 7.8.0, with use_for_categories and use_for_constants
      use_for_categories: true   # instead of use_for_config
      use_for_constants: true
      rebase_on_start: true

syslog:                          # syslog_servers before 7.8.0
  items:
    - name: siem
      host: siem.example.com
      port: 6514
      protocol: tls4             # udp4 (default), udp6, tcp4, tcp6, tls4, tls6, unix, unix-connect
      type: "5424"               # BSD (default) or 5424
      receives: audit            # log, audit or both (default)
      enabled: true
    - name: syslog
      host: syslog.example.com
      level: notice              # the lowest level of the server log it gets (info by default)
      receives: log

notifications:                   # notification_channels before 7.8.0
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: relay
      type: mail                 # no credential (from 7.6.0): its own server, sent without a login
      server: relay.example.com
      port: 25
      secure: false
      from_address: ansibleforms@example.com
    - name: m365
      type: mail
      credential: m365-mail      # an entraid credential: mail through Microsoft 365
      send_through: graph        # graph (the default) or smtp
      from_address: noreply@example.com
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap is a single-row section, so EVERY field must be declared : see "Single-row
# sections are all or nothing" on Managed objects. Empty is a perfectly good value.
ldap:
  server: ldap.example.com
  port: 389
  ignore_certs: false
  enable_tls: false
  cert: ""
  ca_bundle: ""
  bind_user_dn: cn=bind,dc=example,dc=com
  bind_user_pw: ${SEED_LDAP_PW}
  search_base: dc=example,dc=com
  username_attribute: uid
  groups_attribute: memberOf
  enable: true
  groups_search_base: ""
  group_class: ""
  group_member_attribute: ""
  group_member_user_attribute: ""
  mail_attribute: mail
  groupfilter: ""            # optional

settings:
  url: https://forms.example.com   # the only key it needs from 7.6.0

chat_assistant:              # the chat assistant's model provider ; chat before 7.8.0
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}   # or "" with credential: an api credential (since 7.8.0)
  base_url: ""               # empty for the provider default ; azure and custom need one
  model: claude-opus-5-5
  max_turns: 20
  max_tool_rounds: 6
  timeout_seconds: 60
  allow_job_status: true
  # optional - for a proxy or a vendor with its own ways
  auth_type: ""              # "" (provider default) | bearer | api-key | x-api-key | none
  api_version: ""            # e.g. 2024-10-21 for Azure OpenAI
  request_user: ""           # sent as user, e.g. for a proxy that requires one
  ignore_certs: false        # true skips the certificate check (a self-signed proxy) - insecure
  extra_headers:             # a mapping of extra request headers
    X-Org: ops

# since 7.8.0 : made or changed at each apply, never deleted
groups:
  items:
    - name: operators
      description: Run the day-to-day forms
      users:                 # its members : usernames of local users
        - alice

users:
  items:
    - username: alice        # a local user (type: local, the default)
      email: alice@example.com
      password: ${SEED_ALICE_PW}
    - username: jdoe
      type: ldap             # ldap, entraid or oidc : only description and blocked
      blocked: true
      description: Left on 2026-10-31

# since 7.8.0 : each declared field read only on its Settings page
defaults:
  default_theme: dark        # system, light or dark
  default_language: fr
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_forms_view: tiles

logo:
  logo: images/logo.png      # relative to the seed file ; "" restores the bundled one

icon:
  icon: images/icon.svg

name:
  app_name: ACME Automation

links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true

mcp:                         # environment variable names in lower case
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false

# since 7.8.0 : made or changed at each apply, never read only
announcements:
  items:
    - name: Maintenance
      message: The app is down on Sunday from 8 to 10.
      level: warning           # info, warning or danger
      start_at: 2030-01-06T08:00:00Z
      end_at: 2030-01-06T10:00:00Z

disclaimer:
  items:
    - version: 2
      title: Terms of use
      text: Use this tool for your own team's systems only.
      checkbox_label: I agree
      enabled: true          # the version in force, one at most
      ask_again: true        # a changed text asks everyone who accepted it again

ssh:
  private_key: ${SEED_SSH_PRIVATE_KEY}
  known_hosts:               # one known_hosts line each ; [] clears them
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

下面各节说明那些仅靠注释不够清楚的部分。

---

## 运行器

从 7.3.0 起，运行器使用其类型的凭据登录，该凭据在 `url` 中保存其服务器的地址。自带 `token`，
或 `username` 和 `password` 的运行器仍然有效：种子会记录一条警告，并将它们转换为这样一个以运行器命名的凭据。
引用 `api` 或 `userpass` 凭据的运行器也仍然有效，同样会有警告：请改为将该凭据设为运行器的类型。
两者都自 7.3.0 起弃用，并将在 8.0.0 中移除。没有 `rte_mode` 的 RTE 运行器处于数据库模式，已弃用（参见
[模式](../rte/modes.html)）。`enabled: false` 的运行器不会接收任何作业，即使它是该类型的默认运行器（参见
[默认与已启用](../runners/list.html#default-and-enabled)）；没有 `enabled` 时，种子会保持其现状。

除了 `name`、`type`、`description`、`credential`、`is_default` 和 `enabled` 之外，运行器项还接受以下键：

| 键 | 设置的内容 |
|---|---|
| `rte_mode` | RTE 的模式：`outbound`、`inbound` 或 `database`（已弃用，默认值） |
| `rte_max_jobs` | 套接字模式 RTE 的 **最大并发作业数**，`0` 到 `10000`（`0`：不限制） |
| `rte_cache_mb` | 其 **作业文件缓存**，单位为 MB，`0` 到 `1048576`（`0` 表示不保留） |
| `rte_files` | 其 **作业文件**：`transfer` 或 `local` |
| `rte_drain_seconds` | 其 **停止时的等待时间**，单位为秒，`0` 到 `86400` |
| `flavour` | 属于 AAP 或 Ascender 的 `awx` 运行器：`aap` 或 `ascender`；AWX 不设置 |
| `project` | Semaphore 运行器的项目 ID、Rundeck 运行器的项目名称、Jenkins 运行器的文件夹 |
| `uri`、`ignore_certs`、`ca_bundle` | 7.3.0 之前运行器自己的地址和 TLS：仅在其凭据中没有 `url` 时使用 |

这四项 `rte_*` 设置就是运行器页面 RTE 选项卡上的设置（参见 [RTE 的设置](../runners/runner-page.html#an-rtes-settings)）：
它们优先于 RTE 上设置的同名变量，数据库模式的 RTE 会忽略它们。超出范围的值会导致种子
验证失败。

数据库模式的 RTE 可能会在种子应用之前自行注册。当种子中 RTE 运行器的 `uri` 与这样一个 RTE
注册时使用的地址相同时，它会 **接管** 那一行：它采用声明的名称和字段，RTE 不再应答时 worker 也不会再删除它，
从而不会为同一个 RTE 出现第二个运行器。

从 7.5.0 起，`databases` 部分声明表单查询的 [数据库](../databases.html)。每一项有一个 `name`、一个类型为数据库的
`credential` 和可选的 `description`；种子在凭据之后应用它，并拒绝其他类型的凭据。

---

## SSO

`sso` 部分（7.8.0 之前为 `oauth2`）声明 [SSO 提供商](../authentication/) 及其客户端：一个 `client_id` 和
`client_secret`，或凭据部分中的一个 `credential`。

自 7.8.0 起，Microsoft Entra ID 写作 `provider: entraid`，与仓库中的写法相同。它以前的名称 `provider: azuread` 仍会被
同样读取，但自 7.8.0 起弃用，并将在 8 中移除，服务器日志中会有警告。另一种提供商是 `oidc`，每种提供商最多只能有一个
设置 `enable: true`。

---

## 仓库

仓库项包含 `name`、`uri`、可选的 `branch`（省略时为远程的默认分支）、`credential`、`rebase_on_start`、
拉取计划 `cron`，以及每种用途类型的一个 `use_for_*` 标志：应用从该仓库读取的内容。

自 7.8.0 起，每种用途类型都有自己的标志。`use_for_forms`、`use_for_playbooks`、`use_for_workflows` 和 `use_for_inventories`
以前就有，其余都是新的：

| 类别 | 标志 |
|---|---|
| 设计器 | `use_for_categories`、`use_for_constants`、`use_for_forms`、`use_for_inventories`、`use_for_playbooks`、`use_for_workflows` |
| 作业 | `use_for_schedules` |
| 系统 | `use_for_general` |
| 外观 | `use_for_defaults`、`use_for_logo`、`use_for_icon`、`use_for_name`、`use_for_links`、`use_for_labels`、`use_for_announcements` |
| 访问 | `use_for_disclaimer`、`use_for_users`、`use_for_groups`、`use_for_roles`、`use_for_ldap`、`use_for_sso` |
| 连接 | `use_for_repositories`、`use_for_credentials`、`use_for_secret_stores`、`use_for_databases`、`use_for_runners`、`use_for_ssh`、`use_for_notifications`、`use_for_chat_assistant`、`use_for_mcp`、`use_for_syslog` |

表单、工作流和清单可以由多个仓库保存。其他每种类型最多由一个仓库保存：在两个仓库上设置同一个这类标志的种子
会被拒绝。每种类型在 git 中保存什么，请参见 [Git 仓库](../repositories/)。

`use_for_config` 自 7.8.0 起弃用，并将在 8 中移除。它仍会被读取为 `use_for_roles`、`use_for_categories` 和
`use_for_constants`，并在服务器日志中记录警告。当多个仓库声明它时，已经拥有这三个标志的仓库会保留它们（否则为文件中的
第一个仓库），其他仓库则一个也得不到。请改为声明这三个标志。

---

## 邮件

邮件通过 `notifications:` 中的邮件通道发送（参见 [邮件](../notification-channels/mail.html)）。`settings:` 下的
`mail_server`、`mail_port`、`mail_secure`、`mail_username`、`mail_password` 和 `mail_from` 键自 7.6.0 起弃用，
并将在 8.0.0 中移除。它们仍然有效，并会记录一次警告：种子会将它们转换为名为 `default` 的邮件通道，有 `mail_username` 时
带有 smtp 凭据 `mail-login`，中继时则使用其自身的服务器。请改为自行声明邮件通道及其凭据，如上文文件中的 `mail` 和 `smtp-login`。

---

## 聊天助手

`chat_assistant` 部分（7.8.0 之前为 `chat`）设置聊天助手的模型提供商。`provider` 为以下之一：

* `anthropic`
* `openai`
* `azure`
* `gemini`
* `grok`
* `mistral`
* `deepseek`
* `groq`
* `openrouter`
* `ollama`
* `custom`：任何其他兼容 OpenAI 的端点

与 `ldap` 一样，`chat_assistant` 部分是单行记录，因此除可选字段外，所有字段都是必填的；
省略的可选字段保持不变。

自 7.8.0 起，它还接受 `credential`：凭据部分中的一个 api 凭据，其密码就是密钥，用来代替 `api_key`（此时请声明
`api_key: ""`）。聊天助手还需要 `ENABLE_CHAT=1`，种子不会设置它；参见 [聊天助手](../chat/) 页面。

---

## 用户和组

自 7.8.0 起，`groups` 和 `users` 部分声明本地组和用户。它们在每次应用时被创建或修改，从不删除，
并且在应用中仍可编辑（参见 [用户和组](../users-and-groups.html)）。

组项包含 `name`、可选的 `description`，以及 `users` 中的成员：本地用户的用户名。用户项不提及其所属的组，
因此由组在一个地方列出其成员。种子先应用组，再应用用户。

用户项包含 `username` 和 `type`：

| 类型 | 其项提供的内容 |
|---|---|
| `local`（默认） | `email`、`description`、`blocked`，以及作为 `${ENV}` 引用的 `password`，与种子的每个密钥一样 |
| `ldap`、`entraid`、`oidc` | 仅 `description` 和 `blocked`：其余内容在每次登录时来自其目录 |

新的本地用户会加入种子中列出它的组，因此请至少给它一个组。没有 `password` 时，在管理员于应用中设置密码之前它无法登录。
目录用户在首次登录之前就会被创建，因此离职人员在尝试登录之前就会被阻止。内置管理员从不声明：它始终是返回的途径。

---

## 外观、MCP 和 SSH

自 7.8.0 起，种子还会声明应用只有一份的设置，每个部分都采用 git 仓库中同一页面的格式。

| 部分 | 页面 | 键 |
|---|---|---|
| `defaults` | **设置 > 外观 > 默认值** | `default_theme`、`default_theme_color`、`default_forms_view`、`default_timezone`、`default_date_format`、`default_language` |
| `logo`、`icon` | **徽标** 和 **图标** | `logo` 或 `icon`：图像文件的路径，相对于种子文件；`""` 恢复内置的图像 |
| `name` | **名称** | `app_name` |
| `links` | **链接** | `header_links`（每项含 `id`、`label`、`url`、`icon`、`newTab`、`parent`）和 `show_designer` |
| `mcp` | **设置 > 连接 > MCP** | `enable_mcp`、`mcp_read_only`、`mcp_chat_forms_only` |
| `ssh` | **设置 > 连接 > SSH** | `private_key` 和 `known_hosts` |
| `announcements` | **设置 > 外观 > 公告** | 含 `name`、`message`、`level`、`enabled`、`start_at`、`end_at` 的项 |
| `disclaimer` | **设置 > 访问 > 免责声明** | 含 `version`、`title`、`text`、`checkbox_label`、`enabled`、`ask_again` 的项 |

每个键都是可选的：部分中省略的内容保持应用中的现状。徽标和图标会像上传一样被检查（必须是图像，
徽标最大 900 KB，图标最大 256 KB）。

`mcp` 的键是 [MCP 服务器](../mcp/) 的环境变量的小写形式。实际环境中设置的变量保留环境中的值：
服务器日志会说明这一点，启动继续进行。

`ssh` 保存应用的私钥（作为 `${ENV}` 引用，公钥由它生成），以及应用信任的服务器，每行一条
known_hosts（主机、密钥类型和密钥）。它在每次启动时应用。

`end_at` 已过的公告会被忽略。免责声明的 `version` 是一个数字，最多只有一个 `enabled`，修改文本即是对该版本的
更正；设置 `ask_again: true` 时，会再次询问所有已接受它的人。

种子在多大程度上拥有这些内容，请参见 [托管对象](managed-objects.html#settings-the-seed-declares)。
