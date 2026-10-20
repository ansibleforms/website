---
layout: default
title: Bastionado
parent: Seguridad
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Bastionado
{: .no_toc }

La cuenta admin, los límites de inicio de sesión, la base de datos, las expresiones, los datos de los trabajos, la política del navegador, las funciones opcionales y las opciones de rol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La cuenta admin

La cuenta admin local se crea en el primer arranque a partir de [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
y [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), cuyo valor predeterminado es `AnsibleForms!123`.

* Un inicio de sesión con la contraseña predeterminada pública `AnsibleForms!123` debe cambiarla primero: hasta entonces el servidor responde
  a toda petición salvo el cambio de contraseña con `403` (código `password_change_required`), y el navegador muestra una
  página de cambio de contraseña que no se puede cerrar. La nueva contraseña no puede volver a ser la predeterminada.
* `ADMIN_PASSWORD` solo se lee cuando se crea la cuenta por primera vez: define tu propio valor antes del primer arranque.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` restablece la contraseña a `ADMIN_PASSWORD` en cada
  arranque. Úsalo solo para recuperar una contraseña perdida, y luego quítalo y reinicia.
* Define primero los dos secretos maestros: consulta [Secretos y cifrado](secrets.html).
* Cuando funcione el inicio de sesión por LDAP o SSO, reserva el admin local solo para emergencias, con una contraseña larga guardada en tu almacén de contraseñas.

---

## Límites de inicio de sesión y contraseñas

Tres límites frenan los intentos de adivinar contraseñas. Los fallos se cuentan en la base de datos, así que todos los nodos de la aplicación ven los
mismos intentos, y todos los límites se aplican sin reiniciar:

| Variable | Predeterminado | Qué hace |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Tras este número de inicios de sesión fallidos, una cuenta local o LDAP queda bloqueada durante `LOGIN_LOCKOUT_MINUTES`. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Una dirección con este número de inicios de sesión fallidos dentro de `LOGIN_LOCKOUT_MINUTES` queda retenida hasta que termina esa ventana: una dirección que prueba muchas cuentas. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Cuánto tiempo sigue bloqueada una cuenta, y la ventana en la que se cuentan los fallos. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Peticiones por minuto desde una dirección, por nodo de la aplicación, en el inicio de sesión, el cierre de sesión, la renovación del token y los callbacks de inicio de sesión único. |

Una cuenta bloqueada o una dirección retenida recibe `429` con una cabecera `Retry-After`, antes de comprobar ninguna contraseña y
exista o no la cuenta; por encima de `AUTH_RATE_LIMIT` la respuesta también es `429`. Un inicio de sesión correcto pone a cero el
contador de la cuenta, y también lo hace un admin que define la contraseña del usuario. `0` desactiva un límite; `LOGIN_LOCKOUT_MINUTES=0`
desactiva tanto el bloqueo como el límite por dirección.

`LOGIN_MAX_FAILURES_PER_IP` y `AUTH_RATE_LIMIT` cuentan por dirección de cliente: tras un proxy inverso, define `TRUST_PROXY`
para que la dirección sea la del cliente y no la del proxy, consulta [Direcciones de cliente](../production/reverse-proxy.html#client-addresses).

Una contraseña local definida a través de la aplicación, para un usuario nuevo, por un admin o por los usuarios al cambiar la suya, debe tener
al menos [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) caracteres (`8` por defecto,
`0` no comprueba la longitud). No puede ser el nombre de usuario ni la contraseña predeterminada pública. `ADMIN_PASSWORD` no se comprueba.

---

## La base de datos

AnsibleForms guarda todas las credenciales y todos los trabajos en su base de datos MySQL, así que mantén esa base de datos fuera de la red:

* El proyecto docker-compose publica MySQL en el host (`MYSQLDB_LOCAL_PORT`, `3306`) y viene con la contraseña de root
  `AnsibleForms!123`. Quita esa asignación de puerto, o enlázala a `127.0.0.1`, y cambia la contraseña.
* Conéctate con una cuenta dedicada en lugar de `root`, definida en [`DB_USER`](../customization/server.html#env_DB_USER) y
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Solo necesita permisos sobre el esquema `AnsibleForms`:

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Eso cubre la creación del esquema (incluido el `CREATE DATABASE`), su actualización en cada versión, y las
  [copias de seguridad](../production/backups.html) y restauraciones, que se ejecutan con el mismo usuario: el volcado se hace con
  `--no-tablespaces`, así que no hace falta ningún permiso global del servidor como `PROCESS`. Sustituye `%` por la dirección de la
  aplicación donde puedas. Un usuario con permisos sobre todas las bases de datos, como tiene `root`, convierte un agujero en la aplicación
  en un agujero en todo el servidor de base de datos: la página **Estado** avisa de ello en su comprobación **Usuario de la base de datos**, y el log
  en cada arranque.
* Pon [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0` cuando el esquema ya exista.
  Crear el esquema elimina primero todas las tablas; con `0` ni el arranque inicial ni el endpoint `/api/v2/schema`
  pueden ejecutarlo.

---

## Expresiones y llamadas salientes

Las expresiones de servidor se ejecutan en el servidor para cualquier usuario con sesión iniciada, así que el sanitizador y los filtros de salida importan:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` o `paranoid`, nunca `legacy`, que permite a los usuarios ejecutar código en el servidor.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : hosts a los que no pueden llegar las expresiones REST, p. ej. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : si está definida, las expresiones REST solo pueden llegar
  a estos hosts y rangos. La lista de denegados prevalece sobre ella.

Ambas listas solo cubren las funciones auxiliares REST del propio AnsibleForms; los playbooks se ejecutan fuera de ellas y no se filtran.

Desde 7.3.0 las funciones auxiliares REST comprueban el certificado del endpoint, como hace cualquier otra conexión.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` desactiva la comprobación: úsalo solo para
endpoints con un certificado autofirmado.

---

## Datos de los trabajos

Las extravars y la salida de los trabajos se guardan en la base de datos y se muestran a todos los que pueden ver el trabajo:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : las extravars cuya clave coincide se
  muestran como `********`. El valor predeterminado es `password|secret|token`; los campos de contraseña siempre se enmascaran. Amplíalo con
  los nombres que usan tus formularios, por ejemplo `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : recorta el objeto `ansibleforms_user`
  enviado con cada trabajo, que de lo contrario contiene todos los grupos a los que pertenece el usuario.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) solo oculta tareas ruidosas; oculta los secretos con `no_log`.

---

## La Content-Security-Policy

La interfaz se sirve con una cabecera Content-Security-Policy, que limita lo que una página puede cargar y ejecutar en el navegador:

* Los scripts solo vienen de la propia aplicación, así que un script inyectado en una página no se ejecuta.
* Ningún otro sitio puede mostrar la interfaz en un frame.
* Permite lo que necesita la aplicación: las expresiones locales de los formularios evaluadas en el navegador (`'unsafe-eval'`), los
  estilos en línea, las imágenes desde cualquier URL (imágenes de formularios y de categorías), y los workers del editor de código.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) vale `1` por defecto y debería
seguir así. Con `0` la política se envía como `Content-Security-Policy-Report-Only`: la consola del navegador lista lo que
bloquearía, y no se bloquea nada. Usa `0` solo para una instalación que aún no puede funcionar con la política, como un proxy inverso
que inyecta un script propio. Un cambio en la página de ajustes se aplica sin reiniciar.

---

## Las páginas de ajustes y el diseñador

Los administradores pueden cambiar gran parte de la configuración desde el navegador. Restríngelo cuando la configuración se gestione en otro lugar:

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : ajustes de solo lectura, para un [entorno gestionado](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : quita el diseñador integrado cuando los formularios
  se mantienen en git.

---

## Funciones opcionales

Estas funciones están desactivadas por defecto. Actívalas solo cuando las uses; un cambio en la página de ajustes se aplica sin reiniciar:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : sirve el [servidor MCP](../mcp/) en `/api/v2/mcp`,
  para que los clientes MCP puedan lanzar formularios con el token de un usuario.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : el [asistente de chat](../chat/). Las definiciones de los formularios
  y los valores que se están rellenando se envían al proveedor de modelos configurado.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) funciona al revés: vale `enforce`
por defecto, así que el servidor rechaza un lanzamiento cuyos valores incumplen las reglas del formulario, incluidos los lanzamientos por la API REST.
Mantenlo así: `log` solo registra lo que se rechazaría y `off` no comprueba nada, consulta [Validación del lanzamiento](../launch-validation/).

---

## Opciones de rol

Algunas opciones de rol de [config.yaml](../config/roles.html) dan más de lo que sugiere su nombre. Concédelas con cuidado:

| Opción | Por qué importa |
|--------|----------------|
| `allowScheduledJobs` | Un usuario con ella ve y puede cambiar todas las programaciones, y una programación se ejecuta con permisos de admin, para cualquier formulario. Trátala como de nivel admin. |
| `allowBackupOps` | Incluye la **restauración**, que sustituye toda la base de datos. |
| `showSettings` | Abre las páginas de administración. Sin el rol admin, no puede cambiar las cuentas y los grupos que nombra el rol admin, consulta [Usuarios y grupos](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Muestra el log del servidor, que puede contener nombres de host, nombres de usuario y detalles de errores. |
| `showConnectionsSettings` | Abre las páginas de conexiones: credenciales, runners, canales de notificación y más. Añadir, cambiar y eliminar runners y almacenes de secretos sigue siendo cosa de un admin, igual que las credenciales de las conexiones y de los inicios de sesión. De un repositorio, añadirlo o eliminarlo y cambiar su dirección, su rama o sus indicadores `use_for_*` sigue siendo cosa de un admin. |
| `showAllJobLogs` | Muestra los trabajos de todos los usuarios, no solo los del propio usuario. |
| `manageAllJobs` | Aborta, elimina y relanza los trabajos de todos los usuarios. |
| `allowApiTokens` | Permite al usuario crear tokens de API que duran hasta [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 por defecto). Cerrar sesión con un token o revocarlo lo termina, y un cambio de contraseña termina todos los tokens del usuario, consulta [Tokens](secrets.html#tokens). |
| `extendedTokenExpiration` | Con `allowApiTokens`, permite además al usuario crear tokens de API que no caducan nunca. |
| `allowFileUploads` | Permite al usuario subir archivos a través de los campos de archivo de un formulario. Activado para todos los usuarios salvo que un rol lo desactive. |
| `allowChat`, `allowMcp` | Permiten al usuario usar el asistente de chat y el servidor MCP, cuando están activados. `allowChat` está activado para todos los usuarios salvo que un rol lo desactive, y `allowMcp` sigue a `allowChat` salvo que un rol lo defina. |

Un usuario sin el rol `admin` no recibe ninguna de las opciones de nivel admin anteriores salvo que un rol se las dé. Cuando el rol `admin`
no define ninguna opción, sus usuarios reciben `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` y `allowScheduledJobs`. `allowApiTokens` y
`extendedTokenExpiration` siguen desactivadas incluso para el rol `admin`: actívalas en los roles que las necesiten.

Cuando varios roles de un usuario definen la misma opción, gana `false`. Las opciones del rol `default` solo rellenan las opciones
que ninguno de los roles propios del usuario define; nunca las anulan.
