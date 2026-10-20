---
layout: default
title: Asistente de chat
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Asistente de chat
{: .no_toc }

Rellena y lanza formularios mediante una conversación
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para los administradores que lo activan, y para los usuarios que chatean con él: rellena y lanza formularios mediante una conversación.

Un botón de chat en cada página abre un
asistente que encuentra el formulario adecuado, pide la información que falta, ofrece como botones las
opciones del propio formulario y muestra un resumen con un botón **Lanzar**. Un trabajo solo arranca cuando el usuario hace clic en él.

---

## Cómo funciona

El asistente se comunica con el modelo de IA a través del servidor, que responde a las peticiones del modelo con el mismo motor de formularios que el navegador:

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **Las llamadas al modelo salen del servidor**, nunca del navegador, así que la clave API se queda en el servidor
  (consulta [Proveedores](providers.html)).
- **El modelo no puede lanzar nada.** Prepara un resumen de un solo uso; Lanzar lo vuelve a comprobar antes de ejecutarlo.
- **El usuario elige los destinos.** Las opciones y los nombres obligatorios los aporta el usuario, nunca el modelo.
- **Escribir "sí" o "lanzar" no hace nada.** Solo el botón lanza un trabajo.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Activarlo](switching-it-on.html) | Activar el asistente y ofrecer formularios en él |
| [Proveedores](providers.html) | El modelo de lenguaje detrás del asistente, y los proxies |
| [Privacidad y límites](privacy-and-limits.html) | Qué sale de la red, y los límites por usuario |
| [Relanzamiento y auditoría](relaunching-and-audit.html) | Relanzar desde el chat, el registro de auditoría y las limitaciones |
