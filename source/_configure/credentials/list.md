---
layout: default
title: The credentials page
parent: Credentials
nav_order: 2
---

# The credentials page
{: .no_toc }

The list of credentials, and the dialog that adds one
{: .fs-6 .fw-300 }

The page under **Connections > Credentials** lists every credential with its name, type, user, host and port.

**Add credential** opens a dialog in steps:

| Step | Fields |
|---|---|
| Credential | Name and description, both required. |
| Type | User and password, SSH, Git, API, Database, CyberArk or SMTP. |
| Login | The user, and the password for User and password, SSH, Git, API and Database. For CyberArk: the AppID, client certificate and client key. |
| Store | Where the user and password are kept: **Database** (encrypted in the AnsibleForms database) or **Secret store**, with the store and the **Reference** in it. Not for CyberArk. |
| Connection | SSH and Database only: host and port; for a database also the **Database type** and **Database**. |

A row opens the credential's own page. Its menu offers **Edit credential**, **Test connection** (database credentials
only), **Change password** (not for CyberArk, nor for a credential read from a secret store) and **Delete credential**.
