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
| Login | Every field of its type, as in the dialog's **Login** step: the user, the password, and where it logs in (host and port, the database, the mail server, the directory's servers, the tenant or issuer, the server's address and its TLS). A CyberArk credential's AppID, client certificate and key. From 7.6.0 the choice of how it signs in, and an SSH credential's private key and passphrase. |
| Store | Database or Secret store, and the store and reference. Not for CyberArk nor HashiCorp Vault. |
| Used by | Everything that names this credential: secret stores, notification channels, repositories, LDAP directories, SSO providers, runners, [databases](../databases.html) (from 7.5.0), the chat assistant, forms and the designer's workflows. A row opens it. |

The password is typed in the **Login** tab, and is never shown again once saved: left empty, the stored one stays. The same goes
for a CyberArk credential's client key, and from 7.6.0 for an SSH credential's private key and passphrase.

From 7.6.0 that holds only while the sign-in choice stays the same. Changed (an SSH **Private key** to **Password** and back, an
SMTP **No login** to **Login**, an Entra ID **Certificate** to **Secret** and back, a **Token** to a **Password** and back), nothing
stored fits it: the new secret it needs is required, and **Save** asks for it. An SSH credential changed to **Password** drops its
stored private key and passphrase on **Save**, as the tab says under the choice. With **Write to a key** on the **Store** tab, only
the choices with a password are offered, see [How a credential signs in](types.html#how-a-credential-signs-in).

Top right are **Test connection** (database credentials only), **Delete** and **Save**.

From 7.3.0, **Delete** and a new name are refused while **Used by** lists anything, see [Credentials in use](../credentials.html#credentials-in-use).

A credential declared in the [config seed](../seed/) is read only on this page: change it in the seed file instead.
