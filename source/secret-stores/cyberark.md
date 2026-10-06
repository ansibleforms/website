---
layout: default
title: CyberArk
parent: Secret stores
nav_order: 2
---

# CyberArk
{: .no_toc }

Read credentials from the CyberArk Central Credential Provider (CCP)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

{: .warning }
> **Experimental.** Built to the documented CCP API and tested against a simulated CCP, not
> yet against a live CyberArk. Please report what you find.

The CCP is the REST interface of CyberArk's Application Access Manager.

---

## Store fields

Besides the [fields every store has](./#adding-a-store), a CyberArk store takes these:

| Field | Meaning |
|---|---|
| URL | Base URL of the CCP, e.g. `https://ccp.example.com`. `/AIMWebService/api/Accounts` is added. |
| AppID | The application defined for AnsibleForms in CyberArk. |
| Client certificate / key | PEM, when the AppID is restricted to a client certificate. Leave empty when it is restricted to allowed machines (the AnsibleForms server's address) or an OS user. |

---

## Secret reference

The secret reference names the account as `;`-separated pairs:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Allowed keys: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` passes the rest as CCP's own query, with `QueryFormat=Exact` unless you set it.
- An `AppID` in the reference is ignored: the store's AppID is always used.
- The account's password (`Content`) becomes the password; `UserName`, `Address`, `Port` and
  `Database` fill user, host, port and database name.

---

## Extra options

The store's extra options, as a JSON object:

| Key | Meaning |
|---|---|
| `reason` | Sent as `Reason` when the reference has none, for CyberArk's audit. |
| `check_ref` | A reference **Test connection** reads for real. Without it the test only proves the CCP answers and accepts the AppID. |
| `timeout_ms` | Request timeout, default 10000. |

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
