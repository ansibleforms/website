---
layout: default
title: Pfade
parent: Umgebungsvariablen
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Pfade
{: .no_toc }

Wo Konfiguration, Formulare, Playbooks, Uploads und Backups liegen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, um einen Teil der Daten auf einem anderen Volume zu halten, zum Beispiel Backups und Uploads auf größerem oder günstigerem Speicher.

---

## Beispiel

Backups und hochgeladene Dateien auf einem eigenen Volume, die übrigen Daten im üblichen persistenten Ordner. In `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Ein neuer Pfad gilt nur für neue Dateien: Was bereits im alten Ordner liegt, wird nicht verschoben, kopieren Sie es also selbst hinüber.

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="paths" %}
