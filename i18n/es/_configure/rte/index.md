---
layout: default
title: RTE
nav_order: 11
has_children: true
has_toc: false
permalink: /rte/
translated_from: 75a4facc8ad51d9d74b8fccfd2bbfd7ba48b17f9
---

# Entornos de ejecución (RTE)
{: .no_toc }

Qué es un RTE, cómo ejecuta un playbook y a qué puede acceder
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: entiende el RTE antes de ejecutar uno, dimensionarlo o moverlo a otra red.

| Página | Qué trata |
|---|---|
| [Imágenes](images.html) | Las tres imágenes del RTE, y cómo construir la tuya con las colecciones que usan tus playbooks |
| [Modos](modes.html) | Saliente, entrante o base de datos: quién abre la conexión, el spool, los archivos del trabajo |
| [Ejecutar un RTE](run.html) | Los ajustes de cada modo, y un ejemplo de `docker run` de cada uno |
| [Varios RTE](several.html) | Capacidad, réplicas tras una misma dirección, y qué pasa cuando un RTE se detiene o muere |
| [Otro centro de datos](another-datacenter.html) | Un runbook: añadir un RTE en un segundo centro de datos, desde un host vacío hasta su primer trabajo |

---

## Qué es un RTE

AnsibleForms 7 no ejecuta ningún playbook en el contenedor de la aplicación. El trabajo de un formulario `ansible` se entrega a un [runner](../runners.html) de tipo
`rte`, un entorno de ejecución (runtime environment): el servidor de AnsibleForms arrancado con `AF_ROLE=rte`, junto a python y ansible, sin interfaz
web. Habla con la aplicación por un único WebSocket y no tiene credenciales de base de datos
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` o `inbound`, consulta [Modos](modes.html)): la aplicación le envía el trabajo,
el RTE ejecuta `ansible-playbook`, y la aplicación guarda la salida y el estado final que este le devuelve, donde el navegador los lee.

La aplicación resuelve las credenciales del trabajo y se las entrega al RTE selladas solo para ese RTE y ese trabajo. El RTE nunca lee la
tabla de credenciales ni un almacén de secretos, y un playbook no hereda las variables de entorno propias de AnsibleForms
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` y las demás): pasa ese valor como extravar o como credencial. El RTE de 7.0 a 7.2,
que leía y escribía él mismo en la base de datos, sigue funcionando en 7.x como el modo base de datos, obsoleto (consulta [Modo base de datos](#database-mode-deprecated)).

---

## Cómo se ejecuta el RTE

El RTE es un contenedor que ejecutas tú, junto a la aplicación o en otra red: AnsibleForms nunca crea ninguno. Aquí se recorre
dónde se ejecuta, qué comparte con la aplicación y qué ocurre dentro de él desde que se lanza un formulario hasta que el proceso del
playbook desaparece:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Cómo ejecuta el RTE un playbook</title>
<desc id="afr-desc">En un host de contenedores o en un clúster de Kubernetes, ambos gestionados por el operador, el contenedor de la aplicación y uno o más contenedores RTE mantienen cada uno un WebSocket entre ellos, abierto por la aplicación (entrante) o por el RTE (saliente). Solo la aplicación habla con la base de datos. 1: el navegador lanza un formulario en la aplicación. 2: la aplicación guarda el trabajo en la base de datos, elige el runner y sella para él los secretos del trabajo. 3: la aplicación envía el trabajo por el socket. 4: el RTE lo reclama y obtiene los archivos del trabajo, de su caché o de la aplicación. 5: el RTE arranca ansible-playbook como proceso hijo, uno por trabajo, hasta RTE_MAX_JOBS. 6: el playbook llega a los hosts gestionados. 7: el RTE escribe la salida, los eventos y el final en su spool y los envía por el socket; la aplicación los guarda en la base de datos y confirma su recepción. 8: el navegador sigue el trabajo a través de la aplicación. El volumen de la aplicación solo se monta en el RTE con RTE_FILES=local.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Host de contenedores o clúster de Kubernetes</text>
<text class="afr-s" x="181" y="61">gestionado por ti; un RTE saliente puede estar en otra red</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Navegador</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">formularios, trabajo</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">Contenedor app</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">web, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">sellan los secretos</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">Hub de RTE</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">guarda y confirma</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">Contenedor RTE</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="477" y="160" text-anchor="middle">Archivos del trabajo</text>
<text class="afr-s" x="477" y="174" text-anchor="middle">en caché por hash</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">hasta RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">hasta la confirmación</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">un</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Hosts gestionados</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Volumen de la app</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbooks, inventarios</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">solo RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">solo de la app</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="548" cy="142" r="9"/><text class="afr-nt" x="548" y="146" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

El diagrama muestra un socket por RTE, lo abra quien lo abra: la aplicación llama a un RTE entrante, un RTE saliente llama a la aplicación (consulta
[Modos](modes.html)). Una vez abierto, los mismos mensajes van en ambos sentidos, y solo la aplicación lee y escribe en la base de datos.

**Quién lo arranca.** Un RTE es un contenedor de larga duración, arrancado por lo que ejecute tus demás contenedores. Espera trabajos y sigue
en marcha entre uno y otro:

| Cómo ejecutas AnsibleForms | Quién arranca el RTE |
|---|---|
| `docker run` o `podman run` | Tú, con un comando como el de [Ejecutar un RTE](run.html), en cualquier host que llegue a la aplicación o al que la aplicación llegue |
| [Docker Compose](../installation/docker-compose.html) | El servicio `rte` de `docker-compose.yml`, junto a `app` y `mysqldb`. Su semilla de configuración lo declara como el runner predeterminado `rte`, entrante, en `http://rte:8000` |
| [Chart de Helm](../installation/kubernetes.html) | Kubernetes, como segundo contenedor llamado `rte` en el pod de la aplicación (`containers.rte`). La aplicación lo llama en `127.0.0.1`, entrante, y la semilla del chart lo declara como runner predeterminado |
| [El instalador](../installation/installer.html) | Docker Compose o el chart de Helm como arriba, o un servicio systemd [sin contenedores](../installation/native.html); un Runner propio, que pide unirse y espera la aprobación de un admin |

El motor de contenedores es tuyo: Docker o Podman en el host, o el runtime de contenedores de tu clúster de Kubernetes, instalado y mantenido
al día por ti. AnsibleForms nunca habla con él. Ni la aplicación ni el RTE llaman a Docker o Podman, montan su socket ni arrancan un
contenedor: la aplicación solo habla con el RTE por su socket.

**Qué hay dentro.** Un contenedor, con lo necesario para ejecutar un playbook y nada más:

* **El servidor** : el mismo servidor Node.js que la aplicación, arrancado con `AF_ROLE=rte` (definido en la imagen) bajo `tini`
* **Lo que se deja fuera** : la interfaz web, el inicio de sesión, el programador, el worker y todos los módulos de base de datos, que este rol no carga
* **En qué escucha** : en su `PORT` (`8000`): `/live` y `/ready` para las sondas y `/metrics` para Prometheus, y en modo entrante el socket
  al que llama la aplicación, `/rte/v1/socket`. Un RTE saliente no acepta ninguna conexión de la aplicación
* **Python y ansible** : los aporta la capa de imagen que elijas (consulta [Las imágenes del RTE](images.html))
* **El usuario** : el servidor y todos los playbooks se ejecutan como `node` (uid 1000), nunca como root

**Qué comparte con la aplicación.** Su token, y con `RTE_FILES=local` los archivos de la aplicación. Con `RTE_FILES=transfer`, el predeterminado, los
playbooks y los inventarios llegan con cada trabajo, y el RTE no necesita ningún disco compartido:

| Compartido con la aplicación | Qué hace el RTE con ello |
|---|---|
| `RTE_TOKEN` | Lo presenta cuando llama a la aplicación (saliente), o lo comprueba cuando la aplicación le llama (entrante). La aplicación guarda el mismo valor en la credencial RTE del runner, y los secretos del trabajo se sellan con él |
| El volumen persistente, `/app/dist/persistent`, solo con `RTE_FILES=local` | La carpeta de playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), o el repositorio de playbooks que el worker clonó en [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), los inventarios ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) y los repositorios de inventario) y los archivos subidos. El RTE escribe los archivos de extravars del trabajo en la carpeta del playbook, así que móntala en lectura y escritura |
| La carpeta ssh, `/home/node/.ssh` | La clave privada y el `known_hosts` que usan las conexiones ssh del playbook: monta la de la aplicación, gestionada en sus páginas de ajustes, o dale al RTE la suya propia |

