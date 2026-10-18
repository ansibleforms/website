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
| Login | The user, or a CyberArk credential's AppID, client certificate and key. The password is not shown. |
| Store | Database or Secret store, and the store and reference (not for CyberArk). |
| Connection | Host and port, and a database's type and name (SSH and Database only). |
| Used by | The secret stores, notification channels and repositories that name this credential. A row opens it. |

Top right are **Test connection** (database credentials), **Change password**, **Delete** and **Save**. The password is
typed twice in the **Change password** dialog, and is never shown again once saved. For a CyberArk credential, leave the
client key empty to keep the stored one.

From 7.3.0, **Delete** and a new name are refused while **Used by** lists anything, see [Credentials in use](../credentials.html#credentials-in-use).

A credential declared in the [config seed](../seed/) is read only on this page: change it in the seed file instead.
