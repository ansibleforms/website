---
layout: default
title: Variables de seguridad
parent: Variables de entorno
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Variables de seguridad
{: .no_toc }

Tokens, cifrado, hosts REST salientes, enmascaramiento y los antiguos ajustes VAULT_*
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables para definir tus propios secretos de token y de cifrado, y para limitar lo que los formularios pueden llamar y mostrar.

---

## Ejemplo

Tus propios secretos, llamadas REST limitadas a una API y a una red interna, y una clave enmascarada más. En el `.env` del proyecto compose:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Define `ENCRYPTION_SECRET` antes de guardar la primera credencial. Desde la 7.3.0, definirla o cambiarla vuelve a cifrar todos los secretos
guardados en el siguiente arranque, con `ENCRYPTION_SECRET_PREVIOUS` indicando la clave antigua cuando era tuya, consulta
[Cambiar el secreto de cifrado](../security/secrets.html#changing-the-encryption-secret).

---

## Llamadas REST y jq

Desde la 7.3.0 las funciones auxiliares REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) comprueban el
certificado del endpoint al que llaman, como cualquier otra conexión; hasta la 7.2.0 no lo hacían nunca. Se les aplican tres ajustes:

| Variable | Predeterminado | Efecto |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` omite la comprobación del certificado: solo para endpoints con un certificado autofirmado |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Cuánto espera una llamada REST una respuesta antes de fallar por tiempo de espera |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Cuánto puede ejecutarse un filtro jq antes de detenerse; la salida de jq también está limitada a 64 MB |

Las tres se aplican al guardarlas, sin reiniciar. Para un endpoint cuyo certificado está firmado por una CA privada, mantén la comprobación activada
y dale esa CA a Node.js: define `NODE_EXTRA_CA_CERTS` con un archivo PEM que la contenga en el entorno de la aplicación y reinicia la aplicación.

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="security" %}
