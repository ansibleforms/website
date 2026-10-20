---
layout: default
title: Instalador
parent: Instalación
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# El instalador
{: .no_toc }

Instala, actualiza y cuida AnsibleForms en un servidor Linux, con un solo comando
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: la forma más rápida de tener una instancia funcionando, o un Runner para un AnsibleForms instalado en otro sitio. Desde la 7.3.0.

---

## Qué instala

El instalador hace unas pocas preguntas en un asistente a pantalla completa, muestra cada respuesta para revisarla y solo entonces cambia el servidor.
Instala uno de dos roles, en uno de cuatro motores:

| Rol | Qué es |
|---|---|
| Controlador | La aplicación completa: la interfaz web, su base de datos y su propio Runner. Elígelo para una primera instalación |
| Runner | Un RTE que ejecuta los playbooks de un AnsibleForms instalado en otro sitio, por ejemplo en otra red, una DMZ u otro centro de datos. Habla con AnsibleForms por un único WebSocket y no guarda credenciales de base de datos |

Los motores en los que los instala:

| Motor | Cómo se ejecuta |
|---|---|
| Docker | El [proyecto de Docker Compose](docker-compose.html), en Docker Engine con su plugin compose. Los contenedores se reinician junto con Docker |
| Podman | El mismo proyecto en Podman, rootless o como root, con podman-compose. Una unidad de systemd arranca los contenedores al iniciar el sistema |
| Kubernetes | El [chart de Helm](kubernetes.html), en el clúster al que llega `kubectl`. Un controlador se sirve detrás de un ingress; un Runner usa el modo runner del chart |
| Directamente en este servidor | Sin contenedores: Node.js, MariaDB y Ansible en el servidor, y AnsibleForms como servicios de systemd. Consulta [Instalación nativa](native.html) |

