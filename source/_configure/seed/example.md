---
layout: default
title: Example
parent: Config seed
nav_order: 1
---

# Example
{: .no_toc }

A complete seed file, section by section
{: .fs-6 .fw-300 }

---

The following seed file declares every section except `oauth2` and the deprecated `awx`; secrets come from environment
variables such as `${SEED_AWX_TOKEN}`:

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

`provider` is one of:

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
* `custom` : any other OpenAI-compatible endpoint

Like `ldap`, the `chat` section is a single row, so every field is required except the optional
ones; an optional field that is omitted is left unchanged.

The chat assistant also needs `ENABLE_CHAT=1`; see the [Chat assistant](../chat) page.

Since 7.3.0 a runner signs in with a credential of its type, which holds its server's address in `url`. A runner with its own `token`,
or `username` and `password`, still works: the seed logs a warning and turns them into such a credential, named after the runner. A
runner that names an `api` or `userpass` credential still works too, with a warning: give that credential the runner's type instead.
Both are deprecated since 7.3.0 and removed in 8.0.0. An RTE runner without `rte_mode` is in database mode, deprecated (see
[Modes](../rte/modes.html)). A runner with `enabled: false` gets no job, its type's default included (see
[Default and Enabled](../runners/list.html#default-and-enabled)); without `enabled`, the seed leaves it as it is.

A runner item takes these keys besides `name`, `type`, `description`, `credential`, `is_default` and `enabled`:

| Key | What it sets |
|---|---|
| `rte_mode` | An RTE's mode: `outbound`, `inbound` or `database` (deprecated, the default) |
| `rte_max_jobs` | A socket-mode RTE's **Max concurrent jobs**, `0` to `10000` (`0`: no limit) |
| `rte_cache_mb` | Its **Job files cache** in MB, `0` to `1048576` (`0` keeps none) |
| `rte_files` | Its **Job files**: `transfer` or `local` |
| `rte_drain_seconds` | Its **Drain time on stop** in seconds, `0` to `86400` |
| `flavour` | An `awx` runner that is an AAP or an Ascender: `aap` or `ascender`; none for AWX |
| `project` | A Semaphore runner's project id, a Rundeck runner's project name, a Jenkins runner's folder |
| `uri`, `ignore_certs`, `ca_bundle` | The runner's own address and TLS, from before 7.3.0: used only while its credential holds no `url` |

The four `rte_*` settings are those of the runner page's RTE tab (see [An RTE's settings](../runners/runner-page.html#an-rtes-settings)):
they win over the same variables set on the RTE, and an RTE in database mode ignores them. A value out of its range fails the seed's
validation.

An RTE in database mode may register itself before the seed is applied. A seeded RTE runner whose `uri` is the address such an RTE
registered at **adopts** that row: it takes the declared name and fields, and the worker no longer removes it when the RTE stops
answering, instead of a second runner for the same RTE.

From 7.5.0 the `databases` section declares the [databases](../databases.html) forms query. An item has a `name`, a `credential` of
type database and an optional `description`; the seed applies it after the credentials, and refuses a credential of another type.
