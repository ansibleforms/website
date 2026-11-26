---
layout: default
title: Modos
parent: RTE
nav_order: 2
translated_from: 1a1e82f3bf5083d056e1f8e27ac059b9be72d74b
---

# Cómo habla un RTE con el controlador
{: .no_toc }

Saliente, entrante o base de datos: quién abre la conexión, y qué pasa por ella
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: desde 7.3.0 un RTE habla con el controlador por un único WebSocket y no tiene credenciales de base de datos. Elige el modo
que encaje con la red entre ambos: quién puede abrir una conexión hacia quién, y por qué proxies y cortafuegos pasa.

---

## Los tres modos

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) en el RTE indica cómo llega al controlador; su runner tiene el mismo **Modo**:

| Modo | Quién abre la conexión | Qué guarda el RTE | Para |
|---|---|---|---|
| `outbound` | El RTE llama al controlador en [`CONTROLLER_URL`](../customization/server.html#env_CONTROLLER_URL) y mantiene un WebSocket abierto | Su `RTE_TOKEN`, ninguna credencial de base de datos | Una DMZ, NAT o una zona que no admite conexiones entrantes: nada llega al RTE desde fuera |
| `inbound` | El controlador llama al RTE en la dirección de su runner y mantiene un WebSocket abierto | Su `RTE_TOKEN`, ninguna credencial de base de datos | Una red en la que el lado central abre todas las conexiones, un proyecto compose, un pod |
| `database` (obsoleto) | El controlador llama a la API del RTE por HTTP, y el RTE lee y escribe él mismo en la base de datos del controlador | Las credenciales de la base de datos (`DB_*`) y `ENCRYPTION_SECRET` | El comportamiento de 7.0 a 7.2, que se elimina en 8.0.0 |

Un RTE sin `RTE_MODE` funciona en modo base de datos durante toda la 7.x, y escribe en el log un aviso `[DEPRECATED] This RTE runs in database mode` al
arrancar. Un runner añadido antes de 7.3.0 tiene el modo **Base de datos (obsoleto)**; ponle el modo en el que funciona su RTE cuando lo migres.

---

## Saliente

El RTE abre la conexión, así que funciona desde una red que no acepta ninguna conexión entrante:

* **El socket** : el RTE llama a `CONTROLLER_URL` con `/api/v2/rte/socket` añadido, por `wss://` (`ws://` para una dirección `http://`), con su
  `RTE_TOKEN` y el nombre de su runner, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Vuelve a llamar cuando el socket se cae
* **La primera vez** : pide unirse, y su runner espera la aprobación de un admin en **Conexiones > Runners**, conectado
  pero sin trabajos (consulta [Pedir unirse](../runners/registration.html#asking-to-join)). Un token de unión,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), lo aprueba al momento. A partir de ahí inicia sesión con su propio token
* **La red** : solo desde la zona del RTE hacia el controlador, en el puerto del controlador, a través de un proxy cuando `HTTPS_PROXY` lo indica. Un proxy
  inverso delante del controlador debe dejar pasar el WebSocket en esa ruta (consulta [WebSockets de los runners](../production/reverse-proxy.html#runner-websockets))
* **El certificado** : se comprueba el certificado del controlador. Indica una CA privada con `NODE_EXTRA_CA_CERTS`, o, solo dentro de una red de
  confianza, desactiva la comprobación con [`CONTROLLER_TLS_VERIFY=0`](../customization/server.html#env_CONTROLLER_TLS_VERIFY)
* **El runner** : no necesita dirección, así que su credencial RTE contiene solo el token
* **Listo** : `/ready` responde `503` hasta que el socket con el controlador está abierto

Con varios nodos del controlador tras un balanceador de carga, el nodo al que llega el RTE tiene su socket. Cualquier nodo puede lanzar un trabajo: el nodo que tiene
el socket se lo envía al RTE, en dos segundos cuando el trabajo se lanzó en otro nodo.

---

## Entrante

El RTE escucha en su `PORT`, y el controlador le llama en la dirección de su runner, con `/rte/v1/socket` añadido y el token del RTE. Con
varios nodos del controlador, uno solo a la vez tiene el socket de cada runner entrante; cuando ese nodo se detiene, otro toma el relevo y vuelve a llamar.

El controlador necesita el runner del RTE antes de poder llamarle: tipo RTE, modo **Entrante**, y una credencial RTE con la dirección del RTE y su
`RTE_TOKEN`. Llega ahí de una de estas dos formas:

| Cómo | Qué definir |
|---|---|
| El RTE pide unirse | `CONTROLLER_URL` y [`RTE_URL`](../customization/server.html#env_RTE_URL) (la dirección a la que llama el controlador). El RTE hace una sola llamada, `POST /api/v2/rte/register`, y su runner espera la aprobación de un admin: el controlador le llama una vez aprobado (consulta [Pedir unirse](../runners/registration.html#asking-to-join)). Con `RTE_JOIN_TOKEN` se aprueba al momento. Un RTE entrante con `CONTROLLER_URL` pero sin `RTE_URL` se niega a arrancar |
| Añades tú el runner | Sin `CONTROLLER_URL`: añade el runner en **Conexiones > Runners**, o en la [semilla de configuración](../seed/), como en [Ejecutar un RTE](run.html#start-it) |

El proyecto de Docker Compose, el chart de Helm y el controlador del instalador ejecutan su propio RTE de esta forma, entrante, declarado por la semilla.

**Sobre HTTPS.** Con [`HTTPS=1`](../customization/server.html#env_HTTPS) el RTE sirve su socket sobre TLS, con la clave y el certificado
de [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) y [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(`key.pem` y `cert.pem` en su carpeta `certificates` por defecto). Un RTE con un `RTE_URL` `https://` envía ese certificado cuando
pide unirse, y el controlador lo fija: solo le llama cuando presenta el mismo certificado, así que uno autofirmado funciona sin CA.
El RTE escribe en el log la huella del certificado al arrancar (los primeros 8 dígitos hexadecimales del SHA-256 de sus bytes DER, como `abcd-ef12`),
y el diálogo de aprobación muestra la que recibió el controlador: comprueba que coinciden antes de aprobarlo.
El [instalador](../installation/installer.html#a-runner) configura así sus Runners entrantes, con un certificado de su propia dirección.

---

## Base de datos (obsoleto)

El RTE de 7.0 a 7.2: el controlador llama a su API por HTTP, y el RTE reclama el trabajo en la base de datos, escribe ahí la salida y mantiene al día su
propia fila de runner, con [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Modo base de datos](./#database-mode-deprecated)
explica en qué difieren sus pasos. Sigue funcionando en 7.x, con un aviso en cada arranque, y se elimina en 8.0.0.

Para pasar un RTE así a un modo de socket, conserva su runner y su token:

1. Un runner de la [semilla de configuración](../seed/): define primero `rte_mode: outbound` o `rte_mode: inbound` para él en la semilla (entrante: con
   la dirección a la que llama el controlador en el `url` de su credencial). El RTE no puede mover él mismo un runner de la semilla
2. En el RTE, define `RTE_MODE=outbound` con `CONTROLLER_URL`, o `RTE_MODE=inbound` (con `CONTROLLER_URL` y `RTE_URL` para que haga su única
   llamada de registro), y pon en [`RTE_NAME`](../customization/server.html#env_RTE_NAME) el nombre que tiene su runner en
   **Conexiones > Runners**. Conserva su `RTE_TOKEN`
3. Quita `DB_*` y `ENCRYPTION_SECRET` de su entorno, y `RTE_REGISTER`, que solo lee el modo base de datos, y luego reinícialo

Cuando el RTE actualizado inicia sesión con el nombre del runner y el token propio del runner, el controlador pasa ese runner al modo del RTE al
momento, sin aprobación, y escribe en el log *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. El runner ya no es una fila registrada por su RTE, así que el worker nunca lo elimina cuando el contenedor antiguo deja de responder. Un
runner de la semilla de configuración que sigue en modo base de datos se rechaza en su lugar, con *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. No uses un token de unión para esto: un token
de unión se rechaza para un runner que ya está aprobado. Un RTE entrante sin `CONTROLLER_URL` no hace ninguna llamada: pon el **Modo** de su runner en
**Entrante** en **Conexiones > Runners**, y el controlador le llama. El [instalador](../installation/installer.html#a-72-runner)
actualiza así un Runner 7.2.

---

## Qué pasa por el socket

En ambos modos de socket, el controlador envía al RTE cada trabajo con todo lo que antes el RTE leía en la base de datos, y guarda lo que vuelve,
la salida, los eventos, el log del trabajo y el final, exactamente una vez. El controlador también envía las notificaciones de final.

**El spool.** Cada lote de salida, lote de eventos, log, inicio y final se numera y se escribe en el archivo de spool del trabajo
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) antes de enviarse, y se conserva hasta que el controlador dice que lo guardó.
Tras una reconexión, al mismo nodo del controlador o a otro, el RTE reenvía lo que no se confirmó, y el controlador se salta lo que ya
guardó: nada se pierde y nada se guarda dos veces. Mantén el spool en un volumen, para que un RTE que se reinicia siga enviando lo que no había
entregado. Un playbook que estaba en ejecución cuando el RTE se reinició no puede continuar: su trabajo termina como abandonado.

**Capacidad.** El RTE ejecuta hasta [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks a la vez, o el valor definido
en su [página de runner](../runners/runner-page.html#an-rtes-settings), y le dice al controlador cada 20 segundos cuántos ejecuta. Un trabajo para un RTE
lleno espera, como se describe en [Varios RTE](several.html#several-jobs-on-one-rte).

**Los archivos del trabajo.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES), o el ajuste **Archivos de trabajo** de su página de runner, indica
de dónde obtiene el RTE los playbooks y los inventarios:

| `RTE_FILES` | De dónde vienen los archivos |
|---|---|
| `transfer` (predeterminado) | El controlador envía la carpeta de playbooks y los inventarios con el trabajo, cada uno empaquetado y nombrado por un hash de su contenido. El RTE los guarda empaquetados en [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), los usados más recientemente hasta [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (1024 MB por defecto), y solo pide un hash que no tiene: una carpeta sin cambios nunca se envía dos veces. El RTE no necesita disco compartido ni acceso a los repositorios |
| `local` | El RTE se ejecuta desde sus propias carpetas, como un RTE en modo base de datos: monta en él los playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) y los repositorios ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) |

Con `transfer`, cada trabajo desempaqueta sus archivos en una carpeta privada propia, que se elimina cuando el trabajo termina: ningún trabajo ve lo que otro
escribió, y ningún archivo de inventario o de extravars se queda desempaquetado en el disco del RTE. Varios RTE pueden compartir un `RTE_CACHE_PATH`; cada uno guarda sus trabajos en
una carpeta propia, y la carpeta de un RTE que se detuvo (matado a mitad de un trabajo, o recreado con otro hostname) la eliminan los demás
pasados 10 minutos. Una carpeta mayor que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 por defecto, leído por
el controlador, aplicado sin reiniciar) no se envía: el trabajo falla e indica que se monte la carpeta en el RTE. La carpeta ssh nunca se envía: el RTE guarda su propia
clave privada y su `known_hosts` en `/home/node/.ssh`.

**Hosts y tareas.** Desde 7.3.0, un RTE en cualquier modo registra los eventos estructurados de un playbook junto a su salida de texto: cada play, tarea y
resultado de host, y el resumen final, escritos por su plugin de callback `af_events`. La página del trabajo los muestra en **Hosts y tareas** (consulta
[Seguir un trabajo](../jobs/following.html#hosts-and-tasks)).

---

## Red

Qué abrir entre el controlador, el RTE y los hosts gestionados, según el modo:

| Modo | Desde | Hacia | Puerto |
|---|---|---|---|
| Saliente | El RTE | El controlador, en `CONTROLLER_URL` | El puerto del controlador (`443` tras la mayoría de los proxies) |
| Entrante | Los nodos del controlador | El RTE, en la dirección de su runner | El `PORT` del RTE (`8000`) |
| Base de datos (obsoleto) | El RTE, y los nodos del controlador y el worker | La base de datos, y el RTE | `3306`, y el `PORT` del RTE |
| Todos los modos | El RTE | Los hosts gestionados | ssh (`22`), WinRM, sus APIs |

En un modo de socket el RTE nunca se conecta a la base de datos. Su API solo responde al socket y a las sondas: `/live`, `/ready`, `/metrics`.
