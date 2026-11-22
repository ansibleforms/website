---
layout: default
title: Procesy systemowe
parent: Zmienne środowiskowe
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Procesy systemowe
{: .no_toc }

Kiedy działają czyszczenia, nocna kopia zapasowa i pętle huba runnerów
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, aby przenieść [procesy systemowe](../jobs/system-tasks.html) na inne godziny albo uruchamiać pętle huba runnerów częściej lub rzadziej.

---

## Przykład

Wykonuj kopię zapasową o 1:00, czyść zadania o 1:30 i przekazuj zadania runnerom co 5 sekund. W `.env` projektu compose:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Zmienna `_CRON` przyjmuje cron z 5 polami (minuta, godzina, dzień, miesiąc i dzień tygodnia) w strefie czasowej serwera,
[`LOG_TZ`](logging.html#env_LOG_TZ). Karta **Harmonogram** każdego procesu, w **Zadania > System**, zapisuje jego zmienną i od razu
stosuje ją na każdym węźle, bez restartu. Ponowne wczytanie config seed ma własną,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), razem ze zmiennymi config seed.

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="system-tasks" %}
