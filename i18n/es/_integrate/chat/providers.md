---
layout: default
title: Proveedores
parent: Asistente de chat
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Proveedores
{: .no_toc }

El modelo de lenguaje detrás del asistente, y los proxies
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Selecciona el proveedor en la página de ajustes. Esto rellena la URL base, la autenticación y
la versión de API, que siguen siendo editables. Los campos vacíos usan los valores predeterminados del proveedor.

| Proveedor | Protocolo | URL base (predeterminada) | Clave enviada como |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | obligatoria: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, versión de API `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | ninguna |
| **Otro compatible con OpenAI** (LiteLLM, un gateway, vLLM, LM Studio, ...) | OpenAI | obligatoria, normalmente terminada en `/v1` | Bearer |

El ID del modelo es el que usa el proveedor o el proxy (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). El asistente requiere un modelo que admita **tool calling** (llamadas a herramientas); el soporte varía entre
los modelos locales pequeños.

Para servidores locales y proxies que no necesitan clave, basta con una URL base; no se envía ninguna cabecera de autorización.

---

## La clave API

La clave viene de una credencial, así que se guarda y se rota como cualquier otro secreto:

* Crea una credencial de tipo **api** en **Configuración > Conexiones > Credenciales** (consulta [Credenciales](../credentials.html)),
  con la clave como contraseña. También puede leer la clave de un [almacén de secretos](../secret-stores/).
* Elígela en el campo **Credencial** de los ajustes del chat. La clave se lee en cada mensaje, así que una
  contraseña cambiada se aplica al siguiente mensaje.

Una clave guardada en la página de ajustes antes de que existieran las credenciales sigue funcionando mientras no se elija ninguna credencial. La
[semilla de configuración](../seed/) define la propia clave, como `api_key`.

---

## Para un proxy

Un proxy o gateway delante del modelo puede necesitar estos ajustes:

- **Autenticación**: cómo se envía la clave: `Authorization: Bearer`, `api-key`, `x-api-key`,
  o ninguna. Vacío usa el valor predeterminado del proveedor.
- **Versión de API**: la cabecera `anthropic-version`, o `?api-version=` en la URL para los compatibles con OpenAI (Azure).
- **Usuario**: se envía en cada llamada como `user` (compatible con OpenAI) o `metadata.user_id`
  (Anthropic). Algunos proxies lo requieren. Vacío no envía nada.
- **Ignorar errores de certificado**: inseguro; en su lugar, confía en la CA del proxy con `NODE_EXTRA_CA_CERTS`.
- **Cabeceras adicionales**: un objeto JSON, p. ej. `{"X-Org": "ops"}`. Valores de texto de una línea, como máximo 20;
  las cabeceras de la clave y del contenido no se pueden sustituir.

---

## En un contenedor, detrás de un proxy

El chat usa HTTPS saliente simple desde el contenedor del servidor de AnsibleForms. Detrás de un
proxy de salida corporativo, define `HTTPS_PROXY` **y** `NODE_USE_ENV_PROXY=1`; sin lo segundo,
el cliente HTTP integrado de Node ignora `HTTPS_PROXY`. Un proveedor con un certificado de una
CA interna requiere que Node confíe en esa CA (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Con `NODE_USE_ENV_PROXY=1`, un modelo o proxy dentro de la red debe figurar en
`NO_PROXY`, o la llamada va al proxy de salida, que no puede llegar a él.

Una prueba de conexión fallida indica el host y el motivo (DNS, conexión rechazada o certificado no fiable).
