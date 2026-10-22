---
layout: default
title: Configurazione
parent: Server MCP
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Configurazione
{: .no_toc }

Attiva il server e autentica il client
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Abilitarlo

Imposta [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) su `1`, o attivalo in **Impostazioni > Connessioni > MCP**
(vedi [La pagina MCP](#the-mcp-page)). Modificato nella pagina delle impostazioni, l'interruttore si applica subito, senza riavvio. Finché è
disattivato, l'endpoint risponde `404`. L'endpoint è:

```
POST <your url>/api/v2/mcp
```

Usa Streamable HTTP stateless con risposte JSON semplici, quindi `GET` e `DELETE` restituiscono 405.

---

## Limitare cosa possono fare gli agenti

Altri due interruttori restringono il server MCP per tutti i client. Come `ENABLE_MCP`, si applicano senza riavvio:

| Variabile | Con `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | Il server non offre nessuno degli strumenti che avviano, pianificano o modificano (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), e li rifiuta. Gli agenti possono elencare, leggere e compilare moduli, leggere pianificazioni e job salvati, e seguire i job, ma non avviano né modificano nulla: un modo sicuro per provare un agente. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Gli agenti vedono solo i moduli che impostano `enableForChat: true`, lo stesso elenco dell'[assistente chat](../chat/). Qualsiasi altro modulo, e qualsiasi suo job, risponde come non trovato. |

Entrambi sono disattivati per impostazione predefinita: gli agenti vedono ogni modulo consentito dai ruoli dell'utente, e possono avviarlo.

---

## La pagina MCP

**Impostazioni > Connessioni > MCP** contiene le impostazioni del server MCP in due schede.

- **Generale** ha i tre interruttori, `ENABLE_MCP`, `MCP_READ_ONLY` e `MCP_CHAT_FORMS_ONLY`, salvati con **Salva**. Gli altri due
  si possono modificare solo mentre il server MCP è attivo.
- **Configurazione del client** mostra l'**Endpoint**, con un pulsante per copiarlo, e una configurazione pronta per **Claude Code**
  (`.mcp.json`, o un comando `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, che chiede
  il token al primo avvio del server) e **Codex** (`~/.codex/config.toml`, con il token nella variabile d'ambiente
  `ANSIBLEFORMS_TOKEN`). Ognuna ha il suo pulsante di copia; sostituisci `<your-token>` con un tuo token, creato
  con il link **Crea un token**.

L'endpoint è costruito dall'URL dell'app (**Impostazioni > URL**) quando è impostato, altrimenti dall'indirizzo del browser.

---

## Autenticazione

Ogni richiesta ha bisogno di un access token di AnsibleForms:

```
Authorization: Bearer <token>
```

Ottienine uno nel modo abituale (`POST /api/v2/auth/login`, o i flussi OIDC / Entra ID) e
rinnovalo con `POST /api/v2/token`. Non c'è di proposito **nessuno strumento di login**: una password passata come
argomento di uno strumento finirebbe nel contesto del modello linguistico e nella sua cronologia di chat.

Anche i ruoli dell'utente devono consentire il server MCP, tramite l'[opzione di ruolo](../config/roles.html) `allowMcp`. Quando nessun ruolo
dell'utente la imposta, segue `allowChat`, che è attiva per impostazione predefinita. Un utente a cui è negato riceve `403` su ogni richiesta.

- **Un backend di chat** fa accedere l'utente da sé, conserva il refresh token e passa l'access
  token a ogni chiamata MCP.
- **Un client IDE** ha bisogno di un token che duri abbastanza da poter essere configurato una sola volta. Con un ruolo
  che ha l'opzione `allowApiTokens`, creane uno in
  [Profilo > Token API](../profile/api-token.html), o accedi con `?expiryDays=<n>` nell'URL
  di login per un token valido quel numero di giorni.

Per collegare un agente di programmazione con un token del genere:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Aggiungi il server con il token come header:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Aggiungi il server a `~/.codex/config.toml`, con il token letto da una variabile d'ambiente:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Poi imposta la variabile prima di avviare Codex:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
