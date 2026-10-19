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

The page under **Connections > Credentials** lists every credential with its **Name**, **Type**, **Description** and **Used by**, the
number of records, forms and workflows that name it (see [Credentials in use](../credentials.html#credentials-in-use)).

**Add credential** opens a dialog in steps:

| Step | Fields |
|---|---|
| Credential | Name and description, both required. |
| Type | One of 18 types, see below. |
| Login | What the type logs in with and where, see below. |
| Store | Where the user and password are kept: **Database** (encrypted in the AnsibleForms database) or **Secret store**, with the store and the **Reference** in it. Not for CyberArk nor HashiCorp Vault, which a secret store logs in with. |

The **Type** step lists the types by name: AAP, API, Ascender, AWX, CyberArk, Database, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, and User and password (see [Credential types](types.html)).

The **Login** step holds every field of the type, the address included; there is no separate connection step:

| Types | Fields of the Login step |
|---|---|
| Every type but CyberArk | The password, or what stands for it: the bind password of LDAP, the client secret of Entra ID and Open ID, the token of HashiCorp Vault, the RTE token, the API token of Semaphore, Rundeck and Jenkins, a token or password for AWX, AAP and Ascender |
| Every type but HashiCorp Vault, RTE, Semaphore and Rundeck | The user: the AppID of CyberArk, the bind DN of LDAP, the client ID of Entra ID and Open ID, optional for AWX, AAP and Ascender |
| SSH, Database | **Host** and **Port**; for a database also the **Database type** and **Database** |
| SMTP | **Mail server** (required), its **Port** and **Use TLS** |
| LDAP | The directory's **Servers** (required), its **Port** and **Enable TLS**; with TLS, **Ignore certs**, the **CA bundle** and a **Client certificate** |
| Microsoft Entra ID | **Tenant ID** (required) and **Redirect URI** |
| Open ID | **Issuer** (required) and **Redirect URI** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, the address it logs in to, required, with **Skip certificate verification** and the **CA bundle** |
| CyberArk | **Client certificate** and **Client key** |

A row opens the credential's own page. Its menu offers **Edit**, **Test connection** (database credentials only) and **Delete**. The
password is changed on the credential's page, in its **Login** tab.
