---
layout: default
title: Còpies de seguretat i retenció
parent: Variables d'entorn
nav_order: 3
translated_from: 76f81cfa15eaa98199a3d5963f7adc9a6f8b01dc
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
```

Una tasca diària elimina les tasques acabades més antigues que això a les 2:30 de la matinada i les entrades d'auditoria a les 3:30. Una tasca en execució, o una que espera
aprovació, no s'elimina mai. Totes dues variables s'apliquen sense reiniciar quan es canvien a la pàgina de configuració.

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="retention" %}
