---
layout: default
title: Autenticación
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Autenticación
{: .no_toc }

Elige cómo inician sesión los usuarios y cómo su cuenta y sus grupos llevan a los roles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Métodos de inicio de sesión

AnsibleForms admite cuatro métodos de inicio de sesión, y varios pueden estar activos a la vez:

| Método | Cuándo usarlo | Página |
|---|---|---|
| Cuentas locales | El admin integrado, cuentas de servicio, equipos pequeños o como respaldo cuando el directorio no está disponible. | [Cuentas locales](local.html) |
| LDAP | Los usuarios y grupos están en Active Directory, OpenLDAP u otro directorio LDAP. | [LDAP](ldap.html) |
| Entra ID | Los usuarios inician sesión con su cuenta de Microsoft 365 / Entra ID (inicio de sesión único). | [Entra ID](entra-id.html) |
| OIDC | Inicio de sesión único a través de otro proveedor OpenID Connect, como Keycloak. | [OIDC](oidc.html) |

Las cuentas locales y LDAP se configuran en **Acceso > Usuarios**, **Grupos** y **LDAP**; Entra ID y OIDC en
**Acceso > SSO**.

---

## Cómo elige el método un inicio de sesión

La página de inicio de sesión tiene un formulario de nombre de usuario y contraseña, más un botón por cada proveedor de inicio de sesión único habilitado:

- **El nombre de usuario y la contraseña** se comprueban primero contra los usuarios locales. Solo cuando ningún usuario local tiene ese nombre, y LDAP
  está habilitado, se prueba el directorio. Un usuario local con una contraseña incorrecta se rechaza sin consultar a LDAP.
- **Los botones de Entra ID y OpenID** aparecen debajo de **Entrar** cuando hay un proveedor así habilitado. Envían el navegador al
  proveedor y de vuelta; ninguna contraseña llega a AnsibleForms.

Solo puede haber habilitado a la vez un proveedor Entra ID y un proveedor OIDC: habilitar uno desactiva los demás de su tipo.
Un inicio de sesión fallido con usuario y contraseña muestra siempre el mismo mensaje genérico; el motivo está en el registro del servidor y en el registro de auditoría.

---

## Activar y desactivar el inicio de sesión único

Desde la 7.3.0 cada proveedor de **Acceso > SSO** tiene dos interruptores propios, que se aplican sin reiniciar:

| Interruptor | Efecto |
|---|---|
| **Activado** | Muestra el botón del proveedor en la página de inicio de sesión y acepta su inicio de sesión. Activarlo desactiva los demás proveedores de su tipo. |
| **Saltar la página de inicio de sesión** | Los usuarios van directamente a este proveedor, sin la página de inicio de sesión, mientras el proveedor esté habilitado. Activarlo en un proveedor lo desactiva en los demás; aparece en gris en un proveedor desactivado. |

El formulario de usuario y contraseña sigue accesible en `/login?local`, para el admin local o cuando el proveedor falla,
y se muestra después de cerrar sesión y cuando un inicio de sesión único vuelve con un error.

Las variables `ENABLE_SSO` y `SSO_AUTO_LOGIN` se eliminan en la 7.3.0. El primer arranque de la 7.3.0 las lee una vez, y
registra un aviso en cada arranque mientras sigan definidas, así que quítalas del entorno después de la actualización:

| Variable antes de la 7.3.0 | Qué hace la actualización |
|---|---|
| `ENABLE_SSO=0` | Desactiva todos los proveedores: siguen configurados, sin botón en la página de inicio de sesión |
| `SSO_AUTO_LOGIN=1` | Activa **Saltar la página de inicio de sesión** en el proveedor habilitado, cuando hay exactamente uno habilitado y `ENABLE_SSO` no es `0` |

---

## Del usuario a los roles

Cada inicio de sesión produce un usuario con un **tipo** (`local`, `ldap`, `azuread` u `oidc`), un nombre de usuario y una lista de grupos.
Cada grupo recibe el prefijo de su tipo, así que un grupo de Entra ID se guarda y se muestra como `azuread/...`:

| Método de inicio de sesión | Nombre de usuario | Grupos |
|---|---|---|
| Local | el nombre de usuario local | `local/<group>`, uno por cada grupo local del usuario |
| LDAP, directorio `main` | el valor del Username Attribute | `ldap/<cn>`, el CN de cada grupo que devuelve el directorio |
| LDAP, otro directorio | `<directory>/<username>` | `ldap/<directory>/<cn>`, consulta [Varios directorios](ldap.html#several-directories) |
| Entra ID | el claim `upn`, o `preferred_username` cuando el token no tiene `upn` | `azuread/<object id>` y `azuread/<display name>` de cada grupo, leídos de Microsoft Graph |
| OIDC | el claim `preferred_username` | `oidc/<name>`, del claim `groups` del ID token |

Los [roles](../config/roles.html) de config.yaml comparan después estos valores: un rol se aplica cuando uno de sus `groups` es uno
de los grupos del usuario, o cuando su `users` contiene `<type>/<username>`. Todo usuario recibe además el rol `default`. Desde la 7.3.0 un
rol nombra a un miembro de Entra ID como `entraid/<group>` o `entraid/<upn>`, que coincide con el valor `azuread/` guardado; `azuread/`
en un rol sigue funcionando y se elimina en la 8.0. El perfil y las extravars del trabajo siguen mostrando `azuread/`.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

La página del **perfil** de un usuario lista el tipo de inicio de sesión, los grupos y los roles, que es la forma más rápida de comprobar una asignación.
La opción de rol `allowLogin` puede rechazar el inicio de sesión de los usuarios que no coinciden con ningún rol: ponla a `false` en `default` y a
`true` en los roles que pueden iniciar sesión.
