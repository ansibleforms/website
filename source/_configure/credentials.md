---
layout: default
title: Credentials
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
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

## In this section

| Page | What it covers |
|---|---|
| [Credential types](credentials/types.html) | What each type holds, and where it can be picked |
| [The credentials page](credentials/list.html) | The list of credentials, and the dialog that adds one |
| [A credential's page](credentials/credential-page.html) | A credential's tabs, and what uses it |

---

## How it works

A **credential** is a named login, added under **Connections > Credentials**. Forms and the other admin objects refer
to it by its name, so the password itself never appears in a form. Its user and password are either kept in the
AnsibleForms database, encrypted with `ENCRYPTION_SECRET`, or read from a [secret store](secret-stores/) each time the
credential is used.

---

## Who may change a credential

From 7.3.0 a credential that a connection or a sign-in depends on can only be added, changed or deleted by an admin:

| Credentials | Why |
|---|---|
| Connection types: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` and `cyberark` | A runner or a secret store takes its address and its secret from it |
| Sign-in types: `oidc`, `entraid` and `ldap` | An SSO provider or an LDAP directory signs users in with it |
| Any credential a runner names | The runner signs in with it, and a change of the runner itself needs an admin too |

Other users with access to the credentials see these read only. A user who could point such a credential at another
server would receive every secret sent through it, which is why the rule follows the one for runners. Three more rules
keep those users away from secrets they could not otherwise read:

- **Naming a guarded credential**: only an admin can name one of these credentials elsewhere, such as in a repository,
  a notification channel or the chat assistant settings. A credential that reads its password from a secret store is
  guarded the same way, whatever its type.
- **Choosing a secret store**: only an admin can point a credential at a [secret store](secret-stores/), or change the
  store or the reference it reads; another user may still send them back unchanged, or empty all of them.
- **Moving a credential**: when another user changes where a credential logs in (its host, port, issuer, tenant or
  server address) without typing its password again, the stored password is cleared, and so is the secret store
  reference it reads, so the old secret never goes to the new target.

---

## Credentials in use

A credential that records still name cannot be deleted or renamed, as they would be left pointing at nothing.
The refusal names how many records use it; the **Used by** tab of [its page](credentials/credential-page.html) lists them.
Point them at another credential first, then delete or rename it.
