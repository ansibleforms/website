---
layout: default
title: Resolución de problemas
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Resolución de problemas
{: .no_toc }

Mensajes de error y síntomas, por qué ocurren y cómo corregirlos
{: .fs-6 .fw-300 }

---

Cada problema de abajo lleva como título el mensaje o el síntoma que ves, seguido de la causa y la solución. Los mensajes se citan
tal cual los escribe AnsibleForms; `<name>` representa un valor que cambia en cada caso. La mayoría acaban en el registro del
servidor, que puedes leer en [Registro del servidor](gui/administration.html#server-log) o con `docker logs`.

**Base de datos y arranque**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Configuración y formularios**

* [Could not load the forms](#could-not-load-the-forms)
* [La configuración base tiene una sección forms](#the-base-config-has-a-forms-section)
* [Falta un formulario en el panel](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Inicio de sesión**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Falla la autenticación de Azure AD u OIDC](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Sesión cerrada tras un reinicio o al cabo de un día](#logged-out-after-a-restart-or-after-a-day)
* [Formularios y trabajos vacíos tras un inicio de sesión único (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Trabajos**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Un trabajo muestra el estado abandoned](#a-job-shows-the-status-abandoned)
* [Un RTE no se conecta](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Repositorios git y copias de seguridad**

* [Falla el clonado o el pull de un repositorio](#a-repository-clone-or-pull-failed)
* [El repositorio de formularios aún no está clonado](#the-forms-repository-is-not-cloned-yet)
* [Falla una copia de seguridad](#a-backup-failed)

Las [preguntas frecuentes](faq.html) tratan a fondo dos problemas relacionados: una
[contraseña de administrador perdida](faq.html#recovering-a-lost-admin-password) y
[restringir los destinos de los helpers REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms no arranca, y el registro repite estas líneas cada 5 segundos:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Por qué ocurre**

Al arrancar, AnsibleForms espera a que la base de datos responda a una consulta, y sigue esperando mientras no lo haga.
El `<reason>` es el mensaje propio del driver de la base de datos: una conexión rechazada o agotada apunta al host o al puerto,
un mensaje de acceso denegado al nombre de usuario o a la contraseña.

**Cómo corregirlo**

Revisa [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) y [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
Desde dentro de un contenedor, `localhost` es el propio contenedor, no el host que ejecuta MySQL. Asegúrate de que MySQL escucha
en una dirección de red y de que el usuario puede conectarse desde el host de AnsibleForms. AnsibleForms continúa por sí solo en cuanto
la base de datos responde; no hace falta reiniciar.

---

## Schema is not ready, skipping group and user initialization

El navegador abre una página de base de datos en lugar de la página de inicio de sesión, y el registro muestra:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Por qué ocurre**

El esquema `AnsibleForms` falta o está incompleto. Una base de datos *vacía* se aprovisiona automáticamente al arrancar, salvo que
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) sea `0`. Si eso falla, por ejemplo porque
el usuario de la base de datos no puede crear un esquema, el registro dice `Failed to create the schema automatically : <reason>`. Un esquema
que existe pero al que le faltan tablas (`Table '<name>' is not present`) nunca se recrea automáticamente, porque crear el
esquema elimina antes todas las tablas. La página de base de datos dice entonces *It appears that you have an unuseable schema*.

**Cómo corregirlo**

En una instalación nueva, da al usuario de la base de datos permiso para crear el esquema `AnsibleForms` y reinicia, o pulsa
**Crear** en la página de base de datos. Con un esquema presente solo en parte, restaura una copia de seguridad o elimina el esquema `AnsibleForms`
incompleto para que AnsibleForms pueda crearlo de nuevo. El registro indica qué tablas y parches fallaron.

---

## Schema creation is disabled

Crear el esquema, desde la página de base de datos o con `POST /api/v2/schema`, falla con:

```
Schema creation is disabled
```

**Por qué ocurre**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) es `0`, lo que desactiva tanto la creación
automática al arrancar como el endpoint. En una base de datos que ya tiene usuarios, el endpoint además rechaza a quien no
haya iniciado sesión como administrador, con `Schema creation requires an authenticated administrator`.

**Cómo corregirlo**

Crea el esquema una vez con `ALLOW_SCHEMA_CREATION=1` (es el valor por defecto), o restáuralo desde una copia de seguridad, y luego vuelve a poner
la variable a `0`. En una base de datos ya aprovisionada, inicia sesión como administrador antes de recrear el esquema, y recuerda
que elimina y recrea todas las tablas.

---

## Config seed failed, refusing to start

El contenedor sale justo después de arrancar, y su salida termina con:

```
Config seed failed, refusing to start : <reason>
```

**Por qué ocurre**

El archivo de [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) no se pudo aplicar: por ejemplo, no es YAML
válido o incumple el esquema del seed; `<reason>` dice qué falló. AnsibleForms se niega a arrancar antes que
funcionar con la mitad de sus objetos declarados. El motivo se escribe también en la salida de error estándar, así que `docker logs` y `kubectl logs` lo muestran.

**Cómo corregirlo**

Corrige lo que indica `<reason>` y arranca de nuevo. Consulta [Recarga y arranque](seed/reloading.html) para ver cómo se
aplica el seed, y [Ejemplo](seed/example.html) para un archivo válido.

---

## ENCRYPTION_SECRET is not set

Cada arranque registra esta advertencia:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

O el worker se niega a arrancar con:

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Por qué ocurre**

Los secretos guardados se cifran con [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET): desde 7.3.0 viven en
credenciales (las contraseñas y tokens de directorios LDAP, proveedores SSO, runners y almacenes de secretos, entre otros), junto a las direcciones de webhook
de Slack y Teams. Sin ella, se usa una clave que es pública en el código fuente. Desde 7.3.0, un arranque con un
`ENCRYPTION_SECRET` nuevo vuelve a cifrar con ella todos los secretos guardados, en una sola transacción: desde la clave por defecto cuando se define por primera
vez, o desde [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) cuando cambia. Cuando los
secretos guardados no se cifraron con ninguna de las dos, no se cambia nada y AnsibleForms no arranca.

**Cómo corregirlo**

Define `ENCRYPTION_SECRET`, y guárdalo con tus otros secretos: las copias de seguridad nunca lo contienen. El siguiente arranque registra
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Para cambiarlo más adelante, pon el valor nuevo en
`ENCRYPTION_SECRET` y el antiguo en `ENCRYPTION_SECRET_PREVIOUS` durante un arranque, y luego quita `ENCRYPTION_SECRET_PREVIOUS`. Cuando el
worker se niega a arrancar, define `ENCRYPTION_SECRET_PREVIOUS` con la clave con la que se cifraron los secretos, o vuelve a poner el valor antiguo.

---

## Could not load the forms

El panel no muestra formularios e informa:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Por qué ocurre**

La configuración base (`config.yaml`) no se pudo leer o no es válida. El `<reason>` dice cuál es el caso:

| Motivo | Causa |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Un error de sintaxis YAML |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Un archivo vacío, o con solo comentarios |
| `Duplicate role name(s) : <names>. Each role must appear once.` | El mismo rol está definido dos veces |
| `There is no config.yaml nor could one be created from template.` | Falta `config.yaml` y no se puede escribir en su carpeta |
| `There is no forms directory nor could there be one created from template.` | Falta la carpeta de formularios y no se puede crear |
| Cualquier otra línea | La configuración incumple el esquema, por ejemplo un rol sin `groups` |

**Cómo corregirlo**

Corrige el archivo que indica [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH), o el `config.yaml` del
repositorio usado para la configuración. Cuando faltan archivos, haz que [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) y
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) apunten a una ubicación persistente y con permiso de escritura. Consulta
[config.yaml](config/) para ver la estructura.

---

## La configuración base tiene una sección forms

Tras actualizar desde 6.x el panel está vacío, y el panel de advertencias muestra:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Por qué ocurre**

Desde 7.0.0, cada formulario vive en su propio archivo en la carpeta de formularios. Los formularios que siguen listados en `config.yaml` se
ignoran.

**Cómo corregirlo**

Mueve cada formulario a su propio archivo en [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Consulta
[Actualizar a la v7](upgrade-7.html).

---

## Falta un formulario en el panel

Existe un archivo de formulario, pero un usuario no ve el formulario en el panel.

**Por qué ocurre**

Un usuario ve un formulario solo cuando uno de los `roles` del formulario es uno de sus roles; los administradores ven todos los formularios. Todos los usuarios tienen
el rol `default`, así que un formulario con `roles: [default]` es visible para todos. Los roles de un usuario vienen de los grupos y usuarios
listados bajo `roles` en `config.yaml`. Un formulario sin `categories` aparece bajo **Default**, así que falta en las
demás categorías, aunque sigue listado bajo **Todos los formularios**. Por último, un formulario que no supera la validación se omite. El
panel muestra entonces un botón **Esta configuración tiene** advertencias o errores, que abre mensajes como:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Cómo corregirlo**

Abre el panel de advertencias y corrige lo que indica. Revisa los roles del usuario en
[Permisos](profile/permissions.html), en el perfil, y los `roles` y `categories` del formulario. Consulta
[Roles](config/roles.html) y [Categorías](config/categories.html). Cuando dos archivos definen el mismo nombre de formulario,
gana el primero que se carga.

---

## Could not save the forms

Guardar en el diseñador falla con:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Por qué ocurre**

El diseñador valida cada formulario frente al esquema antes de escribir nada. Cada línea de `<messages>` nombra el
formulario y el campo que incumplen una regla. Las opciones eliminadas en 7.0.0 tienen un mensaje propio, por ejemplo
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Cómo corregirlo**

Corrige los campos que nombran los mensajes. Para las opciones que eliminó 7.0.0, sigue [Actualizar a la v7](upgrade-7.html).
Para validar los archivos de formularios antes de que lleguen a AnsibleForms, consulta
[Validación en VS Code de los archivos de formularios](faq.html#vs-code-validation-for-form-files) en las preguntas frecuentes.

---

## The editor is read-only

El diseñador muestra **Bloqueado** con el nombre de otro usuario, y guardar falla con:

```
The editor is read-only
```

**Por qué ocurre**

Solo una persona a la vez puede editar los formularios. El bloqueo se toma cuando alguien inicia el diseñador, y se mantiene hasta que
lo detiene, incluso si cerró el navegador sin detenerlo. La API rechaza un guardado de cualquier otra persona con
`Designer is locked by <username>`.

**Cómo corregirlo**

Pide a `<username>` que detenga el diseñador. Si no es posible, usa **Force Unlock** en el diseñador. Quien tenga el
bloqueo pierde los cambios que no haya guardado.

---

## Abuse attempt of eval function

Un campo de expresión muestra un error, y el registro tiene una línea como:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Por qué ocurre**

Las expresiones del lado del servidor se comprueban antes de ejecutarse. Solo pueden llamar a funciones `fn.` y `fnc.`; se rechazan varias sentencias,
varias líneas, plantillas literales, `process.env` y palabras como `require` o `constructor`. El mensaje
dice qué regla se incumplió. Con [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) en
`off`, todas las expresiones de servidor fallan con
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Cómo corregirlo**

Reescribe la expresión como una sola llamada `fn.` o una operación simple, o ejecútala en el navegador con `runLocal: true`. Consulta
[Expresiones](expressions/) y [Expresiones locales](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Un campo que llama a una API REST se queda vacío, y el registro muestra:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Por qué ocurre**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) está definido, y el host de la URL no está en él.
Un host que coincide con [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) se rechaza con
`blocked by REST_DENIED_HOSTS entry "<entry>"`, y un host que no se resuelve con `cannot resolve <host>`.

**Cómo corregirlo**

Añade el nombre del host, o un CIDR que cubra sus direcciones, a `REST_ALLOWED_HOSTS`, o quita de
`REST_DENIED_HOSTS` la entrada que lo bloquea. Consulta [Restringir los destinos de los helpers REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

La página de inicio de sesión rechaza un nombre de usuario y una contraseña con:

```
Authentication failed: Invalid credentials
```

**Por qué ocurre**

La página de inicio de sesión da la misma respuesta para cualquier fallo, para no revelar si un usuario existe. AnsibleForms
prueba primero los usuarios locales y después LDAP: con varios directorios, un nombre de usuario se busca en el orden que tienen en **Acceso > LDAP**,
salvo que nombre un directorio (`corp\jane`) o uno de sus dominios de inicio de sesión (`jane@corp.example`). El motivo real va al registro. Los fallos
de LDAP se registran como `Error connecting to ldap: <reason>`, con motivos como `Wrong binding credentials` o
`Unable to verify the certificate`; los códigos de Active Directory se traducen a `Wrong password`, `User not found`,
`Account disabled`, `Account locked` o `Password expired`.

**Cómo corregirlo**

Lee el motivo en el registro. Para ver el motivo completo de cada inicio de sesión fallido, pon
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) a `debug`, que registra `Ldap authentication failed: <reason>`.
Si se ha perdido la contraseña del administrador local, consulta [Recuperar una contraseña de administrador perdida](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Probar un directorio LDAP en **Acceso > LDAP** falla con uno de estos:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Por qué ocurre**

El usuario de bind o su contraseña son incorrectos, no se puede llegar al servidor o al puerto, o, con TLS, el certificado del servidor no se puede
verificar con el paquete CA. Desde 7.3.0 están en la credencial ldap del directorio, en **Conexiones > Credenciales**. Un usuario de prueba que no existe
sigue contando como prueba correcta, porque la conexión y el bind funcionaron.

**Cómo corregirlo**

Abre la credencial que nombra el directorio (el directorio por defecto es `main`) en **Conexiones > Credenciales**, y corrige el DN de bind
y su contraseña, los servidores y el puerto (normalmente 389, o 636 para LDAPS). Para problemas de TLS, pega el paquete CA que firmó el
certificado del servidor LDAP; omitir la comprobación del certificado no es para producción. Consulta [LDAP](authentication/ldap.html).

---

## Falla la autenticación de Azure AD u OIDC

Un inicio de sesión único vuelve a la página de inicio de sesión con:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Por qué ocurre**

El proveedor de identidad devolvió al usuario, pero AnsibleForms no pudo completar el inicio de sesión. Motivos habituales son
`azuread login is not enabled` u `oidc login is not enabled` (el proveedor está desactivado), y `jwt expired`, porque
el traspaso desde el proveedor solo es válido durante 5 minutos. Un error durante la llamada de retorno del proveedor se muestra
también en la página de inicio de sesión, y se registra.

**Cómo corregirlo**

Activa el proveedor en **Acceso > SSO**, y registra la URL de retorno en el proveedor de identidad exactamente como
la usa AnsibleForms: `https://<your host>/api/v2/auth/entraid/callback` para Entra ID (desde 7.3.0; `azureadoauth2` sigue funcionando), o
`https://<your host>/api/v2/auth/oidc/callback` para OIDC. Una URL de retorno con `/api/v1/`, de antes de la 7 o de antes de
6.1.5, debe actualizarse: si no, la página de inicio de sesión se recarga sin iniciar sesión y sin error. Vuelve a intentar el inicio de sesión tras
un traspaso caducado.

---

## Not authenticated, login is not enabled for this user

Un usuario con una contraseña válida no puede iniciar sesión, y recibe:

```
Not authenticated, login is not enabled for this user.
```

**Por qué ocurre**

Uno de los roles del usuario pone la opción de rol `allowLogin` a `false`. El registro dice
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Cómo corregirlo**

Quita `allowLogin: false` del rol, o saca al usuario de ese rol. Consulta [Roles](config/roles.html).

---

## Sesión cerrada tras un reinicio o al cabo de un día

Todos los usuarios vuelven a la página de inicio de sesión después de que AnsibleForms se reinicie, o tras un día de uso.

**Por qué ocurre**

Cuando [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) no está definido, cada arranque genera una
clave de firma nueva, y registra
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Los tokens de antes del
reinicio dejan entonces de aceptarse. Aparte de eso, una sesión termina cuando caduca su token de actualización
(`Refresh token is expired`), tras
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), 24 horas por defecto.

**Cómo corregirlo**

Define `ACCESS_TOKEN_SECRET` con un valor fijo y secreto. Aumenta `ACCESS_TOKEN_REFRESH_EXPIRATION` si un día es poco. Para
un acceso a la API de larga duración, usa un [token de API](profile/api-token.html).

---

## Formularios y trabajos vacíos tras un inicio de sesión único (HTTP 431)

Un usuario inicia sesión con Entra ID u OIDC sin error, pero las páginas de formularios y de trabajos se quedan vacías. La pestaña de red
del navegador muestra las llamadas a la API respondidas con:

```
431 Request Header Fields Too Large
```

El registro del servidor no muestra nada de estas llamadas, y el mismo usuario puede funcionar bien con una cuenta LDAP o local.

**Por qué ocurre**

Antes de 7.1.0, el token de inicio de sesión llevaba todos los grupos del usuario, y los grupos de Entra ID estaban dos veces, por id de objeto
y por nombre. El navegador envía ese token en la cabecera `Authorization` de cada petición, así que un usuario en unos cien
grupos o más acaba con una cabecera de bastante más de 16 KB. Node.js rechaza las cabeceras de petición de más de 16 KB con un 431,
antes de que la petición llegue a AnsibleForms, y por eso no se registra nada. Un proxy inverso delante puede rechazar la
petición incluso antes: Nginx permite 8 KB por campo de cabecera por defecto
(`large_client_header_buffers 4 8k`), y responde con 400 en su lugar.

**Cómo corregirlo**

Actualiza a 7.1.0 o posterior: el token de inicio de sesión ya no lleva los grupos, así que su tamaño ya no depende de en cuántos
grupos esté un usuario, y la interfaz lo indica cuando una petición se rechaza con 431 en lugar de mostrar páginas vacías.
Hasta que puedas actualizar, puedes:

* definir un **Filtro de grupo** en el proveedor, en **Acceso > SSO**, una expresión regular que conserve solo los grupos que usan tus
  roles, consulta [Entra ID](authentication/entra-id.html) u [OIDC](authentication/oidc.html); el usuario vuelve a iniciar sesión
  para obtener un token más pequeño
* o aumentar el límite de Node.js con la variable de entorno `NODE_OPTIONS=--max-http-header-size=65536`, y
  reiniciar AnsibleForms

Desde 7.1.0, [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) define el mismo límite, 16384
bytes por defecto y leído al arrancar, para otras cabeceras grandes, como cookies grandes que pone una pasarela de inicio de sesión único
delante. Aumenta también los límites de cabecera del proxy, consulta [Tamaño de las cabeceras de petición](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Un trabajo de Ansible termina como fallido, y la última línea de su salida es:

```
[ERROR]: Playbook failed with status (<code>)
```

**Por qué ocurre**

`ansible-playbook` salió con un código distinto de cero. Las líneas de encima contienen el error propio de Ansible: no se encontró
el playbook, un host no era accesible, una tarea falló o el inventario es incorrecto. El playbook se busca en el repositorio
con **¿Usar para playbooks?** activado, o en [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); la línea de registro
`Running from directory : <path>` muestra la carpeta que se usó.

**Cómo corregirlo**

Lee la salida del trabajo por encima de la última línea. Cuando no se encuentra el playbook, compara el `playbook` del formulario con la
carpeta de `Running from directory`. Consulta [Formularios de Ansible](forms/ansible.html).

---

## Playbook was aborted by the main process

Un trabajo de Ansible termina como fallido con:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Por qué ocurre**

El proceso `ansible-playbook` del RTE terminó por una señal, y nadie abortó el trabajo. Desde 7.0.0 el tamaño de la
salida ya no provoca esto: pasado [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (50 MB por flujo
por defecto) el resto de la salida no se guarda, el trabajo muestra
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
y el playbook se ejecuta hasta el final. La causa habitual ahora es la memoria: el contenedor del RTE llegó a su límite de memoria y el
kernel mató el playbook, por ejemplo con muchos forks o facts grandes.

**Cómo corregirlo**

Revisa la memoria del contenedor del RTE mientras se ejecuta el playbook (`docker stats`, `kubectl top pod`) y aumenta su límite, o reduce
el uso de memoria del playbook (menos `forks`, sin recoger facts innecesarios). Cuando solo ves la advertencia de `PROCESS_MAX_BUFFER` y
necesitas la salida completa, aumenta `PROCESS_MAX_BUFFER` en el entorno del contenedor del RTE; lo lee el RTE, no la app.
---

## Failed to launch awx template

Un trabajo en AWX termina como fallido, con una salida que empieza por:

```
failed to launch awx template <name>
```

**Por qué ocurre**

La línea siguiente da el motivo. `Request failed with status code 401` significa que se rechaza el token o el usuario y la contraseña de la
credencial del runner AWX. `could not find job template <name>` significa que ninguna plantilla de job ni plantilla de workflow
tiene exactamente ese nombre, o que el usuario de la conexión no puede verla. Un error de certificado, como
`unable to verify the first certificate`, significa que el certificado de AWX no es de confianza.

**Cómo corregirlo**

Usa **Probar conexión** en el runner (**Conexiones > Runners**), que responde `Runner connection is OK` cuando funciona. Desde
7.3.0 el token o el usuario y la contraseña, la dirección y el **Paquete CA** están en la credencial del runner, en
**Conexiones > Credenciales**: renueva allí el token o la contraseña, y para errores de certificado pega la CA en su **Paquete CA**.
Revisa el nombre y los permisos de la plantilla. Introduce la dirección sin `/api/v2`: AnsibleForms añade
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX) por su cuenta.
Consulta [Formularios de AWX](forms/awx.html).

---

## Un trabajo muestra el estado abandoned

Un trabajo que se estaba ejecutando aparece ahora marcado como `abandoned`, y el registro de un nodo o de un RTE muestra uno de estos:

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

Un RTE en modo database, obsoleto, registra los suyos:

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Por qué ocurre**

Un trabajo pertenece al contenedor que lo ejecuta o lo sigue: un playbook a su RTE, cualquier otro trabajo (un trabajo en AWX, los pasos de un formulario
multistep) al nodo de la app que lo inició. Cuando ese contenedor se reinicia, termina sus propios trabajos sin acabar. Cuando desaparece, un pod
sustituido por ejemplo, el worker termina sus trabajos una vez que lleva dos minutos sin responder. Un RTE en un modo de socket que vuelve sin
un trabajo que estaba ejecutando, un contenedor nuevo sin su spool por ejemplo, hace que ese trabajo termine como abandonado. Un RTE que se detiene espera primero
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) a sus playbooks. Cada hora, los trabajos que llevan ejecutándose más
de un día también se marcan como abandonados.

Desde 7.3.0 un trabajo en AWX, AAP o Ascender continúa en su runner: justo después de que un reinicio lo abandone, un nodo vuelve a seguirlo,
si empezó en las últimas 24 horas, y termina con lo que realmente ocurrió allí. El registro dice entonces `Following <n> abandoned job(s) again on their runner`.

**Cómo corregirlo**

Relanza un trabajo de playbook. Reinicia o actualiza los RTE y los nodos de la app cuando no haya ningún trabajo en ejecución, y da a un RTE que se detiene tiempo
suficiente (consulta [Escalado](rte/run.html)). Comprueba si el playbook terminó realmente en los hosts gestionados antes de
relanzarlo, porque puede haberse ejecutado en parte.

---

## Un RTE no se conecta

**Probar conexión** en un runner RTE (**Conexiones > Runners**) falla con:

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Por qué ocurre**

Un RTE en un modo de socket habla con la app por un único WebSocket: en outbound llama él a la app, en inbound la app lo llama a él (consulta
[Modos](rte/modes.html)). Los registros de la app y del RTE dicen por qué el socket no está abierto:

| Mensaje | Dónde | Qué significa |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | El RTE (inbound) | El token de la credencial RTE del runner no es el `RTE_TOKEN` del RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | La app (inbound) | Lo mismo, visto desde la app |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | La app, y el RTE rechazado (`401`) | El RTE se identifica con un token distinto del que la app guarda para su runner |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | El RTE (outbound) | Pidió unirse y espera una aprobación |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | El RTE (inbound, con `APP_URL`) | Lo mismo, para un RTE inbound |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | La app, y el RTE rechazado (`409`) | El config seed declara el runner sin `rte_mode`, por tanto en modo database, y el seed decide su modo. Un RTE inbound recibe `rte_mode: inbound` y `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | El RTE | Un RTE inbound que se registra solo necesita la dirección en la que la app lo llama |
| `Runner '<name>': dialing <address>: <reason>` | La app, en nivel `debug` | La app no puede abrir el socket, por ejemplo porque el certificado del RTE no es el fijado para su runner |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | El RTE | Se ejecuta en modo database, y no abre ningún socket |

**Cómo corregirlo**

* **Un token rechazado** : da al RTE el token de la credencial RTE de su runner (**Conexiones > Credenciales**), o al revés
* **Pendiente de aprobación** : apruébalo en **Conexiones > Runners**, tras comprobar que la huella que se muestra allí es la de su
  registro (consulta [Aprobar un RTE](runners/registration.html#approving-an-rte))
* **Gestionado por el config seed en modo database** : define `rte_mode` en el runner en el seed, con una credencial RTE (para inbound, su
  dirección), y luego reinicia el RTE
* **Inbound sin `RTE_URL`** : define `RTE_URL` con la dirección en la que la app llega al RTE, o deja fuera `APP_URL` y declara el
  runner en el seed o en **Conexiones > Runners**
* **Un certificado que no es el fijado** : un RTE inbound por HTTPS envía su certificado al registrarse, y la app lo llama
  solo con ese. Tras un certificado nuevo, el RTE lo vuelve a enviar al registrarse; cuando el paquete CA de la credencial se definió
  a mano, la app lo conserva y registra
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **La advertencia [DEPRECATED]** : define `RTE_MODE` en el RTE, quita `DB_*` de su entorno, y pon su runner en ese modo (consulta
  [Modos](rte/modes.html))

---

## The form data is not valid

Con la validación del lanzamiento en `enforce`, un lanzamiento se rechaza con `422` y:

```
The form data is not valid
```

**Por qué ocurre**

El servidor comprobó los valores de los campos frente a las reglas del formulario y encontró campos que faltan o no son válidos; la respuesta los lista
bajo `details`. Un lanzamiento sin `rawFormData` también se rechaza. Un formulario que aún no se puede comprobar, como un wizard,
se rechaza con `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**Cómo corregirlo**

Corrige los campos que nombran los detalles, o las reglas del formulario si son demasiado estrictas. Ejecuta primero en `log`: registra
`Launch validation would refuse form '<name>' ...` sin rechazar nada. Consulta
[Qué hace enforce](launch-validation/log-and-enforce.html#what-enforce-does) y
[Despliegue](launch-validation/rolling-it-out.html).

---

## Falla el clonado o el pull de un repositorio

Un repositorio muestra un estado fallido, y su salida contiene el error de git, o el registro muestra
`Background clone of '<name>' failed : <reason>`.

**Por qué ocurre**

Git no pudo llegar al remoto o autenticarse en él. Para URL SSH (`git@host:path`), el remoto debe aceptar la clave
pública de AnsibleForms; para HTTPS, el nombre de usuario y el token deben ser válidos. Un pull también se rechaza cuando el árbol de trabajo tiene
cambios, con
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Cómo corregirlo**

Para SSH, copia la clave pública de la pestaña **Clave** de **Conexiones > SSH** y añádela como deploy key, o a un usuario con
acceso al repositorio. AnsibleForms añade el host remoto a los hosts conocidos al clonar; para otros hosts, usa la
pestaña **Hosts conocidos** de la misma página. Para
HTTPS, renueva el token. Consulta [Repositorios git](gui/designer-and-git.html#git-repositories) y
[Acerca de los repositorios](faq.html#about-repositories).

---

## El repositorio de formularios aún no está clonado

Guardar formularios en el diseñador falla con:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Por qué ocurre**

Un repositorio con **¿Usar para formularios?** activado aún no tiene árbol de trabajo, porque el clonado no se ha ejecutado o ha fallado.

**Cómo corregirlo**

Clona el repositorio desde la configuración de repositorios. Si el clonado falla, consulta
[Falla el clonado o el pull de un repositorio](#a-repository-clone-or-pull-failed).

---

## Falla una copia de seguridad

Una copia de seguridad falla, y no se añade nada a la lista de copias de seguridad. El motivo es uno de estos:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Por qué ocurre**

El comando de volcado, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), no está instalado, no pudo
conectarse o produjo un archivo vacío. Una base de datos grande también puede tardar más que
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), una hora por defecto.
Una copia de seguridad fallida no deja ninguna carpeta; el registro dice `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Cómo corregirlo**

Instala las herramientas cliente de MySQL o MariaDB, o define `MYSQLDUMP_COMMAND` (y `MYSQL_COMMAND` para las restauraciones) con un comando
que funcione en este host y con la versión de tu servidor. Aumenta `BACKUP_COMMAND_TIMEOUT_SECONDS` para una base de datos grande.
Consulta [Copias de seguridad](gui/administration.html#backups).
