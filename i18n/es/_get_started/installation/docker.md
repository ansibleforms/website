---
layout: default
title: Docker
parent: Instalación
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Ejecuta las imágenes de la aplicación y del RTE de AnsibleForms con Docker o Podman, junto a un servidor MySQL propio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Puedes ejecutar AnsibleForms con Docker o Podman como dos contenedores, la aplicación y el RTE que ejecuta los playbooks, conectados a una base de datos MySQL.

---

## Requisitos previos

Antes de empezar, necesitas:

* **Docker o Podman** : uno de los dos instalado y en marcha
* **MySQL** : instalado y en marcha

---

## Instalar MySQL

Instala MySQL 8+, o MariaDB, en un servidor Linux al que pueda llegar el contenedor:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu incluye MySQL 8:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian incluye MariaDB en lugar de MySQL, que AnsibleForms también admite:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 y posteriores, y sus recompilaciones, incluyen MySQL 8 en AppStream:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms se conecta a la base de datos por la red, como `DB_USER` con `DB_PASSWORD`. Dale un usuario propio, con permisos solo sobre
el esquema `AnsibleForms`, no root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Es todo lo que AnsibleForms necesita: con él crea y parchea su esquema y hace sus copias de seguridad. La página **Estado** y el log
avisan cuando el usuario tiene permisos sobre todas las bases de datos. En Ubuntu y Debian el servidor solo escucha en localhost: define `bind-address` en su
configuración para que los contenedores puedan llegar a él.

---

## Preparar las carpetas

AnsibleForms 7 se ejecuta en dos contenedores: la aplicación y el RTE (entorno de ejecución) que ejecuta los playbooks. Ambos montan una carpeta para
tu `config.yaml`, formularios, playbooks, logs y certificados, y una carpeta para la clave SSH. Las imágenes se ejecutan como el usuario `node` (uid 1000),
así que dale a ese usuario las dos carpetas:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Pon los ajustes de la aplicación en un archivo de entorno: la conexión a la base de datos,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) antes de guardar ninguna credencial, el token que comparten la aplicación y el
RTE ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), de al menos 16 caracteres) y la semilla de configuración que declara el RTE:

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

El RTE tiene su propio archivo, sin los ajustes de la base de datos: desde la 7.3.0 la aplicación se conecta a él y mantiene un WebSocket abierto
(`RTE_MODE=inbound`, consulta [Modos](../rte/modes.html)), y ejecuta los playbooks desde las mismas carpetas (`RTE_FILES=local`):

```bash
sudo tee /srv/apps/ansibleforms/rte.env > /dev/null <<'END'
RTE_MODE=inbound
RTE_TOKEN=<the same token>
RTE_FILES=local
PORT=8000
HTTPS=0
END
sudo chmod 600 /srv/apps/ansibleforms/rte.env
```

La [semilla de configuración](../seed/) declara una credencial RTE con la dirección del RTE y su token, y el runner predeterminado `rte` que inicia
sesión con ella:

```bash
sudo tee /srv/apps/ansibleforms/persistent/seed.yaml > /dev/null <<'END'
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
END
sudo chown 1000:1000 /srv/apps/ansibleforms/persistent/seed.yaml
```

---

## Arrancar los contenedores

Ejecuta las imágenes publicadas del GitHub Container Registry (consulta [Etiquetas de imagen](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) para la aplicación y
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) para el RTE.

La semilla añade el RTE en **Conexiones > Runners** como el runner `rte`, el predeterminado, así que los formularios de playbook se ejecutan en él sin más
configuración. La aplicación crea el esquema en su primer arranque y se conecta al RTE en cuanto ambos están en marcha (hay un `config.yaml` de ejemplo en el
[proyecto de docker-compose](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

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

Una vez arrancados, aparecen los dos contenedores:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman acepta las mismas opciones y no necesita un servicio:

```bash
podman network create ansibleforms

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

Una vez arrancados, aparecen los dos contenedores:

```bash
podman ps
```

</div>
</div>

La aplicación escucha en el puerto `8000`, por HTTP salvo que definas `HTTPS=1`. El RTE no se publica en el host: solo la aplicación se conecta a él, dentro
de la red. `--stop-timeout 30` da tiempo al RTE para que terminen sus playbooks en ejecución al pararlo (consulta
[Ejecutar un RTE](../rte/run.html) para los ajustes del RTE y para construir un RTE propio).

---

## Probar la aplicación

Cuando los contenedores estén en marcha, abre AnsibleForms en un navegador:

* Abre `http://your_ip:8000` (o HTTPS, si definiste `HTTPS=1`)
* Inicia sesión como `admin` / `AnsibleForms!123` (o con la contraseña que definiste con `ADMIN_PASSWORD`) y elige una contraseña nueva
* Comprueba en **Conexiones > Runners** que el RTE aparece como `rte`, el runner predeterminado, y que su página muestra su
  **Conexión** como **Conectado**
* Siguientes pasos:
  * Crea formularios añadiendo archivos YAML a la carpeta `forms` o usando el diseñador integrado
  * Añade tus playbooks a la carpeta `playbooks` de la carpeta persistente montada
  * Añade una conexión LDAP
  * Añade usuarios y grupos
  * Añade runners para los formularios de plantilla: AWX, AAP o Ascender, Semaphore, Rundeck o Jenkins
  * Añade credenciales para conexiones externas, como otros servidores MySQL o APIs REST, o para pasarlas a los playbooks de Ansible
