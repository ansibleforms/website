---
layout: default
title: Desde el código fuente
parent: Instalación
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# Desde el código fuente
{: .no_toc }

Compila AnsibleForms desde el código fuente y ejecútalo con Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cómo está organizado el código

El repositorio contiene dos aplicaciones Node.js, y una compilación las combina en una:

* **client** : la interfaz web, escrita en Vue 3 y compilada en archivos estáticos con Vite
* **server** : la API, escrita en Express. Entrega los trabajos a los runners, se conecta a la base de datos y sirve el cliente compilado.
  Arrancado con `AF_ROLE=rte`, el mismo servidor es el RTE (entorno de ejecución) que ejecuta los playbooks

Solo se compila el cliente; su salida va a la carpeta `views` del servidor, como en la [imagen de Docker](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile).

---

## Requisitos previos

Compilar y ejecutar desde el código fuente requiere buenos conocimientos de Linux y algo de Node.js. Instalas tú mismo cada componente. Para
ejecutar AnsibleForms sin contenedores y sin compilarlo, la [instalación nativa](native.html) del instalador hace todo esto por ti:

* **Node.js 26** (la versión de `.nvmrc`; 24 como mínimo), con npm
* **Git**, para obtener el código y sincronizar repositorios
* **Cliente OpenSSH**, para git por SSH, y **sshpass**, para playbooks que se conectan con una contraseña SSH
* **Cliente MariaDB** (`mariadb`, `mariadb-dump`), para copias de seguridad y restauraciones, también con un servidor MySQL
* **MySQL 8+ o MariaDB**, accesible desde el servidor
* **Ansible**, para el proceso RTE que ejecuta los playbooks (`ansible-playbook` en su path). El proceso de la aplicación no necesita
  Ansible ni Python, y con solo formularios de plantilla (AWX, AAP, Ascender y los demás runners) no necesitas ningún RTE

Instálalos para tu distribución:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 viene del repositorio de NodeSource, las demás herramientas del propio Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 viene del repositorio de NodeSource, las demás herramientas del propio Debian:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js viene de NodeSource y `sshpass` de EPEL (en el propio RHEL, activa EPEL como documenta Red Hat):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Comprueba `node --version` (26) y `ansible-playbook --version`; para la base de datos y su usuario, consulta [Instalar MySQL](docker.html#install-mysql).

---

## Obtener el código

Clona el repositorio en una carpeta de tu elección, propiedad del usuario que ejecutará la aplicación. Los ejemplos usan `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Compilar

Compila en tres pasos, desde la carpeta del repositorio. Primero compila el cliente:

```bash
cd client
npm ci
npm run build
```

Después instala las dependencias del servidor:

```bash
cd ../server
npm ci --omit=dev
```

Por último copia el cliente compilado en la carpeta `views` del servidor:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configurar

El servidor lee sus ajustes de variables de entorno y, en producción, también de `server/persistent/.env`, el archivo
en el que escriben las páginas de ajustes.

Parte del archivo de ejemplo de la raíz del repositorio y define al menos la conexión a MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Todas las variables se describen en [Variables de entorno](../customization). Todo lo demás se guarda por defecto en `server/persistent`:
`config.yaml`, la carpeta `forms` y los certificados autofirmados se crean allí en el primer arranque, junto a los logs.
Pon tus playbooks en `server/persistent/playbooks`, o apunta `ANSIBLE_PATH` a otro sitio en el entorno del RTE, que es quien la lee.

---

## Ejecutar

Ejecuta AnsibleForms en producción, o en modo desarrollo para trabajar en el propio código:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Producción</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Desarrollo</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Arranca el servidor en modo producción desde la carpeta `server`:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Una aplicación arrancada desde la línea de comandos se detiene al cerrar la sesión. [PM2](https://pm2.keymetrics.io/) la mantiene en marcha en
segundo plano, la reinicia tras un fallo y la vuelve a arrancar al iniciar el sistema:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Los playbooks se ejecutan en un RTE: arranca el mismo servidor una segunda vez con `AF_ROLE=rte`, en un puerto propio. La aplicación se conecta a él y mantiene
un WebSocket abierto (`RTE_MODE=inbound`, consulta [Modos](../rte/modes.html)), y ejecuta los playbooks desde las mismas carpetas
(`RTE_FILES=local`). También lee `persistent/.env`, pero no usa ninguno de sus ajustes de base de datos. Añade a `persistent/.env` el token que comparten la aplicación y el RTE,
de al menos 16 caracteres, y la semilla de configuración que declara el RTE:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

La [semilla de configuración](../seed/) declara una credencial RTE con la dirección del RTE y su token, y el runner predeterminado `rte` que inicia
sesión con ella:

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Sin semilla, añádelos en **Conexiones > Credenciales** (una credencial RTE con esa dirección y el token) y
**Conexiones > Runners** (tipo RTE, **Modo** **Entrante**). Después arranca el RTE, solo en `127.0.0.1`:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

Los ajustes del RTE se describen en la página [Ejecutar un RTE](../rte/run.html). Comprueba que PM2 lista los dos procesos:

```bash
pm2 status
```

Ambos están `online`:

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

Para trabajar en el propio código, arranca todo desde la raíz del repositorio con recarga en vivo: el servidor en el puerto 3001, un RTE en el puerto 8010
y el cliente en `https://localhost:8443`. En este modo, el servidor y el RTE leen `server/.env.development` en su lugar:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

El RTE (`npm run dev:rte`) necesita `ansible-playbook` en el path, y se añade a sí mismo como runner en modo base de datos, obsoleto, solo para
desarrollo; `npm run dev:local` arranca el cliente y el servidor sin él. La [guía de contribución](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) describe las pruebas y comprobaciones que hay que ejecutar.

</div>
</div>

---

## Primera ejecución

Abre el servidor en un navegador (con el `.env` de ejemplo, `https://your_ip:8443`). Con una base de datos vacía, el esquema se crea en el
primer arranque.

Las credenciales predeterminadas del admin son:

* nombre de usuario : `admin`
* contraseña : `AnsibleForms!123`
