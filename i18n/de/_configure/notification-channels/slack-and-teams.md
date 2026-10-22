---
layout: default
title: Slack und Microsoft Teams
parent: Benachrichtigungskanäle
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack und Microsoft Teams
{: .no_toc }

Ein Kanal-Webhook von Slack oder Teams
{: .fs-6 .fw-300 }

Slack- und Teams-Kanäle brauchen nur die Adresse des Webhooks des Kanals:

| Typ | Webhook-Adresse |
|---|---|
| Slack | Der eingehende Webhook des Kanals (Slack-App > Incoming Webhooks). |
| Microsoft Teams | Der Workflows-Webhook des Kanals („post to a channel when a webhook request is received“). |

Die Adresse ist das Geheimnis, mit dem jeder in den Kanal posten kann: Sie wird verschlüsselt gespeichert und nach dem Speichern nie wieder angezeigt.
