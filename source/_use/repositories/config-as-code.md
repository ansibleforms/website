---
layout: default
title: Configuration in git
parent: Git repositories
nav_order: 5
---

# Configuration in git
{: .no_toc }

Every setting kept in a git repository, read and written both ways
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For admins who want the settings, the users and the connections of AnsibleForms reviewed and versioned in git, since 7.8.0.

---

## The usage types

A repository's **Usage** step, in its wizard and on the **Usage** tab of its page, says what the app takes from it.

The types are grouped under six headings, each with the number of types it holds, for example **Designer (6)**. Every type has
its own checkbox and a short line saying what the repository holds for it; the box on a heading ticks or unticks every type of
that heading that can be ticked.

| Heading | Usage types (flag) |
|---|---|
| **Designer** | **Categories** (`use_for_categories`), **Constants** (`use_for_constants`), **Forms** (`use_for_forms`), **Inventories** (`use_for_inventories`), **Playbooks** (`use_for_playbooks`), **Workflows** (`use_for_workflows`) |
| **Jobs** | **Schedules** (`use_for_schedules`) |
| **System** | **General** (`use_for_general`) |
| **Appearance** | **Defaults** (`use_for_defaults`), **Logo** (`use_for_logo`), **Icon** (`use_for_icon`), **Name** (`use_for_name`), **Links** (`use_for_links`), **Labels** (`use_for_labels`), **Announcements** (`use_for_announcements`) |
| **Access** | **Disclaimer** (`use_for_disclaimer`), **Users** (`use_for_users`), **Groups** (`use_for_groups`), **Roles** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Connections** | **Repositories** (`use_for_repositories`), **Credentials** (`use_for_credentials`), **Secret stores** (`use_for_secret_stores`), **Databases** (`use_for_databases`), **Runners** (`use_for_runners`), **SSH** (`use_for_ssh`), **Notifications** (`use_for_notifications`), **Chat assistant** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Forms**, **Inventories** and **Workflows** may be ticked on several repositories. **Playbooks** come from one: the Usage step
greys it on the others, and the server takes the first one with a warning. Every other type belongs to one repository at
most, and a second one is refused by the API and by the config seed. A type another repository holds shows ticked in grey and
disabled, its tooltip naming that repository: `Already managed by the "platform" repository`.

