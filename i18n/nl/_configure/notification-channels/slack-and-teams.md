---
layout: default
title: Slack en Microsoft Teams
parent: Meldingskanalen
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack en Microsoft Teams
{: .no_toc }

Een kanaalwebhook van Slack of Teams
{: .fs-6 .fw-300 }

Slack- en Teams-kanalen hebben alleen het adres van de webhook van het kanaal nodig:

| Type | Webhookadres |
|---|---|
| Slack | De inkomende webhook van het kanaal (Slack-app > Incoming Webhooks). |
| Microsoft Teams | De Workflows-webhook van het kanaal ("post to a channel when a webhook request is received"). |

Het adres is het geheim waarmee iedereen in het kanaal kan posten: het wordt versleuteld opgeslagen en na het opslaan nooit meer getoond.
