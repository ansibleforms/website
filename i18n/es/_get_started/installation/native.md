---
layout: default
title: Nativa
parent: Instalación
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Instalación nativa
{: .no_toc }

AnsibleForms directamente en el servidor, sin contenedores, como servicios systemd que configura el instalador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores de servidores donde no se permiten contenedores: el [instalador](installer.html) instala todo lo que AnsibleForms necesita en
el propio servidor, y después lo actualiza y lo elimina. Instala AnsibleForms 7.3.0 o posterior.

---

## Qué necesita

Elige **Directly on this server, no containers** en el paso **Engine** del instalador, o pasa `--mode native`. Necesita:

* **Root** : ejecuta el instalador con `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : los servicios se ejecutan como unidades de systemd
* **Un Linux compatible** : Ubuntu, Debian, RHEL y sus recompilaciones como Rocky Linux y AlmaLinux, SUSE Linux Enterprise u openSUSE
* **amd64 o arm64**
* **Acceso a Internet** : a los repositorios de la distribución, GitHub, nodejs.org y los índices de paquetes de Python y Ansible (consulta
  [Sin conexión](#air-gapped) para saber qué sustituye un bundle de release)

En un servidor que no cumpla esto, el motor aparece como *Directly on this server (needs root: run the installer with sudo)* o
*Directly on this server (not supported on this Linux)*. Ambos roles se instalan así: un controlador y un [Runner](installer.html#a-runner).

---

## Qué instala

El instalador instala lo siguiente desde los paquetes de la distribución, para ambos roles:

| Paquete | Por qué |
|---|---|
| `git` | Los repositorios |
| El cliente ssh | Las conexiones de los playbooks |
| El cliente de MariaDB | Las copias de seguridad de la aplicación: `app.env` pone en [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) y [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) el cliente encontrado, `mariadb-dump` y `mariadb` o los antiguos `mysqldump` y `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | Las descargas |
| `libatomic` | Node.js se enlaza con ella, y los servidores mínimos no la tienen |
| `sshpass` | Los playbooks que inician sesión con una contraseña ssh. En RHEL y sus recompilaciones viene de EPEL, que el instalador intenta activar con `epel-release`; si no se puede instalar, la instalación continúa y lo indica |
| El servidor MariaDB | Solo en un controlador: su base de datos |

Después, en la carpeta de instalación, comprobando cada descarga con su checksum publicado:

* **AnsibleForms** : el bundle de release `ansibleforms-<version>-linux-<arch>.tar.gz` de la release de GitHub de la aplicación, la aplicación compilada para
  Node.js. Una versión sin bundle muestra *Installing without containers needs AnsibleForms 7.3.0 or later.*
* **Node.js** : la release más reciente de la versión mayor que indica el bundle, desde nodejs.org
* **Python y Ansible** : uv, y con él el Python de las imágenes del RTE y un entorno virtual con Ansible y las bibliotecas de
  la imagen completa del RTE, y después sus colecciones de Ansible (consulta [Las imágenes del RTE](../rte/images.html)). Esto tarda unos minutos
