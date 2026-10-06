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

---

{: .warning }
> **Experimental.** Not yet tested against a live CyberArk installation; please report your findings.

The CCP is the REST interface of CyberArk's Application Access Manager.

---

## Store fields

In addition to the [fields every store has](./#adding-a-store), a CyberArk store has these fields:

| Field | Meaning |
|---|---|
| URL | Base URL of the CCP, e.g. `https://ccp.example.com`. `/AIMWebService/api/Accounts` is added. |
| AppID | The application defined for AnsibleForms in CyberArk. |
| Client certificate / key | PEM, only when the AppID requires a client certificate. |

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
