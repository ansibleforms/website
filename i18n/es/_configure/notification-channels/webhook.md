---
layout: default
title: Webhook
parent: Canales de notificación
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

Una petición JSON a cualquier endpoint HTTP
{: .fs-6 .fw-300 }

Un canal webhook envía una petición JSON a cualquier endpoint HTTP. Su paso **Endpoint** indica adónde y cómo, y su paso
**Credenciales** contiene el **Token bearer**:

| Campo | Significado |
|---|---|
| Url | La dirección a la que se envía la petición. |
| Método | `POST` (predeterminado) o `PUT`. |
| Token bearer | Una credencial **api** de [Conexiones > Credenciales](../credentials.html) cuya contraseña se envía como `Authorization: Bearer <password>`. Vacío: sin token. |
| Comprobar el certificado TLS | Activado por defecto; desactívalo solo para un endpoint con un certificado autofirmado. |

{% raw %}
Su paso **Contenido** contiene las **Cabeceras**, cabeceras adicionales como un objeto JSON, por ejemplo `{ "X-Source": "ansibleforms" }`, y el
**Contenido**, la plantilla JSON del cuerpo. Se rellenan estos marcadores:

| Marcador | Valor |
|---|---|
| `{{title}}` | El título de la notificación |
| `{{text}}` | Su texto |
| `{{status}}` | El estado del trabajo |
| `{{event}}` | El evento del trabajo |
| `{{jobId}}` | El id del trabajo |
| `{{form}}` | El nombre del formulario |
| `{{user}}` | El usuario que lanzó el trabajo |
| `{{link}}` | El enlace al trabajo |

Un marcador que ocupa una cadena JSON entera (`"{{text}}"`) se sustituye por el valor como JSON; dentro de una cadena más larga, su
texto se escapa para JSON. Un marcador desconocido se deja tal cual. Un contenido vacío envía esta plantilla:

```json
{
  "title": "{{title}}",
  "text": "{{text}}",
  "status": "{{status}}",
  "event": "{{event}}",
  "job": { "id": "{{jobId}}", "form": "{{form}}", "user": "{{user}}" },
  "link": "{{link}}"
}
```
{% endraw %}
