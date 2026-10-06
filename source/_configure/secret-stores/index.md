---
layout: default
title: Secret stores
nav_order: 3
has_children: true
has_toc: false
---

# Secret stores
{: .no_toc }

Read credentials from a secret manager instead of storing them in AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## How it works

A **secret store** is a connection to a secret manager, added under
**Connections > Secret stores**. A **credential** can then name a store and a place in it
(the *secret reference*). When a form, a playbook or an expression uses that credential:

- **user** and **password** are read from the store, every time (within the store's cache time);
- **host**, **port** and **database** stay those of the credential row. When the row leaves
  one of them empty and the secret carries it, the value from the secret is used.

Forms keep referring to the credential by name, so moving a password into a store changes
nothing in your forms.

| Store type | Status |
|---|---|
| HashiCorp Vault (KV v1 and v2, token authentication) | available |
| HashiCorp Vault dynamic credentials (`<mount>/creds/<role>`) | experimental |
| CyberArk Central Credential Provider (CCP) | experimental |

## Adding a store

Every store has the following fields:

| Field | Meaning |
|---|---|
| Name | How credentials refer to the store. |
| Type | The secret manager. |
| URL | Base URL, e.g. `https://vault.example.com:8200`. |
| Cache (seconds) | How long a secret that was read is reused. `0` reads it on every use. Default 60. |
| Ignore certificates / CA bundle | TLS verification. Leave the bundle empty to trust the system CAs. |
| Extra options | Options specific to the type, as a JSON object. |

**Test connection** checks access without reading a secret. The **Status** page checks every store, and warns 7 days
before a Vault token expires.

Each secret manager has a page of its own:

* **[HashiCorp Vault](hashicorp-vault.html)** : KV v1 and v2 with token authentication, and dynamic database credentials
* **[CyberArk](cyberark.html)** : the Central Credential Provider (CCP) of CyberArk's Application Access Manager

## Using a store

### In a credential

Under **Connections > Credentials**, pick the **Secret store** and fill in the **Secret
reference**. Leave user and password empty.

### Inline, without a credential row

Anywhere a credential name is accepted, you can reference a store directly instead (`fnCredentials`, `fnRestBasic`,
a form's `credentials:`, a query's `dbConfig`).

```javascript
fn.fnCredentials('secret:vault:secret/myapp/prod')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/myapp/prod')          // the store named `vault`
```

```yaml
- name: servers
  type: enum
  query: SELECT name FROM servers
  dbConfig: secret:vault:secret/cmdb/db
```

Without a credential row, a database secret needs at least a `db_type` and a host, for example:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Without `db_type`, the secret is a plain credential (user, password and any other keys), and a query on it assumes `mysql`.

### Key names

A secret is mapped to a credential with these aliases. Other keys are passed through.

| Credential field | Accepted keys in the secret |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | same name (inline secrets only) |

For a credential row, host, port and database name from the secret are used only where the
row leaves them empty.

A secret with a different structure can be reshaped with a `jq` expression, passed as the third argument of
`fnCredentials`:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

## In the config seed

Stores can also be declared in the config seed, like the other admin objects:

```yaml
secret_stores:
  items:
    - name: vault
      type: vault
      url: https://vault.example.com:8200
      token: ${SEED_VAULT_TOKEN}

credentials:
  items:
    - name: production-db
      secret_store: vault
      secret_ref: secret/forms/production-db
      host: db.example.com
      port: 3306
      db_type: mysql
      is_database: true
```

For details, see [Config seed](../seed).

## Upgrading from the VAULT_* variables

Before 7.1 the only store was a HashiCorp Vault configured with `VAULT_*` environment
variables, and a credential pointed at it with **Vault path**.

- **The variables are imported once** as a store named `vault`; remove them afterwards.
- **Credentials with a `vault_path`** now use that store; `vault_path` goes away in 8.
