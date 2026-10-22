---
layout: default
title: Chemins
parent: Variables d'environnement
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Chemins
{: .no_toc }

Où se trouvent la configuration, les formulaires, les playbooks, les fichiers téléversés et les sauvegardes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les pour conserver une partie des données sur un autre volume, par exemple les sauvegardes et les fichiers téléversés sur un stockage plus grand ou moins cher.

---

## Exemple

Les sauvegardes et les fichiers téléversés sur un volume séparé, le reste des données dans le dossier persistant habituel. Dans `docker-compose.yml` :

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Un nouveau chemin ne s'applique qu'aux nouveaux fichiers : ce qui se trouve déjà dans l'ancien dossier n'est pas déplacé, copiez-le donc vous-même.

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="paths" %}
