---
layout: default
title: Opnieuw starten en audit
parent: Chat-assistent
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Opnieuw starten en audit
{: .no_toc }

Opnieuw starten vanuit de chat, het audittrail en de beperkingen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Opnieuw starten

Een verzoek als "Start job 1234 opnieuw" (de gebruiker moet het job-ID typen) toont een voorbeeld van een herstart
onder dezelfde regels als `relaunch_job` van de MCP-server, inclusief de wachtwoordregel van
[startvalidatie](../launch-validation), en toont een samenvatting **Opnieuw starten**; de knop
start hem één keer. "Start job 1234 opnieuw met server web02" wijzigt alleen dat veld.

---

## Audit

Elke start vanuit de chat wordt vastgelegd als **chat.launch** met de gebruiker, de job, het formulier,
de provider, en de payload-hash van de samenvatting die is goedgekeurd. Wijzigingen in de chatinstellingen worden
vastgelegd zoals elke andere wijziging van de instellingen.

---

## Beperkingen

De chat-assistent doet nog niet alles wat een browser doet:

- **Wizardformulieren** kunnen niet meedoen (`enableForChat` wordt daarop geweigerd), en de velden
  die de assistent niet invult ook niet: wachtwoorden en bestandsuploads.
- Antwoorden komen in één keer binnen; streaming wordt nog niet ondersteund.
- Het model kan een verzoek verkeerd begrijpen. De samenvattingskaart toont precies wat er wordt verstuurd;
  controleer die voordat je op **Starten** klikt.
