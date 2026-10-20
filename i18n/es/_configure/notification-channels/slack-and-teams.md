---
layout: default
title: Slack y Microsoft Teams
parent: Canales de notificación
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack y Microsoft Teams
{: .no_toc }

El webhook de un canal de Slack o de Teams
{: .fs-6 .fw-300 }

Los canales de Slack y de Teams solo necesitan la dirección del webhook del canal:

| Tipo | Dirección del webhook |
|---|---|
| Slack | El webhook entrante del canal (Slack app > Incoming Webhooks). |
| Microsoft Teams | El webhook de Workflows del canal ("post to a channel when a webhook request is received"). |

La dirección es el secreto que permite a cualquiera publicar en el canal: se guarda cifrada y no se vuelve a mostrar una vez guardada.
