---
layout: default
title: HashiCorp Vault
parent: Secret stores
nav_order: 1
---

# HashiCorp Vault
{: .no_toc }

Read credentials from HashiCorp Vault, from KV v1 or v2 or a dynamic secrets engine
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Store fields

Besides the [fields every store has](./#adding-a-store), a HashiCorp Vault store takes these:

| Field | Meaning |
|---|---|
| Token | A token with read access to the paths your credentials use. Nothing renews it. |
| Namespace | Vault Enterprise namespace, sent as `X-Vault-Namespace`. |
| KV version | `2` (default) or `1`. |
| Default mount | Used for a reference without a slash, e.g. `myapp` becomes `secret/data/myapp`. |

The secret reference is the path, e.g. `secret/myapp/prod`. For KV v2 the `/data/` segment
is inserted when you leave it out.

---

## Dynamic database credentials

{: .warning }
> **Experimental.** Tested against a simulated Vault, not yet against a live database secrets
> engine. Please report what you find.

A reference of the form `<mount>/creds/<role>`, e.g. `database/creds/readonly`, reads from a
dynamic secrets engine such as Vault's database engine. Vault then creates a new database
account for each read, valid for the lease.

- AnsibleForms reuses the account for 80% of its lease rather than for the store's cache
  time, so it does not create an account on every query. A store with cache `0` still reads
  every time.
- Vault returns only `username` and `password`. Put host, port, database type and database
  name in the credential row, and point the row at the store with `database/creds/<role>`.
- Nothing revokes the lease early; the account expires when Vault ends the lease.
