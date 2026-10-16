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

Set `CONFIG_SEED_PATH` to a YAML file, and AnsibleForms applies it at startup. The file
declares objects that previously existed only in the database:

| Section                 | What it declares                                                    |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Where jobs run: RTEs, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Secret stores (HashiCorp Vault, ...)                                |
| `credentials`           | Credentials                                                         |
| `oauth2`                | SSO providers: Entra ID and OIDC                                    |
| `repositories`          | Git repositories                                                    |
| `syslog_servers`        | The syslog servers that get the server log and the audit entries    |
| `notification_channels` | Mail servers, Slack, Teams, Telegram and webhooks for notifications |
| `ldap`                  | The LDAP configuration                                              |
| `settings`              | The public URL, and the mail settings used when no mail channel is active |
| `chat`                  | The chat assistant's model provider                                 |
| `awx`                   | Deprecated since 7, removed in 8: use `runners` with `type: awx`    |

A seed written before 7 keeps working: each item of its `awx` section is applied as a runner of type `awx`, and the log
warns at every apply. Move those items under `runners` with `type: awx` before upgrading to 8.

The seed is **not** the same as `config.yaml`, which holds the categories, roles and constants
and has its own `CONFIG_PATH`. The two are kept separate on purpose: the
repository that *holds* `config.yaml` is one of the objects the seed declares, so the seed
cannot live inside it.

Users and groups are left out: they come from LDAP or SSO, and the first admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

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
