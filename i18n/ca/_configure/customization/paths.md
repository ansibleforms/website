---
layout: default
title: Camins
parent: Variables d'entorn
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Camins
{: .no_toc }

On són la configuració, els formularis, els playbooks, els fitxers pujats i les còpies de seguretat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables per desar part de les dades en un altre volum, per exemple les còpies de seguretat i els fitxers pujats en un emmagatzematge més gran o més barat.

---

## Exemple

Còpies de seguretat i fitxers pujats en un volum a part, i la resta de les dades a la carpeta persistent habitual. A `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Un camí nou només s'aplica als fitxers nous: el que ja és a la carpeta antiga no es mou, així que copia-ho tu mateix.

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="paths" %}
