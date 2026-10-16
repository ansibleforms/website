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

