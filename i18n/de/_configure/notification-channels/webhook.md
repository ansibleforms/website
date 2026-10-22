---
layout: default
title: Webhook
parent: Benachrichtigungskanäle
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

Eine JSON-Anfrage an einen beliebigen HTTP-Endpunkt
{: .fs-6 .fw-300 }

Ein Webhook-Kanal sendet eine JSON-Anfrage an einen beliebigen HTTP-Endpunkt. Sein Schritt **Endpunkt** sagt, wohin und wie, und sein
Schritt **Anmeldedaten** enthält das **Bearer-Token**:

| Feld | Bedeutung |
|---|---|
| Url | Die Adresse, an die die Anfrage gesendet wird. |
| Methode | `POST` (Standard) oder `PUT`. |
| Bearer-Token | Ein **api**-Eintrag aus [Verbindungen > Anmeldedaten](../credentials.html), dessen Passwort als `Authorization: Bearer <password>` gesendet wird. Leer: kein Token. |
| TLS-Zertifikat prüfen | Standardmäßig ein; schalten Sie es nur für einen Endpunkt mit selbstsigniertem Zertifikat aus. |

{% raw %}
Sein Schritt **Inhalt** enthält die **Header**, zusätzliche Header als JSON-Objekt wie `{ "X-Source": "ansibleforms" }`, und den
**Inhalt**, das JSON-Template des Bodys. Diese Platzhalter werden ausgefüllt:

| Platzhalter | Wert |
|---|---|
| `{{title}}` | Der Titel der Benachrichtigung |
| `{{text}}` | Ihr Text |
| `{{status}}` | Der Jobstatus |
| `{{event}}` | Das Job-Ereignis |
| `{{jobId}}` | Die Job-ID |
| `{{form}}` | Der Formularname |
| `{{user}}` | Der Benutzer, der den Job gestartet hat |
| `{{link}}` | Der Link zum Job |

Ein Platzhalter, der einen ganzen JSON-String bildet (`"{{text}}"`), wird durch den Wert als JSON ersetzt; innerhalb eines längeren Strings wird sein
Text für JSON maskiert. Ein unbekannter Platzhalter bleibt, wie er geschrieben ist. Ein leerer Inhalt sendet dieses Template:

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
