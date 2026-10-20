---
layout: default
title: Docker Compose
parent: Instalación
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

Instala AnsibleForms, su RTE y MySQL juntos con docker-compose o podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El [proyecto de docker-compose](https://github.com/ansibleforms/docker) ejecuta tres contenedores: MySQL, la aplicación AnsibleForms y el RTE
(entorno de ejecución) que ejecuta los playbooks. Contiene sus ajustes, formularios y playbooks de ejemplo, así que el único otro requisito es
Docker o Podman con su herramienta de compose.

El [instalador](installer.html) descarga este proyecto, rellena sus ajustes y secretos y lo arranca con un solo comando. Esta página
lo monta a mano.

---

## Requisitos previos

Antes de empezar, necesitas:

* **Máquina Linux** : cualquier distribución, con CPU y memoria modestas
* **Acceso a GitHub** : para descargar o clonar el proyecto de docker-compose desde GitHub
* **Docker o Podman** : un motor de contenedores, que se instala más abajo
* **Una herramienta de compose** : Docker Compose o podman-compose, para arrancar los tres contenedores a partir de unos pocos archivos de configuración

**VÍDEO**: [Cómo instalar AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Elegir dónde instalar

Crea una carpeta para el proyecto; los ejemplos usan `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Clonar el proyecto de docker-compose

Instala Git:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

Después clona el proyecto de docker-compose en esa carpeta:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Asignar los permisos adecuados

La aplicación y el RTE se ejecutan como el usuario `node` (uid 1000), así que dale a ese usuario la carpeta `data`:

```bash
sudo chown -R 1000:1000 ./data
```

Si vienes de la 6, cuyo contenedor se ejecutaba como root, ejecuta el mismo `chown` una vez antes de arrancar la 7. MySQL recupera su propia carpeta al arrancar.

---

## Instalar un motor de contenedores

Instala Docker o Podman, cada uno con su herramienta de compose:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Instala Docker Engine con el plugin Compose desde el repositorio de Docker
(consulta los [manuales de instalación de Docker](https://docs.docker.com/engine/install)):

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

Después permite que los nombres se resuelvan dentro de los contenedores, y arranca Docker como servicio:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman no necesita un servicio. Instálalo junto con podman-compose:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## Personalizar

Revisa las variables de los archivos `.env` y `docker-compose.yml`, y cambia todas las contraseñas: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` y `RTE_TOKEN`. [Más información sobre las variables de entorno](../customization)

La aplicación se conecta a MySQL como `ansibleforms` (`MYSQLDB_USER`), con todos los permisos sobre el esquema `AnsibleForms` y ninguno
en otro sitio; root es solo para el propio MySQL. MySQL crea ese usuario solo en su primer arranque: una instalación que hasta ahora se conectaba como root
lo crea una vez, como muestra el [README](https://github.com/ansibleforms/docker#database) del proyecto.

El RTE no se publica en el host. Desde la 7.3.0 la aplicación se conecta a él en `http://rte:8000` con `RTE_TOKEN` y mantiene un WebSocket abierto
(`RTE_MODE=inbound`, consulta [Modos](../rte/modes.html)): el RTE no recibe ajustes de base de datos ni el `.env`, solo su token y unos pocos
ajustes propios en `docker-compose.yml`. La semilla de configuración `data/seed.yaml` declara una credencial RTE con el token y esa
dirección, y el runner predeterminado `rte`, en modo inbound, que inicia sesión con ella. El RTE ejecuta los playbooks desde la misma carpeta `data`
(`RTE_FILES=local`). Cuando tus playbooks necesiten más colecciones o librerías de Python, construye un RTE propio
y apunta el servicio `rte` a él (consulta [Construir tu propio RTE](../rte/images.html#build-your-own-rte)).

---

## Arrancar el proyecto de docker-compose

Arranca los tres contenedores en segundo plano. La aplicación espera a que MySQL esté sano y después se conecta al RTE:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## Probar la aplicación

Cuando los contenedores estén en marcha, abre AnsibleForms en un navegador:

* Abre `https://your_ip` (puerto 443, consulta `WEBAPP_LOCAL_PORT` en el archivo .env)
* Inicia sesión como `admin` con el `ADMIN_PASSWORD` del archivo `.env`; mientras siga siendo el predeterminado `AnsibleForms!123`, elige una contraseña nueva
* Comprueba en **Conexiones > Runners** que el RTE aparece como `rte`, el runner predeterminado, y que su página muestra su
  **Conexión** como **Conectado**
* Siguientes pasos:
  * Crea formularios añadiendo archivos YAML a la carpeta data/forms/ o usando el diseñador integrado
  * Añade tus playbooks a la carpeta data/playbooks/
  * Añade una conexión LDAP
  * Añade usuarios y grupos
  * Añade runners para los formularios de plantilla: AWX, AAP o Ascender, Semaphore, Rundeck o Jenkins
  * Añade credenciales para conexiones externas, como otros servidores MySQL o APIs REST, o para pasarlas a los playbooks de Ansible
  * Conecta repositorios Git y elige si tus formularios y/o playbooks se sincronizan con un repositorio

---

## Estructura de archivos

El proyecto de docker-compose tiene la siguiente estructura de carpetas:

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
