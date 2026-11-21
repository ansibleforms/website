---
layout: default
title: Copias de seguridad y retención
parent: Variables de entorno
nav_order: 3
translated_from: ce6a769abd4e2fa8cb270d1280019cb15953de25
---

# Copias de seguridad y retención
{: .no_toc }

Los comandos de copia de seguridad, y cuánto tiempo se conservan las copias, los trabajos y los registros de auditoría
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables para controlar cuánto historial conserva la base de datos y cuántas copias de seguridad se quedan en disco.

---

## Ejemplo

Conserva los trabajos terminados durante 90 días y el registro de auditoría durante dos años. En el `.env` del proyecto compose:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Una tarea diaria elimina los trabajos terminados más antiguos que esto a las 2:30 y las entradas de auditoría a las 3:30. Un trabajo en ejecución, o uno que espera
aprobación, nunca se elimina. Desde la 7.7.0 `STORED_JOB_UNUSED_DAYS` también elimina, a las 4:00, los [trabajos
guardados](../jobs/stored-jobs.html#when-it-is-removed) desde los que no se ha lanzado ningún trabajo durante esos días. Estas variables
se aplican sin reiniciar cuando se cambian en la página de configuración.

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="retention" %}
