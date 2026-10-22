---
layout: default
title: Slack et Microsoft Teams
parent: Canaux de notification
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack et Microsoft Teams
{: .no_toc }

Un webhook de canal Slack ou Teams
{: .fs-6 .fw-300 }

Les canaux Slack et Teams n'ont besoin que de l'adresse du webhook du canal :

| Type | Adresse du webhook |
|---|---|
| Slack | Le webhook entrant du canal (application Slack > Incoming Webhooks). |
| Microsoft Teams | Le webhook Workflows du canal (« post to a channel when a webhook request is received »). |

L'adresse est le secret qui permet à n'importe qui de publier dans le canal : elle est stockée chiffrée et n'est plus jamais affichée une fois enregistrée.
