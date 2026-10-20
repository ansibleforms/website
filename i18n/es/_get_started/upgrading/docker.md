---
layout: default
title: Docker
parent: Actualizar
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Actualiza un contenedor independiente, sin docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Una instalación independiente se actualiza sustituyendo sus contenedores: descarga las nuevas imágenes, elimina los contenedores antiguos y
arranca otros nuevos con los mismos comandos `run`. Desde la versión 7 hay dos: AnsibleForms y el RTE que ejecuta los
playbooks, siempre en la misma release. Tus archivos se guardan en la carpeta montada `/app/dist/persistent` y tus datos en
MySQL, así que ambos se conservan.

---

## Antes de actualizar

Prepara la actualización para poder volver atrás si algo sale mal:

* **Haz una copia de seguridad** en **Configuración → Copias de seguridad**. La nueva release actualiza el esquema de la base de datos en su primer arranque.
* **Lee el [registro de cambios](../changelog)** de las releases entre tu versión y la nueva.
* **¿Pasas a una nueva versión mayor?** Sigue primero [Actualizar a la v7](../upgrade-7.html).
* **¿Vienes de la 6.5?** Las imágenes de la 7 se ejecutan con el uid 1000 en lugar de root: dale a ese usuario las carpetas que montas, una vez, por
  ejemplo `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **¿Vienes de la 7.2?** El RTE recibe un archivo propio y la aplicación lo llama: consulta primero [De la 7.2 a la 7.3](#from-72-to-73).

---

## De la 7.2 a la 7.3

Hasta la 7.2.0, el RTE leía el archivo de entorno de la aplicación, con los ajustes de la base de datos, y se añadía a sí mismo como runner a partir de `RTE_URL`. Eso
es el modo database, obsoleto en la 7.3.0 y eliminado en la 8.0.0. Desde la 7.3.0, la aplicación llama al RTE y mantiene abierto un WebSocket
(`RTE_MODE=inbound`, consulta [Modos](../rte/modes.html)), y el RTE no tiene ajustes de base de datos. Una vez, antes del paso 2:

1. Crea `/srv/apps/ansibleforms/rte.env` como hace la [instalación](../installation/docker.html#prepare-the-folders), con
   `RTE_MODE=inbound`, el mismo `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` y `HTTPS=0`. Sin `DB_*`, sin `ENCRYPTION_SECRET`, sin `RTE_URL`
2. Declara el runner en ese modo. O bien añade la [semilla de configuración](../seed/) de la instalación, `persistent/seed.yaml` con la credencial de RTE
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) y el runner `rte` (`rte_mode: inbound`), y añade
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` al archivo de entorno de la aplicación. O bien, sin semilla, abre el runner en
   **Conexiones → Runners**, pon su **Modo** en **Entrante** y elige una credencial de RTE que contenga `http://rte:8000` y el token

Con la semilla, el archivo de entorno de la aplicación también contiene `RTE_TOKEN`, el mismo token, ya que la semilla lo lee de ahí.

---

## 1. Descarga las nuevas imágenes

Descarga las imágenes más recientes de AnsibleForms y del RTE de la etiqueta que ejecutas:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Sustituye los contenedores

Elimina los contenedores antiguos y arranca otros nuevos con los comandos `run` de la [instalación](../installation/docker.html). La aplicación
lee la conexión a la base de datos de su archivo de entorno, con el usuario de base de datos de AnsibleForms (no root). El RTE lee su propio
`rte.env`, sin los ajustes de la base de datos, y la aplicación lo llama a través de una red que comparten ambos contenedores:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Si vienes de la 6.5, todavía no hay contenedor del RTE: los comandos `stop` y `rm` solo encuentran la aplicación. Crea la red compartida
una vez con `docker network create ansibleforms` (o `podman network create ansibleforms`). Como hace la
[instalación](../installation/docker.html#prepare-the-folders), pon la conexión a la base de datos, `ENCRYPTION_SECRET`, un `RTE_TOKEN`
de al menos 16 caracteres y `CONFIG_SEED_PATH` en el archivo de entorno de la aplicación, y crea `rte.env` y la semilla de configuración. Usa tus propias
carpetas donde tu instalación 6.5 montaba otras. La semilla añade el RTE en **Conexiones → Runners** como el runner predeterminado `rte`;
consulta [Actualizar a la v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Comprueba la actualización

Sigue el log de AnsibleForms mientras arranca. El primer arranque de una nueva release actualiza el esquema de la base de datos:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

El RTE escribe su propio log, que muestra `docker logs rte`. En AnsibleForms, **Ayuda → Acerca de** muestra la versión que se está ejecutando, y **Configuración → Estado** muestra el estado de la
base de datos, del esquema y de los demás sistemas de los que depende AnsibleForms.

---

## Volver atrás

Para volver a la release que ejecutabas antes, la versión que mostraba **Ayuda → Acerca de** antes de la actualización, vuelve a ejecutar el paso 2 con
su etiqueta exacta en lugar de `7`, tanto en la imagen de AnsibleForms como en la del RTE. Si esa release no arranca sobre la base de datos
actualizada, restaura la copia de seguridad que hiciste en **Configuración → Copias de seguridad**.
