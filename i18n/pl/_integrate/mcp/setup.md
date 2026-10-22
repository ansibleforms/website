---
layout: default
title: Konfiguracja
parent: Serwer MCP
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Konfiguracja
{: .no_toc }

Włączenie serwera i uwierzytelnienie klienta
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Włączanie

Ustaw [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) na `1` albo włącz go w **Ustawienia > Połączenia > MCP**
(zobacz [Strona MCP](#the-mcp-page)). Przełącznik zmieniony na stronie ustawień obowiązuje od razu, bez restartu. Dopóki jest
wyłączony, endpoint odpowiada `404`. Endpoint to:

```
POST <your url>/api/v2/mcp
```

Używa bezstanowego Streamable HTTP ze zwykłymi odpowiedziami JSON, więc `GET` i `DELETE` zwracają 405.

---

## Ograniczanie tego, co mogą agenci

Dwa kolejne przełączniki zawężają serwer MCP dla każdego klienta. Podobnie jak `ENABLE_MCP` obowiązują bez restartu:

| Zmienna | Przy `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | Serwer nie oferuje żadnego z narzędzi, które uruchamiają, planują lub zmieniają (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), i odrzuca je. Agenci mogą wyświetlać, czytać i wypełniać formularze, czytać harmonogramy i zapisane zadania oraz śledzić zadania, ale niczego nie uruchamiają ani nie zmieniają: to bezpieczny sposób na wypróbowanie agenta. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Agenci widzą tylko formularze z ustawionym `enableForChat: true`, czyli tę samą listę co [asystent czatu](../chat/). Każdy inny formularz i każde jego zadanie odpowiada jak nieznalezione. |

Oba są domyślnie wyłączone: agenci widzą każdy formularz, na który pozwalają role użytkownika, i mogą go uruchamiać.

---

## Strona MCP

**Ustawienia > Połączenia > MCP** zawiera ustawienia serwera MCP w dwóch kartach.

- **Ogólne** ma trzy przełączniki, `ENABLE_MCP`, `MCP_READ_ONLY` i `MCP_CHAT_FORMS_ONLY`, zapisywane przyciskiem **Zapisz**. Dwa
  pozostałe można zmieniać tylko wtedy, gdy serwer MCP jest włączony.
- **Konfiguracja klienta** pokazuje **Punkt końcowy**, z przyciskiem do skopiowania, oraz gotową konfigurację dla **Claude Code**
  (`.mcp.json` lub polecenie `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, który pyta
  o token przy pierwszym uruchomieniu serwera) i **Codex** (`~/.codex/config.toml`, z tokenem w zmiennej środowiskowej
  `ANSIBLEFORMS_TOKEN`). Każda ma swój przycisk kopiowania; zastąp `<your-token>` własnym tokenem, utworzonym
  przez link **Utwórz token**.

Punkt końcowy jest budowany z adresu URL aplikacji (**Ustawienia > URL**), gdy jest ustawiony, a w przeciwnym razie z adresu przeglądarki.

---

## Uwierzytelnianie

Każde żądanie wymaga tokenu dostępu AnsibleForms:

```
Authorization: Bearer <token>
```

Uzyskaj go w zwykły sposób (`POST /api/v2/auth/login` lub przepływy OIDC / Entra ID) i
odświeżaj przez `POST /api/v2/token`. Celowo **nie ma narzędzia logowania**: hasło przekazane jako
argument narzędzia trafiłoby do kontekstu modelu językowego i do historii czatu.

Role użytkownika muszą też zezwalać na serwer MCP, przez [opcję roli](../config/roles.html) `allowMcp`. Gdy żadna rola
użytkownika jej nie ustawia, przyjmuje wartość `allowChat`, która jest domyślnie włączona. Użytkownik, któremu odmówiono dostępu, dostaje `403` na każde żądanie.

- **Backend czatu** sam loguje użytkownika, przechowuje token odświeżania i przekazuje token
  dostępu przy każdym wywołaniu MCP.
- **Klient IDE** potrzebuje tokenu, który żyje wystarczająco długo, aby skonfigurować go raz. Mając rolę
  z opcją `allowApiTokens`, utwórz go w
  [Profil > Tokeny API](../profile/api-token.html) albo zaloguj się z `?expiryDays=<n>` w
  adresie URL logowania, aby uzyskać token ważny przez podaną liczbę dni.

Aby połączyć agenta programistycznego za pomocą takiego tokenu:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Dodaj serwer z tokenem jako nagłówkiem:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Dodaj serwer do `~/.codex/config.toml`, z tokenem odczytywanym ze zmiennej środowiskowej:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Następnie ustaw zmienną przed uruchomieniem Codex:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
