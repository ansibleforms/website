---
layout: default
title: Docker Compose
parent: Actualizar
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Actualiza una instalación hecha con el proyecto docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El proyecto docker-compose ejecuta tres contenedores: MySQL (`mysqldb`), AnsibleForms (`app`) y el RTE que ejecuta los
playbooks (`rte`). AnsibleForms y el RTE usan la etiqueta de imagen `7`, que siempre apunta a la release 7.x más reciente. Una
actualización vuelve a descargar las imágenes y vuelve a crear los contenedores cuya imagen ha cambiado. Todo lo que debe persistir se guarda
en la carpeta `data` y se conserva.

---

## Antes de actualizar

Prepara la actualización para poder volver atrás si algo sale mal:

* **Haz una copia de seguridad** en **Configuración → Copias de seguridad**. La nueva release actualiza el esquema de la base de datos en su primer arranque.
* **Lee el [registro de cambios](../changelog)** de las releases entre tu versión y la nueva.
* **¿Pasas a una nueva versión mayor?** Sigue primero [Actualizar a la v7](../upgrade-7.html).
* **¿Vienes de la 6.5?** El proyecto 6.x, en su rama `v6`, no tiene contenedor `rte`. Actualiza tu copia del proyecto a
  su rama `main`, conservando tus ajustes de `.env` y tu carpeta `data`, para que `docker-compose.yml` tenga el servicio
  `rte`. Ese archivo compose define `CONFIG_SEED_PATH`, y una carpeta `data` de la 6.x no tiene `seed.yaml`: copia `data/seed.yaml` del
  repositorio, y añade `RTE_TOKEN` (al menos 16 caracteres) a tu `.env`, como lo tiene el `.env` del repositorio. Sin ellos la
  aplicación se niega a arrancar. Las imágenes de la 7 se ejecutan con el uid 1000 en lugar de root: dale a ese usuario la carpeta `data` una vez, dejando los archivos
  de MySQL a MySQL, con `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  La carpeta `data/ssh` se monta ahora en `/home/node/.ssh` en lugar de en `/root/.ssh`.
* **¿Vienes de la 7.2?** Actualiza `docker-compose.yml` y `data/seed.yaml` a la vez: consulta primero [De la 7.2 a la 7.3](#from-72-to-73).

---

## De la 7.2 a la 7.3

Hasta la 7.2.0, el servicio `rte` recibía los ajustes de la base de datos y su runner, declarado en `data/seed.yaml`, funcionaba en modo database,
obsoleto en la 7.3.0 y eliminado en la 8.0.0. Desde la 7.3.0, la aplicación llama al RTE en `http://rte:8000` y mantiene abierto un WebSocket
(`RTE_MODE=inbound`, consulta [Modos](../rte/modes.html)), y el RTE no tiene ajustes de base de datos. Coge ambos archivos de la rama
`main` del repositorio, conservando tu `.env`:

| Archivo | Qué cambia |
|---|---|
| `docker-compose.yml` | El servicio `rte` ya no lee `.env`: recibe `RTE_MODE=inbound`, `RTE_TOKEN` y `RTE_FILES=local`, y ningún `DB_*` |
| `data/seed.yaml` | Una credencial de RTE `rte`, con `url: http://rte:8000` y `password: ${RTE_TOKEN}`, y el runner `rte` con `rte_mode: inbound` y `credential: rte` |

Cambia los dos. Con solo el nuevo archivo compose, la semilla mantiene el runner `rte` en modo database: la aplicación llama al RTE como a uno de la 7.2,
al que el nuevo RTE no responde, y no se ejecuta ningún playbook. Una semilla que hayas cambiado tú necesita la misma credencial y el mismo `rte_mode`.

Un runner que creó la semilla sigue gestionado, de solo lectura en **Conexiones → Runners**, incluso después de quitar `CONFIG_SEED_PATH`: solo una
semilla que se aplica libera un runner que ya no declara. Así que conserva la semilla y pon allí `rte_mode`, en lugar de quitar
`CONFIG_SEED_PATH` para cambiar el runner a mano.

El [instalador](../installation/installer.html#upgrade) lo hace por sí solo: su actualización sustituye `docker-compose.yml`, y `data/seed.yaml`
cuando es uno que trajo el repositorio, sin cambios. Uno cambiado a mano se conserva, y el nuevo se guarda a su lado.

---

## 1. Descarga las nuevas imágenes

Descarga las imágenes más recientes de las etiquetas de `docker-compose.yml`:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Vuelve a crear los contenedores

Vuelve a arrancar el proyecto; los contenedores cuya imagen ha cambiado se vuelven a crear:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Comprueba la actualización

Sigue el log de AnsibleForms mientras arranca. El primer arranque de una nueva release actualiza el esquema de la base de datos, y el RTE
arranca en cuanto AnsibleForms está sano:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

En AnsibleForms, **Ayuda → Acerca de** muestra la versión que se está ejecutando, y **Configuración → Estado** muestra el estado de la
base de datos, del esquema y de los demás sistemas de los que depende AnsibleForms.

---

## Volver atrás

Para volver a la release que ejecutabas antes, la versión que mostraba **Ayuda → Acerca de** antes de la actualización, fija su etiqueta exacta en
`docker-compose.yml` tanto en la imagen de AnsibleForms como en la del RTE, en lugar de `7`, y vuelve a ejecutar el paso 2. Si esa release
no arranca sobre la base de datos actualizada, restaura la copia de seguridad que hiciste en **Configuración → Copias de seguridad**. Vuelve a poner las etiquetas en
`7` para volver a recibir actualizaciones.

**VÍDEO**: [Cómo actualizar AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