Turning a usage type on or off is an admin's change only, as the **Uri** and the **Branch** are (see
[Who may change a repository](adding.html#who-may-change-a-repository)).

---

## Where a repository keeps them

A repository holds a type in any YAML file, of any name, in any folder: the file's top-level key says which type it holds.

That key is always `controller_` and the type's key: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
Every `.yaml` or `.yml` file of the repository is looked at, at any depth, hidden files and folders left out. A file may hold
several types, and a type may be spread over many files.

| Key | Holds |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | one map, for what the app has one of; one file at most gives it |
| `controller_users:` | a list of users, each found by its `type` (local when left out) and its `username` |
| `controller_disclaimer:` | a list of versions, each found by its `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | the roles, the categories and the constants, in their usual format |
| every other `controller_` key | a list of entries, each found by its `name` |

An object is found by its name within its type, never by its file: an entry moved to another file keeps its object. A plain key
(`credentials:`, a Galaxy requirements file's `roles:`, a vars file's `labels:`) is no type's, and the app never reads nor writes
it. A form is never a type's file, and a key of a type the repository is not used for is left alone, with a hint in the pull
output.

### Roles, categories and constants

These three keep the format of `config.yaml`, now each under its own key, in a usage type of its own (one repository each).

Each is read from the file of its repository that gives its key at the top level, any name and any folder; one file may give
all three. When no file gives it, the repository's `config.yaml` is still read, with its plain `roles:`, `categories:` and
`constants:` keys: this is deprecated since 7.8.0 and no longer read in 8.0, and the server log, the pull output and the
repository's page say so. Move each key to a file of its own, `roles.yaml` holding `controller_roles:` for instance.

A key no repository holds comes from the base configuration, as before: its copy in the database, or the file at
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). The **Use for config** switch of before is gone: an upgraded
instance gives **Roles**, **Categories** and **Constants** to the repository that had it. The config seed, a repository's
`controller_repositories:` entries and the API still take `use_for_config` as a deprecated alias of the three, with a warning.

---

## Both ways: git and the app

A repository used for a type is kept in step with the app in both directions, the app's database staying what runs.

| Direction | What happens |
|---|---|
| Git to the app | After each pull, clone or reset of the repository, and when the server starts, its files are read in: a new name makes an object, a changed entry changes it, a removed entry removes it |
| The app to git | A save in the app writes back into the file of the entry: only the fields it changed, the file's comments, other keys and other entries kept. A new object goes at the end of the first file giving the type's key, else into `<key>.yaml` at the root (`credentials.yaml`), made; a delete removes its entry. It waits for the repository's **Push** |

An entry that is not valid is refused alone, with its place and why, and the object of its name stays as it was. An entry that
names an object not there yet (a runner and its credential) waits, and is read again when that type is next pulled. A rename
in git is followed when one name leaves a file and one new name appears in it, the rest unchanged.

### Turning a usage on or off

Saving a repository with a type turned on or off first asks what to do, and shows what the change will do.

| Change | Question | What it does |
|---|---|---|
| On | **Turn on Credentials**: `Use platform for Credentials?` | The repository is pulled and its entries read in; git wins on a name both have; the app's other objects are written to the repository, waiting for **Push**, without their secrets |
| Off | **Turn off Credentials**: `Stop using platform for Credentials?` | The repository is pulled once more, then its objects are unlinked: they stay in the app as they are, and the files in git are left alone |
| Several | **Change the usage**: `Change what platform is used for?` | One question, a section per type, confirmed with **Save the usage** |

The question also lists what stays in the app: the objects of the config seed, runners an RTE registered itself, and those
waiting for approval. A message then says what each type took, for example
`Credentials: 2 read in from its files, 3 written to the repository (waiting for Push), 1 replaced by git, 0 kept in this app.`

### What the pull output says

The repository's **Show last pull output** holds a line per type after git's own output.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

An object kept in a repository shows **Repository: platform** on its page (its repository's name), the file of its entry in its tooltip. A save of
it writes that file, and the repository's **Push** sends it to git.

---

## Secrets

Git never holds a plain secret: a secret field of an entry is only an `${ENV}` reference, resolved from the environment.

Passwords, tokens, client secrets and keys are written as `${SEED_RTE_TOKEN}`, as in the [config seed](../seed/). An entry with
a plain secret, or naming a variable that is not set, is refused and named in the pull output; so is a variable of the server
itself (`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` ...). A secret left out of an entry keeps the one in the app's
database, and the app writes its own objects to git without their secrets.

A secret typed in the app for an object whose entry gives it as an `${ENV}` reference is refused: change the variable, or the
entry in git.

---

## The designer and these files

The designer keeps out of the files the usage types own, so a form edit never changes a setting.

It never lists, reads, writes nor deletes a file giving the key of a type its repository holds, nor the images such a file
names. It also refuses to write a file whose content would give a type's key, and its forms load never reads such a file as a form.

---

## Every type, with an example

Each type's entries are in the config seed's format, so a seed item and a repository entry are interchangeable.

The file names below are examples: any name and any folder would do.

### Categories, constants and roles

The categories and the roles are lists, the constants one map, each under its own key.

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

Each role is checked on its own: one that is not valid is refused alone, and the others are served. The roles may be spread
over several files, served in the order of their files. See [Roles](../config/roles.html).

### Schedules

The schedules are a `controller_schedules:` list, each entry naming the form it runs and timed by exactly one of `cron`,
`rrule` or `one_time_run`.

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

The "Run later" jobs users plan stay in the app. See [Schedules](../jobs/schedules.html) for the timings and the prompts.

### General

The **General** settings are one map, by their environment variable names in lower case.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Only the variables the General page changes are taken; a key in upper case, or a variable set in the real environment, is
refused. A variable whose name ends in `_PASSWORD`, `_SECRET` or `_TOKEN` is only an `${ENV}` reference.

### Defaults, logo, icon, name and links

The Appearance pages are one map each, holding what the page saves.

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

The logo and the icon are images of the repository, named relative to the file naming them. A field the config seed declares
stays the seed's.

### Labels and announcements

The labels and the announcements are lists of entries, each found by its name.

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

An announcement whose end is already past is not imported, said on a `Not imported` line of the pull output.

### Disclaimer

The disclaimer is a list of versions, each found by its `version`, one of them enabled at most.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

A changed text from git corrects that version; `ask_again: true` asks everyone who accepted it again. Who accepted what is never in git.

### Users and groups

A group's entry lists its local members; a user's entry says nothing of its groups.

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

A local user's `password` is only an `${ENV}` reference, hashed when read. A user of a directory (`ldap`, `entraid`, `oidc`) gives
only its `description` and `blocked`. The built-in admin is never read from nor written to git.

### LDAP and SSO

The LDAP directories and the SSO providers are lists, each naming the credential it signs in with.

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

The entry named `main` is the main directory, which is never renamed nor deleted. `position` keeps the lookup order.

### Repositories

A repository may hold the other repositories, in the format of the config seed's `repositories:` items.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

The repository holding them is never in its own files, an entry never sets `use_for_repositories`, and a user or a token in
the `uri` is refused: name a credential instead. An entry removed deletes its repository, unless it has changes not pushed yet.

### Credentials, secret stores and databases

The credentials are read first, then everything that names one of them.

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

Removing a credential's entry while something still uses it is refused, said in the pull output.

### Runners

A runner names its credential, of the runner's type, and waits while it is missing.

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

A runner an RTE registered itself, or one waiting for approval, stays in the app.

### SSH

The app's SSH key and the hosts it trusts are one map, read right after the repositories, before they are cloned.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` is only an `${ENV}` reference, never written to git: left out, the app keeps its own. `known_hosts` holds one
known_hosts line per server, and an empty list clears them.

### Notifications and syslog

The notification channels and the syslog servers are lists of entries.

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

### Chat assistant and MCP

The chat assistant and the MCP settings are one map each.

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

`enable_chat` and the MCP keys are environment variable names in lower case. A variable set in the real environment is never
written, and a map giving it is refused. `api_key` is only an `${ENV}` reference, or left out.