Tras la instalación, el mismo programa actualiza la instalación, hace sus copias de seguridad, muestra su estado y la elimina. También se hace cargo de un
AnsibleForms que no instaló él, como uno montado a mano a partir del proyecto de Docker Compose (consulta [Una instalación existente](#an-existing-installation)).

---

## Ejecutarlo

El script de instalación descarga el instalador para este servidor y lo arranca:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Las variantes habituales: como root, para instalar Docker o Podman, para instalar directamente en el servidor o en `/opt`; con un comando o
flags (consulta [Flags](#flags)); y un instalador de una versión concreta en lugar de la última:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

El script:

1. Comprueba que el servidor ejecuta Linux en amd64 o arm64, y encuentra `curl` o `wget` y `sha256sum`
2. Descarga `ansibleforms-installer_linux_<arch>` de la última versión de
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases), o de la versión que indique `AF_INSTALLER_VERSION`
3. Lo comprueba contra el `checksums.txt` de la versión, y no usa ninguna descarga cuyo checksum no coincida
4. Lo guarda como `ansibleforms-installer`, en `/usr/local/bin` para root y en `~/.local/bin` en otro caso, para las actualizaciones y copias de seguridad posteriores.
   Con sudo, ejecútalo por su ruta completa: el `secure_path` de sudo, como en los sistemas Red Hat, a menudo deja fuera `/usr/local/bin`
5. Lo arranca con los flags indicados, leyendo el teclado desde el terminal aunque el script haya llegado por una tubería

Sin terminal, como en un job de CI, el instalador se ejecuta de forma desatendida (consulta [Desatendido](#unattended)).

---

## El asistente

El asistente hace una pregunta cada vez, con los pasos listados a la izquierda. **Esc** vuelve al paso anterior, conservando su respuesta:

| Paso | Qué pregunta |
|---|---|
| Idioma | El idioma del instalador, por defecto el de la configuración regional de este servidor: catalán, alemán, inglés, español, francés, italiano, japonés, neerlandés, polaco, portugués o chino. Se pregunta lo primero, antes de que el instalador diga nada sobre una instalación que haya encontrado |
| Novedades | Lo nuevo en la versión que instala, con primero los cambios incompatibles, las eliminaciones y las funciones obsoletas |
| Rol | Controlador o Runner |
| Motor | Docker, Podman, Kubernetes, o directamente en este servidor |
| Carpeta | La carpeta de instalación y el nombre de la instancia |
| Unión, Aplicación, Modo | Solo un Runner: consulta [Un Runner](#a-runner). En Kubernetes no se pregunta el modo |
| Red | El puerto de la interfaz web, o del Runner. No en Kubernetes |
| HTTPS | Cómo se conectan los navegadores a un controlador |
| Admin | La contraseña del primer admin, escrita dos veces |
| Clúster, Ingress, Almacenamiento | Solo Kubernetes: el namespace y la release, el ingress (un controlador), la clase de almacenamiento |
| Revisión | Todas las respuestas: **Instalar**, o **Cambiar respuestas** |

**Motor.** La lista muestra lo que tiene este servidor. Un motor que falta se ofrece como *Docker (no instalado: el instalador lo instala)*
o lo mismo para Podman: al confirmar, el instalador instala Docker con el propio script de Docker (`get.docker.com`, con el plugin compose
incluido) o Podman con podman-compose desde los paquetes de la distribución. Eso necesita root. Kubernetes se ofrece cuando `kubectl` y
`helm` están instalados y llegan a un clúster. *Directamente en este servidor* necesita root y un Linux compatible, y dice por qué cuando aparece en gris.

**Carpeta.** Los valores predeterminados:

| | Controlador | Runner |
|---|---|---|
| Carpeta, como root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Carpeta, como otro usuario | `~/ansibleforms` | `~/ansibleforms-runner` |
| Nombre de la instancia, Docker o Podman | `af` | `runner` |
| Nombre de la instancia, nativa | `ansibleforms` | `ansibleforms-runner` |

Con Docker o Podman, la carpeta contiene el archivo compose y su `.env` con los secretos, y todos los datos: base de datos, formularios, playbooks
y logs. Debe estar vacía. El nombre de la instancia, en minúsculas, dígitos y `-`, es el prefijo de los contenedores (`af_app`, `af_db`, `af_rte`), así que varias
instancias pueden compartir un servidor. El nombre de la instancia de un Runner es también el nombre de su runner en **Conexiones > Runners** (`RTE_NAME`).

**Red.** La interfaz web de un controlador escucha en el `443`, o en el siguiente puerto libre. **HTTPS** ofrece entonces:

| Opción | Qué hace |
|---|---|
| HTTPS con un certificado autofirmado creado para este servidor | Un certificado para los nombres de este servidor, válido durante diez años. Los navegadores te piden aceptarlo una vez |
| HTTPS con mi propio certificado y clave | Tu propio certificado y clave, en formato PEM, de tu CA o de Let's Encrypt |
| HTTP, con HTTPS gestionado por un proxy inverso delante | HTTP sin cifrar en el puerto, para nginx, Traefik o un balanceador de carga que gestione HTTPS |

**Admin.** La contraseña del usuario `admin`, escrita dos veces para que un error tipográfico no te deje fuera. Si se deja vacía, el instalador genera
una robusta.

**El final.** El instalador genera la contraseña de la base de datos y los secretos, arranca AnsibleForms y espera a que responda. Después
muestra la dirección que abrir, el usuario y la contraseña, y la carpeta. Los Runners instalados para él piden unirse, y un admin los aprueba
en **Conexiones > Runners** (consulta [Un Runner](#a-runner)).

---

## Un Runner

Un Runner es un RTE para un AnsibleForms que se ejecuta en otro sitio, en la versión 7.3.0 o posterior. No guarda credenciales de base de datos: inicia sesión
con un token propio, que AnsibleForms guarda en una credencial RTE (consulta [Modos](../rte/modes.html)). Tras la carpeta, el asistente
pregunta tres cosas más:

| Paso | Qué pregunta |
|---|---|
| Aplicación | La dirección del AnsibleForms para el que trabaja este Runner, la que la gente abre en un navegador |
| Modo | **Saliente: el Runner se conecta a AnsibleForms** (el predeterminado), o **Entrante: AnsibleForms se conecta al Runner** |
| Red | El puerto del Runner, `8000` por defecto. En saliente, en él solo escuchan las comprobaciones de salud, accesibles solo desde este servidor. En entrante, también la dirección de este servidor tal como la alcanza AnsibleForms |

`--role runner` se salta la pregunta del rol, así que este comando, ejecutado en el servidor del Runner, empieza con las preguntas de un Runner:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

Después el instalador se conecta a AnsibleForms. Un certificado autofirmado, o uno de una CA privada, pregunta **¿Confiar en este certificado?**:
sí define [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) en el Runner. Lee la versión que ejecuta AnsibleForms,
rechaza una anterior a la 7.3.0 e instala el Runner con esa misma versión, sea cual sea la versión que instalaría el propio instalador.

Elige saliente para una DMZ, NAT o una zona que no permite conexiones entrantes: solo tráfico de este servidor a AnsibleForms, en su
puerto. Elige entrante para redes en las que el lado central abre todas las conexiones.

La revisión muestra **Registro: pide aprobación**, o **solo, con un token de unión** cuando `--join` dio uno. Al final el instalador
muestra el nombre del Runner, su modo, la aplicación y, en entrante, su dirección, y después dice que ha pedido unirse a AnsibleForms: apruébalo en
**Conexiones > Runners**, tras comprobar que la huella que se muestra allí es la que imprime:

```
Fingerprint: abcd-ef12
```

La huella son los 8 primeros dígitos hexadecimales del SHA-256 del token del Runner, `RTE_TOKEN`, que se guarda en el archivo
`.env` de la carpeta (`rte.env` en una [instalación nativa](native.html)). Consulta [Aprobar un RTE](../runners/registration.html#approving-an-rte). Con `--join`, el Runner se aprueba al instante:
se registró por sí mismo y aparece como conectado en **Conexiones > Runners**.

Un Runner entrante sirve su socket por HTTPS. El instalador crea un certificado autofirmado para la dirección con la que AnsibleForms
lo alcanza, válido durante diez años, en `data/certificates` de la carpeta, y define `RTE_URL` como `https://<address>:<port>`.
El Runner envía el certificado cuando pide unirse, y AnsibleForms lo fija: solo se conecta a ese Runner cuando presenta
ese mismo certificado, así que no hace falta ninguna CA. El instalador imprime la huella del certificado debajo de la del token:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

Son los 8 primeros dígitos hexadecimales del SHA-256 de los bytes DER del certificado, como `xxxx-xxxx`. Antes de aprobar el Runner,
comprueba que el diálogo de aprobación muestra la misma huella del certificado. Un Runner registrado con `--join` también la imprime.

En Kubernetes, un Runner es el modo runner del chart de Helm, y siempre saliente: el asistente no pregunta ni el modo ni la red, porque nada
le llega desde fuera (consulta [Kubernetes](#kubernetes)).

---

## Kubernetes

Para un controlador en Kubernetes, el instalador instala el [chart de Helm](kubernetes.html) en el clúster al que llega `kubectl`:

| Pregunta | Valor predeterminado |
|---|---|
| Namespace | `ansibleforms` |
| Nombre de la release de Helm | `ansibleforms` |
| Nombre de host servido por el ingress | Ninguno: obligatorio, por ejemplo `ansibleforms.example.com` |
| Clase de ingress | Una de las del clúster, `nginx` por defecto |
| ¿Servirlo por HTTPS (con el certificado del ingress)? | Sí |
| Clase de almacenamiento para los volúmenes | La predeterminada del clúster |

La contraseña del admin está en el Secret `<release>-secrets` de ese namespace, con la clave `ADMIN_PASSWORD`. El instalador guarda los
values del chart en un archivo junto a su archivo de estado, `<release>-values.yaml`, y lo vuelve a aplicar en las actualizaciones; `--values` añade un archivo propio. El chart de una versión se publica poco después de ella.

Para un Runner, el instalador instala el mismo chart en su [modo runner](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`): un RTE
solo, sin aplicación, sin base de datos y sin ingress, que se conecta a AnsibleForms (saliente). Tras la dirección de la aplicación, el asistente pregunta:

| Pregunta | Valor predeterminado |
|---|---|
| Namespace | `ansibleforms` |
| Nombre de la release de Helm | `ansibleforms-runner`, que es también el nombre de su runner en **Conexiones > Runners** |
| Clase de almacenamiento para los volúmenes | La predeterminada del clúster |

El instalador genera el token del Runner y define la dirección de la aplicación, el nombre del runner y, cuando confías en el certificado de la aplicación,
`runner.appTlsVerify: false`. Con `--join`, el token de unión aprueba el Runner al instante; sin él, el Runner pide unirse y el
instalador imprime su huella para comprobarla antes de aprobarlo en **Conexiones > Runners**.

---

## Comandos

El instalador acepta un comando, antes o después de sus flags. Sin ninguno, instala:

| Comando | Qué hace |
|---|---|
| `install` | Instala AnsibleForms, como controlador o como Runner (el predeterminado). En un servidor que ya tiene una instalación, propia o una que encuentra, ofrece actualizarla |
| `upgrade` | Actualiza a una versión más reciente, mostrando antes sus notas de versión (consulta [Actualizar](#upgrade)) |
| `status` | Muestra la instalación (su rol, motor y versión) y sus contenedores, pods o servicios, y si responde. Después lista cualquier otro AnsibleForms que encuentre en el servidor |
| `backup` | Hace ahora una copia de seguridad de la base de datos, en `installer-backups` de la carpeta de instalación (en Kubernetes, `backups` junto al archivo de estado del instalador). Un Runner no tiene datos que copiar |
| `release-notes` | Muestra las notas de versión de una versión, `--version` o la de este instalador, con primero los cambios incompatibles |
| `uninstall` | Elimina la instalación y, con `--purge`, sus datos |
| `version` | Muestra la versión del instalador |

El instalador recuerda la instalación en `/etc/ansibleforms/installer.json` para root, o en `~/.config/ansibleforms/installer.json`
para otro usuario, así que los comandos posteriores a `install` no necesitan flags y encuentran la instalación por sí solos. Esa carpeta no contiene ningún binario,
y solo existe cuando el instalador ha instalado un AnsibleForms o se ha hecho cargo de uno:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` pregunta **¿Borrar también sus datos (base de datos, formularios, playbooks, logs)?**. Para borrarlos, escribe el nombre de la instancia (la release de Helm
en Kubernetes); si no, elimina los contenedores, pods o servicios y conserva los datos.

---

## Flags

Cada flag responde a una pregunta, que el asistente se salta entonces. `ansibleforms-installer --help` los lista:

| Flag | Qué responde |
|---|---|
| `--lang <code>` | El idioma: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` o `zh` |
| `--version <version>` | La versión de AnsibleForms que instalar o a la que actualizar; por defecto la de este instalador |
| `--role <role>` | `controller` o `runner` |
| `--mode <mode>` | `compose`, `kubernetes` o `native` |
| `--runtime <runtime>` | `docker` o `podman` (compose) |
| `--install-runtime` | Instala Docker o Podman si faltan, sin preguntar |
| `--dir <folder>` | La carpeta de instalación (compose) |
| `--name <name>` | El nombre de la instancia, el prefijo de sus contenedores (compose, `af` por defecto) |
| `--port <port>` | El puerto en el host: la interfaz web para un controlador, el RTE para un Runner |
| `--tls <choice>` | `self`, `own` u `off` (un controlador compose) |
| `--cert <file>`, `--key <file>` | Los archivos del certificado y la clave, con `--tls own` |
| `--admin-password <password>` | La contraseña del primer admin; generada por defecto |
| `--join <token>` | Un token de unión (`afj_...`), creado a través de la API, que aprueba el Runner al instante (un Runner, desatendido; consulta [Tokens de unión](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | La dirección de la aplicación, por ejemplo `https://forms.example.com` (un Runner) |
| `--runner-mode <mode>` | `outbound` (el RTE se conecta a la aplicación) o `inbound` (la aplicación se conecta al RTE) (un Runner) |
| `--host <address>` | La dirección de este servidor, a la que se conecta la aplicación (un Runner entrante) |
| `--namespace <namespace>` | El namespace de Kubernetes, `ansibleforms` por defecto |
| `--release <release>` | La release de Helm, `ansibleforms` por defecto |
| `--hostname <name>` | El nombre de host del ingress (kubernetes) |
| `--ingress-class <class>` | La clase de ingress (kubernetes) |
| `--storage-class <class>` | La clase de almacenamiento (kubernetes) |
| `--values <file>` | Un archivo de values de Helm adicional (kubernetes) |
| `--purge` | Con `uninstall`: borra también los datos |
| `--source <folder>` | Una copia local del repositorio [ansibleforms/docker](https://github.com/ansibleforms/docker) desde la que instalar (sin conexión) |
| `--bundle <file>` | Un paquete de versión, `ansibleforms-<version>-linux-<arch>.tar.gz`, desde el que instalar de forma nativa (consulta [Instalación nativa](native.html#air-gapped)) |
| `--yes` | Responde a cada pregunta con su valor predeterminado (desatendido) |
| `--verbose` | Muestra cada comando que ejecuta |

---

## Desatendido

Con `--yes`, o sin terminal, el instalador no pregunta nada: los flags responden a sus preguntas y los valores predeterminados al resto. Se
salta el idioma, las novedades, la contraseña del admin (generada, salvo que `--admin-password` dé una) y la revisión, y en su lugar imprime
el enlace a las notas de versión. Solo instala un Docker o Podman que falte con `--install-runtime` o `--yes`, y un Runner
necesita `--app-url`. Sin `--join`, el Runner pide unirse y espera la aprobación de un admin; con él, se aprueba al instante.

Un controlador en Docker, instalando Docker si falta:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Un Runner entrante en Podman, al que la aplicación se conecta en `rte-dmz.example.com:8000`:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Una instalación existente

El instalador recuerda lo que instaló en `installer.json`. Sin ese archivo, `install`, `upgrade` y `status` buscan primero un
AnsibleForms que ya esté en el servidor, lo instalara quien lo instalara:

| Encontrado | Cómo se encuentra | Se hace cargo cuando |
|---|---|---|
| Docker o Podman | Contenedores de la imagen de la aplicación o del RTE, agrupados por proyecto compose | La carpeta contiene el archivo compose y el `.env` del repositorio [ansibleforms/docker](https://github.com/ansibleforms/docker): los servicios `mysqldb`, `app` y `rte`, en los contenedores `<name>_db`, `<name>_app` y `<name>_rte` |
| Un Runner 7.2 | Un RTE solo en su proyecto compose, con los `DB_*` de la aplicación y sin `RTE_MODE` (modo base de datos) | Su archivo compose se puede leer. Su actualización lo pasa a un modo socket (consulta [Un Runner 7.2](#a-72-runner)) |
| Kubernetes | Releases de Helm del chart `ansibleforms`, y Deployments y StatefulSets de sus imágenes | Es una release del chart: sus values actuales pasan a ser su archivo de values |
| Nativa | Servicios de systemd que ejecutan AnsibleForms con Node.js | Siguen la estructura del instalador: `releases/`, `current`, `app.env` y `rte.env` (consulta [Instalación nativa](native.html#the-folder)) |
| Sin motor | La aplicación o un RTE respondiendo en un puerto habitual: 443, 3000, 3001, 8000, 8001, 8010 o 8443 | Nunca: se ejecuta desde el código fuente o a mano. El instalador solo informa de ello |

Solo cuentan las imágenes de la aplicación y del RTE: un contenedor MySQL con el nombre de AnsibleForms no es una instalación. El instalador lista lo que
encontró, una línea por cada uno, con el motivo y qué hacer a mano con uno del que no puede hacerse cargo: su archivo compose no es el del repositorio,
su base de datos está fuera de su proyecto compose, se ejecuta en Kubernetes sin el chart de Helm, lo gestiona Argo CD (actualízalo allí,
cambiando la versión del chart de la Application), o no se puede leer su versión.

Para una instalación de la que puede hacerse cargo, `install` ofrece tres opciones:

| Opción | Qué hace |
|---|---|
| Hacerse cargo y actualizar | Muestra lo que recordará, después escribe `installer.json` cuando confirmas, y continúa con la [actualización](#upgrade) |
| Instalar de todos modos un nuevo AnsibleForms a su lado | Una segunda instalación, con su propia carpeta, puertos y base de datos, tras una confirmación propia |
| Detener | No se cambia nada |

Para una instalación que ya ejecuta la versión que instalaría el instalador, la primera opción es **Hacerse cargo**: el instalador
recuerda dónde está y cómo se ejecuta, para sus copias de seguridad, su estado y sus próximas actualizaciones, y ahora no se cambia nada.

`upgrade` ofrece lo mismo sin la segunda opción, y se detiene cuando no puede hacerse cargo de nada. En modo desatendido, `install` se detiene con un mensaje,
y `upgrade --yes` solo se hace cargo de una instalación cuando encuentra exactamente una de la que puede hacerse cargo. Los values actuales de una release de Kubernetes se
guardan junto a `installer.json`, y las actualizaciones los vuelven a aplicar con el chart de la nueva versión.

---

## Actualizar

`ansibleforms-installer upgrade` lleva la instalación a una versión más reciente de la misma versión mayor. Lista las versiones más recientes,
la última primero (en modo desatendido, toma la última), y muestra las notas de versión de cada versión que deja atrás, con primero los cambios incompatibles
y las eliminaciones. Cuando contienen cambios incompatibles, te pide confirmar que las has leído; en modo desatendido, solo `--yes` continúa.

El instalador hace una copia de seguridad de la base de datos antes de cambiar nada. Cuando la nueva versión no responde, ofrece volver atrás: la versión
anterior vuelve, y su base de datos se restaura desde esa copia. No baja de versión ni cruza una versión mayor: sigue
la [guía de actualización](../upgrade-7.html) para eso, por ejemplo de la 6.x a la 7.x, con lo que hay que hacer en la 6.5 antes de actualizar.

En Docker o Podman, la actualización de un controlador también pone al día sus archivos con la nueva versión del repositorio docker:

| Archivo | Qué hace la actualización |
|---|---|
| `docker-compose.yml` | Se sustituye por el de la nueva versión, tras guardar una copia en `installer-backups` |
| `.env` | Se conservan todas las líneas existentes, y se añaden las claves que necesita la nueva versión, con secretos generados como en una instalación nueva. Antes se guarda una copia |
| `data/seed.yaml` | Se sustituye cuando es una semilla que trajo el repositorio docker, sin cambios. Una cambiada a mano se conserva, y la nueva se guarda a su lado |
| `data/` | Se añaden los archivos nuevos que trae la versión, como un playbook nuevo. Se conservan todos los archivos existentes |

Un ajuste de base de datos que falte (`MYSQLDB_USER` o una contraseña) no se puede inventar para una base de datos que existe, así que en ese caso la actualización se detiene antes de
cualquier cambio. Una vuelta atrás deja el archivo compose, el `.env` y la semilla como estaban.

Un Runner ejecuta la misma versión que su AnsibleForms: actualiza primero AnsibleForms y después sus Runners. La actualización de un Runner reescribe su
archivo compose para la nueva imagen del RTE y conserva su `.env` y sus datos tal como están.

---

## Un Runner 7.2

Un Runner de la 7.2 se ejecuta en modo base de datos, obsoleto desde la 7.3.0: su RTE contiene los ajustes de base de datos de AnsibleForms. El instalador
lo encuentra (consulta [Una instalación existente](#an-existing-installation)), y su actualización lo pasa a un modo socket con el mismo runner:

1. Lee el nombre (`RTE_NAME`) y el token (`RTE_TOKEN`) del runner del contenedor RTE antiguo. Cuando el RTE no se registró por sí mismo
   (`RTE_REGISTER=0`), escribes el nombre que tiene su runner en **Conexiones > Runners**
2. Pregunta la dirección de la aplicación y el modo, **saliente** por defecto o entrante, y en entrante el puerto y la dirección de este servidor
3. Muestra el plan y después hace una copia del archivo compose y del `.env` antiguos en `installer-backups`
4. Escribe la estructura de Runner del instalador sin los ajustes `DB_*`. Conserva `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` y `METRICS_TOKEN`, que un RTE en modo socket sigue leyendo
5. Arranca el RTE nuevo junto al antiguo. El RTE nuevo inicia sesión con el propio token del runner, y AnsibleForms pasa el runner al
   nuevo modo por sí mismo, **sin aprobación**: sus trabajos y los formularios que lo nombran no cambian
6. Cuando el RTE nuevo está conectado, el contenedor antiguo se detiene y se elimina

Un Runner entrante sirve HTTPS con un certificado fijado, como uno nuevo (consulta [Un Runner](#a-runner)), y el instalador imprime la
huella de su certificado. Cuando el RTE antiguo ocupa el puerto que necesita el nuevo, se detiene primero, así que el Runner está desconectado hasta que
el nuevo se conecta. El RTE nuevo de un Runner saliente toma un puerto libre en `127.0.0.1` y se ejecuta junto al antiguo sin interrupción.

Cuando el instalador no puede leer un token del RTE antiguo, eliges cómo inicia sesión el RTE nuevo:

| Opción | Qué sigue |
|---|---|
| Escribir el token del runner | La contraseña de la credencial RTE del runner en **Conexiones > Credenciales**. El runner conserva su nombre y sus trabajos |
| Unirse como runner nuevo con un token de unión | Un [token de unión](../runners/registration.html#join-tokens) añade un runner nuevo con otro nombre. Retira a mano el runner antiguo |

Cuando el RTE nuevo no se conecta, el instalador ofrece restaurar los archivos antiguos y volver a arrancar el contenedor antiguo; si AnsibleForms
ya había pasado el runner al nuevo modo, vuelve a poner su modo en base de datos en **Conexiones > Runners**. Cuando el RTE nuevo está conectado, ya no
hay vuelta atrás: los archivos antiguos se quedan en `installer-backups`.

Cuando AnsibleForms no conoce ningún runner con ese nombre, el RTE nuevo pide unirse en su lugar y espera una aprobación. Rechaza esa solicitud en
**Conexiones > Runners**, y después vuelve a ejecutar la actualización con el nombre que tiene allí el runner.

---

## Versiones

La versión del instalador sigue a la de la aplicación: cada versión de AnsibleForms viene con un instalador de la misma versión, publicado con ella, y
ese instalador instala esa versión por defecto. `--version` instala otra. Cada versión de la
[página de Releases del instalador](https://github.com/ansibleforms/installer/releases) tiene binarios para Linux en amd64 y arm64, con sus
checksums.