El RTE no clona nada: un repositorio le llega en los archivos de un trabajo, o en el volumen que comparte con la aplicación. Las colecciones, los roles y
`ansible.cfg` vienen de la imagen, de las carpetas `/etc/ansible/collections`, `/etc/ansible/roles` y `/etc/ansible/ansible.cfg` cuando
las montas ahí (el proyecto de Docker Compose lo hace), o de un `ansible.cfg` junto a los playbooks.

**La vida de un trabajo.** Los números de abajo son los del diagrama, para un formulario de playbook lanzado desde el navegador o la API:

1. **Lanzamiento** : la aplicación comprueba el formulario y sus valores, construye las extravars y guarda el trabajo con estado `running`. Un formulario con
   [aprobación](../forms/approval.html) se detiene aquí hasta que un aprobador lo acepta, y no llega a ningún RTE antes de eso
2. **Elección del runner** : la aplicación toma el RTE que el formulario nombra con `runner: <name>`, o si no el runner predeterminado de tipo RTE, y guarda su
   nombre en el trabajo. Resuelve las credenciales del trabajo desde la base de datos o un [almacén de secretos](../secret-stores/), su login de ansible y su
   contraseña de vault, y las sella con AES-256-GCM con una clave derivada del token de ese runner y del id del trabajo
