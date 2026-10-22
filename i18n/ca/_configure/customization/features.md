---
layout: default
title: Funcions
parent: Variables d'entorn
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Funcions
{: .no_toc }

El dissenyador, MCP, el xat, la validació del llançament, la llista de tasques, les mètriques, l'API d'AWX i el registre de consultes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables per activar o desactivar parts opcionals de l'aplicació.

---

## Exemple

Serveix el servidor MCP per a agents d'IA i imposa les regles de validació del formulari a cada llançament. Al `.env` del projecte compose:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` i `ENABLE_CHAT` s'apliquen sense reiniciar: es llegeixen a cada petició, així que les pots activar a la
pàgina de configuració. Mentre una està desactivada, el seu endpoint (`/api/v2/mcp` o `/api/v2/chat`) respon `404`.

Executa primer `LAUNCH_VALIDATION=log` durant un temps: registra el que `enforce` rebutjaria, sense rebutjar-ho. Vegeu [MCP](../mcp/)
i [Registrar i imposar](../launch-validation/log-and-enforce.html).

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="features" %}
