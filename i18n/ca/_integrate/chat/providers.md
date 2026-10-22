---
layout: default
title: Proveïdors
parent: Assistent de xat
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Proveïdors
{: .no_toc }

El model de llenguatge que hi ha darrere de l'assistent, i els proxies
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Tria el proveïdor a la pàgina de configuració. Això n'omple l'URL base, l'autenticació i
la versió de l'API, que continuen sent editables. Els camps buits fan servir els valors predeterminats del proveïdor.

| Proveïdor | Protocol | URL base (predeterminat) | La clau s'envia com a |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | obligatori: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, versió de l'API `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | cap |
| **Un altre compatible amb OpenAI** (LiteLLM, una passarel·la, vLLM, LM Studio, ...) | OpenAI | obligatori, normalment acabat en `/v1` | Bearer |

L'ID del model és el que fa servir el proveïdor o el proxy (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). L'assistent necessita un model que admeti **tool calling** (crides a eines); el suport varia entre
els models locals petits.

Per a servidors locals i proxies que no necessiten clau, n'hi ha prou amb un URL base; no s'envia cap capçalera d'autorització.

---

## La clau d'API

La clau ve d'una credencial, així que es desa i es renova com qualsevol altre secret:

* Crea una credencial de tipus **api** a **Configuració > Connexions > Credencials** (consulta [Credencials](../credentials.html)),
  amb la clau com a contrasenya. També pot llegir la clau d'un [magatzem de secrets](../secret-stores/).
* Tria-la al camp **Credencial** de la configuració del xat. La clau es llegeix a cada missatge, així que una
  contrasenya canviada s'aplica al missatge següent.

Una clau desada a la pàgina de configuració abans que existissin les credencials continua funcionant mentre no es triï cap credencial. El
[config seed](../seed/) defineix la clau directament, com a `api_key`.

---

## Per a un proxy

Un proxy o una passarel·la davant del model pot necessitar aquests paràmetres:

- **Autenticació** - com s'envia la clau: `Authorization: Bearer`, `api-key`, `x-api-key`,
  o cap. Buit fa servir el valor predeterminat del proveïdor.
- **Versió de l'API** - la capçalera `anthropic-version`, o `?api-version=` a l'URL per als compatibles amb OpenAI (Azure).
- **Usuari** - s'envia amb cada crida com a `user` (compatible amb OpenAI) o `metadata.user_id`
  (Anthropic). Alguns proxies l'exigeixen. Buit no envia res.
- **Ignora els errors de certificat** - insegur; en lloc d'això, confia en la CA del proxy amb `NODE_EXTRA_CA_CERTS`.
- **Capçaleres addicionals** - un objecte JSON, p. ex. `{"X-Org": "ops"}`. Valors de text d'una sola línia, com a màxim 20;
  les capçaleres de clau i de contingut no es poden substituir.

---

## En un contenidor, darrere d'un proxy

El xat fa servir HTTPS sortint normal des del contenidor del servidor d'AnsibleForms. Darrere d'un
proxy de sortida corporatiu, defineix `HTTPS_PROXY` **i** `NODE_USE_ENV_PROXY=1`; sense el segon,
el client HTTP integrat de Node ignora `HTTPS_PROXY`. Un proveïdor amb un certificat d'una
CA interna necessita que Node confiï en aquesta CA (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Amb `NODE_USE_ENV_PROXY=1`, un model o un proxy dins de la xarxa ha de figurar a
`NO_PROXY`, o la crida va al proxy de sortida, que no hi pot arribar.

Una prova de connexió fallida indica el host i el motiu (DNS, connexió rebutjada o certificat no fiable).
