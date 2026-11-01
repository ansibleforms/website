---
layout: default
title: 示例
parent: 配置种子
nav_order: 1
translated_from: cf1f2b0122ca5cd2dfcc411e4ed20fb683b079bf
---

# 示例
{: .no_toc }

一个完整的种子文件，逐部分说明
{: .fs-6 .fw-300 }

---

下面的种子文件声明了除 `oauth2` 和已弃用的 `awx` 之外的所有部分；密钥来自 `${SEED_AWX_TOKEN}` 这样的
环境变量：

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

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true

syslog_servers:
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

notification_channels:
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap and settings are single-row sections, so EVERY field must be declared - see
# "Single-row sections are all or nothing" below. Empty is a perfectly good value.
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
  groupfilter: ""            # optional, see below

settings:
  mail_server: smtp.example.com
  mail_port: 587
  mail_secure: false
  mail_username: ""
  mail_password: ""
  mail_from: ansibleforms@example.com
  url: https://forms.example.com

chat:                        # the chat assistant's model provider (6.5)
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}
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
```

`provider` 为以下之一：

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

与 `ldap` 一样，`chat` 部分是单行记录，因此除可选字段外，所有字段都是必填的；
省略的可选字段保持不变。

聊天助手还需要 `ENABLE_CHAT=1`；参见 [聊天助手](../chat) 页面。

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
