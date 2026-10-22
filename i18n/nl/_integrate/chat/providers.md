---
layout: default
title: Providers
parent: Chat-assistent
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Providers
{: .no_toc }

Het taalmodel achter de assistent, en proxy's
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Kies de provider op de instellingenpagina. Dat vult de base URL, de authenticatie en
de API-versie in, die allemaal te wijzigen blijven. Lege velden vallen terug op de standaardwaarden van de provider.

| Provider | Protocol | Base URL (standaard) | Sleutel verstuurd als |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | verplicht: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, API-versie `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | geen |
| **Andere OpenAI-compatibele** (LiteLLM, een gateway, vLLM, LM Studio, ...) | OpenAI | verplicht, meestal eindigend op `/v1` | Bearer |

Het model-ID is het ID dat de provider of proxy gebruikt (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). De assistent vereist een model dat **tool calling** ondersteunt; bij kleine lokale modellen
verschilt die ondersteuning.

Voor lokale servers en proxy's die geen sleutel nodig hebben, is alleen een base URL genoeg; er wordt dan geen authorization-header verstuurd.

---

## De API-sleutel

De sleutel komt uit een referentie, dus hij wordt opgeslagen en geroteerd zoals elk ander secret:

* Maak een referentie van het type **api** onder **Instellingen > Verbindingen > Inloggegevens** (zie [Referenties](../credentials.html)),
  met de sleutel als wachtwoord. Hij kan de sleutel ook uit een [secret store](../secret-stores/) lezen.
* Kies hem in het veld **Referentie** van de chatinstellingen. De sleutel wordt bij elk bericht gelezen, dus een
  gewijzigd wachtwoord geldt vanaf het volgende bericht.

Een sleutel die op de instellingenpagina is opgeslagen voordat er referenties bestonden, blijft werken zolang er geen referentie is gekozen. De
[config seed](../seed/) stelt de sleutel zelf in, als `api_key`.

---

## Voor een proxy

Een proxy of gateway voor het model kan deze instellingen nodig hebben:

- **Authenticatie** - hoe de sleutel wordt verstuurd: `Authorization: Bearer`, `api-key`, `x-api-key`,
  of geen. Leeg gebruikt de standaard van de provider.
- **API-versie** - de header `anthropic-version`, of `?api-version=` in de URL bij OpenAI-compatibel (Azure).
- **Gebruiker** - bij elke aanroep verstuurd als `user` (OpenAI-compatibel) of `metadata.user_id`
  (Anthropic). Sommige proxy's vereisen het. Leeg verstuurt niets.
- **Certificaatfouten negeren** - onveilig; vertrouw in plaats daarvan de CA van de proxy met `NODE_EXTRA_CA_CERTS`.
- **Extra headers** - een JSON-object, bijv. `{"X-Org": "ops"}`. Tekstwaarden op één regel, hooguit 20;
  de sleutel- en content-headers kunnen niet worden vervangen.

---

## In een container, achter een proxy

De chat gebruikt gewone uitgaande HTTPS vanuit de servercontainer van AnsibleForms. Achter een
uitgaande bedrijfsproxy stel je `HTTPS_PROXY` **en** `NODE_USE_ENV_PROXY=1` in; zonder de tweede
negeert de ingebouwde HTTP-client van Node `HTTPS_PROXY`. Een provider met een certificaat van een
interne CA vereist dat Node die CA vertrouwt (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Met `NODE_USE_ENV_PROXY=1` moet een model of proxy binnen het netwerk in
`NO_PROXY` staan, anders gaat de aanroep naar de uitgaande proxy, die het niet kan bereiken.

Een mislukte verbindingstest noemt de host en de reden (DNS, geweigerde verbinding of niet-vertrouwd certificaat).
