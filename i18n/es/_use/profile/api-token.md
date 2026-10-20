---
layout: default
title: Token de API
parent: Tu perfil
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# Token de API
{: .no_toc }

Crea un token para scripts y agentes de IA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quién puede crear uno

Un token de larga duración permite que los scripts llamen a la API sin tu contraseña. Desde 7.3.0 necesita la opción de rol `allowApiTokens`:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Hasta 7.2.0 la opción era solo `extendedTokenExpiration`. Un rol anterior a 7.3.0 que solo define esa opción recibe
`allowApiTokens`, así que conserva sus tokens; con ambas, también se puede crear un token que no caduca nunca. Consulta [Opciones de rol](../config/roles.html#role-options).

---

## Crear un token

**Nuevo token**, en la línea del título de **Perfil > Tokens de API**, abre un asistente de tres pasos:

1. **Detalles**: un nombre, para reconocer el token en la lista, y cuánto tiempo sigue siendo válido. Las opciones son 30, 90, 180
   o 365 días hasta [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 por defecto), ese
   mismo máximo, y **No caduca nunca** con `extendedTokenExpiration`. Elige el periodo más corto que necesite tu script.
2. **Confirmar**: una cuenta local o LDAP introduce su contraseña, que no se guarda en el token. Una cuenta de Microsoft Entra ID u
   OIDC no tiene contraseña aquí: su token se crea a partir de su sesión, que debe haber iniciado sesión como mucho 10 minutos
   antes, así que puede que el proveedor te pida volver a iniciar sesión primero.
3. **Copiar**: el token, que se muestra **una sola vez**. Cópialo con **Copiar** y guárdalo con el mismo cuidado que una contraseña.

Envía el token en la cabecera `Authorization` de cada llamada a la API:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Un token de API no puede crear otro. El token de una cuenta SSO lleva los roles de su último inicio de sesión: un cambio de grupo en el
proveedor de identidad solo le llega cuando vuelves a iniciar sesión y creas un token nuevo.

---

## Tus tokens

Los tokens que has creado aparecen con su nombre y cuándo se creó, caduca y se usó por última vez cada uno; **Revocar** en el menú de una fila termina uno.
Un administrador también los ve y los revoca en tu página, en **Configuración > Usuarios**. Un token termina al caducar, o antes:

- **una revocación**, desde la lista;
- **un cierre de sesión con el token** (`POST /api/v2/auth/logout` con el token en la cabecera `Authorization`), que lo termina junto con
  la sesión en la que se creó;
- **un cambio de contraseña**, que termina todos los tokens y sesiones de tu cuenta creados antes, y un bloqueo de tu cuenta.

Un token que no caduca nunca también termina en estos casos. Un script también puede pedir un token por sí mismo a través de la API de inicio de sesión y
su parámetro `expiryDays` (`POST /api/v2/auth/login?expiryDays=90`, o `expiryDays=never`); un `expiryDays` más largo se recorta
a `API_TOKEN_MAX_DAYS`.
