---
layout: default
title: Configuración
parent: Variables de entorno
nav_order: 5
translated_from: c9a671f461916975daeaea7f637658b569946f76
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
3. Si no, el archivo de [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Desde 7.8.0 una clave que contiene un repositorio se superpone a esta base: el repositorio con el tipo de uso **Roles**, **Categorías** o
**Constantes** da esa clave desde su archivo que da `controller_roles:`, `controller_categories:` o `controller_constants:`, y si no desde
su `config.yaml` (obsoleto). Consulta [Configuración en git](../repositories/config-as-code.html#roles-categories-and-constants).

Un `ENABLE_CONFIG_IN_DATABASE` definido explícitamente siempre gana, incluso `0` frente a un `database` guardado. Se lee cada vez que
se carga la configuración, así que un cambio se aplica sin reiniciar. La página **Estado** muestra el origen en uso en su pestaña **Información**.

La copia en la base de datos es la columna `config_yaml` de la tabla `settings`, llamada `forms_yaml` antes de la 7.6.0: la actualización
la renombra y conserva su contenido. `GET /api/v2/settings/config` la devuelve como `config_yaml`, y también como `forms_yaml`, obsoleta.

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="configuration" %}
