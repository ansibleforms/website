---
layout: default
title: Usuarios y grupos
nav_order: 15
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 8ed4dc089c64e091636c29884af1cd1002eb40aa
---

# Usuarios y grupos
{: .no_toc }

Los usuarios y grupos locales, junto a los de LDAP y de inicio de sesión único, y cómo bloquear un inicio de sesión
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: gestiona quién puede iniciar sesión en **Configuración > Acceso > Usuarios** y **Grupos**, con la opción de rol `showSettings`.

El admin integrado, el orden de inicio de sesión y la asignación de roles de las cuentas locales están en [Cuentas locales](authentication/local.html).

---

## En esta sección

| Página | Qué cubre |
|---|---|
| [Un usuario local](users-and-groups/local-user.html) | Añadir un usuario local, y las pestañas de su página |
| [Varios grupos](users-and-groups/several-groups.html) | Un usuario local en varios grupos, y sus roles |
| [Un grupo local](users-and-groups/local-group.html) | La página de un grupo local y sus pestañas |
| [Usuarios y grupos del directorio](users-and-groups/directory.html) | Usuarios y grupos de LDAP, Entra ID y OIDC, tal como se vieron por última vez |
| [Bloquear un inicio de sesión](users-and-groups/blocking-a-sign-in.html) | Permitir inicio de sesión: bloquea a un usuario sin eliminar nada |


---

## Las listas

Las listas **Usuarios** y **Grupos** muestran los usuarios y grupos locales y, junto a ellos, los de LDAP y de inicio de sesión único.

Un usuario o grupo de LDAP, Entra ID u OIDC aparece en la lista cuando ha iniciado sesión (o se ha visto en un inicio de sesión), o cuando un rol lo nombra.
La columna **Origen** indica de dónde viene cada uno: Local, LDAP, Microsoft Entra ID u OIDC. Desde la 7.3.0 la lista **Usuarios** también
tiene una columna **Último inicio de sesión**, que indica cuándo inició sesión cada usuario por última vez.

Una fila abre la página de su usuario o grupo. **Agregar usuario** y **Agregar grupo** crean uno local.

---

## Cuentas que otorgan admin

El rol admin de config.yaml nombra grupos y usuarios locales, así que solo un admin puede cambiar las cuentas y los grupos que nombra.

Un usuario con `showSettings` pero sin el rol admin no puede cambiar, bloquear, cambiar de grupo, poner la contraseña ni eliminar una
cuenta local que el rol admin nombra (directamente o a través de uno de sus grupos). Tampoco puede crear, renombrar ni eliminar un grupo
que el rol admin nombra, ni meter a un usuario en uno. Lo mismo vale para un usuario LDAP o SSO que se asigna al rol admin: bloquearlo,
cerrar sus sesiones, olvidarlo y revocar sus tokens de API son cosa de un admin. El servidor responde a una petición así con `403`.

