---
layout: default
title: Registro
parent: Variables de entorno
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Registro
{: .no_toc }

Niveles de log, archivos, syslog y colores de la consola
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables para ajustar cuánto se registra, adónde van los archivos de log o para mostrar las marcas de tiempo en tu propia zona horaria.

---

## Ejemplo

Registra más en los archivos que en la consola, y muestra las marcas de tiempo del log y de los trabajos en hora de Ámsterdam.
En el `.env` del proyecto compose:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Los servidores syslog ya no se configuran aquí: añádelos en **Configuración > Conexiones > Syslog**, consulta [Logs](../production/logs.html#syslog).
Las variables `LOG_SYSLOG_*` de abajo están obsoletas desde la 7. El primer arranque que encuentra `LOG_SYSLOG_HOST` definida las importa
una vez como el servidor syslog `syslog`, que recibe el registro del servidor, y a partir de entonces las ignora.

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="logging" %}
