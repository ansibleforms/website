---
layout: default
title: HashiCorp Vault
parent: Secret stores
nav_order: 1
---

# HashiCorp Vault
{: .no_toc }

Read and write credentials in HashiCorp Vault KV, read dynamic secrets
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Store fields

In addition to the [fields every store has](./#adding-a-store), a HashiCorp Vault store has these fields:

| Field | Meaning |
|---|---|
| Credential | A **HashiCorp Vault** credential of [Connections > Credentials](../credentials.html): the Vault's address, its TLS settings, and the token as its password, with read access to the paths your credentials use. **Add credential** makes one of that type. AnsibleForms does not renew the token. |
| Namespace | The Vault Enterprise namespace, sent as `X-Vault-Namespace`. Shown once **Vault Enterprise** is switched on, on the **Type** step. |
| KV version | `2` (default) or `1`. |
| Default mount | Used for a reference without a slash, e.g. `myapp` becomes `secret/data/myapp`. |

The secret reference is the path, e.g. `secret/myapp/prod`. For KV v2 the `/data/` segment
is inserted when you leave it out.

---

## Writing credentials

From 7.6.0 a credential's user and password can be written to the Vault on **Save** (see [Writing credentials](./#writing-credentials)).

Switch on **Allow writing** in the store's **Options**, and set where it may write:

| Field | Meaning |
|---|---|
| Allow writing | Lets a credential write its user and password to this store on **Save**. Off by default. |
| Write prefix | The path credentials are written at or below, e.g. `secret/ansibleforms`. A mount alone, e.g. `secret`, allows the whole mount. Required with writing on. |

The secret is written as `username` and `password`, to KV v2 or v1 as the store's **KV version** says. The token needs the read, create and
update capabilities below the prefix; read checks whether a secret is already there. For KV v2 and the prefix `secret/ansibleforms`:

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

A dynamic secrets engine's path, e.g. `database/creds/readonly`, is never written: Vault makes those credentials itself.

---

## Dynamic database credentials

A reference of the form `<mount>/creds/<role>`, e.g. `database/creds/readonly`, reads from a
dynamic secrets engine such as Vault's database engine. Vault then creates a new database
account for each read, valid for the duration of the lease.

- An account is reused for 80% of its lease, not the cache time; with cache `0`, every query reads a new one.
- Vault returns only a user and password: put the rest of the connection in the credential row.
- The lease is never revoked early; the account expires when Vault ends the lease.
