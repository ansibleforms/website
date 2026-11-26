---
layout: default
title: Attività di sistema
parent: Variabili d'ambiente
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Attività di sistema
{: .no_toc }

Quando girano le pulizie, il backup notturno e i cicli dell'hub dei runner
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale per spostare le [attività di sistema](../jobs/system-tasks.html) ad altri orari, o per far girare i cicli dell'hub dei runner più o meno spesso.

---

## Esempio

Esegui il backup all'1:00, pulisci i job all'1:30, e invia i job ai runner ogni 5 secondi. Nel `.env` del progetto compose:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Una variabile `_CRON` accetta un cron di 5 campi (minuto, ora, giorno, mese e giorno della settimana) nel fuso orario del server,
[`LOG_TZ`](logging.html#env_LOG_TZ). La scheda **Pianificazione** di ogni attività, sotto **Job > Sistema**, scrive la sua variabile e la
applica subito su ogni nodo, senza riavvio. La ricarica del config seed ha la propria,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), con le variabili del config seed.

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="system-tasks" %}
