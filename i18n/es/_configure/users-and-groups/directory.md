---
layout: default
title: Usuarios y grupos del directorio
parent: Usuarios y grupos
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Usuarios y grupos del directorio
{: .no_toc }

Usuarios y grupos de LDAP, Entra ID y OIDC, tal como se vieron por última vez
{: .fs-6 .fw-300 }

Un usuario de LDAP, Entra ID u OIDC tiene su página en `/settings/users/<source>/<name>`, con `ldap`, `azuread` u `oidc`
como origen, por ejemplo `/settings/users/ldap/jdoe`. Muestra lo que se registró en el último inicio de sesión del usuario, en solo lectura,
ya que el directorio o el proveedor de identidad es quien decide quién es el usuario y cuáles son sus grupos.

Sus pestañas son las de un usuario local. **Detalles** tiene el interruptor **Permitir inicio de sesión**, el nombre de usuario, el origen, el nombre,
el correo, cuándo se vio al usuario por primera vez y su último inicio de sesión. **Grupos** lista los grupos del último inicio de sesión.
**Tokens de API** lista los tokens de API del usuario, y **Revocar** termina uno al instante.

Arriba a la derecha, **Cerrar sesiones** cierra la sesión del usuario en todas partes ahora mismo. **Olvidar** elimina el registro, que vuelve
en su siguiente inicio de sesión; sus trabajos, trabajos guardados y programaciones se conservan. Un usuario bloqueado no se puede olvidar, porque
eso le dejaría entrar de nuevo: el servidor responde `409`, así que permite antes su inicio de sesión.

Los grupos de este registro son también los grupos con los que trabaja la sesión del usuario, leídos en directo. Olvidar a un usuario que tiene la sesión
iniciada lo deja sin grupos, y sin los roles que dan esos grupos, hasta que vuelva a iniciar sesión.

Un grupo del directorio tiene su página en `/settings/groups/<source>/<name>`, en solo lectura, con las pestañas **Detalles**,
**Usuarios** (los usuarios vistos en él en su último inicio de sesión), **Roles** y **Formularios**.
