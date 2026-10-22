---
layout: default
title: Instellen
parent: MCP-server
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Instellen
{: .no_toc }

Schakel de server in en authenticeer de client
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Inschakelen

Zet [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) op `1`, of schakel hem in onder **Instellingen > Verbindingen > MCP**
(zie [De MCP-pagina](#the-mcp-page)). Gewijzigd op de instellingenpagina geldt de schakelaar meteen, zonder herstart. Zolang hij
uit staat, antwoordt het endpoint `404`. Het endpoint is:

```
POST <your url>/api/v2/mcp
```

Het gebruikt stateless Streamable HTTP met gewone JSON-antwoorden, dus `GET` en `DELETE` geven 405 terug.

---

## Beperken wat agents kunnen doen

Nog twee schakelaars beperken de MCP-server voor elke client. Net als `ENABLE_MCP` gelden ze zonder herstart:

| Variabele | Met `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | De server biedt geen van de tools die starten, plannen of wijzigen (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), en weigert ze. Agents kunnen formulieren tonen, lezen en invullen, planningen en opgeslagen jobs lezen, en jobs volgen, maar niets starten of wijzigen: een veilige manier om een agent uit te proberen. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Agents zien alleen de formulieren die `enableForChat: true` zetten, dezelfde lijst als de [chat-assistent](../chat/). Elk ander formulier, en elke job daarvan, antwoordt als niet gevonden. |

Beide staan standaard uit: agents zien elk formulier dat de rollen van de gebruiker toestaan, en mogen ze starten.

---

## De MCP-pagina

**Instellingen > Verbindingen > MCP** bevat de instellingen van de MCP-server in twee tabbladen.

- **Algemeen** heeft de drie schakelaars, `ENABLE_MCP`, `MCP_READ_ONLY` en `MCP_CHAT_FORMS_ONLY`, opgeslagen met **Opslaan**. De twee
  andere kunnen alleen worden gewijzigd zolang de MCP-server aan staat.
- **Clientconfiguratie** toont het **Eindpunt**, met een knop om het te kopiëren, en een kant-en-klare configuratie voor **Claude Code**
  (`.mcp.json`, of een commando `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, dat
  om het token vraagt als de server voor het eerst start) en **Codex** (`~/.codex/config.toml`, met het token in de
  omgevingsvariabele `ANSIBLEFORMS_TOKEN`). Elk heeft een kopieerknop; vervang `<your-token>` door een eigen token, gemaakt
  met de link **Token maken**.

Het endpoint wordt opgebouwd uit de URL van de app (**Instellingen > URL**) als die is ingesteld, en anders uit het adres van de browser.

---

## Authenticatie

Elk verzoek heeft een access token van AnsibleForms nodig:

```
Authorization: Bearer <token>
```

Haal er een op de gebruikelijke manier op (`POST /api/v2/auth/login`, of de flows van OIDC / Entra ID) en
vernieuw het met `POST /api/v2/token`. Er is bewust **geen login-tool**: een wachtwoord dat als
tool-argument wordt meegegeven, zou in de context en de chatgeschiedenis van het taalmodel belanden.

De rollen van de gebruiker moeten de MCP-server ook toestaan, via de [rol-optie](../config/roles.html) `allowMcp`. Als geen enkele rol
van de gebruiker die instelt, volgt hij `allowChat`, dat standaard aan staat. Een gebruiker aan wie hij wordt geweigerd, krijgt `403` op elk verzoek.

- **Een chatbackend** meldt de gebruiker zelf aan, bewaart het refresh token en geeft het access
  token mee bij elke MCP-aanroep.
- **Een IDE-client** heeft een token nodig dat lang genoeg meegaat om één keer te worden geconfigureerd. Met een rol
  die de optie `allowApiTokens` heeft, maak je er een aan onder
  [Profiel > API-tokens](../profile/api-token.html), of meld je je aan met `?expiryDays=<n>` op de
  login-URL voor een token dat zoveel dagen geldig is.

Om een coding agent met zo'n token te verbinden:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Voeg de server toe met het token als header:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Voeg de server toe aan `~/.codex/config.toml`, met het token gelezen uit een omgevingsvariabele:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Zet daarna de variabele voordat je Codex start:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
