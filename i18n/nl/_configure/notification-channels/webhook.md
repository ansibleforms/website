---
layout: default
title: Webhook
parent: Meldingskanalen
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

Een JSON-verzoek naar een willekeurig HTTP-endpoint
{: .fs-6 .fw-300 }

Een webhookkanaal stuurt een JSON-verzoek naar een willekeurig HTTP-endpoint. De stap **Endpoint** zegt waarheen en hoe, en de stap
**Referenties** bevat het **Bearer-token**:

| Veld | Betekenis |
|---|---|
| Url | Het adres waarnaar het verzoek wordt gestuurd. |
| Methode | `POST` (standaard) of `PUT`. |
| Bearer-token | Een **api**-referentie uit [Verbindingen > Inloggegevens](../credentials.html) waarvan het wachtwoord wordt verstuurd als `Authorization: Bearer <password>`. Leeg: geen token. |
| Het TLS-certificaat controleren | Standaard aan; schakel het alleen uit voor een endpoint met een zelfondertekend certificaat. |

{% raw %}
De stap **Inhoud** bevat **Headers**, extra headers als JSON-object zoals `{ "X-Source": "ansibleforms" }`, en de
**Inhoud**, de JSON-template van de body. Deze placeholders worden ingevuld:

| Placeholder | Waarde |
|---|---|
| `{{title}}` | De titel van de melding |
| `{{text}}` | De tekst ervan |
| `{{status}}` | De jobstatus |
| `{{event}}` | Het jobevent |
| `{{jobId}}` | Het job-id |
| `{{form}}` | De formuliernaam |
| `{{user}}` | De gebruiker die de job startte |
| `{{link}}` | De link naar de job |

Een placeholder die een hele JSON-string is (`"{{text}}"`) wordt vervangen door de waarde als JSON; binnen een langere string wordt de
tekst ervan voor JSON ge-escapet. Een onbekende placeholder blijft staan zoals hij geschreven is. Een lege inhoud verstuurt deze template:

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
