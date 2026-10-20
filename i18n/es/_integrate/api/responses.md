---
layout: default
title: Respuestas y errores
parent: API REST
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Respuestas y errores
{: .no_toc }

La forma de una respuesta y los códigos de estado
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Las respuestas son JSON simple, y el código de estado HTTP indica si una llamada ha tenido éxito.

---

## Respuestas

Una llamada correcta devuelve el propio objeto, o una lista con su tamaño:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Un error devuelve un mensaje, y detalles cuando los hay:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Códigos de estado

El código de estado indica qué ha ido mal:

| Código | Significado |
|---|---|
| `200` | La llamada ha tenido éxito |
| `400` | La petición está mal formada, por ejemplo una renovación de token sin token de renovación, o una subida sin archivo |
| `401` | El token falta, es incorrecto o ha caducado: inicia sesión o renuévalo |
| `403` | Los roles del usuario no permiten la llamada (incluido aprobar tu propio trabajo, salvo que su aprobación tenga `allowSelf: true` o seas administrador), o la cuenta tiene que hacer algo primero (ver más abajo) |
| `404` | El objeto no existe |
| `409` | La petición está incompleta (un lanzamiento sin datos), o el objeto no está en un estado que permita la acción |
| `422` | La [validación del lanzamiento](../launch-validation/) rechazó los valores del formulario; `details` indica por qué |
| `429` | Demasiadas peticiones a los endpoints de inicio de sesión y de tokens, o demasiados inicios de sesión fallidos (consulta [Autenticación](authentication.html)) |
| `500` | El servidor ha fallado; el log del servidor tiene el motivo |

Para un trabajo, un `409` significa que está en un estado que no admite la acción: abortar un trabajo que no se está ejecutando (o cuyo aborto ya se pidió),
relanzar un trabajo que todavía se está ejecutando, o aprobar o rechazar un trabajo que ya no espera una aprobación.

---

## Un 403 con un código

Algunas respuestas `403` llevan un `code`, para algo que el usuario tiene que hacer en el navegador antes de que funcione cualquier otra llamada:

```json
{ "error": "...", "code": "password_change_required" }
```

| Código | Qué hacer |
|---|---|
| `password_change_required` | El usuario inició sesión con la contraseña predeterminada pública: cámbiala primero en el perfil |
| `disclaimer_required` | El aviso legal está activado y el usuario todavía no ha aceptado su versión actual: acéptalo en el navegador |

Un token de API de larga duración (consulta [Autenticación](authentication.html#long-lived-tokens)) nunca queda retenido por el aviso legal.
