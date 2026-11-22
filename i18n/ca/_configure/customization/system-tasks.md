---
layout: default
title: Processos del sistema
parent: Variables d'entorn
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Processos del sistema
{: .no_toc }

Quan s'executen les neteges, la còpia nocturna i els bucles del hub de runners
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables per moure els [processos del sistema](../jobs/system-tasks.html) a altres hores, o per executar els bucles del hub de runners més o menys sovint.

---

## Exemple

Fes la còpia a la 1:00, neteja les tasques a la 1:30 i lliura les tasques als runners cada 5 segons. Al `.env` del projecte compose:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Una variable `_CRON` pren un cron de 5 camps (minut, hora, dia, mes i dia de la setmana) a la zona horària del servidor,
[`LOG_TZ`](logging.html#env_LOG_TZ). La pestanya **Programació** de cada procés, a **Tasques > Sistema**, escriu la seva variable i
l'aplica de seguida a cada node, sense reiniciar. La recàrrega de la llavor de configuració té la seva,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), amb les variables de la llavor de configuració.

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="system-tasks" %}
