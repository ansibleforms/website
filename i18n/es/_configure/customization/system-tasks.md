---
layout: default
title: Tareas del sistema
parent: Variables de entorno
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Tareas del sistema
{: .no_toc }

Cuándo se ejecutan las limpiezas, la copia nocturna y los bucles del hub de runners
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables para mover las [tareas del sistema](../jobs/system-tasks.html) a otras horas, o para ejecutar los bucles del hub de runners más o menos a menudo.

---

## Ejemplo

Haz la copia a la 1:00, limpia los trabajos a la 1:30 y envía los trabajos a los runners cada 5 segundos. En el `.env` del proyecto compose:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Una variable `_CRON` admite un cron de 5 campos (minuto, hora, día, mes y día de la semana) en la zona horaria del servidor,
[`LOG_TZ`](logging.html#env_LOG_TZ). La pestaña **Programación** de cada tarea, en **Trabajos > Sistema**, escribe su variable y la aplica
a la vez en todos los nodos, sin reiniciar. La recarga del config seed tiene la suya,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), con las variables de la semilla de configuración.

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="system-tasks" %}
