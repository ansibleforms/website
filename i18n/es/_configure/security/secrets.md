---
layout: default
title: Secretos y cifrado
parent: Seguridad
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Secretos y cifrado
{: .no_toc }

Los dos secretos maestros, qué protegen y cuánto duran las sesiones y los tokens
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Los dos secretos maestros

Dos secretos protegen todo lo demás. Define ambos antes de que la instancia guarde datos reales, guárdalos fuera de la instancia
y no los cambies a la ligera:

| Secreto | Qué protege | Si no está definido | Si se pierde o se cambia |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Todas las contraseñas y tokens guardados en la base de datos: credenciales, la contraseña de bind de LDAP, tokens de runner, secretos de cliente SSO, direcciones de webhook de Slack y Teams, la clave de API del chat | Se usa una clave predeterminada, que es pública en el código fuente | Perdido: hay que volver a introducir todos los secretos guardados. Cambiado: desde la 7.3.0 todos los secretos guardados se vuelven a cifrar, consulta [más abajo](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | La firma de los tokens de acceso y de refresco, incluidos los [tokens de API](../profile/api-token.html) de larga duración | Se genera un secreto aleatorio en cada arranque, así que cada reinicio cierra la sesión de todos | Todas las sesiones y todos los tokens de API dejan de ser válidos |

Ambos se registran como aviso `[SECURITY]` al arrancar mientras falten. Las páginas de ajustes no permiten editarlos,
la API nunca los devuelve y las copias de seguridad los excluyen a propósito, así que un `ENCRYPTION_SECRET` perdido no se puede recuperar
de ningún sitio: guarda una copia en tu gestor de secretos. El secreto de cifrado se usa como clave de 32 caracteres; un valor más corto o
más largo se rellena o se recorta.

Cambiar `ACCESS_TOKEN_SECRET` termina todas las sesiones y todos los tokens de API a la vez. Para terminar los tokens de un usuario o de una
sesión, usa las revocaciones descritas en [Tokens](#tokens).

---

## Cambiar el secreto de cifrado

Desde la 7.3.0, definir o cambiar `ENCRYPTION_SECRET` ya no hace perder los secretos guardados. En el siguiente arranque el worker vuelve a cifrar
cada uno de ellos con la clave nueva, en una única transacción de base de datos, antes de que nada más escriba un secreto:

| Situación | Qué definir |
|---|---|
| La instancia funcionaba sin `ENCRYPTION_SECRET`, con la clave predeterminada pública | Solo `ENCRYPTION_SECRET`: los secretos se vuelven a cifrar desde la clave predeterminada |
| La instancia funcionaba con una clave propia | `ENCRYPTION_SECRET` con la clave nueva y [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) con la antigua, para ese arranque |

Cuando los secretos guardados se cifraron con una clave que no es ninguna de las dos, no se cambia nada y la aplicación se niega a arrancar hasta que
`ENCRYPTION_SECRET_PREVIOUS` indique esa clave. Quita `ENCRYPTION_SECRET_PREVIOUS` cuando el arranque los haya vuelto a cifrar, y define el
nuevo `ENCRYPTION_SECRET` en cada nodo de la aplicación, en el worker y en cada RTE en modo base de datos que se registre por sí mismo. Ese
autorregistro (`RTE_REGISTER`) está obsoleto desde la 7.3.0: un RTE que se une con un token de unión (`RTE_JOIN_TOKEN`) en modo socket
no necesita `ENCRYPTION_SECRET`, consulta [Modos de RTE](../rte/modes.html).

---

## Tokens

Un inicio de sesión devuelve un token de acceso de corta duración y un token de refresco más largo, que el navegador usa para obtener un par nuevo:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : `30m` por defecto. Un valor más corto
  limita el uso de un token interceptado.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : `24h` por
  defecto. Es el tiempo que un navegador inactivo sigue con la sesión iniciada.
* La opción de rol `allowApiTokens` permite a un usuario pedir un token de API válido durante un número de días, y
  `extendedTokenExpiration` añade uno que nunca caduca. Concédelas solo a los roles que necesiten acceso a la API desde scripts.
  En la [página del perfil](../profile/api-token.html) un token se crea desde una sesión del navegador iniciada hace como mucho 10 minutos,
  y nunca desde otro token de API. Un token que nunca caduca dura 50 años, y los eventos de abajo también lo terminan.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : `90` por defecto. Lo máximo que dura un token
  de API: una petición más larga se recorta a ese valor.

Un token es un JWT firmado, pero el servidor también mantiene una lista de tokens revocados, compartida por todos los nodos de la aplicación, así que un token
puede terminar antes de caducar:

| Evento | Qué termina |
|-------|-----------|
| Cerrar sesión | Todos los tokens de ese inicio de sesión: el token de acceso, su token de refresco y un token de API cuando el cierre de sesión lo usa |
| Un cambio de contraseña, por el usuario o por un admin | Todos los tokens del usuario emitidos antes del cambio, incluidos los tokens de API, en todos los dispositivos |
| El interruptor **Permitir inicio de sesión** de un usuario desactivado (usuario local, LDAP o SSO), o un usuario local eliminado | Todos los tokens del usuario |
| **Cerrar sesiones** en la página de un usuario LDAP o SSO | Todos los tokens del usuario; puede volver a iniciar sesión salvo que esté bloqueado |
| **Revocar** en un token de API, en la página del perfil o en la pestaña **Tokens de API** del usuario | Ese token de API, al instante |

Un script termina su propio token de API cerrando sesión con él: `POST /api/v2/auth/logout` con el token en la
cabecera `Authorization`.
