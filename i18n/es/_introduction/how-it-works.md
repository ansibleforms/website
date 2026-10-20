---
layout: default
title: Cómo funciona
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Cómo funciona
{: .no_toc }

Las partes de una instalación, qué ocurre en un lanzamiento y dónde se guardan los datos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Arquitectura

AnsibleForms es un servidor Node.js que sirve la aplicación web y una API REST, respaldado por una base de datos MySQL. Lee los formularios
de archivos YAML y no ejecuta nada por sí mismo: entrega cada trabajo a un [runner](runners.html). Un playbook va a uno de tus contenedores RTE
(runtime environment, entorno de ejecución), que ejecuta `ansible-playbook`, y una plantilla o un job va a AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Arquitectura de AnsibleForms</title>
<desc id="afd-desc">El navegador y un cliente MCP opcional se comunican con el servidor de AnsibleForms. El servidor guarda sus datos en MySQL y en la carpeta persistente, y se conecta a fuentes de datos, almacenes de secretos, repositorios git, proveedores de inicio de sesión, canales de notificación, servidores syslog y un proveedor de modelos opcional. Sus runners entregan cada playbook a uno de uno o varios contenedores RTE, cada uno a través de un WebSocket, que ejecutan ansible-playbook y devuelven la salida al servidor, y cada plantilla o job a AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins.</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="94" text-anchor="middle">Navegador</text>
<text class="afd-s" x="105" y="112" text-anchor="middle">formularios, diseñador,</text>
<text class="afd-s" x="105" y="127" text-anchor="middle">trabajos, chat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">Cliente MCP</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">opcional</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">Servidor de AnsibleForms</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Aplicación web y API REST</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Formularios, expresiones</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflows, programaciones</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">Servidor MCP (opcional)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runners</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">entregan trabajos a su runner</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Fuentes de datos</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">bases de datos, APIs, archivos</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Almacenes de secretos</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Repositorios git</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">formularios, playbooks, config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Proveedores de login</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Notificaciones</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">correo, Slack, Teams, webhooks</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Servidores syslog</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">el log, la auditoría</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Proveedor de modelos</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">opcional, asistente de chat</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Carpeta persistente</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">config, formularios, playbooks</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">trabajos, usuarios,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">credenciales</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">Contenedores RTE</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">ejecutan ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbooks,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">plantillas, jobs</text>
</svg>
</div>

Cada componente del diagrama tiene su propio papel:

