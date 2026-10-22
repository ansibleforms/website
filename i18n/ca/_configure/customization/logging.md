---
layout: default
title: Registre
parent: Variables d'entorn
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Registre
{: .no_toc }

Nivells de registre, fitxers, syslog i colors de la consola
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Canvia aquestes variables per ajustar quant es registra, on van els fitxers de registre, o per mostrar les marques de temps a la teva pròpia zona horària.

---

## Exemple

Registra més als fitxers que a la consola, i mostra les marques de temps del registre i de les tasques en hora d'Amsterdam.
Al `.env` del projecte compose:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Els servidors syslog ja no es configuren aquí: afegeix-los a **Configuració > Connexions > Syslog**, vegeu [Registres](../production/logs.html#syslog).
Les variables `LOG_SYSLOG_*` de sota estan obsoletes des de la 7. La primera arrencada que troba `LOG_SYSLOG_HOST` definida les importa
una sola vegada com el servidor syslog `syslog`, que rep el registre del servidor, i a partir d'aleshores les ignora.

---

## Variables

Totes les variables d'aquest grup, amb el seu tipus, el seu valor predeterminat i la seva descripció:

{% include env_vars_table.html group="logging" %}
