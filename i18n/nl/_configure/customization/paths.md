---
layout: default
title: Paden
parent: Omgevingsvariabelen
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Paden
{: .no_toc }

Waar de configuratie, formulieren, playbooks, uploads en back-ups staan
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wijzig deze om een deel van de gegevens op een ander volume te bewaren, bijvoorbeeld back-ups en uploads op grotere of goedkopere opslag.

---

## Voorbeeld

Back-ups en geüploade bestanden op een apart volume, de rest van de gegevens in de gebruikelijke persistente map. In `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Een nieuw pad geldt alleen voor nieuwe bestanden: wat al in de oude map staat, wordt niet verplaatst, dus kopieer het zelf over.

---

## Variabelen

Elke variabele van deze groep, met het type, de standaardwaarde en de beschrijving:

{% include env_vars_table.html group="paths" %}
