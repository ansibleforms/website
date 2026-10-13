---
layout: default
title: Credentials
nav_order: 3.5
---

# Credentials
{: .no_toc }

Store the logins that forms, repositories, secret stores and notification channels connect with
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: add the users, passwords and tokens AnsibleForms connects with, kept encrypted or read from a secret store.

---

## How it works

A **credential** is a named login, added under **Connections > Credentials**. Forms and the other admin objects refer
to it by its name, so the password itself never appears in a form. Its user and password are either kept in the
AnsibleForms database, encrypted with `ENCRYPTION_SECRET`, or read from a [secret store](secret-stores/) each time the
credential is used.

---

## Credential types

The type says what a credential is for. It decides which fields the dialog asks for, and where it can be picked:

| Type | What it holds | Used by |
|---|---|---|
| User and password | A user and password for any login: a REST API, SSH to a server and more, with a host and port when it needs them | Playbooks, through a form's `credentials`, `ansibleCredentials` or a credential field, and a workflow node's login |
| Git | A user and password or token for git repositories | [Repositories](repositories/authentication.html) |
| API | A user and password or token for a REST API | [REST expressions](expressions/credentials.html), a HashiCorp Vault store's token, a Telegram bot token, a webhook's bearer token, the chat assistant's API key |
| Database | A database login, with its type, host, port and database name | Form queries (`dbConfig`) and `fnCredentials`; it can be tested |
| CyberArk | The AppID, client certificate and key a CyberArk store logs in with | A [CyberArk](secret-stores/cyberark.html) secret store |
| SMTP | A user and password for a mail server | A mail [notification channel](notification-channels.html) |

A database credential can be of type MySQL, MSSQL, PostgreSQL, Oracle or MongoDB.

In the API and the [config seed](seed/), the types are `userpass`, `git`, `api`, `database`, `cyberark` and `smtp`.
`ssh` is the name of `userpass` before 7.0.3: still taken, and stored as `userpass`. The upgrade to 7 gives every credential
from 6 the type `userpass`, or `database` for a database one: a REST login may be changed to API, a form uses it the same way
either way.

---

## The credentials page

The page under **Connections > Credentials** lists every credential with its name, type, user, host and port.

**Add credential** opens a dialog in steps:

| Step | Fields |
|---|---|
| Credential | Name and description, both required. |
| Type | User and password, Git, API, Database, CyberArk or SMTP. |
| Login | The user, and the password for User and password, Git, API and Database. For CyberArk: the AppID, client certificate and client key. |
| Store | Where the user and password are kept: **Database** (encrypted in the AnsibleForms database) or **Secret store**, with the store and the **Reference** in it. Not for CyberArk. |
| Connection | User and password, and Database only: host and port; for a database also the **Database type** and **Database**. |

A row opens the credential's own page. Its menu offers **Edit credential**, **Test connection** (database credentials
only), **Change password** (not for CyberArk, nor for a credential read from a secret store) and **Delete credential**.

---

## A credential's page

A credential's page shows the steps of its dialog as tabs, plus what uses it:

| Tab | What it holds |
|---|---|
| Details | Name and description. |
| Type | What the credential is for. |
| Login | The user, or a CyberArk credential's AppID, client certificate and key. The password is not shown. |
| Store | Database or Secret store, and the store and reference (not for CyberArk). |
| Connection | Host and port, and a database's type and name (User and password, and Database only). |
| Used by | The secret stores, notification channels and repositories that name this credential. A row opens it. |

Top right are **Test connection** (database credentials), **Change password**, **Delete** and **Save**. The password is
typed twice in the **Change password** dialog, and is never shown again once saved. For a CyberArk credential, leave the
client key empty to keep the stored one.

A credential declared in the [config seed](seed/) is read only on this page: change it in the seed file instead.
