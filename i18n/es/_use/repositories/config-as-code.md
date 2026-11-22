---
layout: default
title: Configuración en git
parent: Repositorios git
nav_order: 5
translated_from: 80e30306a069294520da314840328f669e2a2019
---

# Configuración en git
{: .no_toc }

Cada ajuste guardado en un repositorio git, leído y escrito en ambos sentidos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores que quieren los ajustes, los usuarios y las conexiones de AnsibleForms revisados y versionados en git, desde 7.8.0.

---

## Los tipos de uso

El paso **Uso** de un repositorio, en su asistente y en la pestaña **Uso** de su página, indica qué toma la aplicación de él.

Los tipos se agrupan bajo seis encabezados, cada uno con el número de tipos que contiene, por ejemplo **Diseñador (6)**. Cada tipo tiene
su propia casilla y una línea corta que dice qué contiene el repositorio para él; la casilla de un encabezado marca o desmarca todos los
tipos de ese encabezado que se pueden marcar.

| Encabezado | Tipos de uso (indicador) |
|---|---|
| **Diseñador** | **Categorías** (`use_for_categories`), **Constantes** (`use_for_constants`), **Formularios** (`use_for_forms`), **Inventarios** (`use_for_inventories`), **Playbooks** (`use_for_playbooks`), **Workflows** (`use_for_workflows`) |
| **Trabajos** | **Programaciones** (`use_for_schedules`) |
| **Sistema** | **General** (`use_for_general`) |
| **Apariencia** | **Valores predeterminados** (`use_for_defaults`), **Logo** (`use_for_logo`), **Icono** (`use_for_icon`), **Nombre** (`use_for_name`), **Enlaces** (`use_for_links`), **Etiquetas** (`use_for_labels`), **Anuncios** (`use_for_announcements`) |
| **Acceso** | **Aviso legal** (`use_for_disclaimer`), **Usuarios** (`use_for_users`), **Grupos** (`use_for_groups`), **Roles** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Conexiones** | **Repositorios** (`use_for_repositories`), **Credenciales** (`use_for_credentials`), **Almacenes de secretos** (`use_for_secret_stores`), **Bases de datos** (`use_for_databases`), **Runners** (`use_for_runners`), **SSH** (`use_for_ssh`), **Notificaciones** (`use_for_notifications`), **Asistente de chat** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Formularios**, **Inventarios**, **Playbooks** y **Workflows** pueden marcarse en varios repositorios. Un formulario ejecuta los
playbooks del primer repositorio de **Playbooks**, salvo que nombre el suyo con `playbookRepository`. Cada uno de los demás tipos pertenece a un repositorio como
máximo, y la API y el config seed rechazan un segundo. Un tipo que tiene otro repositorio se muestra marcado en gris y desactivado, con un
tooltip que nombra ese repositorio: `Ya lo gestiona el repositorio "platform"`.

