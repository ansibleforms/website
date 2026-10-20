---
layout: default
title: Credenciales
parent: Expresiones
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Credenciales
{: .no_toc }

Lee una credencial almacenada en una expresión
{: .fs-6 .fw-300 }

---

Lee una credencial almacenada por nombre o por expresión regular, con una alternativa:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Primero se prueba el nombre exacto. Si ninguna credencial tiene ese nombre, el nombre se usa como expresión regular y después se prueba la alternativa.

#### Limitado por rol

Cuando uno de los roles del usuario incluye `credentials` en `config.yaml`, `fn.fnCredentials` solo devuelve una credencial que ese rol
permita: los patrones del rol se comparan con el nombre de la credencial encontrada (por nombre, expresión regular o alternativa),
y cualquier otra se rechaza. Los roles sin la lista no la limitan, y un administrador nunca está limitado.

#### Credenciales de un almacén de secretos

Una credencial que indica un [almacén de secretos](../secret-stores) obtiene su `user` y su `password`
de ese almacén en tiempo de ejecución. `fn.fnCredentials('myapp')` sigue funcionando sin cambios.

Un secreto también se puede leer sin una fila de credencial, allí donde se acepte un nombre de credencial
(incluidos `fnRestBasic`, `fnRestJwtSecure` y las sustituciones de cabeceras de `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

Las claves del secreto se asignan como se describe en [Nombres de clave](../secret-stores#key-names).
Un secreto con otra forma se transforma con una expresión `jq` como tercer argumento:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
