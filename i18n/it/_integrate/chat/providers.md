---
layout: default
title: Fornitori
parent: Assistente chat
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Fornitori
{: .no_toc }

Il modello linguistico dietro l'assistente, e i proxy
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Seleziona il fornitore nella pagina delle impostazioni. Questo compila l'URL di base, l'autenticazione e
la versione API, che restano tutti modificabili. I campi vuoti ricadono sui valori predefiniti del fornitore.

| Fornitore | Protocollo | URL di base (predefinito) | Chiave inviata come |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | obbligatorio: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, versione API `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | nessuna |
| **Altro compatibile OpenAI** (LiteLLM, un gateway, vLLM, LM Studio, ...) | OpenAI | obbligatorio, di solito termina con `/v1` | Bearer |

L'ID del modello è quello usato dal fornitore o dal proxy (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). L'assistente richiede un modello che supporti il **tool calling**; il supporto varia tra
i piccoli modelli locali.

Per i server locali e i proxy che non richiedono una chiave, basta un URL di base; non viene inviato nessun header di autorizzazione.

---

## La chiave API

La chiave proviene da una credenziale, quindi viene salvata e ruotata come ogni altro segreto:

* Crea una credenziale di tipo **api** in **Impostazioni > Connessioni > Credenziali** (vedi [Credenziali](../credentials.html)),
  con la chiave come password. Può anche leggere la chiave da un [archivio di segreti](../secret-stores/).
* Sceglila nel campo **Credenziale** delle impostazioni della chat. La chiave viene letta per ogni messaggio, quindi una
  password cambiata si applica dal messaggio successivo.

Una chiave salvata nella pagina delle impostazioni prima che esistessero le credenziali continua a funzionare finché non viene scelta nessuna credenziale. Il
[config seed](../seed/) imposta la chiave stessa, come `api_key`.

---

## Per un proxy

Un proxy o un gateway davanti al modello può aver bisogno di queste impostazioni:

- **Autenticazione** - come viene inviata la chiave: `Authorization: Bearer`, `api-key`, `x-api-key`,
  o nessuna. Vuoto usa il predefinito del fornitore.
- **Versione API** - l'header `anthropic-version`, o `?api-version=` nell'URL per i compatibili OpenAI (Azure).
- **Utente** - inviato con ogni chiamata come `user` (compatibili OpenAI) o `metadata.user_id`
  (Anthropic). Alcuni proxy lo richiedono. Vuoto non invia nulla.
- **Ignora errori del certificato** - non sicuro; fai invece considerare attendibile la CA del proxy con `NODE_EXTRA_CA_CERTS`.
- **Header aggiuntivi** - un oggetto JSON, es. `{"X-Org": "ops"}`. Valori di testo su una riga, al massimo 20;
  gli header della chiave e del contenuto non possono essere sostituiti.

---

## In un container, dietro un proxy

La chat usa semplice HTTPS in uscita dal container del server AnsibleForms. Dietro un
proxy di uscita aziendale, imposta `HTTPS_PROXY` **e** `NODE_USE_ENV_PROXY=1`; senza il secondo,
il client HTTP integrato di Node ignora `HTTPS_PROXY`. Un fornitore con un certificato di una
CA interna richiede che Node consideri attendibile quella CA (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Con `NODE_USE_ENV_PROXY=1`, un modello o un proxy dentro la rete deve essere elencato in
`NO_PROXY`, altrimenti la chiamata va al proxy di uscita, che non può raggiungerlo.

Un test di connessione fallito indica l'host e il motivo (DNS, connessione rifiutata o certificato non attendibile).
