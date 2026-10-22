---
layout: default
title: Chat-assistent
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Chat-assistent
{: .no_toc }

Vul formulieren in en start ze via een gesprek
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders die hem inschakelen, en de gebruikers die ermee chatten: vul formulieren in en start ze via een gesprek.

Een chatknop op elke pagina opent een
assistent die het juiste formulier vindt, om ontbrekende informatie vraagt, de eigen keuzes van het formulier
als knoppen aanbiedt, en een samenvatting toont met een knop **Starten**. Een job start pas als de gebruiker daarop klikt.

---

## Hoe het werkt

De assistent communiceert via de server met het AI-model, en de server beantwoordt de verzoeken van het model met dezelfde formulier-engine als de browser:

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **Aanroepen naar het model komen van de server**, nooit van de browser, dus de API-sleutel blijft op de server
  (zie [Providers](providers.html)).
- **Het model kan niets starten.** Het bereidt een eenmalige samenvatting voor; Starten controleert die opnieuw voordat er iets draait.
- **De gebruiker kiest de doelen.** Keuzes en verplichte namen komen van de gebruiker, nooit van het model.
- **"Ja" of "start" typen doet niets.** Alleen de knop start een job.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat het behandelt |
|---|---|
| [Inschakelen](switching-it-on.html) | De assistent inschakelen en er formulieren in aanbieden |
| [Providers](providers.html) | Het taalmodel achter de assistent, en proxy's |
| [Privacy en limieten](privacy-and-limits.html) | Wat het netwerk verlaat, en de limieten per gebruiker |
| [Opnieuw starten en audit](relaunching-and-audit.html) | Opnieuw starten vanuit de chat, het audittrail en de beperkingen |
