---
layout: default
title: Credencials
parent: Expressions
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Credencials
{: .no_toc }

Llegeix una credencial desada en una expressió
{: .fs-6 .fw-300 }

---

Llegeix una credencial desada pel nom o per una expressió regular, amb una alternativa:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Primer es prova el nom exacte. Si cap credencial no té aquest nom, el nom s'utilitza com a expressió regular i després es prova l'alternativa.

#### Limitat per rol

Quan un dels rols de l'usuari inclou `credentials` a `config.yaml`, `fn.fnCredentials` només retorna una credencial que aquest rol
permeti: els patrons del rol es comparen amb el nom de la credencial trobada (pel nom, per expressió regular o per l'alternativa),
i qualsevol altra es rebutja. Els rols sense la llista no la limiten, i un administrador no està mai limitat.

#### Credencials d'un magatzem de secrets

Una credencial que indica un [magatzem de secrets](../secret-stores) obté el seu `user` i el seu `password`
d'aquest magatzem en temps d'execució. `fn.fnCredentials('myapp')` continua funcionant sense canvis.

Un secret també es pot llegir sense cap fila de credencial, allà on s'accepti un nom de credencial
(inclosos `fnRestBasic`, `fnRestJwtSecure` i les substitucions de capçaleres de `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

Les claus del secret s'assignen tal com es descriu a [Noms de clau](../secret-stores#key-names).
Un secret amb una altra forma es transforma amb una expressió `jq` com a tercer argument:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
