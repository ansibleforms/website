---
layout: default
title: MCP-server
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# MCP-server
{: .no_toc }

Laat AI-agents je formulieren gebruiken via het Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders en integrators: laat MCP-clients formulieren tonen, invullen en starten als de gebruiker wiens token ze hebben.

AnsibleForms kan een
[Model Context Protocol](https://modelcontextprotocol.io)-server aanbieden, zodat een MCP-client, zoals
een chatbackend of een IDE-assistent, de formulieren kan tonen die een gebruiker mag gebruiken, de velden ervan kan bepalen,
jobs kan starten en de voortgang ervan kan volgen.

---

## Wat het is, en wat het niet is

De MCP-server is een technische interface naar dezelfde formulierflow die de browser gebruikt. Hij draait
**als de gebruiker wiens token hij ontvangt**: dezelfde formulierrollen, dezelfde zichtbaarheid van jobs, dezelfde
controles op gereserveerde extravars als bij een verzending vanuit de browser.

Hij voegt geen eigen AI-beleid toe. Of een agent om bevestiging moet vragen voor een start,
welke formulieren hij mag gebruiken, of hoeveel verzoeken hij mag doen, bepaalt de MCP-client. De
start-tool is gemarkeerd als destructief, dus een nette client vraagt eerst om bevestiging,
maar de server dwingt dat niet af.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat het behandelt |
|---|---|
| [Instellen](setup.html) | De server inschakelen en de client authenticeren |
| [Tools](tools.html) | De tools die een agent gebruikt om formulieren in te vullen, goed te keuren en opnieuw te starten |
| [Beperkingen](limitations.html) | Expressies draaien op de server, en wat de MCP-server niet doet |
