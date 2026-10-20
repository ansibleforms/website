---
layout: default
title: Funciones
parent: Variables de entorno
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Funciones
{: .no_toc }

El diseñador, MCP, el chat, la validación del lanzamiento, la lista de trabajos, las métricas, la API de AWX y el registro de consultas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables para activar o desactivar partes opcionales de la aplicación.

---

## Ejemplo

Sirve el servidor MCP para agentes de IA e impone las reglas de validación del formulario en cada lanzamiento. En el `.env` del proyecto compose:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` y `ENABLE_CHAT` se aplican sin reiniciar: se leen en cada petición, así que puedes activarlas en la
página de configuración. Mientras una está desactivada, su endpoint (`/api/v2/mcp` o `/api/v2/chat`) responde `404`.

Ejecuta primero `LAUNCH_VALIDATION=log` durante un tiempo: registra lo que `enforce` rechazaría, sin rechazarlo. Consulta [MCP](../mcp/)
y [Registrar e imponer](../launch-validation/log-and-enforce.html).

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="features" %}
