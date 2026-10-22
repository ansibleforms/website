---
layout: default
title: Einrichtung
parent: MCP-Server
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Einrichtung
{: .no_toc }

Den Server einschalten und den Client authentifizieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Aktivieren

Setzen Sie [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) auf `1` oder schalten Sie es unter **Einstellungen > Verbindungen > MCP** ein
(siehe [Die MCP-Seite](#the-mcp-page)). Auf der Einstellungsseite geändert, gilt der Schalter sofort, ohne Neustart. Solange er
aus ist, antwortet der Endpunkt `404`. Der Endpunkt ist:

```
POST <your url>/api/v2/mcp
```

Er verwendet zustandsloses Streamable HTTP mit einfachen JSON-Antworten, daher geben `GET` und `DELETE` 405 zurück.

---

## Begrenzen, was Agenten tun können

Zwei weitere Schalter schränken den MCP-Server für jeden Client ein. Wie `ENABLE_MCP` gelten sie ohne Neustart:

| Variable | Mit `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | Der Server bietet keines der Tools an, die starten, planen oder ändern (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), und lehnt sie ab. Agenten können Formulare auflisten, lesen und ausfüllen, Zeitpläne und gespeicherte Jobs lesen und Jobs verfolgen, aber nichts starten oder ändern: eine sichere Art, einen Agenten auszuprobieren. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Agenten sehen nur die Formulare, die `enableForChat: true` setzen, dieselbe Liste wie der [Chat-Assistent](../chat/). Jedes andere Formular und jeder Job eines solchen antwortet als nicht gefunden. |

Beide sind standardmäßig aus: Agenten sehen jedes Formular, das die Rollen des Benutzers erlauben, und dürfen es starten.

---

## Die MCP-Seite

**Einstellungen > Verbindungen > MCP** enthält die Einstellungen des MCP-Servers in zwei Reitern.

- **Allgemein** hat die drei Schalter, `ENABLE_MCP`, `MCP_READ_ONLY` und `MCP_CHAT_FORMS_ONLY`, gespeichert mit **Speichern**. Die beiden
  anderen lassen sich nur ändern, solange der MCP-Server eingeschaltet ist.
- **Client-Konfiguration** zeigt den **Endpunkt**, mit einer Schaltfläche zum Kopieren, und eine fertige Konfiguration für **Claude Code**
  (`.mcp.json` oder ein Befehl `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, das beim ersten Start des Servers
  nach dem Token fragt) und **Codex** (`~/.codex/config.toml`, mit dem Token in der
  Umgebungsvariable `ANSIBLEFORMS_TOKEN`). Jede hat ihre Kopierschaltfläche; ersetzen Sie `<your-token>` durch ein eigenes Token, erstellt
  über den Link **Token erstellen**.

Der Endpunkt wird aus der URL der App (**Einstellungen > URL**) gebildet, wenn sie gesetzt ist, sonst aus der Adresse des Browsers.

---

## Authentifizierung

Jede Anfrage braucht ein AnsibleForms-Access-Token:

```
Authorization: Bearer <token>
```

Holen Sie eines auf dem üblichen Weg (`POST /api/v2/auth/login` oder die Abläufe für OIDC / Entra ID) und
erneuern Sie es mit `POST /api/v2/token`. Es gibt bewusst **kein Login-Tool**: ein als
Tool-Argument übergebenes Passwort würde im Kontext des Sprachmodells und in seinem Chatverlauf landen.

Die Rollen des Benutzers müssen den MCP-Server außerdem erlauben, über die [Rollenoption](../config/roles.html) `allowMcp`. Wenn keine Rolle
des Benutzers sie setzt, folgt sie `allowChat`, das standardmäßig eingeschaltet ist. Ein Benutzer, dem sie verweigert ist, erhält bei jeder Anfrage `403`.

- **Ein Chat-Backend** meldet den Benutzer selbst an, behält das Refresh Token und übergibt das Access
  Token bei jedem MCP-Aufruf.
- **Ein IDE-Client** braucht ein Token, das lange genug hält, um einmal konfiguriert zu werden. Mit einer Rolle,
  die die Option `allowApiTokens` hat, erstellen Sie eines unter
  [Profil > API-Tokens](../profile/api-token.html), oder melden Sie sich mit `?expiryDays=<n>` an der
  Anmelde-URL an, für ein Token, das so viele Tage gültig ist.

So verbinden Sie einen Coding-Agenten mit einem solchen Token:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Fügen Sie den Server mit dem Token als Header hinzu:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Fügen Sie den Server zu `~/.codex/config.toml` hinzu, mit dem Token aus einer Umgebungsvariable:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Setzen Sie dann die Variable, bevor Sie Codex starten:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
