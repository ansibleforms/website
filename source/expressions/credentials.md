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

// output : a credential object with all properties (user, password, host, port)
```

The exact name is tried first. When no credential has that name, the name is used as a regular expression, and then the fallback is tried.

#### Credentials from a secret store

A credential that names a [secret store](../secret-stores) gets its `user` and `password`
from that store at runtime. `fn.fnCredentials('myapp')` keeps working unchanged.

A secret can also be read without a credential row, wherever a credential name is accepted
(including `fnRestBasic`, `fnRestJwtSecure` and the header substitutions of `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

The keys of the secret are mapped as described under [Key names](../secret-stores#key-names).
A secret with another shape is reshaped with a `jq` expression as the third argument:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
