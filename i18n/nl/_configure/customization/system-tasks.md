---
layout: default
title: Systeemtaken
parent: Omgevingsvariabelen
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Systeemtaken
{: .no_toc }

Wanneer de opschoontaken, de nachtelijke back-up en de lussen van de runner-hub draaien
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze om de [systeemtaken](../jobs/system-tasks.html) naar andere tijden te verplaatsen, of de lussen van de runner-hub vaker of minder vaak te draaien.

---

## Voorbeeld

Maak om 1:00 uur een back-up, schoon om 1:30 uur de jobs op, en geef de jobs elke 5 seconden aan de runners. In de `.env` van het compose-project:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Een `_CRON`-variabele neemt een cron van 5 velden (minuut, uur, dag, maand en weekdag) in de tijdzone van de server,
[`LOG_TZ`](logging.html#env_LOG_TZ). Het tabblad **Planning** van elke taak, onder **Jobs > Systeem**, schrijft haar variabele en past
die meteen toe op elke node, zonder herstart. Het herladen van de configuratie-seed heeft een eigen variabele,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), bij de variabelen van de configuratie-seed.

---

## Variabelen

Elke variabele van deze groep, met haar type, standaardwaarde en beschrijving:

{% include env_vars_table.html group="system-tasks" %}
