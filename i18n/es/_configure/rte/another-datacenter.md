---
layout: default
title: Otro centro de datos
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# Un RTE en otro centro de datos
{: .no_toc }

De un host vacío en un segundo centro de datos a un RTE saliente que ejecuta su primer playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Para administradores: cuando a los hosts gestionados de un segundo centro de datos se debe llegar desde un RTE de ese centro de datos, no desde el primero.

{: .note }
> **El camino fácil.** El [instalador](../installation/installer.html#a-runner) hace todos los pasos de abajo en el host del RTE con un solo comando:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, con `--join afj_...` para que se apruebe al momento.
> Esta guía hace lo mismo a mano, con Docker o Podman, para que puedas ver y adaptar cada parte.

---

## Qué tendrás al final

La aplicación, su worker y su base de datos se quedan donde están, en el centro de datos 1. El centro de datos 2 recibe un host que ejecuta un contenedor RTE en
modo saliente ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), consulta [Modos](modes.html#outbound)): llama a la aplicación por
HTTPS y mantiene un WebSocket abierto, se une como un runner propio, y ejecuta los playbooks de los formularios que lo nombran contra los hosts
gestionados del centro de datos 2.

| Dónde | Qué se ejecuta allí | Habla con |
|---|---|---|
| Centro de datos 1 | Los nodos de aplicación, el worker, la base de datos (como hasta ahora) | Nada nuevo: recibe el socket del RTE en su dirección HTTPS habitual |
| Centro de datos 2, el host del RTE | Docker o Podman, y el contenedor del RTE | La aplicación en `APP_URL` por HTTPS, y los hosts gestionados del centro de datos 2 |

El RTE no guarda credenciales de la base de datos ni `ENCRYPTION_SECRET`, solo un token propio. Nada se conecta a él, así que no necesita ningún puerto
abierto, ni nombre DNS, ni certificado. La aplicación envía los playbooks y los inventories con cada trabajo (`RTE_FILES=transfer`, el
valor predeterminado), así que el RTE no necesita una copia de ellos ni un disco compartido.

Todos los comandos de abajo se ejecutan en un terminal del host del RTE, como un usuario con `sudo`, salvo que se indique lo contrario. Lleva unos 20 minutos,
la mayor parte esperando a la imagen.

---

## 0. Antes de empezar

Reúne esto:

| Qué | De dónde sale |
|---|---|
| La dirección de la aplicación | `APP_URL`: la dirección que la gente abre en el navegador, como `https://forms.example.com`, con su ruta base si la tiene |
| El certificado de la aplicación | Firmado por una CA pública, por una CA privada (necesitas su certificado, paso 6) o autofirmado |
| Un proxy | El `HTTPS_PROXY` que usa este centro de datos para llegar al centro de datos 1, si lo hay |
| El nombre del RTE | El nombre de su runner en **Conexiones > Runners**, con el que lo nombran los formularios en `runner:`, como `rte-dc2`: letras, dígitos y `_ . : @ -` |
| Un token de unión | Opcional: un [token de unión](../runners/registration.html#join-tokens) (`afj_...`) aprueba el RTE al momento. Sin él, lo aprueba un administrador (paso 8) |
| La clave ssh | La clave privada que usan los playbooks para llegar a los hosts gestionados, o el permiso para crear una |

La aplicación debe ejecutar la 7.3.0 o posterior. Para crear un token de unión para este RTE, un administrador llama una vez a la API (consulta
[Tokens de unión](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Preparar el host

El RTE es un contenedor, así que el host necesita un motor de contenedores y nada más: Node.js, python y ansible están en la imagen.

| Requisito | Por qué |
|---|---|
| Linux en **x86_64** (amd64) | Las imágenes del RTE solo se publican para amd64 |
| 2 CPU y 4 GB de memoria, o más | Un RTE ejecuta hasta [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks a la vez (10), cada uno con sus forks: dimensiónalo para ellos |
| 20 GB de disco libre | La imagen `-rte-full` ocupa unos 3,3 GB, más otra imagen durante las actualizaciones, los archivos de trabajos que envía la aplicación y los archivos temporales de los trabajos |
| Docker, o Podman con podman-compose | Para descargar y ejecutar la imagen |
| La hora sincronizada por NTP | Las horas de los trabajos se comparan con las de la aplicación |

**Docker**, en Ubuntu o Debian (otras distribuciones: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, en RHEL, Rocky o Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Con Podman, escribe `podman` en lugar de `docker` y `podman-compose` en lugar de `docker compose` en todos los comandos de abajo.

---

## 2. Red y cortafuegos

El RTE abre él mismo todas las conexiones. Nada le llega desde fuera:

| Desde | Hacia | Puerto | Por qué |
|---|---|---|---|
| El host del RTE | La aplicación, en `APP_URL` (a través de `HTTPS_PROXY` si está definido) | El puerto de la aplicación, `443` detrás de la mayoría de los proxies | El socket por el que pasan los trabajos, sus archivos y su salida |
| El host del RTE | Los hosts gestionados del centro de datos 2 | ssh (`22`), WinRM, sus APIs | Los playbooks se ejecutan desde aquí |
| El host del RTE | `ghcr.io` | `443` | Para descargar la imagen, salvo que venga de tu propio registro o de un archivo (paso 4) |

No abras ningún puerto de entrada para el RTE. Su `PORT` (`8000`) solo sirve `/live`, `/ready` y `/metrics`, para las sondas de este host.

El RTE llama a `APP_URL` con `/api/v2/rte/socket` añadido, como WebSocket. Un proxy inverso delante de la aplicación debe dejar pasar el upgrade
para esa ruta (consulta [WebSockets de los runners](../production/reverse-proxy.html#runner-websockets)). Comprueba desde aquí que la aplicación responde:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Carpetas

Todo vive en `/opt/af-rte`. El RTE se ejecuta como el usuario `node` (uid 1000), así que sus datos pertenecen a ese uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Carpeta | En el contenedor | Contiene |
|---|---|---|
| `data/` | `/app/dist/persistent` | El spool (`rte-spool`: la salida y el final de cada trabajo hasta que la aplicación los guarda), los archivos de trabajos que envió la aplicación (`rte-files`), una CA privada, las librerías de python que instala un playbook |
| `data/ssh/` | `/home/node/.ssh` | La clave ssh y el `known_hosts` de los playbooks |
| `data/ansible/` | `/etc/ansible/...` | Un `ansible.cfg`, roles y colecciones propios, montados en lugar de incluidos en la imagen |

Mantén `data/` en el host: un RTE reiniciado sigue enviando lo que la aplicación no había guardado, y conserva su caché de archivos de trabajos.

**Clave ssh.** Copia la clave que usan los playbooks en el centro de datos 1, o crea una para este centro de datos y entrega su mitad pública a los hosts gestionados:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Después entrégalo todo al uid 1000, con la clave legible solo por su propietario:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. La imagen

Elige una de las dos.

### Opción A: la imagen oficial
{: .no_toc }

Las imágenes publicadas están en el GitHub Container Registry, son públicas y no requieren inicio de sesión (consulta [Imágenes](images.html) para las tres capas).
Usa la misma capa que en el centro de datos 1. `:7` sigue la última versión 7, igual que el `:7` de la aplicación:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Un host sin acceso a internet obtiene la imagen de otro que sí lo tenga:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

O súbela una vez a tu propio registro (`docker tag` y `docker push`), y usa ese nombre en los pasos siguientes.

### Opción B: tu propia imagen
{: .no_toc }

Cuando los playbooks del centro de datos 2 necesitan colecciones o librerías de python que le faltan a la imagen oficial (las de VMware para el vCenter
de este centro de datos, por ejemplo), construye sobre `ansibleforms-rte-core`:

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build --pull -t af-rte-dc2 /opt/af-rte/build
```

Reconstrúyela en cada nueva versión de la aplicación (consulta [Construir tu propio RTE](images.html#build-your-own-rte)). Con varios hosts de RTE, constrúyela
una vez y súbela a tu propio registro. Sin conexión, usa `docker save` y `docker load` con la imagen construida, como en la opción A.

---

## 5. Ajustes

Un [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) nuevo y propio, de al menos 16 caracteres. Es la contraseña de este RTE: la aplicación
lo guarda en la credencial RTE del runner, y sella con él los secretos de cada trabajo.

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
RTE_MODE=outbound
APP_URL=https://forms.example.com
RTE_NAME=rte-dc2
RTE_TOKEN=<the new token>
# optional, the first time only : approved at once instead of waiting for an admin
RTE_JOIN_TOKEN=<afj_..., or remove this line>
PORT=8000
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

| Variable | Significado |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: el RTE llama a la aplicación. Sin ella, el RTE arranca en el modo base de datos, obsoleto |
| [`APP_URL`](../customization/server.html#env_APP_URL) | La dirección de la aplicación, `http://` o `https://`, con su ruta base si la tiene |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | El nombre de su runner. Sin definir: su id de nodo, `rte-<hostname>-<port>`, que cambia con el contenedor |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Su propio token, de al menos 16 caracteres. Guárdalo: el runner inicia sesión con él a partir de ahora |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcional: un token de unión, que solo se usa mientras su runner aún no existe o espera aprobación |

Añade estas cuando la red lo requiera:

| Variable | Cuándo |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | El RTE llega a la aplicación a través de un proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. A un host que figure en `NO_PROXY` (separados por comas, `.example.com` para un dominio) se le llama directamente |
| `NODE_EXTRA_CA_CERTS` | El certificado de la aplicación procede de una CA privada: pon el certificado de la CA en `/opt/af-rte/data/certificates/ca.pem` y define `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` acepta cualquier certificado de la aplicación, incluido uno autofirmado. Solo dentro de una red de confianza: es preferible `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predeterminado) recibe los playbooks y los inventories con cada trabajo. Déjalo así, salvo que los montes tú mismo en el RTE (`local`) |

Los demás ajustes que lee un RTE están en [Ejecutar un RTE](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` y
`RTE_DRAIN_SECONDS` también se pueden definir después en la página de su runner, que prevalece sobre la variable (consulta
[Los ajustes de un RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Arrancarlo

Un archivo compose guarda toda la definición en un solo sitio, junto a los ajustes. Pon la imagen del paso 4 en `image:`:

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7   # or af-rte-dc2, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    # the probes, on this host only : nothing connects to an outbound RTE
    ports:
      - "127.0.0.1:8000:8000"
    healthcheck:
      test: ["CMD", "node", "./healthcheck.js"]
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 30s
    volumes:
      - ./data:/app/dist/persistent
      - ./data/ssh:/home/node/.ssh
      - ./data/git/.gitconfig:/home/node/.gitconfig
      - ./data/ansible/ansible.cfg:/etc/ansible/ansible.cfg
      - ./data/ansible/roles:/etc/ansible/roles
      - ./data/ansible/collections:/etc/ansible/collections
EOF
cd /opt/af-rte && docker compose up -d
```

Docker lo vuelve a arrancar tras un reinicio del host (`unless-stopped`). Podman no tiene un demonio que lo haga: activa `podman-restart.service`
(`sudo systemctl enable --now podman-restart`), o ejecuta el contenedor como un servicio de systemd con un archivo Quadlet. En un host con SELinux
en modo enforcing, añade `:Z` a cada volumen (`./data:/app/dist/persistent:Z`).

Sin compose, el mismo contenedor en un solo comando:

```bash
docker run -d --name af_rte_dc2 --restart unless-stopped --stop-timeout 40 \
  --env-file /opt/af-rte/rte.env -p 127.0.0.1:8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

---

## 7. Comprobarlo en el host

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

El log muestra cómo el RTE arranca, llama a la aplicación y se conecta:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Sin token de unión, una línea más indica que está esperando:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Anota la huella.

`/ready` responde `503` con `not connected to the app` hasta que el socket está abierto. El healthcheck solo indica que el proceso escucha.

---

## 8. Aprobarlo

Sin token de unión, el RTE ha pedido unirse: **Conexiones > Runners** muestra un aviso naranja sobre la lista,
**1 Runner espera aprobación**. Ábrelo, comprueba que la **Huella** es la del log del RTE y que el **Modo** dice
Saliente, y después pulsa **Aprobar** (consulta [Aprobar un RTE](../runners/registration.html#approving-an-rte)). Solo un administrador lo aprueba. Una solicitud
que nadie atiende en 24 horas se elimina, y el RTE vuelve a pedirlo la próxima vez que llame a la aplicación.

Con un token de unión, el runner se aprueba al momento y su descripción nombra el token de unión. En ambos casos la aplicación guarda el token del RTE
en una credencial RTE nueva, `rte-dc2-rte`, y a partir de ahí el RTE inicia sesión con su propio `RTE_TOKEN`: `RTE_JOIN_TOKEN` ya no se
usa, y puedes quitarlo de `rte.env`.

---

## 9. Comprobarlo en AnsibleForms

1. **Conexiones > Runners** lista el runner `rte-dc2`, de tipo RTE. Activa **Columnas > Conexión** para ver **Conectado** en la lista
2. Ábrelo. Su pestaña **RTE** muestra **Modo** Saliente y el distintivo **Conexión** en **Conectado**; al pasar el ratón nombra el nodo de aplicación que
   tiene el socket, la versión del RTE y cuántos de sus trabajos se están ejecutando
3. Pulsa **Probar conexión**: dice **La conexión con el runner es correcta**. No llama a nada: lee qué nodo de aplicación tiene el socket del RTE
   (`runner_leases`) y comprueba el contrato que habló el RTE al conectarse
4. Dale una descripción, como *Centro de datos 2*
5. Deja **Predeterminado** en el runner del centro de datos 1, salvo que todos los formularios de playbook sin `runner:` deban ejecutarse en el centro de datos 2

La página **Estado** lista el nuevo RTE con su versión, junto a los demás.

---

## 10. Un primer trabajo

Prueba todo el recorrido con un playbook que no cambia nada. En los playbooks de la aplicación (su carpeta de playbooks o su repositorio, como en el
centro de datos 1), añade `ping-dc2.yaml`:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Después añade en el diseñador un formulario que nombre el nuevo runner:

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

Lánzalo. La aplicación envía la carpeta de playbooks y el inventory con el trabajo, y el RTE los guarda por su hash, así que una carpeta sin cambios
nunca se envía dos veces. La salida empieza con `Running on RTE rte-dc2 (outbound)`, muestra `pong` para cada host, y el trabajo
termina con éxito. Una carpeta mayor que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 por defecto) no se
envía: el trabajo falla e indica el motivo.

---

## 11. Enviarle los formularios

Un formulario se ejecuta en el RTE que nombra, así que añade la misma línea a cada formulario del centro de datos 2:

```yaml
runner: rte-dc2
```

Consulta [Runners](../runners.html) para el runner predeterminado y los demás tipos de runner.

---

## Cuando algo falla

El RTE escribe en `docker logs` a partir de `notice`. Una conexión que falla antes de que se abra el socket (un nombre DNS, un puerto rechazado, un
certificado) solo aparece como `RTE: dialing the app again in <n> seconds`, en `info`: define
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) en `rte.env` y reinícialo para ver
`RTE: socket to wss://...: <the error>`.

| Qué ves | Dónde | Qué hacer |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` falta o es demasiado corto en `rte.env` |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Define `APP_URL` en `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` debe empezar por `https://` (o `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | Falta `RTE_MODE=outbound` en `rte.env` |
| No aparece la línea `connected to the app`, `/ready` sigue en `503` | `docker logs`, `/ready` | La red del paso 2: haz `curl` a la aplicación desde este host, revisa el proxy (`HTTPS_PROXY`, `NO_PROXY`) y el certificado de la aplicación (`NODE_EXTRA_CA_CERTS`, paso 5). Define `LOG_CONSOLE_LEVEL=debug` para ver el error |
| `the app refused the socket (404)` u otro estado distinto de 401, 403 y 409 | `docker logs` | Un proxy inverso no deja pasar el WebSocket en `/api/v2/rte/socket`, o a `APP_URL` le falta la ruta base de la aplicación |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Ya existe un runner `rte-dc2` con otro token. Dale al RTE ese token (la contraseña de la credencial del runner), o elimina el runner para que pida unirse |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Crea un token de unión nuevo, o quita `RTE_JOIN_TOKEN` y aprueba el RTE (paso 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | El RTE se volvió a instalar con un token nuevo: usa el token de la credencial de su runner, o pide a un administrador que lo cambie |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Sigue a un rechazo. Corrige su causa y ejecuta `docker restart af_rte_dc2` en lugar de esperar |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Apruébalo (paso 8). Está conectado, pero no acepta trabajos hasta entonces |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | La aplicación y el RTE ejecutan versiones de otro [contrato](images.html#the-contract): actualiza el RTE a la versión de la aplicación (consulta Actualizarlo) |
| **No conectado**, o **Probar conexión** dice *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | La aplicación | Ningún nodo de aplicación tiene su socket: el RTE está detenido, o no llega a la aplicación. Lee sus `docker logs` |
| Un trabajo espera y después falla con *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | La salida del trabajo | El RTE no estaba conectado mientras el trabajo esperaba |
| `Permission denied` en la clave ssh | La salida del trabajo | Los archivos de `data/` deben pertenecer al uid 1000 (paso 3) |
| `UNREACHABLE` para los hosts gestionados | La salida del trabajo | ssh desde este host: la clave, `known_hosts` y el cortafuegos hacia los hosts |

En el lado de la aplicación, un RTE rechazado aparece en el log de la aplicación como `Refused an RTE socket from <address>: <why>`.

---

## Actualizarlo

Cuando la aplicación pase a una versión nueva, síguela también en este host. Un RTE del mismo contrato sigue funcionando mientras tanto; cuando una versión
cambia el contrato, sus notas de versión lo indican (consulta [El contrato](images.html#the-contract)). Con `:7` en `compose.yml`, o en el
`FROM` de tu Dockerfile:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Actualízalo cuando no se esté ejecutando ningún playbook en él: una parada espera `RTE_DRAIN_SECONDS` (25) a los playbooks en ejecución, y los que sigan
en marcha terminan entonces como abandonados. Lo que escribieron antes de la parada se conserva en el spool y se envía cuando el RTE vuelve. Sin conexión, haz `docker load`
de la nueva imagen (paso 4) antes de `docker compose up -d`.

---

## Revertirlo

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

El socket se cierra, y el runner muestra **No conectado** al momento: ningún nodo de aplicación tiene ya su socket (`runner_leases`). Un host
que desaparece sin cerrarlo muestra **No conectado** en cerca de un minuto, cuando el nodo de aplicación deja de recibir nada por el socket. El
runner se queda: un runner que se unió por un socket nunca se elimina solo. Elimínalo en **Conexiones > Runners**, y su
credencial `rte-dc2-rte` en **Conexiones > Credenciales**. Quita antes la línea `runner:` de los formularios que lo nombraban: hasta
entonces sus trabajos esperan al RTE, hasta `RTE_QUEUE_MINUTES`, y fallan.

---

## Más capacidad en el centro de datos 2

Repite los pasos 1 a 9 en más hosts del centro de datos 2, cada uno con su propio `RTE_NAME` y `RTE_TOKEN`, como `rte-dc2-b`: cada uno se une como un
runner propio y acepta hasta [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks. Un formulario elige uno con
`runner:`. Dos RTE con el mismo `RTE_NAME` no se reparten el trabajo: el segundo le quita el socket al primero (consulta
[Varios RTE](several.html#several-rtes)).

---

## Un RTE en modo base de datos

Antes de la 7.3.0 esta guía montaba un RTE en modo base de datos: guardaba las credenciales de la base de datos (`DB_*`, `ENCRYPTION_SECRET`), se conectaba
a la base de datos del centro de datos 1 por el puerto `3306`, y la aplicación lo llamaba en su puerto `8000`. Ese modo está obsoleto desde la 7.3.0 y
se elimina en la 8.0.0. Para pasar un RTE así a saliente sin un runner nuevo, define en él `RTE_MODE=outbound`, `APP_URL` y `RTE_NAME` (el nombre de
su runner), conserva su `RTE_TOKEN`, y quita `DB_*`, `ENCRYPTION_SECRET` y `RTE_REGISTER`: consulta
[Base de datos (obsoleto)](modes.html#database-deprecated). Después cierra el puerto `8000` y el puerto de la base de datos, que ya no necesita.
