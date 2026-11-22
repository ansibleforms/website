---
layout: default
title: Config seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
---

# Config seed
{: .no_toc }

Declare the admin objects in a file
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators who provision from git: declare the admin objects in a file, so an instance can be rebuilt on an empty database.

---

## What it covers

Set `CONFIG_SEED_PATH` to a YAML file, and AnsibleForms applies it at startup. The file declares objects and settings that
otherwise exist only in the database:

| Section            | What it declares                                                                  |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Where jobs run: RTEs, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins           |
| `secret_stores`    | Secret stores (HashiCorp Vault, ...)                                              |
| `credentials`      | Credentials                                                                       |
| `databases`        | The databases forms query, each with its credential, from 7.5.0                    |
| `sso`              | SSO providers: Entra ID and OIDC (`oauth2` before 7.8.0)                          |
| `repositories`     | Git repositories, and what the app reads from each                                |
| `syslog`           | The syslog servers that get the server log and the audit entries (`syslog_servers` before 7.8.0) |
| `notifications`    | Mail servers, Slack, Teams, Telegram and webhooks (`notification_channels` before 7.8.0) |
| `labels`           | The labels beside the header's logo, from 7.3.0                                    |
| `ldap`             | The LDAP configuration                                                            |
| `settings`         | The public URL; its mail keys are deprecated since 7.6.0, for a mail channel      |
| `chat_assistant`   | The chat assistant's model provider (`chat` before 7.8.0)                         |
| `users`            | Users, local and of a directory, since 7.8.0                                      |
| `groups`           | Local groups and their members, since 7.8.0                                       |
| `defaults`         | **Settings > Appearance > Defaults**: theme, language, time zone, since 7.8.0     |
| `logo`, `icon`     | The logo and the website icon, image files beside the seed, since 7.8.0           |
| `name`             | The app's name, since 7.8.0                                                       |
| `links`            | The header's links, and whether the Designer's link shows, since 7.8.0            |
| `announcements`    | The announcements under the header, since 7.8.0                                   |
| `disclaimer`       | The versions of the disclaimer users accept, since 7.8.0                          |
| `mcp`              | The MCP server's switches, since 7.8.0                                            |
| `ssh`              | The app's SSH private key and its known hosts, since 7.8.0                        |
| `awx`              | Deprecated since 7, removed in 8: use `runners` with `type: awx`                  |

The [Example](example.html) shows every section, and [Managed objects](managed-objects.html) how far the seed owns what each one
declares: most sections make their objects read only in the app, a few only make or change them.

A seed written before 7 keeps working: each item of its `awx` section is applied as a runner of type `awx`, and the log
warns at every apply. Move those items under `runners` with `type: awx` before upgrading to 8.

The seed is **not** the same as `config.yaml` (`CONFIG_PATH`), the base configuration of the categories, roles and constants. A
repository can hold those instead, and that repository is one of the objects the seed declares, so the seed cannot live inside it.

The first admin still comes from `ADMIN_USERNAME` / `ADMIN_PASSWORD`, and the users of LDAP or SSO from their directory at sign-in.
Since 7.8.0 the `users` and `groups` sections can add local users and groups, and block a directory user before it signs in.

---

## Renamed sections

Since 7.8.0 four sections are named as the keys a [git repository](../repositories/) holds the same objects under, without
`controller_` (`sso:` for `controller_sso:`):

| Before 7.8.0              | Since 7.8.0        |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Their items are unchanged. The old names are still read, deprecated since 7.8.0 and removed in 8: each one applied logs a
warning in the server log, naming the new name. A seed that gives one section under both names is refused. Rename them in the
file before upgrading to 8.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Example](example.html) | A complete seed file, section by section |
| [Managed objects](managed-objects.html) | How the seed owns the objects it lists, and how it keeps secrets out |
| [Reloading and startup](reloading.html) | Change the file without a restart, and what happens at startup |
| [Kubernetes](kubernetes.html) | Provision AnsibleForms from a ConfigMap and Secrets |
| [Editing and audit](environment-and-audit.html) | Lock the settings pages, and what the audit log records |
