---
layout: default
title: CyberArk
parent: Secret stores
nav_order: 2
---

# CyberArk
{: .no_toc }

Read credentials through the CyberArk CCP, write them through its PVWA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Experimental.** Not yet tested against a live CyberArk installation; please report your findings.

The CCP is the REST interface of CyberArk's Application Access Manager.

---

## Store fields

In addition to the [fields every store has](./#adding-a-store), a CyberArk store has these fields:

| Field | Meaning |
|---|---|
| Credential | A **CyberArk** credential of [Connections > Credentials](../credentials.html): the base URL of the CCP, e.g. `https://ccp.example.com` (`/AIMWebService/api/Accounts` is added), its TLS settings, its AppID (the application defined for AnsibleForms in CyberArk), and a client certificate and key in PEM, only when the AppID requires one. |

---

## Secret reference

The secret reference identifies the account as `;`-separated key-value pairs:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Allowed keys: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` passes the rest of the reference as a native CCP query, with `QueryFormat=Exact`
  unless you set it otherwise.
- An `AppID` in the reference is ignored: the store's AppID is always used.
- The account's password (`Content`) becomes the password; `UserName`, `Address`, `Port` and
  `Database` fill user, host, port and database name.

---

## Writing credentials

From 7.6.0 a credential's user and password can be written to CyberArk on **Save** (see [Writing credentials](./#writing-credentials)).
The CCP only reads, so AnsibleForms writes through the PVWA REST API, logged on with a credential of its own.

Switch on **Allow writing** in the store's **Options**, then fill in:

| Field | Meaning |
|---|---|
| Allow writing | Lets a credential write its user and password to this store on **Save**. Off by default. |
| Safes to write to | The safes credentials may be written to, comma separated, e.g. `Linux, DB`. Required with writing on. |
| PVWA address | The PVWA's base URL, e.g. `https://pvwa.example.com`. Required. |
| PVWA credential | A **User and password** or **API** credential of its own, never read from a secret store, that may add accounts to those safes and change their passwords. Required. |
| Logon method | How the PVWA credential logs on: CyberArk (default), LDAP, RADIUS or Windows. |
| Platform ID | The platform of the accounts it adds, e.g. `UnixSSH`. Needed to add a new account. |

The reference names the account as for reading, `Safe=Linux;Object=srv01-root`, with `Address=srv01.example.com` when its platform needs one.

- A new account is added to the safe with the platform, the user name and the password.
- An existing account is changed only when **Overwrite a secret already there** is ticked: its user name, then its password.
- The PVWA session is logged off after each write. Privilege Cloud's OAuth sign-in is not supported.

---

## Extra options

The store's extra options are set as a JSON object:

| Key | Meaning |
|---|---|
| `reason` | Sent as `Reason` when the reference has none, for CyberArk's audit. |
| `check_ref` | A reference that **Test connection** actually reads. Without it, the test only verifies that the CCP responds and accepts the AppID. |
| `timeout_ms` | Request timeout, default 10000. |

For example, to send a reason and let **Test connection** read a probe account:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
