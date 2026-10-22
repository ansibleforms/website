---
layout: default
title: Slack e Microsoft Teams
parent: Canais de notificação
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack e Microsoft Teams
{: .no_toc }

Um webhook de canal do Slack ou do Teams
{: .fs-6 .fw-300 }

Os canais do Slack e do Teams só precisam do endereço do webhook do canal:

| Tipo | Endereço do webhook |
|---|---|
| Slack | O webhook de entrada do canal (Slack app > Incoming Webhooks). |
| Microsoft Teams | O webhook do Workflows do canal ("post to a channel when a webhook request is received"). |

O endereço é o segredo que permite a qualquer pessoa publicar no canal: é guardado cifrado e nunca volta a ser mostrado depois de guardado.
