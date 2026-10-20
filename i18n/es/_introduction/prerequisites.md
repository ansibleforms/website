---
layout: default
title: Requisitos previos
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Requisitos previos
{: .no_toc }

Lo que necesitas antes de instalar AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Entorno de ejecución

AnsibleForms se ejecuta como contenedor, como servicios de systemd en el propio servidor o, para quienes lo compilan por su cuenta, como una aplicación Node.js:

| Instalación | Necesitas |
|---|---|
| [Instalador](installation/installer.html) | Linux en amd64 o arm64, `curl` o `wget` y `sha256sum`, y los requisitos del motor en el que instala (más abajo) |
| [Nativa](installation/native.html) | Root, systemd y un Linux compatible (Ubuntu, Debian, RHEL y sus derivadas, SUSE); el instalador instala el resto |
| [Docker](installation/docker.html) | Docker o Podman, y un servidor MySQL propio |
| [Docker Compose](installation/docker-compose.html) | Docker Compose o podman-compose; el proyecto también arranca MySQL |
| [Kubernetes](installation/kubernetes.html) | Un clúster, Helm 3 y una StorageClass (o PersistentVolumes creados de antemano) |
| [Desde el código fuente](installation/from-source.html) | Node.js 26 (como mínimo 24) con npm, Git, y Ansible para el proceso RTE que ejecuta los playbooks |

La imagen de la aplicación, `ghcr.io/ansibleforms/ansibleforms`, contiene Node.js y las herramientas a las que llama el servidor (git, ssh, el cliente de mariadb e
ytt), pero ni Python ni Ansible. Los playbooks se ejecutan en un RTE (runtime environment, entorno de ejecución), un segundo contenedor de
`ghcr.io/ansibleforms/ansibleforms-rte-full`, o de una imagen que construyes sobre `ansibleforms-rte-core` (consulta [Escalado](rte/)).
Los formularios que solo lanzan plantillas en AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins no necesitan ningún RTE.

---

## Base de datos

AnsibleForms guarda sus trabajos, usuarios, credenciales y conexiones en MySQL 8 o posterior, o en MariaDB.

En el primer arranque crea por sí mismo el esquema `AnsibleForms`. Dale un usuario de base de datos propio, con permisos solo sobre ese esquema,
no root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Es todo lo que necesita: crea y actualiza el esquema, hace sus copias de seguridad y, con varios workers, termina la sesión de uno caído.
La página **Estado** y el log avisan cuando el usuario tiene permisos sobre todas las bases de datos. Los nodos de aplicación y los workers se conectan con este
usuario. Un RTE en un modo de socket (outbound o inbound, consulta [Modos](rte/modes.html)) no tiene credenciales de base de datos: solo uno en modo
database, obsoleto desde la 7.3.0, se conecta también. Para crear el esquema tú mismo, pon [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0`.
El proyecto de Docker Compose y el chart de Helm (que usa `mysql:8.4`) arrancan una base de datos por ti.

---

## Dimensionamiento

No hay requisitos medidos: la carga depende sobre todo de cuántos trabajos se ejecutan a la vez y de cuánta salida escriben.
Los recursos predeterminados del chart de Helm son un punto de partida razonable para un equipo pequeño:

| Componente | Requests | Limits | Volumen |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB de memoria | 4 CPU, 4 GiB de memoria | 10 GiB |
| MySQL | 0,5 CPU, 512 MiB de memoria | 2 CPU, 2 GiB de memoria | 10 GiB |

El contenedor de la aplicación no ejecuta ningún playbook. Cada playbook es un proceso `ansible-playbook`, con sus forks, en un RTE: dimensiona la CPU y la
memoria de cada RTE para los playbooks que ejecuta a la vez, como mucho [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (`10` por defecto), y ejecuta más
RTE para ejecutar más. Los trabajos que se ejecutan en AWX, AAP, Ascender u otros runners de plantillas le cuestan poco a AnsibleForms.

La salida de los trabajos se conserva en la base de datos para siempre por defecto. Define [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
en una instancia con mucha actividad para evitar que la base de datos crezca sin límite.

---

## Red

La aplicación y cada RTE escuchan en un puerto propio, y abren conexiones salientes a los sistemas que usan tus formularios y tu configuración.

### Entrante
{: .no_toc }

El servidor escucha en el puerto `8000` ([`PORT`](customization/server.html#env_PORT)), por HTTP o, con
[`HTTPS`](customization/server.html#env_HTTPS) a `1`, por HTTPS. El proyecto de Docker Compose lo publica en el puerto 443,
y el chart de Helm lo expone mediante un service o un ingress. Un RTE también escucha en su propio `PORT`, pero solo lo llama la aplicación:
mantenlo fuera de la red pública. Un RTE outbound no necesita ningún puerto entrante: es él quien llama a la aplicación en el puerto de la aplicación.

### Saliente
{: .no_toc }

Abre las conexiones desde AnsibleForms hacia los sistemas que usas:

| Destino | Se usa para |
|---|---|
| MySQL / MariaDB | La base de datos de AnsibleForms (`DB_HOST`, `DB_PORT`, por defecto `3306`) |
| El RTE | Llamar a un RTE inbound en la dirección de su runner a través de un WebSocket, o llamar a uno en modo database en su [`RTE_URL`](customization/server.html#env_RTE_URL), que después se conecta él mismo a MySQL; un RTE outbound es el que llama a la aplicación (consulta [Modos](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Lanzar y seguir plantillas y jobs en [runners](runners.html), a través de su API HTTP(S) |
| Los hosts gestionados | Los playbooks se conectan a ellos desde el RTE, por ejemplo por SSH o WinRM |
| LDAP, Entra ID, OIDC | Iniciar sesión con cuentas de directorio o de inicio de sesión único |
| Servidores git | Clonar repositorios y traer cambios, por HTTPS o SSH |
| APIs REST y bases de datos | Las fuentes de datos de las expresiones y consultas de tus formularios |
| HashiCorp Vault, CyberArk | Leer credenciales de un [almacén de secretos](secret-stores/) |
| Servidores de correo, Slack, Teams, Telegram, webhooks | Notificaciones de trabajos y solicitudes de aprobación, mediante los [canales de notificación](notification-channels.html) |
| Proveedor de modelos | El [asistente de chat](chat/), solo cuando está activado |

Para limitar a qué hosts pueden llamar las funciones REST de las expresiones, consulta
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) y
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Navegador

La aplicación web está hecha para navegadores actuales: Chrome o Edge 111, Firefox 114, Safari 16.4 o posteriores.
Los navegadores más antiguos no son compatibles.

---

## Escalado

Por defecto, un contenedor de AnsibleForms ejecuta a la vez la aplicación web y el trabajo en segundo plano, junto a un RTE.

Para atender a más usuarios, ejecuta varios nodos de aplicación detrás de un balanceador de carga (`AF_ROLE=app`) junto a un worker (`AF_ROLE=worker`), que ejecuta las
programaciones, las copias de seguridad y el resto del trabajo en segundo plano; solo trabaja un worker a la vez, y un segundo espera para tomar el relevo. Comparten
la base de datos, la carpeta persistente, `ACCESS_TOKEN_SECRET` y `ENCRYPTION_SECRET`. Consulta [Escalado](production/scaling.html). Ejecuta más
RTE para ejecutar más playbooks a la vez: consulta [Varios RTE](rte/several.html).
