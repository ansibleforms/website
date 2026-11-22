---
layout: default
title: Backup e conservazione
parent: Variabili d'ambiente
nav_order: 3
translated_from: 1cac64b6467ce96bce3aac71718f07d7ecd10d89
---

# Backup e conservazione
{: .no_toc }

I comandi di backup, e per quanto tempo si conservano i backup, i job e i record di audit
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale per controllare quanta cronologia conserva il database, e quanti backup restano su disco.

---

## Esempio

Conserva i job terminati per 90 giorni e la traccia di audit per due anni. Nel `.env` del progetto compose:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Un'attività giornaliera rimuove i job terminati più vecchi di così alle 2:30 e le voci di audit alle 3:30. Un job in esecuzione, o uno in attesa di
approvazione, non viene mai rimosso. Dalla 7.7.0 `STORED_JOB_UNUSED_DAYS` rimuove anche, alle 4:00, i [job
salvati](../jobs/stored-jobs.html#when-it-is-removed) da cui nessun job è stato avviato per quel numero di giorni. Queste variabili
si applicano senza riavvio quando vengono modificate nella pagina delle impostazioni.

Questi orari sono quelli predefiniti. Dalla 7.8.0 ogni pulizia, e il backup notturno, è un'[attività di sistema](../jobs/system-tasks.html) sotto
**Job > Sistema**, dove un admin cambia quando gira e ne vede le esecuzioni; le variabili dei loro orari sono in
[Attività di sistema](system-tasks.html).

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="retention" %}
