---
layout: default
title: Percorsi
parent: Variabili d'ambiente
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Percorsi
{: .no_toc }

Dove si trovano la configurazione, i moduli, i playbook, i caricamenti e i backup
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale per tenere una parte dei dati su un altro volume, per esempio i backup e i caricamenti su uno storage più grande o più economico.

---

## Esempio

Backup e file caricati su un volume separato, il resto dei dati nella solita cartella persistente. In `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Un nuovo percorso vale solo per i nuovi file: ciò che è già nella vecchia cartella non viene spostato, quindi copialo tu.

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="paths" %}
