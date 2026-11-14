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
| Store | Where the user and password are kept: **Database** (encrypted in the AnsibleForms database) or **Secret store**. Under **Secret store**, **Point to a key** reads a secret already in the store, and **Write to a key** writes the user and password typed in the **Login** step to the store on **Save**. Then pick the store and fill in the **Reference**; its example follows the store: a HashiCorp Vault path, or a CyberArk account. Not for CyberArk nor HashiCorp Vault, which a secret store logs in with. |
| Login | What the type logs in with and where, see below. |

The **Type** step lists the types by name: AAP, API, Ascender, AWX, CyberArk, Database, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, and User and password (see [Credential types](types.html)).

The **Login** step holds every field of the type, the address included; there is no separate connection step:

| Types | Fields of the Login step |
|---|---|
| Every type but CyberArk | The password, or what stands for it: the bind password of LDAP, the client secret of Entra ID and Open ID, the token of HashiCorp Vault, the RTE token, the API token of Semaphore, Rundeck and Jenkins, a token or password for AWX, AAP and Ascender |
| Every type but HashiCorp Vault, RTE, Semaphore and Rundeck | The user: the AppID of CyberArk, the bind DN of LDAP, the client ID of Entra ID and Open ID, optional for AWX, AAP and Ascender |
| SSH, Database | **Host** and **Port**; for a database also the **Database type** and **Database** |
| SSH | **Private key** and its **Passphrase**, from 7.6.0; with a key, the password is optional |
| User and password, API | **Host** and **Port**, both optional, from 7.6.0 |
| SMTP | **Mail server** (required), its **Port** and **Use TLS**; from 7.6.0 the user and password are optional, empty for a relay |
| LDAP | The directory's **Servers** (required), its **Port** and **Enable TLS**; with TLS, **Ignore certs**, the **CA bundle** and a **Client certificate** |
| Microsoft Entra ID | **Tenant ID** (required) and **Redirect URI**; from 7.6.0 **Sign in with**: **Client secret** or **Certificate** (mail only) |
| Open ID | **Issuer** (required) and **Redirect URI** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, the address it logs in to, required, with **Skip certificate verification** and the **CA bundle** |
| CyberArk | **Client certificate** and **Client key** |

With **Point to a key**, the user and password are not asked: the store gives them. The **Login** step then keeps only the address fields of the type (SSH, database, mail and directory servers, a server address, the optional host and port of User and password and API from 7.6.0), and a Git login has no **Login** step at all: it is saved from the **Store** step.

With **Write to a key** (from 7.6.0), the **Login** step asks the user and password, and **Save** writes them to the store at the **Reference**; AnsibleForms keeps only the store and the reference. Only the stores that allow writing are offered, and **Add secret store** makes one with writing already on. A key that already holds a secret is replaced only when **Overwrite a secret already there** is ticked, see [Writing credentials](../secret-stores/#writing-credentials).

A row opens the credential's own page. Its menu offers **Edit**, **Test connection** (database credentials only) and **Delete**. The
password is changed on the credential's page, in its **Login** tab.
