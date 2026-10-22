---
layout: default
title: Identifiants
parent: Expressions
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Identifiants
{: .no_toc }

Lire un identifiant enregistré dans une expression
{: .fs-6 .fw-300 }

---

Lisez un identifiant enregistré par son nom ou par expression régulière, avec une solution de repli :

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Le nom exact est essayé en premier. Si aucun identifiant ne porte ce nom, le nom est utilisé comme expression régulière, puis la solution de repli est essayée.

#### Limité par rôle

Lorsque l'un des rôles de l'utilisateur liste `credentials` dans `config.yaml`, `fn.fnCredentials` ne renvoie qu'un identifiant autorisé
par un tel rôle : les motifs du rôle sont comparés au nom de l'identifiant trouvé (par nom, expression régulière ou repli),
et tout autre est refusé. Les rôles sans cette liste ne le limitent pas, et un administrateur n'est jamais limité.

#### Identifiants depuis un coffre de secrets

Un identifiant qui désigne un [coffre de secrets](../secret-stores) obtient son `user` et son `password`
de ce coffre à l'exécution. `fn.fnCredentials('myapp')` continue de fonctionner sans changement.

Un secret peut aussi être lu sans ligne d'identifiant, partout où un nom d'identifiant est accepté
(y compris `fnRestBasic`, `fnRestJwtSecure` et les substitutions d'en-têtes de `fnRestAdvanced`) :

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

Les clés du secret sont associées comme décrit dans [Noms des clés](../secret-stores#key-names).
Un secret d'une autre forme est remodelé avec une expression `jq` passée en troisième argument :

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
