---
layout: default
title: Configuració
parent: Servidor MCP
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Configuració
{: .no_toc }

Activar el servidor i autenticar el client
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Activar-lo

Posa [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) a `1`, o activa'l a **Configuració > Connexions > MCP**
(consulta [La pàgina MCP](#the-mcp-page)). Si es canvia a la pàgina de configuració, l'interruptor s'aplica a l'instant, sense reiniciar. Mentre està
desactivat, l'endpoint respon `404`. L'endpoint és:

```
POST <your url>/api/v2/mcp
```

Fa servir Streamable HTTP sense estat amb respostes JSON simples, així que `GET` i `DELETE` retornen 405.

---

## Limitar el que poden fer els agents

Dos interruptors més restringeixen el servidor MCP per a tots els clients. Com `ENABLE_MCP`, s'apliquen sense reiniciar:

| Variable | Amb `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | El servidor no ofereix cap de les eines que llancen, planifiquen o canvien coses (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), i les rebutja. Els agents poden llistar, llegir i emplenar formularis, llegir programacions i tasques desades, i seguir tasques, però no llancen ni canvien res: una manera segura de provar un agent. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Els agents només veuen els formularis que defineixen `enableForChat: true`, la mateixa llista que l'[assistent de xat](../chat/). Qualsevol altre formulari, i qualsevol tasca d'un d'ells, respon com si no existís. |

Tots dos estan desactivats per defecte: els agents veuen tots els formularis que permeten els rols de l'usuari, i els poden llançar.

---

## La pàgina MCP

**Configuració > Connexions > MCP** conté la configuració del servidor MCP en dues pestanyes.

- **General** té els tres interruptors, `ENABLE_MCP`, `MCP_READ_ONLY` i `MCP_CHAT_FORMS_ONLY`, que es desen amb **Desa**. Els altres
  dos només es poden canviar mentre el servidor MCP està activat.
- **Configuració del client** mostra el **Punt final**, amb un botó per copiar-lo, i una configuració a punt per a **Claude Code**
  (`.mcp.json`, o una ordre `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, que demana
  el token la primera vegada que s'inicia el servidor) i **Codex** (`~/.codex/config.toml`, amb el token a la
  variable d'entorn `ANSIBLEFORMS_TOKEN`). Cadascuna té el seu botó de copiar; substitueix `<your-token>` per un token propi, creat
  amb l'enllaç **Crea un testimoni**.

El punt final es construeix a partir de l'URL de l'aplicació (**Configuració > URL**) quan està definit, i si no, a partir de l'adreça del navegador.

---

## Autenticació

Cada petició necessita un token d'accés d'AnsibleForms:

```
Authorization: Bearer <token>
```

Obtén-ne un de la manera habitual (`POST /api/v2/auth/login`, o els fluxos d'OIDC / Entra ID) i
renova'l amb `POST /api/v2/token`. Expressament **no hi ha cap eina d'inici de sessió**: una contrasenya passada com a
argument d'una eina acabaria al context del model de llenguatge i al seu historial de xat.

Els rols de l'usuari també han de permetre el servidor MCP, mitjançant l'[opció de rol](../config/roles.html) `allowMcp`. Quan cap rol
de l'usuari no la defineix, segueix `allowChat`, que està activada per defecte. Un usuari a qui es denega rep `403` a cada petició.

- **El backend d'un xat** inicia ell mateix la sessió de l'usuari, guarda el token de renovació i passa el token
  d'accés a cada crida MCP.
- **Un client d'IDE** necessita un token que duri prou per configurar-lo una sola vegada. Amb un rol
  que tingui l'opció `allowApiTokens`, crea'n un a
  [Perfil > Tokens d'API](../profile/api-token.html), o inicia sessió amb `?expiryDays=<n>` a
  l'URL d'inici de sessió per obtenir un token vàlid durant aquest nombre de dies.

Per connectar un agent de programació amb un token d'aquest tipus:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Afegeix el servidor amb el token com a capçalera:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Afegeix el servidor a `~/.codex/config.toml`, amb el token llegit d'una variable d'entorn:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Després defineix la variable abans d'iniciar Codex:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