Activar o desactivar un tipo de uso es un cambio solo para administradores, como lo son la **Uri** y la **Rama** (consulta
[Quién puede cambiar un repositorio](adding.html#who-may-change-a-repository)).

---

## Dónde los guarda un repositorio

Un repositorio contiene un tipo en cualquier archivo YAML, con cualquier nombre y en cualquier carpeta: la clave de nivel superior del archivo dice qué tipo contiene.

Esa clave es siempre `controller_` y la clave del tipo: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
Se examinan todos los archivos `.yaml` o `.yml` del repositorio, a cualquier profundidad, salvo los archivos y carpetas ocultos. Un archivo
puede contener varios tipos, y un tipo puede repartirse en muchos archivos.

| Clave | Contiene |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | un mapa, para lo que la aplicación tiene uno solo; lo da un archivo como máximo |
| `controller_users:` | una lista de usuarios, cada uno identificado por su `type` (local si se omite) y su `username` |
| `controller_disclaimer:` | una lista de versiones, cada una identificada por su `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | los roles, las categorías y las constantes, en su formato habitual |
| cualquier otra clave `controller_` | una lista de entradas, cada una identificada por su `name` |

Un objeto se identifica por su nombre dentro de su tipo, nunca por su archivo: una entrada movida a otro archivo conserva su objeto. Una
clave simple (`credentials:`, el `roles:` de un archivo de requisitos de Galaxy, el `labels:` de un archivo de variables) no es de ningún
tipo, y la aplicación nunca la lee ni la escribe. Un formulario nunca es el archivo de un tipo, y una clave de un tipo para el que no se usa
el repositorio se deja tal cual, con una indicación en la salida del pull.

### Roles, categorías y constantes

Estos tres mantienen el formato de `config.yaml`, ahora cada uno bajo su propia clave, en un tipo de uso propio (un repositorio cada uno).

Cada uno se lee del archivo de su repositorio que da su clave en el nivel superior, con cualquier nombre y en cualquier carpeta; un archivo
puede dar los tres. Cuando ningún archivo la da, aún se lee el `config.yaml` del repositorio, con sus claves simples `roles:`, `categories:`
y `constants:`: esto está obsoleto desde 7.8.0 y ya no se lee en 8.0, y el log del servidor, la salida del pull y la página del
repositorio lo indican. Mueve cada clave a un archivo propio, por ejemplo `roles.yaml` con `controller_roles:`.

Una clave que no contiene ningún repositorio viene de la configuración base, como antes: su copia en la base de datos, o el archivo de
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). El interruptor **¿Usar para configuración?** de antes desaparece: una
instancia actualizada da **Roles**, **Categorías** y **Constantes** al repositorio que lo tenía. El config seed, las entradas
`controller_repositories:` de un repositorio y la API aún aceptan `use_for_config` como alias obsoleto de los tres, con un aviso.

---

## En ambos sentidos: git y la aplicación

Un repositorio usado para un tipo se mantiene sincronizado con la aplicación en ambos sentidos, y la base de datos de la aplicación sigue siendo lo que se ejecuta.

| Sentido | Qué ocurre |
|---|---|
| De git a la aplicación | Tras cada pull, clone o reset del repositorio, y al iniciar el servidor, se leen sus archivos: un nombre nuevo crea un objeto, una entrada cambiada lo cambia, una entrada eliminada lo elimina |
| De la aplicación a git | Un guardado en la aplicación se escribe de vuelta en el archivo de la entrada: solo los campos que cambió, conservando los comentarios del archivo, las demás claves y las demás entradas. Un objeto nuevo va al final del primer archivo que da la clave del tipo, si no a `<key>.yaml` en la raíz (`credentials.yaml`), que se crea; un borrado elimina su entrada. Queda a la espera del **Push** del repositorio |

Una entrada no válida se rechaza sola, con su ubicación y el motivo, y el objeto de su nombre se queda como estaba. Una entrada que nombra un
objeto que aún no existe (un runner y su credencial) espera, y se vuelve a leer en el siguiente pull de ese tipo. Un cambio de nombre en git
se sigue cuando un nombre sale de un archivo y aparece un nombre nuevo en él, sin más cambios.

### Activar o desactivar un uso

Guardar un repositorio con un tipo activado o desactivado pregunta primero qué hacer, y muestra lo que hará el cambio.

| Cambio | Pregunta | Qué hace |
|---|---|---|
| Activar | **Activar Credenciales**: `¿Usar platform para Credenciales?` | Se hace pull del repositorio y se leen sus entradas; git gana en un nombre que tienen ambos; los demás objetos de la aplicación se escriben en el repositorio, a la espera del **Push**, sin sus secretos |
| Desactivar | **Desactivar Credenciales**: `¿Dejar de usar platform para Credenciales?` | Se hace pull del repositorio una vez más y luego se desvinculan sus objetos: se quedan en la aplicación tal como están, y los archivos de git no se tocan |
| Varios | **Cambiar el uso**: `¿Cambiar para qué se usa platform?` | Una sola pregunta, con una sección por tipo, confirmada con **Guardar el uso** |

La pregunta también lista lo que se queda en la aplicación: los objetos del config seed, los runners que un RTE registró por sí mismo y los
que esperan aprobación. Después, un mensaje dice qué tomó cada tipo, por ejemplo
`Credenciales: 2 leídos de sus archivos, 3 escritos en el repositorio (a la espera del Push), 1 sustituidos por git, 0 conservados en esta aplicación.`

### Qué dice la salida del pull

El **Mostrar salida del último pull** del repositorio contiene una línea por tipo después de la propia salida de git.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Un objeto guardado en un repositorio muestra **Repositorio: platform** en su página (el nombre de su repositorio), con el archivo de su
entrada en el tooltip. Guardarlo escribe ese archivo, y el **Push** del repositorio lo envía a git.

---

## Secretos

Git nunca contiene un secreto en claro: un campo secreto de una entrada es solo una referencia `${ENV}`, resuelta desde el entorno.

Las contraseñas, los tokens, los client secrets y las claves se escriben como `${SEED_RTE_TOKEN}`, igual que en el [config seed](../seed/).
Una entrada con un secreto en claro, o que nombra una variable no definida, se rechaza y se nombra en la salida del pull; lo mismo ocurre con
una variable del propio servidor (`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` ...). Un secreto omitido en una entrada conserva el
de la base de datos de la aplicación, y la aplicación escribe sus propios objetos en git sin sus secretos.

Un secreto escrito en la aplicación para un objeto cuya entrada lo da como referencia `${ENV}` se rechaza: cambia la variable, o la entrada en git.

---

## El diseñador y estos archivos

El diseñador se mantiene fuera de los archivos de los tipos de uso, así que editar un formulario nunca cambia un ajuste.

Nunca lista, lee, escribe ni elimina un archivo que da la clave de un tipo que contiene su repositorio, ni las imágenes que nombra ese
archivo. También se niega a escribir un archivo cuyo contenido daría la clave de un tipo, y la carga de formularios nunca lee ese archivo como formulario.

---

## Cada tipo, con un ejemplo

Las entradas de cada tipo están en el formato del config seed, así que un elemento del seed y una entrada de repositorio son intercambiables.

Los nombres de archivo de abajo son ejemplos: cualquier nombre y cualquier carpeta servirían.

### Categorías, constantes y roles

Las categorías y los roles son listas, las constantes un mapa, cada uno bajo su propia clave.

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

Cada rol se comprueba por separado: uno no válido se rechaza solo, y los demás se sirven. Los roles pueden repartirse en varios archivos,
y se sirven en el orden de sus archivos. Consulta [Roles](../config/roles.html).

### Programaciones

Las programaciones son una lista `controller_schedules:`, cada entrada nombra el formulario que ejecuta y se temporiza con exactamente uno
de `cron`, `rrule` o `one_time_run`.

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

Los trabajos "Ejecutar más tarde" que planifican los usuarios se quedan en la aplicación. Consulta [Programaciones](../jobs/schedules.html) para los horarios y las preguntas.

### General

Los ajustes de **General** son un mapa, por sus nombres de variable de entorno en minúsculas.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Solo se toman las variables que cambia la página General; una clave en mayúsculas, o una variable definida en el entorno real, se rechaza.
Una variable cuyo nombre termina en `_PASSWORD`, `_SECRET` o `_TOKEN` es solo una referencia `${ENV}`.

### Valores predeterminados, logo, icono, nombre y enlaces

Las páginas de Apariencia son un mapa cada una, con lo que guarda la página.

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

El logo y el icono son imágenes del repositorio, indicadas respecto al archivo que las nombra. Un campo que declara el config seed sigue
siendo del seed.

### Etiquetas y anuncios

Las etiquetas y los anuncios son listas de entradas, cada una identificada por su nombre.

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

Un anuncio cuyo final ya pasó no se importa, y se indica en una línea `Not imported` de la salida del pull.

### Aviso legal

El aviso legal es una lista de versiones, cada una identificada por su `version`, con una activada como máximo.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Un texto cambiado desde git corrige esa versión; `ask_again: true` vuelve a preguntar a todos los que la aceptaron. Quién aceptó qué nunca está en git.

### Usuarios y grupos

La entrada de un grupo lista sus miembros locales; la entrada de un usuario no dice nada de sus grupos.

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

La `password` de un usuario local es solo una referencia `${ENV}`, cifrada con hash al leerla. Un usuario de un directorio (`ldap`,
`entraid`, `oidc`) solo da su `description` y `blocked`. El admin integrado nunca se lee de git ni se escribe en él.

### LDAP y SSO

Los directorios LDAP y los proveedores SSO son listas, y cada uno nombra la credencial con la que inicia sesión.

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

La entrada llamada `main` es el directorio principal, que nunca se renombra ni se elimina. `position` mantiene el orden de búsqueda.

### Repositorios

Un repositorio puede contener los demás repositorios, en el formato de los elementos `repositories:` del config seed.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

El repositorio que los contiene nunca está en sus propios archivos, una entrada nunca define `use_for_repositories`, y un usuario o un
token en la `uri` se rechaza: nombra una credencial en su lugar. Una entrada eliminada borra su repositorio, salvo que tenga cambios aún sin enviar.

### Credenciales, almacenes de secretos y bases de datos

Primero se leen las credenciales, y después todo lo que nombra alguna de ellas.

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

Eliminar la entrada de una credencial mientras algo aún la usa se rechaza, y se indica en la salida del pull.

### Runners

Un runner nombra su credencial, del tipo del runner, y espera mientras falta.

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

Un runner que un RTE registró por sí mismo, o uno que espera aprobación, se queda en la aplicación.

### SSH

La clave SSH de la aplicación y los hosts en los que confía son un mapa, leído justo después de los repositorios, antes de clonarlos.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` es solo una referencia `${ENV}`, nunca se escribe en git: si se omite, la aplicación conserva la suya. `known_hosts`
contiene una línea de known_hosts por servidor, y una lista vacía los borra.

### Notificaciones y syslog

Los canales de notificación y los servidores syslog son listas de entradas.

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### Asistente de chat y MCP

El asistente de chat y los ajustes de MCP son un mapa cada uno.

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` y las claves de MCP son nombres de variable de entorno en minúsculas. Una variable definida en el entorno real nunca se
escribe, y un mapa que la da se rechaza. `api_key` es solo una referencia `${ENV}`, o se omite.
