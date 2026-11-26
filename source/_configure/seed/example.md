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

1. TOC
{:toc}

---

## The file

The following seed file declares every section except the deprecated `awx`. Secrets come from environment variables such as
`${SEED_AWX_TOKEN}`, and the sections use their names of 7.8.0 (see [Renamed sections](./#renamed-sections)):

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

The sections below explain the parts that need more than a comment.

---

## Runners

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

---

## SSO

The `sso` section (`oauth2` before 7.8.0) declares the [SSO providers](../authentication/), each with its client: a `client_id` and
`client_secret`, or a `credential` of the credentials section.

Since 7.8.0 Microsoft Entra ID is `provider: entraid`, as the repositories write it. `provider: azuread`, its name before, is still
read the same, deprecated since 7.8.0 and removed in 8, with a warning in the server log. The other provider is `oidc`, and only one
provider of each kind may have `enable: true`.

---

## Repositories

A repository item has a `name`, a `uri`, an optional `branch` (the remote's default when left out), a `credential`, `rebase_on_start`,
the pull schedule `cron`, and one `use_for_*` flag for each usage type: what the app reads from it.

Since 7.8.0 every usage type has its flag. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` and `use_for_inventories` existed
before; the others are new:

| Category | Flags |
|---|---|
| Designer | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Jobs | `use_for_schedules` |
| System | `use_for_general` |
| Appearance | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Access | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Connections | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Several repositories may hold forms, workflows and inventories. Every other type is held by one repository at most: a seed that
sets the same one of those flags on two repositories is refused. What each type keeps in git is described in
[Git repositories](../repositories/).

`use_for_config` is deprecated since 7.8.0 and removed in 8. It is still read, as `use_for_roles`, `use_for_categories` and
`use_for_constants`, with a warning in the server log. When several repositories declare it, the one that holds those three already
keeps them (else the first one in the file), and the others get none. Declare the three flags instead.

---

## Mail

Mail goes through the mail channels of `notifications:` (see [Mail](../notification-channels/mail.html)). The keys
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` and `mail_from` under `settings:` are deprecated
since 7.6.0 and removed in 8.0.0. They still work and log a warning once: the seed makes them a mail channel named `default`,
with an smtp credential `mail-login` when there is a `mail_username`, or its own server for a relay. Declare the mail channel and
its credential yourself instead, as `mail` and `smtp-login` in the file above.

---

## Chat assistant

The `chat_assistant` section (`chat` before 7.8.0) sets the chat assistant's model provider. `provider` is one of:

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

Like `ldap`, the `chat_assistant` section is a single row, so every field is required except the optional
ones; an optional field that is omitted is left unchanged.

Since 7.8.0 it also takes `credential`, an api credential of the credentials section whose password is the key, instead of the
`api_key` (declare `api_key: ""` then). The chat assistant also needs `ENABLE_CHAT=1`, which the seed does not set; see the
[Chat assistant](../chat/) page.

---

## Users and groups

Since 7.8.0 the `groups` and `users` sections declare local groups and users. They are made or changed at each apply, never deleted,
and they stay editable in the app (see [Users and groups](../users-and-groups.html)).

A group item has a `name`, an optional `description` and its members in `users`: the usernames of local users. A user's item says
nothing of its groups, so a group lists its members in one place. The seed applies the groups before the users.

A user item has a `username` and a `type`:

| Type | What its item gives |
|---|---|
| `local` (the default) | `email`, `description`, `blocked`, and `password` as an `${ENV}` reference, as every secret of the seed |
| `ldap`, `entraid`, `oidc` | Only `description` and `blocked`: the rest comes from its directory at each sign-in |

A new local user takes the groups of the seed that list it, so give it at least one. Without a `password` it cannot sign in until an
admin sets one in the app. A directory user is made before it ever signs in, so a leaver is blocked before they try. The built-in
admin is never declared: it stays the way back in.

---

## Appearance, MCP and SSH

Since 7.8.0 the seed also declares settings the app has one of, each section in the format of the same page in a git repository.

| Section | Page | Keys |
|---|---|---|
| `defaults` | **Settings > Appearance > Defaults** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logo** and **Icon** | `logo` or `icon`: an image file's path, relative to the seed file; `""` restores the bundled one |
| `name` | **Name** | `app_name` |
| `links` | **Links** | `header_links` (each `id`, `label`, `url`, `icon`, `newTab`, `parent`) and `show_designer` |
| `mcp` | **Settings > Connections > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Settings > Connections > SSH** | `private_key` and `known_hosts` |
| `announcements` | **Settings > Appearance > Announcements** | Items with `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Settings > Access > Disclaimer** | Items with `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Every key is optional: what a section leaves out stays as the app has it. The logo and the icon are checked as an upload is (an image,
at most 900 KB for the logo and 256 KB for the icon).

The keys of `mcp` are the environment variables of the [MCP server](../mcp/) in lower case. A variable that the real environment
sets keeps the environment's value: the server log says so, and the start goes on.

`ssh` holds the app's private key, as an `${ENV}` reference (its public key is made from it), and the servers the app trusts, one
known_hosts line each (the hosts, the key type and the key). It is applied at each start.

An announcement whose `end_at` is past is left out. A disclaimer `version` is a number, one at most is `enabled`, and a changed text
corrects that version; with `ask_again: true` everyone who accepted it is asked again.

How far the seed owns each of these is on [Managed objects](managed-objects.html#settings-the-seed-declares).
