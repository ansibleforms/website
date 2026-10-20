---
layout: default
title: Cuentas locales
parent: Autenticación
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Cuentas locales
{: .no_toc }

El admin integrado, y los usuarios y grupos guardados en la base de datos de AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El admin integrado

Cada arranque crea el grupo local `admins` y el usuario admin si no existen; tres variables controlan el admin:

| Variable | Predeterminado | Significado |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Nombre de usuario del admin, creado en el grupo `admins` cuando ningún usuario tiene ese nombre. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Contraseña que recibe el admin cuando se crea (o se restablece). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` restablece la contraseña del admin a `ADMIN_PASSWORD` y lo vuelve a poner en `admins`. |

`ADMIN_PASSWORD` solo se usa cuando el usuario se crea o se restablece: cambiarla después no hace nada por sí solo.

Un usuario local que inicia sesión con la contraseña predeterminada pública `AnsibleForms!123` solo puede cambiarla. El navegador abre una
página de cambio de contraseña que no se puede cerrar, y el servidor responde a cualquier otra petición con `403` (código
`password_change_required`) hasta que se cambia la contraseña. La nueva contraseña debe ser distinta de la predeterminada; tras el
cambio, el usuario vuelve a iniciar sesión con ella. Define `ADMIN_PASSWORD` con tu propio valor antes del primer arranque para saltarte este paso.

Cambiar `ADMIN_USERNAME` después del primer arranque crea un segundo usuario admin con ese nombre; el antiguo se mantiene.

{: .warning }
> `REINIT_ADMIN=1` restablece la contraseña en **cada** arranque mientras esté definida. Úsala para recuperar una contraseña de admin perdida,
> y después quítala y reinicia.

---

## Usuarios y grupos

Los usuarios y grupos locales se gestionan en **Acceso > Usuarios** y **Acceso > Grupos**. Un usuario tiene estos campos:

| Campo | Significado |
|---|---|
| Nombre de usuario | El nombre de inicio de sesión. Debe ser único. |
| Descripción | Opcional. |
| Contraseña | Se guarda como hash. Cámbiala después con la acción **Cambiar contraseña**. |
| Correo electrónico | Opcional. |
| Grupo | El primer grupo local del usuario. Añade más en la pestaña **Grupos** de la página del usuario. |

Los usuarios locales cambian su propia contraseña en su perfil; los demás usuarios lo hacen en su directorio o proveedor de identidad.

Un usuario puede pertenecer a varios grupos y recibe los roles de todos ellos. La pestaña **Grupos** de la página de un usuario añade y
quita grupos, igual que la pestaña **Usuarios** de la página de un grupo. Un usuario conserva al menos un grupo: el último no se puede
quitar.

Un grupo que todavía tiene usuarios no se puede eliminar: quita antes sus usuarios. El grupo `admins` nunca se puede eliminar ni
renombrar, y el usuario `admin` nunca se puede eliminar.

---

## Permitir el inicio de sesión

La pestaña **Detalles** de la página de un usuario tiene un interruptor **Permitir inicio de sesión**, que también se ofrece como **Bloquear inicio de sesión** y **Permitir
inicio de sesión** en el menú de fila de la lista de usuarios. Existe tanto para usuarios locales como para usuarios LDAP y SSO:

- **Activado**: el usuario inicia sesión con normalidad.
- **Desactivado**: las sesiones del usuario terminan al instante y se rechaza todo inicio de sesión, hasta que un admin lo vuelva a activar. La página
  pide confirmación antes.

El interruptor no se puede desactivar para el usuario `admin`, la vía de vuelta, ni puede desactivarlo un admin para su propia cuenta. La página de
un usuario LDAP o SSO tiene además **Cerrar sesiones**, que cierra la sesión del usuario en todas partes sin bloquearlo.

---

## Asignación a roles

Los roles nombran los grupos locales como `local/<group>` y los usuarios como `local/<user>`; por defecto `admins` recibe `admin`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Mantén `local/admins` en el rol `admin`, para que el admin integrado siempre pueda iniciar sesión, incluso cuando el directorio o el
proveedor de identidad no estén disponibles. Cuando config.yaml no se puede cargar en absoluto, los miembros de `local/admins` siguen recibiendo el
rol `admin`, así que puedes iniciar sesión y corregirlo. Consulta [Roles](../config/roles.html) para las opciones de los roles.

---

## Cuentas locales y LDAP

Un inicio de sesión con usuario y contraseña comprueba los usuarios locales antes que LDAP. Cuando un usuario local tiene el mismo nombre que un usuario
del directorio, la cuenta local siempre gana y la contraseña del directorio no funciona para ese nombre. Da a las cuentas locales nombres
que no puedan coincidir con cuentas del directorio, por ejemplo con un prefijo `svc-`.
