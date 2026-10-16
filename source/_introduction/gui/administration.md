---
layout: default
title: Administration
parent: Interface tour
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
---

# Administration
{: .no_toc }

The Settings menu: the system, its appearance, access, connections and logs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The Settings menu

**Settings** in the header opens the administration pages, grouped in the left menu under **System**, **Appearance**,
**Access**, **Connections** and **Logs**. Each entry shows only to a user with the role option its page needs:
`allowBackupOps` for **Backups**, `showLogs` for **Server log**, and `showSettings` for every other page.
See [Roles](../config/roles.html) for the role options.

---

## System

The instance itself: its settings, its health and its backups.

| Page | What it is for |
|---|---|
| **General** | The environment variables, in tabs from Configuration to Logging. See [Environment Variables](../customization/). |
| **Status** | The health of the instance and the systems it depends on, in the tabs Checks and Information. See [Monitoring](../production/monitoring.html). |
| **Backups** | Take, restore and delete backups of the database, config.yaml and the forms. See [Backups](../production/backups.html). |

![Settings > General, the Configuration tab](../assets/screenshots/settings.jpg)

### Backups

The list of backups, nightly and manual: **Add backup** takes one now, and a row's menu has **Show backup**, **Restore** and **Delete**.

![Settings > Backups](../assets/screenshots/backups.jpg)

### Restore

**Restore** shows what the backup holds, then restores it; **Create a new backup before restoring (recommended)** is ticked by default.

![Restoring a backup](../assets/screenshots/restore.jpg)

---

## Appearance

How the instance looks for everyone, and the messages it shows.

| Page | What it is for |
|---|---|
| **Defaults** | The theme, language, forms view, time zone and date format of users who chose none. See [Defaults](../appearance/defaults.html). |
| **Name** | The name in the browser tab and on the sign-in page. See [Name](../appearance/name.html). |
| **Logo** | Your own logo in the header. See [Logo](../appearance/logo.html). |
| **Icon** | Your own icon in the browser tab. See [Icon](../appearance/icon.html). |
| **Links** | The Designer link, and your own links and menus in the header. See [Links](../appearance/links.html). |
| **Environment** | A label beside the logo, such as PRODUCTION. See [Environment](../appearance/environment.html). |
| **Announcements** | Messages under the header, each from its start to its end. See [Announcements](../announcements.html). |

---

## Access

Who may sign in, and what they may do once in.

| Page | What it is for |
|---|---|
| **Disclaimer** | Terms every user accepts once, and who accepted which version. See [Disclaimer](../disclaimer.html). |
| **Users** | The local users, and the LDAP and single sign-on ones. See [Users and groups](../users-and-groups.html). |
| **Groups** | The local groups, and the LDAP and single sign-on ones. See [Users and groups](../users-and-groups/local-group.html). |
| **Roles** | The roles of config.yaml: who has them and what they allow. See [Roles](../config/roles.html). |
| **LDAP** | Sign-in with an LDAP directory or Active Directory. See [LDAP](../authentication/ldap.html). |
| **SSO** | Single sign-on with Entra ID or OpenID Connect providers. See [Authentication](../authentication/). |

![Access > LDAP, the Server tab](../assets/screenshots/ldap.jpg)

---

## Connections

The systems AnsibleForms reaches, and what it logs in to them with.

| Page | What it is for |
|---|---|
| **Repositories** | The git repositories the forms and playbooks come from. See [Git repositories](../repositories/). |
| **Credentials** | The accounts and secrets that forms, playbooks and connections use. See [Credentials](../credentials.html). |
| **Secret stores** | HashiCorp Vault and CyberArk, where credentials can be read from. See [Secret stores](../secret-stores/). |
| **Runners** | Where jobs run: RTE containers for playbooks, and AWX and the like for templates. See [Runners](../runners.html). |
| **SSH** | The key pair the app connects to git with, and the known hosts. See [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Notifications** | SMTP servers, Slack, Microsoft Teams, Telegram and webhooks. See [Notification channels](../notification-channels.html). |
| **Chat assistant** | The AI provider of the chat assistant. See [Chat assistant](../chat/). |
| **MCP** | The MCP server for AI agents. See [MCP](../mcp/). |
| **Syslog** | Syslog servers that receive the server log, the audit log, or both. See [Syslog](../production/logs.html#syslog). |

![Connections > Credentials, a credential's Connection tab](../assets/screenshots/credentials.jpg)

---

## Logs

What happened on the instance.

| Page | What it is for |
|---|---|
| **Audit log** | Who changed what, and whether it was allowed, filtered by user, action and outcome. See [Audit trail](../production/logs.html#audit-trail). |
| **Server log** | The server's own log, for troubleshooting. See [Logs](../production/logs.html). |

### Server log

The last lines of the log, the newest at the bottom, followed as they are written. The search box filters them (a regular
expression), **Clear** empties the view, not the log, and **Download** saves the whole log.

![Logs > Server log](../assets/screenshots/logs.jpg)

---

## API docs

**API docs** in the help menu (the question mark in the header) links to the Swagger UI of the REST API at `/api/v2/docs`.
See [API](../api/).

![Swagger Interface](../assets/screenshots/swagger.jpg)
