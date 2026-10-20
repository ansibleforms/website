---
layout: default
title: Ejecutar un RTE
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# Ejecutar un RTE
{: .no_toc }

Los ajustes de cada modo, y cómo arrancar un RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ajustes

Lo que necesita un RTE depende de su modo (consulta [Modos](modes.html)). Todos los RTE leen estas variables:

| Variable | Significado |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Desde 7.3.0: `outbound` (llama a la aplicación), `inbound` (la aplicación le llama) o `database` (obsoleto, el predeterminado durante toda la 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | El token entre la aplicación y el RTE, de al menos 16 caracteres; sin él, el RTE se niega a arrancar |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Cuántos playbooks ejecuta a la vez, `10` por defecto (`0` no pone límite). Un trabajo para un RTE lleno espera hasta que termine un playbook |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Al detenerse, cuánto espera a sus playbooks en ejecución, `25` por defecto; los que siguen en ejecución terminan entonces como abandonados |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | La leen los nodos de la aplicación y el worker, no el RTE: cuánto espera un trabajo a un RTE lleno o que se está deteniendo, `60` por defecto |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | La carpeta de playbooks y el límite de salida: las lee el RTE, así que defínelas en su entorno |
| `LISTEN_HOST` | Desde 7.3.0: la dirección en la que escuchan sus listeners, todas las interfaces por defecto; `127.0.0.1` cuando nada le llama desde fuera (un RTE saliente) |

Un RTE en un modo de socket, `outbound` o `inbound`, lee además estas, y ninguna `DB_*` ni `ENCRYPTION_SECRET`:

| Variable | Significado |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | La dirección de la aplicación tal como la abren los usuarios, como `https://forms.example.com`. Saliente: la dirección a la que llama. Entrante: la dirección de su única llamada de registro |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (predeterminado): el certificado de la aplicación debe ser válido. `0` acepta cualquiera, solo dentro de una red de confianza |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | El nombre de su runner, que los formularios usan con `runner:`. Sin definir: su id de nodo, `rte-<hostname>-<port>`, que cambia con el contenedor: defínelo en producción |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcional, solo la primera vez: un token de unión, creado a través de la API, que aprueba su runner al momento en lugar de esperar a un admin (consulta [Tokens de unión](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Entrante, cuando pide unirse: la dirección a la que llama la aplicación, como `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predeterminado): la aplicación envía los playbooks y los inventarios con el trabajo. `local`: se ejecuta desde sus propias carpetas montadas |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Dónde esperan la salida, los eventos y el final de cada trabajo hasta que la aplicación los guarda, `<persistent>/rte-spool` por defecto: mantenlo en un volumen |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Con `transfer`: dónde se guardan las carpetas que envió la aplicación, `<persistent>/rte-files` por defecto |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Con `transfer`: cuánto pueden ocupar esas carpetas, `1024` por defecto; primero se van las usadas hace más tiempo, y `0` no conserva ninguna |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | La lee la aplicación, no el RTE: la carpeta más grande que envía con `transfer`, `512` por defecto |

En un RTE en un modo de socket, `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` y `RTE_CACHE_MB` también se pueden definir en su página de runner,
en la pestaña RTE: un valor ahí prevalece sobre la variable, que entonces solo rellena un campo vacío (consulta
[Los ajustes de un RTE](../runners/runner-page.html#an-rtes-settings)). Un valor fuera de rango se lleva a su límite, y el RTE lo indica
al arrancar.

Un RTE en modo base de datos (obsoleto) lee en su lugar los ajustes de la base de datos, y se registra a sí mismo:

| Variable | Significado |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Los mismos valores que la aplicación: el RTE lee sus trabajos de la base de datos y escribe ahí su salida |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | La dirección en la que la aplicación llama al RTE, como `http://rte:8000`. El runner toma el nombre de su host (`rte`), así que los formularios pueden usar `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | Obsoleta en 7.3.0, junto con el modo base de datos: un RTE en modo de socket se une con un token de unión. `1` (predeterminado): el RTE se añade a sí mismo en **Conexiones > Runners** al arrancar, y el primero se convierte en el runner predeterminado. `0`: añádelo tú ahí, o en la [semilla de configuración](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | El mismo valor que la aplicación, necesario solo para registrarse (el token del runner se guarda cifrado); omítela con `RTE_REGISTER=0` |

En modo base de datos, sin `RTE_URL` el RTE registra su dirección IP y su puerto con el nombre `rte-<hostname>-<port>`, que cambian cuando
se recrea el contenedor: define `RTE_URL` en producción. El worker elimina un runner que el RTE registró él mismo 10 minutos después del
último heartbeat del RTE.

---

## Arrancarlo

El RTE ejecuta los playbooks, así que necesita su carpeta ssh, con la clave privada y el `known_hosts` que usan los playbooks, y una carpeta
persistente para su spool y los archivos que envía la aplicación. Elige el modo:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Saliente</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Entrante</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Base de datos (obsoleto)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Arranca el RTE en cualquier host que llegue a la aplicación, con su propio token y el nombre que recibe su runner:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Llama a la aplicación y pide unirse: **Conexiones > Runners** muestra el runner `rte-dmz` como pendiente de aprobación, y su log muestra
la huella de su token. Comprueba que su revisión muestra la misma huella y luego pulsa **Aprobar** (consulta
[Aprobar un RTE](../runners/registration.html#approving-an-rte)): a partir de ahí recibe trabajos, e inicia sesión con su propio `RTE_TOKEN`.
Para un arranque desatendido, añade `-e RTE_JOIN_TOKEN=<a join token, afj_...>`, que lo aprueba al momento. Nada necesita llegar a este
host: no publiques ningún puerto. En su `PORT` solo escuchan `/live`, `/ready` y `/metrics`, para las sondas.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Arranca el RTE donde la aplicación llegue a él. Este se ejecuta junto a la aplicación y ejecuta los playbooks desde sus carpetas (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Después dale a la aplicación su runner: en la [semilla de configuración](../seed/), una credencial RTE y un runner entrante que inicia sesión con ella:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

O añade esos dos a mano: la credencial en **Conexiones > Credenciales**, tipo RTE, y el runner en
**Conexiones > Runners**, tipo RTE, modo **Entrante**, con esa credencial. Para que el RTE pida unirse en su lugar, arráncalo con
`APP_URL` y `RTE_URL`, y apruébalo en **Conexiones > Runners** (consulta [Entrante](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Obsoleto desde 7.3.0 y eliminado en 8.0.0. El RTE ejecuta los playbooks desde su propio disco, así que monta también en él el volumen persistente
de la aplicación (playbooks, repositorios, archivos subidos) y su carpeta ssh. Un ejemplo con Docker, con la aplicación accesible como `ansibleforms` en la
misma red:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Mantén un RTE entrante fuera de la red pública: su socket responde a cualquiera que tenga el token. `docker stop` solo espera 10 segundos antes
de matar un contenedor, así que dale al RTE un tiempo de parada más largo (`--stop-timeout`, o `stop_grace_period` en compose) o reduce
`RTE_DRAIN_SECONDS`. Kubernetes espera 30 segundos por defecto.

El [instalador](../installation/installer.html) configura un RTE saliente o entrante en un servidor propio, con Docker, Podman o
[sin contenedores](../installation/native.html), y muestra la huella con la que aprobarlo. Para ejecutar a mano un RTE en otro centro de datos,
sigue [Otro centro de datos](another-datacenter.html).
