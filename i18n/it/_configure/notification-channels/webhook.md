---
layout: default
title: Webhook
parent: Canali di notifica
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

Una richiesta JSON a qualsiasi endpoint HTTP
{: .fs-6 .fw-300 }

Un canale webhook invia una richiesta JSON a qualsiasi endpoint HTTP. Il suo passaggio **Endpoint** dice dove e come, e il suo
passaggio **Credenziali** contiene il **Token bearer**:

| Campo | Significato |
|---|---|
| Url | L'indirizzo a cui viene inviata la richiesta. |
| Metodo | `POST` (predefinito) o `PUT`. |
| Token bearer | Una credenziale **api** di [Connessioni > Credenziali](../credentials.html) la cui password viene inviata come `Authorization: Bearer <password>`. Vuoto: nessun token. |
| Verifica il certificato TLS | Attivo per impostazione predefinita; disattivalo solo per un endpoint con un certificato autofirmato. |

{% raw %}
Il suo passaggio **Contenuto** contiene le **Intestazioni**, intestazioni aggiuntive come oggetto JSON, per esempio `{ "X-Source": "ansibleforms" }`, e il
**Contenuto**, il template JSON del corpo. Questi segnaposto vengono compilati:

| Segnaposto | Valore |
|---|---|
| `{{title}}` | Il titolo della notifica |
| `{{text}}` | Il suo testo |
| `{{status}}` | Lo stato del job |
| `{{event}}` | L'evento del job |
| `{{jobId}}` | L'id del job |
| `{{form}}` | Il nome del modulo |
| `{{user}}` | L'utente che ha avviato il job |
| `{{link}}` | Il collegamento al job |

Un segnaposto che è un'intera stringa JSON (`"{{text}}"`) viene sostituito dal valore in JSON; dentro una stringa più lunga, il suo
testo viene sottoposto a escape per JSON. Un segnaposto sconosciuto resta come è scritto. Un contenuto vuoto invia questo template:

```json
{
  "title": "{{title}}",
  "text": "{{text}}",
  "status": "{{status}}",
  "event": "{{event}}",
  "job": { "id": "{{jobId}}", "form": "{{form}}", "user": "{{user}}" },
  "link": "{{link}}"
}
```
{% endraw %}
