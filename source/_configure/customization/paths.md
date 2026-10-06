---
layout: default
title: Paths
parent: Environment Variables
nav_order: 2
---

# Paths
{: .no_toc }

Where the configuration, forms, playbooks, uploads and backups live
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these to keep part of the data on another volume, for example backups and uploads on larger or cheaper storage.

---

## Example

Backups and uploaded files on a separate volume, the rest of the data in the usual persistent folder. In `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

A new path applies to new files only: what is already in the old folder is not moved, so copy it over yourself.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="paths" %}
