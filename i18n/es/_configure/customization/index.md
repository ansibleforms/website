---
layout: default
title: Variables de entorno
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# Variables de entorno
{: .no_toc }

Configura AnsibleForms con variables de entorno
{: .fs-6 .fw-300 }

---

Para administradores que despliegan AnsibleForms: las variables de entorno que lee el servidor, agrupadas por tema.

AnsibleForms se ajusta con variables de entorno, tanto si se ejecuta con Docker Compose, en Kubernetes o desde el código fuente.

---

## De dónde salen los valores

El servidor lee cada variable de la primera de estas fuentes que la define, así que un valor más arriba en la lista siempre gana:

1. **El entorno del proceso**: `environment:` y `env_file:` en docker-compose (el `.env` del proyecto se pasa así),
   `env` y `envFrom` en Kubernetes, o la shell que arranca `node`.
2. **`persistent/.env`**, el archivo que escriben las páginas de configuración (`data/.env` en el proyecto docker-compose, otra ruta con
   `MANAGED_ENV_PATH`). Se lee en cada arranque, también en producción, y nunca sobrescribe una variable que ya está definida.
3. **`server/.env.<NODE_ENV>`**, por ejemplo `.env.development`. Solo se lee cuando `NODE_ENV` no es `production` (o con
   `FORCE_DOTENV=1`), en la práctica al ejecutar [desde el código fuente](../installation/from-source.html) en modo de desarrollo.
4. **El valor predeterminado integrado**, que aparece en las tablas de cada grupo.

Las páginas de configuración, en **Configuración > General**, muestran el valor vigente y guardan los cambios en `persistent/.env`. Muchas variables
se aplican en cuanto se guardan; las demás se guardan pero necesitan un reinicio, y la página las lista tras guardar. Una variable definida en
el entorno del proceso no se puede cambiar ahí: la página la muestra como *Definida en el entorno, no se puede cambiar aquí.*
Algunas variables, como `ENCRYPTION_SECRET` y `ACCESS_TOKEN_SECRET`, no se pueden cambiar nunca desde la página.

Las variables que lee un RTE, como `AF_ROLE`, `RTE_MODE`, `APP_URL` o `RTE_MAX_JOBS`, no están en las páginas de configuración: la
aplicación no las usa, así que defínelas en el entorno donde se ejecuta el RTE. Las variables `RTE_*` que lee la propia aplicación,
`RTE_QUEUE_MINUTES` y `RTE_FILES_MAX_MB`, son la excepción y siguen en las páginas. Cuatro variables del RTE, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` y `RTE_DRAIN_SECONDS`, se pueden definir por RTE en su página de runner, donde un valor gana a la
variable (consulta [La configuración de un RTE](../runners/runner-page.html#an-rtes-settings)).

Con [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` las páginas solo muestran los valores y se rechaza el guardado. Úsalo
cuando el entorno se declara en un manifiesto, como se describe en [Edición y auditoría](../seed/environment-and-audit.html).

La [semilla de configuración](../seed/) no define variables de entorno. Declara objetos que se guardan en la base de datos, y las
referencias `${ENV_VAR}` que contiene se resuelven a partir del entorno del servidor en ejecución.

Algunas variables solo se leen del entorno y no están en las tablas: `MANAGED_ENV_PATH` y `FORCE_DOTENV`, descritas
arriba, y las variables de proxy del sistema `HTTPS_PROXY` y `NO_PROXY` (también se leen en minúsculas). Un RTE outbound llama a la aplicación a través de
`HTTPS_PROXY`, y un RTE inbound envía su llamada de registro a través de él, salvo que el host de la aplicación esté en `NO_PROXY` (nombres de host,
sufijos `.domain`, o `*` para todos los hosts).

Las variables marcadas como <span class="af-badge af-badge-secret">Secreto</span> contienen una contraseña, un token o una clave: mantenlas fuera del control
de versiones, por ejemplo en un Secret de Kubernetes o en un archivo `.env` que no se haga commit.

---

## En esta sección

Las variables se agrupan por tema, con una página por grupo:

| Página | Qué trata |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Otras variables

Las siguientes variables todavía no están asignadas a ningún grupo:

{{ other }}
{% endif %}
