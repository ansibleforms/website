---
layout: default
title: Logging
parent: Omgevingsvariabelen
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Logging
{: .no_toc }

Logniveaus, bestanden, syslog en consolekleuren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze om aan te passen hoeveel er wordt gelogd, waar de logbestanden terechtkomen, of om tijdstempels in je eigen tijdzone te tonen.

---

## Voorbeeld

Log meer in de bestanden dan op de console, en toon de tijdstempels van log en jobs in Amsterdamse tijd.
In de `.env` van het compose-project:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Syslogservers worden hier niet meer geconfigureerd: voeg ze toe onder **Instellingen > Verbindingen > Syslog**, zie [Logs](../production/logs.html#syslog).
De variabelen `LOG_SYSLOG_*` hieronder zijn sinds 7 verouderd. De eerste start die `LOG_SYSLOG_HOST` ingesteld vindt, importeert ze
eenmaal als de syslogserver `syslog`, die het serverlog ontvangt, en negeert ze vanaf dan.

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="logging" %}