* **Los archivos iniciales** : los formularios, playbooks y ajustes de la carpeta `data` del [proyecto docker-compose](https://github.com/ansibleforms/docker),
  tal como los recibe una instalación nueva con Docker Compose. Un Runner solo conserva su configuración de Ansible y sus ajustes de ssh y git

En un controlador crea después el esquema `AnsibleForms` en MariaDB, y un usuario de base de datos con el nombre de la instancia, con todos los derechos sobre ese
esquema y ninguno fuera de él, que inicia sesión solo desde este servidor.

---

## La carpeta

Todo vive en la carpeta de instalación, `/opt/ansibleforms` (o `/opt/ansibleforms-runner` para un Runner) de forma predeterminada:

| Ruta | Qué contiene |
|---|---|
| `releases/<version>/` | Una release: el bundle, su enlace a Node.js, su entorno virtual de Python y sus colecciones |
| `current` | El enlace a la release que se ejecuta; una actualización lo mueve, y también una vuelta atrás |
| `runtime/` | Node.js, uv y Python, compartidos por las releases |
| `data/` | Lo que los contenedores montan como `/app/dist/persistent`: formularios, playbooks, `config.yaml`, la semilla de configuración, certificados y logs |
| `home/` | El home del usuario del sistema: `.ssh` y `.gitconfig`, enlazados a `data/ssh` y `data/git` |
| `app.env`, `rte.env` | Los ajustes y secretos de los servicios, legibles solo por root y por el usuario del sistema. El del RTE no contiene ajustes de base de datos |
| `installer-backups/` | Las copias de seguridad de la base de datos que hace el instalador, antes de una actualización o con `backup` |

Las releases y los runtimes pertenecen a root, así que los servicios no pueden cambiar su propio código; `data/` y `home/` pertenecen al usuario del sistema.
Los archivos de la base de datos los guarda MariaDB, fuera de la carpeta.

---

## Los servicios

Un controlador ejecuta dos servicios systemd, un Runner uno. Cada uno se ejecuta como un usuario del sistema con el nombre de la instancia (`ansibleforms` de forma predeterminada),
desde `current/server`, con su archivo de ajustes:

| Servicio | Qué ejecuta | Ajustes |
|---|---|---|
| `<name>` | La aplicación: la interfaz web, la API y el worker. Solo en un controlador | `app.env` |
| `<name>-rte` | El RTE que ejecuta los playbooks | `rte.env` |

El RTE de un controlador es `inbound` en un puerto propio en `127.0.0.1` (`8001`, o el siguiente libre, con
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), ejecuta los playbooks desde las carpetas de la aplicación (`RTE_FILES=local`),
y la semilla de configuración `data/seed.yaml` lo declara como el runner predeterminado.

El RTE de un Runner recibe el modo, `APP_URL`, `RTE_NAME` y, con `--join`, el token de unión, y recibe los playbooks con cada trabajo (consulta
[Modos](../rte/modes.html)). Uno outbound no recibe ninguna llamada de la aplicación, así que escucha solo en `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Uno inbound sirve HTTPS con un certificado autofirmado propio para su dirección en `data/certificates`, que AnsibleForms fija (pinning).
Sin token de unión pide unirse, y un administrador lo aprueba en **Conexiones > Runners**.

Arrancan con el sistema y se reinician tras un fallo. Gestiónalos y lee sus logs con las propias herramientas de systemd:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

La aplicación puede escuchar en un puerto inferior a 1024, como `443`, sin ser root. El RTE conserva el derecho a usar `sudo`, que necesitan los playbooks con
`become` en este servidor, así que un playbook puede gestionar el servidor en el que se ejecuta el RTE.

---

## Actualizar y volver atrás

`sudo /usr/local/bin/ansibleforms-installer upgrade` actualiza una instalación nativa igual que las demás (consulta [Actualizar](installer.html#upgrade)), en
este orden:

1. Coloca la nueva release junto a la que se ejecuta: su bundle, Node.js, Python, Ansible y las colecciones. Los servicios
   en ejecución todavía no se tocan
2. Añade los nuevos archivos iniciales que trae la release, conservando todos los archivos existentes
3. Hace una copia de seguridad de la base de datos (en un controlador) en `installer-backups/`, con una copia de `app.env` y `rte.env`
4. Detiene los servicios, apunta `current` a la nueva release y los vuelve a arrancar
5. Espera a que la aplicación responda con la nueva versión (en un Runner: a que su RTE vuelva a escuchar)

Si la nueva versión no responde, el instalador ofrece volver atrás: `current` vuelve a apuntar a la release anterior, la
base de datos se restaura desde la copia de seguridad y los servicios arrancan. Solo se conservan la release en ejecución y la anterior.

`install` y `upgrade` detectan los servicios nativos con la estructura del instalador que no tienen un `installer.json` al lado, por ejemplo porque se borró,
y ofrecen hacerse cargo de ellos (consulta [Una instalación existente](installer.html#an-existing-installation)).

---

## Desinstalar

`sudo /usr/local/bin/ansibleforms-installer uninstall` detiene y elimina los servicios. Conserva la carpeta y la base de datos, salvo que elijas borrar
los datos (o pases `--purge`) y escribas el nombre de la instancia para confirmarlo. Entonces también elimina la base de datos y su usuario (en un controlador),
borra la carpeta y elimina el usuario del sistema.

Los paquetes siguen instalados, MariaDB entre ellos: puede que otro software los use.

---

## Sin conexión

`--bundle` instala desde un bundle de release que hayas copiado al servidor, en lugar de descargarlo de GitHub. Coge el archivo de su
arquitectura, `ansibleforms-<version>-linux-amd64.tar.gz` o `-arm64`, de las [Releases](https://github.com/ansibleforms/ansibleforms/releases) de la aplicación:

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` hace lo mismo con los archivos iniciales, desde una copia local del repositorio
[ansibleforms/docker](https://github.com/ansibleforms/docker). Node.js, Python con sus paquetes y las colecciones de Ansible se siguen descargando durante la instalación.