3. **Entrega** : el nodo de la aplicación que tiene el socket del RTE le envía el trabajo: las extravars, las opciones del formulario, los secretos sellados y
   los hashes de los archivos del trabajo. Cualquier nodo de la aplicación puede lanzar el trabajo; el que tiene el socket lo envía en dos segundos. Un RTE lleno,
   o uno no conectado, hace esperar al trabajo, hasta [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Reclamación** : el RTE responde `claimed`, o `refused` cuando está lleno, se está deteniendo, no puede abrir los secretos o el trabajo llega con otro
   [contrato](images.html#the-contract) que el suyo. Con `RTE_FILES=transfer` toma los playbooks y los inventarios de su
   caché por su hash, pide a la aplicación un hash que no tiene y los desempaqueta en una carpeta propia del trabajo
5. **Arranque** : en la carpeta del playbook (más el `playbookSubPath` del formulario, que debe existir) escribe dos archivos: `extravars_<id>.json`
   con los valores del formulario y las credenciales, y uno oculto con el login de ansible. Luego arranca `ansible-playbook` como proceso hijo
   propio, sin shell, en un grupo de procesos propio, con `-e @` esos archivos, un `-i` por inventario, y los tags, el limit, el check,
   el diff y la verbosidad del formulario. La contraseña de vault entra por stdin, nunca en un archivo ni en la línea de comandos, y el proceso se ejecuta como
   `node` con un entorno filtrado (consulta más abajo)
6. **Ejecución** : el playbook se conecta a los hosts gestionados desde el contenedor RTE, por ssh con la clave y el `known_hosts` de
   `/home/node/.ssh`, con `sshpass` para un login con contraseña, o por las APIs a las que llaman sus módulos. Es el RTE, no la aplicación, quien necesita llegar a ellos
7. **Salida y final** : el RTE agrupa stdout y stderr cada medio segundo o cada 64 KB, con las credenciales enmascaradas, y numera cada
   lote. Escribe cada elemento en el spool del trabajo en su disco antes de enviarlo: la salida, los eventos, el log del trabajo de
   `.joblogs/job_log_<id>.log` (cada 2 segundos), el inicio y el final con el estado final (`success`, `failed` o `aborted`). La aplicación
   guarda cada elemento una vez y confirma su recepción, y el RTE descarta el spool una vez guardado el final. Pasados
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) bytes en un flujo (50 MB por defecto) no envía nada más, y
   el playbook continúa. Después la aplicación envía las [notificaciones](../forms/notifications.html) del formulario
8. **Seguimiento** : el navegador nunca habla con el RTE: la página del formulario vuelve a leer el trabajo a través de la aplicación cada 2 segundos, y la página Trabajos
   lo sigue en directo a medida que la aplicación guarda cada elemento

**Un socket caído.** El playbook continúa. El RTE vuelve a llamar (saliente), o un nodo de la aplicación vuelve a llamarle (entrante), y reenvía lo que
la aplicación no había confirmado: la aplicación se salta lo que ya guardó, así que ninguna línea se pierde ni se guarda dos veces. Esto vale mientras el socket
vuelva en menos de dos minutos: la aplicación escribe el heartbeat del RTE solo mientras su socket está abierto, y cuando ese heartbeat tiene dos minutos de
antigüedad el worker da por abandonados los trabajos en ejecución del RTE, aunque sus playbooks sigan corriendo. Mantén el spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) en un volumen, para que un RTE reiniciado siga enviando lo que había guardado. Un
playbook que estaba en ejecución cuando su RTE se reinició no puede continuar: la aplicación da su trabajo por abandonado cuando el RTE vuelve sin él.

**Abortar.** Abortar activa el indicador de aborto del trabajo, y el nodo de la aplicación que tiene el socket del RTE envía `cancel` en dos segundos. El RTE
envía `SIGTERM` al grupo de procesos del playbook, de modo que `ansible-playbook` y todos los forks que arrancó se detienen juntos, y el trabajo termina
`aborted`. Un cancel que llega antes que su trabajo se conserva durante un minuto, y el trabajo arranca entonces ya abortado.

