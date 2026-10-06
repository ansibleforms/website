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

In addition to the [fields every store has](./#adding-a-store), a HashiCorp Vault store has these fields:

| Field | Meaning |
|---|---|
| Token | A token with read access to the paths your credentials use. AnsibleForms does not renew it. |
| Namespace | Vault Enterprise namespace, sent as `X-Vault-Namespace`. |
| KV version | `2` (default) or `1`. |
| Default mount | Used for a reference without a slash, e.g. `myapp` becomes `secret/data/myapp`. |

The secret reference is the path, e.g. `secret/myapp/prod`. For KV v2 the `/data/` segment
is inserted when you leave it out.

---

## Dynamic database credentials

A reference of the form `<mount>/creds/<role>`, e.g. `database/creds/readonly`, reads from a
dynamic secrets engine such as Vault's database engine. Vault then creates a new database
account for each read, valid for the duration of the lease.

- An account is reused for 80% of its lease, not the cache time; with cache `0`, every query reads a new one.
- Vault returns only a user and password: put the rest of the connection in the credential row.
- The lease is never revoked early; the account expires when Vault ends the lease.
