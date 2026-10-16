---
layout: default
title: Credential types
parent: Credentials
nav_order: 1
---

# Credential types
{: .no_toc }

What each type holds, and where it can be picked
{: .fs-6 .fw-300 }

The type says what a credential is for. It decides which fields the dialog asks for, and where it can be picked:

| Type | What it holds | Used by |
|---|---|---|
| User and password | A user and password for any login: a REST API with basic auth, a service and more. The default | Playbooks, through a form's `credentials` or a credential field; [REST expressions](../expressions/credentials.html) |
| SSH | A user and password for SSH to a server, with its host and port | Playbooks, through a form's `credentials`, `ansibleCredentials` or a credential field, and a workflow node's login |
| Git | A user and password or token for git repositories | [Repositories](../repositories/authentication.html) |
| API | A user and password or token for a REST API | [REST expressions](../expressions/credentials.html), a HashiCorp Vault store's token, a Telegram bot token, a webhook's bearer token, the chat assistant's API key |
| Database | A database login, with its type, host, port and database name | Form queries (`dbConfig`) and `fnCredentials`; it can be tested |
| CyberArk | The AppID, client certificate and key a CyberArk store logs in with | A [CyberArk](../secret-stores/cyberark.html) secret store |
| SMTP | A user and password for a mail server | A mail [notification channel](../notification-channels.html) |

A database credential can be of type MySQL, MSSQL, PostgreSQL, Oracle or MongoDB.

In the API and the [config seed](../seed/), the types are `userpass`, `ssh`, `git`, `api`, `database`, `cyberark` and
`smtp`. The upgrade from 6 gives every credential the type `userpass`, or `database` for a database one: a form uses it as
in 6. Change it to SSH for a login a workflow node's playbook connects with, or to API for a REST API.
