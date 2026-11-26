---
layout: default
title: Còpies de seguretat i retenció
parent: Variables d'entorn
nav_order: 3
translated_from: 1cac64b6467ce96bce3aac71718f07d7ecd10d89
---

# Còpies de seguretat i retenció
{: .no_toc }

Les ordres de còpia de seguretat, i quant de temps es conserven les còpies, les tasques i els registres d'auditoria
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables per controlar quant d'historial conserva la base de dades i quantes còpies de seguretat es queden al disc.

---

## Exemple

Conserva les tasques acabades durant 90 dies i el rastre d'auditoria durant dos anys. Al `.env` del projecte compose:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Una tasca diària elimina les tasques acabades més antigues que això a les 2:30 de la matinada i les entrades d'auditoria a les 3:30. Una tasca en execució, o una que espera
aprovació, no s'elimina mai. Des de la 7.7.0 `STORED_JOB_UNUSED_DAYS` també elimina, a les 4:00, les [tasques
desades](../jobs/stored-jobs.html#when-it-is-removed) des de les quals no s'ha llançat cap tasca durant aquests dies. Aquestes variables
s'apliquen sense reiniciar quan es canvien a la pàgina de configuració.

Aquestes hores són les predeterminades. Des de la 7.8.0 cada neteja, i la còpia nocturna, és un [procés del sistema](../jobs/system-tasks.html) a
**Tasques > Sistema**, on un administrador canvia quan s'executa i en veu les execucions; les variables de les seves hores són a
[Processos del sistema](system-tasks.html).

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="retention" %}
