---
layout: default
title: Configuración inicial
parent: Servidor MCP
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Configuración inicial
{: .no_toc }

Activa el servidor y autentica al cliente
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Activarlo

Pon [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) a `1`, o actívalo en **Configuración > Conexiones > MCP**
(consulta [La página MCP](#the-mcp-page)). Si lo cambias en la página de configuración, el interruptor se aplica al momento, sin reiniciar. Mientras está
desactivado, el endpoint responde `404`. El endpoint es:

```
POST <your url>/api/v2/mcp
```

Usa Streamable HTTP sin estado con respuestas JSON simples, así que `GET` y `DELETE` devuelven 405.

---

## Limitar lo que pueden hacer los agentes

Dos interruptores más restringen el servidor MCP para todos los clientes. Como `ENABLE_MCP`, se aplican sin reiniciar:

| Variable | Con `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | El servidor no ofrece ninguna de las herramientas que lanzan, planifican o modifican (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), y las rechaza. Los agentes pueden listar, leer y rellenar formularios, leer programaciones y trabajos guardados, y seguir trabajos, pero no lanzan ni modifican nada: una forma segura de probar un agente. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Los agentes solo ven los formularios que ponen `enableForChat: true`, la misma lista que el [asistente de chat](../chat/). Cualquier otro formulario, y cualquier trabajo de uno de ellos, responde como no encontrado. |

Ambos están desactivados por defecto: los agentes ven todos los formularios que permiten los roles del usuario, y pueden lanzarlos.

---

## La página MCP

**Configuración > Conexiones > MCP** reúne los ajustes del servidor MCP en dos pestañas.

- **General** tiene los tres interruptores, `ENABLE_MCP`, `MCP_READ_ONLY` y `MCP_CHAT_FORMS_ONLY`, que se guardan con **Guardar**. Los dos
  últimos solo se pueden cambiar mientras el servidor MCP está activado.
- **Configuración del cliente** muestra el **Endpoint**, con un botón para copiarlo, y una configuración lista para **Claude Code**
  (`.mcp.json`, o un comando `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, que pide
  el token la primera vez que se inicia el servidor) y **Codex** (`~/.codex/config.toml`, con el token en la
  variable de entorno `ANSIBLEFORMS_TOKEN`). Cada una tiene su botón de copiar; sustituye `<your-token>` por un token tuyo, creado
  con el enlace **Crear un token**.

El endpoint se construye a partir de la URL de la aplicación (**Configuración > URL**) cuando está definida, y si no, a partir de la dirección del navegador.

---

## Autenticación

Cada petición necesita un token de acceso de AnsibleForms:

```
Authorization: Bearer <token>
```

Obtén uno de la forma habitual (`POST /api/v2/auth/login`, o los flujos de OIDC / Entra ID) y
renuévalo con `POST /api/v2/token`. A propósito, **no hay herramienta de login**: una contraseña pasada como
argumento de una herramienta acabaría en el contexto del modelo de lenguaje y en su historial de chat.

Los roles del usuario también deben permitir el servidor MCP, mediante la [opción de rol](../config/roles.html) `allowMcp`. Cuando ningún rol
del usuario la define, sigue a `allowChat`, que está activada por defecto. Un usuario al que se le deniega recibe `403` en cada petición.

- **El backend de un chat** inicia la sesión del usuario por sí mismo, guarda el token de renovación y pasa el token
  de acceso en cada llamada MCP.
- **Un cliente de IDE** necesita un token que dure lo suficiente para configurarlo una sola vez. Con un rol
  que tenga la opción `allowApiTokens`, crea uno en
  [Perfil > Tokens de API](../profile/api-token.html), o inicia sesión con `?expiryDays=<n>` en la
  URL de login para obtener un token válido durante ese número de días.

Para conectar un agente de programación con un token así:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Añade el servidor con el token como cabecera:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Añade el servidor a `~/.codex/config.toml`, con el token leído de una variable de entorno:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Después define la variable antes de iniciar Codex:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
