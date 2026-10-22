---
layout: default
title: Slack e Microsoft Teams
parent: Canali di notifica
nav_order: 2
translated_from: d0c548d54213641c8b6b142e1d7cd1764b6d02b9
---

# Slack e Microsoft Teams
{: .no_toc }

Un webhook di canale di Slack o Teams
{: .fs-6 .fw-300 }

I canali Slack e Teams richiedono solo l'indirizzo del webhook del canale:

| Tipo | Indirizzo del webhook |
|---|---|
| Slack | Il webhook in entrata del canale (Slack app > Incoming Webhooks). |
| Microsoft Teams | Il webhook di Workflows del canale ("post to a channel when a webhook request is received"). |

L'indirizzo è il segreto che permette a chiunque di pubblicare nel canale: viene salvato cifrato e, una volta salvato, non viene più mostrato.
