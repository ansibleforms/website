---
layout: default
title: Ścieżki
parent: Zmienne środowiskowe
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Ścieżki
{: .no_toc }

Gdzie znajdują się konfiguracja, formularze, playbooki, przesłane pliki i kopie zapasowe
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, aby trzymać część danych na innym wolumenie, np. kopie zapasowe i przesłane pliki na większym lub tańszym magazynie.

---

## Przykład

Kopie zapasowe i przesłane pliki na osobnym wolumenie, reszta danych w zwykłym folderze trwałym. W `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Nowa ścieżka dotyczy tylko nowych plików: to, co już jest w starym folderze, nie jest przenoszone, więc skopiuj to samodzielnie.

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="paths" %}
