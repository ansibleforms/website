---
layout: default
title: "A credential's page"
parent: Credentials
nav_order: 3
---

# A credential's page
{: .no_toc }

A credential's tabs, and what uses it
{: .fs-6 .fw-300 }

A credential's page shows the steps of its dialog as tabs, plus what uses it:

| Tab | What it holds |
|---|---|
| Details | Name and description. |
| Type | What the credential is for. |
| Login | Every field of its type, as in the dialog's **Login** step: the user, the password, and where it logs in (host and port, the database, the mail server, the directory's servers, the tenant or issuer, the server's address and its TLS). A CyberArk credential's AppID, client certificate and key. |
| Store | Database or Secret store, and the store and reference. Not for CyberArk nor HashiCorp Vault. |
| Used by | Everything that names this credential: secret stores, notification channels, repositories, LDAP directories, SSO providers, runners, [databases](../databases.html) (from 7.5.0), the chat assistant, forms and the designer's workflows. A row opens it. |

The password is typed in the **Login** tab, and is never shown again once saved: left empty, the stored one stays. For a CyberArk
credential, leave the client key empty to keep the stored one. Top right are **Test connection** (database credentials only),
**Delete** and **Save**.

From 7.3.0, **Delete** and a new name are refused while **Used by** lists anything, see [Credentials in use](../credentials.html#credentials-in-use).

A credential declared in the [config seed](../seed/) is read only on this page: change it in the seed file instead.
