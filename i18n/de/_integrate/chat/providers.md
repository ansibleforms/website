---
layout: default
title: Anbieter
parent: Chat-Assistent
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Anbieter
{: .no_toc }

Das Sprachmodell hinter dem Assistenten, und Proxys
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wählen Sie den Anbieter auf der Einstellungsseite. Das füllt die Basis-URL, die Authentifizierung und
die API-Version aus, die alle bearbeitbar bleiben. Leere Felder fallen auf die Standardwerte des Anbieters zurück.

| Anbieter | Protokoll | Basis-URL (Standard) | Schlüssel gesendet als |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | Pflichtangabe: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, API-Version `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | keiner |
| **Andere OpenAI-kompatible** (LiteLLM, ein Gateway, vLLM, LM Studio, ...) | OpenAI | Pflichtangabe, endet meist auf `/v1` | Bearer |

Die Modell-ID ist die, die der Anbieter oder Proxy verwendet (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). Der Assistent braucht ein Modell, das **Tool Calling** unterstützt; bei kleinen lokalen Modellen ist die Unterstützung
unterschiedlich.

Für lokale Server und Proxys, die keinen Schlüssel brauchen, genügt eine Basis-URL allein; es wird kein Authorization-Header gesendet.

---

## Der API-Schlüssel

Der Schlüssel kommt aus Anmeldedaten, daher wird er wie jedes andere Secret gespeichert und rotiert:

* Legen Sie Anmeldedaten vom Typ **api** unter **Einstellungen > Verbindungen > Anmeldedaten** an (siehe [Anmeldedaten](../credentials.html)),
  mit dem Schlüssel als Passwort. Sie können den Schlüssel auch aus einem [Secret Store](../secret-stores/) lesen.
* Wählen Sie sie im Feld **Anmeldeinformation** der Chat-Einstellungen. Der Schlüssel wird für jede Nachricht gelesen, daher gilt ein
  geändertes Passwort ab der nächsten Nachricht.

Ein Schlüssel, der auf der Einstellungsseite gespeichert wurde, bevor es Anmeldedaten gab, funktioniert weiter, solange keine Anmeldedaten gewählt sind. Der
[Konfigurations-Seed](../seed/) setzt den Schlüssel selbst, als `api_key`.

---

## Für einen Proxy

Ein Proxy oder Gateway vor dem Modell kann diese Einstellungen brauchen:

- **Authentifizierung** - wie der Schlüssel gesendet wird: `Authorization: Bearer`, `api-key`, `x-api-key`
  oder keiner. Leer verwendet den Standard des Anbieters.
- **API-Version** - der Header `anthropic-version` oder `?api-version=` in der URL bei OpenAI-kompatiblen (Azure).
- **Benutzer** - wird bei jedem Aufruf als `user` (OpenAI-kompatibel) oder `metadata.user_id`
  (Anthropic) gesendet. Manche Proxys verlangen es. Leer sendet nichts.
- **Zertifikatsfehler ignorieren** - unsicher; vertrauen Sie stattdessen der CA des Proxys mit `NODE_EXTRA_CA_CERTS`.
- **Zusätzliche Header** - ein JSON-Objekt, z. B. `{"X-Org": "ops"}`. Einzeilige Textwerte, höchstens 20;
  die Schlüssel- und Content-Header lassen sich nicht ersetzen.

---

## In einem Container, hinter einem Proxy

Der Chat verwendet einfaches ausgehendes HTTPS aus dem Container des AnsibleForms-Servers. Hinter einem
Egress-Proxy des Unternehmens setzen Sie `HTTPS_PROXY` **und** `NODE_USE_ENV_PROXY=1`; ohne das Zweite
ignoriert der eingebaute HTTP-Client von Node `HTTPS_PROXY`. Ein Anbieter mit einem Zertifikat von einer
internen CA erfordert, dass Node dieser CA vertraut (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Mit `NODE_USE_ENV_PROXY=1` muss ein Modell oder Proxy innerhalb des Netzwerks in
`NO_PROXY` aufgeführt sein, sonst geht der Aufruf an den Egress-Proxy, der es nicht erreichen kann.

Ein fehlgeschlagener Verbindungstest nennt den Host und den Grund (DNS, abgelehnte Verbindung oder nicht vertrauenswürdiges Zertifikat).
