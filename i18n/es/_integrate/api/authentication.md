---
layout: default
title: Autenticación
parent: API REST
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Autenticación
{: .no_toc }

Inicia sesión, renueva el token o usa un token de larga duración
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cada llamada necesita un token de acceso en la cabecera `Authorization`. El token se obtiene al iniciar sesión, y se mantiene vigente con
el token de renovación.

---

## Iniciar sesión

Inicia sesión con autenticación básica, con el nombre y la contraseña del usuario:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

La respuesta contiene dos tokens, el token de acceso y el token de renovación:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Llamar a la API

Envía el token de acceso como bearer token en cada llamada:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Renovar el token

El token de acceso caduca (`ACCESS_TOKEN_EXPIRATION`, 30 minutos de forma predeterminada). Obtén uno nuevo con el token de renovación,
sin la contraseña:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

La respuesta contiene un nuevo par, con la misma forma que el inicio de sesión. Un token de renovación sirve una sola vez: guarda el nuevo para la siguiente renovación.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Tokens de larga duración

Un script que se ejecuta de forma desatendida puede usar un token que dure más. Desde la 7.3.0 necesita la opción de rol `allowApiTokens`:

* Crea uno en [Perfil > Tokens de API](../profile/api-token.html).
* O inicia sesión con el parámetro de consulta `expiryDays`, para un token válido durante ese número de días:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` se lee solo de la URL, nunca del cuerpo. Para un usuario cuyos roles no tienen `allowApiTokens`, se ignora,
y el inicio de sesión devuelve un token con la duración habitual. `expiryDays=never` necesita además `extendedTokenExpiration`. Añade el parámetro de consulta `name`
(`?expiryDays=90&name=nightly-backup`) para dar nombre al token en la lista de tokens del usuario.

Un token de larga duración dura como máximo [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) días, 90 de forma
predeterminada: un `expiryDays` mayor se recorta a ese valor, salvo que sea `never`. Renovarlo devuelve un token normal, así que vuelve a iniciar sesión cuando caduque.

### Tokens del usuario que ha iniciado sesión

La vista **Tokens de API** del perfil usa estos endpoints, que funcionan para cualquier cuenta, SSO incluido, ya que no necesitan contraseña:

| Llamada | Qué hace |
|---|---|
| `GET /api/v2/profile/tokens` | Lista tus tokens de API, con su `sid`, `name`, creación, caducidad y último uso |
| `POST /api/v2/profile/tokens` | Crea un token a partir de tu sesión; el cuerpo contiene `expiryDays` (un número, o `never`) y un `name` opcional |
| `DELETE /api/v2/profile/tokens/{sid}` | Revoca uno de tus tokens |

`POST` responde `403` cuando se llama con un token de API (un token no puede crear otro), sin `allowApiTokens`, o cuando la
sesión se inició hace más de 10 minutos (código `sign_in_again`): vuelve a iniciar sesión primero. Una duración por encima del máximo responde `400`.

---

## Cuando un token termina antes de tiempo

Un token, de larga duración o no, deja de funcionar antes de caducar cuando ocurre una de estas cosas:

* **Un cierre de su sesión**: `POST /api/v2/auth/logout` con el token termina los tokens de ese inicio de sesión, y solo esos. Un
  cierre de sesión en el navegador no termina el token de un script.
* **Un cambio de contraseña**: el usuario cambia su contraseña, o un administrador la define. Se rechaza cualquier token emitido antes.
* **El usuario se elimina o se bloquea**: eliminar un usuario local, o bloquear un usuario, termina todos sus tokens. Un administrador también puede
  terminar las sesiones de un usuario de LDAP o SSO.

Un token rechazado responde `401`. Vuelve a iniciar sesión, con la nueva contraseña si ha cambiado.

---

## Scripts que inician sesión en cada ejecución

Los endpoints de inicio de sesión y de tokens están protegidos contra avalanchas de peticiones y contra la adivinación de contraseñas, así que un script que inicia sesión cada vez que se ejecuta
debería conocer estos límites:

| Límite | Predeterminado | Qué ocurre |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 peticiones por minuto desde una dirección | El inicio de sesión, el cierre de sesión, la renovación, los endpoints de SSO, `PUT /api/v2/profile` (cambio de contraseña) y `POST` o `DELETE /api/v2/profile/tokens` responden `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 inicios de sesión fallidos seguidos | La cuenta se bloquea durante [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), y todo inicio de sesión responde `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 inicios de sesión fallidos desde una dirección | Todo inicio de sesión desde esa dirección responde `429` hasta que termina la ventana |

Un `429` lleva una cabecera `Retry-After` con los segundos que hay que esperar: para y espera, no lo reintentes enseguida. Una cuenta bloqueada
rechaza incluso la contraseña correcta hasta que termina el bloqueo, así que un script con una contraseña incorrecta bloquea a su usuario para todos.
Una contraseña actual incorrecta en un cambio de contraseña (`PUT /api/v2/profile`) cuenta también como inicio de sesión fallido, y una cuenta bloqueada
no puede cambiar su contraseña. Un inicio de sesión correcto pone a cero el contador de la cuenta, y también que un administrador defina la contraseña.

Para no toparte con estos límites, inicia sesión una vez y reutiliza el token, o usa un token de larga duración, en lugar de iniciar sesión en
cada llamada. Detrás de un proxy inverso, define [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) para que el servidor vea
la dirección del cliente, o todos los clientes contarán como uno solo.
