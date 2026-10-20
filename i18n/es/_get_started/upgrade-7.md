---
layout: default
title: Actualizar a la v7
parent: Actualizar
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Actualizar a la v7
{: .no_toc }

Qué cambiar cuando todavía estás en la 6.5, y qué cambia cuando pasas a la versión 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La versión 7 elimina todo lo que la 6.x marcó como obsoleto; corrígelo primero en la 6.5, donde funcionan lo antiguo y lo nuevo, y después actualiza.

---

## Antes de actualizar (en la 6.5)

### Los formularios viven en sus propios archivos

Los formularios solo viven en la carpeta de formularios (`FORMS_FOLDER_PATH`) o en un repositorio de formularios; `config.yaml` conserva categorías, roles y constantes.

- **Un archivo `forms.yaml`:** renómbralo a `config.yaml`. En la 6.5, la página de configuración tiene un botón
  **Convert forms.yaml to config.yaml** para esto.
- **Una sección `forms:` en la configuración base:** la versión 7 la rechaza. Mueve cada formulario a su propio archivo, por ejemplo
  arrastrándolo a un archivo en el diseñador de la 6.5.
- **Variables de entorno:**

  | Eliminada | Usa en su lugar |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` y `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### El campo `table`

La versión 7 rechaza los campos `table`, y con ellos sus propiedades (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`): usa un campo `list` con un `subform`, y convierte el `from` de cada columna en una expresión
sobre `__parent__` (consulta las [Preguntas frecuentes](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Propiedades renombradas

Cada propiedad eliminada tiene un sustituto directo:

| Eliminada | Usa en su lugar |
|---|---|
| `disableRelaunch: true` (formulario) | `allowRelaunch: false` |
| `noOutput: true` (campo) | `output: false` |
| `enableLogin` (opción de rol) | `allowLogin` |

### Datasources y esquemas de datos

Se han eliminado las importaciones de datasources y sus páginas de administración, igual que la
colección AnsibleForms de Galaxy, cuyos módulos solo servían para ellas.

- Las importaciones programadas se detienen y las tablas de datasources se eliminan: apunta antes lo que necesites.
- Los esquemas de datos que llenaba una importación son bases de datos propias y se quedan. Un formulario que
  los consulta mediante una credencial sigue funcionando.
- Para mantener esos datos al día, ejecuta la importación como un playbook propio, por ejemplo desde una
  programación.

### API v1

Se ha eliminado `/api/v1/*`; usa `/api/v2/*` (documentación interactiva en `/api/v2/docs`). Las llamadas
que suelen usar los scripts son:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

La v2 responde con códigos de estado HTTP (`400`, `403`, `404`, `422`) y un cuerpo JSON simple, no con el envoltorio
`{ status, message, data }` de la v1.

**También los callbacks de inicio de sesión único.** Una URL de redirección con `/api/v1/` ya no responde: el inicio de sesión vuelve a
la página de inicio de sesión sin iniciarla. Cámbiala a `/api/v2/` en dos sitios, en el proveedor SSO de
AnsibleForms y en el proveedor de identidad (los URI de redirección del registro de aplicación de Entra ID, los URI de redirección válidos del cliente
OIDC):

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback`, o `/api/v2/auth/entraid/callback` desde la 7.3.0
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## Qué cambia en la 7

La versión 7 cambia cómo se ejecutan los playbooks y endurece varios valores predeterminados. Revisa cada punto de abajo al pasar desde la 6.5.

### Los playbooks se ejecutan en un RTE

La versión 7 ya no ejecuta `ansible-playbook` en el contenedor de AnsibleForms. Los playbooks se ejecutan en un entorno de ejecución (RTE),
un contenedor propio, y la imagen de la aplicación ya no contiene ansible ni python. Arranca un RTE junto a la aplicación, a partir de la
imagen `ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Desde la 7.3.0, la aplicación llama al RTE y mantiene abierto un WebSocket (consulta
[Modos](rte/modes.html)): el RTE no recibe ajustes de base de datos ni `ENCRYPTION_SECRET`. Sus ajustes:

| Ajuste | Valor |
|---|---|
| `AF_ROLE` | `rte`. Las imágenes del RTE ya lo definen. |
| `RTE_MODE` | `inbound`: la aplicación llama al RTE. Un Runner en otra red usa `outbound` (consulta [Modos](rte/modes.html)). |
| `RTE_TOKEN` | Un token de al menos 16 caracteres. La aplicación inicia sesión con él en el socket del RTE, y el RTE se niega a arrancar sin él. |
| `RTE_FILES` | `local` cuando el RTE monta la misma carpeta persistente que la aplicación, como al estar junto a ella. |

Después mueve los montajes de ansible del contenedor de la aplicación al RTE:

- `ansible.cfg` en `/etc/ansible/ansible.cfg`, tus roles en `/etc/ansible/roles` y tus colecciones en
  `/etc/ansible/collections`.
- Monta también en el RTE la misma carpeta persistente que en la aplicación, para que encuentre los playbooks y los repositorios.

Después declara el RTE como runner, en la [semilla de configuración](seed/) como hace el proyecto de Docker Compose, o en **Conexiones → Runners**:
una credencial de RTE con la dirección del RTE (por ejemplo `http://rte:8000`) y el mismo token, y un runner de tipo RTE, modo inbound,
que la nombre:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

La semilla lee `RTE_TOKEN` del entorno de la aplicación. Consulta [Runners](runners.html) y [Entornos de ejecución](rte/).

{: .warning }
> **El mismo contrato para la aplicación y el RTE** La aplicación resuelve las credenciales de un trabajo y se las entrega al RTE selladas para
> ese RTE (contrato de RTE 2, nuevo en la 7.0.0). Un RTE de otro contrato rechaza los trabajos de la aplicación: ejecuta la imagen del RTE de la misma
> release que la aplicación, y actualiza ambas a la vez. Las releases posteriores de la 7 siguen funcionando con un RTE 7 más antiguo mientras el contrato
> sea el mismo (consulta [Escalado](../rte/images.html#build-your-own-rte)).


### Qué contiene la imagen del RTE

El RTE se ofrece en tres capas, cada una construida sobre la anterior. Elige la que se ajuste a tus playbooks:

| Imagen | Contenido |
|---|---|
| `ansibleforms-rte-full` | La predeterminada. Ansible 14 con ansible-core 2.21, y las colecciones y bibliotecas de python que tenía la imagen 6.5. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core y algunas bibliotecas comunes, sin colecciones. Añade las tuyas en una imagen construida sobre ella. |
| `ansibleforms-rte-base` | Solo el servidor, sin python ni ansible, para construir un RTE con tus propias versiones. |

Pasar desde la 6.5 (ansible 12 con ansible-core 2.19) también cambia esto para tus playbooks:

- **ansible-core 2.21:** lee las [guías de migración](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  de la 2.20 y la 2.21.
- **Python 3.14:** las capas del RTE se ejecutan con python 3.14.
- **Se acabó `boto`:** la antigua biblioteca `boto` 2 ha desaparecido. La colección `amazon.aws` usa `boto3`, que está incluida.

Dos variables de entorno pertenecen ahora al RTE y la aplicación ya no las lee, así que defínelas en el contenedor del RTE:

| Variable | Cambio |
|---|---|
| `ANSIBLE_PATH` | La carpeta de playbooks, en el RTE. |
| `PROCESS_MAX_BUFFER` | Ahora 50 MB de forma predeterminada. Por encima, la salida del trabajo deja de guardarse (el trabajo lo indica), pero el playbook continúa en lugar de detenerse. |


### Los contenedores se ejecutan con el uid 1000

Las imágenes de la aplicación y del RTE se ejecutan como el usuario `node` (uid 1000) en lugar de root, y su carpeta home es `/home/node`:

- **Dale los volúmenes al uid 1000, una vez.** Para los volúmenes persistente y de ssh, ejecuta
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v`; para una carpeta del host, `sudo chown -R 1000:1000 <folder>`.
  En Kubernetes, pon `fsGroup: 1000`.
- **Monta la carpeta ssh en `/home/node/.ssh`**, no en `/root/.ssh`. Si pusiste
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) a `/root`, quítalo o ponlo a `/home/node`.
- **Tu propia imagen de RTE** construida sobre una capa del RTE cambia a `USER root` para sus instalaciones y vuelve a `USER node` al final.


### La validación del lanzamiento está activada

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) vale ahora `enforce` de forma predeterminada (6.5: `off`). Cada
lanzamiento, desde el navegador o desde `POST /api/v2/job`, se comprueba con las reglas del formulario, y el trabajo ejecuta las extravars y
credenciales que el servidor construye a partir de los valores comprobados.

- **Quien llame a la API REST debe enviar `rawFormData`**, los valores en bruto de los campos tal como los envía el navegador. Un lanzamiento con solo
  `extravars` se rechaza, porque sus valores no se pueden comprobar.
- **Para ver primero qué se rechazaría**, pon `LAUNCH_VALIDATION=log` y lee los avisos en el log. `off` recupera el
  comportamiento de la 6.5.

Consulta [Validación del lanzamiento](launch-validation/) para los detalles.


### Los playbooks ya no ven los ajustes de la aplicación

Un playbook ya no hereda las variables de entorno que lee el propio AnsibleForms: `ENCRYPTION_SECRET`, los ajustes `DB_*`,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, los ajustes `VAULT_*`, cualquier otra variable documentada y cualquier variable `MYSQL_*`.
El resto del entorno del RTE, como `PATH`, los proxies, los ajustes `ANSIBLE_*` y las credenciales de la nube, se pasa como antes.

Un playbook que leía una de ellas con `lookup('env', ...)` debe obtener el valor de otra forma: pásalo como extravar o
credencial, o defínelo en el RTE con otro nombre.

### Solo el rol admin gestiona runners y administradores

Un usuario con acceso a la configuración ya no tiene control total sobre quién es administrador ni adónde van las credenciales:

- **Runners:** solo el rol admin añade, cambia o elimina un runner, porque un runner recibe las credenciales de los trabajos
  que ejecuta. Los usuarios con acceso a la configuración pueden seguir viendo y probando runners.
- **Cuentas y grupos de administrador:** solo el rol admin concede permisos de administrador. Sin él, un usuario no puede meter una cuenta en un grupo que
  nombra el rol admin, ni cambiar, restablecer o eliminar una cuenta de administrador ni un grupo así.
- **Roles:** un diseñador sin el rol admin no puede cambiar los roles. Se rechaza un guardado o una restauración cuyos roles sean distintos.

Da el rol admin a quien gestione runners, administradores y roles.

### Hay que cambiar la contraseña predeterminada

Un usuario que inicia sesión con la contraseña predeterminada pública `AnsibleForms!123` debe cambiarla primero. Hasta entonces, cualquier otra llamada
a la API responde `403` con el código `password_change_required`, y el navegador muestra la página de cambio de contraseña.

Inicia sesión una vez y elige una contraseña nueva, o define [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) antes del
primer arranque. Los scripts que inician sesión con la contraseña predeterminada deben usar otra.

### Los tokens terminan al cerrar sesión y al cambiar la contraseña

Cerrar sesión termina ahora los tokens de esa sesión, y un cambio de contraseña termina todas las sesiones de ese usuario, así que vuelve a iniciar sesión tras
cambiar una contraseña.

Un token de API pedido con `?expiryDays=` dura como máximo [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) días
(90 de forma predeterminada). Los scripts que usan tokens de API de larga duración deben pedir uno nuevo antes de que caduque.

### Entra ID necesita tu tenant

El inicio de sesión con Entra ID (Azure AD) usa ahora OpenID Connect solo contra tu propio tenant, y un usuario de otro tenant no puede iniciar
sesión. Se rechaza un proveedor sin id de tenant, o con `common`, `organizations` o `consumers`.

- **Define el id del tenant** en el proveedor SSO: el Directory (tenant) ID, un GUID, o el dominio del tenant.
- **Concede los permisos de Graph:** el inicio de sesión pide `openid profile email User.Read GroupMember.Read.All`. Da al registro de
  aplicación los permisos delegados de Microsoft Graph `User.Read` y `GroupMember.Read.All`, con consentimiento de administrador.
- **Mejor ids de grupo en los roles:** nombra un grupo como `azuread/<object id>` (`entraid/<object id>` desde la 7.3.0) en lugar de por su nombre visible.

Consulta [Entra ID](authentication/entra-id.html) para la configuración.

### Las contraseñas tienen una longitud mínima

Una contraseña local definida a través de la aplicación necesita al menos
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) caracteres (8 de forma predeterminada), y no puede ser el nombre de usuario ni la
contraseña predeterminada. `PASSWORD_MIN_LENGTH=0` desactiva la comprobación de longitud. Las contraseñas existentes siguen funcionando.

### Ejecuta los contenedores con una política de reinicio

Una excepción no capturada termina ahora el proceso, registrada con el nivel `crit`, en lugar de dejarlo en marcha en un estado desconocido. Ejecuta
los contenedores con una política de reinicio, como `--restart unless-stopped` con Docker (el proyecto docker-compose la define).
Kubernetes reinicia los pods por sí solo.

### Conexiones de AWX y el enlace de inicio

Otras dos cosas desaparecen en la 7, sin nada que hacer en la 6.5:

- **Conexiones de AWX y AAP:** la tabla `awx`, `/api/v2/awx` y la página A.A.P. han desaparecido. La actualización mueve cada conexión de AWX o
  AAP a **Conexiones → Runners**, como un runner de tipo `awx`, y los formularios con `awx:` siguen funcionando.
- **`NAV_HOME_LABEL` y `NAV_HOME_ICON`:** ya no se leen. El primer enlace de la cabecera es siempre Formularios.

### Obsoleto en la 7, eliminado en la 8

Esto sigue funcionando en la 7, pero cada uno registra un aviso cuando se usa. Pasa al sustituto antes de la versión 8:

| Obsoleto | Usa en su lugar |
|---|---|
| Las variables de entorno `VAULT_*` | Un almacén de secretos llamado `vault` (**Conexiones → Almacenes de secretos**). El primer arranque de la 7 importa las variables una vez como ese almacén, y después las ignora. |
| Las variables de entorno `LOG_SYSLOG_*` | Un servidor syslog (**Conexiones → Syslog**). Si `LOG_SYSLOG_HOST` está definido, el primer arranque de la 7 las importa una vez como el servidor `syslog`, que recibe el log del servidor como antes, y después las ignora. Para enviar también las entradas de auditoría, configúralo para recibir ambos. |
| `vault_path` en una credencial (API, semilla de configuración) | `secret_store` y `secret_ref`. Consulta [Almacenes de secretos](secret-stores/). |
| El rol `public` en `config.yaml` | El rol `default`. El archivo se renombra al cargar la configuración; renombra a mano una plantilla ytt. `public` en los `roles:` de un formulario sigue coincidiendo. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` en un formulario o un paso | `approval`. `hasApproval` no tiene efecto. |
| `awx: <name>` en un formulario | `runner: <name>`. Una conexión de AWX es un runner de tipo `awx`. |
| `type: multistep` en un formulario, con sus `steps` | `type: workflow`, con nodos que nombran un `runner`. Consulta [Formularios de workflow](forms/workflow.html). |
| La sección `awx:` de la semilla de configuración | Elementos de `runners:` con `type: awx` |
| `LOCK_PATH` | Nada: ya no se lee, el bloqueo del diseñador se guarda en la base de datos. |
| Un RTE en modo database, desde la 7.3.0: `RTE_MODE=database` o sin `RTE_MODE`, con los `DB_*` de la base de datos y `ENCRYPTION_SECRET` en el RTE | `RTE_MODE=outbound` o `RTE_MODE=inbound`, sin `DB_*`. El RTE se une una vez con un token de unión (`RTE_JOIN_TOKEN`), o su runner se pone en ese modo en **Conexiones → Runners** o en la semilla de configuración (`rte_mode`). Consulta [Modos](rte/modes.html). |
| `RTE_REGISTER`, desde la 7.3.0 (solo en modo database) | Un token de unión (`RTE_JOIN_TOKEN`): el RTE se añade a sí mismo como un runner que inicia sesión con una credencial de RTE. |
| Una credencial `api` o `userpass` en un runner de la semilla de configuración, desde la 7.3.0 | Una credencial del tipo del runner (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` o `jenkins`), con su servidor en `url`. |
| Un runner de la semilla de configuración con su propio `token`, o `username` y `password`, desde la 7.3.0 | Una credencial del tipo del runner en la sección `credentials`, con su servidor en `url`, que el runner nombra con `credential:`. Mientras tanto, la semilla crea una con el nombre del runner. |

`ENABLE_SSO` y `SSO_AUTO_LOGIN` ya no se leen desde la 7.3.0. El primer arranque de la 7.3 los traslada una vez: `ENABLE_SSO=0` desactiva
todos los proveedores SSO, y `SSO_AUTO_LOGIN=1` marca **Saltar la página de inicio de sesión** en el único proveedor activado. Después se ignoran: cada arranque
registra un aviso mientras estén definidos, y cada proveedor tiene **Activado** y **Saltar la página de inicio de sesión** en **Acceso → SSO**.

---

## Etiquetas de imagen

`latest` pasa a la 7 con la 7.0.0. Para quedarte en la 6, usa la etiqueta `6` (o `6.5`) en lugar de `latest`.
Todas las etiquetas aparecen en [Etiquetas de imagen](installation/#image-tags).

---

## Volver atrás

Haz una copia de seguridad antes de actualizar (**Configuración → Copias de seguridad**). La 6.5 funciona sobre una base de datos actualizada a la 7, pero solo
la copia de seguridad restaura las definiciones de datasources eliminadas.