**Limpieza.** En cuanto el proceso termina, sea cual sea el resultado, el RTE elimina ambos archivos de extravars (un formulario con `keepExtravars`
conserva el visible, nunca el oculto), el archivo de artifacts en `/tmp`, el archivo de log del trabajo y la carpeta de archivos propia del trabajo. El
final se guarda una sola vez: un segundo escritor, como la aplicación marcando como fallido un trabajo que el RTE ya terminó, no cambia nada.

**Un proceso por trabajo, no un contenedor por trabajo.** AWX y AAP arrancan un pod o contenedor nuevo a partir de una imagen de execution environment para
cada trabajo. AnsibleForms no arranca nada: el contenedor RTE ya está en marcha, y cada trabajo es un proceso hijo dentro de él. Un trabajo arranca
sin descargar una imagen ni programar un pod, y AnsibleForms no necesita permisos sobre tu motor de contenedores ni tu clúster. A cambio, los
playbooks que se ejecutan en un mismo RTE comparten su CPU, su memoria, `/tmp`, su carpeta personal y su python: dale al contenedor recursos suficientes para
`RTE_MAX_JOBS` playbooks con sus forks. Para cambiar lo que un playbook puede usar, cambia la imagen, no el trabajo.

---

## El límite de seguridad

El RTE ejecuta código escrito por los autores de formularios, así que está hecho para contener lo mínimo posible:

* **Solo su token** : el RTE no tiene credenciales de base de datos ni `ENCRYPTION_SECRET`. No acepta más llamada que el socket de la aplicación, con
  su token, y no tiene usuarios, ni inicio de sesión, ni páginas web. Por el socket solo puede ejecutar los trabajos que la aplicación le envía, informar sobre ellos y
  pedir sus archivos: no puede crear un trabajo, leer otro trabajo ni repartir credenciales
* **Secretos sellados** : para ejecutar un trabajo, el RTE nunca lee la tabla de credenciales ni un almacén de secretos. Recibe los secretos de los trabajos que
  ejecuta, sellados solo para su token y ese id de trabajo, de modo que un paquete destinado a otro RTE o a otro trabajo no se abre, y un byte modificado
  se rechaza
* **Una conexión comprobada** : en modo saliente, el RTE comprueba el certificado de la aplicación. En modo entrante sobre HTTPS, la aplicación fija el certificado propio del RTE
  cuando este se une, y solo le llama cuando presenta ese mismo (consulta [Modos](modes.html#inbound)). Un RTE entrante sobre HTTP sin cifrar debe estar
  en una red privada, como la del proyecto de Docker Compose
* **Ningún entorno heredado** : `ansible-playbook` recibe el entorno del RTE sin ninguna de las variables que lee el propio AnsibleForms
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, las `MYSQL_*` y las demás), así que
  `lookup('env', ...)` no puede alcanzarlas. Lo que definas para los playbooks (`PATH`, proxies, `ANSIBLE_*`) pasa tal cual
* **Ninguna plantilla de los usuarios** : {% raw %}un valor de formulario que contiene `{{`, `{%` o `{#` llega al playbook como una cadena unsafe{% endraw %}
  que ansible nunca procesa como plantilla, salvo que el formulario defina `allowJinjaInExtravars`, y ningún shell ejecuta nunca la línea de comandos
* **No es root** : el RTE y sus playbooks se ejecutan como `node` (uid 1000), así que un playbook puede hacer lo que ese usuario puede en el contenedor, como
  leer sus archivos y la clave ssh, y nada más

Trata su contenedor, su imagen y su entorno con el mismo cuidado que los de la aplicación.

---

## Modo base de datos (obsoleto)

El RTE de 7.0 a 7.2, sin `RTE_MODE`, funciona durante toda la 7.x y se elimina en 8.0.0. Difiere de los pasos anteriores en cuatro aspectos:

* **Tiene acceso a la base de datos** : sus ajustes `DB_*`, y `ENCRYPTION_SECRET` cuando se registra a sí mismo
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **La entrega es una llamada HTTP** : la aplicación llama a `POST <address>/rte/v1/jobs` con el token y los secretos sellados, y el RTE reclama
  el trabajo escribiendo su nombre en él en la base de datos (pasos 3 y 4)
* **Escribe la salida él mismo** : en la base de datos, por lotes, sin spool (paso 7). Un aborto le llega por el indicador de aborto del trabajo,
  que lee cada 2 segundos, y por una llamada a `/cancel`
* **Lee los archivos del volumen de la aplicación** : necesita el mismo disco que la aplicación, como con `RTE_FILES=local`

Su página de runner no tiene ninguno de los [ajustes del RTE](../runners/runner-page.html#an-rtes-settings): lee sus propias variables. Para pasarlo a un
modo de socket, consulta [Modos](modes.html#database-deprecated).
