---
layout: default
title: Configuración
parent: Variables de entorno
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
---

# Configuración
{: .no_toc }

La semilla de configuración, dónde se guarda la configuración, git e ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables para decidir de dónde sale la configuración: una semilla de configuración, la base de datos, git o plantillas ytt.

---

## Ejemplo

Aplica una semilla de configuración montada, compruébala cada cinco minutos y guarda `config.yaml` en la base de datos. En `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Una semilla no válida impide que el servidor arranque. Consulta [Semilla de configuración](../seed/) para el formato del archivo.

---

## De dónde se lee config.yaml

Las categorías, los roles y las constantes salen de `config.yaml` en disco o de su copia en la base de datos, decidido en este orden:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), cuando está definida, en el entorno o en la
   pestaña **Configuración** de la página de configuración: `1` lee la base de datos, `0` lee el archivo.
2. Si no, el origen de configuración guardado en la base de datos (`file` o `database`), que las instancias configuradas
   antes de la 6.3.0 eligieron en la página de configuración.
3. Si no, el archivo: el `config.yaml` del repositorio con **¿Usar para configuración?** activado, si no el de un repositorio con
   **¿Usar para formularios?** activado, y si no el de [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Un `ENABLE_CONFIG_IN_DATABASE` definido explícitamente siempre gana, incluso `0` frente a un `database` guardado. Se lee cada vez que
se carga la configuración, así que un cambio se aplica sin reiniciar. La página **Estado** muestra el origen en uso en su pestaña **Información**.

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="configuration" %}
