---
layout: default
title: Backup e conservazione
parent: Variabili d'ambiente
nav_order: 3
translated_from: 76f81cfa15eaa98199a3d5963f7adc9a6f8b01dc
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
```

Un'attività giornaliera rimuove i job terminati più vecchi di così alle 2:30 e le voci di audit alle 3:30. Un job in esecuzione, o uno in attesa di
approvazione, non viene mai rimosso. Entrambe le variabili si applicano senza riavvio quando vengono modificate nella pagina delle impostazioni.

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="retention" %}
