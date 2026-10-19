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

1. TOC
{:toc}

---

## The types

The type says what a credential is for. It decides which fields the dialog asks for, and where it can be picked:

| Type | What it holds | Used by |
|---|---|---|
| User and password | A user and password for any login: a REST API with basic auth, a service and more. The default | Playbooks, through a form's `credentials` or a credential field; [REST expressions](../expressions/credentials.html) |
| SSH | A user and password for SSH to a server, with its host and port | Playbooks, through a form's `credentials`, `ansibleCredentials` or a credential field, and a workflow node's login |
| Git | A user and password or token for git repositories | [Repositories](../repositories/authentication.html) |
| API | A user and password or token for a REST API | [REST expressions](../expressions/credentials.html), a Telegram bot token, a webhook's bearer token, the chat assistant's API key |
| Database | A database login, with its type, host, port and database name | Form queries (`dbConfig`) and `fnCredentials`; it can be tested |
| CyberArk | The address of the CyberArk Central Credential Provider (CCP) and its TLS, and the AppID, client certificate and key a CyberArk store logs in with | A [CyberArk](../secret-stores/cyberark.html) secret store |
| SMTP | A mail server, its port and TLS, and its login (none for a relay) | A mail [notification channel](../notification-channels.html) |
| LDAP | A directory's servers, port, TLS and certificates, and its bind DN and password | An [LDAP directory](../authentication/ldap.html) |
| Microsoft Entra ID | The app registration of a provider: its tenant ID, client ID, client secret and redirect URI | An [Entra ID provider](../authentication/entra-id.html) |
| Open ID | The client of a provider: its issuer, client ID, client secret and redirect URI | An [OIDC provider](../authentication/oidc.html) |
| RTE | The token (`RTE_TOKEN`) and address of an RTE | An RTE [runner](../runners.html) |
| AWX, AAP, Ascender | The token or login, and the address, of that platform | A runner of that type |
| Semaphore, Rundeck | The API token and address of that product | A runner of that type |
| Jenkins | A user, its API token and the address of a Jenkins | A Jenkins runner |
| HashiCorp Vault | The token and address a Vault store logs in with | A [HashiCorp Vault](../secret-stores/hashicorp-vault.html) secret store |

A database credential can be of type MySQL, MSSQL, PostgreSQL, Oracle or MongoDB.

In the API and the [config seed](../seed/), the types are `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` and `vault`. The upgrade from 6
gives every credential the type `userpass`, or `database` for a database one: a form uses it as in 6. Change it to SSH for a
login a workflow node's playbook connects with, or to API for a REST API.

---

## Addresses in credentials

From 7.3.0 a login that works on one server carries that server, so the record that uses it only names the credential:

| Record | What moved into its credential |
|---|---|
| An LDAP directory | Its servers, port, TLS, certificates and bind account, into an `ldap` credential named `<directory>-ldap` |
| An SSO provider | Its client ID and secret, tenant or issuer, and redirect URI, into an `entraid` or `oidc` credential named `<provider>-sso` |
| A runner | Its address and TLS, and its token or login, into a credential of its type, `<runner>-token` or `<runner>-login` |
| A secret store | Its address and TLS, and its token (`<store>-token`) or CyberArk AppID and certificate (`<store>-appid`) |
| A mail channel | Its server, port and TLS, into its `smtp` credential, or a new one named `<channel>-smtp` |

The upgrade to 7.3.0 makes these moves once. A record that already named a credential keeps it, and gets a copy of it when
another record used the same login with another server. Records declared in the [config seed](../seed/) are left as the seed has them.
The credentials of the connections and sign-ins can only be changed by an admin, see [Who may change a credential](../credentials.html#who-may-change-a-credential).
