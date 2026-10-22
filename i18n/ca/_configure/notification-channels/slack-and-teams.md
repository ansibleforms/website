---
layout: default
title: Slack i Microsoft Teams
parent: Canals de notificació
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack i Microsoft Teams
{: .no_toc }

El webhook d'un canal de Slack o de Teams
{: .fs-6 .fw-300 }

Els canals de Slack i de Teams només necessiten l'adreça del webhook del canal:

| Tipus | Adreça del webhook |
|---|---|
| Slack | El webhook d'entrada del canal (Slack app > Incoming Webhooks). |
| Microsoft Teams | El webhook de Workflows del canal ("post to a channel when a webhook request is received"). |

L'adreça és el secret que permet a qualsevol publicar al canal: es desa xifrada i no es torna a mostrar mai un cop desada.
