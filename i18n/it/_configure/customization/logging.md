---
layout: default
title: Registrazione
parent: Variabili d'ambiente
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Registrazione
{: .no_toc }

Livelli di log, file, syslog e colori della console
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale per regolare quanto si registra, dove vanno i file di log, o per mostrare gli orari nel tuo fuso orario.

---

## Esempio

Registra di più nei file che nella console, e mostra gli orari dei log e dei job nell'ora di Amsterdam.
Nel `.env` del progetto compose:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

I server syslog non si configurano più qui: aggiungili in **Impostazioni > Connessioni > Syslog**, vedi [Log](../production/logs.html#syslog).
Le variabili `LOG_SYSLOG_*` qui sotto sono deprecate dalla 7. Il primo avvio che trova `LOG_SYSLOG_HOST` impostata le importa
una volta come server syslog `syslog`, che riceve il log del server, e da quel momento le ignora.

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="logging" %}
