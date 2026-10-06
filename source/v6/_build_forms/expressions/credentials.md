---
layout: default
title: Credentials
parent: Expressions
nav_order: 4
---

# Credentials
{: .no_toc }

Read a stored credential in an expression
{: .fs-6 .fw-300 }

---

Read a stored credential by name or by regular expression, with a fallback:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (username, password, host, port)
```

The exact name is tried first. When no credential has that name, the name is used as a regular expression, and then the fallback is tried.

#### HashiCorp Vault: stored credentials

A credential that has a **Vault Path** filled in gets its `user` and `password` from HashiCorp Vault at runtime,
instead of from the local database. `fn.fnCredentials('myapp')` keeps working unchanged.

This requires `VAULT_ADDR` and `VAULT_TOKEN` to be set on the server (see [Installation](../installation/)).

#### HashiCorp Vault: inline lookup with `vault:` prefix

A secret can also be read from Vault without a credential row, with the `vault:` prefix:

```javascript
// KV v2 path (the /data/ segment is auto-inserted if you omit it)
fn.fnCredentials('vault:secret/data/ontap')

// Short form using VAULT_DEFAULT_MOUNT (defaults to "secret")
fn.fnCredentials('vault:ontap')
```

The same syntax works wherever a credential name is accepted, including `fnRestBasic`, `fnRestJwtSecure` and the
`base64()` / `username()` / `password()` header substitutions of `fnRestAdvanced`:

```javascript
fn.fnRestBasic('get','https://api.example.com','','vault:secret/data/myapi')
```

#### Vault key aliases

When a Vault secret is mapped to the AnsibleForms credential shape, the following key aliases are recognised:

| Credential field | Accepted Vault keys |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |

So a Vault secret stored as `{ "username": "admin", "password": "Netapp12" }` works out of the box, and so does
`{ "api_key": "abc..." }` for token-style authentication.

#### Reshape unconventional secrets with `credJqe`

A Vault secret with another shape is reshaped with a `jq` expression as the third argument, before the mapping:

```javascript
// Vault secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/data/weird','','.creds | { user: .u, password: .p }')
```
