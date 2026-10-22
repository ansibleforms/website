---
layout: default
title: Functies
parent: Omgevingsvariabelen
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Functies
{: .no_toc }

De designer, MCP, chat, validatie bij het starten, de jobslijst, metrics, de AWX API en het loggen van query's
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze om optionele onderdelen van de applicatie in of uit te schakelen.

---

## Voorbeeld

Bied de MCP-server aan voor AI-agents en dwing de validatieregels van het formulier af bij elke start. In de `.env` van het compose-project:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` en `ENABLE_CHAT` gelden zonder herstart: ze worden bij elk verzoek gelezen, dus je kunt ze op de
instellingenpagina inschakelen. Zolang er een uit staat, antwoordt het endpoint ervan (`/api/v2/mcp` of `/api/v2/chat`) met `404`.

Draai eerst een tijdje met `LAUNCH_VALIDATION=log`: dat logt wat `enforce` zou weigeren, zonder het te weigeren. Zie [MCP](../mcp/)
en [Loggen en afdwingen](../launch-validation/log-and-enforce.html).

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="features" %}