| Componente | Papel |
|---|---|
| **Navegador** | La aplicación web Vue: los formularios, el [Diseñador](gui/designer-and-git.html), el historial de trabajos y la configuración |
| **Servidor de AnsibleForms** | Evalúa los formularios, registra los trabajos, ejecuta los workflows y las programaciones, entrega cada trabajo a su runner y lo sigue, y sirve la [API REST](api/) |
| **Runners** | Dónde se ejecutan los trabajos, añadidos en **Conexiones > Runners**: un formulario nombra uno con `runner: <name>`, o usa el runner predeterminado de su tipo (consulta [Runners](runners.html)) |
| **Contenedores RTE** | Uno o varios contenedores de entorno de ejecución, el mismo servidor arrancado con `AF_ROLE=rte`: cada uno ejecuta `ansible-playbook` para los [formularios de Ansible](forms/ansible.html), con las librerías de python y las colecciones de su imagen, y envía la salida y el estado final al servidor a través de un WebSocket, sin credenciales de base de datos (consulta [Cómo se ejecuta el RTE](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Runners para plantillas y jobs: los [formularios de AWX](forms/awx.html) lanzan una plantilla de job o de workflow, los formularios de [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) y [Jenkins](forms/jenkins.html) lanzan uno de sus jobs, y el servidor sigue su salida |
| **MySQL / MariaDB** | Contiene los trabajos y su salida, los usuarios, las credenciales y las conexiones; solo el servidor lee y escribe en ella |
| **Carpeta persistente** | Contiene `config.yaml`, los archivos de formularios, los playbooks, los logs y las copias de seguridad |
| **Fuentes de datos** | Rellenan los campos: [consultas a bases de datos](formfields/enum.html), [APIs REST](expressions/rest-apis.html), archivos y [otras funciones](expressions/remote.html) |
| **Almacenes de secretos** | Proporcionan el usuario y la contraseña de una credencial en el momento de usarla, consulta [Almacenes de secretos](secret-stores/) |
| **Repositorios git** | Mantienen los formularios, los playbooks y `config.yaml` bajo control de versiones |
| **Proveedores de inicio de sesión** | Inician la sesión de los usuarios: [LDAP, Entra ID y OIDC](authentication/), además de los usuarios locales |
| **Canales de notificación** | Llevan las [notificaciones](forms/notifications.html) y las solicitudes de aprobación: [correo, Slack, Microsoft Teams, Telegram o un webhook](notification-channels.html) |
| **Servidores syslog** | Reciben el log y la pista de auditoría a medida que se escriben, consulta [Syslog](production/logs.html#syslog) |
| **Cliente MCP, chat** | Opcionales, ambos desactivados por defecto: el [servidor MCP](mcp/) y el [asistente de chat](chat/), que necesita un proveedor de modelos |

Por defecto, un contenedor ejecuta a la vez el servidor, la aplicación web y el trabajo en segundo plano, junto a un RTE. Para varios nodos de aplicación detrás de un
balanceador de carga, un worker que ejecuta el trabajo en segundo plano y más RTE, consulta [Escalado](production/scaling.html).

### Construido con

El servidor y la interfaz web se basan en estos componentes:

| Parte | Tecnología |
|---|---|
| **Servidor** | Node.js y Express |
| **Base de datos** | MySQL o MariaDB |
| **Interfaz web** | Vue 3, con Bootstrap 5 y Font Awesome |

---

## Qué ocurre al lanzar un formulario

Un lanzamiento pasa por los mismos pasos tanto si viene del navegador como de la [API REST](api/jobs.html):

1. **Carga** : el servidor envía solo los formularios que permiten los [roles](config/roles.html) del usuario, y evalúa las expresiones del servidor
2. **Envío** : el navegador convierte los valores de los campos en extravars y las envía con `POST /api/v2/job`
3. **Comprobación** : el servidor vuelve a cargar el formulario para los roles del usuario y, con la [validación del lanzamiento](launch-validation/) activada, comprueba los valores
4. **Registro** : el trabajo se guarda con el estado `running`, y su id se añade a las extravars como `__jobid__`
5. **Aprobación** : un formulario con un punto de [`approval`](forms/approval.html) espera hasta que un aprobador acepta el trabajo
6. **Credenciales** : para un playbook, la aplicación (nunca el RTE) lee las credenciales del formulario de la base de datos o de un [almacén de secretos](secret-stores/)
7. **Ejecución** : el trabajo va a su runner, el que el formulario nombra con `runner:` o el predeterminado de su tipo. Para un playbook, la aplicación envía el trabajo a su
   RTE por el WebSocket del RTE, con sus credenciales selladas para él, y el RTE ejecuta `ansible-playbook` (consulta [Cómo se ejecuta el RTE](rte/#how-the-rte-runs)),
   y AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins ejecuta una plantilla o un job. Un [workflow](workflows/) ejecuta sus nodos, cada uno como un
   trabajo propio en su propio runner
8. **Seguimiento** : el servidor guarda la salida en la base de datos a medida que llega, enviada por el RTE a través de su socket en el caso de un playbook, o leída de los
   demás runners. La página del formulario vuelve a leer el trabajo cada dos segundos, y la página Trabajos lo sigue en directo a medida que el servidor
   anuncia cada cambio
9. **Fin** : el trabajo recibe su estado final, y sus [`notifications`](forms/notifications.html) se envían por correo y a sus
   [canales de notificación](notification-channels.html) cuando el formulario las pide

---

## Dónde se guardan las cosas

AnsibleForms guarda su estado en dos sitios: la base de datos MySQL y la carpeta persistente. Haz copia de seguridad de ambos.

### En la base de datos
{: .no_toc }

La base de datos, `AnsibleForms`, se crea en el primer arranque (salvo que `ALLOW_SCHEMA_CREATION` sea `0`) y contiene:

* los trabajos, sus extravars y su salida, las programaciones y los trabajos guardados
* los usuarios locales, los grupos y los tokens de API
* las credenciales, cifradas con `ENCRYPTION_SECRET`, y las conexiones a los almacenes de secretos
* los runners, los canales de notificación (incluido el correo), los servidores syslog, y los ajustes de LDAP, SSO, repositorios y asistente de chat
* el registro de auditoría

### En la carpeta persistente
{: .no_toc }

Es `/app/dist/persistent` en la imagen y `server/persistent` desde el código fuente; cada ruta tiene su propia [variable](customization/paths.html):

| Ruta predeterminada | Variable | Contenido |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | Las categorías, los roles y las constantes |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | Los archivos de formularios, `.yaml` o `.yml`, en subcarpetas si quieres |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | Los playbooks de los formularios `ansible`, y su directorio de trabajo |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | Los clones de los repositorios git |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | Las copias que hace el Diseñador antes de guardar |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | Las copias de seguridad de la base de datos |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | Los archivos subidos mediante campos `file` |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` y `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | El certificado y la clave, cuando `HTTPS` es `1` |
| `.env` | | Las variables de entorno guardadas desde las páginas de configuración (salvo que `ALLOW_ENV_EDIT` sea `0`) |

La clave SSH generada está en [`HOME_PATH`](customization/paths.html#env_HOME_PATH), fuera de la carpeta persistente por defecto.
